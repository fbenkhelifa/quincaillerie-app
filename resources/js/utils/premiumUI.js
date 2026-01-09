/**
 * Premium UI Utils
 * ================
 * Helper functions and patterns for premium SaaS styling.
 */

import { alpha, useTheme } from '@mui/material';

/**
 * Get surface elevation styles
 * Provides consistent paper/card styling with appropriate shadows and borders
 */
export const getSurfaceElevationStyles = (elevation = 'base') => {
  const elevations = {
    base: {
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid',
      borderColor: 'divider',
    },
    elevated: {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid',
      borderColor: 'divider',
    },
    prominent: {
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid',
      borderColor: 'divider',
    },
  };
  return elevations[elevation] || elevations.base;
};

/**
 * Get interactive element styles
 */
export const getInteractiveStyles = (theme) => ({
  hoverScale: {
    transition: `transform 150ms ${theme.transitions.easing.easeInOut}`,
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  activeIndicator: {
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: theme.palette.primary.main,
      borderRadius: '0 2px 2px 0',
    },
  },
  focusRing: {
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },
  },
});

/**
 * Get status badge styles
 */
export const getStatusColor = (status) => {
  const statuses = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
    completed: 'success',
    cancelled: 'error',
    draft: 'default',
    shipped: 'info',
    delivered: 'success',
    low_stock: 'warning',
    out_of_stock: 'error',
    in_stock: 'success',
  };
  return statuses[status?.toLowerCase?.()] || 'default';
};

/**
 * Format currency
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format percentage with proper decimal places
 */
export const formatPercent = (value, decimals = 1) => {
  if (typeof value !== 'number') return value;
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Get trend color and icon
 */
export const getTrendInfo = (change) => {
  const isPositive = change >= 0;
  return {
    color: isPositive ? 'success.main' : 'error.main',
    icon: isPositive ? '↑' : '↓',
    text: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
  };
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (typeof text !== 'string') return text;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Sleep utility for async operations
 */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Debounce function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

/**
 * Safe localStorage operations
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
