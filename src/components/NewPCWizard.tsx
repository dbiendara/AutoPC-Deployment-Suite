import React, { useState, useMemo } from 'react';
import {
  SoftwarePackage,
  ChecklistItem,
  RoleProfile,
} from '../types';
import {
  Monitor,
  CheckCircle2,
  Circle,
  Play,
  Code2,
  HardDrive,
  User,
  Building,
  Hash,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  Sparkles,
  Server,
  Terminal,
  Settings,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Download,
  Copy,
  Check,
  Info,
  Sliders,
} from 'lucide-react';

interface NewPCWizardProps {
  packages: SoftwarePackage[];
  checklists: ChecklistItem[];
  profiles: RoleProfile[];
  machineName: string;
  setMachineName: (name: string) => void;
  employeeName: string;
  setEmployeeName: (name: string) => void;
  employeeEmail: string;
  setEmployeeEmail: (email: string) => void;
  department: string;
  setDepartment: (dept: string) => void;
  serialNumber: string;
  setSerialNumber: (sn: string) => void;
  selectedPackageIds: string[];
  setSelectedPackageIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedChecklistIds: string[];
  setSelectedChecklistIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  onStartDeployment: () => void;
  onOpenScriptModal: () => void;
}

export const NewPCWizard: React.FC<NewPCWizardProps> = ({
  packages,
  checklists,
  profiles,
  machineName,
  setMachineName,
  employeeName,
  setEmployeeName,
  employeeEmail,
  setEmployeeEmail,
  department,
  setDepartment,
  serialNumber,
  setSerialNumber,
  selectedPackageIds,
  setSelectedPackageIds,
  selectedChecklistIds,
  setSelectedChecklistIds,
  activeProfileId,
  setActiveProfileId,
  onStartDeployment,
  onOpenScriptModal,
}) => {
  const [packageSearch, setPackageSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

  // Auto-generate standardized computer hostname
  const generateHostname = () => {
    const deptPrefix = department ? department.substring(0, 3).toUpperCase() : 'CORP';
    const randomNum = Math.floor(100 + Math.random() * 900);
    setMachineName(`${deptPrefix}-W11-${randomNum}`);
  };

  // Profile selection handler
  const handleSelectProfile = (profile: RoleProfile) => {
    setActiveProfileId(profile.id);
    setSelectedPackageIds(profile.packageIds);
    setSelectedChecklistIds(profile.checklistIds);
  };

  // Toggle package
  const togglePackage = (pkgId: string) => {
    setSelectedPackageIds((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  // Toggle checklist item
  const toggleChecklist = (chkId: string) => {
    setSelectedChecklistIds((prev) =>
      prev.includes(chkId) ? prev.filter((id) => id !== chkId) : [...prev, chkId]
    );
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(packages.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [packages]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
        pkg.fileName.toLowerCase().includes(packageSearch.toLowerCase()) ||
        pkg.description.toLowerCase().includes(packageSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || pkg.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [packages, packageSearch, categoryFilter]);

  // Total estimated deployment time
  const totalEstimatedMinutes = useMemo(() => {
    const packageTime = packages
      .filter((p) => selectedPackageIds.includes(p.id))
      .reduce((acc, p) => acc + (p.estimatedMinutes || 2), 0);
    const checklistTime = selectedChecklistIds.length * 0.5; // ~30 sec per checklist task
    return Math.ceil(packageTime + checklistTime);
  }, [packages, selectedPackageIds, selectedChecklistIds]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Setup Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Automated Onboarding & Provisioning Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Provision New Workstation
          </h1>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            Configure this PC in minutes. Select the employee role to apply recommended software packages from the corporate UNC network share and automate system configurations silently.
          </p>
        </div>
      </div>

      {/* Step 1: Machine Identity & Employee Assignment */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-900/60 text-cyan-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Target Machine & Assignee Details</h2>
              <p className="text-xs text-slate-400">Identify this PC for corporate asset register & logs</p>
            </div>
          </div>
          <button
            onClick={generateHostname}
            className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2.5 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Auto-Gen Hostname</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>Computer Hostname</span>
            </label>
            <input
              type="text"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              placeholder="e.g. CORP-ENG-LPT042"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Employee Name</span>
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Department</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <option value="Engineering">Software Engineering</option>
              <option value="Design">Product & UX Design</option>
              <option value="Finance">Finance & Accounting</option>
              <option value="HR">People & HR</option>
              <option value="Operations">Operations & Logistics</option>
              <option value="IT Systems">IT & Security Systems</option>
              <option value="Executive">Executive Leadership</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Hardware Serial / Asset Tag</span>
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. 5CG2490X1P"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Role Profile Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 text-blue-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Select Role Profile Template</h2>
              <p className="text-xs text-slate-400">Pre-populates required apps & system checklists with 1 click</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {profiles.map((profile) => {
            const isSelected = activeProfileId === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => handleSelectProfile(profile)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{profile.name}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {profile.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{profile.packageIds.length} Packages</span>
                  <span>{profile.checklistIds.length} Tasks</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Software Packages to Install from UNC */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-white">Software Packages (UNC Silent Deployment)</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/70 text-emerald-300 font-medium">
                  {selectedPackageIds.length} Selected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Software binaries stored on <code className="text-cyan-400">\\corp-fs01\deployments</code> and silently installed
              </p>
            </div>
          </div>

          {/* Quick Select Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedPackageIds(packages.map((p) => p.id))}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedPackageIds([])}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search packages, filename, installer type..."
              value={packageSearch}
              onChange={(e) => setPackageSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-cyan-600 text-white font-medium'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredPackages.map((pkg) => {
            const isSelected = selectedPackageIds.includes(pkg.id);
            const isExpanded = expandedPackage === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-950/80 border-cyan-500/70 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 cursor-pointer" onClick={() => togglePackage(pkg.id)}>
                      <div className="mt-0.5">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-white">{pkg.name}</h3>
                          <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            v{pkg.version}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{pkg.description}</p>
                      </div>
                    </div>

                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {pkg.category}
                    </span>
                  </div>

                  {/* UNC Path & Silent Tag */}
                  <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px] truncate max-w-[280px]">
                      <Server className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{pkg.uncPath}\{pkg.fileName}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] border border-blue-900">
                        {pkg.installerType}
                      </span>
                      <button
                        onClick={() => setExpandedPackage(isExpanded ? null : pkg.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Technical Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block mb-1">Silent Arguments:</span>
                        <code className="block bg-slate-900 p-2 rounded border border-slate-800 text-emerald-300 font-mono text-[11px] break-all">
                          {pkg.silentArgs}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block mb-1">Detection Rule:</span>
                        <code className="block bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300 font-mono text-[11px] truncate">
                          {pkg.detectionRule}
                        </code>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Exit Codes: [{pkg.successExitCodes.join(', ')}]</span>
                        <span>Reboot: {pkg.rebootBehavior}</span>
                        <span>Est. Duration: ~{pkg.estimatedMinutes} min</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 4: System Configuration Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 text-purple-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-white">System Configuration Checklist</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800/70 text-purple-300 font-medium">
                  {selectedChecklistIds.length} Tasks Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated PowerShell tasks executed before software deployments
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedChecklistIds(checklists.map((c) => c.id))}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Select All Tasks
            </button>
            <button
              onClick={() => setSelectedChecklistIds([])}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {checklists.map((chk) => {
            const isSelected = selectedChecklistIds.includes(chk.id);
            const isExpanded = expandedChecklist === chk.id;

            return (
              <div
                key={chk.id}
                className={`rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-950/70 border-slate-700'
                    : 'bg-slate-950/30 border-slate-800/60'
                }`}
              >
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => toggleChecklist(chk.id)}>
                    <div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white">{chk.title}</span>
                        {chk.requiresReboot && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800/60 text-amber-300">
                            Reboot Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{chk.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {chk.category}
                    </span>
                    <button
                      onClick={() => setExpandedChecklist(isExpanded ? null : chk.id)}
                      className="text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-850 space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">PowerShell Implementation:</span>
                      <pre className="mt-1 bg-slate-900 p-2 rounded text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                        {chk.powershellCommand.replace(/\{\{HOSTNAME\}\}/g, machineName || 'CORP-WS-01')}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Validation Command:</span>
                      <pre className="mt-1 bg-slate-900 p-2 rounded text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                        {chk.verificationCommand}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 5: Master Action & Execution Bar */}
      <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-sm sm:text-base">
                Ready to Provision <span className="text-cyan-400 font-mono">{machineName || 'Workstation'}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium">
                {selectedPackageIds.length} Apps + {selectedChecklistIds.length} Tasks
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Estimated Deployment Time: ~{totalEstimatedMinutes} minutes</span>
              <span>•</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Audit Trail</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenScriptModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs sm:text-sm border border-slate-700 transition-all"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>View .ps1 Script</span>
            </button>

            <button
              onClick={onStartDeployment}
              disabled={selectedPackageIds.length === 0 && selectedChecklistIds.length === 0}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>RUN ZERO-TOUCH PROVISIONING</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
