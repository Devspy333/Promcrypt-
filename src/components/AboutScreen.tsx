import React from 'react';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';

export default function AboutScreen() {
  const handleDownloadSource = () => {
    window.open('/api/download-source', '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border-2 border-primary p-6 mb-6 shadow-[0_0_10px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)] max-h-[600px] overflow-y-auto"
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold uppercase text-primary">About Promcrypt</h2>
        <button 
          onClick={handleDownloadSource}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-black transition-colors uppercase text-xs font-bold"
        >
          <Download size={14} />
          Download Source
        </button>
      </div>
      <div className="space-y-6 text-sm leading-relaxed opacity-90">
        <section>
          <p>
            Promcrypt is a professional-grade obfuscation suite designed for Lua scripts and text files. 
            It provides a robust shield for your intellectual property by transforming readable source code into a 
            complex, non-linear structure that is extremely difficult to reverse-engineer or tamper with.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-bold uppercase text-primary mb-2">Key Features</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><span className="text-primary font-bold">Multi-Layer Obfuscation:</span> Combines variable renaming, string splitting, and control flow flattening.</li>
            <li><span className="text-primary font-bold">Smart Presets:</span> Choose from <span className="italic">Minify</span> (speed) to <span className="italic">Strong</span> (maximum security).</li>
            <li><span className="text-primary font-bold">Custom Configuration:</span> Fine-tune every aspect of the obfuscation process via the Custom panel.</li>
            <li><span className="text-primary font-bold">Real-time Terminal:</span> Monitor the obfuscation process with live logs and status updates.</li>
            <li><span className="text-primary font-bold">Cross-Platform:</span> Supports Lua 5.1 and LuaU (Roblox) environments.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-bold uppercase text-primary mb-2">Usage Instructions</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li><span className="text-primary font-bold">Upload:</span> Drag and drop your <span className="code">.lua</span> or <span className="code">.txt</span> file into the terminal or use the "Upload File" button.</li>
            <li><span className="text-primary font-bold">Select Preset:</span> Choose a security level. Use <span className="italic">Strong</span> for production scripts.</li>
            <li><span className="text-primary font-bold">Run:</span> Click the "Run" button to start the process. Monitor the terminal for progress.</li>
            <li><span className="text-primary font-bold">Export:</span> Once complete, use "Download Result" or "Copy Result" to retrieve your protected code.</li>
          </ol>
        </section>

        <section>
          <h3 className="text-lg font-bold uppercase text-primary mb-2">Tips & Troubleshooting</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><span className="text-primary font-bold">Large Files:</span> Processing very large scripts may take a few moments. The terminal will update once complete.</li>
            <li><span className="text-primary font-bold">LuaU Support:</span> If you are obfuscating for Roblox, ensure you select a preset that supports LuaU syntax.</li>
            <li><span className="text-primary font-bold">Error Logs:</span> If obfuscation fails, check the terminal for red error messages. Most issues are due to syntax errors in the source file.</li>
          </ul>
        </section>

        <section className="pt-4 border-t border-primary/20">
          <p>
            Join our community for support and updates: 
            <a href="https://discord.gg/z5GwQ2fhYJ" target="_blank" rel="noopener noreferrer" className="ml-2 text-primary underline hover:opacity-80 transition-opacity">
              Discord Server
            </a>
          </p>
        </section>
      </div>
    </motion.div>
  );
}
