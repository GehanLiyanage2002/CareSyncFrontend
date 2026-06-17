import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const DEFAULT_SETTINGS = {
  contrast: false,
  highlightLinks: false,
  biggerText: false,
  textSpacing: false,
  pauseAnimations: false,
  hideImages: false,
  dyslexiaFriendly: false,
  bigCursor: false,
  tooltips: false,
  lineHeight: false,
  textAlign: 'default', // 'default' | 'left' | 'center' | 'right'
  saturation: 100,      // 0 = grayscale, 100 = normal, 200 = high
};

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('caresync_accessibility');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const { userInfo } = useSelector((state) => state.auth || {});
  const isInitialMount = useRef(true);

  // Fetch settings from DB on login/mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (userInfo?.token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          };
          const { data } = await axios.get('http://localhost:5000/api/accessibility', config);
          if (data && Object.keys(data).length > 0) {
            setSettings(prev => ({ ...prev, ...data }));
          }
        } catch (error) {
          console.error('Failed to fetch accessibility settings:', error);
        }
      }
    };
    fetchSettings();
  }, [userInfo]);

  // Persist to localStorage and debounce update to DB
  useEffect(() => {
    localStorage.setItem('caresync_accessibility', JSON.stringify(settings));

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timerId = setTimeout(async () => {
      if (userInfo?.token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          };
          await axios.put('http://localhost:5000/api/accessibility', settings, config);
        } catch (error) {
          console.error('Failed to sync accessibility settings:', error);
        }
      }
    }, 1000);

    return () => clearTimeout(timerId);
  }, [settings, userInfo]);

  // Apply CSS effects to <html> element
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Remove old direct filters that break fixed positioning
    body.style.filter = '';
    html.classList.remove('a11y-contrast');

    // Setup CSS variables for the overlay
    html.style.setProperty('--a11y-saturate', `${settings.saturation}%`);
    html.style.setProperty('--a11y-contrast', settings.contrast ? '150%' : '100%');
    html.style.setProperty('--a11y-brightness', settings.contrast ? '1.05' : '1');

    // Highlight Links
    if (settings.highlightLinks) {
      html.classList.add('a11y-highlight-links');
    } else {
      html.classList.remove('a11y-highlight-links');
    }

    // Bigger Text
    if (settings.biggerText) {
      html.style.fontSize = '120%';
    } else {
      html.style.fontSize = '';
    }

    // Text Spacing
    if (settings.textSpacing) {
      html.classList.add('a11y-text-spacing');
    } else {
      html.classList.remove('a11y-text-spacing');
    }

    // Pause Animations
    if (settings.pauseAnimations) {
      html.classList.add('a11y-pause-animations');
    } else {
      html.classList.remove('a11y-pause-animations');
    }

    // Hide Images
    if (settings.hideImages) {
      html.classList.add('a11y-hide-images');
    } else {
      html.classList.remove('a11y-hide-images');
    }

    // Dyslexia Friendly Font
    if (settings.dyslexiaFriendly) {
      html.classList.add('a11y-dyslexia');
    } else {
      html.classList.remove('a11y-dyslexia');
    }

    // Big Cursor
    if (settings.bigCursor) {
      html.classList.add('a11y-big-cursor');
    } else {
      html.classList.remove('a11y-big-cursor');
    }

    // Line Height
    if (settings.lineHeight) {
      html.classList.add('a11y-line-height');
    } else {
      html.classList.remove('a11y-line-height');
    }

    // Text Align
    html.classList.remove('a11y-align-left', 'a11y-align-center', 'a11y-align-right');
    if (settings.textAlign !== 'default') {
      html.classList.add(`a11y-align-${settings.textAlign}`);
    }
  }, [settings]);

  const toggle = useCallback((key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const set = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    document.documentElement.style.fontSize = '';
  }, []);

  return (
    <AccessibilityContext.Provider value={{ settings, toggle, set, reset }}>
      {/* Backdrop overlay for filters to prevent position:fixed breaking */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9990]"
        style={{
          backdropFilter: `saturate(var(--a11y-saturate, 100%)) contrast(var(--a11y-contrast, 100%)) brightness(var(--a11y-brightness, 100%))`,
          WebkitBackdropFilter: `saturate(var(--a11y-saturate, 100%)) contrast(var(--a11y-contrast, 100%)) brightness(var(--a11y-brightness, 100%))`
        }}
      />
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
};
