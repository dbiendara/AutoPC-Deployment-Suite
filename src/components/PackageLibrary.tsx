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
  Sliders,
  FileCode,
  Sparkles,
  Save,
  X,
  FilePlus,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface PackageLibraryProps {
  packages: SoftwarePackage[];
  onAddPackage: (pkg: SoftwarePackage) => void;
  onUpdatePackage?: (pkg: SoftwarePackage) => void;
  onDeletePackage: (id: string) => void;
  onOpenAIDetective: () => void;
}

export const PackageLibrary: React.FC<PackageLibraryProps> = ({
  packages,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage,
  onOpenAIDetective,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Manual package form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [category, setCategory] = useState<SoftwarePackage['category']>('Utilities');
  const [uncPath, setUncPath] = useState('\\\\corp-fs01.internal.net\\deployments\\apps');
  const [fileName, setFileName] = useState('');
  const [installerType, setInstallerType] = useState<SoftwarePackage['installerType']>('MSI');
  const [silentArgs, setSilentArgs] = useState('/qn /norestart ALLUSERS=1');
  const [extraSwitches, setExtraSwitches] = useState('');
  const [logArgs, setLogArgs] = useState('/l*v "C:\\ProgramData\\PCSetup\\Logs\\install.log"');
  const [rebootBehavior, setRebootBehavior] = useState<SoftwarePackage['rebootBehavior']>('Suppress');
  const [detectionType, setDetectionType] = useState<SoftwarePackage['detectionType']>('FilePath');
  const [detectionRule, setDetectionRule] = useState('C:\\Program Files\\');
  const [successExitCodes, setSuccessExitCodes] = useState('0, 3010');
  const [estimatedMinutes, setEstimatedMinutes] = useState(2);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Config file import state
  const [hasConfigFile, setHasConfigFile] = useState(false);
  const [configFileName, setConfigFileName] = useState('');
  const [configUncPath, setConfigUncPath] = useState('');
  const [importSwitch, setImportSwitch] = useState('');
  const [preCopyDestination, setPreCopyDestination] = useState('');

  const categories = [
    'All',
    'RemoteSupport',
    'Browser',
    'Development',
    'Productivity',
    'Communication',
    'Security',
    'Utilities',
  ];

  // Open creation form with fresh defaults
  const openCreateForm = () => {
    setEditingPkgId(null);
    setName('');
    setVersion('1.0.0');
    setCategory('Utilities');
    setUncPath('\\\\corp-fs01.internal.net\\deployments\\apps\\myapp');
    setFileName('setup.msi');
    setInstallerType('MSI');
    setSilentArgs('/qn /norestart ALLUSERS=1');
    setExtraSwitches('');
    setLogArgs('/l*v "C:\\ProgramData\\PCSetup\\Logs\\install.log"');
    setRebootBehavior('Suppress');
    setDetectionType('FilePath');
    setDetectionRule('C:\\Program Files\\MyApp\\app.exe');
    setSuccessExitCodes('0, 3010');
    setEstimatedMinutes(2);
    setDescription('Standard enterprise application deployed silently from UNC share.');
    setNotes('');
    setHasConfigFile(false);
    setConfigFileName('');
    setConfigUncPath('');
    setImportSwitch('');
    setPreCopyDestination('');
    setIsFormOpen(true);
  };

  // Open edit form with existing package data
  const openEditForm = (pkg: SoftwarePackage) => {
    setEditingPkgId(pkg.id);
    setName(pkg.name);
    setVersion(pkg.version);
    setCategory(pkg.category);
    setUncPath(pkg.uncPath);
    setFileName(pkg.fileName);
    setInstallerType(pkg.installerType);
    setSilentArgs(pkg.silentArgs);
    setExtraSwitches(pkg.extraSwitches || '');
    setLogArgs(pkg.logArgs || '');
    setRebootBehavior(pkg.rebootBehavior);
    setDetectionType(pkg.detectionType);
    setDetectionRule(pkg.detectionRule);
    setSuccessExitCodes((pkg.successExitCodes || [0]).join(', '));
    setEstimatedMinutes(pkg.estimatedMinutes || 2);
    setDescription(pkg.description || '');
    setNotes(pkg.notes || '');

    if (pkg.configFileImport?.enabled) {
      setHasConfigFile(true);
      setConfigFileName(pkg.configFileImport.configFileName || '');
      setConfigUncPath(pkg.configFileImport.configUncPath || '');
      setImportSwitch(pkg.configFileImport.importSwitch || '');
      setPreCopyDestination(pkg.configFileImport.preCopyDestination || '');
    } else {
      setHasConfigFile(false);
      setConfigFileName('');
      setConfigUncPath('');
      setImportSwitch('');
      setPreCopyDestination('');
    }

    setIsFormOpen(true);
  };

  // Quick preset helper
  const applyPreset = (type: 'MSI' | 'InnoSetup' | 'NSIS' | 'WiX' | 'TeamViewer') => {
    if (type === 'MSI') {
      setInstallerType('MSI');
      setSilentArgs('/qn /norestart ALLUSERS=1');
      setLogArgs('/l*v "C:\\ProgramData\\PCSetup\\Logs\\install.log"');
      setSuccessExitCodes('0, 3010');
      setDetectionType('FilePath');
    } else if (type === 'TeamViewer') {
      setName('TeamViewer Host');
      setCategory('RemoteSupport');
      setInstallerType('MSI');
      setFileName('TeamViewer_Host.msi');
      setSilentArgs('/qn /norestart');
      setExtraSwitches('CUSTOMCONFIGID=idc89120 APITOKEN=109283-token ASSIGNMENTOPTIONS="--alias %COMPUTERNAME% --grant-easy-access"');
      setHasConfigFile(true);
      setConfigFileName('TeamViewer_Settings.tvopt');
      setConfigUncPath(`${uncPath}\\TeamViewer_Settings.tvopt`);
      setImportSwitch(`SETTINGSFILE="${uncPath}\\TeamViewer_Settings.tvopt"`);
      setPreCopyDestination('C:\\Program Files\\TeamViewer\\');
      setDetectionType('FilePath');
      setDetectionRule('C:\\Program Files\\TeamViewer\\TeamViewer.exe');
      setSuccessExitCodes('0, 3010');
    } else if (type === 'InnoSetup') {
      setInstallerType('InnoSetup');
      setSilentArgs('/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-');
      setLogArgs('/LOG="C:\\ProgramData\\PCSetup\\Logs\\install.log"');
      setSuccessExitCodes('0');
      setDetectionType('FilePath');
    } else if (type === 'NSIS') {
      setInstallerType('NSIS');
      setSilentArgs('/S');
      setLogArgs('');
      setSuccessExitCodes('0');
      setDetectionType('FilePath');
    } else if (type === 'WiX') {
      setInstallerType('WiX');
      setSilentArgs('-q --silent');
      setLogArgs('-log "C:\\ProgramData\\PCSetup\\Logs\\install.log"');
      setSuccessExitCodes('0, 3010');
      setDetectionType('FilePath');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fileName.trim()) return;

    const parsedExitCodes = successExitCodes
      .split(',')
      .map((c) => parseInt(c.trim(), 10))
      .filter((n) => !isNaN(n));

    const packageData: SoftwarePackage = {
      id: editingPkgId || `pkg-${Date.now().toString(36)}`,
      name: name.trim(),
      version: version.trim() || '1.0.0',
      category,
      uncPath: uncPath.trim(),
      fileName: fileName.trim(),
      installerType,
      silentArgs: silentArgs.trim(),
      extraSwitches: extraSwitches.trim() || undefined,
      configFileImport: hasConfigFile
        ? {
            enabled: true,
            configFileName: configFileName.trim(),
            configUncPath: configUncPath.trim(),
            importSwitch: importSwitch.trim() || undefined,
            preCopyDestination: preCopyDestination.trim() || undefined,
          }
        : undefined,
      logArgs: logArgs.trim() || undefined,
      rebootBehavior,
      detectionType,
      detectionRule: detectionRule.trim(),
      successExitCodes: parsedExitCodes.length > 0 ? parsedExitCodes : [0],
      estimatedMinutes: Number(estimatedMinutes) || 2,
      description: description.trim() || `${name} software package`,
      notes: notes.trim() || undefined,
      testInstallStatus: 'Verified',
      aiConfidence: 100,
    };

    if (editingPkgId && onUpdatePackage) {
      onUpdatePackage(packageData);
    } else {
      onAddPackage(packageData);
    }

    setIsFormOpen(false);
  };

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
      {/* Header with Two Clear Actions: Manual Add and AI Scan */}
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

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {/* Manual Add Button */}
          <button
            onClick={openCreateForm}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Package Manually</span>
          </button>

          {/* AI Detective Button */}
          <button
            onClick={onOpenAIDetective}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white font-semibold text-xs border border-purple-800/60 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Detective</span>
          </button>
        </div>
      </div>

      {/* Manual Package Creation / Editing Form Modal */}
      {isFormOpen && (
        <div className="bg-slate-900 border border-cyan-500/70 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FilePlus className="w-5 h-5 text-cyan-400" />
                <span>{editingPkgId ? `Edit Package: ${name}` : 'Add New Package Manually (No AI)'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Define the UNC share directory, silent switches, and optional config file imports
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick installer preset buttons */}
          <div>
            <span className="text-[11px] text-slate-400 font-medium block mb-2">
              Quick Auto-Fill Presets for Common Packaging Types:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('TeamViewer')}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-purple-800/80 text-purple-300 hover:bg-purple-950/40 transition-colors font-medium"
              >
                ⭐ TeamViewer Host (MSI + Token + .tvopt)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('MSI')}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 hover:bg-slate-800 transition-colors font-mono"
              >
                Standard MSI (/qn /norestart)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('InnoSetup')}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-mono"
              >
                Inno Setup (/VERYSILENT)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('NSIS')}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-mono"
              >
                NSIS (/S)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('WiX')}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-mono"
              >
                WiX Burn (-q --silent)
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4">
            {/* Row 1: Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Software Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AnyDesk Enterprise"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 7.1.13"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SoftwarePackage['category'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="RemoteSupport">Remote Support / Management</option>
                  <option value="Browser">Web Browser</option>
                  <option value="Development">Developer Tools</option>
                  <option value="Productivity">Productivity & Office</option>
                  <option value="Communication">Team Communications</option>
                  <option value="Security">Security & Antivirus</option>
                  <option value="Utilities">Utilities & Tools</option>
                </select>
              </div>
            </div>

            {/* Row 2: UNC Share & File */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  UNC Share Directory <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uncPath}
                  onChange={(e) => setUncPath(e.target.value)}
                  placeholder="\\corp-fs01.internal.net\deployments\apps\anydesk"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Installer Binary Filename <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="AnyDeskSetup.msi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Row 3: Installer Framework & Silent Arguments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Installer Packaging Type</label>
                <select
                  value={installerType}
                  onChange={(e) => setInstallerType(e.target.value as SoftwarePackage['installerType'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="MSI">MSI (Windows Installer)</option>
                  <option value="InnoSetup">Inno Setup</option>
                  <option value="NSIS">NSIS (Nullsoft)</option>
                  <option value="WiX">WiX / Burn Bootstrapper</option>
                  <option value="InstallShield">InstallShield</option>
                  <option value="CustomEXE">Custom EXE / Bootstrapper</option>
                  <option value="PowerShellScript">PowerShell Script (.ps1)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Base Silent Install Arguments
                </label>
                <input
                  type="text"
                  value={silentArgs}
                  onChange={(e) => setSilentArgs(e.target.value)}
                  placeholder="/qn /norestart ALLUSERS=1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Row 4: Extra Installer Switches (TeamViewer Host tokens, Custom Properties, etc.) */}
            <div className="text-xs">
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Extra MSI / Command Switches (Optional)</span>
              </label>
              <input
                type="text"
                value={extraSwitches}
                onChange={(e) => setExtraSwitches(e.target.value)}
                placeholder='e.g. CUSTOMCONFIGID=idc89120 APITOKEN=109283-acmetoken ASSIGNMENTOPTIONS="--alias %COMPUTERNAME% --grant-easy-access"'
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Additional MSI properties or custom flags appended directly to the silent execution command.
              </span>
            </div>

            {/* Row 5: Configuration File Import (Collapsible) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConfigFile}
                    onChange={(e) => setHasConfigFile(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                  />
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>Import Configuration File from UNC Share (e.g. .tvopt, .conf, .xml)</span>
                </label>
              </div>

              {hasConfigFile && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-850">
                  <div>
                    <label className="block text-slate-400 mb-1">Configuration Filename:</label>
                    <input
                      type="text"
                      value={configFileName}
                      onChange={(e) => setConfigFileName(e.target.value)}
                      placeholder="TeamViewer_Settings.tvopt"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Config File UNC Path:</label>
                    <input
                      type="text"
                      value={configUncPath}
                      onChange={(e) => setConfigUncPath(e.target.value)}
                      placeholder="\\corp-fs01\deployments\apps\teamviewer\TeamViewer_Settings.tvopt"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-purple-300 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Installer Import Switch:</label>
                    <input
                      type="text"
                      value={importSwitch}
                      onChange={(e) => setImportSwitch(e.target.value)}
                      placeholder='SETTINGSFILE="<CONFIG_PATH>"'
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-300 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Local Pre-Copy Destination (Optional):</label>
                    <input
                      type="text"
                      value={preCopyDestination}
                      onChange={(e) => setPreCopyDestination(e.target.value)}
                      placeholder="C:\Program Files\TeamViewer\"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Row 6: Detection & Verification */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detection Rule Type</label>
                <select
                  value={detectionType}
                  onChange={(e) => setDetectionType(e.target.value as SoftwarePackage['detectionType'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="FilePath">Local File Path (Test-Path)</option>
                  <option value="Registry">Registry Key (Uninstall Key)</option>
                  <option value="PowerShellCheck">Custom PowerShell Check</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Detection Rule Path or Expression
                </label>
                <input
                  type="text"
                  value={detectionRule}
                  onChange={(e) => setDetectionRule(e.target.value)}
                  placeholder="C:\Program Files\AnyDesk\anydesk.exe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Row 7: Exit Codes, Log Args & Minutes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Success Exit Codes</label>
                <input
                  type="text"
                  value={successExitCodes}
                  onChange={(e) => setSuccessExitCodes(e.target.value)}
                  placeholder="0, 3010"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reboot Behavior</label>
                <select
                  value={rebootBehavior}
                  onChange={(e) => setRebootBehavior(e.target.value as SoftwarePackage['rebootBehavior'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Suppress">Suppress (Zero Restart)</option>
                  <option value="Prompt">Prompt</option>
                  <option value="Allow">Allow</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estimated Duration (Min)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="text-xs">
              <label className="block text-slate-300 font-semibold mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of package purpose"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30"
              >
                <Save className="w-4 h-4" />
                <span>{editingPkgId ? 'Update Package' : 'Save Package to Catalog'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

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
                      {pkg.configFileImport?.enabled && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-medium">
                          Config File Import
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-1">
                      <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{pkg.uncPath}\{pkg.fileName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() => openEditForm(pkg)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1"
                    title="Edit package details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

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
                    {pkg.extraSwitches && (
                      <div className="mt-2">
                        <span className="text-[11px] text-cyan-400 block mb-0.5">Extra MSI Switches:</span>
                        <code className="block bg-slate-950 p-1.5 rounded border border-slate-800 text-cyan-300 font-mono text-[11px] break-all">
                          {pkg.extraSwitches}
                        </code>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Post-Install Detection Rule:</span>
                    <code className="block bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 font-mono text-[11px] break-all">
                      {pkg.detectionRule}
                    </code>
                    {pkg.configFileImport?.enabled && (
                      <div className="mt-2">
                        <span className="text-[11px] text-purple-400 block mb-0.5">Configuration File Import:</span>
                        <code className="block bg-slate-950 p-1.5 rounded border border-slate-800 text-purple-300 font-mono text-[11px] break-all">
                          {pkg.configFileImport.configUncPath}
                        </code>
                      </div>
                    )}
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
