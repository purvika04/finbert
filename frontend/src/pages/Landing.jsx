import { useNavigate } from "react-router-dom";
import { Shield, BarChart3, LineChart, Cpu } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#04060C] text-slate-200 font-sans selection:bg-[#1D9E75]/30">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-[#1D9E75]/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5 bg-[#04060C]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1D9E75] to-[#4B7AC7] flex items-center justify-center font-mono font-bold text-white text-sm shadow-[0_0_15px_rgba(29,158,117,0.4)]">
              F
            </div>
            <span className="font-mono font-semibold text-lg tracking-wide text-white">
              FinGuard
            </span>
            <span className="text-[10px] font-mono text-[#1D9E75] bg-[#1D9E75]/10 px-2 py-0.5 rounded-full border border-[#1D9E75]/20">
              PRO
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Platform</button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Analysis</button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Institutional</button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Pricing</button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="h-10 px-6 rounded-lg bg-[#1D9E75] hover:bg-[#15805e] text-white text-sm font-semibold transition-all shadow-[0_0_20px_rgba(29,158,117,0.3)] hover:shadow-[0_0_25px_rgba(29,158,117,0.5)]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-[#1D9E75] animate-pulse" />
          New: AI-driven predictive risk models deployed →
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-8">
          Manage Capital Like an <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D9E75] to-[#4B7AC7]">
            Institutional Pro
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          A comprehensive ecosystem for deep bank risk analysis, automated portfolio monitoring, and real-time predictive health screening.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-20">
          <input 
            type="email"
            placeholder="Input your email"
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1D9E75]/50 focus:ring-1 focus:ring-[#1D9E75]/50 transition-all"
          />
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-[#1D9E75] to-[#15805e] text-white font-semibold whitespace-nowrap shadow-[0_0_20px_rgba(29,158,117,0.3)] hover:shadow-[0_0_30px_rgba(29,158,117,0.5)] transition-all">
            Get Started
          </button>
        </div>

        {/* Mock Dashboard Preview using CSS */}
        <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0A0D18]/90 backdrop-blur-xl shadow-2xl shadow-[#1D9E75]/10 overflow-hidden flex flex-col">
          {/* Fake Dashboard Header */}
          <div className="h-14 border-b border-white/5 flex items-center px-6 gap-4">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-500/80" />
               <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
               <div className="w-3 h-3 rounded-full bg-green-500/80" />
             </div>
             <div className="w-64 h-8 rounded-md bg-white/5 flex items-center px-3 ml-4">
               <span className="text-xs text-slate-500 font-mono">🔍 Search Banks...</span>
             </div>
          </div>
          {/* Fake Dashboard Body */}
          <div className="flex flex-1 p-6 gap-6 h-[400px]">
             {/* Left metrics */}
             <div className="w-1/3 flex flex-col gap-4">
                <div className="h-24 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                   <span className="text-xs text-slate-400 font-mono">SAFE PORTFOLIO</span>
                   <span className="text-2xl font-mono text-[#1D9E75]">82.4%</span>
                </div>
                <div className="h-24 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                   <span className="text-xs text-slate-400 font-mono">AT-RISK EXPOSURE</span>
                   <span className="text-2xl font-mono text-[#E24B4A]">₹1.2M</span>
                </div>
                <div className="flex-1 rounded-xl bg-gradient-to-br from-[#1D9E75]/10 to-transparent border border-[#1D9E75]/20 p-4">
                   <h3 className="text-sm font-semibold text-white mb-2">Switch to Predictive AI</h3>
                   <p className="text-xs text-slate-400">Enable automated alerts before a bank collapses.</p>
                </div>
             </div>
             {/* Right main chart area */}
             <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                   <div>
                      <h3 className="text-sm text-slate-400 font-mono mb-1">PORTFOLIO HEALTH</h3>
                      <div className="text-3xl font-mono font-medium text-white">$491,012 <span className="text-sm text-[#1D9E75]">+2.5%</span></div>
                   </div>
                </div>
                {/* Fake Chart Lines */}
                <div className="flex-1 relative border-b border-l border-white/10">
                  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,80 L10,60 L20,70 L30,40 L40,50 L50,20 L60,30 L70,10 L80,20 L90,5 L100,10" fill="none" stroke="#1D9E75" strokeWidth="1.5" />
                    <path d="M0,80 L10,60 L20,70 L30,40 L40,50 L50,20 L60,30 L70,10 L80,20 L90,5 L100,10 L100,100 L0,100 Z" fill="url(#grad)" opacity="0.2" />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1D9E75" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
