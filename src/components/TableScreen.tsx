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
      <h2 className="text-xl font-bold mb-4 uppercase text-primary">Presets</h2>
      <p className="mb-4 text-sm opacity-80">The following table provides an overview over the presets</p>
      <table className="w-full text-sm border-collapse border border-primary">
        <thead>
          <tr className="border-b border-primary bg-primary text-bg-base">
            <th className="p-2 text-left">name</th>
            <th className="p-2 text-left">size</th>
            <th className="p-2 text-left">speed</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-primary opacity-80 hover:opacity-100 transition-opacity">
            <td className="p-2 font-bold">Minify</td>
            <td className="p-2">tiny</td>
            <td className="p-2">fastest</td>
          </tr>
          <tr className="border-b border-primary opacity-80 hover:opacity-100 transition-opacity">
            <td className="p-2 font-bold">Weak</td>
            <td className="p-2">small</td>
            <td className="p-2">fast</td>
          </tr>
          <tr className="border-b border-primary opacity-80 hover:opacity-100 transition-opacity">
            <td className="p-2 font-bold">Medium</td>
            <td className="p-2">medium</td>
            <td className="p-2">medium</td>
          </tr>
          <tr className="opacity-80 hover:opacity-100 transition-opacity">
            <td className="p-2 font-bold">Strong</td>
            <td className="p-2">huge</td>
            <td className="p-2">slowest</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-6 text-sm opacity-80">Created by iamnotvision</p>
    </motion.div>
  );
}
