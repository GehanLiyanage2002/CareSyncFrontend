import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const DEFAULT_SETTINGS = {
  contrast: 0,
  highlightLinks: false,
  biggerText: 0,
  textSpacing: 0,
  pauseAnimations: false,
  hideImages: false,
  dyslexiaFriendly: 0,
  bigCursor: 0,
  tooltips: false,
  lineHeight: 0,
  saturationLevel: 0,
  readingGuide: false,
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
  const [readingGuideY, setReadingGuideY] = useState(0);

  useEffect(() => {
    if (!settings.readingGuide) return;
    
    const handleMouseMove = (e) => {
      setReadingGuideY(e.clientY);
    };

    // Initialize to center of screen if no mouse movement yet
    setReadingGuideY(window.innerHeight / 2);

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings.readingGuide]);

  // Fetch settings from DB on login/mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (userInfo?.token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          };
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/accessibility`, config);
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
          await axios.put(`${import.meta.env.VITE_API_URL}/api/accessibility`, settings, config);
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

    let contrast = '100%';
    let brightness = '1';
    let invert = '0%';
    let hueRotate = '0deg';
    let saturate = '100%';

    switch (Number(settings.contrast)) {
      case 1: // Invert Colors
        invert = '100%';
        break;
      case 2: // Dark Contrast
        invert = '100%';
        hueRotate = '180deg';
        contrast = '150%';
        break;
      case 3: // Light Contrast
        contrast = '150%';
        brightness = '1.05';
        break;
      default:
        break;
    }

    switch (Number(settings.saturationLevel)) {
      case 1: saturate = '200%'; break; // High
      case 2: saturate = '50%'; break;  // Low
      case 3: saturate = '0%'; break;   // Monochrome
      default: break;
    }

    html.style.setProperty('--a11y-saturate', saturate);
    html.style.setProperty('--a11y-contrast', contrast);
    html.style.setProperty('--a11y-brightness', brightness);
    html.style.setProperty('--a11y-invert', invert);
    html.style.setProperty('--a11y-hue-rotate', hueRotate);

    // Highlight Links
    if (settings.highlightLinks) {
      html.classList.add('a11y-highlight-links');
    } else {
      html.classList.remove('a11y-highlight-links');
    }

    // Bigger Text
    if (Number(settings.biggerText) > 0) {
      const sizes = ['100%', '110%', '120%', '130%', '140%'];
      html.style.fontSize = sizes[Number(settings.biggerText)] || '120%';
    } else {
      html.style.fontSize = '';
    }

    // Text Spacing
    html.classList.remove('a11y-text-spacing', 'a11y-text-spacing-1', 'a11y-text-spacing-2', 'a11y-text-spacing-3');
    if (Number(settings.textSpacing) > 0) {
      html.classList.add(`a11y-text-spacing-${settings.textSpacing}`);
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

    // Dyslexia Friendly / Legible Fonts
    html.classList.remove('a11y-dyslexia', 'a11y-legible');
    if (Number(settings.dyslexiaFriendly) === 1) {
      html.classList.add('a11y-dyslexia');
    } else if (Number(settings.dyslexiaFriendly) === 2) {
      html.classList.add('a11y-legible');
    }

    // Big Cursor
    html.classList.remove('a11y-big-cursor-1', 'a11y-big-cursor-2', 'a11y-big-cursor-3');
    if (Number(settings.bigCursor) > 0) {
      html.classList.add(`a11y-big-cursor-${settings.bigCursor}`);
    }

    // Tooltips
    if (settings.tooltips) {
      html.classList.add('a11y-tooltips');
    } else {
      html.classList.remove('a11y-tooltips');
    }

    // Line Height
    html.classList.remove('a11y-line-height-1', 'a11y-line-height-2', 'a11y-line-height-3', 'a11y-line-height-4');
    if (Number(settings.lineHeight) > 0) {
      html.classList.add(`a11y-line-height-${settings.lineHeight}`);
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
          backdropFilter: `saturate(var(--a11y-saturate, 100%)) invert(var(--a11y-invert, 0%)) hue-rotate(var(--a11y-hue-rotate, 0deg)) contrast(var(--a11y-contrast, 100%)) brightness(var(--a11y-brightness, 100%))`,
          WebkitBackdropFilter: `saturate(var(--a11y-saturate, 100%)) invert(var(--a11y-invert, 0%)) hue-rotate(var(--a11y-hue-rotate, 0deg)) contrast(var(--a11y-contrast, 100%)) brightness(var(--a11y-brightness, 100%))`
        }}
      />
      
      {/* Reading Guide */}
      {settings.readingGuide && (
        <div 
          className="fixed left-0 right-0 z-[9998] pointer-events-none transition-transform duration-75 ease-out"
          style={{
            top: 0,
            height: '120px',
            transform: `translateY(${readingGuideY - 60}px)`,
            borderTop: '3px solid #3b82f6',
            borderBottom: '3px solid #3b82f6',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            boxShadow: '0 -200vh 0 200vh rgba(0,0,0,0.4), 0 200vh 0 200vh rgba(0,0,0,0.4)'
          }}
        />
      )}
      
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
};
