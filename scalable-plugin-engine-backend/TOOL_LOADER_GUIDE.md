# 🔄 ToolLoader Component - Complete Guide

## Overview

A **production-ready, reusable React component** for displaying loading states with timeout handling, retry functionality, and alternative tool suggestions.

**Features:**
- ✨ Multiple animation styles (pulse, spinner, dots, bars)
- ⏱️ Automatic timeout detection
- 🔄 Retry button on timeout
- 📊 Progress bar with estimated time
- 🎯 Tool suggestions when loading fails
- 🎨 Dark/Light theme support
- 📱 Fully responsive
- ⚡ Pure CSS animations (no JavaScript animations)

---

## 📦 Installation

The component is located at `src/components/ToolLoader.tsx` - simply import and use!

```typescript
import { ToolLoader } from './components/ToolLoader';
```

---

## 🎯 Basic Usage

### Minimal Example

```typescript
import { ToolLoader } from './components/ToolLoader';

function App() {
  return <ToolLoader />;
}
```

This shows a loading screen with default settings:
- Tool name: "Tool Engine"
- Estimated time: 5 seconds
- Timeout: 30 seconds
- Dark theme
- Pulse animation

---

## 🔧 Props Reference

### ToolLoaderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `toolName` | `string` | `"Tool Engine"` | Name of the tool being loaded |
| `estimatedTime` | `number` | `5` | Estimated load time in seconds |
| `timeout` | `number` | `30` | Timeout duration in seconds |
| `onRetry` | `() => void` | `undefined` | Callback when retry button is clicked |
| `onSuggestedTool` | `(toolId: string) => void` | `undefined` | Callback when suggested tool is clicked |
| `theme` | `'dark' \| 'light'` | `'dark'` | Color theme |
| `animationStyle` | `'pulse' \| 'spinner' \| 'dots' \| 'bars'` | `'pulse'` | Loading animation style |
| `suggestedTools` | `ToolSuggestion[]` | Default 3 tools | Alternative tools to show on timeout |
| `isLoading` | `boolean` | `true` | External control for loading state |

### ToolSuggestion Type

```typescript
{
  id: string;
  name: string;
  description: string;
}
```

---

## 🎨 Usage Examples

### 1. Custom Tool Loading

```typescript
<ToolLoader
  toolName="Data Analyzer Pro"
  estimatedTime={8}
  timeout={45}
  theme="dark"
/>
```

### 2. With Retry Handler

```typescript
function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);

  const handleRetry = () => {
    console.log('Retrying...');
    setIsLoading(true);
    // Your retry logic here
  };

  return (
    <ToolLoader
      toolName="AI Engine"
      onRetry={handleRetry}
      isLoading={isLoading}
    />
  );
}
```

### 3. With Tool Suggestions

```typescript
<ToolLoader
  toolName="Complex Analysis Tool"
  estimatedTime={10}
  timeout={30}
  onSuggestedTool={(toolId) => {
    console.log('Switch to tool:', toolId);
    // Navigate to suggested tool
  }}
  suggestedTools={[
    { id: 'quick-stats', name: 'Quick Statistics', description: 'Fast statistical analysis' },
    { id: 'simple-viz', name: 'Simple Visualizer', description: 'Basic data visualization' },
    { id: 'data-preview', name: 'Data Preview', description: 'Preview your data quickly' }
  ]}
/>
```

### 4. Different Animation Styles

```typescript
// Pulse (default)
<ToolLoader animationStyle="pulse" />

// Spinner
<ToolLoader animationStyle="spinner" />

// Bouncing dots
<ToolLoader animationStyle="dots" />

// Bars
<ToolLoader animationStyle="bars" />
```

### 5. Light Theme

```typescript
<ToolLoader
  theme="light"
  toolName="PDF Generator"
  animationStyle="spinner"
/>
```

### 6. Complete Real-World Example

```typescript
import { useState, useEffect } from 'react';
import { ToolLoader } from './components/ToolLoader';

function ToolInterface() {
  const [isLoading, setIsLoading] = useState(true);
  const [toolReady, setToolReady] = useState(false);

  useEffect(() => {
    // Simulate tool loading
    const loadTool = async () => {
      try {
        // Your tool loading logic
        await fetch('/api/tools/data-analyzer/initialize');
        setToolReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load tool');
        // Loading will timeout and show retry
      }
    };

    if (isLoading) {
      loadTool();
    }
  }, [isLoading]);

  const handleRetry = () => {
    setIsLoading(true);
    setToolReady(false);
  };

  const handleSwitchTool = (toolId: string) => {
    window.location.href = `/tools/${toolId}`;
  };

  if (isLoading && !toolReady) {
    return (
      <ToolLoader
        toolName="Data Analyzer Pro"
        estimatedTime={7}
        timeout={25}
        onRetry={handleRetry}
        onSuggestedTool={handleSwitchTool}
        theme="dark"
        animationStyle="pulse"
        suggestedTools={[
          { id: 'quick-analyzer', name: 'Quick Analyzer', description: 'Lightweight analysis tool' },
          { id: 'csv-reader', name: 'CSV Reader', description: 'Simple CSV file reader' },
          { id: 'data-preview', name: 'Data Preview', description: 'Preview datasets instantly' }
        ]}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div>
      {/* Your tool interface */}
      <h1>Tool is ready!</h1>
    </div>
  );
}
```

---

## 🎭 Animation Styles

### 1. Pulse (Default)
Concentric circles with pulsing and ping effects. Best for: general loading.

### 2. Spinner
Classic rotating circle. Best for: technical tools, minimal design.

### 3. Dots
Four bouncing dots in sequence. Best for: friendly, casual tools.

### 4. Bars
Five vertical bars bouncing up and down. Best for: audio/data processing tools.

---

## 🎨 Theme Options

### Dark Theme (Default)
- Background: Dark gradient (slate-950 → indigo-950)
- Cards: Translucent dark with blur
- Text: White/light slate
- Accents: Vibrant gradients

### Light Theme
- Background: Light gradient (slate-50 → blue-50)
- Cards: White with subtle shadows
- Text: Dark slate
- Accents: Softer gradients

---

## ⏱️ Timeout Behavior

When loading exceeds the `timeout` duration:

1. **Animation stops** and UI transitions
2. **Warning icon** appears (yellow triangle)
3. **Message changes** to "Taking Longer Than Expected"
4. **Retry button** becomes visible
5. **Tool suggestions** appear below

**User can:**
- Click "Retry Loading" to restart
- Select a suggested alternative tool
- Wait (component stays in timeout state)

---

## 📊 Loading Steps

The component shows animated loading steps:

| Time | Step | Icon |
|------|------|------|
| 0s   | Connecting to engine... | 🔌 |
| 2s   | Loading dependencies... | 📦 |
| 4s   | Initializing modules... | ⚙️ |
| 6s   | Preparing interface... | 🎨 |
| 8s   | Almost ready... | ✨ |

Each step:
- Shows as grayed out before its time
- Pulses with blue ring when active
- Shows green checkmark when complete

---

## 🎨 Customization

### Change Animation Speed

Edit the component and adjust:

```typescript
// In animation components
animate-pulse  // Change duration
animate-bounce // Adjust timing
animate-spin   // Modify speed
```

### Change Colors

The component uses Tailwind classes. Modify:

```typescript
// Progress bar gradient
from-blue-500 via-purple-500 to-pink-500

// Button gradient
from-blue-600 to-purple-600

// Change to your brand colors
from-green-500 via-teal-500 to-cyan-500
```

### Add Custom Steps

Edit the `LoadingSteps` component:

```typescript
const steps = [
  { time: 0, label: 'Your custom step...', icon: '🎯' },
  { time: 3, label: 'Another step...', icon: '⚡' },
  // Add more steps
];
```

### Custom Suggested Tools

```typescript
const myTools = [
  { 
    id: 'tool-1', 
    name: 'Tool Name', 
    description: 'What it does' 
  },
  // Add more...
];

<ToolLoader suggestedTools={myTools} />
```

---

## 🔌 Integration Examples

### With React Router

```typescript
import { useNavigate } from 'react-router-dom';

function ToolPage() {
  const navigate = useNavigate();

  return (
    <ToolLoader
      onSuggestedTool={(toolId) => {
        navigate(`/tools/${toolId}`);
      }}
    />
  );
}
```

### With State Management (Redux)

```typescript
import { useDispatch } from 'react-redux';
import { retryToolLoad } from './toolSlice';

function ToolPage() {
  const dispatch = useDispatch();

  return (
    <ToolLoader
      onRetry={() => {
        dispatch(retryToolLoad());
      }}
    />
  );
}
```

### With API Loading

```typescript
function ToolPage({ toolId }: { toolId: string }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tools/${toolId}/load`)
      .then(() => setLoading(false))
      .catch(() => {
        // Will timeout and show retry
      });
  }, [toolId]);

  return (
    <ToolLoader
      toolName={`Tool ${toolId}`}
      isLoading={loading}
      onRetry={() => {
        setLoading(true);
      }}
    />
  );
}
```

---

## 📱 Responsive Design

The component is fully responsive:

- **Mobile (< 640px)**: Compact layout, smaller animations
- **Tablet (640px - 1024px)**: Medium size, full features
- **Desktop (> 1024px)**: Large layout, optimal spacing

**Responsive features:**
- `max-w-2xl` container adapts to screen
- `p-6` outer padding for breathing room
- `p-12` card padding scales nicely
- Text sizes scale with breakpoints

---

## ♿ Accessibility

The component includes:

- **High contrast** color combinations
- **Clear visual hierarchy**
- **Descriptive text** for screen readers
- **Keyboard navigation** (buttons are focusable)
- **ARIA labels** (can be added if needed)

**To improve accessibility:**

```typescript
<button
  onClick={handleRetry}
  aria-label="Retry loading the tool"
  role="button"
>
  Retry Loading
</button>
```

---

## 🎯 Best Practices

### 1. Set Realistic Times

```typescript
// Good
<ToolLoader estimatedTime={5} timeout={30} />

// Too short - users will see timeout too often
<ToolLoader estimatedTime={2} timeout={5} />

// Too long - users will give up
<ToolLoader estimatedTime={60} timeout={120} />
```

### 2. Provide Useful Suggestions

```typescript
// Good - Related tools
suggestedTools={[
  { id: 'lite-version', name: 'Lite Version', description: 'Faster, fewer features' },
  { id: 'alternative', name: 'Alternative Tool', description: 'Different approach' }
]}

// Bad - Unrelated tools
suggestedTools={[
  { id: 'random1', name: 'Random Tool', description: 'Not related' }
]}
```

### 3. Handle Retry Properly

```typescript
const handleRetry = () => {
  // Clear any cached state
  clearToolCache();
  
  // Reset loading state
  setIsLoading(true);
  
  // Re-attempt load
  loadTool();
};
```

### 4. Match Animation to Tool Type

```typescript
// Data processing - use bars
<ToolLoader animationStyle="bars" toolName="Data Processor" />

// AI tools - use pulse
<ToolLoader animationStyle="pulse" toolName="AI Assistant" />

// Quick tools - use dots
<ToolLoader animationStyle="dots" toolName="Quick Formatter" />
```

---

## 🐛 Troubleshooting

### Component doesn't timeout

**Problem:** Timer keeps running past timeout  
**Solution:** Ensure `isLoading` prop is controlled externally

```typescript
// Good
const [loading, setLoading] = useState(true);
<ToolLoader isLoading={loading} />

// Bad - always true
<ToolLoader isLoading={true} />
```

### Retry doesn't work

**Problem:** Clicking retry does nothing  
**Solution:** Implement `onRetry` callback

```typescript
<ToolLoader
  onRetry={() => {
    // Add your retry logic
    console.log('Retrying...');
  }}
/>
```

### Suggestions don't navigate

**Problem:** Clicking suggestions does nothing  
**Solution:** Implement `onSuggestedTool` callback

```typescript
<ToolLoader
  onSuggestedTool={(toolId) => {
    window.location.href = `/tools/${toolId}`;
  }}
/>
```

---

## 🎨 Visual Examples

### Loading State
```
┌─────────────────────────────────────┐
│                                     │
│        [Animated Pulse Icon]        │
│                                     │
│   Initializing Data Analyzer…       │
│   Please wait while we prepare...   │
│                                     │
│   ████████████░░░░ 75%              │
│   5s elapsed    Est. 7s             │
│                                     │
│   ✓ Connecting to engine...         │
│   ✓ Loading dependencies...         │
│   ⚙ Initializing modules... ●●●     │
│   □ Preparing interface...          │
│   □ Almost ready...                 │
│                                     │
└─────────────────────────────────────┘
```

### Timeout State
```
┌─────────────────────────────────────┐
│                                     │
│          ⚠️ (Warning Icon)          │
│                                     │
│   Taking Longer Than Expected       │
│   The tool is taking longer to      │
│   load than usual (30 seconds)      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🔄 Retry Loading           │   │
│   └─────────────────────────────┘   │
│                                     │
│   Or try a different tool:          │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Quick Analyzer          →   │   │
│   │ Lightweight analysis tool   │   │
│   └─────────────────────────────┘   │
│   ┌─────────────────────────────┐   │
│   │ CSV Reader              →   │   │
│   │ Simple CSV file reader      │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📝 Summary

**The ToolLoader component provides:**
- ✅ Professional loading UI
- ✅ Automatic timeout detection
- ✅ User-friendly retry option
- ✅ Alternative tool suggestions
- ✅ Multiple animation styles
- ✅ Theme support
- ✅ Fully customizable
- ✅ Production-ready
- ✅ Zero dependencies (besides React)
- ✅ TypeScript support

**Perfect for:**
- Tool initialization screens
- Plugin loading states
- API call loading
- Complex computation waits
- Any long-running operation

---

**Ready to use!** Import `ToolLoader` and enhance your user experience with professional loading states! 🚀

