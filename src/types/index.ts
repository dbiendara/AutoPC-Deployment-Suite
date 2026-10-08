export interface SoftwarePackage {
  id: string;
  name: string;
  version: string;
  category: 'Browser' | 'Development' | 'Productivity' | 'Communication' | 'Security' | 'Utilities' | 'Design';
  uncPath: string;
  fileName: string;
  installerType: 'MSI' | 'InnoSetup' | 'NSIS' | 'InstallShield' | 'WiX' | 'CustomEXE' | 'PowerShellScript';
  silentArgs: string;
  logArgs?: string;
  rebootBehavior: 'Suppress' | 'Prompt' | 'Allow';
  detectionType: 'Registry' | 'FilePath' | 'PowerShellCheck';
  detectionRule: string;
  successExitCodes: number[];
  estimatedMinutes: number;
  description: string;
  recommendedProfiles: string[];
  testInstallStatus?: 'Verified' | 'Untested' | 'Failed';
  aiConfidence?: number;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'System' | 'Network' | 'Security' | 'Accounts' | 'Customization';
  powershellCommand: string;
  verificationCommand: string;
  description: string;
  recommendedProfiles: string[];
  requiresReboot: boolean;
}

export interface RoleProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  packageIds: string[];
  checklistIds: string[];
}

export interface DeploymentRecord {
  id: string;
  machineName: string;
  serialNumber: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  profileId: string;
  status: 'In Progress' | 'Completed' | 'Failed';
  startedAt: string;
  completedAt?: string;
  selectedPackageIds: string[];
  selectedChecklistIds: string[];
  logs: Array<{ timestamp: string; level: 'info' | 'warn' | 'error' | 'success'; message: string }>;
  results: {
    packages: Record<string, { status: 'success' | 'failed' | 'skipped'; exitCode?: number; log?: string }>;
    checklists: Record<string, { status: 'success' | 'failed' | 'skipped'; log?: string }>;
  };
  technicianName: string;
}

export interface AIDetectionResult {
  installerType: 'MSI' | 'InnoSetup' | 'NSIS' | 'InstallShield' | 'WiX' | 'CustomEXE' | 'PowerShellScript';
  silentArgs: string;
  logArgs?: string;
  rebootBehavior: 'Suppress' | 'Prompt' | 'Allow';
  successExitCodes: number[];
  detectionType: 'Registry' | 'FilePath' | 'PowerShellCheck';
  detectionRule: string;
  estimatedMinutes: number;
  category: 'Browser' | 'Development' | 'Productivity' | 'Communication' | 'Security' | 'Utilities' | 'Design';
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
