/**
 * ToolLoader Demo Page
 * 
 * Showcases all variants and states of the ToolLoader component
 */

import { useState } from 'react';
import { ToolLoader } from '../components/ToolLoader';

export function ToolLoaderDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const demos = [
    {
      id: 'default',
      title: 'Default (Pulse)',
      description: 'Standard loader with pulse animation',
      props: {}
    },
    {
      id: 'spinner',
      title: 'Spinner Animation',
      description: 'Classic rotating spinner',
      props: { animationStyle: 'spinner' as const }
    },
    {
      id: 'dots',
      title: 'Dots Animation',
      description: 'Bouncing dots sequence',
      props: { animationStyle: 'dots' as const }
    },
    {
      id: 'bars',
      title: 'Bars Animation',
      description: 'Vertical bars bouncing',
      props: { animationStyle: 'bars' as const }
    },
    {
      id: 'custom-tool',
      title: 'Custom Tool Name',
      description: 'Loading a specific tool',
      props: { 
        toolName: 'AI Data Analyzer Pro',
        estimatedTime: 8,
        timeout: 20
      }
    },
    {
      id: 'quick-timeout',
      title: 'Quick Timeout (5s)',
      description: 'Demonstrates timeout state',
      props: { 
        toolName: 'Slow Tool',
        estimatedTime: 3,
        timeout: 5 // Will timeout quickly
      }
    },
    {
      id: 'custom-suggestions',
      title: 'Custom Suggestions',
      description: 'Alternative tool suggestions',
      props: { 
        toolName: 'Complex Analysis Tool',
        timeout: 8,
        suggestedTools: [
          { id: 'quick-stats', name: 'Quick Statistics', description: 'Fast statistical analysis' },
          { id: 'simple-viz', name: 'Simple Visualizer', description: 'Basic data visualization' },
          { id: 'data-preview', name: 'Data Preview', description: 'Preview your data quickly' }
        ]
      }
    }
  ];

  if (activeDemo) {
    const demo = demos.find(d => d.id === activeDemo);
    if (demo) {
      return (
        <ToolLoader
          {...demo.props}
          theme={theme}
          onRetry={() => {
            alert('Retry clicked! In a real app, you would reload the tool here.');
            setActiveDemo(null); // Close demo
          }}
          onSuggestedTool={(toolId) => {
            alert(`Suggested tool clicked: ${toolId}\nIn a real app, you would navigate to this tool.`);
            setActiveDemo(null); // Close demo
          }}
        />
      );
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`fixed top-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
            : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
        }`}
      >
        {theme === 'dark' ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-6xl font-black mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}>
            ToolLoader Component
          </h1>
          <p className={`text-xl mb-4 ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
          }`}>
            A reusable loading component with timeout handling and retry functionality
          </p>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Click any demo below to see it in action
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`p-6 rounded-2xl text-left transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-slate-900/50 backdrop-blur-lg border border-slate-800 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20'
                  : 'bg-white/80 backdrop-blur-lg border border-slate-200 hover:border-purple-400 hover:shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                    : 'bg-gradient-to-br from-blue-400 to-purple-500'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <svg className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {demo.title}
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {demo.description}
              </p>
            </button>
          ))}
        </div>

        {/* Features */}
        <div className={`rounded-3xl p-12 mb-16 ${
          theme === 'dark'
            ? 'bg-slate-900/50 backdrop-blur-lg border border-slate-800'
            : 'bg-white/80 backdrop-blur-lg border border-slate-200 shadow-xl'
        }`}>
          <h2 className={`text-3xl font-bold mb-8 text-center ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Component Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureItem
              theme={theme}
              icon="⏱️"
              title="Automatic Timeout"
              description="Detects when loading takes too long and shows retry options"
            />
            <FeatureItem
              theme={theme}
              icon="🔄"
              title="Retry Functionality"
              description="One-click retry button to reload the tool"
            />
            <FeatureItem
              theme={theme}
              icon="🎯"
              title="Tool Suggestions"
              description="Suggests alternative tools when timeout occurs"
            />
            <FeatureItem
              theme={theme}
              icon="📊"
              title="Progress Tracking"
              description="Shows elapsed time and estimated completion"
            />
            <FeatureItem
              theme={theme}
              icon="🎨"
              title="4 Animation Styles"
              description="Pulse, Spinner, Dots, and Bars animations"
            />
            <FeatureItem
              theme={theme}
              icon="🌓"
              title="Theme Support"
              description="Dark and Light themes with smooth transitions"
            />
            <FeatureItem
              theme={theme}
              icon="📱"
              title="Fully Responsive"
              description="Works perfectly on all screen sizes"
            />
            <FeatureItem
              theme={theme}
              icon="⚡"
              title="Pure CSS Animations"
              description="No JavaScript animations, GPU-accelerated"
            />
          </div>
        </div>

        {/* Code Example */}
        <div className={`rounded-3xl p-12 ${
          theme === 'dark'
            ? 'bg-slate-900/50 backdrop-blur-lg border border-slate-800'
            : 'bg-white/80 backdrop-blur-lg border border-slate-200 shadow-xl'
        }`}>
          <h2 className={`text-3xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Usage Example
          </h2>

          <div className={`rounded-xl p-6 font-mono text-sm overflow-x-auto ${
            theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'
          }`}>
            <pre className={theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}>
{`import { ToolLoader } from './components/ToolLoader';

function MyToolPage() {
  const [loading, setLoading] = useState(true);

  return (
    <ToolLoader
      toolName="My Custom Tool"
      estimatedTime={7}
      timeout={25}
      theme="dark"
      animationStyle="pulse"
      onRetry={() => {
        setLoading(true);
        // Reload tool logic
      }}
      onSuggestedTool={(toolId) => {
        navigate(\`/tools/\${toolId}\`);
      }}
      suggestedTools={[
        { 
          id: 'alternative', 
          name: 'Alternative Tool',
          description: 'Try this instead'
        }
      ]}
      isLoading={loading}
    />
  );
}`}
            </pre>
          </div>

          <div className="mt-6 flex gap-4">
            <a
              href="/TOOL_LOADER_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl'
              }`}
            >
              View Full Documentation
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'border-2 border-slate-600 text-slate-300 hover:border-purple-500 hover:bg-purple-500/10'
                  : 'border-2 border-slate-300 text-slate-700 hover:border-purple-500 hover:bg-purple-50'
              }`}
            >
              View Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ theme, icon, title, description }: {
  theme: 'dark' | 'light';
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 ring-1 ring-blue-500/30'
          : 'bg-gradient-to-br from-blue-400/20 to-purple-500/20 ring-1 ring-blue-400/30'
      }`}>
        {icon}
      </div>
      <div>
        <h3 className={`font-bold mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          {title}
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default ToolLoaderDemo;
