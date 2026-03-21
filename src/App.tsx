import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import TableScreen from './components/TableScreen';
import AboutScreen from './components/AboutScreen';
import StatsScreen from './components/StatsScreen';
import WhatsNewScreen from './components/WhatsNewScreen';
import SettingsScreen from './components/SettingsScreen';
import AccountScreen from './components/AccountScreen';
import TerminalButton from './components/TerminalButton';
import CustomPresetPanel, { CustomPresetConfig } from './components/CustomPresetPanel';
import Logo from './components/Logo';
import musicFile from './assets/music.mp3';

import { useHistory } from './hooks/useHistory';

type Preset = 'Minify' | 'Weak' | 'Medium' | 'Strong' | 'Custom';
type Page = 'home' | 'table' | 'about' | 'stats' | 'updates' | 'settings' | 'account';

interface FileData {
  name: string;
  content: string;
  ext: string;
}

const ASCII_HEADER = `PROMCRYPT TERMINAL`;

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

export const PlayStoreSpinner = () => (
  <svg className="play-spinner inline-block ml-2 align-middle" viewBox="25 25 50 50">
    <circle cx="50" cy="50" r="20"></circle>
  </svg>
);

export default function App() {
  const [logs, setLogs] = useState<string[]>([ASCII_HEADER, '$> Ready.']);
  const [file, setFile] = useState<FileData | null>(null);
  const [preset, setPreset] = useState<Preset>('Minify');
  const [customConfig, setCustomConfig, { undo: undoConfig, redo: redoConfig, canUndo: canUndoConfig, canRedo: canRedoConfig }] = useHistory<CustomPresetConfig>({
    LuaVersion: 'Lua51',
    VarNamePrefix: '',
    NameGenerator: 'MangledShuffled',
    PrettyPrint: false,
    Seed: 0,
    MinLength: 4,
    MaxLength: 12,
    Steps: []
  });
  const [resultData, setResultData, { undo: undoResult, redo: redoResult, canUndo: canUndoResult, canRedo: canRedoResult }] = useHistory<{ content: string | null, fileName: string | null }>({ content: null, fileName: null });
  const result = resultData.content;
  const resultFileName = resultData.fileName;
  const [isProcessing, setIsProcessing] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<Page>('account');
  const [isDragging, setIsDragging] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [showPreview, setShowPreview] = useState(false);
  const hasAutoPlayed = useRef(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Track visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle audio play/pause based on state
  useEffect(() => {
    if (!audioRef.current || audioError) return;

    if (isMusicPlaying && isPageVisible) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log("Play prevented:", err);
          setIsMusicPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying, isPageVisible, audioError]);

  // Autoplay on first interaction
  useEffect(() => {
    const handleInteraction = (e: Event) => {
      if (hasAutoPlayed.current || audioError) return;
      
      // If the user clicked a button, let the button's onClick handle the state
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        hasAutoPlayed.current = true;
        return;
      }

      hasAutoPlayed.current = true;
      setIsMusicPlaying(true);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [audioError]);

  const setMusicState = (state: boolean) => {
    if (audioError && state) {
      addLog("$> ERROR: Music file failed to load. Please check your connection or browser settings.");
      return;
    }
    hasAutoPlayed.current = true;
    setIsMusicPlaying(state);
  };

  const toggleMusic = () => setMusicState(!isMusicPlaying);

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
        setShowPreview(true);
        setUploadCount(prev => prev + 1);
        setResultData({ content: null, fileName: null });
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
    setShowPreview(false);
    addLog(`$> [${preset}] applied to ${file.name}`);
    
    try {
      let finalContent = '';
      let finalName = '';

      addLog(`$> Obfuscating with preset: ${preset}...`);
      // Yield to event loop so UI can update
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const configToUse = preset === 'Custom' ? customConfig : preset;
      
      const worker = new Worker(new URL('./obfuscator.worker.ts', import.meta.url), { type: 'module' });
      
      const workerPromise = new Promise<string>((resolve, reject) => {
        worker.onmessage = (e) => {
          if (e.data.success) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error));
          }
        };
        worker.onerror = (err) => {
          reject(new Error('Worker error: ' + err.message));
        };
      });

      worker.postMessage({ code: file.content, config: configToUse });
      
      finalContent = await workerPromise;
      worker.terminate();

      finalContent = `return(function(...)local shadowdev1={"${finalContent.replace(/"/g, '\\"')}"}
end)(...)`;
      finalName = file.name.replace(/\.(txt|lua)$/, `.${preset.toLowerCase()}.lua`);
      
      addLog(`$> Obfuscation complete.`);

      setResultData({ content: finalContent, fileName: finalName });
      
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
    setShowPreview(false);
    setPreset('Minify');
    setResultData({ content: null, fileName: null });
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
      className={`min-h-screen bg-bg-base text-text-base font-mono p-4 md:p-8 flex flex-col max-w-6xl mx-auto crt-text-effect relative ${isProcessing ? 'cursor-wait' : 'cursor-default'}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/20 backdrop-blur-sm border-4 border-dashed border-primary flex items-center justify-center rounded-2xl m-4 pointer-events-none">
          <div className="text-center bg-bg-base/80 p-12 rounded-xl border-2 border-primary shadow-[0_0_50px_var(--theme-primary)]">
            <div className="text-6xl mb-4 animate-bounce">📁</div>
            <h2 className="text-4xl font-bold text-primary uppercase tracking-widest">Drop Lua File Here</h2>
            <p className="mt-4 text-xl opacity-80">Release to upload and start obfuscation</p>
          </div>
        </div>
      )}
      {/* Header Logo */}
      <div className="flex justify-between items-start mb-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="overflow-hidden flex items-center gap-4"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 text-primary drop-shadow-[0_0_10px_var(--theme-primary)]">
            <Logo />
          </div>
          <h1 className="text-primary font-bold text-2xl sm:text-3xl md:text-4xl tracking-widest leading-tight [text-shadow:0_0_10px_var(--theme-primary),0_0_20px_var(--theme-primary)] animate-marquee whitespace-nowrap">
            {ASCII_HEADER}
          </h1>
        </motion.div>
        <button 
          onClick={toggleMusic}
          className={`p-2 border rounded-full transition-colors ${audioError ? 'text-red-500 border-red-500/50 hover:bg-red-500/10' : 'text-primary hover:text-white border-primary shadow-[0_0_10px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)]'}`}
          title={audioError ? "Music file missing" : (isMusicPlaying ? "Mute Music" : "Play Music")}
          disabled={isAudioLoading}
        >
          {isAudioLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : isMusicPlaying && !audioError ? (
            <Volume2 size={24} />
          ) : (
            <VolumeX size={24} />
          )}
        </button>
      </div>

      <audio 
        ref={audioRef} 
        src={musicFile} 
        loop 
        onLoadStart={() => setIsAudioLoading(true)}
        onCanPlay={() => setIsAudioLoading(false)}
        onWaiting={() => setIsAudioLoading(true)}
        onPlaying={() => setIsAudioLoading(false)}
        onError={(e) => {
          console.error("Audio file failed to load:", e);
          setAudioError(true);
          setIsAudioLoading(false);
          setIsMusicPlaying(false);
        }}
      />

      {/* Navigation */}
      <nav className="flex gap-4 mb-6 border-b border-primary pb-4 relative z-10 overflow-x-auto whitespace-nowrap">
        {(['home', 'account', 'table', 'about', 'stats', 'updates', 'settings'] as Page[]).map(page => (
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
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10"
        >
          {currentPage === 'home' && (
            <>
              {/* Log Pane */}
              <div className="border-2 border-primary p-4 h-[400px] mb-6 bg-bg-base shadow-[0_0_10px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)] relative flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-all text-sm md:text-base leading-relaxed">
                    {logs.join('\n')}
                    {isProcessing ? (
                      <PlayStoreSpinner />
                    ) : (
                      <span className="animate-pulse">_</span>
                    )}
                  </pre>
                  <div ref={logEndRef} />
                </div>
                {file && showPreview && !isProcessing && (
                  <div className="mt-4 border-t border-primary pt-4 flex-shrink-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold opacity-70 text-sm">PREVIEW: {file.name}</span>
                      <button 
                        onClick={() => setShowPreview(false)} 
                        className="text-xs border border-primary px-2 py-1 hover:bg-primary hover:text-bg-base transition-colors"
                      >
                        CLEAR PREVIEW
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap break-all text-xs opacity-80 h-[100px] overflow-y-auto border border-primary/30 p-2 bg-primary/5">
                      {file.content}
                    </pre>
                  </div>
                )}
              </div>

              {/* Status Line */}
              <div className="mb-6 flex justify-between items-center text-sm border-b border-primary pb-2">
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
                      className={preset === p ? 'bg-primary text-bg-base font-bold' : ''}
                    >
                      {p}
                    </TerminalButton>
                  ))}
                </div>

                {preset === 'Custom' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 justify-end">
                      <TerminalButton onClick={undoConfig} disabled={!canUndoConfig} className="text-xs py-1 px-2">Undo</TerminalButton>
                      <TerminalButton onClick={redoConfig} disabled={!canRedoConfig} className="text-xs py-1 px-2">Redo</TerminalButton>
                    </div>
                    <CustomPresetPanel config={customConfig} onChange={setCustomConfig} />
                  </div>
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

                  <div className="flex gap-2 ml-auto">
                    <TerminalButton 
                      onClick={undoResult}
                      disabled={!canUndoResult}
                      className="text-xs py-1 px-2"
                    >
                      Undo Result
                    </TerminalButton>
                    <TerminalButton 
                      onClick={redoResult}
                      disabled={!canRedoResult}
                      className="text-xs py-1 px-2"
                    >
                      Redo Result
                    </TerminalButton>
                  </div>
                  
                  <TerminalButton 
                    onClick={handleReset}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-bg-base"
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
          {currentPage === 'updates' && <WhatsNewScreen />}
          {currentPage === 'settings' && <SettingsScreen isMusicPlaying={isMusicPlaying} setMusicState={setMusicState} />}
          {currentPage === 'account' && <AccountScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
