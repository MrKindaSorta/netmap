import Anthropic from '@anthropic-ai/sdk';

/**
 * Cloudflare Pages Function for AI Chat API
 * Proxies requests to Anthropic Claude API with streaming support
 */

// CORS headers for local development and production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
5. Add friendly message explaining change needs approval`;

  if (networkContext) {
    prompt += `\n\nCurrent Network Topology Context:\n${JSON.stringify(networkContext, null, 2)}`;
  }

  return prompt;
}

/**
 * Handle OPTIONS request (CORS preflight)
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Handle POST request
 */
async function handlePost(request, env) {
  try {
    // Parse request body
    const body = await request.json();
    const { messages, networkContext, enableTools } = body;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      } catch (error) {
        console.error('Streaming error:', error);
        const errorMessage = error.message || 'Streaming error occurred';
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();

    // Return streaming response
    return new Response(readable, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Request handling error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
    return handleOptions();
  }

  // Handle POST request
  if (request.method === 'POST') {
    return handlePost(request, env);
  }

  // Method not allowed
  return new Response('Method not allowed', {
    status: 405,
    headers: corsHeaders,
  });
}
