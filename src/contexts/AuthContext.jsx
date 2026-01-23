/**
 * Authentication Context
 * Manages user authentication state and auth operations
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check authentication status on mount
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      setIsAuthenticated(true);

      // Store remember preference
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remember_me');
      }

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signup = useCallback(async (email, password) => {
    try {
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
      return { success: false, error: err.message, details: err.details };
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('remember_me');
    }
  }, []);

  /**
   * Refresh token
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        return true;
      } else {
        // Refresh failed, logout
        await logout();
        return false;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      await logout();
      return false;
    }
  }, [logout]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Setup token refresh interval (every 10 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  // Global fetch interceptor for 401 responses
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // Auto-logout on 401 (except for auth endpoints)
      if (response.status === 401 && !args[0].includes('/api/auth/')) {
        console.log('Unauthorized request, logging out');
        await logout();
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [logout]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    refreshToken,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
