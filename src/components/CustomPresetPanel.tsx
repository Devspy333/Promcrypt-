import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
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
  const [savedPresets, setSavedPresets] = useState<Record<string, CustomPresetConfig>>({});
  const [presetName, setPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [selectedStepToAdd, setSelectedStepToAdd] = useState<string>(AVAILABLE_STEPS[0]);

  useEffect(() => {
    const loaded = localStorage.getItem('customPresets');
    if (loaded) {
      try {
        setSavedPresets(JSON.parse(loaded));
      } catch (e) {
        console.error('Failed to load presets', e);
      }
    }
  }, []);

  const savePreset = () => {
    if (!presetName.trim()) return;
    const newPresets = { ...savedPresets, [presetName]: config };
    setSavedPresets(newPresets);
    localStorage.setItem('customPresets', JSON.stringify(newPresets));
    setShowSaveDialog(false);
    setPresetName('');
  };

  const loadPreset = (name: string) => {
    if (savedPresets[name]) {
      onChange(savedPresets[name]);
      setShowLoadDialog(false);
    }
  };

  const deletePreset = (name: string) => {
    const newPresets = { ...savedPresets };
    delete newPresets[name];
    setSavedPresets(newPresets);
    localStorage.setItem('customPresets', JSON.stringify(newPresets));
  };

  const addStep = (stepName: string) => {
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
  };

  const removeStep = (index: number) => {
    const newSteps = [...config.Steps];
    newSteps.splice(index, 1);
    onChange({ ...config, Steps: newSteps });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === config.Steps.length - 1) return;
    
    const newSteps = [...config.Steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    
    onChange({ ...config, Steps: newSteps });
  };

  const updateStepSetting = (index: number, settingKey: string, value: any) => {
    const newSteps = [...config.Steps];
    newSteps[index] = {
      ...newSteps[index],
      Settings: { ...newSteps[index].Settings, [settingKey]: value }
    };
    onChange({ ...config, Steps: newSteps });
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
    <div className="border border-primary p-4 mt-4 bg-panel relative">
      <div className="flex items-center justify-between mb-4 border-b border-primary pb-2">
        <h3 className="uppercase font-bold">Custom Preset Configuration</h3>
        <div className="flex gap-2">
          <TerminalButton onClick={() => setShowLoadDialog(true)} className="text-xs py-1 px-2 flex items-center gap-1">
            <FolderOpen size={14} /> Load
          </TerminalButton>
          <TerminalButton onClick={() => setShowSaveDialog(true)} className="text-xs py-1 px-2 flex items-center gap-1">
            <Save size={14} /> Save
          </TerminalButton>
        </div>
      </div>
      
      {showSaveDialog && (
        <div className="absolute inset-0 z-10 bg-bg-base/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-panel border border-primary p-4 w-full max-w-sm">
            <h4 className="uppercase font-bold mb-4">Save Preset</h4>
            <input 
              type="text" 
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              placeholder="Preset Name"
              className="bg-bg-base border border-primary text-text-base p-2 w-full mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <TerminalButton onClick={() => setShowSaveDialog(false)} className="text-xs py-1 px-2 opacity-70">Cancel</TerminalButton>
              <TerminalButton onClick={savePreset} disabled={!presetName.trim()} className="text-xs py-1 px-2 font-bold">Save</TerminalButton>
            </div>
          </div>
        </div>
      )}

      {showLoadDialog && (
        <div className="absolute inset-0 z-10 bg-bg-base/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-panel border border-primary p-4 w-full max-w-sm max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-primary/30 pb-2">
              <h4 className="uppercase font-bold">Load Preset</h4>
              <button onClick={() => setShowLoadDialog(false)} className="text-primary hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            {Object.keys(savedPresets).length === 0 ? (
              <p className="text-sm opacity-50 italic text-center py-4">No saved presets found.</p>
            ) : (
              <div className="overflow-y-auto flex-1 flex flex-col gap-2">
                {Object.keys(savedPresets).map(name => (
                  <div key={name} className="flex items-center justify-between border border-primary/30 p-2 bg-bg-base/50">
                    <span className="font-bold text-sm truncate pr-2">{name}</span>
                    <div className="flex gap-2 flex-shrink-0">
                      <TerminalButton onClick={() => loadPreset(name)} className="text-xs py-1 px-2">Load</TerminalButton>
                      <button onClick={() => deletePreset(name)} className="text-red-500 hover:text-red-400 p-1" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
                className="accent-primary"
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
                className="accent-primary"
              />
              <span>Luau</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm opacity-70 mb-1">Name Generator</label>
          <select 
            className="bg-bg-base border border-primary text-text-base p-1 w-full"
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
            className="bg-bg-base border border-primary text-text-base p-1 w-full"
            value={config.VarNamePrefix}
            onChange={e => onChange({ ...config, VarNamePrefix: e.target.value })}
            placeholder="e.g. prom_"
          />
        </div>

        <div>
          <label className="block text-sm opacity-70 mb-1">Seed (0 = Random)</label>
          <input 
            type="number" 
            className={`bg-bg-base border p-1 w-full ${errors.Seed ? 'border-red-500 text-red-500' : 'border-primary text-text-base'}`}
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
            className={`bg-bg-base border p-1 w-full ${errors.MinLength ? 'border-red-500 text-red-500' : 'border-primary text-text-base'}`}
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
            className={`bg-bg-base border p-1 w-full ${errors.MaxLength ? 'border-red-500 text-red-500' : 'border-primary text-text-base'}`}
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
            className="mr-2 accent-primary"
            checked={config.PrettyPrint}
            onChange={e => onChange({ ...config, PrettyPrint: e.target.checked })}
          />
          <label htmlFor="prettyPrint" className="text-sm">Pretty Print Output</label>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h4 className="uppercase font-bold text-sm">Obfuscation Steps</h4>
        <div className="flex gap-2">
          <select 
            className="bg-bg-base border border-primary text-text-base p-1 text-sm"
            value={selectedStepToAdd}
            onChange={e => setSelectedStepToAdd(e.target.value)}
          >
            {AVAILABLE_STEPS.map(step => (
              <option key={step} value={step}>{step}</option>
            ))}
          </select>
          <TerminalButton onClick={() => addStep(selectedStepToAdd)} className="text-xs py-1 px-2 flex items-center gap-1">
            <Plus size={14} /> Add Step
          </TerminalButton>
        </div>
      </div>
      
      {config.Steps.length === 0 ? (
        <p className="text-xs opacity-50 mt-2 italic border border-dashed border-primary/30 p-4 text-center">No steps selected. Code will only be minified/renamed.</p>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {config.Steps.map((step, index) => (
            <div key={`${step.Name}-${index}`} className="border border-primary/50 p-3 bg-bg-base/50 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-primary/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-bg-base font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">
                    {index + 1}
                  </span>
                  <h5 className="font-bold text-primary">{step.Name}</h5>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveStep(index, 'up')} 
                    disabled={index === 0}
                    className={`p-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/20 text-primary'}`}
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button 
                    onClick={() => moveStep(index, 'down')} 
                    disabled={index === config.Steps.length - 1}
                    className={`p-1 ${index === config.Steps.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/20 text-primary'}`}
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button 
                    onClick={() => removeStep(index)} 
                    className="p-1 hover:bg-red-500/20 text-red-500 ml-2"
                    title="Remove Step"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {Object.keys(step.Settings).length === 0 ? (
                <p className="text-xs opacity-50 italic pt-1">No configurable settings.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {Object.entries(step.Settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm bg-bg-base/30 p-2 rounded">
                      <label className="opacity-80">{key}</label>
                      {typeof value === 'boolean' ? (
                        <input 
                          type="checkbox" 
                          checked={value}
                          onChange={e => updateStepSetting(index, key, e.target.checked)}
                          className="accent-primary"
                        />
                      ) : typeof value === 'number' ? (
                        <input 
                          type="number" 
                          value={value}
                          onChange={e => updateStepSetting(index, key, Number(e.target.value))}
                          className="bg-bg-base border border-primary text-text-base p-1 w-20 text-right"
                        />
                      ) : (
                        <input 
                          type="text" 
                          value={value as string}
                          onChange={e => updateStepSetting(index, key, e.target.value)}
                          className="bg-bg-base border border-primary text-text-base p-1 w-32"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
