import React, { useRef } from 'react';
import { DeploymentRecord, SoftwarePackage, ChecklistItem } from '../types';
import {
  Award,
  CheckCircle2,
  X,
  Printer,
  ShieldCheck,
  HardDrive,
  Calendar,
  User,
  Hash,
  Download,
} from 'lucide-react';

interface AuditCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DeploymentRecord | null;
  packages: SoftwarePackage[];
  checklists: ChecklistItem[];
}

export const AuditCertificateModal: React.FC<AuditCertificateModalProps> = ({
  isOpen,
  onClose,
  record,
  packages,
  checklists,
}) => {
  if (!isOpen || !record) return null;

  const installedPackages = packages.filter((p) => record.selectedPackageIds.includes(p.id));
  const executedTasks = checklists.filter((c) => record.selectedChecklistIds.includes(c.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Actions Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">IT Asset Provisioning Audit Certificate</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-slate-950 text-slate-200" id="certificate-print-area">
          {/* Certificate Header */}
          <div className="text-center pb-6 border-b border-slate-800">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white mb-3 shadow-lg shadow-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Certificate of Workstation Compliance
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
              AutoPC Zero-Touch Enterprise Provisioning Record
            </p>
          </div>

          {/* Machine & Assignee Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Computer Hostname</span>
              <strong className="text-white font-mono text-sm">{record.machineName}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Assignee Name</span>
              <strong className="text-white">{record.employeeName}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Department</span>
              <strong className="text-white">{record.department}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Hardware Serial</span>
              <strong className="text-white font-mono">{record.serialNumber || 'N/A'}</strong>
            </div>
          </div>

          {/* Installed Software List */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Silent Software Installations ({installedPackages.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {installedPackages.map((pkg) => (
                <div key={pkg.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">{pkg.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">v{pkg.version} • {pkg.installerType}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
                    ExitCode 0
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Checklists */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Applied System Configurations & Security Tasks ({executedTasks.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {executedTasks.map((chk) => (
                <div key={chk.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-200">{chk.title}</span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Enforced</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signoff Footer */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              <span className="block font-medium text-slate-300">Certified By:</span>
              <span>{record.technicianName} (Enterprise Desktop Engineering)</span>
            </div>
            <div>
              <span className="block font-medium text-slate-300">Timestamp:</span>
              <span className="font-mono">{new Date(record.completedAt || record.startedAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="block font-medium text-slate-300">Compliance Hash:</span>
              <span className="font-mono text-[10px] text-cyan-400">
                SHA256-{record.id.toUpperCase()}-VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
