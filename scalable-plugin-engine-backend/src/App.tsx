import { useState, useEffect } from 'react';

export function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {showLoading ? (
        <LoadingScreen />
      ) : (
        <LandingPage theme={theme} onToggleTheme={toggleTheme} />
      )}
    </div>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      {/* Logo Animation */}
      <div className="mb-8 animate-pulse">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-50 animate-pulse"></div>
          <svg
            className="relative w-32 h-32 text-white animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>

      {/* Brand Name with Typewriter Effect */}
      <div className="text-6xl font-bold mb-8 overflow-hidden">
        <span className="inline-block animate-typing text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          AnalyzoAI
        </span>
      </div>

      {/* Bouncing Dots */}
      <div className="flex space-x-3">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      {/* Loading Text */}
      <p className="mt-8 text-slate-400 text-lg animate-pulse">Initializing...</p>

      {/* CSS for Typewriter Effect */}
      <style>{`
        @keyframes typing {
          0% { width: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
        .animate-typing {
          animation: typing 2s steps(10) forwards;
        }
      `}</style>
    </div>
  );
}

// Main Landing Page Component
function LandingPage({ theme, onToggleTheme }: { theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-slate-900'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
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

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 lg:py-24">
        {/* Animated Brand Name */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className={`absolute inset-0 blur-3xl opacity-30 ${
                theme === 'dark' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-400 to-purple-400'
              }`}></div>
              <h1 className="relative text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                AnalyzoAI
              </h1>
            </div>
          </div>
          
          <p className={`text-2xl lg:text-3xl mb-6 font-light ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Intelligent Analytics Platform
          </p>
          
          <p className={`text-lg lg:text-xl max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Unlock powerful insights with AI-driven analytics tools designed for modern businesses
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300">
              Get Started Free
            </button>
            <button className={`px-8 py-4 font-semibold rounded-full border-2 transition-all duration-300 hover:scale-105 ${
              theme === 'dark'
                ? 'border-slate-600 text-slate-300 hover:border-purple-500 hover:bg-purple-500/10'
                : 'border-slate-300 text-slate-700 hover:border-purple-500 hover:bg-purple-50'
            }`}>
              Watch Demo
            </button>
          </div>
        </div>

        {/* AI Engine Activating Section */}
        <AIEngineSection theme={theme} />

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            theme={theme}
            icon="🚀"
            title="Lightning Fast"
            description="Process millions of data points in seconds with our optimized analytics engine"
          />
          <FeatureCard
            theme={theme}
            icon="🤖"
            title="AI-Powered"
            description="Machine learning algorithms that adapt and improve with your data"
          />
          <FeatureCard
            theme={theme}
            icon="🔒"
            title="Secure & Compliant"
            description="Enterprise-grade security with SOC2 and GDPR compliance"
          />
          <FeatureCard
            theme={theme}
            icon="📊"
            title="Real-time Insights"
            description="Monitor your metrics with live dashboards and instant notifications"
          />
          <FeatureCard
            theme={theme}
            icon="🌐"
            title="Multi-Platform"
            description="Seamlessly integrate with your existing tools and workflows"
          />
          <FeatureCard
            theme={theme}
            icon="💡"
            title="Smart Predictions"
            description="Forecasting and trend analysis powered by advanced AI models"
          />
        </div>

        {/* Stats Section */}
        <div className={`rounded-3xl p-12 mb-20 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 backdrop-blur-lg border border-slate-800'
            : 'bg-white/80 backdrop-blur-lg border border-slate-200 shadow-xl'
        }`}>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard theme={theme} value="100+" label="Plugins Available" />
            <StatCard theme={theme} value="50K+" label="Active Users" />
            <StatCard theme={theme} value="99.9%" label="Uptime SLA" />
            <StatCard theme={theme} value="24/7" label="Support" />
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="text-center mb-20">
          <h2 className={`text-4xl font-bold mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Trusted by Industry Leaders
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              theme={theme}
              quote="AnalyzoAI transformed how we understand our data. The insights are incredible!"
              author="Sarah Johnson"
              role="CTO, TechCorp"
            />
            <TestimonialCard
              theme={theme}
              quote="The best analytics platform we've used. Intuitive, powerful, and reliable."
              author="Michael Chen"
              role="Data Lead, InnovateLabs"
            />
            <TestimonialCard
              theme={theme}
              quote="Real-time insights that actually matter. Game-changer for our business."
              author="Emily Rodriguez"
              role="CEO, DataFlow Inc"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className={`text-center pt-12 border-t ${
          theme === 'dark' ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-600'
        }`}>
          <p className="text-sm">
            © 2024 AnalyzoAI. All rights reserved. | Built with cutting-edge technology
          </p>
        </footer>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ theme, icon, title, description }: { 
  theme: 'dark' | 'light'; 
  icon: string; 
  title: string; 
  description: string;
}) {
  return (
    <div className={`p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
      theme === 'dark'
        ? 'bg-slate-900/50 backdrop-blur-lg border border-slate-800 hover:border-purple-500/50'
        : 'bg-white/80 backdrop-blur-lg border border-slate-200 hover:border-purple-400 shadow-lg'
    }`}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className={`text-xl font-bold mb-3 ${
        theme === 'dark' ? 'text-white' : 'text-slate-900'
      }`}>
        {title}
      </h3>
      <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
        {description}
      </p>
    </div>
  );
}

// Stat Card Component
function StatCard({ theme, value, label }: { 
  theme: 'dark' | 'light'; 
  value: string; 
  label: string;
}) {
  return (
    <div>
      <div className={`text-5xl font-black mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
        {label}
      </div>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({ theme, quote, author, role }: {
  theme: 'dark' | 'light';
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <div className={`p-8 rounded-2xl ${
      theme === 'dark'
        ? 'bg-slate-900/50 backdrop-blur-lg border border-slate-800'
        : 'bg-white/80 backdrop-blur-lg border border-slate-200 shadow-lg'
    }`}>
      <div className="text-4xl mb-4 text-purple-500">"</div>
      <p className={`mb-6 italic ${
        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
      }`}>
        {quote}
      </p>
      <div className={`font-semibold ${
        theme === 'dark' ? 'text-white' : 'text-slate-900'
      }`}>
        {author}
      </div>
      <div className={`text-sm ${
        theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
      }`}>
        {role}
      </div>
    </div>
  );
}

// AI Engine Activating Section Component
function AIEngineSection({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div className={`rounded-3xl p-12 mb-20 relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 border border-slate-800'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 border border-slate-300'
    }`}>
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className={`w-full h-full ${
          theme === 'dark' ? 'bg-grid-pattern-dark' : 'bg-grid-pattern-light'
        }`} style={{
          backgroundImage: theme === 'dark' 
            ? 'linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)'
            : 'linear-gradient(rgba(100, 116, 139, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 116, 139, 0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Section Title */}
      <div className="relative text-center mb-12">
        <h2 className={`text-4xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          AI Engine Architecture
        </h2>
        <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
          Watch our intelligent system initialize in real-time
        </p>
      </div>

      {/* Terminal Window */}
      <div className={`relative rounded-xl overflow-hidden shadow-2xl mb-8 ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-white'
      }`}>
        {/* Terminal Header */}
        <div className={`flex items-center gap-2 px-4 py-3 border-b ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className={`ml-3 text-sm font-mono ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            system/engine-core
          </span>
        </div>

        {/* Terminal Content */}
        <div className={`p-6 font-mono text-sm ${
          theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
        }`}>
          {/* Terminal Lines with Typing Animation */}
          <div className="space-y-2">
            <TerminalLine theme={theme} delay="0s" text="$ Initializing AnalyzoAI Engine..." color="text-green-400" />
            <TerminalLine theme={theme} delay="0.5s" text="[✓] Core modules loaded" color="text-blue-400" />
            <TerminalLine theme={theme} delay="1s" text="[✓] Neural network initialized" color="text-purple-400" />
            <TerminalLine theme={theme} delay="1.5s" text="[✓] Plugin architecture activated" color="text-cyan-400" />
            <TerminalLine theme={theme} delay="2s" text="[✓] Multi-tenant system online" color="text-pink-400" />
            <TerminalLine theme={theme} delay="2.5s" text="[⚡] AI Engine ready for deployment" color="text-yellow-400" />
            <TerminalLine theme={theme} delay="3s" text="> _" color="text-green-400" blink />
          </div>
        </div>
      </div>

      {/* Engine Modules Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        <EngineModule
          theme={theme}
          title="Core Engine"
          status="ACTIVE"
          progress={100}
          delay="0s"
          icon="⚙️"
        />
        <EngineModule
          theme={theme}
          title="Neural Network"
          status="PROCESSING"
          progress={85}
          delay="0.3s"
          icon="🧠"
        />
        <EngineModule
          theme={theme}
          title="Data Pipeline"
          status="SYNCING"
          progress={92}
          delay="0.6s"
          icon="📊"
        />
        <EngineModule
          theme={theme}
          title="Plugin Loader"
          status="READY"
          progress={100}
          delay="0.9s"
          icon="🔌"
        />
        <EngineModule
          theme={theme}
          title="Security Layer"
          status="PROTECTED"
          progress={100}
          delay="1.2s"
          icon="🔒"
        />
        <EngineModule
          theme={theme}
          title="API Gateway"
          status="LISTENING"
          progress={95}
          delay="1.5s"
          icon="🌐"
        />
      </div>

      {/* System Architecture Visualization */}
      <div className="mt-12 relative">
        <div className={`rounded-xl p-8 ${
          theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/50'
        } backdrop-blur-lg`}>
          <h3 className={`text-xl font-bold mb-6 text-center ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            System Architecture Flow
          </h3>
          
          {/* Architecture Diagram (Pure CSS) */}
          <div className="flex flex-col items-center space-y-4">
            {/* Layer 1: Frontend */}
            <ArchitectureNode theme={theme} label="Frontend Layer" color="blue" delay="0s" />
            <AnimatedArrow theme={theme} delay="0.5s" />
            
            {/* Layer 2: API */}
            <ArchitectureNode theme={theme} label="API Gateway" color="purple" delay="1s" />
            <AnimatedArrow theme={theme} delay="1.5s" />
            
            {/* Layer 3: Engine Core */}
            <div className="flex gap-4">
              <ArchitectureNode theme={theme} label="Plugin Engine" color="cyan" size="sm" delay="2s" />
              <ArchitectureNode theme={theme} label="AI Core" color="pink" size="sm" delay="2.2s" />
              <ArchitectureNode theme={theme} label="Data Processor" color="green" size="sm" delay="2.4s" />
            </div>
            <AnimatedArrow theme={theme} delay="2.6s" />
            
            {/* Layer 4: Database */}
            <ArchitectureNode theme={theme} label="Database Layer" color="indigo" delay="3s" />
          </div>
        </div>
      </div>

      {/* Custom CSS Animations for This Section */}
      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes type-in {
          from { width: 0; opacity: 0; }
          to { width: 100%; opacity: 1; }
        }
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: var(--progress-width); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
        }
        @keyframes float-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes arrow-flow {
          0%, 100% { transform: translateY(-5px); opacity: 0.5; }
          50% { transform: translateY(5px); opacity: 1; }
        }
        .blink {
          animation: blink-cursor 1s infinite;
        }
      `}</style>
    </div>
  );
}

// Terminal Line Component
function TerminalLine({ theme, delay, text, color, blink = false }: {
  theme: 'dark' | 'light';
  delay: string;
  text: string;
  color: string;
  blink?: boolean;
}) {
  return (
    <div 
      className={`overflow-hidden whitespace-nowrap ${blink ? 'blink' : ''}`}
      style={{
        animation: blink ? 'blink-cursor 1s infinite' : `type-in 0.5s steps(${text.length}) ${delay} forwards`,
        opacity: 0,
      }}
    >
      <span className={color}>{text}</span>
    </div>
  );
}

// Engine Module Component
function EngineModule({ theme, title, status, progress, delay, icon }: {
  theme: 'dark' | 'light';
  title: string;
  status: string;
  progress: number;
  delay: string;
  icon: string;
}) {
  const statusColors: Record<string, string> = {
    'ACTIVE': 'text-green-400',
    'PROCESSING': 'text-blue-400',
    'SYNCING': 'text-cyan-400',
    'READY': 'text-purple-400',
    'PROTECTED': 'text-pink-400',
    'LISTENING': 'text-yellow-400',
  };

  return (
    <div 
      className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
        theme === 'dark'
          ? 'bg-slate-900/80 border-slate-700 hover:border-indigo-500'
          : 'bg-white/80 border-slate-200 hover:border-indigo-400'
      }`}
      style={{
        animation: `float-up 0.6s ease-out ${delay} forwards`,
        opacity: 0,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h4 className={`font-bold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {title}
            </h4>
            <span className={`text-xs font-mono ${statusColors[status]}`}>
              {status}
            </span>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${
          progress === 100 ? 'bg-green-500' : 'bg-blue-500'
        }`} style={{ animation: 'pulse-glow 2s infinite' }}></div>
      </div>
      
      {/* Progress Bar */}
      <div className={`w-full h-2 rounded-full overflow-hidden ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
      }`}>
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
          style={{
            animation: `progress-fill 2s ease-out ${delay} forwards`,
            '--progress-width': `${progress}%`,
          } as React.CSSProperties}
        ></div>
      </div>
      <div className={`text-xs text-right mt-2 font-mono ${
        theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
      }`}>
        {progress}%
      </div>
    </div>
  );
}

// Architecture Node Component
function ArchitectureNode({ theme, label, color, size = 'md', delay }: {
  theme: 'dark' | 'light';
  label: string;
  color: string;
  size?: 'sm' | 'md';
  delay: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    cyan: 'from-cyan-500 to-cyan-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <div
      className={`${size === 'sm' ? 'px-6 py-3 text-sm' : 'px-8 py-4'} rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white font-semibold shadow-lg`}
      style={{
        animation: `float-up 0.5s ease-out ${delay} forwards`,
        opacity: 0,
      }}
    >
      {label}
    </div>
  );
}

// Animated Arrow Component
function AnimatedArrow({ theme, delay }: { theme: 'dark' | 'light'; delay: string }) {
  return (
    <div
      className={`text-3xl ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}
      style={{
        animation: `arrow-flow 2s ease-in-out ${delay} infinite`,
      }}
    >
      ↓
    </div>
  );
}
