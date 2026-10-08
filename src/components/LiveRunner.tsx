import React, { useState, useEffect, useRef } from 'react';
import {
  SoftwarePackage,
  ChecklistItem,
  DeploymentRecord,
} from '../types';
import {
  Terminal,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  User,
  Shield,
  FileText,
  Download,
  Copy,
  Check,
  Server,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface LiveRunnerProps {
  isDeploying: boolean;
  setIsDeploying: (val: boolean) => void;
  machineName: string;
  employeeName: string;
  department: string;
  serialNumber: string;
  selectedPackages: SoftwarePackage[];
  selectedChecklists: ChecklistItem[];
  onCompleteDeployment: (record: DeploymentRecord) => void;
  onOpenAuditModal: () => void;
}

interface StepItem {
  id: string;
  type: 'preflight' | 'checklist' | 'package' | 'postflight';
  title: string;
  subtext: string;
  status: 'pending' | 'running' | 'success' | 'warn' | 'error';
  logLines: string[];
}

export const LiveRunner: React.FC<LiveRunnerProps> = ({
  isDeploying,
  setIsDeploying,
  machineName,
  employeeName,
  department,
  serialNumber,
  selectedPackages,
  selectedChecklists,
  onCompleteDeployment,
  onOpenAuditModal,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [logs, setLogs] = useState<Array<{ timestamp: string; level: 'info' | 'warn' | 'error' | 'success'; message: string }>>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'errors' | 'success'>('all');

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Initialize pipeline steps when mounting or when selection changes
  useEffect(() => {
    const initialSteps: StepItem[] = [];

    // Pre-flight checks
    initialSteps.push({
      id: 'step-preflight-admin',
      type: 'preflight',
      title: 'Elevated Administrator Rights Verification',
      subtext: 'Validating [Security.Principal.WindowsBuiltInRole]::Administrator',
      status: 'pending',
      logLines: [],
    });
    initialSteps.push({
      id: 'step-preflight-unc',
      type: 'preflight',
      title: 'UNC Network Share Reachability',
      subtext: 'Testing SMB port 445 and ping to \\\\corp-fs01.internal.net\\deployments',
      status: 'pending',
      logLines: [],
    });

    // Checklists
    selectedChecklists.forEach((chk) => {
      initialSteps.push({
        id: `step-chk-${chk.id}`,
        type: 'checklist',
        title: chk.title,
        subtext: chk.description,
        status: 'pending',
        logLines: [],
      });
    });

    // Software packages
    selectedPackages.forEach((pkg) => {
      initialSteps.push({
        id: `step-pkg-${pkg.id}`,
        type: 'package',
        title: `Silent Install: ${pkg.name}`,
        subtext: `${pkg.uncPath}\\${pkg.fileName} (${pkg.installerType})`,
        status: 'pending',
        logLines: [],
      });
    });

    // Post-flight
    initialSteps.push({
      id: 'step-postflight-audit',
      type: 'postflight',
      title: 'Final Workstation Security Audit & Certificate',
      subtext: 'Generating tamper-proof deployment signature & telemetry upload',
      status: 'pending',
      logLines: [],
    });

    setSteps(initialSteps);
  }, [selectedPackages, selectedChecklists]);

  // Elapsed timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isDeploying && !isPaused && !isFinished) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isDeploying, isPaused, isFinished]);

  // Simulated execution engine
  useEffect(() => {
    if (!isDeploying || isPaused || isFinished || steps.length === 0) return;

    if (currentStepIndex >= steps.length) {
      setIsFinished(true);
      setIsDeploying(false);

      const record: DeploymentRecord = {
        id: `dep-${Date.now().toString(36)}`,
        machineName: machineName || 'CORP-WIN11-NEW',
        serialNumber: serialNumber || 'N/A',
        employeeName: employeeName || 'New Employee',
        employeeEmail: `${(employeeName || 'employee').toLowerCase().replace(/\s+/g, '.')}@corporate.corp`,
        department: department || 'General',
        profileId: 'custom',
        status: 'Completed',
        startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
        completedAt: new Date().toISOString(),
        selectedPackageIds: selectedPackages.map((p) => p.id),
        selectedChecklistIds: selectedChecklists.map((c) => c.id),
        technicianName: 'Admin (AutoPC Suite)',
        logs,
        results: {
          packages: Object.fromEntries(selectedPackages.map((p) => [p.id, { status: 'success', exitCode: 0 }])),
          checklists: Object.fromEntries(selectedChecklists.map((c) => [c.id, { status: 'success' }])),
        },
      };

      onCompleteDeployment(record);
      return;
    }

    const currentStep = steps[currentStepIndex];

    // Mark current step running
    setSteps((prev) =>
      prev.map((step, idx) => (idx === currentStepIndex ? { ...step, status: 'running' } : step))
    );

    const timeStr = new Date().toLocaleTimeString();
    const startMsg = `[${timeStr}] [INFO] Executing step [${currentStepIndex + 1}/${steps.length}]: ${currentStep.title}...`;
    setLogs((prev) => [...prev, { timestamp: timeStr, level: 'info', message: startMsg }]);

    // Step duration simulation based on type
    let stepTime = 1200;
    if (currentStep.type === 'package') stepTime = 2200;
    if (currentStep.type === 'preflight') stepTime = 900;

    const timeout = setTimeout(() => {
      const finishTimeStr = new Date().toLocaleTimeString();
      let successMsg = `[${finishTimeStr}] [SUCCESS] Completed: ${currentStep.title} (ExitCode 0)`;

      if (currentStep.type === 'package') {
        const pkg = selectedPackages.find((p) => `step-pkg-${p.id}` === currentStep.id);
        if (pkg) {
          successMsg = `[${finishTimeStr}] [SUCCESS] Silent install verified: ${pkg.name} via ${pkg.installerType} [Switches: ${pkg.silentArgs}]`;
        }
      }

      setLogs((prev) => [...prev, { timestamp: finishTimeStr, level: 'success', message: successMsg }]);

      setSteps((prev) =>
        prev.map((step, idx) => (idx === currentStepIndex ? { ...step, status: 'success' } : step))
      );

      setCurrentStepIndex((prev) => prev + 1);
    }, stepTime);

    return () => clearTimeout(timeout);
  }, [isDeploying, isPaused, isFinished, currentStepIndex, steps.length]);

  // Autoscroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const progressPercentage = steps.length > 0 ? Math.round((currentStepIndex / steps.length) * 100) : 0;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyAllLogs = () => {
    const text = logs.map((l) => `${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'errors') return l.level === 'error' || l.level === 'warn';
    if (logFilter === 'success') return l.level === 'success';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Runner Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                HOST: {machineName || 'CORP-WIN11-NEW'}
              </span>
              {isFinished ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PROVISIONING COMPLETED</span>
                </span>
              ) : isDeploying ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>LIVE EXECUTION RUNNING</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950 border border-amber-700 text-amber-300 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>READY / IDLE</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Workstation Provisioning Execution Console
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Deploying {selectedPackages.length} silent packages from UNC share and executing {selectedChecklists.length} system configuration tasks.
            </p>
          </div>

          {/* Controls & Metrics */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-center min-w-[100px]">
              <span className="text-[11px] text-slate-400 block uppercase font-mono">Elapsed</span>
              <span className="text-lg font-mono font-bold text-white">{formatTimer(elapsedSeconds)}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-center min-w-[100px]">
              <span className="text-[11px] text-slate-400 block uppercase font-mono">Progress</span>
              <span className="text-lg font-mono font-bold text-cyan-400">{progressPercentage}%</span>
            </div>

            <div className="flex items-center space-x-2">
              {!isFinished && isDeploying && (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              )}

              {isFinished && (
                <button
                  onClick={onOpenAuditModal}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  <Award className="w-4 h-4" />
                  <span>View Provisioning Certificate</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCurrentStepIndex(0);
                  setIsFinished(false);
                  setIsDeploying(true);
                  setIsPaused(false);
                  setLogs([]);
                  setElapsedSeconds(0);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Re-Run</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>
              Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}:{' '}
              <strong className="text-white">
                {currentStepIndex < steps.length ? steps[currentStepIndex]?.title : 'All steps completed'}
              </strong>
            </span>
            <span className="font-mono text-cyan-400 font-semibold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Runner Grid: Pipeline on Left, Terminal on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step-by-Step Task Pipeline List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Execution Pipeline Sequence</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {steps.filter((s) => s.status === 'success').length}/{steps.length} Complete
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIndex && isDeploying;
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md'
                      : step.status === 'success'
                      ? 'bg-slate-950/60 border-emerald-900/40'
                      : 'bg-slate-950/30 border-slate-800/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 shrink-0">
                      {step.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : step.status === 'running' ? (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white truncate">{step.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono uppercase ${
                            step.status === 'success'
                              ? 'text-emerald-300 bg-emerald-950'
                              : step.status === 'running'
                              ? 'text-cyan-300 bg-cyan-950 animate-pulse'
                              : 'text-slate-500 bg-slate-900'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{step.subtext}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live PowerShell Console Terminal */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl flex flex-col h-[600px] shadow-lg font-mono">
          {/* Terminal Title Bar */}
          <div className="bg-slate-900 px-4 py-3 rounded-t-xl border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <span className="text-xs text-slate-300 font-medium ml-2 flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>PowerShell Terminal (Administrator) — Live Output</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Filter */}
              <div className="flex text-[11px] bg-slate-950 p-0.5 rounded border border-slate-800">
                <button
                  onClick={() => setLogFilter('all')}
                  className={`px-2 py-0.5 rounded ${logFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setLogFilter('success')}
                  className={`px-2 py-0.5 rounded ${logFilter === 'success' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}
                >
                  Pass
                </button>
                <button
                  onClick={() => setLogFilter('errors')}
                  className={`px-2 py-0.5 rounded ${logFilter === 'errors' ? 'bg-slate-800 text-red-400' : 'text-slate-400'}`}
                >
                  Warn
                </button>
              </div>

              <button
                onClick={copyAllLogs}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                title="Copy terminal logs"
              >
                {copiedLog ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 p-4 overflow-y-auto text-xs leading-relaxed space-y-1 bg-slate-950 text-slate-300">
            <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-900">
              Microsoft Windows [Version 10.0.22631.3880]
              <br />
              (c) Microsoft Corporation. AutoPC Zero-Touch Workstation Deployment Hook initialized.
            </div>

            {filteredLogs.length === 0 ? (
              <div className="text-slate-600 italic py-4">Waiting for execution instructions...</div>
            ) : (
              filteredLogs.map((log, i) => (
                <div
                  key={i}
                  className={`font-mono text-[11px] ${
                    log.level === 'success'
                      ? 'text-emerald-400'
                      : log.level === 'warn'
                      ? 'text-yellow-400'
                      : log.level === 'error'
                      ? 'text-red-400'
                      : 'text-slate-300'
                  }`}
                >
                  {log.message}
                </div>
              ))
            )}

            {isDeploying && !isFinished && (
              <div className="flex items-center space-x-2 text-cyan-400 text-[11px] animate-pulse">
                <span>&gt; Processing UNC stream: \\corp-fs01\deployments...</span>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Footer */}
          <div className="bg-slate-900/60 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Log destination: C:\ProgramData\PCSetup\Logs\Master_Provisioning.log</span>
            <span>Encoding: UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
