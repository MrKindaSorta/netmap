/**
 * Login Modal Component
 * Email + password login with "Remember me" option
 */

import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';

// Light theme for auth modals
const lightTheme = {
  surface: '#ffffff',
  text: '#1a1a1a',
  border: '#e5e7eb',
  inputBg: '#f9fafb',
  primary: '#3b82f6',
  error: '#ef4444'
};

export default function LoginModal({ onSwitchToSignup }) {
  const { login, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }

      const result = await login(formData.email, formData.password, formData.rememberMe);

      if (!result.success) {
        setError(result.error || 'Login failed');
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
      title="Sign In to NetMap"
      onClose={() => {}} // No close button - must log in
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
              color: lightTheme.text,
              outline: 'none',
              boxShadow: 'none'
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
              color: lightTheme.text,
              outline: 'none',
              boxShadow: 'none'
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
            autoComplete="current-password"
            required
          />
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isLoading}
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 text-sm"
            style={{ color: lightTheme.text }}
          >
            Remember me
          </label>
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
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Switch to Sign Up */}
        <div className="text-center text-sm" style={{ color: lightTheme.text }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-medium hover:underline"
            style={{ color: lightTheme.primary }}
            disabled={isLoading}
          >
            Sign up
          </button>
        </div>
      </form>
    </Modal>
  );
}
