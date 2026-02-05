/**
 * ToolLoader Component
 * 
 * A reusable loader component that displays while tools are initializing.
 * Features:
 * - Stylish loading animation
 * - Timeout detection (shows retry after timeout)
 * - Retry button
 * - Estimated load time display
 * - Tool suggestions on timeout
 * - Multiple animation styles
 */

import { useState, useEffect } from 'react';

export interface ToolLoaderProps {
  toolName?: string;
  estimatedTime?: number; // in seconds
  timeout?: number; // in seconds, default 30s
  onRetry?: () => void;
  onSuggestedTool?: (toolId: string) => void;
  theme?: 'dark' | 'light';
  animationStyle?: 'pulse' | 'spinner' | 'dots' | 'bars';
  suggestedTools?: Array<{ id: string; name: string; description: string }>;
  isLoading?: boolean; // External control
}

export function ToolLoader({
  toolName = 'Tool Engine',
  estimatedTime = 5,
  timeout = 30,
  onRetry,
  onSuggestedTool,
  theme = 'dark',
  animationStyle = 'pulse',
  suggestedTools = [
    { id: 'data-analyzer', name: 'Data Analyzer', description: 'Fast and reliable data analysis' },
    { id: 'ai-chat', name: 'AI Chat Assistant', description: 'Intelligent conversation tool' },
    { id: 'pdf-generator', name: 'PDF Generator', description: 'Quick document generation' }
  ],
  isLoading = true
}: ToolLoaderProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      setHasTimedOut(false);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= timeout) {
          setHasTimedOut(true);
          clearInterval(interval);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeout, isLoading]);

  const handleRetry = () => {
    setElapsedTime(0);
    setHasTimedOut(false);
    onRetry?.();
  };

  const handleSuggestedTool = (toolId: string) => {
    onSuggestedTool?.(toolId);
  };

  const progress = Math.min((elapsedTime / estimatedTime) * 100, 100);

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
    }`}>
      <div className={`max-w-2xl w-full rounded-3xl p-12 shadow-2xl ${
        theme === 'dark'
          ? 'bg-slate-900/80 backdrop-blur-lg border border-slate-800'
          : 'bg-white/90 backdrop-blur-lg border border-slate-200'
      }`}>
        
        {!hasTimedOut ? (
          <>
            {/* Loading Animation */}
            <div className="flex justify-center mb-8">
              {animationStyle === 'pulse' && <PulseAnimation theme={theme} />}
              {animationStyle === 'spinner' && <SpinnerAnimation theme={theme} />}
              {animationStyle === 'dots' && <DotsAnimation theme={theme} />}
              {animationStyle === 'bars' && <BarsAnimation theme={theme} />}
            </div>

            {/* Loading Message */}
            <div className="text-center mb-6">
              <h2 className={`text-3xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Initializing {toolName}…
              </h2>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Please wait while we prepare your tools
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className={`w-full h-3 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={`flex justify-between mt-2 text-sm ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
              }`}>
                <span>{elapsedTime}s elapsed</span>
                <span>Est. {estimatedTime}s</span>
              </div>
            </div>

            {/* Loading Steps */}
            <LoadingSteps theme={theme} elapsedTime={elapsedTime} />

          </>
        ) : (
          <>
            {/* Timeout State */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2 className={`text-3xl font-bold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Taking Longer Than Expected
              </h2>
              <p className={`text-lg mb-6 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                The tool is taking longer to load than usual ({timeout} seconds)
              </p>
            </div>

            {/* Retry Button */}
            <button
              onClick={handleRetry}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg mb-6 transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-purple-500/50'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Loading
              </div>
            </button>

            {/* Suggestions */}
            <div className={`border-t pt-6 ${
              theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <p className={`text-center mb-4 font-semibold ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Or try a different tool:
              </p>

              <div className="space-y-3">
                {suggestedTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleSuggestedTool(tool.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 hover:scale-102 ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                          {tool.name}
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {tool.description}
                        </p>
                      </div>
                      <svg 
                        className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes scale-102 {
          to { transform: scale(1.02); }
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

// Loading Steps Component
function LoadingSteps({ theme, elapsedTime }: { theme: 'dark' | 'light'; elapsedTime: number }) {
  const steps = [
    { time: 0, label: 'Connecting to engine...', icon: '🔌' },
    { time: 2, label: 'Loading dependencies...', icon: '📦' },
    { time: 4, label: 'Initializing modules...', icon: '⚙️' },
    { time: 6, label: 'Preparing interface...', icon: '🎨' },
    { time: 8, label: 'Almost ready...', icon: '✨' }
  ];

  const currentStep = steps.filter(step => elapsedTime >= step.time).length - 1;

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <div 
            key={index}
            className={`flex items-center gap-3 transition-all duration-500 ${
              isComplete || isCurrent ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
              isComplete 
                ? 'bg-green-500/20 ring-2 ring-green-500' 
                : isCurrent
                  ? 'bg-blue-500/20 ring-2 ring-blue-500 animate-pulse'
                  : theme === 'dark'
                    ? 'bg-slate-800'
                    : 'bg-slate-200'
            }`}>
              {isComplete ? '✓' : step.icon}
            </div>
            <span className={`flex-1 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {step.label}
            </span>
            {isCurrent && (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Animation Components
function PulseAnimation({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div className="relative w-32 h-32">
      <div className={`absolute inset-0 rounded-full animate-ping ${
        theme === 'dark' ? 'bg-purple-500' : 'bg-purple-400'
      } opacity-20`}></div>
      <div className={`absolute inset-4 rounded-full animate-pulse ${
        theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
      } opacity-40`}></div>
      <div className={`absolute inset-8 rounded-full ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
          : 'bg-gradient-to-br from-blue-400 to-purple-500'
      } shadow-2xl flex items-center justify-center`}>
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>
  );
}

function SpinnerAnimation({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div className="relative w-24 h-24">
      <svg className="animate-spin" viewBox="0 0 24 24">
        <circle 
          className={theme === 'dark' ? 'stroke-slate-800' : 'stroke-slate-200'} 
          cx="12" 
          cy="12" 
          r="10" 
          strokeWidth="4" 
          fill="none"
        />
        <circle 
          className="stroke-blue-500" 
          cx="12" 
          cy="12" 
          r="10" 
          strokeWidth="4" 
          fill="none"
          strokeDasharray="60"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-16 h-16 rounded-full ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
            : 'bg-gradient-to-br from-blue-400 to-purple-500'
        }`}></div>
      </div>
    </div>
  );
}

function DotsAnimation({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div className="flex gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : 'bg-gradient-to-br from-blue-400 to-purple-500'
          } animate-bounce`}
          style={{ animationDelay: `${i * 150}ms` }}
        ></div>
      ))}
    </div>
  );
}

function BarsAnimation({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div className="flex gap-3 items-end h-24">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-3 rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-t from-blue-500 to-purple-600' 
              : 'bg-gradient-to-t from-blue-400 to-purple-500'
          }`}
          style={{
            animation: `bar-bounce 1s ease-in-out infinite`,
            animationDelay: `${i * 100}ms`
          }}
        ></div>
      ))}
      <style>{`
        @keyframes bar-bounce {
          0%, 100% { height: 20px; }
          50% { height: 80px; }
        }
      `}</style>
    </div>
  );
}

export default ToolLoader;
