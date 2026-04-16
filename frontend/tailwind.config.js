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
        gold:        '#F5A623',
        'sla-p1':    '#E83A4A',
        'sla-p2':    '#F06A1A',
        'sla-p3':    '#EDA500',
        'sla-p4':    '#94A3B8',
        success:     '#10B882',
        purple:      '#7C5CFC',
        surface:     '#F5F7FA',
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
      },
    },
  },
  plugins: [],
};
