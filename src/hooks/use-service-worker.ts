'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Hook
 *
 * Registers the service worker for offline support.
 * Critical for fieldwork in PNG with unreliable connectivity.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return;
    }

    // Only register in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Service worker disabled in development');
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service worker registered:', registration.scope);

        // Handle updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content available
                console.log('New version available! Refresh to update.');

                // Optional: Show toast notification
                window.dispatchEvent(new CustomEvent('swUpdate', {
                  detail: { registration }
                }));
              } else {
                console.log('Content cached for offline use.');
              }
            }
          };
        };
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    // Register after page load
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);
}

/**
 * Skip waiting and activate new service worker
 */
export function activateNewServiceWorker() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

/**
 * Clear service worker cache
 */
export async function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }

  // Also clear caches directly
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
  }
}

export default useServiceWorker;
