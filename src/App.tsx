import React, { useState, useEffect } from 'react';
import {
  SoftwarePackage,
  ChecklistItem,
  RoleProfile,
  DeploymentRecord,
} from './types';
import { Header } from './components/Header';
import { NewPCWizard } from './components/NewPCWizard';
import { LiveRunner } from './components/LiveRunner';
import { AIDetective } from './components/AIDetective';
import { PackageLibrary } from './components/PackageLibrary';
import { DeploymentHistory } from './components/DeploymentHistory';
import { ScriptModal } from './components/ScriptModal';
import { AuditCertificateModal } from './components/AuditCertificateModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'wizard' | 'runner' | 'library' | 'ai-detective' | 'history'>('wizard');
  const [packages, setPackages] = useState<SoftwarePackage[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [profiles, setProfiles] = useState<RoleProfile[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);

  // Machine state
  const [machineName, setMachineName] = useState('CORP-ENG-W11-482');
  const [employeeName, setEmployeeName] = useState('Sarah Jenkins');
  const [employeeEmail, setEmployeeEmail] = useState('s.jenkins@enterprise.corp');
  const [department, setDepartment] = useState('Engineering');
  const [serialNumber, setSerialNumber] = useState('5CG2490X1P');

  // Selections
  const [activeProfileId, setActiveProfileId] = useState('developer');
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [selectedChecklistIds, setSelectedChecklistIds] = useState<string[]>([]);

  // Modals & Runners
  const [isDeploying, setIsDeploying] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [activeAuditRecord, setActiveAuditRecord] = useState<DeploymentRecord | null>(null);

  // Initial data loading
  useEffect(() => {
    Promise.all([
      fetch('/api/packages').then((r) => r.json()),
      fetch('/api/checklists').then((r) => r.json()),
      fetch('/api/profiles').then((r) => r.json()),
      fetch('/api/deployments').then((r) => r.json()),
    ])
      .then(([pkgs, chks, profs, deps]) => {
        setPackages(pkgs || []);
        setChecklists(chks || []);
        setProfiles(profs || []);
        setDeployments(deps || []);

        // Initial preset selection from 'developer'
        const devProf = (profs || []).find((p: RoleProfile) => p.id === 'developer');
        if (devProf) {
          setSelectedPackageIds(devProf.packageIds);
          setSelectedChecklistIds(devProf.checklistIds);
        } else if (pkgs && pkgs.length > 0) {
          setSelectedPackageIds(pkgs.slice(0, 5).map((p: SoftwarePackage) => p.id));
          setSelectedChecklistIds((chks || []).slice(0, 4).map((c: ChecklistItem) => c.id));
        }
      })
      .catch((err) => console.error('Error fetching initial setup data:', err));
  }, []);

  // Handlers
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

  const handleAddPackage = (newPkg: SoftwarePackage) => {
    fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPkg),
    })
      .then((r) => r.json())
      .then((saved) => {
        setPackages((prev) => [saved, ...prev]);
        // Also select it for the current machine
        setSelectedPackageIds((prev) => [...prev, saved.id]);
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

  const handleViewCertificate = (record: DeploymentRecord) => {
    setActiveAuditRecord(record);
    setIsAuditModalOpen(true);
  };

  const selectedPackages = packages.filter((p) => selectedPackageIds.includes(p.id));
  const selectedChecklists = checklists.filter((c) => selectedChecklistIds.includes(c.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        machineName={machineName}
        isDeploying={isDeploying}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'wizard' && (
          <NewPCWizard
            packages={packages}
            checklists={checklists}
            profiles={profiles}
            machineName={machineName}
            setMachineName={setMachineName}
            employeeName={employeeName}
            setEmployeeName={setEmployeeName}
            employeeEmail={employeeEmail}
            setEmployeeEmail={setEmployeeEmail}
            department={department}
            setDepartment={setDepartment}
            serialNumber={serialNumber}
            setSerialNumber={setSerialNumber}
            selectedPackageIds={selectedPackageIds}
            setSelectedPackageIds={setSelectedPackageIds}
            selectedChecklistIds={selectedChecklistIds}
            setSelectedChecklistIds={setSelectedChecklistIds}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
            onStartDeployment={handleStartDeployment}
            onOpenScriptModal={() => setIsScriptModalOpen(true)}
          />
        )}

        {activeTab === 'runner' && (
          <LiveRunner
            isDeploying={isDeploying}
            setIsDeploying={setIsDeploying}
            machineName={machineName}
            employeeName={employeeName}
            department={department}
            serialNumber={serialNumber}
            selectedPackages={selectedPackages}
            selectedChecklists={selectedChecklists}
            onCompleteDeployment={handleCompleteDeployment}
            onOpenAuditModal={() => setIsAuditModalOpen(true)}
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
            onDeletePackage={handleDeletePackage}
            onOpenAIDetective={() => setActiveTab('ai-detective')}
          />
        )}

        {activeTab === 'history' && (
          <DeploymentHistory
            deployments={deployments}
            packages={packages}
            checklists={checklists}
            onViewCertificate={handleViewCertificate}
          />
        )}
      </main>

      {/* Script Generation Modal */}
      <ScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        machineName={machineName}
        employeeName={employeeName}
        department={department}
        selectedPackages={selectedPackages}
        selectedChecklists={selectedChecklists}
      />

      {/* Workstation Handover Audit Certificate Modal */}
      <AuditCertificateModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        record={activeAuditRecord || deployments[0] || null}
        packages={packages}
        checklists={checklists}
      />
    </div>
  );
}
