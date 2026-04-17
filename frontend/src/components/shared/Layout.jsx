import React from 'react';

/**
 * Layout wrapper component for pages
 * Provides proper dark mode background and text colors with smooth transitions
 * Usage: Wrap your page content with <Layout><YourPage /></Layout>
 */
export default function Layout({ children, className = '' }) {
  return (
    <div className={`
      min-h-screen w-full
      bg-white text-slate-900
      dark:bg-[#0A0A0A] dark:text-slate-100
      transition-colors duration-300
      ${className}
    `}>
      {children}
    </div>
  );
}
