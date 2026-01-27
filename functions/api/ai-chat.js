import Anthropic from '@anthropic-ai/sdk';
import { requireAuth, isPremiumUser } from './_auth.js';
import { checkRateLimit } from '../utils/rateLimit.js';

/**
 * Cloudflare Pages Function for AI Chat API
 * Proxies requests to Anthropic Claude API with streaming support
 */

/**
 * Get CORS headers with dynamic origin checking
 */
function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = [
    env.PRODUCTION_URL,           // e.g., 'https://netmap.yourdomain.com'
    'http://localhost:5173',      // Vite dev server
    'http://localhost:8787',      // Worker dev server
    'http://127.0.0.1:5173'       // Alternative localhost
  ].filter(Boolean);

  const allowOrigin = allowedOrigins.includes(origin)
    ? origin
    : (allowedOrigins[0] || 'http://localhost:5173');

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Tool definitions for AI capabilities
 */
const TOOLS = [
  {
    name: 'suggest_device_addition',
    description: 'Suggest adding a detected network device to the topology. Use this when you identify devices from logs, configurations, or descriptions that are not yet in the network.',
    input_schema: {
      type: 'object',
      properties: {
        device: {
          type: 'object',
          description: 'Device properties',
          properties: {
            name: { type: 'string', description: 'Device hostname or name' },
            type: {
              type: 'string',
              enum: ['firewall', 'core', 'switch', 'ap', 'server', 'router', 'wan'],
              description: 'Device type'
            },
            ip: { type: 'string', description: 'IP address' },
            mac: { type: 'string', description: 'MAC address' },
            hardware: {
              type: 'object',
              properties: {
                manufacturer: { type: 'string', description: 'Device manufacturer' },
                model: { type: 'string', description: 'Device model number' },
                firmware: {
                  type: 'object',
                  description: 'Firmware information',
                  properties: {
                    version: { type: 'string', description: 'Firmware/software version' },
                    lastUpdated: { type: 'string', description: 'Date firmware was last updated' },
                    updateAvailable: { type: 'boolean', description: 'Whether an update is available' },
                    updateVersion: { type: 'string', description: 'Available update version' }
                  }
                }
              }
            },
            vlans: {
              type: 'array',
              items: { type: 'number' },
              description: 'VLAN IDs'
            },
            buildingId: { type: 'string', description: 'Building ID if known' },
            floor: { type: 'number', description: 'Floor number if known' },
            notes: { type: 'string', description: 'Additional notes' }
          },
          required: ['name', 'type']
        },
        suggestedPosition: {
          type: 'object',
          description: 'Suggested position on canvas',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
            strategy: {
              type: 'string',
              enum: ['near_connected', 'near_similar_type', 'building_location', 'topology_tier']
            }
          }
        },
        connections: {
          type: 'array',
          description: 'Suggested connections to existing devices',
          items: {
            type: 'object',
            properties: {
              toDeviceName: { type: 'string', description: 'Name of existing device to connect to' },
              fromPort: { type: 'string', description: 'Port on new device' },
              toPort: { type: 'string', description: 'Port on existing device' },
              type: { type: 'string', enum: ['trunk', 'access'], description: 'Connection type' },
              speed: { type: 'string', description: 'Link speed (e.g., "1G", "10G")' },
              vlans: { type: 'array', items: { type: 'number' } },
              cableType: { type: 'string', description: 'Cable type (e.g., "cat6", "fiber")' }
            },
            required: ['toDeviceName']
          }
        },
        reasoning: {
          type: 'string',
          description: 'Explanation of why this device was detected and how properties were determined'
        },
        confidence: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Confidence level in the detection'
        }
      },
      required: ['device', 'reasoning', 'confidence']
    }
  },

  // Connection addition tool
  {
    name: 'suggest_connection_addition',
    description: 'Suggest adding a connection between two existing devices in the network topology',
    input_schema: {
      type: 'object',
      properties: {
        fromDeviceName: {
          type: 'string',
          description: 'Name of the source device (must exist in topology)'
        },
        toDeviceName: {
          type: 'string',
          description: 'Name of the destination device (must exist in topology)'
        },
        fromPort: {
          type: 'string',
          description: 'Port on source device (e.g., "gi0/1", "eth1", "port 24")'
        },
        toPort: {
          type: 'string',
          description: 'Port on destination device'
        },
        connectionType: {
          type: 'string',
          enum: ['trunk', 'access'],
          description: 'Connection type: trunk (carries multiple VLANs) or access (single VLAN)'
        },
        speed: {
          type: 'string',
          description: 'Link speed (e.g., "1G", "10G", "100M")'
        },
        vlans: {
          type: 'array',
          items: { type: 'number' },
          description: 'VLAN IDs this connection carries (empty for untagged)'
        },
        cableType: {
          type: 'string',
          enum: ['copper', 'fiber', 'wireless'],
          description: 'Physical cable type'
        },
        reasoning: {
          type: 'string',
          description: 'Explanation of why this connection should be added'
        },
        confidence: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Confidence level in this suggestion'
        }
      },
      required: ['fromDeviceName', 'toDeviceName', 'fromPort', 'toPort', 'connectionType', 'reasoning']
    }
  },

  // Connection modification tool
  {
    name: 'suggest_connection_modification',
    description: 'Suggest modifying an existing connection between devices',
    input_schema: {
      type: 'object',
      properties: {
        fromDeviceName: {
          type: 'string',
          description: 'Source device name to identify the connection'
        },
        toDeviceName: {
          type: 'string',
          description: 'Destination device name to identify the connection'
        },
        updates: {
          type: 'object',
          properties: {
            speed: { type: 'string' },
            vlans: { type: 'array', items: { type: 'number' } },
            connectionType: { type: 'string', enum: ['trunk', 'access'] },
            status: { type: 'string', enum: ['up', 'down'] }
          },
          description: 'Properties to update on this connection'
        },
        reasoning: {
          type: 'string',
          description: 'Explanation of why these changes should be made'
        }
      },
      required: ['fromDeviceName', 'toDeviceName', 'updates', 'reasoning']
    }
  },

  // Connection removal tool
  {
    name: 'suggest_connection_removal',
    description: 'Suggest removing a connection from the topology',
    input_schema: {
      type: 'object',
      properties: {
        fromDeviceName: {
          type: 'string',
          description: 'Source device name'
        },
        toDeviceName: {
          type: 'string',
          description: 'Destination device name'
        },
        reasoning: {
          type: 'string',
          description: 'Why this connection should be removed (e.g., redundant, incorrect, decommissioned)'
        },
        impact: {
          type: 'string',
          description: 'Description of impact (e.g., "Will not isolate any devices, redundant path exists")'
        }
      },
      required: ['fromDeviceName', 'toDeviceName', 'reasoning', 'impact']
    }
  },

  // VLAN creation tool
  {
    name: 'suggest_vlan_creation',
    description: 'Suggest creating a new VLAN for network segmentation',
    input_schema: {
      type: 'object',
      properties: {
        vlanId: {
          type: 'number',
          description: 'VLAN ID number (1-4094, check for conflicts with existing VLANs)'
        },
        name: {
          type: 'string',
          description: 'Descriptive VLAN name (e.g., "Guest WiFi", "IoT Devices", "Voice")'
        },
        subnet: {
          type: 'string',
          description: 'IP subnet in CIDR notation (e.g., "192.168.10.0/24")'
        },
        gateway: {
          type: 'string',
          description: 'Default gateway IP address'
        },
        description: {
          type: 'string',
          description: 'Purpose and usage of this VLAN'
        },
        deviceNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of devices to assign to this VLAN'
        },
        reasoning: {
          type: 'string',
          description: 'Why this VLAN should be created (security, segmentation, compliance, etc.)'
        },
        confidence: {
          type: 'string',
          enum: ['high', 'medium', 'low']
        }
      },
      required: ['vlanId', 'name', 'reasoning']
    }
  },

  // VLAN assignment tool
  {
    name: 'suggest_vlan_assignment',
    description: 'Suggest assigning devices to existing VLANs',
    input_schema: {
      type: 'object',
      properties: {
        deviceNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of devices to assign to VLAN'
        },
        vlanId: {
          type: 'number',
          description: 'VLAN ID to assign devices to (must exist)'
        },
        reasoning: {
          type: 'string',
          description: 'Why these devices should be on this VLAN'
        }
      },
      required: ['deviceNames', 'vlanId', 'reasoning']
    }
  },

  // Security audit tool
  {
    name: 'report_security_findings',
    description: 'Report security vulnerabilities, misconfigurations, and improvement recommendations found in the network',
    input_schema: {
      type: 'object',
      properties: {
        findings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              severity: {
                type: 'string',
                enum: ['critical', 'high', 'medium', 'low', 'info'],
                description: 'Severity level of the security finding'
              },
              category: {
                type: 'string',
                enum: ['firmware', 'segmentation', 'access_control', 'redundancy', 'configuration', 'compliance'],
                description: 'Category of security issue'
              },
              deviceName: {
                type: 'string',
                description: 'Device name affected by this finding (if applicable)'
              },
              title: {
                type: 'string',
                description: 'Short title of the finding'
              },
              description: {
                type: 'string',
                description: 'Detailed description of the security issue'
              },
              recommendation: {
                type: 'string',
                description: 'Actionable recommendation to fix the issue'
              },
              cvssScore: {
                type: 'number',
                description: 'CVSS score if applicable (0-10)'
              }
            },
            required: ['severity', 'category', 'title', 'description', 'recommendation']
          }
        },
        summary: {
          type: 'string',
          description: 'Overall security posture summary'
        },
        criticalCount: {
          type: 'number',
          description: 'Number of critical findings'
        },
        highCount: {
          type: 'number',
          description: 'Number of high severity findings'
        }
      },
      required: ['findings', 'summary']
    }
  },

  // Meraki import tool
  {
    name: 'request_meraki_import',
    description: 'Request permission to import network topology from Meraki Dashboard API',
    input_schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Explanation of what will be imported and why'
        },
        organizationName: {
          type: 'string',
          description: 'Meraki organization name if mentioned by user'
        },
        estimatedDeviceCount: {
          type: 'number',
          description: 'Estimated number of devices that will be imported'
        }
      },
      required: ['reason']
    }
  }
];

/**
 * Build system prompt with network topology context
 */
function buildSystemPrompt(networkContext) {
  let prompt = `You are an expert network topology assistant integrated into NetMap, a network visualization tool. Your role is to:

1. Help users understand and optimize their network infrastructure
2. Provide analysis of network configurations, device placement, and connectivity
3. Suggest improvements for network performance, security, and reliability
4. Answer questions about networking concepts and best practices
5. Be concise, actionable, and technical when appropriate

Guidelines:
- If network context is provided, reference specific devices, connections, and configurations in your analysis
- Provide specific, actionable recommendations
- Explain complex concepts clearly
- Consider scalability, security, and performance in your suggestions
- If you identify potential issues, explain the risks and solutions

## Device Detection and Parsing

When users paste network configuration outputs, logs, or device listings:

### Step 1: Parse Input Types
- **Simple Tables**: Port/IP/MAC/Model columns (like CSV or markdown tables)
- Cisco IOS/IOS-XE: "show cdp neighbors", "show ip interface brief", "show version"
- Meraki: Device names like "MS350-48FP", "MX85", "MR46"
- CDP/LLDP: Neighbor information with ports and IPs
- Linux/Server: "ip addr", "ifconfig", hostname outputs

For simple tables (Port, IP, MAC, Model format):
- Parse EVERY row as a separate device
- Each row = one device to suggest
- Count the rows first to verify you're processing all devices
- If user says "17 devices" and you count 17 rows, suggest ALL 17

### Step 2: Extract Device Properties
- Name/Hostname: Generate from Model + Port (e.g., "VVX-250-gi1")
- Type: Determine from model:
  - VVX 250/450 = server (VoIP phone)
  - MeetingBar = server (video conferencing)
  - Switches/Routers = switch/router
  - Access Points = ap
- IP Address from table column
- MAC Address from table column
- Port from table column (for connection to specified switch)
- Manufacturer/Model from model column

### Step 3: CRITICAL - Check Against Existing Devices
BEFORE suggesting:
1. Check if device name exists in network context (case-insensitive)
2. Check if IP address exists in network context
3. Check if MAC address exists in network context
4. ONLY suggest devices NOT already in topology

### Step 4: MUST SUGGEST ALL DEVICES IN ONE RESPONSE
**CRITICAL REQUIREMENT:**
- When you detect multiple NEW devices (not in topology), you MUST call
  suggest_device_addition for EVERY SINGLE ONE in the SAME response
- If you detect 17 new devices, call the tool 17 times
- If you detect 11 new devices, call the tool 11 times
- DO NOT skip devices, DO NOT batch them across multiple responses
- The user will approve all suggestions at once

Example: User pastes 17 devices → You verify 17 are new → Call tool 17 times in same response

DO NOT re-suggest devices that appear in the network context, even if they
were recently added from your previous suggestions.

### Step 5: Detect Connections
From CDP/LLDP neighbors:
- "Gi1/0/24 connected to KSP-Core-SW Gi1/0/1"
- Extract: local port, remote device name, remote port

For simple tables with Port column:
- Port column (e.g., "gi1", "gi10") = port on the specified switch
- When user says "connected to IDF2" or similar, that's the switch name
- Create connection: new device → specified switch port
- Connection details: fromPort='', toPort=<port from table>, type='access', speed='1G'

### Step 6: Call suggest_device_addition Tool
When you detect a NEW device:
1. Call tool with complete device properties
2. Include connection to the switch if port specified
3. Provide conversational message explaining detection
4. Include reasoning and confidence level
5. CALL THE TOOL FOR EVERY DEVICE - no exceptions

### Step 7: Smart Position Calculation
Suggest position based on:
- near_connected: If connected to existing device (prefer this when connections exist)
- near_similar_type: Group similar types together
- building_location: Use building bounds if location known
- topology_tier: Core in center, distribution mid, access at edges

### FINAL REMINDER - CRITICAL
When processing device lists:
1. Count total devices in user's list
2. Check each against existing network topology
3. Call suggest_device_addition for EVERY new device in ONE response
4. If you say "I'll add 17 devices", you MUST call the tool 17 times
5. The user expects the exact count they mentioned - deliver it

## Network Device Editing Capability

When users request changes to devices, propose edits using JSON format in code blocks.
User MUST approve all changes before they are applied.

Supported Commands:
- Change device properties: name, IP, MAC, status, type, floor, notes
- Update hardware info: manufacturer, model, firmware version
- Modify location: building, floor, room
- Bulk operations: "change all switches on Floor 2"

**JSON Output Format:**

\`\`\`json
{
  "action": "propose_network_change",
  "deviceIds": ["dev-1", "dev-2"],
  "updates": {
    "ip": "10.0.10.25",
    "status": "offline"
  },
  "summary": "Update Access Point 23's IP to 10.0.10.25",
  "reasoning": "User requested IP change",
  "affectedDevices": [
    {
      "id": "dev-123",
      "name": "Access Point 23",
      "changes": {
        "ip": { "old": "10.0.10.20", "new": "10.0.10.25" }
      }
    }
  ]
}
\`\`\`

**Device Identification:**
- Match by exact name (case-insensitive)
- Match by partial name: "AP 23" → "Access Point 23"
- Match by type + filter: "all switches", "all APs on Floor 2"

**Validation:**
- IP addresses: valid IPv4 format
- MAC addresses: colon or hyphen separated
- Status: up, down, warning, maintenance, offline
- Type: firewall, core, switch, ap, server, router, wan
- Floor: positive number or null

**Nested Field Updates:**

For nested fields like firmware version, use dot notation in the updates object:

CORRECT FORMAT:
\`\`\`json
{
  "action": "propose_network_change",
  "deviceIds": ["dev-123"],
  "updates": {
    "hardware.firmware.version": "3.0.0.69",
    "hardware.firmware.lastUpdated": "2024-01-15"
  },
  "summary": "Update firmware version",
  "affectedDevices": [...]
}
\`\`\`

INCORRECT FORMAT (DO NOT USE):
\`\`\`json
{
  "updates": {
    "hardware": {
      "firmware": "3.0.0.69"  // ❌ WRONG - use dot notation instead
    }
  }
}
\`\`\`

**Supported Nested Fields:**
- hardware.manufacturer - Device manufacturer
- hardware.model - Device model number
- hardware.firmware.version - Current firmware/software version
- hardware.firmware.lastUpdated - Date of last firmware update
- hardware.firmware.updateAvailable - Boolean: update available
- hardware.firmware.updateVersion - Version number of available update

**Response Flow:**
1. Parse user request
2. Identify target devices from network context
3. Determine fields to update
4. Generate JSON proposal in code block with proper dot notation for nested fields
5. Add friendly message explaining change needs approval

## Connection Management

You have tools to manage connections between devices:

1. **suggest_connection_addition**: Suggest new connections between existing devices
   - ALWAYS validate both devices exist in the network context before suggesting
   - Specify appropriate connection type (trunk for switch-to-switch, access for endpoint)
   - Include VLAN information if known
   - Suggest appropriate link speed based on device types and capabilities

2. **suggest_connection_modification**: Suggest changes to existing connections
   - Identify connection by fromDeviceName and toDeviceName
   - Only update properties that need to change
   - Common scenarios: upgrade speed, change VLAN assignments, fix configuration

3. **suggest_connection_removal**: Suggest removing connections
   - IMPORTANT: Analyze impact before suggesting removal
   - Check if removal would isolate devices
   - Only suggest removal if redundant or clearly incorrect
   - Provide clear reasoning

**Best Practices**:
- Core/distribution switches: Use trunk connections with appropriate VLANs
- Access switches to endpoints: Use access connections
- Uplink connections: Consider 10G for aggregation, 1G for access
- Redundant paths: Suggest dual connections for critical devices

## VLAN Management

You can suggest VLAN creation and device assignments to help users segment their network:

**suggest_vlan_creation**:
- Check existing VLANs to avoid ID conflicts
- Suggest appropriate VLAN IDs (common: 10=Management, 20=Users, 30=Guests, 40=IoT, 50=Servers, 100=Voice)
- Provide CIDR subnet notation
- Gateway is typically the first usable IP in subnet
- Common use cases: security segmentation, guest isolation, IoT containment, VoIP QoS

**suggest_vlan_assignment**:
- Only assign devices to existing VLANs
- Group similar device types (all APs in guest VLAN, all cameras in IoT VLAN)
- Consider security implications (separate untrusted devices)

**Best Practices**:
- Guest networks: Separate VLAN with restricted access
- IoT devices: Isolated VLAN to limit attack surface
- Management: Dedicated VLAN for network device management
- Voice: Separate VLAN for QoS priority
- Servers: Separate from user VLANs

## Security Analysis

You can proactively analyze the network for security issues using **report_security_findings**:

**What to Check**:
1. **Firmware**: Outdated device firmware (check device.hardware.firmware.version and lastUpdated)
2. **Segmentation**: Flat networks without VLANs, lack of guest network isolation
3. **Access Control**: Management interfaces on same VLAN as users, default credentials
4. **Redundancy**: Single points of failure, no backup connections to critical devices
5. **Configuration**: Insecure protocols (Telnet, HTTP), unused ports
6. **Compliance**: PCI-DSS, HIPAA, or general best practices violations

**Severity Guidelines**:
- **Critical**: Immediate risk of compromise (default credentials, exposed management)
- **High**: Significant vulnerability (outdated firmware with known CVEs, no segmentation)
- **Medium**: Configuration weakness (missing redundancy, poor VLAN design)
- **Low**: Minor issues (non-critical firmware updates, naming inconsistencies)
- **Info**: General recommendations (optimization, best practices)

**When to Use**:
- User asks "check security" or "any vulnerabilities"
- User asks "audit my network"
- After analyzing network context, if you notice obvious security issues

## Vendor Integration - Meraki Import

You can help users import their network topology from Cisco Meraki Dashboard using **request_meraki_import**:

**When to Use**:
- User mentions "import from Meraki" or "Meraki Dashboard"
- User has Meraki devices and wants to quickly map their network
- User asks "can I import my existing network"

**What It Does**:
- Opens a modal for the user to enter their Meraki API key
- Fetches organizations, networks, and devices from Meraki Dashboard
- Converts Meraki devices (MX, MS, MR, MV, MG) to NetMap format
- Imports devices with serial numbers, firmware versions, and online/offline status

**Example Usage**:
User: "I want to import my network from Meraki"
You: Call request_meraki_import with reason explaining the import process`;

  if (networkContext) {
    prompt += `\n\nCurrent Network Topology Context:\n${JSON.stringify(networkContext, null, 2)}`;
  }

  return prompt;
}

/**
 * Log AI usage for audit trail
 */
async function logAiUsage(env, user, requestType, networkId, usage, status, error = null) {
  if (!env.DB) return;

  try {
    const logEntry = {
      id: crypto.randomUUID(),
      user_id: user.id,
      timestamp: Math.floor(Date.now() / 1000),
      request_type: requestType,
      prompt_tokens: usage?.input_tokens || 0,
      completion_tokens: usage?.output_tokens || 0,
      total_tokens: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
      network_context_included: networkId ? 1 : 0,
      network_id: networkId || null,
      status: status,
      error_message: error || null
    };

    await env.DB.prepare(`
      INSERT INTO ai_usage_logs
      (id, user_id, timestamp, request_type, prompt_tokens, completion_tokens,
       total_tokens, network_context_included, network_id, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      logEntry.id, logEntry.user_id, logEntry.timestamp, logEntry.request_type,
      logEntry.prompt_tokens, logEntry.completion_tokens, logEntry.total_tokens,
      logEntry.network_context_included, logEntry.network_id, logEntry.status,
      logEntry.error_message
    ).run();
  } catch (err) {
    console.error('Failed to log AI usage:', err);
  }
}

/**
 * Handle OPTIONS request (CORS preflight)
 */
function handleOptions(request, env) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, env),
  });
}

/**
 * Handle POST request
 */
async function handlePost(request, env, user) {
  try {
    // Log for audit trail
    console.log(`AI request from user: ${user.id}, email: ${user.email}`);

    // Rate limiting: 50 requests per hour for premium users
    const rateLimitKey = `ai-chat:${user.id}`;

    if (env.RATE_LIMIT_KV) {
      const rateLimitCheck = await checkRateLimit(
        env.RATE_LIMIT_KV,
        rateLimitKey,
        50,      // max requests
        60 * 60  // per hour (3600 seconds)
      );

      if (!rateLimitCheck.allowed) {
        const waitMinutes = Math.ceil(
          (rateLimitCheck.resetAt - Math.floor(Date.now() / 1000)) / 60
        );
        return new Response(
          JSON.stringify({
            error: 'AI request limit exceeded',
            message: `You've reached your hourly limit. Please wait ${waitMinutes} minutes.`,
            retry_after: waitMinutes,
            limit: 50,
            reset_at: rateLimitCheck.resetAt
          }),
          {
            status: 429,
            headers: {
              ...getCorsHeaders(request, env),
              'Content-Type': 'application/json',
              'Retry-After': String(waitMinutes * 60),
              'X-RateLimit-Limit': '50',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(rateLimitCheck.resetAt)
            }
          }
        );
      }
    }

    // Parse request body
    const body = await request.json();
    const { messages, networkContext, enableTools } = body;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      await logAiUsage(env, user, 'chat', null, null, 'error', 'Invalid request: messages array required');
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        {
          status: 400,
          headers: { ...getCorsHeaders(request, env), 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate each message has non-empty content
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.content || msg.content.trim().length === 0) {
        return new Response(
          JSON.stringify({
            error: `Invalid request: message at index ${i} has empty content`
          }),
          {
            status: 400,
            headers: { ...getCorsHeaders(request, env), 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Validate API key
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'sk-ant-api03-YOUR_KEY_HERE') {
      console.error('Anthropic API key not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured. Please add your API key to .dev.vars' }),
        {
          status: 500,
          headers: { ...getCorsHeaders(request, env), 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Build system prompt with network context
    const systemPrompt = buildSystemPrompt(networkContext);

    // Create streaming response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Start streaming in background
    (async () => {
      try {
        // Configure API call with optional tools
        const apiConfig = {
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 8192, // Increased to handle large batches of device suggestions
          system: systemPrompt,
          messages: messages,
        };

        // Add tools if enabled
        if (enableTools) {
          apiConfig.tools = TOOLS;
        }

        const stream = await anthropic.messages.stream(apiConfig);

        // Track content blocks to send complete tool calls once
        const contentBlocks = [];
        const sentToolCallIds = new Set();

        // Stream events to client
        for await (const event of stream) {
          // Handle text deltas
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const text = event.delta.text;
            await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }

          // Track content blocks as they start
          if (event.type === 'content_block_start') {
            contentBlocks[event.index] = event.content_block;
          }

          // Accumulate input JSON deltas
          if (event.type === 'content_block_delta' && event.delta.type === 'input_json_delta') {
            if (contentBlocks[event.index]) {
              // Accumulate the partial JSON string
              if (!contentBlocks[event.index].partial_json) {
                contentBlocks[event.index].partial_json = '';
              }
              contentBlocks[event.index].partial_json += event.delta.partial_json;
            }
          }

          // Handle complete tool use at block stop
          if (event.type === 'content_block_stop' && event.index !== undefined) {
            const block = contentBlocks[event.index];

            // Only send tool calls once per unique ID
            if (block && block.type === 'tool_use' && !sentToolCallIds.has(block.id)) {
              sentToolCallIds.add(block.id);

              // Parse the accumulated JSON input
              let input = block.input || {};
              if (block.partial_json) {
                try {
                  input = JSON.parse(block.partial_json);
                } catch (e) {
                  console.error('Failed to parse tool input JSON:', e);
                }
              }

              await writer.write(encoder.encode(`data: ${JSON.stringify({
                toolCall: {
                  id: block.id,
                  name: block.name,
                  input: input
                }
              })}\n\n`));
            }
          }
        }

        // Send completion event
        await writer.write(encoder.encode('data: [DONE]\n\n'));

        // Log successful AI usage
        await logAiUsage(
          env,
          user,
          'chat',
          body.networkId || null,
          null, // Usage data not available in streaming mode
          'success'
        );
      } catch (error) {
        console.error('Streaming error:', error);
        const errorMessage = error.message || 'Streaming error occurred';
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
        );

        // Log error
        await logAiUsage(env, user, 'chat', body.networkId || null, null, 'error', errorMessage);
      } finally {
        await writer.close();
      }
    })();

    // Return streaming response
    return new Response(readable, {
      status: 200,
      headers: {
        ...getCorsHeaders(request, env),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Request handling error:', error);
    await logAiUsage(env, user, 'chat', null, null, 'error', error.message || 'Internal server error');
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...getCorsHeaders(request, env), 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Main request handler
 */
export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request, env);
  }

  // Handle POST request
  if (request.method === 'POST') {
    // CRITICAL: Require authentication
    const authError = await requireAuth(context);
    if (authError) {
      // Add CORS headers to auth error response
      const headers = new Headers(authError.headers);
      const corsHeaders = getCorsHeaders(request, env);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      return new Response(authError.body, {
        status: authError.status,
        headers: headers
      });
    }

    // Require premium tier
    if (!isPremiumUser(context.user)) {
      return new Response(
        JSON.stringify({
          error: 'Premium subscription required for AI assistant',
          upgrade_required: true
        }),
        {
          status: 403,
          headers: {
            ...getCorsHeaders(request, env),
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return handlePost(request, env, context.user);
  }

  // Method not allowed
  return new Response('Method not allowed', {
    status: 405,
    headers: getCorsHeaders(request, env),
  });
}
