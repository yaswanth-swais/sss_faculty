"use client";

/**
 * AuthContext — Mock Authentication Provider
 *
 * Manages login/logout state with localStorage persistence.
 * TODO: Replace with real JWT/session-based auth via FastAPI backend.
 *
 * Expected backend endpoints:
 *   POST /api/auth/login   — returns JWT token + user profile
 *   POST /api/auth/logout  — invalidates the session
 *   GET  /api/auth/me      — returns current user from token
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginTeacher, logoutTeacher } from "@/lib/api";

const AuthContext = createContext(undefined);

const STORAGE_KEY = "swais_faculty_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log in with email and password.
   * TODO: Replace with API call — POST /api/auth/login
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginTeacher(email, password);

      if (result.success) {
        setUser(result.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = "An unexpected error occurred. Please try again.";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out the current user — calls backend then clears local state.
   */
  const logout = useCallback(async () => {
    await logoutTeacher(); // clears TOKEN_KEY from localStorage
    setUser(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
