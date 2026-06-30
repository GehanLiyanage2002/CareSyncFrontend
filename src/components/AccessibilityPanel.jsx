import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  SunMedium, Link, Type, AlignJustify, PauseCircle, ImageOff,
  BookOpen, MousePointer2, MessageSquare, AlignLeft, AlignCenter,
  AlignRight, Droplets, RotateCcw, Settings2, X, ChevronUp,
  Accessibility, Focus
} from 'lucide-react';

const ToolButton = ({ active, onClick, icon: Icon, label, level, maxLevels }) => (
  <button
    onClick={onClick}
    title={label}
    aria-pressed={active}
    className={`flex flex-col items-center justify-center gap-[6px] p-[12px] pb-[16px] rounded-[12px] border-2 transition-all duration-200 text-center w-full relative
      ${active
        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
        : 'bg-white border-gray-100 text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
      }`}
  >
    <Icon size={20} strokeWidth={1.8} />
    <span className="text-[11px] font-semibold leading-tight">{label}</span>
    
    {maxLevels && (
      <div className="absolute bottom-[6px] flex gap-[4px] justify-center w-full px-[24px]">
        {Array.from({ length: maxLevels }).map((_, i) => (
          <div 
            key={i}
            className={`h-[3px] flex-1 rounded-full ${
              active 
                ? (i < level ? 'bg-white' : 'bg-blue-400/50')
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    )}
  </button>
);



const AccessibilityPanel = () => {
  const [open, setOpen] = useState(false);
  const { settings, toggle, set, reset } = useAccessibility();



  const tools = [
    { key: 'saturationLevel', icon: Droplets, label: 'Saturation', maxLevels: 3, levelLabels: ['High Saturation', 'Low Saturation', 'Monochrome'] },
    { key: 'contrast', icon: SunMedium, label: 'Contrast +', maxLevels: 3, levelLabels: ['Invert Colors', 'Dark Contrast', 'Light Contrast'] },
    { key: 'highlightLinks', icon: Link, label: 'Highlight Links' },
    { key: 'biggerText', icon: Type, label: 'Bigger Text', maxLevels: 4 },
    { key: 'textSpacing', icon: AlignJustify, label: 'Text Spacing', maxLevels: 3, levelLabels: ['Light Spacing', 'Moderate Spacing', 'Max Spacing'] },
    { key: 'pauseAnimations', icon: PauseCircle, label: 'Pause Animations' },
    { key: 'hideImages', icon: ImageOff, label: 'Hide Images' },
    { key: 'dyslexiaFriendly', icon: BookOpen, label: 'Dyslexia Friendly', maxLevels: 2, levelLabels: ['Dyslexia Friendly', 'Legible Fonts'] },
    { key: 'bigCursor', icon: MousePointer2, label: 'Cursor' },
    { key: 'tooltips', icon: MessageSquare, label: 'Tooltips' },
    { key: 'lineHeight', icon: ChevronUp, label: 'Line Height', maxLevels: 4, levelLabels: ['1.5x Spacing', '1.75x Spacing', '2.0x Spacing', '2.25x Spacing'] },
    { key: 'readingGuide', icon: Focus, label: 'Reading Guide' },
  ];

  const activeCount = Object.entries(settings).filter(([k, v]) => {
    if (k === 'biggerText' || k === 'contrast' || k === 'dyslexiaFriendly' || k === 'saturationLevel' || k === 'textSpacing' || k === 'lineHeight') return v > 0;
    return v === true;
  }).length;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="a11y-trigger-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Accessibility Settings"
        title="Accessibility Settings"
        className="fixed bottom-[24px] left-[24px] z-[99999] w-[56px] h-[56px] rounded-full bg-blue-600 text-white shadow-lg shadow-blue-300/50 flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all duration-200"
        
      >
        <Accessibility size={26} strokeWidth={1.8} />
        {activeCount > 0 && (
          <span className="absolute -top-[4px] -right-[4px] w-[20px] h-[20px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <div
        id="a11y-panel"
        className={`a11y-no-align fixed bottom-[80px] left-[24px] z-[9999] w-[260px] bg-white rounded-[16px] shadow-2xl shadow-blue-100/60 border border-gray-100 transition-all duration-300 ease-out overflow-hidden
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', transform: open ? 'translateY(0)' : 'translateY(16px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[16px] py-[14px] bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div className="flex items-center gap-[8px]">
            <Settings2 size={18} />
            <span className="font-bold text-[14px]">Accessibility</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="hover:bg-white/20 rounded-full p-[4px] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tool Grid */}
        <div className="p-[12px] grid grid-cols-2 gap-[8px]">
          {tools.map(({ key, icon, label, maxLevels, levelLabels }) => {
            // Handle number-based settings like biggerText
            const isActive = maxLevels ? (settings[key] > 0) : settings[key];
            const handlePress = () => {
              if (maxLevels) {
                set(key, (Number(settings[key]) || 0) + 1 > maxLevels ? 0 : (Number(settings[key]) || 0) + 1);
              } else {
                toggle(key);
              }
            };
            
            const displayLabel = isActive && levelLabels && levelLabels[settings[key] - 1] 
              ? levelLabels[settings[key] - 1] 
              : label;

            return (
              <ToolButton
                key={key}
                active={isActive}
                level={maxLevels ? settings[key] : null}
                maxLevels={maxLevels}
                onClick={handlePress}
                icon={icon}
                label={displayLabel}
              />
            );
          })}
        </div>





        {/* Reset Button */}
        <div className="px-[12px] pb-[12px] pt-[8px]">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-[8px] px-[8px] py-[10px] bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-[12px] transition-all duration-200 shadow-md shadow-blue-200"
          >
            <RotateCcw size={16} className="shrink-0" />
            <span className="text-center leading-tight">Reset All Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AccessibilityPanel;
