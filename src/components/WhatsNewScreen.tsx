import React from 'react';
import { motion } from 'motion/react';

export default function WhatsNewScreen() {
  const updates = [
    {
      version: "v2.1.0",
      date: "2026-03-20",
      title: "Promcrypt Backend Removal",
      details: [
        "Transitioned back to client-side SPA.",
        "Removed CyCraft Prometheus Decryptor integration.",
        "Optimized bundle size and improved performance."
      ]
    },
    {
      version: "v2.0.0",
      date: "2026-03-19",
      title: "Promcrypt Integration",
      details: [
        "Added advanced Promcrypt ransomware decryption.",
        "Integrated AES, Base64, Hex, and Classic Ciphers.",
        "Added CyCraft Prometheus Decryptor binary support."
      ]
    },
    {
      version: "v1.5.0",
      date: "2026-02-15",
      title: "Custom Presets",
      details: [
        "Added Custom Preset Panel.",
        "Users can now configure specific obfuscation parameters."
      ]
    },
    {
      version: "v1.0.0",
      date: "2026-01-01",
      title: "Initial Release",
      details: [
        "Basic Lua minification and obfuscation.",
        "Retro CRT terminal interface."
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="border-2 border-[#FF8C00] p-6 mb-6 shadow-[0_0_10px_#00FF0033] h-[500px] overflow-y-auto"
    >
      <h2 className="text-2xl font-bold mb-6 uppercase text-[#00FF00] border-b border-[#00FF00] pb-2">What's New in Promcrypt</h2>
      
      <div className="space-y-8">
        {updates.map((update, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border-l-2 border-[#00FF00] pl-4"
          >
            <div className="flex items-baseline gap-3 mb-1">
              <h3 className="text-xl font-bold text-white">{update.version}</h3>
              <span className="text-sm opacity-70">{update.date}</span>
            </div>
            <h4 className="text-lg text-[#00FF00] mb-2">{update.title}</h4>
            <ul className="list-disc pl-5 space-y-1 opacity-90">
              {update.details.map((detail, j) => (
                <li key={j}>{detail}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
