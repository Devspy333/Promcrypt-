import React from 'react';
import { motion } from 'motion/react';

interface TerminalButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  key?: string | number;
}

export default function TerminalButton({ onClick, children, className, disabled }: TerminalButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, boxShadow: "0 0 10px #FF8C00" } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`border border-[#FF8C00] px-4 py-2 uppercase transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FF8C00] hover:text-black'
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
