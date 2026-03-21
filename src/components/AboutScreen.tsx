import React from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PROMCRYPT_DOCS } from '../constants';

export default function AboutScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border-2 border-primary p-6 mb-6 shadow-[0_0_10px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)] max-h-[600px] overflow-y-auto"
    >
      <h2 className="text-2xl font-bold mb-4 uppercase text-primary">About Promcrypt</h2>
      <p className="mb-4 text-sm leading-relaxed opacity-80">
        Promcrypt is a powerful obfuscation suite designed for Lua scripts and text files. 
        It leverages the Prometheus Obfuscator engine to provide multiple layers of protection, 
        making your code difficult to reverse-engineer and tamper with.
      </p>
      <p className="mb-6 text-sm leading-relaxed opacity-80">
        Whether you need simple minification or robust AES-256-GCM encryption, 
        Promcrypt has a preset to match your security requirements.
      </p>
      <p className="mb-6 text-sm leading-relaxed opacity-80">
        Join our Discord server: <a href="https://discord.gg/z5GwQ2fhYJ" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://discord.gg/z5GwQ2fhYJ</a>
      </p>
      
      <div className="markdown-body text-sm opacity-80">
        <Markdown remarkPlugins={[remarkGfm]}>{PROMCRYPT_DOCS}</Markdown>
      </div>
    </motion.div>
  );
}
