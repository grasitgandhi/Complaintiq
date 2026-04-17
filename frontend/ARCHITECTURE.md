# ComplaintIQ Architecture - Theme & Table System

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          App.jsx                            │
│   (Wrapped with ThemeProvider)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────────┐    ┌────────────────────────┐
│   Auth Provider      │    │  Theme Provider        │
│                      │    │ (ThemeContext.jsx)     │
│ - User state         │    │ - isDark: boolean      │
│ - Login/Logout       │    │ - toggleTheme()        │
│ - Role-based access  │    │ - localStorage persist │
└──────────────────────┘    └────────────────────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │                             │
        ▼                             ▼
┌─────────────────────┐    ┌────────────────────────┐
│  Routes             │    │ Dark Mode System       │
│ - /login            │    │                        │
│ - /customer/*       │    │ CSS Variables:         │
│ - /agent/queue      │    │ - --bg-primary         │
│ - /manager/*        │    │ - --text-primary       │
└─────────────────────┘    │ - Transitions 0.3s     │
                           └────────────────────────┘
        │
        └──────────────┬──────────────────────────────┐
                       │                              │
        ┌──────────────▼────────────┐    ┌────────────▼──────────┐
        │                           │    │                       │
        ▼                           ▼    ▼                       ▼
   ┌─────────────┐    ┌────────────────────┐    ┌──────────────────┐
   │ Customer    │    │  Agent Queue Page  │    │ Manager Pages    │
   │ Pages       │    │                    │    │                  │
   │             │    │ ┌────────────────┐ │    │ ┌──────────────┐ │
   │ - NewComp   │    │ │Sidebar         │ │    │ │ Overview     │ │
   │ - Track     │    │ │- Theme Toggle  │ │    │ │ - Dashboard  │ │
   │ - Detail    │    │ │- Nav Items     │ │    │ │ - SLA Table  │ │
   │             │    │ │- User Info     │ │    │ │ - Reports    │ │
   │ Features:   │    │ └────────────────┘ │    │ │ - Analytics  │ │
   │ - Theme     │    │                    │    │ └──────────────┘ │
   │   toggle    │    │ ┌────────────────┐ │    │ All support:     │
   │ - Glass     │    │ │ComplaintQueue  │ │    │ - Theme toggle   │
   │   cards     │    │ │                │ │    │ - Glass cards    │
   │             │    │ │ Sorting ✓      │ │    │ - Dark mode      │
   │ Has access  │    │ │ Searching ✓    │ │    └──────────────────┘
   │ to useTheme │    │ │ Filtering ✓    │ │
   └─────────────┘    │ │ Animations ✓   │ │
                      │ └────────────────┘ │
                      │                    │
                      │ Severity Badges:   │
                      │ - P1: Glowing      │
                      │ - P2: Orange       │
                      │ - P3: Gold         │
                      └────────────────────┘
```

---

## Component Hierarchy

```
App
├── AuthProvider
└── ThemeProvider (NEW)
    └── BrowserRouter
        ├── Login
        ├── Customer Routes
        │   ├── NewComplaint
        │   │   ├── CustomerTopbar (Theme Toggle)
        │   │   └── NewComplaint Component
        │   ├── TrackComplaint
        │   │   ├── CustomerTopbar (Theme Toggle)
        │   │   └── TrackComplaint Component
        │   └── ComplaintDetail
        │       ├── CustomerTopbar (Theme Toggle)
        │       └── ComplaintDetail Component
        │
        ├── Agent Routes
        │   └── /agent/queue
        │       ├── SidebarNav (Theme Toggle)
        │       └── AgentQueue Page
        │           └── ComplaintQueue (NEW)
        │               ├── Search Bar
        │               ├── Filter Dropdowns
        │               │   ├── Product Filter
        │               │   └── Status Filter
        │               ├── Complaint Table
        │               │   └── Rows (Animated)
        │               │       └── SeverityBadge (Animated)
        │               └── Table Footer
        │
        └── Manager Routes
            ├── /manager/overview
            ├── /manager/sla
            ├── /manager/reports
            └── /manager/agents
```

---

## Theme System Data Flow

```
┌──────────────────────────────────────────────────────┐
│ User Clicks Theme Toggle Button (Sun/Moon Icon)     │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ toggleTheme() called in useTheme()                    │
│ State: isDark = !isDark                              │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ ThemeContext updates all subscribers               │
│ (All components using useTheme)                     │
└────────────────┬─────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌──────────────────────┐  ┌──────────────────────────┐
│ localStorage.setItem │  │ document.documentElement│
│ ('theme', 'dark')   │  │ .classList.add('dark')  │
│ → Checks: isDark ?  │  │ [OR .remove('dark')]     │
└──────────────────────┘  └──────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │ CSS Applies Styles:      │
                    │                          │
                    │ html.dark {              │
                    │ --bg-primary: #0A0A0A;  │
                    │ --text-primary: #F5F5F5;│
                    │ ...                      │
                    │ }                        │
                    └──────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │ All subscribed components│
                    │ re-render with new styles│
                    │ (0.3s transition)        │
                    └──────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │ Preference Persisted!    │
                    │ (Next page load uses it) │
                    └──────────────────────────┘
```

---

## Table Filtering Logic

```
┌─────────────────────────────────────┐
│ Raw Data (All Complaints)           │
├─────────────────────────────────────┤
│ - ID: CMP001, Status: open, etc.    │
│ - ID: CMP002, Status: in_progress   │
│ - ID: CMP003, Status: resolved      │
│ - ... (sample data from component)  │
└────────────┬────────────────────────┘
             │
    ┌────────┴─────────┬──────────────┬──────────┐
    │                  │              │          │
    ▼                  ▼              ▼          ▼
┌─────────┐  ┌──────────────┐  ┌──────────┐ ┌─────────┐
│ Global  │  │ Product      │  │ Status   │ │ Sorting │
│ Search  │  │ Filter       │  │ Filter   │ │ Order   │
│         │  │              │  │          │ │         │
│ Type    │  │ UPI ☐        │  │ Open ☑   │ │ Date ▼  │
│ text... │  │ Savings ☑    │  │ In Prog ☐│ │ Sev ▼   │
│         │  │ Credit ☐     │  │ Resolved │ │ SLA     │
└────┬────┘  │ Card         │  │ ☑ Closed │ │ (Apply) │
     │       │ ☑            │  │ ☐        │ │         │
     │       └──────┬───────┘  └────┬─────┘ └────┬────┘
     │              │               │            │
     └──────────────┼───────────────┼────────────┘
                    │               │
                    ▼               ▼
            ┌───────────────────────────────┐
            │ Apply Filters (useMemo)       │
            │                               │
            │ 1. Filter by search text      │
            │ 2. Filter by products         │
            │ 3. Filter by status           │
            │ 4. Sort by selected column    │
            │ 5. Return filtered data       │
            └───────────┬───────────────────┘
                        │
                        ▼
            ┌───────────────────────────────┐
            │ Filtered Data (TanStack Table)│
            ├───────────────────────────────┤
            │ - CMP002, Savings, in_progress│
            │ - CMP003, Savings, resolved   │
            │ ... (results matching filters)│
            └───────────┬───────────────────┘
                        │
                        ▼
            ┌───────────────────────────────┐
            │ Render Table Rows             │
            │ (With Framer Motion animation)│
            │ - Row 1: delay 0ms            │
            │ - Row 2: delay 50ms           │
            │ - Row 3: delay 100ms          │
            │ ...                           │
            └───────────────────────────────┘
```

---

## Glassmorphism Implementation

```
┌──────────────────────────────────────────────────┐
│ .glass-card Element                              │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Semi-Transparent Background                │
│     background: rgba(26, 26, 26, 0.8)    [Dark]│
│     background: rgba(255, 255, 255, 0.8) [Light]
│                                                  │
│  2. Border (Subtle)                            │
│     border: 1px solid rgba(255,255,255, 0.1)   │
│                                                  │
│  3. Backdrop Blur (GPU Optimized)               │
│     backdrop-filter: blur(16px)                 │
│     -webkit-backdrop-filter: blur(16px)         │
│                                                  │
│  4. Drop Shadow                                 │
│     box-shadow: 0 8px 32px rgba(0,0,0, 0.3)    │
│                                                  │
│  5. Hover State (Animated)                      │
│     transform: translateY(-2px)                 │
│     box-shadow: 0 6px 32px rgba(0,0,0, 0.4)    │
│     transition: all 0.3s cubic-bezier(...)      │
│                                                  │
└──────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────┐
│ HTML Element Behind (Visible Through Blur)      │
│ ────────────────────────────────────────────────│
│ Background gradient + content                   │
└──────────────────────────────────────────────────┘
```

---

## Animation Timeline

```
User Action: Dark Mode Toggle Click
│
├─ Immediate: onClick handler called
│
├─ 0ms   : toggleTheme() executes
│          isDark state updates
│          
├─ 0-50ms: Browser paints new isDark value
│         Re-renders all useTheme subscribers
│
├─ 50ms-350ms: CSS Transitions applied
│             background-color: 0.3s ease
│             color: 0.3s ease
│             All other: transition 0.3s
│
└─ 350ms: Theme change complete

---

Table Row Animation (Per Row)
│
├─ Row 1: 0-200ms   (Framer Motion)
├─ Row 2: 50-250ms  (delay 50ms from start)
├─ Row 3: 100-300ms (delay 100ms from start)
├─ Row 4: 150-350ms (delay 150ms from start)
│
└─ All active with staggered cascade effect
```

---

## File Dependencies

```
App.jsx
├── Imports: ThemeProvider, useTheme
│
├── Wraps entire app
│
└── CustomerTopbar
    ├── Uses: useTheme
    └── Has: Sun/Moon toggle button

AgentQueue.jsx
├── Uses: ComplaintQueue component
└── Uses: useTheme for background colors

ComplaintQueue.jsx
├── Uses: useTheme for styling
├── Uses: useReactTable (TanStack)
├── Uses: motion (Framer Motion)
├── Imports: SeverityBadge, StatusBadge components
└── Imports: Search, Filter, ChevronDown (Lucide)

SidebarNav.jsx
├── Uses: useTheme
└── Has: Theme toggle button

GlassCard.jsx
├── Uses: useTheme
├── Uses: motion (Framer Motion)
└── Applies: .glass-card class

ThemeContext.jsx (NEW)
├── Creates: ThemeProvider component
├── Creates: useTheme hook
└── Manages: localStorage + DOM updates
```

---

## State Management

```
Global State (React Context)
│
└── ThemeContext
    ├── State: isDark (boolean)
    ├── Setter: toggleTheme()
    ├── Storage: localStorage['theme']
    └── Persistent: ✓ Yes
    
    Consumers (Any component):
    ├── CustomerTopbar
    ├── SidebarNav
    ├── ComplaintQueue
    ├── Pages using background colors
    └── ... (any component with useTheme)

Local State (Component Level)
│
├── ComplaintQueue
│   ├── sorting (TanStack Table)
│   ├── globalFilter (search)
│   ├── productFilter (multi-select)
│   ├── statusFilter (multi-select)
│   ├── showProductDropdown (UI state)
│   └── showStatusDropdown (UI state)
│
└── Page Components
    └── Various local states for forms, etc.
```

---

## Performance Optimizations

```
✓ Theme Context Memoized
  - useTheme hook doesn't cause unnecessary re-renders
  - Only affected components re-render

✓ Table Filtering Memoized
  - useMemo for filtered data calculation
  - Only recalculates when dependencies change

✓ TanStack Table Optimized
  - Efficient sorting logic
  - Minimal DOM updates per filter

✓ Framer Motion GPU Optimized
  - Uses transform and opacity (GPU)
  - No paint/layout triggers

✓ CSS Transitions GPU Accelerated
  - Hardware acceleration for theme toggle
  - backdrop-filter is GPU optimized
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Reusable components
- ✅ Scalable theme system
- ✅ Smooth animations
- ✅ Efficient rendering
- ✅ Easy to maintain and extend
