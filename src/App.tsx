import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { obfuscate } from './prometheus-bundle.js';
import TableScreen from './components/TableScreen';
import AboutScreen from './components/AboutScreen';
import StatsScreen from './components/StatsScreen';
import { PromcryptScreen } from './components/PromcryptScreen';
import TerminalButton from './components/TerminalButton';
import CustomPresetPanel, { CustomPresetConfig } from './components/CustomPresetPanel';

type Preset = 'Minify' | 'Weak' | 'Medium' | 'Strong' | 'Custom';
type Page = 'home' | 'table' | 'about' | 'stats' | 'promcrypt';

interface FileData {
  name: string;
  content: string;
  ext: string;
}

const ASCII_HEADER = `꓄ꃅꍟ ꉣꃅꍏꈤ꓄ꂦꂵ ꌗꉣꀤꋪꀤ꓄`;

function minifyLua(code: string): { minified: string, renamedCount: number } {
  const localRegex = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
  const locals: string[] = [];
  let match;
  while ((match = localRegex.exec(code)) !== null) {
    locals.push(match[1]);
  }
  const uniqueLocals = [...new Set(locals)];

  const map: Record<string, string> = {};
  uniqueLocals.forEach((name, idx) => {
    map[name] = `k${idx+1}`;
  });

  let minified = code;
  for (const [oldName, newName] of Object.entries(map)) {
    const regex = new RegExp(`\\b${oldName}\\b`, 'g');
    minified = minified.replace(regex, newName);
  }

  minified = minified.replace(/([^\n;])\n/g, '$1;\n');
  minified = minified.replace(/\b(then|do|else|end);/g, '$1');
  minified = minified.replace(/\s+/g, ' ').trim();

  return { minified, renamedCount: uniqueLocals.length };
}

const analyzeFileContent = async (file: File): Promise<{ type: string, isText: boolean, error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(buffer);
      
      if (bytes.length >= 4) {
        // Check magic numbers
        if (bytes[0] === 0x1B && bytes[1] === 0x4C && bytes[2] === 0x75 && bytes[3] === 0x61) {
          return resolve({ type: 'Compiled Lua', isText: false, error: 'Compiled Lua files are not supported for obfuscation.' });
        }
        if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
          return resolve({ type: 'ZIP/APK Archive', isText: false, error: 'Archives are not supported.' });
        }
        if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
          return resolve({ type: 'ELF Executable', isText: false, error: 'Executables are not supported.' });
        }
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
          return resolve({ type: 'PNG Image', isText: false, error: 'Images are not supported.' });
        }
        if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
          return resolve({ type: 'PDF Document', isText: false, error: 'PDFs are not supported.' });
        }
      }
      
      // Basic text detection: check for null bytes in the first chunk
      let isText = true;
      for (let i = 0; i < Math.min(bytes.length, 512); i++) {
        if (bytes[i] === 0) {
          isText = false;
          break;
        }
      }
      
      if (!isText) {
        return resolve({ type: 'Binary Data', isText: false, error: 'Binary files are not supported. Please upload plain text or Lua source code.' });
      }
      
      resolve({ type: 'Text/Source Code', isText: true });
    };
    
    reader.onerror = () => resolve({ type: 'Unknown', isText: false, error: 'Failed to read file for analysis.' });
    
    const slice = file.slice(0, 512);
    reader.readAsArrayBuffer(slice);
  });
};

export const AsciiSpinner = () => {
  const [frame, setFrame] = useState(0);
  const frames = ['|', '/', '-', '\\'];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return <span>{frames[frame]}</span>;
};

export default function App() {
  const [logs, setLogs] = useState<string[]>([ASCII_HEADER, '$> Ready.']);
  const [file, setFile] = useState<FileData | null>(null);
  const [preset, setPreset] = useState<Preset>('Minify');
  const [customConfig, setCustomConfig] = useState<CustomPresetConfig>({
    LuaVersion: 'Lua51',
    VarNamePrefix: '',
    NameGenerator: 'MangledShuffled',
    PrettyPrint: false,
    Seed: 0,
    Steps: []
  });
  const [result, setResult] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isDragging, setIsDragging] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVisitCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleDownloadAPK = async () => {
    addLog('$> Fetching Promcrypt APK...');
    try {
      // Try to fetch the actual APK from the public folder
      const response = await fetch('/promcrypt.apk', { method: 'HEAD' });
      
      if (response.ok) {
        addLog('$> Download started: promcrypt.apk');
        const a = document.createElement('a');
        a.href = '/promcrypt.apk';
        a.download = 'promcrypt.apk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        addLog('$> ERROR: Real APK not found on server.');
        addLog('$> FIX: Please upload your actual "promcrypt.apk" file into the "public" folder of this project using the file explorer on the left.');
        addLog('$> The previous download was a placeholder text file, which causes the "problem parsing the package" error on Android.');
      }
    } catch (err: any) {
      addLog(`$> Error checking for APK: ${err.message}`);
    }
  };

  const processFile = async (uploadedFile: File) => {
    const ext = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
    
    addLog(`$> Analyzing file: ${uploadedFile.name}...`);
    
    const analysis = await analyzeFileContent(uploadedFile);
    
    if (!analysis.isText) {
      addLog(`$> Error: Detected ${analysis.type}. ${analysis.error}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    if (ext !== 'txt' && ext !== 'lua') {
      addLog(`$> Warning: File extension .${ext} is unusual, but content appears to be text. Proceeding...`);
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setFile({
          name: uploadedFile.name,
          content,
          ext
        });
        setUploadCount(prev => prev + 1);
        setResult(null);
        setResultFileName(null);
        addLog(`$> Loaded file: ${uploadedFile.name} (${content.length} bytes)`);
      } catch (err) {
        addLog(`$> Error: Failed to process file content.`);
      }
    };
    
    reader.onerror = () => {
      addLog(`$> Error: I/O error occurred while reading the file.`);
    };
    
    reader.onabort = () => {
      addLog(`$> Error: File reading was aborted.`);
    };
    
    reader.readAsText(uploadedFile);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      processFile(uploadedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePresetChange = (newPreset: Preset) => {
    setPreset(newPreset);
    addLog(`$> Preset changed to: ${newPreset}`);
  };

  const handleRun = async () => {
    if (!file) {
      addLog('$> No file uploaded.');
      return;
    }

    setIsProcessing(true);
    addLog(`$> [${preset}] applied to ${file.name}`);
    
    try {
      let finalContent = '';
      let finalName = '';

      addLog(`$> Obfuscating with preset: ${preset}...`);
      // Yield to event loop so UI can update
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const configToUse = preset === 'Custom' ? customConfig : preset;
      finalContent = obfuscate(file.content, configToUse as any);
      finalContent = `return(function(...)local shadowdev1={"${finalContent.replace(/"/g, '\\"')}"}
end)(...)`;
      finalName = file.name.replace(/\.(txt|lua)$/, `.${preset.toLowerCase()}.lua`);
      
      addLog(`$> Obfuscation complete.`);

      setResult(finalContent);
      setResultFileName(finalName);
      
      const preview = finalContent.length > 100 ? finalContent.substring(0, 100) + '...' : finalContent;
      addLog(`$> Result (${finalContent.length} bytes):\n${preview}`);
      
    } catch (err: any) {
      addLog(`$> Error during processing: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadResult = () => {
    if (!result || !resultFileName) {
      addLog('$> No result to download. Run a preset first.');
      return;
    }

    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog(`$> Download ready: ${resultFileName}`);
  };

  const handleReset = () => {
    setLogs([ASCII_HEADER, '$> System reset.', '$> Ready.']);
    setFile(null);
    setPreset('Minify');
    setResult(null);
    setResultFileName(null);
  };

  const copyToClipboard = () => {
    if (!result) {
      addLog('$> No result to copy.');
      return;
    }
    navigator.clipboard.writeText(result).then(() => {
      addLog('$> Result copied to clipboard.');
    }).catch(err => {
      addLog(`$> Error copying to clipboard: ${err}`);
    });
  };

  return (
    <div 
      className={`min-h-screen bg-black text-[#00FF00] font-mono p-4 md:p-8 flex flex-col max-w-6xl mx-auto crt-text-effect ${isDragging ? 'border-4 border-dashed border-[#00FF00]' : ''} ${isProcessing ? 'cursor-wait' : 'cursor-default'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex justify-center mb-8 relative z-10"
      >
        <h1 className="text-[#00FF00] font-bold text-2xl sm:text-3xl md:text-4xl tracking-widest leading-tight [text-shadow:0_0_10px_#00FF00,0_0_20px_#00FF00]">
          {ASCII_HEADER}
        </h1>
      </motion.div>

      {/* Navigation */}
      <nav className="flex gap-4 mb-6 border-b border-[#00FF00] pb-4 relative z-10">
        {(['home', 'table', 'about', 'stats', 'promcrypt'] as Page[]).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`uppercase text-sm ${currentPage === page ? 'font-bold underline' : 'opacity-70 hover:opacity-100'}`}
          >
            {page}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-10"
        >
          {currentPage === 'home' && (
            <>
              {/* Log Pane */}
              <div className="border-2 border-[#00FF00] p-4 h-[400px] overflow-y-auto mb-6 bg-black shadow-[0_0_10px_#00FF0033] relative">
                <pre className="whitespace-pre-wrap break-all text-sm md:text-base leading-relaxed">
                  {logs.join('\n')}
                  {isProcessing ? (
                    <span className="ml-2 text-[#00FF00]"><AsciiSpinner /></span>
                  ) : (
                    <span className="animate-pulse">_</span>
                  )}
                </pre>
                <div ref={logEndRef} />
              </div>

              {/* Status Line */}
              <div className="mb-6 flex justify-between items-center text-sm border-b border-[#00FF00] pb-2">
                <div>
                  <span className="opacity-70">FILE: </span>
                  <span className="font-bold">{file ? file.name : 'NONE'}</span>
                </div>
                <div>
                  <span className="opacity-70">PRESET: </span>
                  <span className="font-bold">{preset}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-6">
                {/* Main Actions */}
                <div className="flex flex-wrap gap-4">
                  <TerminalButton 
                    onClick={handleDownloadAPK}
                  >
                    Download APK
                  </TerminalButton>
                  
                  <input 
                    type="file" 
                    accept="*" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                  <TerminalButton 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload File
                  </TerminalButton>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="uppercase text-sm mr-2 opacity-70">Select Preset:</span>
                  {(['Minify', 'Weak', 'Medium', 'Strong', 'Custom'] as Preset[]).map(p => (
                    <TerminalButton
                      key={p}
                      onClick={() => handlePresetChange(p)}
                      className={preset === p ? 'bg-[#00FF00] text-black font-bold' : ''}
                    >
                      {p}
                    </TerminalButton>
                  ))}
                </div>

                {preset === 'Custom' && (
                  <CustomPresetPanel config={customConfig} onChange={setCustomConfig} />
                )}

                {/* Execution Actions */}
                <div className="flex flex-wrap gap-4 mt-2">
                  <TerminalButton 
                    onClick={handleRun}
                    disabled={isProcessing}
                    className="font-bold"
                  >
                    {isProcessing ? 'Processing...' : 'Run'}
                  </TerminalButton>
                  
                  <TerminalButton 
                    onClick={handleDownloadResult}
                    disabled={!result}
                  >
                    Download Result
                  </TerminalButton>

                  <TerminalButton 
                    onClick={copyToClipboard}
                    disabled={!result}
                  >
                    Copy Result
                  </TerminalButton>
                  
                  <TerminalButton 
                    onClick={handleReset}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-black ml-auto"
                  >
                    Reset
                  </TerminalButton>
                </div>
              </div>
            </>
          )}
          {currentPage === 'table' && <TableScreen />}
          {currentPage === 'about' && <AboutScreen />}
          {currentPage === 'stats' && <StatsScreen visitCount={visitCount} uploadCount={uploadCount} />}
          {currentPage === 'promcrypt' && <PromcryptScreen onBack={() => setCurrentPage('home')} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
