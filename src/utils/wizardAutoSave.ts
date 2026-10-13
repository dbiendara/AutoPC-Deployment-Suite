import {
  SystemConfigSettings,
  NetworkDriveMapping,
  PrinterMapping,
  UserLogonStagingConfig,
} from '../types';

export const WIZARD_STORAGE_KEY = 'fdim_new_pc_wizard_draft';

export interface WizardDraftConfig {
  version: number;
  savedAt: string; // ISO date string
  machineName: string;
  selectedCustomerId: string;
  selectedPackageIds: string[];
  packageCustomSwitches: Record<string, string>;
  packageConfigFiles: Record<string, string>;
  enabledSwitchIds: string[];
  switchParameters: Record<string, string | number>;
  systemConfig: SystemConfigSettings;
  stagedDrives: NetworkDriveMapping[];
  stagedPrinters: PrinterMapping[];
  userLogonStaging: UserLogonStagingConfig;
}

export function loadWizardDraft(): WizardDraftConfig | null {
  try {
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    
    // Basic shape check
    if (typeof parsed.machineName !== 'string' && typeof parsed.selectedCustomerId !== 'string') {
      return null;
    }
    return parsed as WizardDraftConfig;
  } catch (err) {
    console.warn('Failed to load wizard draft from localStorage:', err);
    return null;
  }
}

export function saveWizardDraft(
  config: Omit<WizardDraftConfig, 'version' | 'savedAt'>
): WizardDraftConfig {
  const draft: WizardDraftConfig = {
    ...config,
    version: 1,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    console.warn('Failed to save wizard draft to localStorage:', err);
  }
  return draft;
}

export function clearWizardDraft(): void {
  try {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear wizard draft from localStorage:', err);
  }
}

export function formatTimeAgo(isoString?: string): string {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Just now';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
}
