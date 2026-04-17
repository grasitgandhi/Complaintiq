import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function GlassCard({ children, className = '', onClick, animated = true, ...props }) {
  const { isDark } = useTheme();

  const baseClasses = `glass-card rounded-lg transition-all duration-300 ${className}`;

  const content = (
    <div
      className={baseClasses}
      style={{
        background: isDark
          ? 'rgba(26, 26, 26, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)',
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
