/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy:        '#0B1629',
        'navy-mid':  '#12213A',
        'navy-soft': '#1A2F50',
        teal:        '#00C6B5',
        'teal-dim':  '#009E90',
        'teal-light':'#E6FAF8',
        gold:        '#F5A623',
        'sla-p1':    '#EF4444',
        'sla-p2':    '#F97316',
        'sla-p3':    '#EAB308',
        'sla-p4':    '#94A3B8',
        success:     '#10B981',
        purple:      '#8B5CF6',
        surface:     '#F8FAFC',
        border:      '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.08)',
        'modal': '0 25px 50px -12px rgba(0,0,0,0.25)',
        'glow': '0 0 20px rgba(0, 198, 181, 0.3)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-dot': 'pulse-dot 1.5s infinite',
        'spin': 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
};
