import React from 'react';
import { motion } from 'motion/react';

export default function AboutScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="border-2 border-[#00FF00] p-6 mb-6 shadow-[0_0_10px_#00FF0033]"
    >
      <h2 className="text-2xl font-bold mb-4 uppercase text-[#00FF00]">About Promcrypt</h2>
      <p className="mb-4 text-sm leading-relaxed opacity-80">
        Promcrypt is a powerful obfuscation suite designed for Lua scripts and text files. 
        It leverages the Prometheus Obfuscator engine to provide multiple layers of protection, 
        making your code difficult to reverse-engineer and tamper with.
      </p>
      <p className="text-sm leading-relaxed opacity-80">
        Whether you need simple minification or robust AES-256-GCM encryption, 
        Promcrypt has a preset to match your security requirements.
      </p>
    </motion.div>
  );
}
