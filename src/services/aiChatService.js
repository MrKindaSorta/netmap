/**
 * AI Chat Service
 * Handles communication with Claude AI API via Cloudflare Worker proxy
 */

// API endpoint configuration
const getApiEndpoint = () => {
  // In development, use localhost worker
  // In production, use relative URL (same origin)
  return import.meta.env.DEV
    ? 'http://localhost:8787/api/ai-chat'
    : '/api/ai-chat';
};

/**
 * Helper: Omit null, undefined, empty string, and empty array values
 */
function omitEmpty(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      const cleaned = omitEmpty(value);
      if (Object.keys(cleaned).length > 0) {
        result[key] = cleaned;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Helper: Get relevant type-specific fields for troubleshooting
 */
function getRelevantSpecificFields(device) {
  if (!device.specific) return {};

  const specific = device.specific;
  const type = device.type;

  // Select most critical fields per device type
  switch (type) {
    case 'firewall':
      return omitEmpty({
        throughput: specific.throughput,
        connections: specific.connections,
        vpnTunnels: { active: specific.vpnTunnels?.active, configured: specific.vpnTunnels?.configured },
        wan: specific.wan,
        ips: specific.ips?.enabled ? { enabled: true, mode: specific.ips.mode } : undefined
      });

    case 'core':
    case 'switch':
      return omitEmpty({
        ports: specific.ports,
        poe: specific.poe,
        spanningTree: specific.spanningTree,
        uplink: specific.uplink
      });

    case 'ap':
      return omitEmpty({
        controller: specific.controller,
        clients: specific.clients,
        radio: {
          '2.4GHz': { channel: specific.radio?.['2.4GHz']?.channel, utilization: specific.radio?.['2.4GHz']?.utilization },
          '5GHz': { channel: specific.radio?.['5GHz']?.channel, utilization: specific.radio?.['5GHz']?.utilization }
        },
        mesh: specific.mesh?.enabled ? specific.mesh : undefined
      });

    case 'wan':
      return omitEmpty({
        provider: specific.provider,
        bandwidth: specific.bandwidth,
        utilization: specific.utilization,
        monitoring: specific.monitoring
      });

    case 'server':
      return omitEmpty({
        role: specific.role,
        os: specific.os,
        services: specific.services?.length ? `${specific.services.length} services` : undefined,
        virtualization: specific.virtualization?.type ? specific.virtualization : undefined,
        clustered: specific.clustered?.enabled ? specific.clustered : undefined
      });

    default:
      return {};
  }
}

/**
 * Format network context for AI analysis
 * Three-tier system: summary (>50 devices), medium (default), full (on demand)
 * @param {Array} devices - Device array
 * @param {Array} connections - Connection array
 * @param {Array} vlans - VLAN array
 * @param {Array} buildings - Building array
 * @param {Object} options - { detailLevel: 'summary'|'medium'|'full', focusDevices: [], includeMetrics: true }
 */
export function formatNetworkContext(devices, connections, vlans, buildings, options = {}) {
  const {
    detailLevel = 'auto',
    focusDevices = [],
    includeMetrics = true,
    includeAsset = false,
    includeSecurity = false
  } = options;

  // Calculate summary statistics
  const deviceTypes = devices.reduce((acc, device) => {
    acc[device.type] = (acc[device.type] || 0) + 1;
    return acc;
  }, {});

  const summary = {
    totalDevices: devices.length,
    totalConnections: connections.length,
    totalVLANs: vlans?.length || 0,
    buildings: buildings?.length || 0,
    deviceTypes,
  };

  // Auto-detect detail level based on topology size
  let effectiveDetailLevel = detailLevel;
  if (detailLevel === 'auto') {
    effectiveDetailLevel = devices.length > 50 ? 'summary' : 'medium';
  }

  // SUMMARY LEVEL - Large topologies
  if (effectiveDetailLevel === 'summary' && focusDevices.length === 0) {
    return {
      summary,
      note: 'Large topology - showing summary only. Ask about specific devices for detailed information.',
      deviceList: devices.map(d => ({
        id: d.id,
        type: d.type,
        name: d.name,
        ip: d.ip,
        status: d.status
      })),
    };
  }

  // MEDIUM LEVEL - Default for most queries
  if (effectiveDetailLevel === 'medium' || effectiveDetailLevel === 'summary') {
    return {
      summary,
      devices: devices.map(d => {
        const isFocused = focusDevices.includes(d.id);

        const baseDevice = {
          id: d.id,
          type: d.type,
          name: d.name,
          ip: d.ip,
          status: d.status,
        };

        // Enhanced data for all devices
        const enhanced = {
          ...baseDevice,
          hardware: omitEmpty({
            manufacturer: d.hardware?.manufacturer,
            model: d.hardware?.model,
            firmware: d.hardware?.firmware?.version,
            uptime: d.hardware?.uptime?.seconds
          }),
        };

        // Add metrics if requested
        if (includeMetrics && d.metrics) {
          enhanced.metrics = omitEmpty({
            cpu: d.metrics.cpu?.current,
            memory: d.metrics.memory?.usedPercent,
            temp: d.metrics.temperature?.current
          });
        }

        // Add monitoring status
        if (d.monitoring) {
          enhanced.monitoring = omitEmpty({
            status: d.monitoring.pingStatus,
            latency: d.monitoring.pingLatency,
            alerts: d.monitoring.alerts?.critical || d.monitoring.alerts?.warning
              ? { critical: d.monitoring.alerts.critical, warning: d.monitoring.alerts.warning }
              : undefined
          });
        }

        // Add type-specific fields (filtered)
        const specificFields = getRelevantSpecificFields(d);
        if (Object.keys(specificFields).length > 0) {
          enhanced.specific = specificFields;
        }

        // Full details for focused devices
        if (isFocused) {
          if (includeAsset && d.asset) {
            enhanced.asset = omitEmpty(d.asset);
          }
          if (includeSecurity && d.security) {
            enhanced.security = omitEmpty(d.security);
          }
          if (d.location) {
            enhanced.location = omitEmpty(d.location);
          }
        }

        return omitEmpty(enhanced);
      }),
      connections: connections.map(c => omitEmpty({
        id: c.id,
        from: devices.find(d => d.id === c.from)?.name || c.from,
        to: devices.find(d => d.id === c.to)?.name || c.to,
        fromPort: c.fromPort,
        toPort: c.toPort,
        speed: c.speed,
        type: c.type,
        status: c.status,
        utilization: c.utilization ? {
          tx: c.utilization.tx,
          rx: c.utilization.rx
        } : undefined
      })),
      vlans: vlans?.map(v => omitEmpty({
        id: v.id,
        name: v.name,
        subnet: v.subnet,
        gateway: v.gateway,
        devices: v.devices?.length
      })) || [],
    };
  }

  // FULL LEVEL - Comprehensive data for deep troubleshooting
  return {
    summary,
    note: 'Full network context with all troubleshooting data',
    devices: devices.map(d => {
      const fullDevice = {
        id: d.id,
        type: d.type,
        name: d.name,
        ip: d.ip,
        mac: d.mac,
        status: d.status,
        hardware: omitEmpty(d.hardware),
        metrics: omitEmpty(d.metrics),
        monitoring: omitEmpty(d.monitoring),
        network: omitEmpty(d.network),
        specific: omitEmpty(d.specific),
      };

      if (includeAsset) fullDevice.asset = omitEmpty(d.asset);
      if (includeSecurity) fullDevice.security = omitEmpty(d.security);
      fullDevice.location = omitEmpty(d.location);

      return omitEmpty(fullDevice);
    }),
    connections: connections.map(c => omitEmpty({
      ...c,
      fromName: devices.find(d => d.id === c.from)?.name || c.from,
      toName: devices.find(d => d.id === c.to)?.name || c.to,
    })),
    vlans: vlans?.map(v => omitEmpty(v)) || [],
  };
}

/**
 * Send message to AI and handle streaming response
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} networkContext - Optional network topology context
 * @param {Function} onChunk - Callback for each streaming chunk
 * @returns {Promise<string>} - Complete AI response
 */
export async function sendMessage(messages, networkContext = null, onChunk = null) {
  try {
    const endpoint = getApiEndpoint();

    // Make request to worker
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        networkContext,
      }),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullMessage = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process all complete SSE messages in buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // Remove 'data: ' prefix

          // Check for completion marker
          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);

            // Handle error in stream
            if (parsed.error) {
              throw new Error(parsed.error);
            }

            // Handle text chunk
            if (parsed.text) {
              fullMessage += parsed.text;

              // Call chunk callback if provided
              if (onChunk) {
                onChunk(parsed.text);
              }
            }
          } catch (parseError) {
            console.error('Failed to parse SSE data:', data, parseError);
          }
        }
      }
    }

    // Validate response is not empty
    if (!fullMessage || fullMessage.trim().length === 0) {
      throw new Error('Received empty response from AI service');
    }

    return fullMessage;
  } catch (error) {
    console.error('AI Chat Service Error:', error);

    // Provide user-friendly error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to AI service. Make sure the worker is running (npm run dev:worker).');
    } else if (error.message.includes('AI service not configured')) {
      throw new Error('AI service not configured. Please add your Anthropic API key to .dev.vars');
    } else if (error.message.includes('credit balance is too low')) {
      throw new Error('Anthropic API credit balance is too low. Please add credits at console.anthropic.com');
    } else if (error.message.includes('not_found_error') || error.message.includes('model:')) {
      throw new Error('AI model not available. The configured model may be deprecated. Please contact support.');
    } else if (error.message.includes('429')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.message.includes('empty response')) {
      throw new Error('Received empty response from AI. Please try again.');
    } else {
      throw error;
    }
  }
}

/**
 * Validate message input
 * @param {string} message - User message
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateMessage(message) {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (message.length > 2000) {
    return { valid: false, error: 'Message too long (max 2000 characters)' };
  }

  return { valid: true };
}

/**
 * Handle AI tool calls for device suggestions
 * @param {Object} toolCall - Tool call from AI
 * @param {Object} devices - Existing devices
 * @param {Object} connections - Existing connections
 * @param {Object} buildings - Building data
 * @param {Object} vlans - VLAN data
 * @returns {Object} Tool call result
 */
export function handleAiToolCall(toolCall, devices, connections, buildings, vlans) {
  if (toolCall.name === 'suggest_device_addition') {
    const { device, suggestedPosition, connections: suggestedConnections, reasoning, confidence } = toolCall.input;

    // Validate device doesn't already exist
    const existingByName = Object.values(devices).find(
      d => d.name.toLowerCase() === device.name.toLowerCase()
    );
    const existingByIp = device.ip
      ? Object.values(devices).find(d => d.ip === device.ip)
      : null;

    if (existingByName || existingByIp) {
      return {
        type: 'device_suggestion_duplicate',
        error: `Device ${device.name} already exists`,
        existingDevice: existingByName || existingByIp
      };
    }

    // Import positioning service (will be resolved at runtime)
    // Position will be recalculated in the main handler

    // Prepare device data matching NetMap schema
    const deviceData = {
      name: device.name,
      type: device.type,
      ip: device.ip || '',
      mac: device.mac || '',
      x: suggestedPosition?.x || 400,
      y: suggestedPosition?.y || 300,
      physicalX: suggestedPosition?.x || 400,
      physicalY: suggestedPosition?.y || 300,
      status: device.status || 'unknown',
      vlans: device.vlans || [1],
      notes: device.notes || '',
      isRoot: false,
      hardware: device.hardware ? {
        manufacturer: device.hardware.manufacturer || '',
        model: device.hardware.model || '',
        firmware: device.hardware.firmware ? {
          version: device.hardware.firmware
        } : undefined
      } : undefined,
      buildingId: device.buildingId || null,
      floor: device.floor || null
    };

    // Prepare connection data
    const connectionData = (suggestedConnections || [])
      .map(conn => {
        const targetDevice = Object.values(devices).find(
          d => d.name === conn.toDeviceName
        );
        if (!targetDevice) return null;

        return {
          toDeviceId: targetDevice.id,
          toDeviceName: targetDevice.name,
          fromPort: conn.fromPort || '',
          toPort: conn.toPort || '',
          type: conn.type || 'trunk',
          speed: conn.speed || '1G',
          vlans: conn.vlans || [],
          cableType: conn.cableType || 'cat6'
        };
      })
      .filter(Boolean);

    return {
      type: 'device_suggestion',
      data: {
        device: deviceData,
        suggestedPosition: suggestedPosition || { x: 400, y: 300, strategy: 'default' },
        connections: connectionData,
        reasoning: reasoning || 'Device detected from provided information',
        confidence: confidence || 'medium'
      }
    };
  }

  return { type: 'unknown_tool', error: `Unknown tool: ${toolCall.name}` };
}

/**
 * Extract tool calls from Claude response
 * @param {Object} message - Message object from Claude API
 * @returns {Array} Array of tool calls
 */
export function extractToolCalls(message) {
  if (!message.content) return [];

  return message.content
    .filter(block => block.type === 'tool_use')
    .map(block => ({
      id: block.id,
      name: block.name,
      input: block.input
    }));
}

/**
 * Send message with tool support
 * @param {Array} messages - Message history
 * @param {Object} networkContext - Network context
 * @param {Function} onChunk - Streaming callback
 * @param {Function} onToolCall - Tool call callback
 * @returns {Promise<Object>} Response with text and tool calls
 */
export async function sendMessageWithTools(messages, networkContext, onChunk, onToolCall) {
  try {
    const endpoint = getApiEndpoint();

    // Make request to worker with tool support
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        networkContext,
        enableTools: true // Signal to use tool definitions
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullMessage = '';
    let buffer = '';
    let toolCalls = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              throw new Error(parsed.error);
            }

            // Handle text chunk
            if (parsed.text) {
              fullMessage += parsed.text;
              if (onChunk) {
                onChunk(parsed.text);
              }
            }

            // Handle tool call
            if (parsed.toolCall) {
              toolCalls.push(parsed.toolCall);
              if (onToolCall) {
                onToolCall(parsed.toolCall);
              }
            }
          } catch (parseError) {
            console.error('Failed to parse SSE data:', data, parseError);
          }
        }
      }
    }

    return {
      text: fullMessage,
      toolCalls
    };
  } catch (error) {
    console.error('AI Chat Service Error:', error);
    throw error;
  }
}
