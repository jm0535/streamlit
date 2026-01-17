'use client';

import { useEffect, useCallback } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Cmd on Mac
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
};

/**
 * Keyboard Shortcuts Hook
 *
 * Provides global keyboard shortcuts for power users:
 * - Space: Play/Pause audio
 * - Cmd/Ctrl + E: Export
 * - Cmd/Ctrl + S: Save project
 * - Cmd/Ctrl + O: Open file
 * - Cmd/Ctrl + Shift + N: New project
 * - Escape: Close modals
 * - ? : Show help
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape in inputs
        if (event.key !== 'Escape') return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const metaMatch = shortcut.meta ? event.metaKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey || shortcut.shift === undefined;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        // For shortcuts requiring modifiers, check they're pressed
        const needsModifier = shortcut.ctrl || shortcut.meta;
        const hasModifier = event.ctrlKey || event.metaKey;

        if (needsModifier && !hasModifier) continue;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Default app-wide shortcuts
 */
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: ' ',
    handler: () => {
      // Dispatch custom event for play/pause
      window.dispatchEvent(new CustomEvent('togglePlayback'));
    },
    description: 'Play/Pause audio',
  },
  {
    key: 'Escape',
    handler: () => {
      // Close any open modals
      window.dispatchEvent(new CustomEvent('closeModals'));
    },
    description: 'Close modal/dialog',
  },
  {
    key: '/',
    shift: true,
    handler: () => {
      window.dispatchEvent(new CustomEvent('showHelp'));
    },
    description: 'Show keyboard shortcuts',
  },
];

/**
 * Audio page shortcuts
 */
export const AUDIO_SHORTCUTS: KeyboardShortcut[] = [
  ...DEFAULT_SHORTCUTS,
  {
    key: 'e',
    ctrl: true,
    handler: () => {
      window.dispatchEvent(new CustomEvent('exportAudio'));
    },
    description: 'Export audio/MIDI',
  },
  {
    key: 's',
    ctrl: true,
    handler: () => {
      window.dispatchEvent(new CustomEvent('saveProject'));
    },
    description: 'Save project',
  },
  {
    key: 'o',
    ctrl: true,
    handler: () => {
      window.dispatchEvent(new CustomEvent('openFile'));
    },
    description: 'Open file',
  },
  {
    key: 'ArrowLeft',
    handler: () => {
      window.dispatchEvent(new CustomEvent('seekBackward'));
    },
    description: 'Seek backward 5s',
  },
  {
    key: 'ArrowRight',
    handler: () => {
      window.dispatchEvent(new CustomEvent('seekForward'));
    },
    description: 'Seek forward 5s',
  },
  {
    key: 'm',
    handler: () => {
      window.dispatchEvent(new CustomEvent('toggleMute'));
    },
    description: 'Toggle mute',
  },
];

/**
 * Notes editor shortcuts
 */
export const NOTES_SHORTCUTS: KeyboardShortcut[] = [
  ...AUDIO_SHORTCUTS,
  {
    key: 'Delete',
    handler: () => {
      window.dispatchEvent(new CustomEvent('deleteSelectedNotes'));
    },
    description: 'Delete selected notes',
  },
  {
    key: 'a',
    ctrl: true,
    handler: () => {
      window.dispatchEvent(new CustomEvent('selectAllNotes'));
    },
    description: 'Select all notes',
  },
  {
    key: 'z',
    ctrl: true,
    handler: () => {
      window.dispatchEvent(new CustomEvent('undo'));
    },
    description: 'Undo',
  },
  {
    key: 'z',
    ctrl: true,
    shift: true,
    handler: () => {
      window.dispatchEvent(new CustomEvent('redo'));
    },
    description: 'Redo',
  },
];

/**
 * Format shortcut key for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  // Format special keys
  let key = shortcut.key;
  switch (key) {
    case ' ':
      key = 'Space';
      break;
    case 'ArrowLeft':
      key = '←';
      break;
    case 'ArrowRight':
      key = '→';
      break;
    case 'ArrowUp':
      key = '↑';
      break;
    case 'ArrowDown':
      key = '↓';
      break;
    case 'Escape':
      key = 'Esc';
      break;
    case 'Delete':
      key = 'Del';
      break;
    default:
      key = key.toUpperCase();
  }

  parts.push(key);
  return parts.join(isMac ? '' : '+');
}

export default useKeyboardShortcuts;
