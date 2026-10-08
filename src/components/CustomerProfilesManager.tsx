import React, { useState } from 'react';
import {
  CustomerProfile,
  SoftwarePackage,
  NetworkDriveMapping,
  PrinterMapping,
  UserLogonStagingConfig,
} from '../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Shield,
  Layers,
  Save,
  X,
  HardDrive,
  Users,
  Settings,
  Search,
  Filter,
  Check,
  Circle,
  FileCode,
  Sliders,
  ExternalLink,
  Printer,
  Info,
  Link2,
} from 'lucide-react';

interface CustomerProfilesManagerProps {
  customers: CustomerProfile[];
  packages: SoftwarePackage[];
  onAddCustomer: (profile: CustomerProfile) => void;
  onUpdateCustomer: (profile: CustomerProfile) => void;
  onSelectCustomerForSetup: (customerId: string) => void;
}

export const CustomerProfilesManager: React.FC<CustomerProfilesManagerProps> = ({
  customers,
  packages,
  onAddCustomer,
  onUpdateCustomer,
  onSelectCustomerForSetup,
}) => {
  const [editingCustomer, setEditingCustomer] = useState<CustomerProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [domainName, setDomainName] = useState('');
  const [defaultAdAdminGroup, setDefaultAdAdminGroup] = useState('');
  const [uncShareRoot, setUncShareRoot] = useState('');
  const [screenTimeoutAc, setScreenTimeoutAc] = useState(15);
  const [standbyTimeoutAc, setStandbyTimeoutAc] = useState(0);
  const [enableRdp, setEnableRdp] = useState(true);
  const [selectedPkgIds, setSelectedPkgIds] = useState<string[]>([]);
  const [tvToken, setTvToken] = useState('');
  const [tvConfigId, setTvConfigId] = useState('');
  const [tvConfigFile, setTvConfigFile] = useState('');
  const [notes, setNotes] = useState('');
  const [pkgSearch, setPkgSearch] = useState('');
  const [pkgCategoryFilter, setPkgCategoryFilter] = useState('All');

  // Network Drives and Printers (User First-Logon Staging) states
  const [networkDrives, setNetworkDrives] = useState<NetworkDriveMapping[]>([]);
  const [printers, setPrinters] = useState<PrinterMapping[]>([]);
  const [newDriveLetter, setNewDriveLetter] = useState('S:');
  const [newDriveUnc, setNewDriveUnc] = useState('');
  const [newDriveLabel, setNewDriveLabel] = useState('');
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newPrinterPath, setNewPrinterPath] = useState('');
  const [newPrinterType, setNewPrinterType] = useState<'PerMachineUNC' | 'UserLogonUNC' | 'DirectIP'>('PerMachineUNC');
  const [newPrinterDefault, setNewPrinterDefault] = useState(false);

  const startEdit = (cust: CustomerProfile) => {
    setEditingCustomer(cust);
    setIsCreating(false);
    setCompanyName(cust.companyName);
    setCustomerCode(cust.customerCode);
    setDomainName(cust.domainName);
    setDefaultAdAdminGroup(cust.defaultAdAdminGroup);
    setUncShareRoot(cust.uncShareRoot);
    setScreenTimeoutAc(cust.powerPlanSettings.screenTimeoutAc);
    setStandbyTimeoutAc(cust.powerPlanSettings.standbyTimeoutAc);
    setEnableRdp(cust.enableRdp);
    setSelectedPkgIds(cust.packageIds || []);
    setNotes(cust.notes || '');

    // Extract TV extra switches
    const tvSwitches = cust.packageCustomSwitches?.['pkg-teamviewer'] || '';
    const configMatch = tvSwitches.match(/CUSTOMCONFIGID=([^\s]+)/);
    const tokenMatch = tvSwitches.match(/APITOKEN=([^\s]+)/);
    setTvConfigId(configMatch ? configMatch[1] : 'idc89120');
    setTvToken(tokenMatch ? tokenMatch[1] : 'token-client-abc');

    const tvConfig = cust.packageConfigFiles?.['pkg-teamviewer'] || `${cust.uncShareRoot}\\TeamViewer_Settings.tvopt`;
    setTvConfigFile(tvConfig);

    // Network Drives and Printers
    setNetworkDrives(cust.networkDrives || []);
    setPrinters(cust.printers || []);
    setNewDriveUnc(`${cust.uncShareRoot}\\Shares\\Public`);
    setNewDriveLabel('Company Public Share');
    setNewPrinterName(`${cust.customerCode || 'Office'} Color MFP`);
    setNewPrinterPath(`\\\\corp-print01.internal.net\\${cust.customerCode || 'OFFICE'}-Color-MFP`);
    setNewPrinterType('PerMachineUNC');
    setNewPrinterDefault(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingCustomer(null);
    setCompanyName('');
    setCustomerCode('');
    setDomainName('client.corp');
    setDefaultAdAdminGroup('CLIENT\\IT-Admins');
    setUncShareRoot('\\\\corp-fs01.internal.net\\deployments\\customers\\newclient');
    setScreenTimeoutAc(15);
    setStandbyTimeoutAc(0);
    setEnableRdp(true);
    setSelectedPkgIds(['pkg-teamviewer', 'pkg-chrome', 'pkg-7zip', 'pkg-m365']);
    const rnd = Math.floor(10000 + Math.random() * 90000);
    setTvConfigId(`idc${rnd}`);
    setTvToken(`token-${Math.floor(1000 + Math.random() * 9000)}`);
    setTvConfigFile(`\\\\corp-fs01.internal.net\\deployments\\customers\\newclient\\TeamViewer_Settings.tvopt`);
    setNotes('');

    // Default template drives & printers for new client
    setNetworkDrives([
      {
        id: `drv-${Date.now()}-1`,
        driveLetter: 'S:',
        uncPath: '\\\\corp-fs01.internal.net\\deployments\\customers\\newclient\\Shared',
        label: 'Company Shared Files',
        persistent: true,
        enabled: true,
      },
      {
        id: `drv-${Date.now()}-2`,
        driveLetter: 'H:',
        uncPath: '\\\\corp-fs01.internal.net\\users\\%USERNAME%',
        label: 'User Personal Home Folder (%USERNAME%)',
        persistent: true,
        enabled: true,
      },
    ]);
    setPrinters([
      {
        id: `prn-${Date.now()}-1`,
        name: 'Office Main Floor Color MFP',
        connectionType: 'PerMachineUNC',
        pathOrIp: '\\\\corp-print01.internal.net\\Office-Color-MFP',
        isDefault: true,
        comment: 'High volume color multi-function printer (PrintUI per-machine)',
        enabled: true,
      },
    ]);
    setNewDriveLetter('P:');
    setNewDriveUnc('\\\\corp-fs01.internal.net\\Projects');
    setNewDriveLabel('Company Projects Share');
    setNewPrinterName('Warehouse Shipping Label Printer');
    setNewPrinterPath('\\\\corp-print01.internal.net\\Shipping-Labels');
    setNewPrinterType('UserLogonUNC');
    setNewPrinterDefault(false);
  };

  const handleAddDrive = () => {
    if (!newDriveUnc) return;
    const drive: NetworkDriveMapping = {
      id: `drv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      driveLetter: newDriveLetter.endsWith(':') ? newDriveLetter : `${newDriveLetter}:`,
      uncPath: newDriveUnc.trim(),
      label: newDriveLabel.trim() || `${newDriveLetter} Network Share`,
      persistent: true,
      enabled: true,
    };
    setNetworkDrives((prev) => [...prev, drive]);
    setNewDriveUnc('');
    setNewDriveLabel('');
  };

  const handleRemoveDrive = (id: string) => {
    setNetworkDrives((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddPrinter = () => {
    if (!newPrinterPath) return;
    const printer: PrinterMapping = {
      id: `prn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newPrinterName.trim() || newPrinterPath.split('\\').pop() || 'Network Printer',
      connectionType: newPrinterType,
      pathOrIp: newPrinterPath.trim(),
      isDefault: newPrinterDefault,
      comment: newPrinterType === 'PerMachineUNC' ? 'Installed machine-wide via PrintUI (/ga)' : 'Connected per-user on initial logon via Active Setup',
      enabled: true,
    };
    if (newPrinterDefault) {
      setPrinters((prev) => [...prev.map((p) => ({ ...p, isDefault: false })), printer]);
    } else {
      setPrinters((prev) => [...prev, printer]);
    }
    setNewPrinterName('');
    setNewPrinterPath('');
    setNewPrinterDefault(false);
  };

  const handleRemovePrinter = (id: string) => {
    setPrinters((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePackageSelection = (pkgId: string) => {
    setSelectedPkgIds((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  const handleSelectAllPackages = () => {
    setSelectedPkgIds(packages.map((p) => p.id));
  };

  const handleClearAllPackages = () => {
    setSelectedPkgIds([]);
  };

  const handleSelectCorePackages = () => {
    const coreIds = packages
      .filter((p) =>
        [
          'pkg-teamviewer',
          'pkg-chrome',
          'pkg-7zip',
          'pkg-acrobat',
          'pkg-m365',
          'pkg-winget-7zip',
          'pkg-winget-vlc',
          'pkg-winget-outlook-classic',
        ].includes(p.id)
      )
      .map((p) => p.id);
    setSelectedPkgIds(coreIds);
  };

  const handleSave = () => {
    const customSwitches: Record<string, string> = {};
    const configFiles: Record<string, string> = {};

    if (tvConfigId || tvToken) {
      customSwitches['pkg-teamviewer'] = `CUSTOMCONFIGID=${tvConfigId} APITOKEN=${tvToken} ASSIGNMENTOPTIONS="--alias %COMPUTERNAME% --grant-easy-access"`;
    }
    if (tvConfigFile) {
      configFiles['pkg-teamviewer'] = tvConfigFile;
    }

    const payload: CustomerProfile = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now().toString(36)}`,
      companyName,
      customerCode: customerCode || companyName.substring(0, 4).toUpperCase(),
      domainName,
      defaultAdAdminGroup,
      uncShareRoot,
      enableRdp,
      powerPlanSettings: {
        screenTimeoutAc,
        standbyTimeoutAc,
      },
      packageIds: selectedPkgIds,
      packageCustomSwitches: customSwitches,
      packageConfigFiles: configFiles,
      networkDrives,
      printers,
      userLogonStaging: {
        enabled: true,
        stagingPath: 'C:\\ProgramData\\FDIM\\UserLogonSetup.ps1',
        activeSetupKey: 'FDIM_UserProvisioning',
        scheduledTaskFallback: true,
        cleanUpAfterFirstRun: false,
      },
      notes,
    };

    if (editingCustomer) {
      onUpdateCustomer(payload);
    } else {
      onAddCustomer(payload);
    }

    setEditingCustomer(null);
    setIsCreating(false);
  };

  const categories = ['All', ...Array.from(new Set(packages.map((p) => p.category)))];

  const filteredFormPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(pkgSearch.toLowerCase()) ||
      pkg.fileName.toLowerCase().includes(pkgSearch.toLowerCase()) ||
      pkg.category.toLowerCase().includes(pkgSearch.toLowerCase());
    const matchesCat = pkgCategoryFilter === 'All' || pkg.category === pkgCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">FDIM Multi-Tenant Company Deployment Profiles</h1>
          </div>
          <p className="text-xs text-slate-400">
            Define multi-tenant customer settings: Domain name, default AD Admin group, power plan timeouts, and default software packages assigned to each customer.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer Profile</span>
        </button>
      </div>

      {/* Editor Modal / Form */}
      {(isCreating || editingCustomer) && (
        <div className="bg-slate-900 border border-cyan-500/60 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>{isCreating ? 'Create New Customer Profile' : `Edit Profile: ${companyName}`}</span>
            </h3>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setIsCreating(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Industrial GmbH"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Customer Code</label>
              <input
                type="text"
                value={customerCode}
                onChange={(e) => setCustomerCode(e.target.value)}
                placeholder="e.g. ACME"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Local Active Directory Domain</label>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="e.g. acme.corp"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">AD Admin Group to Delegate</label>
              <input
                type="text"
                value={defaultAdAdminGroup}
                onChange={(e) => setDefaultAdAdminGroup(e.target.value)}
                placeholder="e.g. ACME\IT-Workstation-Admins"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* UNC Share Root & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Customer UNC Share Root Path</label>
              <input
                type="text"
                value={uncShareRoot}
                onChange={(e) => setUncShareRoot(e.target.value)}
                placeholder="\\corp-fs01.internal.net\deployments\customers\acme"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Profile Notes / Requirements</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Logistics client, requires unattended remote support and specific security policy."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Power Plan & RDP settings */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Workstation System Configuration Policies</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Screen Timeout (AC Power)</label>
                <select
                  value={screenTimeoutAc}
                  onChange={(e) => setScreenTimeoutAc(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={0}>Never (0)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Standby Timeout (AC Power)</label>
                <select
                  value={standbyTimeoutAc}
                  onChange={(e) => setStandbyTimeoutAc(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={0}>Never Sleep (0)</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Remote Desktop (RDP)</label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    checked={enableRdp}
                    onChange={(e) => setEnableRdp(e.target.checked)}
                    id="enable-rdp-toggle"
                    className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="enable-rdp-toggle" className="text-white cursor-pointer select-none">
                    Enable RDP with Firewall Rules & NLA
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Customer TeamViewer Host Settings */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center space-x-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>TeamViewer Host Deployment Parameters (Customer Specific)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">TeamViewer CustomConfigID:</label>
                <input
                  type="text"
                  value={tvConfigId}
                  onChange={(e) => setTvConfigId(e.target.value)}
                  placeholder="e.g. idc89120"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">TeamViewer API Assignment Token:</label>
                <input
                  type="text"
                  value={tvToken}
                  onChange={(e) => setTvToken(e.target.value)}
                  placeholder="e.g. 109283-acmetoken"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Settings File (.tvopt) UNC Path:</label>
                <input
                  type="text"
                  value={tvConfigFile}
                  onChange={(e) => setTvConfigFile(e.target.value)}
                  placeholder="\\path\to\TeamViewer_Settings.tvopt"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* NETWORK DRIVES & PRINTER MAPPING (USER FIRST-LOGON STAGING) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-800/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Network Drives & Printer Mapping (First-Logon Staging)
                </h4>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 font-mono">
                {networkDrives.length} Drives • {printers.length} Printers
              </span>
            </div>

            {/* Architecture Explanation Banner */}
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3.5 flex items-start space-x-3 text-xs">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-amber-200 font-semibold">
                  Why this is staged for First Logon:
                </p>
                <p className="text-amber-300/80 text-[11px] leading-relaxed">
                  During workstation provisioning, only the technician is logged on. Network drives (<code className="bg-amber-900/40 px-1 rounded font-mono">HKCU:\Network</code>) and per-user network printers require domain Kerberos user credentials. FDIM stages <code className="bg-amber-900/40 px-1 rounded font-mono">C:\ProgramData\FDIM\UserLogonSetup.ps1</code> and registers it in Windows <strong>Active Setup</strong> (<code className="bg-amber-900/40 px-1 rounded font-mono">HKLM:\...\Active Setup</code>) &amp; machine print connections (<code className="bg-amber-900/40 px-1 rounded font-mono">printui /ga</code>). When the employee logs into Windows for the first time, their drives and printers map automatically!
                </p>
              </div>
            </div>

            {/* Sub-grid: Network Drives (Left) & Printers (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Network Drives List & Adder */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <Link2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mapped Network Drives</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{networkDrives.length} configured</span>
                </div>

                {/* Existing Drives */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {networkDrives.map((drv) => (
                    <div
                      key={drv.id}
                      className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-md bg-amber-950 border border-amber-800/80 text-amber-300 font-mono font-bold flex items-center justify-center text-xs shrink-0">
                          {drv.driveLetter}
                        </span>
                        <div className="min-w-0">
                          <span className="text-white font-medium block truncate text-xs">{drv.label}</span>
                          <span className="text-[11px] text-cyan-400 font-mono truncate block">{drv.uncPath}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDrive(drv.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors shrink-0"
                        title="Remove drive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {networkDrives.length === 0 && (
                    <div className="text-[11px] text-slate-500 italic p-3 text-center border border-dashed border-slate-800 rounded-lg">
                      No network drives mapped yet. Add below.
                    </div>
                  )}
                </div>

                {/* Add New Drive Row */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Add Network Drive:</span>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="col-span-1">
                      <select
                        value={newDriveLetter}
                        onChange={(e) => setNewDriveLetter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                      >
                        {['S:', 'P:', 'M:', 'H:', 'Z:', 'N:', 'F:', 'L:', 'K:', 'O:', 'T:', 'X:'].map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={newDriveLabel}
                        onChange={(e) => setNewDriveLabel(e.target.value)}
                        placeholder="Label (e.g. Shared Documents)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <input
                      type="text"
                      value={newDriveUnc}
                      onChange={(e) => setNewDriveUnc(e.target.value)}
                      placeholder="UNC Path: \\server\share or \\server\users\%USERNAME%"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddDrive}
                      disabled={!newDriveUnc}
                      className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-200 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Network Printers List & Adder */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Network Printers</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{printers.length} configured</span>
                </div>

                {/* Existing Printers */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {printers.map((prn) => (
                    <div
                      key={prn.id}
                      className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-white font-medium truncate text-xs">{prn.name}</span>
                          {prn.isDefault && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold">
                              DEFAULT
                            </span>
                          )}
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${prn.connectionType === 'PerMachineUNC' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-purple-950 text-purple-300 border border-purple-800'}`}>
                            {prn.connectionType === 'PerMachineUNC' ? 'Per-Machine' : 'User-Logon'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono truncate block">{prn.pathOrIp}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePrinter(prn.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors shrink-0"
                        title="Remove printer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {printers.length === 0 && (
                    <div className="text-[11px] text-slate-500 italic p-3 text-center border border-dashed border-slate-800 rounded-lg">
                      No network printers configured yet. Add below.
                    </div>
                  )}
                </div>

                {/* Add New Printer Row */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Add Network Printer:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={newPrinterName}
                      onChange={(e) => setNewPrinterName(e.target.value)}
                      placeholder="Printer Name (e.g. Floor 2 MFP)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      value={newPrinterType}
                      onChange={(e) => setNewPrinterType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="PerMachineUNC">Per-Machine Connection (PrintUI /ga - All Users)</option>
                      <option value="UserLogonUNC">Per-User Network Connection (Active Setup)</option>
                    </select>
                  </div>
                  <div className="flex gap-2 text-xs items-center">
                    <input
                      type="text"
                      value={newPrinterPath}
                      onChange={(e) => setNewPrinterPath(e.target.value)}
                      placeholder="Path: \\printserver\printer_name"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <label className="flex items-center space-x-1 cursor-pointer text-[11px] text-slate-300 shrink-0">
                      <input
                        type="checkbox"
                        checked={newPrinterDefault}
                        onChange={(e) => setNewPrinterDefault(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 w-3.5 h-3.5"
                      />
                      <span>Default</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPrinter}
                      disabled={!newPrinterPath}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DEFAULT SOFTWARE SELECTION IN CUSTOMER PROFILE EDITOR */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Default Software Packages for this Customer ({selectedPkgIds.length} Selected)
                </h4>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSelectCorePackages}
                  className="text-[11px] px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800"
                >
                  Select Core Apps
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllPackages}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAllPackages}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter available software..."
                  value={pkgSearch}
                  onChange={(e) => setPkgSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPkgCategoryFilter(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                      pkgCategoryFilter === cat
                        ? 'bg-cyan-600 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredFormPackages.map((pkg) => {
                const isSelected = selectedPkgIds.includes(pkg.id);
                return (
                  <div
                    key={pkg.id}
                    onClick={() => togglePackageSelection(pkg.id)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/70 text-white ring-1 ring-cyan-500/30'
                        : 'bg-slate-900/60 border-slate-850 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className="text-xs font-bold text-white truncate">{pkg.name}</span>
                          {(pkg.sourceType === 'winget' || pkg.installerType === 'Winget' || pkg.wingetId) ? (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 shrink-0">
                              Winget
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-900 shrink-0">
                              UNC
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                          {pkg.installerType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mb-1">{pkg.description}</p>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 truncate">
                        <span className="truncate">{pkg.wingetId || pkg.fileName}</span>
                        <span>•</span>
                        <span>{pkg.estimatedMinutes}m</span>
                        {pkg.id === 'pkg-teamviewer' && (
                          <span className="text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-800/50">
                            Custom Config
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                setEditingCustomer(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!companyName}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 disabled:opacity-50"
            >
              Save Customer Profile
            </button>
          </div>
        </div>
      )}

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {customers.map((cust) => {
          const assignedPackages = packages.filter((p) => (cust.packageIds || []).includes(p.id));
          return (
            <div
              key={cust.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{cust.companyName}</h3>
                      <span className="text-xs text-slate-400 font-mono">
                        Domain: <strong className="text-slate-200">{cust.domainName}</strong> • Code: {cust.customerCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(cust)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit profile & software"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs space-y-1.5 text-slate-300 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delegated Admin Group:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{cust.defaultAdAdminGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Power Plan:</span>
                    <span>Screen {cust.powerPlanSettings.screenTimeoutAc}m • Standby {cust.powerPlanSettings.standbyTimeoutAc === 0 ? 'Never' : `${cust.powerPlanSettings.standbyTimeoutAc}m`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RDP Enabled:</span>
                    <span className="text-emerald-400 font-semibold">{cust.enableRdp ? 'Yes' : 'No'}</span>
                  </div>
                  {cust.packageCustomSwitches?.['pkg-teamviewer'] && (
                    <div className="flex flex-col pt-1 border-t border-slate-850 text-[11px]">
                      <span className="text-slate-400">TeamViewer Switches:</span>
                      <code className="text-emerald-300 font-mono truncate mt-0.5">
                        {cust.packageCustomSwitches['pkg-teamviewer']}
                      </code>
                    </div>
                  )}
                </div>

                {/* Assigned Default Software Badges */}
                <div className="mb-4">
                  <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                    <span>Default Assigned Software ({assignedPackages.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedPackages.map((pkg) => (
                      <span
                        key={pkg.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-medium"
                      >
                        {pkg.name.split(' ')[0]} {pkg.name.includes('TeamViewer') ? 'Host' : ''}
                      </span>
                    ))}
                    {assignedPackages.length === 0 && (
                      <span className="text-[11px] text-slate-500 italic">No default software assigned</span>
                    )}
                  </div>
                </div>

                {/* Staged Drives & Printers Badges */}
                {((cust.networkDrives && cust.networkDrives.length > 0) || (cust.printers && cust.printers.length > 0)) && (
                  <div className="mb-4 p-2 rounded-lg bg-slate-950 border border-slate-850 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-slate-300">First-Logon Staging (Active Setup):</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {cust.networkDrives && cust.networkDrives.length > 0 && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-300 font-mono text-[10px]">
                          <HardDrive className="w-2.5 h-2.5" />
                          <span>{cust.networkDrives.length} Drives ({cust.networkDrives.map((d) => d.driveLetter).join(', ')})</span>
                        </span>
                      )}
                      {cust.printers && cust.printers.length > 0 && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-[10px]">
                          <Printer className="w-2.5 h-2.5" />
                          <span>{cust.printers.length} Printers</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-850">
                <span className="text-xs text-slate-400">
                  {cust.packageIds.length} Packages Default
                </span>

                <button
                  onClick={() => onSelectCustomerForSetup(cust.id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold transition-colors"
                >
                  Apply to Current PC
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
