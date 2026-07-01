import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  SunMedium, Link, Type, AlignJustify, PauseCircle, ImageOff,
  BookOpen, MousePointer2, MessageSquare, AlignLeft, AlignCenter,
  AlignRight, Droplets, RotateCcw, Settings2, X, ChevronUp,
  Accessibility
} from 'lucide-react';

const ToolButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    title={label}
    aria-pressed={active}
    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center w-full
      ${active
        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
        : 'bg-white dark:bg-gray-800 border-gray-100 text-gray-700 dark:text-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
      }`}
  >
    <Icon size={20} strokeWidth={1.8} />
    <span className="text-[11px] font-semibold leading-tight">{label}</span>
  </button>
);

const SliderRow = ({ label, value, min, max, step, onChange, icon: Icon }) => (
  <div className="px-1">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
        <Icon size={14} />
        {label}
      </div>
      <span className="text-xs text-blue-600 font-bold">{value}{label === 'Saturation' ? '%' : ''}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-blue-600 h-1.5 rounded-full"
    />
  </div>
);

const AccessibilityPanel = () => {
  const [open, setOpen] = useState(false);
  const { settings, toggle, set, reset } = useAccessibility();

  const textAlignOptions = [
    { value: 'default', icon: AlignJustify, label: 'Default' },
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
  ];

  const tools = [
    { key: 'contrast', icon: SunMedium, label: 'Contrast +' },
    { key: 'highlightLinks', icon: Link, label: 'Highlight Links' },
    { key: 'biggerText', icon: Type, label: 'Bigger Text' },
    { key: 'textSpacing', icon: AlignJustify, label: 'Text Spacing' },
    { key: 'pauseAnimations', icon: PauseCircle, label: 'Pause Animations' },
    { key: 'hideImages', icon: ImageOff, label: 'Hide Images' },
    { key: 'dyslexiaFriendly', icon: BookOpen, label: 'Dyslexia Friendly' },
    { key: 'bigCursor', icon: MousePointer2, label: 'Cursor' },
    { key: 'tooltips', icon: MessageSquare, label: 'Tooltips' },
    { key: 'lineHeight', icon: ChevronUp, label: 'Line Height' },
  ];

  const activeCount = Object.entries(settings).filter(([k, v]) => {
    if (k === 'saturation') return v !== 100;
    if (k === 'textAlign') return v !== 'default';
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
        className="fixed bottom-6 left-6 z-[99999] w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-300/50 flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all duration-200"
      >
        <Accessibility size={26} strokeWidth={1.8} />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9998] bg-black/10 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed bottom-20 left-6 z-[9999] w-[260px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-blue-100/60 border border-gray-100 transition-all duration-300 ease-out overflow-hidden
          ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div className="flex items-center gap-2">
            <Settings2 size={18} />
            <span className="font-bold text-sm">Accessibility</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="hover:bg-white dark:bg-gray-800/20 rounded-full p-1 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tool Grid */}
        <div className="p-3 grid grid-cols-2 gap-2">
          {tools.map(({ key, icon, label }) => (
            <ToolButton
              key={key}
              active={settings[key]}
              onClick={() => toggle(key)}
              icon={icon}
              label={label}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-gray-100 my-1" />

        {/* Text Align */}
        <div className="px-3 py-2">
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Text Align</p>
          <div className="grid grid-cols-4 gap-1">
            {textAlignOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => set('textAlign', value)}
                title={label}
                className={`flex flex-col items-center justify-center py-2 rounded-lg border-2 transition-all text-[10px] font-semibold gap-1
                  ${settings.textAlign === value
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-100 text-gray-500 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600'
                  }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-gray-100 my-1" />

        {/* Saturation Slider */}
        <div className="px-3 py-2 space-y-3">
          <SliderRow
            label="Saturation"
            value={settings.saturation}
            min={0}
            max={200}
            step={10}
            onChange={v => set('saturation', v)}
            icon={Droplets}
          />
        </div>

        {/* Reset Button */}
        <div className="px-3 pb-3 pt-2">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md shadow-blue-200"
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
