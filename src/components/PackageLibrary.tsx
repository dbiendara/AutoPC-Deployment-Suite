import React, { useState } from 'react';
import { SoftwarePackage } from '../types';
import {
  Layers,
  HardDrive,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  Server,
  FolderOpen,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PackageLibraryProps {
  packages: SoftwarePackage[];
  onDeletePackage: (id: string) => void;
  onOpenAIDetective: () => void;
}

export const PackageLibrary: React.FC<PackageLibraryProps> = ({
  packages,
  onDeletePackage,
  onOpenAIDetective,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['All', 'Browser', 'Development', 'Productivity', 'Communication', 'Security', 'Utilities', 'Design'];

  const filtered = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.fileName.toLowerCase().includes(search.toLowerCase()) ||
      pkg.uncPath.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || pkg.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Corporate Software Catalog & UNC Shares</h1>
          </div>
          <p className="text-xs text-slate-400">
            {packages.length} standardized software binaries hosted on enterprise network storage shares
          </p>
        </div>

        <button
          onClick={onOpenAIDetective}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Package with AI Detective</span>
        </button>
      </div>

      {/* UNC Root Share Info Banner */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 text-slate-300">
          <Server className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <span className="font-semibold text-white">Default Corporate Deployment Root Share:</span>
            <code className="ml-2 text-cyan-400 font-mono">\\corp-fs01.internal.net\deployments\apps</code>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Read-only Authenticated Domain Access (NTFS)</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search package name, UNC directory, or installer filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Package Table / Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((pkg) => {
          const isExpanded = expandedId === pkg.id;

          return (
            <div
              key={pkg.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-cyan-400 text-xs shrink-0">
                    {pkg.installerType}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">{pkg.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        v{pkg.version}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {pkg.category}
                      </span>
                      {pkg.testInstallStatus === 'Verified' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>AI Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-1">
                      <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{pkg.uncPath}\{pkg.fileName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end md:self-center">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : pkg.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1"
                  >
                    <span>Parameters</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onDeletePackage(pkg.id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Remove package from catalog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Silent Arguments:</span>
                    <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-emerald-300 font-mono text-[11px] break-all">
                      {pkg.silentArgs}
                    </code>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Post-Install Detection Rule:</span>
                    <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 font-mono text-[11px] break-all">
                      {pkg.detectionRule}
                    </code>
                  </div>

                  <div className="space-y-1 text-slate-300">
                    <span className="text-[11px] text-slate-400 block mb-1">Deployment Metadata:</span>
                    <div className="flex justify-between text-[11px]">
                      <span>Exit Codes:</span>
                      <span className="font-mono text-cyan-400">[{pkg.successExitCodes.join(', ')}]</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Reboot Mode:</span>
                      <span>{pkg.rebootBehavior}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Est. Duration:</span>
                      <span>~{pkg.estimatedMinutes} min</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
