import React from 'react';
import {
  Monitor,
  Terminal,
  Layers,
  Sparkles,
  History,
  Building2,
  HardDrive,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'wizard' | 'runner' | 'library' | 'ai-detective' | 'history' | 'customers';
  setActiveTab: (tab: 'wizard' | 'runner' | 'library' | 'ai-detective' | 'history' | 'customers') => void;
  machineName: string;
  selectedCustomerName: string;
  isDeploying: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  machineName,
  selectedCustomerName,
  isDeploying,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                  FDIM
                </span>
                <span className="text-amber-400 font-semibold text-xs px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 uppercase tracking-wider font-mono">
                  Fuck Doing It Manually
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Zero-Touch Workstation Provisioning & Silent UNC Installer Suite
              </p>
            </div>
          </div>

          {/* AD Machine & Customer Badge */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-lg text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Host:</span>
              <span className="text-slate-200 font-bold">{machineName || '$env:COMPUTERNAME'}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-300 font-medium truncate max-w-[160px]">{selectedCustomerName}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-medium">AD Member</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'wizard'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">PC Setup</span>
            </button>

            <button
              onClick={() => setActiveTab('runner')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                activeTab === 'runner'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">Live Runner</span>
              {isDeploying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ai-detective')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ai-detective'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="hidden sm:inline">AI Detective</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'customers'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Customer Profiles</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'library'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">UNC Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Audit Log</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
