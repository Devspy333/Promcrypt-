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
      whileHover={!disabled ? { scale: 1.05, boxShadow: "0 0 10px var(--theme-primary)" } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`border border-primary px-4 py-2 uppercase transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-bg-base'
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
