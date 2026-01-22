import React from 'react';
import { BulkTextField, BulkMultiSelectField } from '../bulk-edit-fields';

/**
 * Network Configuration Tab - Network settings and connectivity
 * Hostname, IPs, DNS, NTP, Gateway
 */
const BulkNetworkTab = ({
  enabledFields,
  fieldValues,
  conflicts,
  validations,
  onEnabledChange,
  onValueChange,
  theme
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm" style={{ color: theme.textMuted }}>
        Network configuration and connectivity settings. Use caution when modifying network settings.
      </div>

      {/* Identity */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          IDENTITY
        </div>

        <BulkTextField
          fieldPath="network.hostname"
          label="Hostname"
          enabled={enabledFields['network.hostname'] || false}
          value={fieldValues['network.hostname']}
          conflict={conflicts['network.hostname']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['network.hostname']}
          placeholder="device-hostname"
        />

        <BulkTextField
          fieldPath="network.fqdn"
          label="Fully Qualified Domain Name (FQDN)"
          enabled={enabledFields['network.fqdn'] || false}
          value={fieldValues['network.fqdn']}
          conflict={conflicts['network.fqdn']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['network.fqdn']}
          placeholder="device.domain.com"
        />
      </div>

      {/* IP Addressing */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          IP ADDRESSING
        </div>

        <BulkTextField
          fieldPath="network.managementIP"
          label="⚠️ Management IP Address"
          enabled={enabledFields['network.managementIP'] || false}
          value={fieldValues['network.managementIP']}
          conflict={conflicts['network.managementIP']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['network.managementIP']}
          placeholder="192.168.1.10"
        />

        <BulkTextField
          fieldPath="network.managementVLAN"
          label="Management VLAN"
          enabled={enabledFields['network.managementVLAN'] || false}
          value={fieldValues['network.managementVLAN']}
          conflict={conflicts['network.managementVLAN']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['network.managementVLAN']}
          placeholder="e.g., 10"
        />

        <BulkTextField
          fieldPath="network.ipv6Address"
          label="IPv6 Address"
          enabled={enabledFields['network.ipv6Address'] || false}
          value={fieldValues['network.ipv6Address']}
          conflict={conflicts['network.ipv6Address']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['network.ipv6Address']}
          placeholder="2001:db8::1"
        />

        <BulkTextField
          fieldPath="network.defaultGateway"
          label="⚠️ Default Gateway"
          enabled={enabledFields['network.defaultGateway'] || false}
          value={fieldValues['network.defaultGateway']}
          conflict={conflicts['network.defaultGateway']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['network.defaultGateway']}
          placeholder="192.168.1.1"
        />
      </div>

      {/* Services */}
      <div
        className="p-3 rounded-lg"
        style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: theme.textMuted }}>
          SERVICES
        </div>

        <BulkMultiSelectField
          fieldPath="network.dnsServers"
          label="DNS Servers"
          enabled={enabledFields['network.dnsServers'] || false}
          value={fieldValues['network.dnsServers']}
          conflict={conflicts['network.dnsServers']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['network.dnsServers']}
          placeholder="8.8.8.8, 8.8.4.4"
          helpText="Enter DNS server IPs separated by commas"
        />

        <BulkMultiSelectField
          fieldPath="network.ntpServers"
          label="NTP Servers"
          enabled={enabledFields['network.ntpServers'] || false}
          value={fieldValues['network.ntpServers']}
          conflict={conflicts['network.ntpServers']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['network.ntpServers']}
          placeholder="time.google.com, pool.ntp.org"
          helpText="Enter NTP server addresses separated by commas"
        />

        <BulkTextField
          fieldPath="network.syslogServer"
          label="Syslog Server"
          enabled={enabledFields['network.syslogServer'] || false}
          value={fieldValues['network.syslogServer']}
          conflict={conflicts['network.syslogServer']}
          onEnabledChange={onEnabledChange}
          onValueChange={onValueChange}
          theme={theme}
          validation={validations['network.syslogServer']}
          placeholder="syslog.domain.com or IP address"
        />
      </div>
    </div>
  );
};

export default BulkNetworkTab;
