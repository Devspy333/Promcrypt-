import React from 'react';
import TerminalButton from './TerminalButton';

export interface CustomPresetConfig {
  LuaVersion: string;
  VarNamePrefix: string;
  NameGenerator: string;
  PrettyPrint: boolean;
  Seed: number;
  Steps: { Name: string; Settings: any }[];
}

interface Props {
  config: CustomPresetConfig;
  onChange: (config: CustomPresetConfig) => void;
}

const AVAILABLE_STEPS = [
  'Vmify',
  'ConstantArray',
  'WrapInFunction',
  'EncryptStrings',
  'AntiTamper',
  'NumbersToExpressions'
];

export default function CustomPresetPanel({ config, onChange }: Props) {
  const handleStepToggle = (stepName: string) => {
    const exists = config.Steps.find(s => s.Name === stepName);
    if (exists) {
      onChange({
        ...config,
        Steps: config.Steps.filter(s => s.Name !== stepName)
      });
    } else {
      let defaultSettings = {};
      if (stepName === 'ConstantArray') {
        defaultSettings = { Treshold: 1, StringsOnly: true, Shuffle: true, Rotate: true, LocalWrapperTreshold: 0 };
      } else if (stepName === 'AntiTamper') {
        defaultSettings = { UseDebug: false };
      }
      onChange({
        ...config,
        Steps: [...config.Steps, { Name: stepName, Settings: defaultSettings }]
      });
    }
  };

  return (
    <div className="border border-[#00FF00] p-4 mt-4 bg-[#001100]">
      <h3 className="uppercase font-bold mb-4 border-b border-[#00FF00] pb-2">Custom Preset Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm opacity-70 mb-1">Lua Version</label>
          <select 
            className="bg-black border border-[#00FF00] text-[#00FF00] p-1 w-full"
            value={config.LuaVersion}
            onChange={e => onChange({ ...config, LuaVersion: e.target.value })}
          >
            <option value="Lua51">Lua 5.1</option>
            <option value="LuaU">Luau</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm opacity-70 mb-1">Name Generator</label>
          <select 
            className="bg-black border border-[#00FF00] text-[#00FF00] p-1 w-full"
            value={config.NameGenerator}
            onChange={e => onChange({ ...config, NameGenerator: e.target.value })}
          >
            <option value="MangledShuffled">Mangled Shuffled</option>
            <option value="Mangled">Mangled</option>
            <option value="Il">Il (IlI1lI1l)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm opacity-70 mb-1">Var Name Prefix</label>
          <input 
            type="text" 
            className="bg-black border border-[#00FF00] text-[#00FF00] p-1 w-full"
            value={config.VarNamePrefix}
            onChange={e => onChange({ ...config, VarNamePrefix: e.target.value })}
            placeholder="e.g. prom_"
          />
        </div>

        <div className="flex items-center mt-6">
          <input 
            type="checkbox" 
            id="prettyPrint"
            className="mr-2 accent-[#00FF00]"
            checked={config.PrettyPrint}
            onChange={e => onChange({ ...config, PrettyPrint: e.target.checked })}
          />
          <label htmlFor="prettyPrint" className="text-sm">Pretty Print Output</label>
        </div>
      </div>

      <h4 className="uppercase font-bold mb-2 text-sm">Obfuscation Steps</h4>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_STEPS.map(step => {
          const isActive = config.Steps.some(s => s.Name === step);
          return (
            <TerminalButton
              key={step}
              onClick={() => handleStepToggle(step)}
              className={`text-xs ${isActive ? 'bg-[#00FF00] text-black font-bold' : 'opacity-70'}`}
            >
              {step}
            </TerminalButton>
          );
        })}
      </div>
      
      {config.Steps.length === 0 && (
        <p className="text-xs opacity-50 mt-2 italic">No steps selected. Code will only be minified/renamed.</p>
      )}
    </div>
  );
}
