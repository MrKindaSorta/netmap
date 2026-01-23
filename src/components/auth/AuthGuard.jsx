/**
 * Auth Guard Component
 * Shows login/signup modals when user is not authenticated
 * Renders children when authenticated
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Show login/signup modals when not authenticated
  if (!isAuthenticated) {
    return showLogin ? (
      <LoginModal onSwitchToSignup={() => setShowLogin(false)} />
    ) : (
      <SignupModal onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  // Render children when authenticated
  return <>{children}</>;
}
