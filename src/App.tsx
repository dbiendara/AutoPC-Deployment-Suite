import React, { useState, useEffect } from 'react';
import {
  SoftwarePackage,
  CustomerProfile,
  SystemConfigSettings,
  SystemConfigSwitch,
  DeploymentRecord,
} from './types';
import { Header } from './components/Header';
import { NewPCWizard } from './components/NewPCWizard';
import { LiveRunner } from './components/LiveRunner';
import { AIDetective } from './components/AIDetective';
import { CustomerProfilesManager } from './components/CustomerProfilesManager';
import { PackageLibrary } from './components/PackageLibrary';
import { DeploymentHistory } from './components/DeploymentHistory';
import { ScriptModal } from './components/ScriptModal';
import { AuditCertificateModal } from './components/AuditCertificateModal';
import { SystemConfigManager } from './components/SystemConfigManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<'wizard' | 'runner' | 'library' | 'ai-detective' | 'history' | 'customers'>('wizard');
  const [packages, setPackages] = useState<SoftwarePackage[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [systemSwitches, setSystemSwitches] = useState<SystemConfigSwitch[]>([]);

  // Machine state (already in local Active Directory with hostname set)
  const [machineName, setMachineName] = useState('ACME-WS-084');

  // Selected customer profile
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-acme');
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [packageCustomSwitches, setPackageCustomSwitches] = useState<Record<string, string>>({});
  const [packageConfigFiles, setPackageConfigFiles] = useState<Record<string, string>>({});

  // Dynamic system configuration switch states
  const [enabledSwitchIds, setEnabledSwitchIds] = useState<string[]>(['sw-rdp', 'sw-adgroup', 'sw-power-screen', 'sw-power-standby']);
  const [switchParameters, setSwitchParameters] = useState<Record<string, string | number>>({
    adAdminGroupName: 'ACME\\IT-Workstation-Admins',
    screenTimeoutAc: 15,
    standbyTimeoutAc: 0,
  });

  // Legacy system configuration settings (kept in sync)
  const [systemConfig, setSystemConfig] = useState<SystemConfigSettings>({
    enableRdp: true,
    addAdGroupToAdmins: true,
    adAdminGroupName: 'ACME\\IT-Workstation-Admins',
    setPowerPlan: true,
    screenTimeoutAc: 15,
    standbyTimeoutAc: 0,
  });

  // Runner & Modals
  const [isDeploying, setIsDeploying] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSystemConfigManagerOpen, setIsSystemConfigManagerOpen] = useState(false);
  const [activeAuditRecord, setActiveAuditRecord] = useState<DeploymentRecord | null>(null);

  // Initial data loading
  useEffect(() => {
    Promise.all([
      fetch('/api/packages').then((r) => r.json()),
      fetch('/api/profiles').then((r) => r.json()),
      fetch('/api/system-switches').then((r) => r.json()),
      fetch('/api/deployments').then((r) => r.json()),
    ])
      .then(([pkgs, custs, switches, deps]) => {
        setPackages(pkgs || []);
        setCustomers(custs || []);
        setSystemSwitches(switches || []);
        setDeployments(deps || []);

        if (Array.isArray(switches)) {
          const defaultEnabled = switches.filter((s: SystemConfigSwitch) => s.enabledByDefault).map((s: SystemConfigSwitch) => s.id);
          setEnabledSwitchIds(defaultEnabled.length > 0 ? defaultEnabled : ['sw-rdp', 'sw-adgroup', 'sw-power-screen', 'sw-power-standby']);
        }

        // Initial default customer setup
        const initialCust = (custs || [])[0];
        if (initialCust) {
          setSelectedCustomerId(initialCust.id);
          setSelectedPackageIds(initialCust.packageIds || []);
          if (initialCust.packageCustomSwitches) {
            setPackageCustomSwitches(initialCust.packageCustomSwitches);
          }
          if (initialCust.packageConfigFiles) {
            setPackageConfigFiles(initialCust.packageConfigFiles);
          }
          setSystemConfig({
            enableRdp: initialCust.enableRdp,
            addAdGroupToAdmins: true,
            adAdminGroupName: initialCust.defaultAdAdminGroup,
            setPowerPlan: true,
            screenTimeoutAc: initialCust.powerPlanSettings?.screenTimeoutAc ?? 15,
            standbyTimeoutAc: initialCust.powerPlanSettings?.standbyTimeoutAc ?? 0,
          });
          setSwitchParameters((prev) => ({
            ...prev,
            adAdminGroupName: initialCust.defaultAdAdminGroup,
            screenTimeoutAc: initialCust.powerPlanSettings?.screenTimeoutAc ?? 15,
            standbyTimeoutAc: initialCust.powerPlanSettings?.standbyTimeoutAc ?? 0,
          }));
        }
      })
      .catch((err) => console.error('Error fetching initial setup data:', err));
  }, []);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || {
    id: 'default',
    companyName: 'Corporate Client',
    customerCode: 'CORP',
    domainName: 'corp.local',
    defaultAdAdminGroup: 'CORP\\IT-Admins',
    uncShareRoot: '\\\\corp-fs01.internal.net\\deployments',
    enableRdp: true,
    powerPlanSettings: { screenTimeoutAc: 15, standbyTimeoutAc: 0 },
    packageIds: [],
  };

  // Handlers for Deployment
  const handleStartDeployment = () => {
    setIsDeploying(true);
    setActiveTab('runner');
  };

  const handleCompleteDeployment = (record: DeploymentRecord) => {
    fetch('/api/deployments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })
      .then((r) => r.json())
      .then((saved) => {
        setDeployments((prev) => [saved, ...prev]);
        setActiveAuditRecord(saved);
      })
      .catch(() => {
        setDeployments((prev) => [record, ...prev]);
        setActiveAuditRecord(record);
      });
  };

  // Handlers for Packages
  const handleAddPackage = (newPkg: SoftwarePackage) => {
    fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPkg),
    })
      .then((r) => r.json())
      .then((saved) => {
        setPackages((prev) => [saved, ...prev]);
        setSelectedPackageIds((prev) => [...prev, saved.id]);
        if (saved.extraSwitches) {
          setPackageCustomSwitches((prev) => ({ ...prev, [saved.id]: saved.extraSwitches! }));
        }
      })
      .catch(() => {
        setPackages((prev) => [newPkg, ...prev]);
        setSelectedPackageIds((prev) => [...prev, newPkg.id]);
      });
  };

  const handleDeletePackage = (id: string) => {
    fetch(`/api/packages/${id}`, { method: 'DELETE' }).catch((err) => console.error(err));
    setPackages((prev) => prev.filter((p) => p.id !== id));
    setSelectedPackageIds((prev) => prev.filter((pId) => pId !== id));
  };

  const handleUpdatePackage = (updated: SoftwarePackage) => {
    fetch(`/api/packages/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
      .then((r) => r.json())
      .then((saved) => {
        setPackages((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        if (saved.extraSwitches) {
          setPackageCustomSwitches((prev) => ({ ...prev, [saved.id]: saved.extraSwitches! }));
        }
      })
      .catch(() => {
        setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      });
  };

  // Handlers for Customer Profiles
  const handleAddCustomer = (newProfile: CustomerProfile) => {
    fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile),
    })
      .then((r) => r.json())
      .then((saved) => {
        setCustomers((prev) => [...prev, saved]);
      })
      .catch(() => {
        setCustomers((prev) => [...prev, newProfile]);
      });
  };

  const handleUpdateCustomer = (updated: CustomerProfile) => {
    fetch(`/api/profiles/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
      .then((r) => r.json())
      .then((saved) => {
        setCustomers((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      })
      .catch(() => {
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      });
  };

  const handleSelectCustomerForSetup = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      setSelectedCustomerId(cust.id);
      setSelectedPackageIds(cust.packageIds || []);
      if (cust.packageCustomSwitches) {
        setPackageCustomSwitches(cust.packageCustomSwitches);
      }
      if (cust.packageConfigFiles) {
        setPackageConfigFiles(cust.packageConfigFiles);
      }
      setSystemConfig((prev) => ({
        ...prev,
        enableRdp: cust.enableRdp,
        adAdminGroupName: cust.defaultAdAdminGroup,
        screenTimeoutAc: cust.powerPlanSettings?.screenTimeoutAc ?? 15,
        standbyTimeoutAc: cust.powerPlanSettings?.standbyTimeoutAc ?? 0,
      }));
      setSwitchParameters((prev) => ({
        ...prev,
        adAdminGroupName: cust.defaultAdAdminGroup,
        screenTimeoutAc: cust.powerPlanSettings?.screenTimeoutAc ?? 15,
        standbyTimeoutAc: cust.powerPlanSettings?.standbyTimeoutAc ?? 0,
      }));
    }
    setActiveTab('wizard');
  };

  // Handlers for System Configuration Switches
  const handleAddSwitch = (newSwitch: SystemConfigSwitch) => {
    fetch('/api/system-switches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSwitch),
    })
      .then((r) => r.json())
      .then((saved) => {
        setSystemSwitches((prev) => [...prev, saved]);
        setEnabledSwitchIds((prev) => [...prev, saved.id]);
        if (saved.parameterKey && saved.parameterDefaultValue !== undefined) {
          setSwitchParameters((prev) => ({ ...prev, [saved.parameterKey!]: saved.parameterDefaultValue! }));
        }
      })
      .catch(() => {
        setSystemSwitches((prev) => [...prev, newSwitch]);
        setEnabledSwitchIds((prev) => [...prev, newSwitch.id]);
      });
  };

  const handleUpdateSwitch = (updatedSwitch: SystemConfigSwitch) => {
    fetch(`/api/system-switches/${updatedSwitch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSwitch),
    })
      .then((r) => r.json())
      .then((saved) => {
        setSystemSwitches((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
      })
      .catch(() => {
        setSystemSwitches((prev) => prev.map((s) => (s.id === updatedSwitch.id ? updatedSwitch : s)));
      });
  };

  const handleDeleteSwitch = (id: string) => {
    fetch(`/api/system-switches/${id}`, { method: 'DELETE' }).catch((err) => console.error(err));
    setSystemSwitches((prev) => prev.filter((s) => s.id !== id));
    setEnabledSwitchIds((prev) => prev.filter((sId) => sId !== id));
  };

  const handleViewCertificate = (record: DeploymentRecord) => {
    setActiveAuditRecord(record);
    setIsAuditModalOpen(true);
  };

  const selectedPackages = packages.filter((p) => selectedPackageIds.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        machineName={machineName}
        selectedCustomerName={activeCustomer.companyName}
        isDeploying={isDeploying}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'wizard' && (
          <NewPCWizard
            packages={packages}
            customers={customers}
            machineName={machineName}
            setMachineName={setMachineName}
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            selectedPackageIds={selectedPackageIds}
            setSelectedPackageIds={setSelectedPackageIds}
            packageCustomSwitches={packageCustomSwitches}
            setPackageCustomSwitches={setPackageCustomSwitches}
            packageConfigFiles={packageConfigFiles}
            setPackageConfigFiles={setPackageConfigFiles}
            systemConfig={systemConfig}
            setSystemConfig={setSystemConfig}
            systemSwitches={systemSwitches}
            enabledSwitchIds={enabledSwitchIds}
            setEnabledSwitchIds={setEnabledSwitchIds}
            switchParameters={switchParameters}
            setSwitchParameters={setSwitchParameters}
            onOpenSystemConfigManager={() => setIsSystemConfigManagerOpen(true)}
            onDeleteSwitch={handleDeleteSwitch}
            onOpenManualPackageModal={() => setActiveTab('library')}
            onStartDeployment={handleStartDeployment}
            onOpenScriptModal={() => setIsScriptModalOpen(true)}
          />
        )}

        {activeTab === 'runner' && (
          <LiveRunner
            isDeploying={isDeploying}
            setIsDeploying={setIsDeploying}
            machineName={machineName}
            customer={activeCustomer}
            selectedPackages={selectedPackages}
            packageCustomSwitches={packageCustomSwitches}
            packageConfigFiles={packageConfigFiles}
            systemConfig={systemConfig}
            systemSwitches={systemSwitches}
            enabledSwitchIds={enabledSwitchIds}
            switchParameters={switchParameters}
            onCompleteDeployment={handleCompleteDeployment}
            onOpenAuditModal={() => setIsAuditModalOpen(true)}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerProfilesManager
            customers={customers}
            packages={packages}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onSelectCustomerForSetup={handleSelectCustomerForSetup}
          />
        )}

        {activeTab === 'ai-detective' && (
          <AIDetective
            onAddPackage={handleAddPackage}
            existingPackages={packages}
          />
        )}

        {activeTab === 'library' && (
          <PackageLibrary
            packages={packages}
            onAddPackage={handleAddPackage}
            onUpdatePackage={handleUpdatePackage}
            onDeletePackage={handleDeletePackage}
            onOpenAIDetective={() => setActiveTab('ai-detective')}
          />
        )}

        {activeTab === 'history' && (
          <DeploymentHistory
            deployments={deployments}
            packages={packages}
            onViewCertificate={handleViewCertificate}
          />
        )}
      </main>

      {/* System Configuration Switches Manager Modal */}
      <SystemConfigManager
        isOpen={isSystemConfigManagerOpen}
        onClose={() => setIsSystemConfigManagerOpen(false)}
        switches={systemSwitches}
        onAddSwitch={handleAddSwitch}
        onUpdateSwitch={handleUpdateSwitch}
        onDeleteSwitch={handleDeleteSwitch}
      />

      {/* Script Generation Modal */}
      <ScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        machineName={machineName}
        customerProfile={activeCustomer}
        selectedPackages={selectedPackages}
        packageCustomSwitches={packageCustomSwitches}
        packageConfigFiles={packageConfigFiles}
        systemConfig={systemConfig}
        systemSwitches={systemSwitches}
        enabledSwitchIds={enabledSwitchIds}
        switchParameters={switchParameters}
      />

      {/* Workstation Handover Audit Certificate Modal */}
      <AuditCertificateModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        record={activeAuditRecord || deployments[0] || null}
        packages={packages}
      />
    </div>
  );
}
