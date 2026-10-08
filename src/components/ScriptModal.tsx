import React, { useState, useEffect } from 'react';
import { SoftwarePackage, ChecklistItem } from '../types';
import {
  Terminal,
  Copy,
  Check,
  Download,
  X,
  ShieldCheck,
  FileCode,
  HardDrive,
  Info,
} from 'lucide-react';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName: string;
  employeeName: string;
  department: string;
  selectedPackages: SoftwarePackage[];
  selectedChecklists: ChecklistItem[];
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  isOpen,
  onClose,
  machineName,
  employeeName,
  department,
  selectedPackages,
  selectedChecklists,
}) => {
  const [scriptContent, setScriptContent] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch('/api/scripts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        machineName,
        employeeName,
        department,
        selectedPackageIds: selectedPackages.map((p) => p.id),
        selectedChecklistIds: selectedChecklists.map((c) => c.id),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.script) {
          setScriptContent(data.script);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen, machineName, employeeName, department, selectedPackages, selectedChecklists]);

  if (!isOpen) return null;

  const oneLinerCommand = `powershell.exe -ExecutionPolicy Bypass -NoProfile -Command "Invoke-WebRequest -Uri '$([System.Uri]::EscapeUriString('${window.location.origin}/api/scripts/run'))' -OutFile '$env:TEMP\\Deploy-PC.ps1'; & '$env:TEMP\\Deploy-PC.ps1'"`;

  const copyScript = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyOneLiner = () => {
    navigator.clipboard.writeText(oneLinerCommand);
    setCopiedOneLiner(true);
    setTimeout(() => setCopiedOneLiner(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Deploy-${machineName || 'Workstation'}.ps1`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                PowerShell Master Automation Script (`Deploy-Workstation.ps1`)
              </h3>
              <p className="text-xs text-slate-400">
                Turnkey zero-touch script for target host <span className="text-cyan-400 font-mono">{machineName || 'CORP-WIN11-NEW'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick One-Liner Box */}
          <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
                <FileCode className="w-3.5 h-3.5" />
                <span>Instant Command-Line Launcher (Run in Admin PowerShell):</span>
              </span>
              <button
                onClick={copyOneLiner}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                {copiedOneLiner ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOneLiner ? 'Copied Command!' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
              {oneLinerCommand}
            </pre>
          </div>

          {/* Full Script Viewer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase font-mono">
                Full PowerShell Code ({selectedPackages.length} UNC Apps, {selectedChecklists.length} Tasks):
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyScript}
                  className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                </button>
                <button
                  onClick={downloadScript}
                  className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download .ps1</span>
                </button>
              </div>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed">
              {loading ? 'Generating PowerShell script from UNC definitions...' : scriptContent}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Executes with #Requires -RunAsAdministrator and UTF-8 master logging</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
