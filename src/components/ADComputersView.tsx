import React, { useState, useEffect } from 'react';
import {
  ADComputer,
  CustomerProfile,
  SoftwarePackage,
} from '../types';
import {
  Monitor,
  Search,
  Filter,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  Radio,
  Clock,
  Terminal,
  PackageCheck,
  Send,
  Upload,
  Layers,
  Building2,
  HardDrive,
  Cpu,
  User,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Check,
  Play,
  ArrowRight,
} from 'lucide-react';

interface ADComputersViewProps {
  customers: CustomerProfile[];
  packages: SoftwarePackage[];
  onSelectMachineForProvisioning: (machineName: string, customerId: string) => void;
  onOpenQuickDeployForMachine: (machineName: string, customer: CustomerProfile) => void;
  onQueueTaskForMachine?: (machineName: string, packageIds: string[]) => void;
}

export const ADComputersView: React.FC<ADComputersViewProps> = ({
  customers,
  packages,
  onSelectMachineForProvisioning,
  onOpenQuickDeployForMachine,
  onQueueTaskForMachine,
}) => {
  const [computers, setComputers] = useState<ADComputer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'agent' | 'offline'>('all');
  const [ouFilter, setOuFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);

  // Action states
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Bulk Import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importDomain, setImportDomain] = useState('corp.internal.net');
  const [importCustomer, setImportCustomer] = useState(customers[0]?.id || 'cust-acme');

  // Bulk Deploy modal
  const [isBulkDeployModalOpen, setIsBulkDeployModalOpen] = useState(false);
  const [bulkSelectedPackageIds, setBulkSelectedPackageIds] = useState<string[]>([]);
  const [isQueueingBulk, setIsQueueingBulk] = useState(false);
  const [bulkDeployFeedback, setBulkDeployFeedback] = useState<string | null>(null);

  const fetchComputers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ad-computers');
      const data = await res.json();
      setComputers(data);
    } catch (err) {
      console.error('Error fetching AD computers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComputers();
  }, []);

  // Sync AD via LDAP
  const handleSyncAD = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/ad-computers/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      setSyncFeedback(data.message || 'Active Directory sync complete.');
      fetchComputers();
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback('Failed to sync with Active Directory Domain Controller.');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Ping selected or all computers
  const handlePingComputers = async (targetNames?: string[]) => {
    setIsPinging(true);
    const names = targetNames || (selectedMachineIds.length > 0
      ? computers.filter((c) => selectedMachineIds.includes(c.id)).map((c) => c.name)
      : computers.map((c) => c.name));

    try {
      const res = await fetch('/api/ad-computers/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineNames: names }),
      });
      const data = await res.json();
      if (data.results) {
        setComputers((prev) =>
          prev.map((c) => {
            const resData = data.results[c.name];
            if (resData) {
              return {
                ...c,
                status: resData.status,
                pingMs: resData.latencyMs,
                lastSeen: resData.reachable ? new Date().toISOString() : c.lastSeen,
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Error pinging machines:', err);
    } finally {
      setIsPinging(false);
    }
  };

  // Bulk import hostnames
  const handleBulkImport = async () => {
    const lines = importText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return;

    try {
      const res = await fetch('/api/ad-computers/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          computerNames: lines,
          domain: importDomain,
          customerProfileId: importCustomer,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsImportModalOpen(false);
        setImportText('');
        fetchComputers();
      }
    } catch (err) {
      console.error('Error importing computers:', err);
    }
  };

  // Trigger bulk deploy / queue wait-tasks for selected machines
  const handleBulkDeploySubmit = async () => {
    if (bulkSelectedPackageIds.length === 0 || selectedMachineIds.length === 0) return;
    setIsQueueingBulk(true);
    const selectedComps = computers.filter((c) => selectedMachineIds.includes(c.id));

    try {
      for (const comp of selectedComps) {
        await fetch('/api/agent/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            machineName: comp.name,
            taskType: 'SoftwareInstall',
            title: `Bulk Install: ${bulkSelectedPackageIds.length} Packages`,
            payload: {
              packageIds: bulkSelectedPackageIds,
              customerProfileId: comp.customerProfileId,
            },
            executionMode: comp.agentInstalled ? 'agent_system' : 'service_account',
            createdBy: 'Bulk Dispatcher',
          }),
        });
      }
      setBulkDeployFeedback(`Successfully queued tasks for ${selectedComps.length} workstations! Offline machines will execute automatically upon boot.`);
      setTimeout(() => {
        setBulkDeployFeedback(null);
        setIsBulkDeployModalOpen(false);
        setSelectedMachineIds([]);
      }, 3000);
    } catch (err) {
      console.error('Error dispatching bulk tasks:', err);
    } finally {
      setIsQueueingBulk(false);
    }
  };

  // Filters
  const uniqueOUs = Array.from(new Set(computers.map((c) => c.ouPath))).filter(Boolean);

  const filteredComputers = computers.filter((c) => {
    // Search query
    const matchSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dnsHostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ipAddress.includes(searchQuery) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.currentUser && c.currentUser.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.ouPath.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    let matchStatus = true;
    if (statusFilter === 'online') matchStatus = c.status === 'Online' || c.status === 'AgentConnected';
    else if (statusFilter === 'agent') matchStatus = c.agentInstalled && c.status === 'AgentConnected';
    else if (statusFilter === 'offline') matchStatus = c.status === 'Offline';

    // OU filter
    const matchOu = ouFilter === 'all' || c.ouPath === ouFilter;

    // Customer filter
    const matchCust = customerFilter === 'all' || c.customerProfileId === customerFilter;

    return matchSearch && matchStatus && matchOu && matchCust;
  });

  const onlineCount = computers.filter((c) => c.status === 'Online' || c.status === 'AgentConnected').length;
  const agentCount = computers.filter((c) => c.agentInstalled).length;
  const offlineCount = computers.filter((c) => c.status === 'Offline').length;

  const toggleSelectAll = () => {
    if (selectedMachineIds.length === filteredComputers.length) {
      setSelectedMachineIds([]);
    } else {
      setSelectedMachineIds(filteredComputers.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedMachineIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400">
                <Monitor className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>Active Directory Workstations & Computers</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-semibold">
                    LDAP Sync
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live inventory of domain-joined PCs. Filter by Organizational Unit (OU), monitor LAN reachability, deploy packages in bulk, or queue wait-tasks for offline endpoints.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncAD}
              disabled={isSyncing}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
              title="Query domain controller for updated computer objects"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing AD...' : 'Sync AD (LDAP)'}</span>
            </button>

            <button
              onClick={() => handlePingComputers()}
              disabled={isPinging}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
              title="Ping all computers to verify LAN online status"
            >
              <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isPinging ? 'animate-pulse' : ''}`} />
              <span>{isPinging ? 'Pinging LAN...' : 'Ping Reachability'}</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Hostnames</span>
            </button>
          </div>
        </div>

        {/* Sync Feedback Message */}
        {syncFeedback && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Total Domain PCs</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{computers.length}</span>
          </div>

          <div className="bg-slate-950/60 border border-emerald-900/40 p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Online on LAN</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">{onlineCount}</span>
          </div>

          <div className="bg-slate-950/60 border border-blue-900/40 p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Agent Connected</span>
              <Radio className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-xl font-extrabold text-blue-400 mt-1 block">{agentCount}</span>
          </div>

          <div className="bg-slate-950/60 border border-amber-900/40 p-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Offline / Pending Boot</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-xl font-extrabold text-amber-400 mt-1 block">{offlineCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search hostname, IP, user, OU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses ({computers.length})</option>
            <option value="online">Online Only ({onlineCount})</option>
            <option value="agent">Agent Connected ({agentCount})</option>
            <option value="offline">Offline Only ({offlineCount})</option>
          </select>

          {/* OU Filter */}
          <select
            value={ouFilter}
            onChange={(e) => setOuFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 max-w-[200px] truncate"
          >
            <option value="all">All Organizational Units (OUs)</option>
            {uniqueOUs.map((ou) => (
              <option key={ou} value={ou}>
                {ou.split(',')[0]}
              </option>
            ))}
          </select>

          {/* Customer Filter */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Customer Profiles</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Sticky Bar (when items selected) */}
      {selectedMachineIds.length > 0 && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-cyan-950/40 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
              {selectedMachineIds.length}
            </span>
            <span className="text-xs text-white font-semibold">
              Workstation{selectedMachineIds.length > 1 ? 's' : ''} Selected for Multi-PC Action
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBulkDeployModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Bulk Deploy Software / Queue Wait-Tasks</span>
            </button>

            <button
              onClick={() => handlePingComputers()}
              disabled={isPinging}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ping Selected</span>
            </button>

            <button
              onClick={() => setSelectedMachineIds([])}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Computers Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredComputers.length > 0 && selectedMachineIds.length === filteredComputers.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900"
                  />
                </th>
                <th className="py-3 px-4">Workstation Hostname</th>
                <th className="py-3 px-4">Status & Reachability</th>
                <th className="py-3 px-4">Operating System</th>
                <th className="py-3 px-4">Organizational Unit (OU)</th>
                <th className="py-3 px-4">Client Agent</th>
                <th className="py-3 px-4">Software Compliance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredComputers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Monitor className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-medium">No Active Directory computers match your filter criteria.</p>
                    <p className="text-[11px] mt-1 text-slate-600">Try adjusting your search query or click &quot;Sync AD (LDAP)&quot; above.</p>
                  </td>
                </tr>
              ) : (
                filteredComputers.map((comp) => {
                  const isSelected = selectedMachineIds.includes(comp.id);
                  const cust = customers.find((c) => c.id === comp.customerProfileId) || customers[0];
                  const blueprintCount = cust?.packageIds?.length || 0;
                  const installedCount = comp.installedPackageIds?.length || 0;

                  return (
                    <tr
                      key={comp.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(comp.id)}
                          className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900"
                        />
                      </td>

                      {/* Hostname & IP */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold font-mono text-white text-sm">
                            {comp.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center space-x-1.5">
                          <span>{comp.ipAddress}</span>
                          <span>•</span>
                          <span className="text-slate-500">{cust?.companyName || 'Corporate'}</span>
                        </div>
                        {comp.currentUser && (
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-1">
                            <User className="w-2.5 h-2.5 text-slate-500" />
                            <span>{comp.currentUser}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {comp.status === 'AgentConnected' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Agent Connected</span>
                            {comp.pingMs !== undefined && (
                              <span className="text-[10px] text-emerald-500 font-mono">({comp.pingMs}ms)</span>
                            )}
                          </span>
                        ) : comp.status === 'Online' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            <span>Online (LAN)</span>
                            {comp.pingMs !== undefined && (
                              <span className="text-[10px] text-cyan-500 font-mono">({comp.pingMs}ms)</span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            <span>Offline</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                          Seen: {new Date(comp.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Operating System */}
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        <span>{comp.operatingSystem}</span>
                      </td>

                      {/* OU Path */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] block max-w-[180px] truncate" title={comp.ouPath}>
                          {comp.ouPath.split(',')[0]}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 truncate max-w-[180px]">
                          {comp.ouPath.split(',').slice(1).join(',')}
                        </span>
                      </td>

                      {/* Agent Status */}
                      <td className="py-3 px-4">
                        {comp.agentInstalled ? (
                          <div className="flex items-center space-x-1 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="font-semibold text-[11px]">v{comp.agentVersion || '1.4'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Not Installed</span>
                        )}
                      </td>

                      {/* Software Compliance */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.round((installedCount / (blueprintCount || 1)) * 100))}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-mono font-semibold text-slate-300">
                            {installedCount}/{blueprintCount}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {installedCount >= blueprintCount ? 'Full Blueprint Compliant' : 'Missing Packages'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onOpenQuickDeployForMachine(comp.name, cust)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 font-semibold text-[11px] transition-colors"
                            title="Deploy software to this machine right now"
                          >
                            Quick Deploy
                          </button>

                          <button
                            onClick={() => onSelectMachineForProvisioning(comp.name, cust.id)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/60 font-semibold text-[11px] transition-colors"
                            title="Load machine into New PC Wizard for full provisioning"
                          >
                            Stage PC
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Bulk Import Hostnames */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Import Workstations / Hostnames</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Paste a list of computer hostnames (one per line) or CSV export from Active Directory Users and Computers (ADUC).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hostnames (one per line):</label>
                <textarea
                  rows={5}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`WS-SALES-01\nWS-SALES-02\nLAP-FIELD-14\nCAD-WS-09`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Customer Profile:</label>
                  <select
                    value={importCustomer}
                    onChange={(e) => setImportCustomer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Domain FQDN:</label>
                  <input
                    type="text"
                    value={importDomain}
                    onChange={(e) => setImportDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30"
                >
                  Import Hostnames
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk Software Deployment & Offline Wait-Tasks */}
      {isBulkDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
              <PackageCheck className="w-5 h-5 text-emerald-400" />
              <span>Bulk Software Rollout & Offline Wait-Tasks</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Targeting <strong>{selectedMachineIds.length}</strong> selected workstations. Online machines will execute immediately. Offline machines will be queued as <strong>Wait-Tasks</strong> and run automatically upon boot.
            </p>

            {bulkDeployFeedback ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{bulkDeployFeedback}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Target Machines summary */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Target Workstations:</span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {computers
                      .filter((c) => selectedMachineIds.includes(c.id))
                      .map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[11px] flex items-center space-x-1"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'Offline' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                          <span>{c.name}</span>
                        </span>
                      ))}
                  </div>
                </div>

                {/* Package Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Select Packages to Install Silently across all targets:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                    {packages.map((pkg) => {
                      const isChecked = bulkSelectedPackageIds.includes(pkg.id);
                      return (
                        <label
                          key={pkg.id}
                          className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-cyan-950/40 border-cyan-600 text-white'
                              : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setBulkSelectedPackageIds((prev) =>
                                prev.includes(pkg.id) ? prev.filter((id) => id !== pkg.id) : [...prev, pkg.id]
                              );
                            }}
                            className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900"
                          />
                          <div className="truncate text-xs">
                            <span className="font-semibold block truncate">{pkg.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">v{pkg.version} • {pkg.installerType}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    Selected: <strong>{bulkSelectedPackageIds.length}</strong> package(s)
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsBulkDeployModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkDeploySubmit}
                      disabled={bulkSelectedPackageIds.length === 0 || isQueueingBulk}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isQueueingBulk ? 'Queueing Tasks...' : 'Deploy & Queue Wait-Tasks'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
