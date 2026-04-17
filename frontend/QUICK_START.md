# ComplaintIQ UI Polish - Quick Start Guide

## 🎨 What's New

Your ComplaintIQ dashboard now features:

### ✨ Dark Mode
- Toggle between light and dark themes
- Auto-saves preference to localStorage
- Smooth 0.3s transitions
- Respects system preference

### 🔮 Glassmorphism Design
- Modern glass-effect cards
- Backdrop blur effects
- Subtle borders and shadows
- Hover animations

### 📊 Interactive Complaint Queue
- Sort by: Date, Severity, SLA Deadline
- Search: Complaint ID, Customer name, Description
- Filter by: Product, Status
- Real-time updates with animations

### 🎯 Smart Severity Indicators
- **P1 (Critical)**: Red with glowing pulse
- **P2 (High)**: Amber
- **P3 (Medium)**: Gold

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Try the Features

#### Dark Mode
1. Click the **sun/moon icon** in the top-right navbar
2. Watch the interface smoothly transition
3. Refresh the page - your preference is saved!

#### Complaint Queue Table
1. Navigate to `/agent/queue`
2. **Sort**: Click any column header (Date, Severity, SLA Deadline)
3. **Search**: Type in the search bar above the table
4. **Filter**: Click "Product" or "Status" dropdowns
5. **Multi-select**: Choose multiple options in filters
6. **Remove filters**: Click the X on filter tags

#### Glassmorphic Design
- Notice the semi-transparent cards with blur effects
- Hover over cards to see them slightly lift
- Cards look different in light vs dark mode

## 📁 Project Structure

```
frontend/
├── src/
│   ├── context/
│   │   └── ThemeContext.jsx          # Theme management
│   ├── components/
│   │   ├── shared/
│   │   │   └── GlassCard.jsx         # Reusable glass card
│   │   └── agent/
│   │       └── ComplaintQueue.jsx    # Interactive table
│   ├── pages/
│   │   └── agent/AgentQueue.jsx      # Queue page
│   ├── App.jsx                       # Main app (has ThemeProvider)
│   └── index.css                     # Dark mode & glassmorphism styles
├── tailwind.config.js                # Dark mode config
└── package.json                      # Dependencies
```

## 💡 Code Examples

### Using Dark Mode in Your Components

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
        Toggle Theme
      </button>
    </div>
  );
}
```

### Using Glassmorphic Cards

```jsx
import GlassCard from '../components/shared/GlassCard';

function MyCard() {
  return (
    <GlassCard className="p-6">
      <h2>Your content here</h2>
      <p>This card has glassmorphism effect</p>
    </GlassCard>
  );
}
```

### Using the Complaint Queue

```jsx
import ComplaintQueue from '../components/agent/ComplaintQueue';

function QueuePage() {
  return <ComplaintQueue />;
}
```

## 🎨 Color Palette

### Light Mode
```
Background: #F8F9FA (off-white)
Cards: rgba(255, 255, 255, 0.8)
Text: #1A1A1A (dark)
Accent: #00C6B5 (teal)
```

### Dark Mode
```
Background: #0A0A0A (deep navy)
Cards: rgba(26, 26, 26, 0.8)
Text: #F5F5F5 (off-white)
Accent: #00C6B5 (teal)
```

### Severity Colors
```
P1/Critical: #E83A4A (red with glow)
P2/High: #F06A1A (orange)
P3/Medium: #EDA500 (gold)
```

## 🔧 Customization

### Change Dark Mode Background Color

Edit `tailwind.config.js`:
```js
colors: {
  'dark-bg': '#0A0A0A',   // Change this
}
```

### Adjust Animation Speed

Edit `tailwind.config.js`:
```js
animation: {
  'pulse-glow': 'pulse-glow 2s ... infinite',  // Change 2s to your preference
}
```

### Modify Glassmorphism Blur

Edit `index.css`:
```css
.glass-card {
  backdrop-filter: blur(16px);  /* Change 16px to more/less blur */
}
```

## 🐛 Troubleshooting

### Dark mode not saving
```javascript
// In browser console:
localStorage.removeItem('theme');
window.location.reload();
```

### Animations too fast/slow
- Check `tailwind.config.js` animation settings
- Adjust duration values (e.g., `transition={{ duration: 0.3 }}`)

### Glassmorphism blur not showing
- Ensure your browser supports `backdrop-filter`
- Fallback: CSS will still show semi-transparent cards

## 📊 Table Features Explained

### Sorting
Click any column header. Indicators show:
- 🔼 Ascending sort
- 🔽 Descending sort
- No indicator = unsorted

### Search
Matches partial strings in:
- Complaint ID (CMP001, CMP002, etc.)
- Customer name
- Description field

### Filtering
Multi-select filters for:
- **Product**: UPI, Savings, Credit Card
- **Status**: Open, In Progress, Resolved, Closed

You can combine search + multiple filters!

### Active Filters
Displayed below the filter buttons as removable tags:
- Teal tags for product filters
- Blue tags for status filters
- Click × to remove individual filters

## 📈 Performance

- **Animations**: GPU-optimized with Framer Motion
- **Re-renders**: Minimal with React Context memoization
- **Table**: Efficient with TanStack Table
- **Transitions**: CSS transforms for smooth 60fps

## 🌐 Browser Support

✅ Chrome 76+
✅ Firefox 70+
✅ Safari 15+
✅ Edge 79+
⚠️ Older browsers: Still works but no blur effect

## 📚 Next Steps

1. Explore the `/agent/queue` page with the new table
2. Toggle dark mode to see all the styling
3. Try sorting and filtering the complaints
4. Check out the severity badge animations (especially P1)
5. Extend dark mode to other pages using the `useTheme()` hook

## 🎓 Learn More

- [Tailwind Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [TanStack React Table](https://tanstack.com/table/v8)

## ❓ Need Help?

Check `DARK_MODE_SETUP.md` for detailed documentation.

---

**Happy designing! Your dashboard is now modern and polished.** ✨
