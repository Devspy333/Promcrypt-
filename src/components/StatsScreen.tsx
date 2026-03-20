import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface StatsScreenProps {
  visitCount: number;
  uploadCount: number;
}

export default function StatsScreen({ visitCount, uploadCount }: StatsScreenProps) {
  const [liveActive, setLiveActive] = useState(Math.floor(Math.random() * 50) + 10);
  const [liveProcessed, setLiveProcessed] = useState(uploadCount * 13 + 1420);
  const [networkTraffic, setNetworkTraffic] = useState(Math.floor(Math.random() * 1000) + 500);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate active users
      setLiveActive(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2));
      
      // Occasionally increment processed
      if (Math.random() > 0.6) {
        setLiveProcessed(prev => prev + 1);
      }

      // Fluctuate network traffic
      setNetworkTraffic(Math.floor(Math.random() * 1000) + 500);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="border-2 border-[#00FF00] p-6 mb-6 shadow-[0_0_10px_#00FF0033]"
    >
      <h2 className="text-2xl font-bold mb-6 uppercase text-[#00FF00]">Live System Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[#00FF00] p-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#00FF00] animate-pulse"></div>
          <p className="text-sm opacity-70 uppercase">Active Users</p>
          <p className="text-3xl font-bold">{liveActive}</p>
        </div>
        <div className="border border-[#00FF00] p-4">
          <p className="text-sm opacity-70 uppercase">Total Visits</p>
          <p className="text-3xl font-bold">{visitCount}</p>
        </div>
        <div className="border border-[#00FF00] p-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#00FF00] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <p className="text-sm opacity-70 uppercase">Files Processed</p>
          <p className="text-3xl font-bold">{liveProcessed}</p>
        </div>
        <div className="border border-[#00FF00] p-4">
          <p className="text-sm opacity-70 uppercase">Network Traffic</p>
          <p className="text-3xl font-bold">{networkTraffic} <span className="text-sm opacity-70">KB/s</span></p>
        </div>
      </div>
    </motion.div>
  );
}
