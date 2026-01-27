import React, { useState } from 'react';
import Icon from '../common/Icon';
import { fetchMerakiOrganizations, fetchMerakiNetworks, importFromMeraki } from '../../services/merakiIntegration';

export default function MerakiImportModal({ onClose, onImport }) {
  const [step, setStep] = useState(1); // 1=API key, 2=org, 3=network, 4=importing
  const [apiKey, setApiKey] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchOrganizations = async () => {
    setLoading(true);
    setError('');

    try {
      const orgs = await fetchMerakiOrganizations(apiKey);
      setOrganizations(orgs);
      setStep(2);
    } catch (err) {
      setError('Invalid API key or network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrganization = async (org) => {
    setSelectedOrg(org);
    setLoading(true);
    setError('');

    try {
      const nets = await fetchMerakiNetworks(apiKey, org.id);
      setNetworks(nets);
      setStep(3);
    } catch (err) {
      setError('Failed to fetch networks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setError('');
    setStep(4);

    try {
      const result = await importFromMeraki(apiKey, selectedOrg.id, selectedNetwork.id);

      if (result.success) {
        onImport(result.devices);
        onClose();
      } else {
        setError('Import failed: ' + result.error);
        setStep(3);
      }
    } catch (err) {
      setError('Import failed: ' + err.message);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="text-blue-600">
              <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" s={20} />
            </div>
            <h2 className="text-lg font-semibold">Import from Meraki Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Icon d="M18 6L6 18M6 6l12 12" s={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <div className="text-red-600 flex-shrink-0 mt-0.5">
                <Icon d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" s={20} />
              </div>
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Enter your Meraki Dashboard API key to import devices from your network.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meraki API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Meraki API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Find your API key in Meraki Dashboard → Organization → Settings → Dashboard API access
                </p>
              </div>
              <button
                onClick={handleFetchOrganizations}
                disabled={!apiKey || loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Continue'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-medium">Select Organization</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {organizations.map(org => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrganization(org)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-gray-500">ID: {org.id}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">Select Network</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {networks.map(network => (
                  <button
                    key={network.id}
                    onClick={() => setSelectedNetwork(network)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedNetwork?.id === network.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{network.name}</div>
                    <div className="text-sm text-gray-500">
                      {network.productTypes?.join(', ')}
                    </div>
                  </button>
                ))}
              </div>
              {selectedNetwork && (
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Import Devices
                </button>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Importing devices from Meraki...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
