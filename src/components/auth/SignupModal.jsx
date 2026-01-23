/**
 * Signup Modal Component
 * Email + password signup with password strength indicator
 */

import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';

// Light theme for auth modals
const lightTheme = {
  surface: '#ffffff',
  text: '#1a1a1a',
  border: '#e5e7eb',
  inputBg: '#f9fafb',
  primary: '#3b82f6',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981'
};

export default function SignupModal({ onSwitchToLogin }) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Password strength validation
  const passwordStrength = useMemo(() => {
    const { password } = formData;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (strength <= 2) {
      return { strength, label: 'Weak', color: lightTheme.error };
    } else if (strength <= 3) {
      return { strength, label: 'Fair', color: lightTheme.warning };
    } else if (strength === 4) {
      return { strength, label: 'Good', color: lightTheme.success };
    } else {
      return { strength, label: 'Strong', color: lightTheme.success };
    }
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validation
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('All fields are required');
        setIsLoading(false);
        return;
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Password match check
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Password length check
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        setIsLoading(false);
        return;
      }

      const result = await signup(formData.email, formData.password);

      if (!result.success) {
        if (result.details && Array.isArray(result.details)) {
          setError(result.details.join('. '));
        } else {
          setError(result.error || 'Signup failed');
        }
      }
      // On success, AuthGuard will automatically hide this modal
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Create Your Account"
      onClose={() => {}} // No close button - must sign up or switch to login
      theme={lightTheme}
      size="sm"
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1"
            style={{ color: lightTheme.text }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              background: lightTheme.inputBg,
              borderColor: lightTheme.border,
              color: lightTheme.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = lightTheme.primary;
              e.target.style.boxShadow = `0 0 0 2px ${lightTheme.primary}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = lightTheme.border;
              e.target.style.boxShadow = 'none';
            }}
            disabled={isLoading}
            autoComplete="email"
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1"
            style={{ color: lightTheme.text }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              background: lightTheme.inputBg,
              borderColor: lightTheme.border,
              color: lightTheme.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = lightTheme.primary;
              e.target.style.boxShadow = `0 0 0 2px ${lightTheme.primary}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = lightTheme.border;
              e.target.style.boxShadow = 'none';
            }}
            disabled={isLoading}
            autoComplete="new-password"
            required
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span style={{ color: lightTheme.text }}>Password strength:</span>
                <span style={{ color: passwordStrength.color }} className="font-medium">
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(passwordStrength.strength / 5) * 100}%`,
                    background: passwordStrength.color
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-1"
            style={{ color: lightTheme.text }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              background: lightTheme.inputBg,
              borderColor: lightTheme.border,
              color: lightTheme.text
            }}
            onFocus={(e) => {
              e.target.style.borderColor = lightTheme.primary;
              e.target.style.boxShadow = `0 0 0 2px ${lightTheme.primary}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = lightTheme.border;
              e.target.style.boxShadow = 'none';
            }}
            disabled={isLoading}
            autoComplete="new-password"
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              background: `${lightTheme.error}10`,
              color: lightTheme.error,
              border: `1px solid ${lightTheme.error}30`
            }}
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg font-medium transition-colors"
          style={{
            background: lightTheme.primary,
            color: 'white',
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>

        {/* Switch to Login */}
        <div className="text-center text-sm" style={{ color: lightTheme.text }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium hover:underline"
            style={{ color: lightTheme.primary }}
            disabled={isLoading}
          >
            Sign in
          </button>
        </div>
      </form>
    </Modal>
  );
}
