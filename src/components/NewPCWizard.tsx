import React, { useState, useMemo } from 'react';
import {
  SoftwarePackage,
  CustomerProfile,
  SystemConfigSettings,
  SystemConfigSwitch,
} from '../types';
import {
  Monitor,
  CheckCircle2,
  Circle,
  Play,
  HardDrive,
  Building2,
  Users,
  Search,
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
  FileCode,
  ShieldAlert,
  Moon,
  Sun,
  Edit3,
  Plus,
  Trash2,
  FilePlus,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';

interface NewPCWizardProps {
  packages: SoftwarePackage[];
  customers: CustomerProfile[];
  machineName: string;
  setMachineName: (name: string) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  selectedPackageIds: string[];
  setSelectedPackageIds: React.Dispatch<React.SetStateAction<string[]>>;
  packageCustomSwitches: Record<string, string>;
  setPackageCustomSwitches: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  packageConfigFiles: Record<string, string>;
  setPackageConfigFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  systemConfig: SystemConfigSettings;
  setSystemConfig: React.Dispatch<React.SetStateAction<SystemConfigSettings>>;
  systemSwitches: SystemConfigSwitch[];
  enabledSwitchIds: string[];
  setEnabledSwitchIds: React.Dispatch<React.SetStateAction<string[]>>;
  switchParameters: Record<string, string | number>;
  setSwitchParameters: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
  onOpenSystemConfigManager: () => void;
  onDeleteSwitch: (id: string) => void;
  onOpenManualPackageModal: () => void;
  onStartDeployment: () => void;
  onOpenScriptModal: () => void;
}

export const NewPCWizard: React.FC<NewPCWizardProps> = ({
  packages,
  customers,
  machineName,
  setMachineName,
  selectedCustomerId,
  setSelectedCustomerId,
  selectedPackageIds,
  setSelectedPackageIds,
  packageCustomSwitches,
  setPackageCustomSwitches,
  packageConfigFiles,
  setPackageConfigFiles,
  systemConfig,
  setSystemConfig,
  systemSwitches,
  enabledSwitchIds,
  setEnabledSwitchIds,
  switchParameters,
  setSwitchParameters,
  onOpenSystemConfigManager,
  onDeleteSwitch,
  onOpenManualPackageModal,
  onStartDeployment,
  onOpenScriptModal,
}) => {
  const [packageSearch, setPackageSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Selected customer profile
  const currentCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  // Handle switching customer profile
  const handleSelectCustomer = (customer: CustomerProfile) => {
    setSelectedCustomerId(customer.id);
    setSelectedPackageIds(customer.packageIds || []);
    if (customer.packageCustomSwitches) {
      setPackageCustomSwitches(customer.packageCustomSwitches);
    }
    if (customer.packageConfigFiles) {
      setPackageConfigFiles(customer.packageConfigFiles);
    }
    setSystemConfig((prev) => ({
      ...prev,
      enableRdp: customer.enableRdp,
      adAdminGroupName: customer.defaultAdAdminGroup,
      screenTimeoutAc: customer.powerPlanSettings.screenTimeoutAc,
      standbyTimeoutAc: customer.powerPlanSettings.standbyTimeoutAc,
    }));
    setSwitchParameters((prev) => ({
      ...prev,
      adAdminGroupName: customer.defaultAdAdminGroup,
      screenTimeoutAc: customer.powerPlanSettings.screenTimeoutAc,
      standbyTimeoutAc: customer.powerPlanSettings.standbyTimeoutAc,
    }));
  };

  // Toggle package
  const togglePackage = (pkgId: string) => {
    setSelectedPackageIds((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  // Toggle switch
  const toggleSwitch = (switchId: string) => {
    const isEnabling = !enabledSwitchIds.includes(switchId);
    setEnabledSwitchIds((prev) =>
      isEnabling ? [...prev, switchId] : prev.filter((id) => id !== switchId)
    );

    // Keep systemConfig in sync
    if (switchId === 'sw-rdp') {
      setSystemConfig((prev) => ({ ...prev, enableRdp: isEnabling }));
    } else if (switchId === 'sw-adgroup') {
      setSystemConfig((prev) => ({ ...prev, addAdGroupToAdmins: isEnabling }));
    } else if (switchId === 'sw-power-screen' || switchId === 'sw-power-standby') {
      setSystemConfig((prev) => ({ ...prev, setPowerPlan: isEnabling }));
    }
  };

  // Update parameter value for a switch
  const handleParamChange = (key: string, value: string | number) => {
    setSwitchParameters((prev) => ({ ...prev, [key]: value }));

    // Keep legacy systemConfig in sync
    if (key === 'adAdminGroupName') {
      setSystemConfig((prev) => ({ ...prev, adAdminGroupName: String(value) }));
    } else if (key === 'screenTimeoutAc') {
      setSystemConfig((prev) => ({ ...prev, screenTimeoutAc: Number(value) }));
    } else if (key === 'standbyTimeoutAc') {
      setSystemConfig((prev) => ({ ...prev, standbyTimeoutAc: Number(value) }));
    }
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
        pkg.description.toLowerCase().includes(packageSearch.toLowerCase()) ||
        (pkg.extraSwitches && pkg.extraSwitches.toLowerCase().includes(packageSearch.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || pkg.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [packages, packageSearch, categoryFilter]);

  // Total estimated deployment time
  const totalEstimatedMinutes = useMemo(() => {
    const packageTime = packages
      .filter((p) => selectedPackageIds.includes(p.id))
      .reduce((acc, p) => acc + (p.estimatedMinutes || 2), 0);
    return Math.ceil(packageTime + 1); // ~1 min for system config
  }, [packages, selectedPackageIds]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner: Local Active Directory Environment */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Directory Member PC • Hostname Configured</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Workstation Onboarding & Software Deployment
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm">
              Select the customer company profile, verify automated system configuration switches, and execute silent software installations from UNC shares.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1.5 shrink-0 min-w-[250px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Local Hostname:</span>
              <input
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                className="bg-slate-900 text-white font-mono px-2 py-0.5 rounded border border-slate-700 text-xs w-36 text-right focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Customer:</span>
              <span className="text-cyan-400 font-semibold truncate max-w-[150px]">{currentCustomer?.companyName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>AD Domain:</span>
              <span className="text-slate-300 font-mono">{currentCustomer?.domainName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Customer / Company Profiles Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-900/60 text-cyan-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Select Customer / Company Profile</h2>
              <p className="text-xs text-slate-400">
                Applies client-specific active directory admin delegation, default software packages, and installer parameters
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {customers.map((cust) => {
            const isSelected = selectedCustomerId === cust.id;
            return (
              <button
                key={cust.id}
                onClick={() => handleSelectCustomer(cust)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="text-sm font-bold text-white line-clamp-1">{cust.companyName}</span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {cust.notes || `Configured for ${cust.domainName}`}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 text-[11px] space-y-1 text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Domain:</span>
                    <span className="font-mono text-slate-300">{cust.domainName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin Group:</span>
                    <span className="font-mono text-cyan-400 truncate max-w-[140px]" title={cust.defaultAdAdminGroup}>
                      {cust.defaultAdAdminGroup.split('\\')[1] || cust.defaultAdAdminGroup}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Default Software:</span>
                    <span className="text-emerald-400 font-semibold">{cust.packageIds?.length || 0} packages</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: System Configuration Checklist & Switch Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 text-purple-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-white">System Configuration Switches</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800/70 text-purple-300 font-medium">
                  {enabledSwitchIds.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enable, customize, or add new PowerShell workstation configuration tasks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={onOpenSystemConfigManager}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-purple-800/50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Manage / Add Switches</span>
            </button>
          </div>
        </div>

        {/* Dynamic Grid of System Configuration Switches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemSwitches.map((sw) => {
            const isEnabled = enabledSwitchIds.includes(sw.id);
            const paramVal = switchParameters[sw.parameterKey || ''] ?? sw.parameterDefaultValue;

            return (
              <div
                key={sw.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isEnabled
                    ? 'bg-slate-950/80 border-purple-500/60 shadow-sm'
                    : 'bg-slate-950/30 border-slate-800/80 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <label className="text-xs font-bold text-white flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleSwitch(sw.id)}
                        className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="leading-tight">{sw.title}</span>
                    </label>

                    {sw.isRemovable && (
                      <button
                        onClick={() => onDeleteSwitch(sw.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors shrink-0"
                        title="Remove custom switch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    {sw.description}
                  </p>
                </div>

                {/* Parameter Input if applicable and switch is enabled */}
                {sw.hasParameter && sw.parameterKey && (
                  <div className="pt-2 border-t border-slate-850 mt-1">
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">
                      {sw.parameterLabel || sw.parameterKey}:
                    </label>

                    {sw.parameterType === 'select' && sw.parameterOptions ? (
                      <select
                        value={paramVal}
                        onChange={(e) =>
                          handleParamChange(
                            sw.parameterKey!,
                            isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        {sw.parameterOptions.map((opt) => (
                          <option key={opt.label} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={sw.parameterType === 'number' ? 'number' : 'text'}
                        value={paramVal || ''}
                        onChange={(e) => handleParamChange(sw.parameterKey!, e.target.value)}
                        placeholder={`e.g. ${sw.parameterDefaultValue || ''}`}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-purple-500"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick "+ Add New Switch" Card */}
          <button
            onClick={onOpenSystemConfigManager}
            className="p-4 rounded-xl border border-dashed border-slate-800 hover:border-purple-500/70 hover:bg-slate-900/60 transition-all text-slate-400 hover:text-purple-300 flex flex-col items-center justify-center space-y-2 min-h-[140px] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Add New Switch</span>
            <span className="text-[10px] text-slate-500">Custom PowerShell task or registry key</span>
          </button>
        </div>
      </div>

      {/* Step 3: Software Packages Selection with Extra Switches & Config File Import */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-white">Software Packages & Extra Installer Switches</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/70 text-emerald-300 font-medium">
                  {selectedPackageIds.length} Selected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Silent deployment from UNC shares with custom configuration files and extra switches (e.g. TeamViewer Host tokens)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {/* Quick Manual Add Button right in the wizard */}
            <button
              onClick={onOpenManualPackageModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-800/60 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Package Manually</span>
            </button>

            <button
              onClick={() => setSelectedPackageIds(packages.map((p) => p.id))}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedPackageIds([])}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search software, UNC file, or extra switches..."
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
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPackages.map((pkg) => {
            const isSelected = selectedPackageIds.includes(pkg.id);
            const extraSwitches = packageCustomSwitches[pkg.id] || pkg.extraSwitches;
            const configFile = packageConfigFiles[pkg.id] || pkg.configFileImport?.configFileName;
            const isEditing = editingPackageId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-950/90 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => togglePackage(pkg.id)}
                      className="flex items-start space-x-3 cursor-pointer flex-1 select-none"
                    >
                      <div className="mt-0.5">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-white">{pkg.name}</h3>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            v{pkg.version}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{pkg.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {pkg.installerType}
                      </span>
                    </div>
                  </div>

                  {/* UNC Path & Est Time */}
                  <div className="mt-2.5 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-1.5 font-mono truncate max-w-[280px]">
                      <FolderOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate" title={`${pkg.uncPath}\\${pkg.fileName}`}>
                        {pkg.uncPath}\{pkg.fileName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{pkg.estimatedMinutes}m</span>
                    </div>
                  </div>

                  {/* Badges for Extra Switches and Config File */}
                  {(extraSwitches || configFile) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-850/80 space-y-1.5 text-[11px]">
                      {extraSwitches && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-mono">Extra Switches:</span>
                          <button
                            onClick={() => setEditingPackageId(isEditing ? null : pkg.id)}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Customize</span>
                          </button>
                        </div>
                      )}
                      {extraSwitches && (
                        <code className="block bg-slate-900 border border-slate-800 p-1.5 rounded text-[10px] text-emerald-300 font-mono truncate">
                          {extraSwitches}
                        </code>
                      )}

                      {configFile && (
                        <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono">
                          <FileCode className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>Config File Import:</span>
                          <span className="text-cyan-300 truncate">{configFile}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Parameter Customizer */}
                  {isEditing && (
                    <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-cyan-500/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Installer Parameter Override:</span>
                        <button
                          onClick={() => setEditingPackageId(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          Done
                        </button>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 font-mono">Extra Switches:</label>
                        <input
                          type="text"
                          value={packageCustomSwitches[pkg.id] || pkg.extraSwitches || ''}
                          onChange={(e) =>
                            setPackageCustomSwitches((prev) => ({
                              ...prev,
                              [pkg.id]: e.target.value,
                            }))
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      {pkg.configFileImport?.enabled && (
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1 font-mono">Config File Path:</label>
                          <input
                            type="text"
                            value={packageConfigFiles[pkg.id] || pkg.configFileImport.configUncPath || ''}
                            onChange={(e) =>
                              setPackageConfigFiles((prev) => ({
                                ...prev,
                                [pkg.id]: e.target.value,
                              }))
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Launcher Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Ready for Workstation Provisioning</h3>
          </div>
          <p className="text-xs text-slate-300">
            Target Host: <strong className="text-white font-mono">{machineName}</strong> • Profile:{' '}
            <strong className="text-cyan-400">{currentCustomer?.companyName}</strong> •{' '}
            <strong className="text-emerald-400">{selectedPackageIds.length} Packages</strong> •{' '}
            <strong className="text-purple-400">{enabledSwitchIds.length} Switches</strong> • ~{totalEstimatedMinutes} min estimated
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenScriptModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Generate PowerShell Script</span>
          </button>

          <button
            onClick={onStartDeployment}
            disabled={selectedPackageIds.length === 0}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run Zero-Touch Deployment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
