import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import TerminalButton from './TerminalButton';
import CryptoJS from 'crypto-js';

interface User {
  id: string;
  username: string;
  avatar: string;
}

interface SavedFile {
  id: string;
  name: string;
  encryptedContent: string;
  timestamp: number;
}

export default function AccountScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [password, setPassword] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('discord_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      loadFiles(JSON.parse(storedUser).id);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const userData = event.data.user;
        setUser(userData);
        localStorage.setItem('discord_user', JSON.stringify(userData));
        loadFiles(userData.id);
        setMessage('Successfully logged in with Discord!');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadFiles = (userId: string) => {
    const files = localStorage.getItem(`saved_files_${userId}`);
    if (files) {
      setSavedFiles(JSON.parse(files));
    } else {
      setSavedFiles([]);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) {
        setMessage('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setMessage('Failed to initiate login.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSavedFiles([]);
    localStorage.removeItem('discord_user');
    setMessage('Logged out.');
  };

  const handleSaveFile = () => {
    if (!user) return setMessage('Please login first.');
    if (!fileName || !fileContent || !password) return setMessage('Please fill all fields.');

    try {
      const encryptedContent = CryptoJS.AES.encrypt(fileContent, password).toString();
      const newFile: SavedFile = {
        id: Date.now().toString(),
        name: fileName,
        encryptedContent,
        timestamp: Date.now(),
      };

      const updatedFiles = [...savedFiles, newFile];
      setSavedFiles(updatedFiles);
      localStorage.setItem(`saved_files_${user.id}`, JSON.stringify(updatedFiles));
      
      setFileName('');
      setFileContent('');
      setPassword('');
      setMessage('File encrypted and saved locally!');
    } catch (error) {
      setMessage('Encryption failed.');
    }
  };

  const handleDecryptFile = (file: SavedFile) => {
    const pass = prompt(`Enter password to decrypt ${file.name}:`);
    if (!pass) return;

    try {
      const bytes = CryptoJS.AES.decrypt(file.encryptedContent, pass);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) throw new Error('Invalid password');
      
      setFileName(file.name);
      setFileContent(decrypted);
      setMessage(`Successfully decrypted ${file.name}`);
    } catch (error) {
      setMessage('Decryption failed. Incorrect password?');
    }
  };

  const handleDeleteFile = (id: string) => {
    if (!user) return;
    const updatedFiles = savedFiles.filter(f => f.id !== id);
    setSavedFiles(updatedFiles);
    localStorage.setItem(`saved_files_${user.id}`, JSON.stringify(updatedFiles));
    setMessage('File deleted.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border-2 border-primary p-6 bg-bg-base shadow-[0_0_15px_color-mix(in_srgb,var(--theme-primary)_30%,transparent)]"
    >
      <h2 className="text-2xl font-bold mb-6 uppercase tracking-wider border-b border-primary pb-2">Account & Secure Storage</h2>
      
      {message && (
        <div className="mb-4 p-2 border border-primary text-primary bg-primary/10 text-sm">
          {message}
        </div>
      )}

      {!user ? (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="mb-6 text-center opacity-80">Login with Discord to access your locally encrypted files.</p>
          <TerminalButton onClick={handleLogin} className="px-8 py-3 text-lg">
            Login with Discord
          </TerminalButton>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between border border-primary p-4">
            <div className="flex items-center gap-4">
              {user.avatar && (
                <img 
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full border border-primary"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <div className="font-bold">{user.username}</div>
                <div className="text-xs opacity-70">ID: {user.id}</div>
              </div>
            </div>
            <TerminalButton onClick={handleLogout} className="text-sm">Logout</TerminalButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold uppercase border-b border-primary/50 pb-1">Save New File</h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase opacity-70">File Name</label>
                <input 
                  type="text" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="bg-transparent border border-primary p-2 text-primary focus:outline-none focus:shadow-[0_0_10px_color-mix(in_srgb,var(--theme-primary)_50%,transparent)]"
                  placeholder="secret.txt"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase opacity-70">Content</label>
                <textarea 
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="bg-transparent border border-primary p-2 text-primary h-32 resize-none focus:outline-none focus:shadow-[0_0_10px_color-mix(in_srgb,var(--theme-primary)_50%,transparent)]"
                  placeholder="Enter content to encrypt..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase opacity-70">Encryption Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border border-primary p-2 text-primary focus:outline-none focus:shadow-[0_0_10px_color-mix(in_srgb,var(--theme-primary)_50%,transparent)]"
                  placeholder="Strong password..."
                />
              </div>

              <TerminalButton onClick={handleSaveFile} className="mt-2">
                Encrypt & Save Locally
              </TerminalButton>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold uppercase border-b border-primary/50 pb-1">Your Encrypted Files</h3>
              
              {savedFiles.length === 0 ? (
                <p className="opacity-50 text-sm italic">No files saved yet.</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {savedFiles.map(file => (
                    <div key={file.id} className="border border-primary/50 p-3 flex flex-col gap-2 hover:border-primary transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{file.name}</span>
                        <span className="text-xs opacity-50">{new Date(file.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs opacity-50 truncate">
                        {file.encryptedContent.substring(0, 30)}...
                      </div>
                      <div className="flex gap-2 mt-2">
                        <TerminalButton onClick={() => handleDecryptFile(file)} className="flex-1 text-xs py-1">
                          Decrypt & Load
                        </TerminalButton>
                        <TerminalButton onClick={() => handleDeleteFile(file.id)} className="text-xs py-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-bg-base">
                          Delete
                        </TerminalButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
