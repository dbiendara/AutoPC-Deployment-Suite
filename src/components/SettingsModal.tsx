import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import {
  Settings,
  Database,
  Shield,
  Server,
  Globe,
  KeyRound,
  Download,
  Check,
  Copy,
  RefreshCw,
  X,
  ExternalLink,
  Cpu,
  Layers,
  Lock,
  HardDrive,
  FileCode,
  Terminal,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'sqlite' | 'auth' | 'docker'>('general');
  const [settings, setSettings] = useState<AppSettings>({
    defaultGlobalDomain: 'corp.internal.net',
    authMode: 'local',
    adLdapConfig: {
      ldapUrl: 'ldaps://dc01.corp.internal.net:636',
      domain: 'CORP',
      baseDn: 'DC=corp,DC=internal,DC=net',
      bindDn: 'CN=svc_fdim,OU=ServiceAccounts,DC=corp,DC=internal,DC=net',
      userSearchFilter: '(sAMAccountName={username})',
      adminGroup: 'FDIM-Admins',
    },
    keycloakConfig: {
      serverUrl: 'https://keycloak.corp.internal.net',
      realm: 'enterprise',
      clientId: 'fdim-suite',
      clientSecret: '',
      redirectUri: 'https://fdim.corp.internal.net/oauth/callback',
    },
  });

  const [dbMetadata, setDbMetadata] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active Directory test connection
  const [isTestingAd, setIsTestingAd] = useState(false);
  const [adTestResult, setAdTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  // Docker code copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((data) => setSettings(data))
        .catch((err) => console.error('Error fetching settings:', err));

      fetch('/api/database/info')
        .then((r) => r.json())
        .then((meta) => setDbMetadata(meta))
        .catch((err) => console.error('Error fetching db metadata:', err));
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const updated = await res.json();
      setSettings(updated);
      onSettingsUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAd = async () => {
    setIsTestingAd(true);
    setAdTestResult(null);
    try {
      const res = await fetch('/api/auth/test-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings.adLdapConfig),
      });
      const data = await res.json();
      setAdTestResult(data);
    } catch (err) {
      setAdTestResult({ success: false, message: 'Failed to reach Active Directory Domain Controller.' });
    } finally {
      setIsTestingAd(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>FDIM Suite Administration & Infrastructure</span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure global domain defaults, SQLite database storage, Active Directory/Keycloak auth, and Docker SSL deployment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'general'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Global Domain Defaults</span>
          </button>

          <button
            onClick={() => setActiveTab('sqlite')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'sqlite'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>SQLite Database</span>
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'auth'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Active Directory & Keycloak</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'docker'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Docker & Nginx SSL</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: GENERAL & GLOBAL DOMAIN */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Global Primary Domain (Hauptdomain)</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Specify the default primary domain for your company or MSP infrastructure. When creating customer profiles or generating onboarding scripts, FDIM pre-fills this domain automatically.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Global Default Active Directory Domain:
                    </label>
                    <input
                      type="text"
                      value={settings.defaultGlobalDomain}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultGlobalDomain: e.target.value })
                      }
                      placeholder="corp.internal.net or company.local"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                <span className="font-semibold text-slate-300 block">How This Default Domain is Used:</span>
                <p>• Pre-fills the <strong>Target Domain</strong> field in the New PC Setup Wizard.</p>
                <p>• Pre-fills newly created customer profiles in the <strong>Customer Profiles</strong> manager.</p>
                <p>• Resolves domain membership check for zero-touch silent UNC installations.</p>
              </div>
            </div>
          )}

          {/* TAB 2: SQLITE DATABASE */}
          {activeTab === 'sqlite' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Local SQLite Database Engine</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    STATUS: Connected (WAL Mode)
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Customer Profiles</span>
                    <strong className="text-white text-base font-bold font-mono">
                      {dbMetadata?.stats?.customers ?? '—'}
                    </strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Software Packages</span>
                    <strong className="text-white text-base font-bold font-mono">
                      {dbMetadata?.stats?.packages ?? '—'}
                    </strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Deployments Logged</span>
                    <strong className="text-white text-base font-bold font-mono">
                      {dbMetadata?.stats?.deployments ?? '—'}
                    </strong>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">System Switches</span>
                    <strong className="text-white text-base font-bold font-mono">
                      {dbMetadata?.stats?.systemSwitches ?? '—'}
                    </strong>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Database Engine:</span>
                    <span className="text-emerald-400">{dbMetadata?.engine || 'SQLite (Node.js 22 DatabaseSync)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Location:</span>
                    <span className="text-slate-200 truncate max-w-sm">{dbMetadata?.path || './data/fdim.sqlite'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Database File Size:</span>
                    <span className="text-cyan-300">{dbMetadata?.fileSizeFormatted || '120.0 KB'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Database is persisted on disk in the <code>/data</code> volume.
                  </span>
                  <a
                    href="/api/database/download"
                    download="fdim-database.sqlite"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 transition-colors shadow-md shadow-emerald-600/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SQLite Database (.sqlite)</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE DIRECTORY & KEYCLOAK */}
          {activeTab === 'auth' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Technician Authentication Mode</span>
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'local', title: 'Local / Technician', desc: 'Direct technician access without external auth' },
                    { id: 'active_directory', title: 'Active Directory (LDAP)', desc: 'Enterprise AD domain controller login' },
                    { id: 'keycloak', title: 'Keycloak / OIDC', desc: 'Centralized OpenID Connect single sign-on' },
                  ].map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => setSettings({ ...settings, authMode: mode.id as any })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        settings.authMode === mode.id
                          ? 'bg-cyan-950/40 border-cyan-500 text-white ring-1 ring-cyan-500/30'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <strong className="text-xs font-bold block text-white">{mode.title}</strong>
                      <span className="text-[11px] text-slate-400 mt-1 block">{mode.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Directory Configuration */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Active Directory / LDAP Parameters</span>
                  </h4>
                  <button
                    onClick={handleTestAd}
                    disabled={isTestingAd}
                    className="px-3 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    {isTestingAd ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                    <span>{isTestingAd ? 'Testing...' : 'Test AD Connection'}</span>
                  </button>
                </div>

                {adTestResult && (
                  <div
                    className={`p-3 rounded-lg text-xs font-mono border ${
                      adTestResult.success
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : 'bg-red-950/60 border-red-800 text-red-300'
                    }`}
                  >
                    {adTestResult.message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">LDAP / LDAPS URL:</label>
                    <input
                      type="text"
                      value={settings.adLdapConfig.ldapUrl}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          adLdapConfig: { ...settings.adLdapConfig, ldapUrl: e.target.value },
                        })
                      }
                      placeholder="ldaps://dc01.corp.internal.net:636"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Domain Name (NetBIOS):</label>
                    <input
                      type="text"
                      value={settings.adLdapConfig.domain}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          adLdapConfig: { ...settings.adLdapConfig, domain: e.target.value },
                        })
                      }
                      placeholder="CORP"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Base DN:</label>
                    <input
                      type="text"
                      value={settings.adLdapConfig.baseDn}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          adLdapConfig: { ...settings.adLdapConfig, baseDn: e.target.value },
                        })
                      }
                      placeholder="DC=corp,DC=internal,DC=net"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Technician Admin Group:</label>
                    <input
                      type="text"
                      value={settings.adLdapConfig.adminGroup}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          adLdapConfig: { ...settings.adLdapConfig, adminGroup: e.target.value },
                        })
                      }
                      placeholder="FDIM-Admins"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Keycloak Configuration */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Keycloak OIDC Integration</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Keycloak Server URL:</label>
                    <input
                      type="text"
                      value={settings.keycloakConfig.serverUrl}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          keycloakConfig: { ...settings.keycloakConfig, serverUrl: e.target.value },
                        })
                      }
                      placeholder="https://keycloak.company.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Realm Name:</label>
                    <input
                      type="text"
                      value={settings.keycloakConfig.realm}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          keycloakConfig: { ...settings.keycloakConfig, realm: e.target.value },
                        })
                      }
                      placeholder="enterprise"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Client ID:</label>
                    <input
                      type="text"
                      value={settings.keycloakConfig.clientId}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          keycloakConfig: { ...settings.keycloakConfig, clientId: e.target.value },
                        })
                      }
                      placeholder="fdim-suite"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[11px]">Client Secret:</label>
                    <input
                      type="password"
                      value={settings.keycloakConfig.clientSecret}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          keycloakConfig: { ...settings.keycloakConfig, clientSecret: e.target.value },
                        })
                      }
                      placeholder="••••••••••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCKER & NGINX SSL */}
          {activeTab === 'docker' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Server className="w-4 h-4 text-cyan-400" />
                      <span>Production Docker Deployment (Nginx + SSL + SQLite)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Ready-to-deploy configuration files included in repository root for high-security intranet or MSP servers.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
                  <span className="text-cyan-400 font-bold block mb-1">Quick Start Commands:</span>
                  <p className="text-emerald-300"># 1. Generate SSL Certificate:</p>
                  <p className="text-white">chmod +x docker/generate-ssl.sh && ./docker/generate-ssl.sh</p>
                  <p className="text-emerald-300 mt-2"># 2. Launch FDIM Suite with Nginx SSL reverse proxy:</p>
                  <p className="text-white">docker compose up -d --build</p>
                </div>
              </div>

              {/* Snippet: docker-compose.yml */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span>docker-compose.yml</span>
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `services:\n  fdim:\n    build: .\n    container_name: fdim-app\n    restart: unless-stopped\n    environment:\n      - PORT=3000\n      - NODE_ENV=production\n    volumes:\n      - ./data:/app/data\n    expose:\n      - "3000"\n\n  nginx:\n    image: nginx:alpine\n    container_name: fdim-nginx-ssl\n    ports:\n      - "80:80"\n      - "443:443"\n    volumes:\n      - ./docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro\n      - ./docker/nginx/ssl:/etc/nginx/ssl:ro\n    depends_on:\n      - fdim`,
                        'compose'
                      )
                    }
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedKey === 'compose' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'compose' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 p-3 rounded-lg border border-slate-850 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
{`services:
  fdim:
    build: .
    container_name: fdim-app
    restart: unless-stopped
    volumes:
      - ./data:/app/data
    expose:
      - "3000"

  nginx:
    image: nginx:alpine
    container_name: fdim-nginx-ssl
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - fdim`}
                </pre>
              </div>

              {/* Nginx SSL Highlights */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <span className="font-semibold text-slate-300 block">Nginx SSL Reverse Proxy Highlights:</span>
                <p>• Automated HTTP to HTTPS 301 redirection on port 80.</p>
                <p>• TLS 1.2 and TLS 1.3 enforced with modern cipher suites.</p>
                <p>• WebSocket and SSE streaming support configured for live terminal output.</p>
                <p>• Persistent SQLite data directory mounted at <code>./data</code>.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Settings saved successfully to SQLite!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
