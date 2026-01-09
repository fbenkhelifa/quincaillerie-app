/**
 * Keyboard Shortcuts Hook
 * =======================
 * Global keyboard shortcuts for premium UX (Cmd/Ctrl + K for search, Esc for dialogs, etc)
 */

import { useEffect, useCallback } from 'react';

const DEFAULT_SHORTCUTS = {
  'cmd+k': 'global-search',
  'ctrl+k': 'global-search',
  'escape': 'close-dialogs',
};

/**
 * useKeyboardShortcuts
 * Register global keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts = {}) {
  const allShortcuts = { ...DEFAULT_SHORTCUTS, ...shortcuts };

  const handleKeyDown = useCallback(
    (e) => {
      // Don't trigger in input fields unless explicitly allowed
      const target = e.target;
      const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      
      if (isInput && !e.key === 'k') {
        return;
      }

      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + K for search
      if (modKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const handler = window.__shortcutHandlers?.['global-search'];
        if (handler) handler();
      }

      // Escape for closing dialogs
      if (e.key === 'Escape') {
        const handler = window.__shortcutHandlers?.['close-dialogs'];
        if (handler) handler();
      }
    },
    []
  );

  useEffect(() => {
    // Initialize global handler registry
    if (!window.__shortcutHandlers) {
      window.__shortcutHandlers = {};
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Register a shortcut handler
 */
export function registerShortcutHandler(key, handler) {
  if (!window.__shortcutHandlers) {
    window.__shortcutHandlers = {};
  }
  window.__shortcutHandlers[key] = handler;
}

/**
 * Unregister a shortcut handler
 */
export function unregisterShortcutHandler(key) {
  if (window.__shortcutHandlers) {
    delete window.__shortcutHandlers[key];
  }
}
