"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
  isDark: boolean;
  preset: string;
  setPreset: (preset: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  const [preset, setPresetState] = useState('default');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedPreset = localStorage.getItem('selected_theme_preset') || 'default';
    setTheme(savedTheme);
    setPresetState(savedPreset);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark', 'dark-mode');
      body.classList.add('dark', 'dark-mode');
    } else {
      root.classList.remove('dark', 'dark-mode');
      body.classList.remove('dark', 'dark-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const body = document.body;
    body.classList.remove('preset-default', 'preset-billboard', 'preset-insider', 'preset-people');
    if (preset !== 'default') {
      body.classList.add(`preset-${preset}`);
    }
    localStorage.setItem('selected_theme_preset', preset);
  }, [preset, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setPreset = (p: string) => {
    setPresetState(p);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', preset, setPreset }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
