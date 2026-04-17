# ComplaintIQ UI Polish - Dark Mode & Glassmorphism Guide

This document outlines all the enhancements made to the ComplaintIQ React dashboard to improve UI/UX with modern design patterns.

## Overview

The following features have been implemented:

### 1. Dark Mode Toggle ✅
- **Strategy**: Tailwind CSS `class` strategy (`darkMode: 'class'`)
- **Storage**: Theme preference saved to localStorage
- **System Preference**: Respects system preference if no localStorage value
- **Toggle Buttons**: 
  - Floating sun/moon icon in the customer navbar (using Lucide React icons)
  - Additional toggle in the agent sidebar for easy access

### 2. Glassmorphism Design ✅
- **Cards**: Subtle 1px border (`border-white/10`), backdrop blur effect (`backdrop-filter: blur(16px)`)
- **Shadows**: Soft shadows with different intensity for light/dark modes
- **Background**: Semi-transparent backgrounds (0.7-0.8 opacity)
- **Hover Effects**: Smooth transitions and slight lift effect on hover
- **Component**: Reusable `GlassCard` component in `src/components/shared/GlassCard.jsx`

### 3. Interactive Complaint Queue Table ✅
- **Component**: `ComplaintQueue.jsx` in `src/components/agent/ComplaintQueue.jsx`
- **Features**:
  - **Sorting**: Clickable headers for Date, Severity, SLA Deadline
  - **Searching**: Global search bar for Complaint ID, Customer name, Description
  - **Filtering**: 
    - Multi-select Product filter (UPI, Savings, Credit Card)
    - Multi-select Status filter (Open, In Progress, Resolved, Closed)
  - **Visual Feedback**: Active filters shown as removable tags

### 4. AI Visuals - Severity Badges ✅
- **Color Coding**:
  - 🔴 **P1 (Critical)**: Red (#E83A4A) with glowing pulse animation
  - 🟠 **P2 (High)**: Amber (#F06A1A)
  - 🟡 **P3 (Medium)**: Gold (#EDA500)
- **Animations**:
  - Entering badges have scale animation
  - P1 badges include glowing pulse effect (`animate-pulse-glow`)

### 5. Animations with Framer Motion ✅
- **Theme Transitions**: Smooth 0.3s transitions between light/dark modes
- **Table Animations**:
  - Row entry animations with staggered timing (50ms delay per row)
  - Filter dropdown animations
  - Badge entry animations
  - No results message with fade-in animation
- **Duration**: Consistent 0.2-0.4s durations for quick, responsive feel

## File Structure

```
frontend/
├── src/
│   ├── context/
│   │   ├── ThemeContext.jsx          # New: Theme provider & hook
│   │   └── AuthContext.jsx           # Existing
│   ├── components/
│   │   ├── shared/
│   │   │   ├── GlassCard.jsx         # New: Reusable glassmorphic card
│   │   │   └── Header.jsx
│   │   └── agent/
│   │       ├── ComplaintQueue.jsx    # New: Interactive table component
│   │       ├── SidebarNav.jsx        # Updated: Added theme toggle
│   │       └── ... (other components)
│   ├── pages/
│   │   ├── agent/
│   │   │   └── AgentQueue.jsx        # Updated: Uses new ComplaintQueue
│   │   └── ... (other pages)
│   ├── App.jsx                       # Updated: Added ThemeProvider wrapper
│   └── index.css                     # Updated: Dark mode styles & glassmorphism
├── tailwind.config.js                # Updated: Dark mode config & utilities
└── package.json                      # Updated: Added framer-motion, @tanstack/react-table
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This installs the new packages:
- `framer-motion@^11.0.0` - For smooth animations
- `@tanstack/react-table@^8.17.0` - For table logic

### 2. Configuration Already Done

The following are already configured:

✅ **Tailwind Config** (`tailwind.config.js`):
- Dark mode enabled with `class` strategy
- Custom colors for dark mode (`--dark-bg`, `--dark-card`)
- Keyframes for `pulse-glow` animation
- Glassmorphism shadows defined

✅ **Global Styles** (`index.css`):
- CSS variables for light/dark mode
- Glasmorphism class utilities
- Dark mode scrollbar styles
- Table and component base styles

✅ **App Wrapper** (`App.jsx`):
- `ThemeProvider` wraps all routes
- `useTheme` hook available in all components

### 3. Usage Examples

#### Using Dark Mode in Components

```jsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <div style={{ 
      background: isDark ? '#1A1A1A' : '#FFFFFF',
      color: isDark ? '#F5F5F5' : '#1A1A1A',
    }}>
      <button onClick={toggleTheme}>
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );
}
```

#### Using Glassmorphic Cards

```jsx
import GlassCard from '../components/shared/GlassCard';

function MyPage() {
  return (
    <GlassCard className="p-6">
      <h2>Content here</h2>
    </GlassCard>
  );
}
```

#### Table Sorting & Filtering

The `ComplaintQueue` component handles all table logic internally. To use it:

```jsx
import ComplaintQueue from '../components/agent/ComplaintQueue';

export default function QueuePage() {
  return <ComplaintQueue />;
}
```

## Color Palette

### Light Mode
- **Primary Background**: `#F8F9FA` (off-white)
- **Cards**: `rgba(255, 255, 255, 0.8)`
- **Text**: `#1A1A1A` (dark navy)
- **Secondary Text**: `#64748B` (slate)

### Dark Mode
- **Primary Background**: `#0A0A0A` (deep navy/charcoal)
- **Cards**: `rgba(26, 26, 26, 0.8)`
- **Text**: `#F5F5F5` (off-white)
- **Secondary Text**: `#A0AEC0` (light slate)

### Accent Colors
- **Brand**: `#00C6B5` (teal)
- **P1/Critical**: `#E83A4A` (red)
- **P2/High**: `#F06A1A` (orange)
- **P3/Medium**: `#EDA500` (gold)
- **Success**: `#10B981` (green)

## Performance Considerations

1. **Animations**: Using Framer Motion's GPU-optimized transforms
2. **Re-renders**: Theme context uses proper memoization
3. **Transitions**: CSS transitions are GPU-accelerated
4. **Table**: TanStack Table provides efficient virtualization for large datasets

## Browser Support

- Modern browsers with CSS Grid, backdrop-filter, and CSS variables support
- Chrome 76+, Firefox 70+, Safari 15+, Edge 79+
- Graceful degradation for older browsers (backdrop blur not supported)

## Customization Guide

### Changing Color Scheme

Edit `tailwind.config.js`:

```js
colors: {
  'dark-bg': '#0A0A0A',   // Change dark background
  'dark-card': '#1A1A1A', // Change dark card color
}
```

Edit `index.css`:

```css
:root {
  --bg-primary: #F8F9FA;      /* Light mode primary */
  --text-primary: #1A1A1A;    /* Light mode text */
}

html.dark {
  --bg-primary: #0A0A0A;      /* Dark mode primary */
  --text-primary: #F5F5F5;    /* Dark mode text */
}
```

### Adjusting Animations

Modify durations in component files or `tailwind.config.js`:

```js
animation: {
  'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
```

### Adding New Glassmorphic Components

Use the `GlassCard` component or apply the `.glass-card` class:

```jsx
<div className="glass-card p-6 rounded-lg">
  Content with glassmorphism effect
</div>
```

## Troubleshooting

### Dark Mode Not Persisting

Clear localStorage and reload:
```javascript
localStorage.removeItem('theme');
window.location.reload();
```

### Glassmorphism Not Showing Blur

Ensure backdrop-filter is supported:
```css
@supports (backdrop-filter: blur(10px)) {
  .glass-card {
    backdrop-filter: blur(16px);
  }
}
```

### Table Animations Janky

Check if Framer Motion is properly installed:
```bash
npm list framer-motion
```

## Next Steps

1. **Apply to More Pages**: Extend dark mode to customer and manager pages
2. **Mobile Optimization**: Add touch-friendly theme toggle gesture
3. **Accessibility**: Add ARIA labels for theme toggle
4. **Analytics**: Track theme preference usage
5. **Persistence**: Sync theme preference to backend

## Browser DevTools Tips

### Testing Dark Mode

In Chrome DevTools:
1. Open Console
2. Run: `document.documentElement.classList.add('dark')`

### Performance Profiling

Use DevTools Performance tab to verify:
- Smooth 60fps theme transitions
- No layout shifts during animations

## References

- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [TanStack React Table](https://tanstack.com/table/v8)
- [Glassmorphism CSS](https://css-tricks.com/glassmorphism/)
