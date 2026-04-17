/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy:        '#0B1629',
        'navy-mid':  '#12213A',
        'navy-soft': '#1A2F50',
        teal:        '#00C6B5',
        'teal-dim':  '#009E90',
        gold:        '#F5A623',
        'sla-p1':    '#E83A4A',
        'sla-p2':    '#F06A1A',
        'sla-p3':    '#EDA500',
        'sla-p4':    '#94A3B8',
        success:     '#10B882',
        purple:      '#7C5CFC',
        surface:     '#F5F7FA',
        'dark-bg':   '#0A0A0A',
        'dark-card': '#1A1A1A',
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 10px rgba(232, 58, 74, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 20px rgba(232, 58, 74, 0.5)' },
        },
        'shimmer-light': {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer-light': 'shimmer-light 1.4s infinite linear',
      },
    },
  },
  plugins: [],
};
