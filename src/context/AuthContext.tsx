"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: any; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; user?: any; message?: string }>;
  logout: () => void;
  updateProfile: (userData: any) => Promise<{ success: boolean; message?: string }>;
  getProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error: any) {
        console.error('Failed to reload profile:', error.message);
      }
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error: any) {
          console.error('Failed to load user:', error.message);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Check your network or credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.register({ name, email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData: any) => {
    try {
      const response = await authAPI.updateMe(userData);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Update failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed.'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, getProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
