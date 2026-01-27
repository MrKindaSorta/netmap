import React from 'react';
import { CheckCircle2, XCircle, Network, Users } from 'lucide-react';

export default function VlanSuggestionCard({ suggestion, onApprove, onDecline }) {
  const { type } = suggestion;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
          <Network className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">
            {type === 'vlan_creation'
              ? `Create VLAN ${suggestion.vlanId}: ${suggestion.name}`
              : `Assign Devices to VLAN ${suggestion.vlanId}`
            }
          </h4>
          <p className="text-sm text-gray-600 mb-2">{suggestion.reasoning}</p>

          {type === 'vlan_creation' && (
            <div className="space-y-1 text-sm">
              {suggestion.subnet && (
                <div className="flex gap-4">
                  <span className="text-gray-500">Subnet:</span>
                  <span className="font-mono text-gray-700">{suggestion.subnet}</span>
                </div>
              )}
              {suggestion.gateway && (
                <div className="flex gap-4">
                  <span className="text-gray-500">Gateway:</span>
                  <span className="font-mono text-gray-700">{suggestion.gateway}</span>
                </div>
              )}
              {suggestion.description && (
                <div className="flex gap-4">
                  <span className="text-gray-500">Purpose:</span>
                  <span className="text-gray-700">{suggestion.description}</span>
                </div>
              )}
              {suggestion.devicesToAssign.length > 0 && (
                <div className="mt-2">
                  <div className="text-gray-500 mb-1">Devices to assign:</div>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.devicesToAssign.map(device => (
                      <span
                        key={device.id}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                      >
                        {device.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {type === 'vlan_assignment' && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                <span>Assigning {suggestion.devicesToAssign.length} device(s) to {suggestion.vlanName}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestion.devicesToAssign.map(device => (
                  <span
                    key={device.id}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                  >
                    {device.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {suggestion.confidence && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            suggestion.confidence === 'high'
              ? 'bg-green-100 text-green-700'
              : suggestion.confidence === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {suggestion.confidence}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onApprove(suggestion)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={() => onDecline(suggestion)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Decline
        </button>
      </div>
    </div>
  );
}
