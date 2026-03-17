import React from 'react';
import { motion } from 'motion/react';

interface StatsScreenProps {
  visitCount: number;
  uploadCount: number;
}

export default function StatsScreen({ visitCount, uploadCount }: StatsScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="border-2 border-[#00FF00] p-6 mb-6 shadow-[0_0_10px_#00FF0033]"
    >
      <h2 className="text-2xl font-bold mb-6 uppercase text-[#00FF00]">System Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[#00FF00] p-4">
          <p className="text-sm opacity-70 uppercase">Total Visits</p>
          <p className="text-3xl font-bold">{visitCount}</p>
        </div>
        <div className="border border-[#00FF00] p-4">
          <p className="text-sm opacity-70 uppercase">Files Uploaded</p>
          <p className="text-3xl font-bold">{uploadCount}</p>
        </div>
      </div>
    </motion.div>
  );
}
