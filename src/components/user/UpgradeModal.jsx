/**
 * UpgradeModal Component
 * Premium feature upsell modal
 */

import React from 'react';
import Modal from '../common/Modal';

const Icon = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function UpgradeModal({ onClose, theme }) {
  const features = [
    {
      icon: '☁️',
      title: 'Unlimited Cloud Storage',
      description: 'Save unlimited networks to the cloud with automatic backups'
    },
    {
      icon: '🔗',
      title: 'Network Sharing & Collaboration',
      description: 'Share networks with your team and collaborate in real-time'
    },
    {
      icon: '📝',
      title: 'Version History',
      description: 'Track changes and restore previous versions of your networks'
    },
    {
      icon: '⚡',
      title: 'Auto-Save',
      description: 'Never lose work with automatic saving every few seconds'
    },
    {
      icon: '🔐',
      title: 'Advanced Permissions',
      description: 'Fine-grained access control with view and edit permissions'
    },
    {
      icon: '📊',
      title: 'Priority Support',
      description: 'Get help faster with dedicated premium support'
    }
  ];

  return (
    <Modal
      title="Upgrade to Premium"
      onClose={onClose}
      theme={theme}
      size="lg"
      showCloseButton={true}
    >
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
            Unlock Premium Features
          </h2>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Get the most out of NetMap with our premium plan
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border"
              style={{ borderColor: theme.border, background: theme.bg }}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="text-sm font-semibold mb-1" style={{ color: theme.text }}>
                {feature.title}
              </div>
              <div className="text-xs" style={{ color: theme.textSecondary }}>
                {feature.description}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mb-6 p-6 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="text-white text-sm mb-2 opacity-90">Premium Plan</div>
          <div className="text-white text-4xl font-bold mb-1">$9.99</div>
          <div className="text-white text-sm opacity-75">per month, billed monthly</div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              alert('Subscription management coming soon!\n\nContact your administrator to upgrade to Premium.');
              onClose();
            }}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg font-medium text-sm"
            style={{ background: theme.bg, color: theme.text }}
          >
            Maybe Later
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs" style={{ color: theme.textSecondary }}>
          <p>✓ Cancel anytime • ✓ 30-day money-back guarantee</p>
        </div>
      </div>
    </Modal>
  );
}
