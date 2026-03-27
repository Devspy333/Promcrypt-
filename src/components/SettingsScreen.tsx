import React from 'react';
import { motion } from 'motion/react';
import { useTheme, COLOR_MAP, ThemeColor, ThemeMode } from '../contexts/ThemeContext';
import TerminalButton from './TerminalButton';

export default function SettingsScreen() {
  const { color, mode, setColor, setMode } = useTheme();

  const colors: ThemeColor[] = ['orange', 'green', 'blue', 'red', 'purple', 'cyan', 'yellow', 'pink'];
  const modes: ThemeMode[] = ['dark', 'light', 'system'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border-2 border-primary p-6 mb-6 shadow-[0_0_10px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)] max-h-[600px] overflow-y-auto bg-bg-base"
    >
      <h2 className="text-2xl font-bold mb-6 uppercase text-primary border-b border-primary pb-2">Settings</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 uppercase">Theme Color</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`flex items-center gap-2 p-3 border transition-all ${
                color === c 
                  ? 'border-primary bg-primary text-bg-base font-bold shadow-[0_0_10px_var(--theme-primary)]' 
                  : 'border-primary/50 hover:border-primary hover:bg-primary/10'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border border-current"
                style={{ backgroundColor: COLOR_MAP[c] }}
              />
              <span className="uppercase text-sm">{c}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 uppercase">Display Mode</h3>
        <div className="flex flex-wrap gap-4">
          {modes.map(m => (
            <TerminalButton
              key={m}
              onClick={() => setMode(m)}
              className={mode === m ? 'bg-primary text-bg-base font-bold' : ''}
            >
              {m} Mode
            </TerminalButton>
          ))}
        </div>
      </div>

      <div className="mb-8 p-4 border border-dashed border-primary/50 bg-primary/5 rounded-lg">
        <h3 className="text-lg font-bold mb-2 uppercase text-primary/80">More Coming Soon...</h3>
        <p className="text-sm opacity-70">We are working on adding more customization options and advanced settings. Stay tuned for future updates!</p>
      </div>
      
      <div className="mt-8 pt-4 border-t border-primary/30 text-sm opacity-70">
        <p>Settings are automatically saved to your browser's local storage.</p>
      </div>
    </motion.div>
  );
}
