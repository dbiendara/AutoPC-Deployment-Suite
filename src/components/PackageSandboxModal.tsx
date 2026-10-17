import React, { useState } from 'react';
import { SoftwarePackage, PackageSandboxTest } from '../types';
import {
  Box,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Server,
  Layers,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface PackageSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: SoftwarePackage;
  onPackageVerified: (pkg: SoftwarePackage) => void;
}

export const PackageSandboxModal: React.FC<PackageSandboxModalProps> = ({
  isOpen,
  onClose,
  pkg,
  onPackageVerified,
}) => {
  const [environmentType, setEnvironmentType] = useState<'proxmox' | 'hyperv' | 'local_sandbox'>('proxmox');
  const [autoRollback, setAutoRollback] = useState(true);
  const [vmId, setVmId] = useState(9001);
  const [snapshotName, setSnapshotName] = useState('clean-baseline');
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<PackageSandboxTest | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setIsRunning(true);
    setError(null);
    setTestResult(null);

    try {
      const res = await fetch(`/api/packages/${pkg.id}/sandbox-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environmentType,
          proxmoxConfig: {
            vmId,
            snapshotName,
            autoRollback,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Sandbox execution failed');
      }

      setTestResult(data.test);
      if (data.updatedPackage) {
        onPackageVerified(data.updatedPackage);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute sandbox test');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center font-bold">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Sandbox Test & Proxmox Verification</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                  {pkg.name} v{pkg.version}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute automated unattended installation in an isolated Windows VM with snapshot rollback.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Package Summary Card */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Installer Type</span>
              <span className="font-semibold text-cyan-400">{pkg.installerType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Silent Arguments</span>
              <span className="font-mono text-slate-200 truncate block">{pkg.silentArgs || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Distribution Channel</span>
              <span className="font-mono text-slate-300">{pkg.uncPath ? 'UNC Share' : `Winget: ${pkg.wingetId}`}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Detection Rule</span>
              <span className="font-mono text-slate-300 truncate block">[{pkg.detectionType}] {pkg.detectionRule}</span>
            </div>
          </div>

          {/* Environment Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Test Sandbox Environment:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEnvironmentType('proxmox')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  environmentType === 'proxmox'
                    ? 'bg-purple-950/60 border-purple-500 text-white shadow-md shadow-purple-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <Server className="w-4 h-4 text-purple-400 mb-1" />
                <span className="font-bold block text-xs">Proxmox VE VM</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Automated template & snapshot</span>
              </button>

              <button
                type="button"
                onClick={() => setEnvironmentType('hyperv')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  environmentType === 'hyperv'
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-4 h-4 text-blue-400 mb-1" />
                <span className="font-bold block text-xs">Windows Sandbox</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">WSB / Local Hyper-V</span>
              </button>

              <button
                type="button"
                onClick={() => setEnvironmentType('local_sandbox')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  environmentType === 'local_sandbox'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <Box className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="font-bold block text-xs">FDIM Simulator</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Fast exit code verification</span>
              </button>
            </div>
          </div>

          {/* Proxmox Specific Options */}
          {environmentType === 'proxmox' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Proxmox Test VM ID:
                  </label>
                  <input
                    type="number"
                    value={vmId}
                    onChange={(e) => setVmId(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-purple-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Baseline Snapshot Name:
                  </label>
                  <input
                    type="text"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-purple-300"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={autoRollback}
                  onChange={(e) => setAutoRollback(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"
                />
                <span className="text-xs font-semibold text-slate-200">
                  Automatic Snapshot Rollback after Test (Standardstatus nach erfolgreichem Test wiederherstellen)
                </span>
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Test Logs Output */}
          {testResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sandbox Execution Completed [VERIFIED PASS]</span>
                </span>
                {testResult.rollbackExecuted && (
                  <span className="text-[10px] text-purple-400 font-mono flex items-center space-x-1">
                    <RotateCcw className="w-3 h-3" />
                    <span>Snapshot Rolled Back to Baseline</span>
                  </span>
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                {testResult.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span
                      className={
                        log.level === 'success'
                          ? 'text-emerald-400 font-semibold'
                          : log.level === 'warn'
                          ? 'text-amber-400'
                          : log.level === 'error'
                          ? 'text-red-400'
                          : 'text-slate-300'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current Status: <strong>{pkg.testInstallStatus || 'Untested'}</strong>
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Close
            </button>
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Running VM Test & Rollback...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Sandbox Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
