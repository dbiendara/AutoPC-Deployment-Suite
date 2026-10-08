import React, { useState } from 'react';
import { DeploymentRecord, SoftwarePackage, ChecklistItem } from '../types';
import {
  History,
  CheckCircle2,
  Clock,
  HardDrive,
  User,
  Shield,
  FileText,
  Search,
  Download,
  Award,
} from 'lucide-react';

interface DeploymentHistoryProps {
  deployments: DeploymentRecord[];
  packages: SoftwarePackage[];
  checklists: ChecklistItem[];
  onViewCertificate: (record: DeploymentRecord) => void;
}

export const DeploymentHistory: React.FC<DeploymentHistoryProps> = ({
  deployments,
  packages,
  checklists,
  onViewCertificate,
}) => {
  const [search, setSearch] = useState('');

  const filtered = deployments.filter((d) => {
    return (
      d.machineName.toLowerCase().includes(search.toLowerCase()) ||
      d.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()) ||
      d.technicianName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2 mb-1">
          <History className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white">Workstation Provisioning Audit Register</h1>
        </div>
        <p className="text-xs text-slate-400">
          Historical zero-touch deployment logs, technician sign-offs, and software installation records
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search by machine name, employee, department, or technician..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Deployments List */}
      <div className="space-y-4">
        {filtered.map((dep) => {
          return (
            <div
              key={dep.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-white font-mono">{dep.machineName}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                        {dep.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Assignee: <strong className="text-slate-200">{dep.employeeName}</strong> ({dep.department}) • Serial: {dep.serialNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onViewCertificate(dep)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Audit Certificate</span>
                  </button>
                </div>
              </div>

              {/* Details grid */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Deployment Timestamp</span>
                  <span className="text-slate-200 font-mono">
                    {new Date(dep.startedAt).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Technician In Charge</span>
                  <span className="text-slate-200">{dep.technicianName}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Installed Packages</span>
                  <span className="text-slate-200 font-semibold">{dep.selectedPackageIds.length} Packages</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">System Tasks Executed</span>
                  <span className="text-slate-200 font-semibold">{dep.selectedChecklistIds.length} Checklist Tasks</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
