import React, { useState } from 'react';
import Modal from '../common/Modal';
import { PrimaryButton, ModalFooter } from '../common/Button';
import { getAvailableTabs } from '../../constants';
import {
  BasicConfigTab,
  VlanConfigTab,
  DhcpConfigTab,
  SsidConfigTab,
  VoipConfigTab,
  AdvancedConfigTab,
  HardwareConfigTab,
  LocationConfigTab,
  AssetConfigTab,
  MonitoringConfigTab
} from './tabs';

const DevModal = React.memo(({ device, deviceId, onClose, onUpdate, theme, deviceTypes, statusColors, buildings, vlans }) => {
  if (!device) return null;

  const [activeTab, setActiveTab] = useState('basic');
  const availableTabs = getAvailableTabs(device);
  const upd = (updates) => onUpdate(deviceId, updates);

  const tabs = [
    { id: 'basic', label: 'Basic', icon: '⚙️' },
    { id: 'hardware', label: 'Hardware', icon: '🔧' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'asset', label: 'Asset', icon: '💼' },
    { id: 'vlans', label: 'VLANs', icon: '🔀' },
    { id: 'dhcp', label: 'DHCP', icon: '🌐' },
    { id: 'ssid', label: 'SSIDs', icon: '📡' },
    { id: 'voip', label: 'VoIP', icon: '☎️' },
    { id: 'monitoring', label: 'Monitoring', icon: '📊' },
    { id: 'advanced', label: 'Advanced', icon: '⚡' }
  ].filter(tab => availableTabs.includes(tab.id));

  const footer = (
    <ModalFooter>
      <PrimaryButton onClick={onClose} fullWidth>
        Done
      </PrimaryButton>
    </ModalFooter>
  );

  return (
    <Modal
      title={`Edit Device: ${device.name}`}
      onClose={onClose}
      theme={theme}
      size="lg"
      footer={footer}
    >
      {/* Scrollable Tab Navigation */}
      {tabs.length > 1 && (
        <div
          className="flex gap-1 mb-5 pb-3 border-b overflow-x-auto scrollbar-thin"
          style={{ borderColor: theme.border }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'shadow-sm'
                  : ''
              }`}
              style={{
                background: activeTab === tab.id ? '#2563eb' : theme.bg,
                color: activeTab === tab.id ? '#ffffff' : theme.text,
                border: `1px solid ${activeTab === tab.id ? '#2563eb' : theme.border}`
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div>
        {activeTab === 'basic' && <BasicConfigTab device={device} upd={upd} theme={theme} deviceTypes={deviceTypes} statusColors={statusColors} buildings={buildings} />}
        {activeTab === 'hardware' && <HardwareConfigTab device={device} upd={upd} theme={theme} />}
        {activeTab === 'location' && <LocationConfigTab device={device} upd={upd} theme={theme} />}
        {activeTab === 'asset' && <AssetConfigTab device={device} upd={upd} theme={theme} />}
        {activeTab === 'vlans' && <VlanConfigTab device={device} upd={upd} theme={theme} vlans={vlans} />}
        {activeTab === 'dhcp' && <DhcpConfigTab device={device} upd={upd} theme={theme} vlans={vlans} />}
        {activeTab === 'ssid' && <SsidConfigTab device={device} upd={upd} theme={theme} vlans={vlans} />}
        {activeTab === 'voip' && <VoipConfigTab device={device} upd={upd} theme={theme} />}
        {activeTab === 'monitoring' && <MonitoringConfigTab device={device} upd={upd} theme={theme} />}
        {activeTab === 'advanced' && <AdvancedConfigTab device={device} upd={upd} theme={theme} />}
      </div>
    </Modal>
  );
});

export default DevModal;
