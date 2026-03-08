import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { obfuscate } from './prometheus-bundle.js';
import TableScreen from './components/TableScreen';
import AboutScreen from './components/AboutScreen';
import TerminalButton from './components/TerminalButton';

type Preset = 'Minify' | 'Weak' | 'Medium' | 'Strong';
type Page = 'home' | 'table' | 'about';

interface FileData {
  name: string;
  content: string;
  ext: string;
}

const ASCII_HEADER = `╔═══════════════════════════════════╗
║   PROMCRYPT TERMINAL v1.0         ║
║   "Harness the fire of encryption"║
╚═══════════════════════════════════╝`;

function xorHex(text: string): string {
  return Array.from(text).map(c => 
    (c.charCodeAt(0) ^ 0xAA).toString(16).padStart(2,'0')
  ).join('');
}

async function aesEncrypt(plaintext: string, bits: 128 | 256 = 128): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: bits },
    true,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  let binary = '';
  const bytes = new Uint8Array(combined);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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

export default function App() {
  const [logs, setLogs] = useState<string[]>([ASCII_HEADER, '$> Ready.']);
  const [file, setFile] = useState<FileData | null>(null);
  const [preset, setPreset] = useState<Preset>('Minify');
  const [result, setResult] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleDownloadPrometheus = async () => {
    addLog('$> Fetching latest Prometheus release...');
    try {
      const res = await fetch('https://api.github.com/repos/prometheus/prometheus/releases/latest');
      if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
      const data = await res.json();
      const asset = data.assets.find((a: any) => a.browser_download_url.includes('linux-amd64'));
      
      if (asset) {
        addLog(`$> Download started: ${asset.name}`);
        window.location.href = asset.browser_download_url;
      } else {
        addLog('$> Error: Could not find linux-amd64 asset in the latest release.');
      }
    } catch (err: any) {
      addLog(`$> Error fetching Prometheus: ${err.message}`);
    }
  };

  const processFile = (uploadedFile: File) => {
    const ext = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
    if (ext !== 'txt' && ext !== 'lua') {
      addLog(`$> Error: Unsupported file type .${ext}. Only .txt and .lua are allowed.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFile({
        name: uploadedFile.name,
        content,
        ext
      });
      setResult(null);
      setResultFileName(null);
      addLog(`$> Loaded file: ${uploadedFile.name} (${content.length} bytes)`);
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
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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

      if (file.ext === 'txt') {
        if (preset === 'Minify') {
          finalContent = btoa(file.content);
          finalName = file.name.replace('.txt', '.min.txt');
        } else if (preset === 'Weak') {
          finalContent = xorHex(file.content);
          finalName = file.name.replace('.txt', '.xor.txt');
        } else if (preset === 'Medium') {
          finalContent = await aesEncrypt(file.content, 128);
          finalName = file.name.replace('.txt', '.enc.txt');
        } else if (preset === 'Strong') {
          finalContent = await aesEncrypt(file.content, 256);
          finalName = file.name.replace('.txt', '.enc.txt');
        }
      } else if (file.ext === 'lua') {
        addLog(`$> Obfuscating Lua script with preset: ${preset}...`);
        // Yield to event loop so UI can update
        await new Promise(resolve => setTimeout(resolve, 50));
        
        finalContent = obfuscate(file.content, preset);
        finalName = file.name.replace('.lua', `.${preset.toLowerCase()}.lua`);
        
        addLog(`$> Obfuscation complete.`);
      }

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
      className="min-h-screen bg-black text-[#00FF00] font-mono p-4 md:p-8 flex flex-col max-w-6xl mx-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Navigation */}
      <nav className="flex gap-4 mb-6 border-b border-[#00FF00] pb-4">
        {(['home', 'table', 'about'] as Page[]).map(page => (
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
        >
          {currentPage === 'home' && (
            <>
              {/* Log Pane */}
              <div className="border-2 border-[#00FF00] p-4 h-[400px] overflow-y-auto mb-6 bg-black shadow-[0_0_10px_#00FF0033] relative">
                <pre className="whitespace-pre-wrap break-all text-sm md:text-base leading-relaxed">
                  {logs.join('\n')}
                  <span className="animate-pulse">_</span>
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
                    onClick={handleDownloadPrometheus}
                  >
                    Download Prometheus
                  </TerminalButton>
                  
                  <input 
                    type="file" 
                    accept=".txt,.lua" 
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
                  {(['Minify', 'Weak', 'Medium', 'Strong'] as Preset[]).map(p => (
                    <TerminalButton
                      key={p}
                      onClick={() => handlePresetChange(p)}
                      className={preset === p ? 'bg-[#00FF00] text-black font-bold' : ''}
                    >
                      {p}
                    </TerminalButton>
                  ))}
                </div>

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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
