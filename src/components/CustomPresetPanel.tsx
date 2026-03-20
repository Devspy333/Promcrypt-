import React, { useState } from 'react';
import TerminalButton from './TerminalButton';

export interface CustomPresetConfig {
  LuaVersion: string;
  VarNamePrefix: string;
  NameGenerator: string;
  PrettyPrint: boolean;
  Seed: number;
  MinLength: number;
  MaxLength: number;
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const updateStepSetting = (stepName: string, settingKey: string, value: any) => {
    onChange({
      ...config,
      Steps: config.Steps.map(s => {
        if (s.Name === stepName) {
          return { ...s, Settings: { ...s.Settings, [settingKey]: value } };
        }
        return s;
      })
    });
  };

  const handleNumberChange = (field: 'Seed' | 'MinLength' | 'MaxLength', value: string, min: number, max: number) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      setErrors(prev => ({ ...prev, [field]: 'Must be a number' }));
      return;
    }
    if (num < min || num > max) {
      setErrors(prev => ({ ...prev, [field]: `Must be between ${min} and ${max}` }));
      return;
    }
    
    // Additional validation for Min/Max Length
    if (field === 'MinLength' && num > config.MaxLength) {
      setErrors(prev => ({ ...prev, MinLength: 'Cannot be greater than Max Length' }));
      return;
    }
    if (field === 'MaxLength' && num < config.MinLength) {
      setErrors(prev => ({ ...prev, MaxLength: 'Cannot be less than Min Length' }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      if (field === 'MinLength' || field === 'MaxLength') {
        delete newErrors.MinLength;
        delete newErrors.MaxLength;
      }
      return newErrors;
    });

    onChange({ ...config, [field]: num });
  };

  return (
    <div className="border border-[#FF8C00] p-4 mt-4 bg-[#110800]">
      <h3 className="uppercase font-bold mb-4 border-b border-[#FF8C00] pb-2">Custom Preset Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm opacity-70 mb-2">Lua Version</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="luaVersion" 
                value="Lua51" 
                checked={config.LuaVersion === 'Lua51'}
                onChange={e => onChange({ ...config, LuaVersion: e.target.value })}
                className="accent-[#FF8C00]"
              />
              <span>Lua 5.1</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="luaVersion" 
                value="LuaU" 
                checked={config.LuaVersion === 'LuaU'}
                onChange={e => onChange({ ...config, LuaVersion: e.target.value })}
                className="accent-[#FF8C00]"
              />
              <span>Luau</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm opacity-70 mb-1">Name Generator</label>
          <select 
            className="bg-black border border-[#FF8C00] text-[#FF8C00] p-1 w-full"
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
            className="bg-black border border-[#FF8C00] text-[#FF8C00] p-1 w-full"
            value={config.VarNamePrefix}
            onChange={e => onChange({ ...config, VarNamePrefix: e.target.value })}
            placeholder="e.g. prom_"
          />
        </div>

        <div>
          <label className="block text-sm opacity-70 mb-1">Seed (0 = Random)</label>
          <input 
            type="number" 
            className={`bg-black border p-1 w-full ${errors.Seed ? 'border-red-500 text-red-500' : 'border-[#FF8C00] text-[#FF8C00]'}`}
            defaultValue={config.Seed}
            onChange={e => handleNumberChange('Seed', e.target.value, 0, Number.MAX_SAFE_INTEGER)}
            min="0"
          />
          {errors.Seed && <span className="text-red-500 text-xs">{errors.Seed}</span>}
        </div>

        <div>
          <label className="block text-sm opacity-70 mb-1">Min Length</label>
          <input 
            type="number" 
            className={`bg-black border p-1 w-full ${errors.MinLength ? 'border-red-500 text-red-500' : 'border-[#FF8C00] text-[#FF8C00]'}`}
            defaultValue={config.MinLength}
            onChange={e => handleNumberChange('MinLength', e.target.value, 1, 32)}
            min="1" max="32"
          />
          {errors.MinLength && <span className="text-red-500 text-xs">{errors.MinLength}</span>}
        </div>

        <div>
          <label className="block text-sm opacity-70 mb-1">Max Length</label>
          <input 
            type="number" 
            className={`bg-black border p-1 w-full ${errors.MaxLength ? 'border-red-500 text-red-500' : 'border-[#FF8C00] text-[#FF8C00]'}`}
            defaultValue={config.MaxLength}
            onChange={e => handleNumberChange('MaxLength', e.target.value, 1, 32)}
            min="1" max="32"
          />
          {errors.MaxLength && <span className="text-red-500 text-xs">{errors.MaxLength}</span>}
        </div>

        <div className="flex items-center mt-6">
          <input 
            type="checkbox" 
            id="prettyPrint"
            className="mr-2 accent-[#FF8C00]"
            checked={config.PrettyPrint}
            onChange={e => onChange({ ...config, PrettyPrint: e.target.checked })}
          />
          <label htmlFor="prettyPrint" className="text-sm">Pretty Print Output</label>
        </div>
      </div>

      <h4 className="uppercase font-bold mb-2 text-sm">Obfuscation Steps</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {AVAILABLE_STEPS.map(step => {
          const isActive = config.Steps.some(s => s.Name === step);
          return (
            <TerminalButton
              key={step}
              onClick={() => handleStepToggle(step)}
              className={`text-xs ${isActive ? 'bg-[#FF8C00] text-black font-bold' : 'opacity-70'}`}
            >
              {step}
            </TerminalButton>
          );
        })}
      </div>
      
      {config.Steps.length === 0 && (
        <p className="text-xs opacity-50 mt-2 italic">No steps selected. Code will only be minified/renamed.</p>
      )}

      {config.Steps.length > 0 && (
        <div className="mt-6 border-t border-[#FF8C00]/30 pt-4">
          <h4 className="uppercase font-bold mb-4 text-sm">Step Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.Steps.map(step => (
              <div key={step.Name} className="border border-[#FF8C00]/50 p-3 bg-black/50">
                <h5 className="font-bold text-[#FF8C00] mb-2">{step.Name}</h5>
                {Object.keys(step.Settings).length === 0 ? (
                  <p className="text-xs opacity-50 italic">No configurable settings.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(step.Settings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <label className="opacity-80">{key}</label>
                        {typeof value === 'boolean' ? (
                          <input 
                            type="checkbox" 
                            checked={value}
                            onChange={e => updateStepSetting(step.Name, key, e.target.checked)}
                            className="accent-[#FF8C00]"
                          />
                        ) : typeof value === 'number' ? (
                          <input 
                            type="number" 
                            value={value}
                            onChange={e => updateStepSetting(step.Name, key, Number(e.target.value))}
                            className="bg-black border border-[#FF8C00] text-[#FF8C00] p-1 w-20 text-right"
                          />
                        ) : (
                          <input 
                            type="text" 
                            value={value as string}
                            onChange={e => updateStepSetting(step.Name, key, e.target.value)}
                            className="bg-black border border-[#FF8C00] text-[#FF8C00] p-1 w-32"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
