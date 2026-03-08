import React from 'react';
import { motion } from 'motion/react';

export default function TableScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 overflow-x-auto"
    >
      <h2 className="text-xl font-bold mb-4 uppercase text-[#00FF00]">Obfuscation Presets</h2>
      <table className="w-full text-sm border-collapse border border-[#00FF00]">
        <thead>
          <tr className="border-b border-[#00FF00] bg-[#00FF00] text-black">
            <th className="p-2 text-left">NAME</th>
            <th className="p-2 text-left">SIZE</th>
            <th className="p-2 text-left">SPEED</th>
            <th className="p-2 text-left">EFFECT (.txt)</th>
            <th className="p-2 text-left">EFFECT (.lua)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#00FF00] opacity-80 hover:opacity-100 transition-opacity">
            <td className="p-2 font-bold">Minify</td>
            <td className="p-2">tiny</td>
            <td className="p-2">fastest</td>
            <td className="p-2">Base64 encoding</td>
            <td className="p-2">Prometheus Minify Preset</td>
          </tr>
          <tr className="border-b border-[#00FF00] opacity-80 hover:opacity-100 transition-opacity">
            <td className="p-2 font-bold">Weak</td>
            <td className="p-2">small</td>
            <td className="p-2">fast</td>
            <td className="p-2">XOR with fixed key (0xAA)</td>
            <td className="p-2">Prometheus Weak Preset</td>
          </tr>
          <tr className="border-b border-[#00FF00] opacity-80 hover:opacity-100 transition-opacity">
            <td className="p-2 font-bold">Medium</td>
            <td className="p-2">medium</td>
            <td className="p-2">medium</td>
            <td className="p-2">AES‑128‑GCM encryption</td>
            <td className="p-2">Prometheus Medium Preset</td>
          </tr>
          <tr className="opacity-80 hover:opacity-100 transition-opacity">
            <td className="p-2 font-bold">Strong</td>
            <td className="p-2">huge</td>
            <td className="p-2">slowest</td>
            <td className="p-2">AES‑256‑GCM encryption</td>
            <td className="p-2">Prometheus Strong Preset</td>
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
}
