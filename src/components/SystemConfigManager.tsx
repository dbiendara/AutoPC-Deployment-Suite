import React, { useState } from 'react';
import { SystemConfigSwitch } from '../types';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SystemConfigManagerProps {
  isOpen: boolean;
  onClose: () => void;
  switches: SystemConfigSwitch[];
  onAddSwitch: (newSwitch: SystemConfigSwitch) => void;
  onUpdateSwitch: (updatedSwitch: SystemConfigSwitch) => void;
  onDeleteSwitch: (id: string) => void;
}

export const SystemConfigManager: React.FC<SystemConfigManagerProps> = ({
  isOpen,
  onClose,
  switches,
  onAddSwitch,
  onUpdateSwitch,
  onDeleteSwitch,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSwitch, setEditingSwitch] = useState<SystemConfigSwitch | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SystemConfigSwitch['category']>('Optimization');
  const [powershellCommand, setPowershellCommand] = useState('');
  const [enabledByDefault, setEnabledByDefault] = useState(true);
  const [hasParameter, setHasParameter] = useState(false);
  const [parameterKey, setParameterKey] = useState('');
  const [parameterLabel, setParameterLabel] = useState('');
  const [parameterType, setParameterType] = useState<'text' | 'number' | 'select'>('text');
  const [parameterDefaultValue, setParameterDefaultValue] = useState<string>('');

  if (!isOpen) return null;

  const startCreate = () => {
    setEditingSwitch(null);
    setTitle('');
    setDescription('');
    setCategory('Optimization');
    setPowershellCommand('');
    setEnabledByDefault(true);
    setHasParameter(false);
    setParameterKey('');
    setParameterLabel('');
    setParameterType('text');
    setParameterDefaultValue('');
    setIsCreating(true);
  };

  const startEdit = (sw: SystemConfigSwitch) => {
    setEditingSwitch(sw);
    setTitle(sw.title);
    setDescription(sw.description);
    setCategory(sw.category);
    setPowershellCommand(sw.powershellCommand);
    setEnabledByDefault(sw.enabledByDefault);
    setHasParameter(!!sw.hasParameter);
    setParameterKey(sw.parameterKey || '');
    setParameterLabel(sw.parameterLabel || '');
    setParameterType(sw.parameterType || 'text');
    setParameterDefaultValue(String(sw.parameterDefaultValue || ''));
    setIsCreating(true);
  };

  const applyPreset = (presetType: string) => {
    if (presetType === 'fast-startup') {
      setTitle('Disable Windows Fast Startup (Hiberboot)');
      setDescription('Disables hybrid shutdown to ensure clean domain sync and prevent reboot hangs.');
      setCategory('Optimization');
      setPowershellCommand('Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power" -Name "HiberbootEnabled" -Value 0 -Force');
      setEnabledByDefault(true);
      setHasParameter(false);
    } else if (presetType === 'exec-policy') {
      setTitle('Set PowerShell Execution Policy RemoteSigned');
      setDescription('Configures machine-wide execution policy to allow administrative scripts.');
      setCategory('Security');
      setPowershellCommand('Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force');
      setEnabledByDefault(true);
      setHasParameter(false);
    } else if (presetType === 'disable-ipv6') {
      setTitle('Disable IPv6 on Active Network Adapters');
      setDescription('Disables IPv6 protocol bindings to prevent legacy internal DNS resolution issues.');
      setCategory('Network');
      setPowershellCommand('Disable-NetAdapterBinding -Name "*" -ComponentID "ms_tcpip6" -ErrorAction SilentlyContinue');
      setEnabledByDefault(false);
      setHasParameter(false);
    } else if (presetType === 'uac-notify') {
      setTitle('Enforce Standard UAC Notification Level');
      setDescription('Ensures consent prompt behavior for local administrators.');
      setCategory('Security');
      setPowershellCommand('Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" -Name "ConsentPromptBehaviorAdmin" -Value 5 -Force');
      setEnabledByDefault(true);
      setHasParameter(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !powershellCommand.trim()) return;

    const payload: SystemConfigSwitch = {
      id: editingSwitch ? editingSwitch.id : `sw-${Date.now().toString(36)}`,
      key: editingSwitch ? editingSwitch.key : title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      title: title.trim(),
      description: description.trim(),
      category,
      powershellCommand: powershellCommand.trim(),
      hasParameter,
      parameterKey: hasParameter ? parameterKey.trim() : undefined,
      parameterLabel: hasParameter ? parameterLabel.trim() : undefined,
      parameterType: hasParameter ? parameterType : undefined,
      parameterDefaultValue: hasParameter ? parameterDefaultValue : undefined,
      enabledByDefault,
      isRemovable: editingSwitch ? editingSwitch.isRemovable : true,
    };

    if (editingSwitch) {
      onUpdateSwitch(payload);
    } else {
      onAddSwitch(payload);
    }

    setIsCreating(false);
    setEditingSwitch(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Configuration Switches Manager</h3>
              <p className="text-xs text-slate-400">
                Add, edit, or remove custom PowerShell administrative configuration tasks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isCreating && (
              <button
                onClick={startCreate}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Switch</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add / Edit Form */}
          {isCreating && (
            <div className="bg-slate-950 border border-purple-500/70 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>{editingSwitch ? `Edit Switch: ${title}` : 'Define New Configuration Switch'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Preset Buttons */}
              {!editingSwitch && (
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                    Quick Administrative Task Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset('fast-startup')}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-purple-300 hover:bg-slate-850"
                    >
                      Disable Fast Startup (Hiberboot)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('exec-policy')}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 hover:bg-slate-850"
                    >
                      ExecutionPolicy RemoteSigned
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('disable-ipv6')}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
                    >
                      Disable IPv6
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('uac-notify')}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 hover:bg-slate-850"
                    >
                      UAC Standard Level
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-medium mb-1">
                      Switch Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Disable Fast Startup"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SystemConfigSwitch['category'])}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Optimization">Optimization</option>
                      <option value="Security">Security & Policy</option>
                      <option value="RemoteAccess">Remote Access</option>
                      <option value="Power">Power & Display</option>
                      <option value="Network">Network & DNS</option>
                      <option value="Custom">Custom Task</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief explanation of what this configuration achieves"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    PowerShell Command / Script <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={powershellCommand}
                    onChange={(e) => setPowershellCommand(e.target.value)}
                    placeholder='Set-ItemProperty -Path "HKLM:\..." -Name "..." -Value ...'
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    You can use parameter placeholders like &#123;&#123;adAdminGroupName&#125;&#125; or custom parameters.
                  </span>
                </div>

                {/* Optional Parameter Configuration */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-white flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasParameter}
                      onChange={(e) => setHasParameter(e.target.checked)}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Has Configurable Parameter (Input field on PC Setup screen)</span>
                  </label>

                  {hasParameter && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-slate-400 mb-1">Placeholder Key:</label>
                        <input
                          type="text"
                          value={parameterKey}
                          onChange={(e) => setParameterKey(e.target.value)}
                          placeholder="e.g. adAdminGroupName"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Input Label:</label>
                        <input
                          type="text"
                          value={parameterLabel}
                          onChange={(e) => setParameterLabel(e.target.value)}
                          placeholder="e.g. AD Group Name"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Default Value:</label>
                        <input
                          type="text"
                          value={parameterDefaultValue}
                          onChange={(e) => setParameterDefaultValue(e.target.value)}
                          placeholder="Default value"
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabledByDefault}
                      onChange={(e) => setEnabledByDefault(e.target.checked)}
                      className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Enabled by default for new setups</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingSwitch ? 'Update Switch' : 'Save Switch'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* List of active switches */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Active System Configuration Switches ({switches.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">
                These switches appear dynamically on the New PC Setup screen
              </span>
            </h4>

            <div className="space-y-2.5">
              {switches.map((sw) => (
                <div
                  key={sw.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{sw.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-850 text-slate-300 font-medium">
                        {sw.category}
                      </span>
                      {sw.enabledByDefault && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                          Default Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{sw.description}</p>
                    <code className="block text-[11px] text-emerald-400/90 font-mono truncate max-w-2xl bg-slate-900 px-2 py-1 rounded border border-slate-850">
                      {sw.powershellCommand}
                    </code>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => startEdit(sw)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Edit switch"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {sw.isRemovable ? (
                      <button
                        onClick={() => onDeleteSwitch(sw.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Delete switch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-600 px-1 font-mono">Core</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span>Switches execute in Phase 2 with full error trapping in Master_Provisioning.log</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
