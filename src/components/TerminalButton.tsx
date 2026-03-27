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
      whileHover={!disabled ? { scale: 1.02, boxShadow: "0 0 15px rgba(179, 136, 255, 0.5)" } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`border border-primary/30 bg-primary/10 backdrop-blur-md px-4 py-2 rounded-lg uppercase tracking-wider font-semibold transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/20 hover:border-primary/60'
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
