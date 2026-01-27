import React, { useState } from 'react';
import { Shield, AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function SecurityReportCard({ report, onDismiss }) {
  const [expandedFindings, setExpandedFindings] = useState({});

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Info className="w-5 h-5 text-blue-600" />;
      case 'info': return <Info className="w-5 h-5 text-gray-600" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      case 'info': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const toggleFinding = (index) => {
    setExpandedFindings(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const totalIssues = report.criticalCount + report.highCount;

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border-2 border-red-200 shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg text-red-600">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Security Audit Report
          </h3>
          <p className="text-sm text-gray-600 mb-3">{report.summary}</p>

          <div className="flex gap-4 text-sm">
            {report.criticalCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="font-medium">{report.criticalCount} Critical</span>
              </div>
            )}
            {report.highCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="font-medium">{report.highCount} High</span>
              </div>
            )}
            <div className="text-gray-500">
              {report.totalFindings} total findings
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {report.findings.map((finding, index) => (
          <div
            key={index}
            className={`rounded-lg border p-3 ${getSeverityColor(finding.severity)}`}
          >
            <div
              className="flex items-start gap-2 cursor-pointer"
              onClick={() => toggleFinding(index)}
            >
              {getSeverityIcon(finding.severity)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    {finding.title}
                    {finding.deviceName && (
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        ({finding.deviceName})
                      </span>
                    )}
                  </h4>
                  {expandedFindings[index] ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-white bg-opacity-60">
                    {finding.severity}
                  </span>
                  <span className="text-xs text-gray-600">
                    {finding.category}
                  </span>
                </div>
              </div>
            </div>

            {expandedFindings[index] && (
              <div className="mt-3 pl-7 space-y-2 text-sm">
                <div>
                  <div className="font-medium text-gray-700 mb-1">Description:</div>
                  <p className="text-gray-600">{finding.description}</p>
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-1">Recommendation:</div>
                  <p className="text-gray-600">{finding.recommendation}</p>
                </div>
                {finding.cvssScore && (
                  <div>
                    <span className="font-medium text-gray-700">CVSS Score:</span>
                    <span className="ml-2 text-gray-600">{finding.cvssScore.toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {totalIssues > 0 && (
          <button
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            onClick={() => {
              alert('Export report functionality - would download a PDF or CSV report');
            }}
          >
            Export Report
          </button>
        )}
        <button
          onClick={onDismiss}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
