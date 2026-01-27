import React from 'react';
import { CheckCircle2, XCircle, Link, TrendingUp, Trash2 } from 'lucide-react';

export default function ConnectionSuggestionCard({
  suggestion,
  onApprove,
  onDecline
}) {
  const { type, fromDevice, toDevice, reasoning } = suggestion;

  const getIcon = () => {
    switch (type) {
      case 'connection_addition': return <Link className="w-5 h-5" />;
      case 'connection_modification': return <TrendingUp className="w-5 h-5" />;
      case 'connection_removal': return <Trash2 className="w-5 h-5" />;
      default: return <Link className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'connection_addition':
        return `Add Connection: ${fromDevice.name} → ${toDevice.name}`;
      case 'connection_modification':
        return `Modify Connection: ${fromDevice.name} ↔ ${toDevice.name}`;
      case 'connection_removal':
        return `Remove Connection: ${fromDevice.name} ✕ ${toDevice.name}`;
      default:
        return 'Connection Suggestion';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">
            {getTitle()}
          </h4>
          <p className="text-sm text-gray-600 mb-2">{reasoning}</p>

          {type === 'connection_addition' && (
            <div className="space-y-1 text-sm">
              <div className="flex gap-4">
                <span className="text-gray-500">Ports:</span>
                <span className="font-mono text-gray-700">
                  {suggestion.fromPort} ↔ {suggestion.toPort}
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium text-gray-700">
                  {suggestion.connectionType} ({suggestion.speed})
                </span>
              </div>
              {suggestion.vlans && suggestion.vlans.length > 0 && (
                <div className="flex gap-4">
                  <span className="text-gray-500">VLANs:</span>
                  <span className="text-gray-700">
                    {suggestion.vlans.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {type === 'connection_modification' && (
            <div className="space-y-1 text-sm mt-2">
              <div className="font-medium text-gray-700 mb-1">Changes:</div>
              {Object.entries(suggestion.updates).map(([key, value]) => (
                <div key={key} className="flex gap-4 pl-4">
                  <span className="text-gray-500 capitalize">{key}:</span>
                  <span className="text-gray-700">
                    {suggestion.currentValues[key]} → {
                      Array.isArray(value) ? value.join(', ') : value
                    }
                  </span>
                </div>
              ))}
            </div>
          )}

          {type === 'connection_removal' && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
              <div className="text-sm text-amber-800">
                <strong>Impact:</strong> {suggestion.impact}
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
