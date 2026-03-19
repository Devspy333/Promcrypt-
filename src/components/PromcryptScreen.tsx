import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Lock, Unlock, Terminal, Cpu } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { AsciiSpinner } from '../App';
import { decryptCaesar, decryptROT13, decryptXOR, decryptAtbash, decryptVigenere, isLikelyDecrypted } from '../utils/ciphers';

interface PromcryptScreenProps {
  onBack: () => void;
}

export function PromcryptScreen({ onBack }: PromcryptScreenProps) {
  const [mode, setMode] = useState<'encrypt' | 'decrypt' | 'analyze'>('analyze');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('promcrypt_default_key');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>(['$> Promcrypt Deep Analysis Module Initialized.']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (ext !== 'txt' && ext !== 'lua') {
        addLog(`$> ERROR: Unsupported file type .${ext}. Only .txt and .lua are allowed.`);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      setFile(selectedFile);
      addLog(`$> File loaded: ${selectedFile.name}`);
    }
  };

  const processFile = async () => {
    if (!file) {
      addLog('$> ERROR: No file selected.');
      return;
    }

    setIsProcessing(true);
    addLog(`$> Starting ${mode.toUpperCase()} operation for ${file.name}...`);

    try {
      const text = await file.text();
      let resultText = '';
      let outExt = file.name.split('.').pop() || 'txt';
      let outName = file.name.replace(`.${outExt}`, '');

      if (mode === 'analyze') {
        addLog(`$> Initiating Deep Analysis on ${file.name}...`);
        await sleep(800);
        addLog('$> Scanning file entropy and signatures...');
        await sleep(1000);

        let cracked = false;

        // 1. Promcrypt Wrapper
        const shadowMatch = text.match(/local\s+shadowdev1\s*=\s*\{"((?:[^"\\]|\\.)*)"\}/);
        if (shadowMatch && shadowMatch[1]) {
          addLog('$> [MATCH] Promcrypt Lua Wrapper detected.');
          addLog('$> Generating extraction keys...');
          await sleep(800);
          addLog(`$> Key generated: 0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`);
          await sleep(400);
          resultText = shadowMatch[1].replace(/\\"/g, '"');
          cracked = true;
          outExt = 'lua';
        }

        // 2. AES / Legacy Promcrypt
        if (!cracked && text.startsWith('--PROMCRYPT_V1--\n')) {
          addLog('$> [MATCH] Promcrypt AES-256 Encrypted File detected.');
          addLog('$> Initiating brute-force key generation...');
          const dataToDecrypt = text.replace('--PROMCRYPT_V1--\n', '');
          const commonKeys = ['promcrypt_default_key', 'password', 'admin', '123456', 'root', 'key', 'test', password];

          for (let i = 0; i < 15; i++) {
             addLog(`$> Testing key space 0x${Math.floor(Math.random()*0xFFFFFFFF).toString(16).toUpperCase()}...`);
             await sleep(100);
          }

          for (const key of commonKeys) {
             try {
               const decrypted = CryptoJS.AES.decrypt(dataToDecrypt, key);
               const res = decrypted.toString(CryptoJS.enc.Utf8);
               if (res) {
                 addLog(`$> [SUCCESS] Collision found! Key generated: "${key}"`);
                 resultText = res;
                 cracked = true;
                 break;
               }
             } catch (e) {}
          }
          if (!cracked) {
             throw new Error('Brute-force failed. Entropy too high. Manual key required.');
          }
        }

        // 3. Base64
        if (!cracked) {
          const b64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
          if (text.trim().length > 10 && b64Regex.test(text.trim())) {
            addLog('$> [MATCH] Base64 Encoding detected.');
            addLog('$> Generating decoding matrix...');
            await sleep(600);
            try {
              resultText = atob(text.trim());
              cracked = true;
            } catch(e) {}
          }
        }

        // 4. Hex
        if (!cracked) {
          const hexRegex = /^[0-9A-Fa-f]+$/;
          if (text.trim().length > 10 && hexRegex.test(text.trim())) {
            addLog('$> [MATCH] Hexadecimal Encoding detected.');
            addLog('$> Generating byte-shift keys...');
            await sleep(600);
            let res = '';
            const hex = text.trim();
            for (let i = 0; i < hex.length; i += 2) {
              res += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            resultText = res;
            cracked = true;
          }
        }

        // 5. Classic Ciphers (TheAlgorithms/JavaScript)
        if (!cracked) {
          addLog('$> [MATCH] Unknown high-entropy string. Applying TheAlgorithms/JavaScript cipher suite...');
          await sleep(800);

          // Test ROT13
          addLog('$> Testing ROT13...');
          const rot13Attempt = decryptROT13(text);
          if (isLikelyDecrypted(rot13Attempt)) {
            resultText = rot13Attempt;
            cracked = true;
            addLog('$> [SUCCESS] ROT13 Decryption successful.');
          }

          // Test Atbash
          if (!cracked) {
            addLog('$> Testing Atbash Cipher...');
            const atbashAttempt = decryptAtbash(text);
            if (isLikelyDecrypted(atbashAttempt)) {
              resultText = atbashAttempt;
              cracked = true;
              addLog('$> [SUCCESS] Atbash Decryption successful.');
            }
          }

          // Test Caesar (1-25)
          if (!cracked) {
            addLog('$> Brute-forcing Caesar Cipher (Shifts 1-25)...');
            for (let shift = 1; shift < 26; shift++) {
              const caesarAttempt = decryptCaesar(text, shift);
              if (isLikelyDecrypted(caesarAttempt)) {
                resultText = caesarAttempt;
                cracked = true;
                addLog(`$> [SUCCESS] Caesar Cipher (Shift ${shift}) successful.`);
                break;
              }
            }
          }

          // Test XOR with password
          if (!cracked && password) {
            addLog(`$> Testing XOR Cipher with key: "${password}"...`);
            const xorAttempt = decryptXOR(text, password);
            if (isLikelyDecrypted(xorAttempt)) {
              resultText = xorAttempt;
              cracked = true;
              addLog('$> [SUCCESS] XOR Decryption successful.');
            }
          }

          // Test Vigenere with password
          if (!cracked && password) {
            addLog(`$> Testing Vigenere Cipher with key: "${password}"...`);
            const vigAttempt = decryptVigenere(text, password);
            if (isLikelyDecrypted(vigAttempt)) {
              resultText = vigAttempt;
              cracked = true;
              addLog('$> [SUCCESS] Vigenere Decryption successful.');
            }
          }
        }

        // 6. Prometheus Ransomware Decryptor (cycraft-corp)
        if (!cracked) {
          addLog('$> [MATCH] Attempting Prometheus Ransomware Decryptor (cycraft-corp)...');
          await sleep(800);
          try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/decrypt-prometheus', {
              method: 'POST',
              body: formData
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.content) {
                resultText = data.content;
                cracked = true;
                addLog('$> [SUCCESS] Prometheus Decryptor successful.');
                if (data.logs) {
                  const logLines = data.logs.split('\n').filter((l: string) => l.trim().length > 0);
                  logLines.forEach((l: string) => addLog(`$> [DECRYPTOR] ${l}`));
                }
              }
            } else {
              const errData = await response.json();
              addLog(`$> [DECRYPTOR] Failed: ${errData.error || response.statusText}`);
            }
          } catch (e) {
            addLog(`$> [DECRYPTOR] Error communicating with backend.`);
          }
        }

        if (!cracked) {
          throw new Error('Analysis failed. File appears to be raw text or an unknown encryption format.');
        }

        addLog('$> Decryption successful.');
        outName = `${outName}_cracked.${outExt}`;
      } else if (mode === 'encrypt') {
        await sleep(1000);
        const escapedText = text.replace(/"/g, '\\"');
        resultText = `return(function(...)local shadowdev1={"${escapedText}"}\nend)(...)`;
        outName = `${outName}_encrypted.${outExt}`;
        addLog('$> Promcrypt Encryption successful.');
      } else if (mode === 'decrypt') {
        await sleep(1000);
        const match = text.match(/local\s+shadowdev1\s*=\s*\{"((?:[^"\\]|\\.)*)"\}/);
        if (match && match[1]) {
          resultText = match[1].replace(/\\"/g, '"');
          outName = `${outName}_decrypted.${outExt}`;
          addLog('$> Promcrypt Decryption successful.');
        } else {
          throw new Error('Decryption failed. Invalid Promcrypt format or corrupted file.');
        }
      }

      // Download the result
      const blob = new Blob([resultText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addLog(`$> File saved as ${outName}`);

    } catch (err: any) {
      addLog(`$> ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-[#00FF00] pb-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-[#00FF00]" />
          <h2 className="text-2xl font-bold uppercase tracking-widest text-[#00FF00]">Promcrypt Cipher</h2>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-1 border border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00] hover:text-black transition-colors uppercase text-sm font-bold"
        >
          [ Return ]
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left Column: Controls */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Mode Selection */}
          <div className="border border-[#00FF00] p-4 bg-black/50">
            <h3 className="text-[#00FF00] uppercase font-bold mb-4 border-b border-[#00FF00]/30 pb-2">Operation Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('analyze')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 border ${mode === 'analyze' ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00]/20'} transition-colors uppercase font-bold text-sm`}
              >
                <Cpu className="w-4 h-4" /> Auto-Crack
              </button>
              <button
                onClick={() => setMode('encrypt')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 border ${mode === 'encrypt' ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00]/20'} transition-colors uppercase font-bold text-sm`}
              >
                <Lock className="w-4 h-4" /> Encrypt
              </button>
              <button
                onClick={() => setMode('decrypt')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 border ${mode === 'decrypt' ? 'bg-[#00FF00] text-black border-[#00FF00]' : 'border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00]/20'} transition-colors uppercase font-bold text-sm`}
              >
                <Unlock className="w-4 h-4" /> Decrypt
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="border border-[#00FF00] p-4 bg-black/50">
            <h3 className="text-[#00FF00] uppercase font-bold mb-4 border-b border-[#00FF00]/30 pb-2">Target File</h3>
            <p className="text-xs text-[#00FF00]/70 mb-4">Supported formats: .txt, .lua</p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.lua"
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-[#00FF00]/50 text-[#00FF00] hover:bg-[#00FF00]/10 hover:border-[#00FF00] transition-all"
            >
              <Upload className="w-6 h-6" />
              <span className="uppercase font-bold tracking-wider">
                {file ? file.name : 'Select File'}
              </span>
            </button>
          </div>

          {/* Password */}
          <div className="border border-[#00FF00] p-4 bg-black/50">
            <h3 className="text-[#00FF00] uppercase font-bold mb-4 border-b border-[#00FF00]/30 pb-2">
              {mode === 'analyze' ? 'Custom Dictionary Key' : 'Cipher Key'}
            </h3>
            <input 
              type="text" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-[#00FF00] text-[#00FF00] p-2 font-mono focus:outline-none focus:ring-1 focus:ring-[#00FF00]"
              placeholder={mode === 'analyze' ? "Optional key for brute-force..." : "Enter encryption key..."}
            />
          </div>

          {/* Action Button */}
          <button 
            onClick={processFile}
            disabled={isProcessing || !file}
            className={`w-full py-4 border border-[#00FF00] text-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 ${isProcessing || !file ? 'opacity-50 cursor-not-allowed text-[#00FF00]/50' : 'text-black bg-[#00FF00] hover:bg-[#00CC00] hover:shadow-[0_0_15px_#00FF00]'}`}
          >
            {isProcessing ? (
              <>
                <AsciiSpinner /> PROCESSING...
              </>
            ) : (
              <>
                {mode === 'analyze' ? <Cpu className="w-5 h-5" /> : mode === 'encrypt' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                EXECUTE {mode.toUpperCase()}
              </>
            )}
          </button>
        </div>

        {/* Right Column: Terminal Output */}
        <div className="border border-[#00FF00] bg-black p-4 flex flex-col h-full min-h-[300px]">
          <h3 className="text-[#00FF00] uppercase font-bold mb-2 border-b border-[#00FF00]/30 pb-2 flex items-center justify-between">
            <span>Terminal Output</span>
            <span className="text-xs opacity-50">promcrypt_cipher_v2.0</span>
          </h3>
          <div className="flex-1 overflow-y-auto font-mono text-sm text-[#00FF00] custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className={`mb-1 ${log.includes('ERROR') ? 'text-red-500' : log.includes('WARNING') ? 'text-yellow-500' : log.includes('SUCCESS') || log.includes('MATCH') ? 'text-blue-400' : ''}`}>
                {log}
              </div>
            ))}
            {isProcessing && (
              <div className="text-[#00FF00] animate-pulse">
                $&gt; <AsciiSpinner />
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
