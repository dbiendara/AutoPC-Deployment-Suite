export interface SoftwarePackage {
  id: string;
  name: string;
  version: string;
  category: 'RemoteSupport' | 'Browser' | 'Development' | 'Productivity' | 'Communication' | 'Security' | 'Utilities';
  sourceType?: 'unc' | 'winget'; // Distribution channel: UNC network share or Windows Package Manager
  wingetId?: string; // e.g. 7zip.7zip, VideoLAN.VLC, Microsoft.Outlook
  uncPath: string;
  fileName: string;
  installerType: 'MSI' | 'InnoSetup' | 'NSIS' | 'InstallShield' | 'WiX' | 'CustomEXE' | 'PowerShellScript' | 'Winget';
  silentArgs: string;
  extraSwitches?: string; // e.g., CUSTOMCONFIGID=xxxx APITOKEN=xxxx ASSIGNMENTOPTIONS="--alias %COMPUTERNAME%"
  configFileImport?: {
    enabled: boolean;
    configFileName: string; // e.g., TeamViewer_Settings.tvopt
    configUncPath: string; // e.g., \\corp-fs01\deployments\teamviewer\TeamViewer_Settings.tvopt
    importSwitch?: string; // e.g., SETTINGSFILE="<CONFIG_PATH>"
    preCopyDestination?: string; // e.g., C:\Program Files\TeamViewer\
  };
  logArgs?: string;
  rebootBehavior: 'Suppress' | 'Prompt' | 'Allow';
  detectionType: 'Registry' | 'FilePath' | 'PowerShellCheck';
  detectionRule: string;
  successExitCodes: number[];
  estimatedMinutes: number;
  description: string;
  testInstallStatus?: 'Verified' | 'Untested' | 'Failed';
  aiConfidence?: number;
  notes?: string;
}

export interface NetworkDriveMapping {
  id: string;
  driveLetter: string; // e.g., "S:", "P:", "H:"
  uncPath: string; // e.g., "\\corp-fs01\Shares\Logistics", "\\corp-fs01\Users\%USERNAME%"
  label: string; // e.g., "Department Shared Documents", "Personal Home Folder"
  persistent?: boolean; // Default true
  enabled?: boolean; // Active toggle for this PC deployment
}

export interface PrinterMapping {
  id: string;
  name: string; // e.g., "Office Floor 1 Canon MFP"
  connectionType: 'PerMachineUNC' | 'UserLogonUNC' | 'DirectIP'; // PerMachine via printui /ga or UserLogon via Active Setup
  pathOrIp: string; // e.g., "\\corp-print01\ACME-Color-MFP" or "192.168.1.50"
  driverName?: string;
  isDefault?: boolean;
  comment?: string;
  enabled?: boolean; // Active toggle for this PC deployment
}

export interface UserLogonStagingConfig {
  enabled: boolean;
  stagingPath?: string; // Default: "C:\ProgramData\AutoPC\UserLogonSetup.ps1"
  activeSetupKey?: string; // Default: "AutoPC_UserProvisioning"
  scheduledTaskFallback?: boolean; // Register at-logon task as backup
  cleanUpAfterFirstRun?: boolean;
}

export interface CustomerProfile {
  id: string;
  companyName: string;
  customerCode: string;
  domainName: string;
  defaultAdAdminGroup: string;
  uncShareRoot: string;
  enableRdp: boolean;
  powerPlanSettings: {
    screenTimeoutAc: number;
    standbyTimeoutAc: number;
  };
  packageIds: string[]; // Default software packages assigned to this customer
  packageCustomSwitches?: Record<string, string>; // packageId -> extra switches override
  packageConfigFiles?: Record<string, string>; // packageId -> config file path override
  // First-Logon Staged User Settings (Network Drives & Printers)
  networkDrives?: NetworkDriveMapping[];
  printers?: PrinterMapping[];
  userLogonStaging?: UserLogonStagingConfig;
  notes?: string;
}

export interface SystemConfigSwitch {
  id: string;
  key: string;
  title: string;
  description: string;
  category: 'RemoteAccess' | 'Security' | 'Power' | 'Network' | 'Optimization' | 'Custom';
  powershellCommand: string;
  hasParameter?: boolean;
  parameterKey?: string; // e.g. "adAdminGroupName", "screenTimeoutAc", "standbyTimeoutAc", "customParam"
  parameterType?: 'text' | 'number' | 'select';
  parameterLabel?: string;
  parameterDefaultValue?: string | number;
  parameterOptions?: Array<{ label: string; value: string | number }>;
  enabledByDefault: boolean;
  isRemovable: boolean;
}

export interface SystemConfigSettings {
  enableRdp: boolean;
  addAdGroupToAdmins: boolean;
  adAdminGroupName: string;
  setPowerPlan: boolean;
  screenTimeoutAc: number;
  standbyTimeoutAc: number;
}

export interface ActiveSystemConfigState {
  enabledSwitchIds: string[];
  parameterValues: Record<string, string | number>; // switchKey or parameterKey -> value
}

export interface DeploymentRecord {
  id: string;
  machineName: string;
  domainName: string;
  customerProfileId: string;
  customerCompanyName: string;
  status: 'In Progress' | 'Completed' | 'Failed';
  startedAt: string;
  completedAt?: string;
  selectedPackageIds: string[];
  appliedSwitchIds?: string[];
  switchParameters?: Record<string, string | number>;
  systemConfig?: SystemConfigSettings;
  stagedDrives?: NetworkDriveMapping[];
  stagedPrinters?: PrinterMapping[];
  userLogonStaging?: UserLogonStagingConfig;
  logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'error' | 'success'; message: string }>;
  results: {
    packages: Record<string, { status: 'success' | 'failed' | 'skipped'; exitCode?: number; log?: string }>;
    systemConfigs: Record<string, { status: 'success' | 'failed' | 'skipped'; log?: string }>;
  };
  technicianName: string;
}

export interface AIDetectionResult {
  installerType: 'MSI' | 'InnoSetup' | 'NSIS' | 'InstallShield' | 'WiX' | 'CustomEXE' | 'PowerShellScript';
  silentArgs: string;
  extraSwitches?: string;
  configFileAdvice?: string;
  logArgs?: string;
  rebootBehavior: 'Suppress' | 'Prompt' | 'Allow';
  successExitCodes: number[];
  detectionType: 'Registry' | 'FilePath' | 'PowerShellCheck';
  detectionRule: string;
  estimatedMinutes: number;
  category: 'RemoteSupport' | 'Browser' | 'Development' | 'Productivity' | 'Communication' | 'Security' | 'Utilities';
  prerequisites: string[];
  confidenceScore: number;
  analysisExplanation: string;
  powershellSnippet: string;
}

export interface AITestInstallResult {
  verdict: 'PASS' | 'WARN' | 'FAIL';
  confidenceScore: number;
  summary: string;
  hangingRisks: string[];
  simulatedTimeline: Array<{
    step: string;
    durationSec: number;
    status: string;
    logOutput: string;
  }>;
  recommendedTweaks?: string[];
}
