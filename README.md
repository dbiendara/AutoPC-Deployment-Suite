# AutoPC Deploy & Admin Suite 🖥️⚡

> **Enterprise Workstation Provisioning & Silent Software Deployment Platform for Active Directory Environments**

AutoPC Deploy & Admin Suite is an automated deployment and administrative configuration tool built for IT Systems Administrators, MSPs (Managed Service Providers), and Helpdesk teams. It streamlines the onboarding of Windows client workstations that are already joined to a local or hybrid **Active Directory** domain with pre-configured hostnames.

With AutoPC Deploy, technicians can select or customize client profiles, enforce critical enterprise system configurations (RDP, delegated AD admin groups, power schemes), select silent software packages from UNC network shares with tailored installer switches (including config file imports like TeamViewer Host `.tvopt`), and either generate production-grade, self-logging PowerShell deployment scripts or execute them via an interactive live runner.

---

## 🚀 Key Features

### 🏢 Customer & Multi-Tenant Profiles
- **Client Organization Management**: Maintain isolated configuration profiles for different companies, branches, or customer domains (e.g., Acme Industrial, MediCare Solutions, CloudScale Tech).
- **Domain & AD Group Automation**: Predefine customer domain names, target delegated Active Directory administrative groups, and primary UNC software repository paths.
- **Default Software Blueprints**: Assign company-specific default software packages that are automatically pre-selected when launching the deployment wizard.

### 🛡️ Enterprise Active Directory & System Configuration Switches
- **Tailored for Existing Domain Members**: Optimized for PCs that already have hostnames (`$env:COMPUTERNAME`) and domain membership—no redundant serial numbers or employee assignee overhead.
- **Enable Remote Desktop (RDP)**: Configures Terminal Server registry keys, enforces Network Level Authentication (NLA), and unblocks Remote Desktop in Windows Defender Firewall.
- **Delegate AD Groups to Local Administrators**: Automatically adds specified Active Directory security groups (e.g., `DOMAIN\IT-DesktopAdmins`) into the local `Administrators` security group with domain resolution safety checks.
- **Power Management (powercfg)**: Standardizes AC monitor sleep and standby/sleep timeouts via `powercfg.exe` to prevent workstations from sleeping during maintenance windows or user shifts.
- **Dynamic Switch Manager**: Technicians can create, modify, or retire custom system configuration switches with dynamic input parameters and custom PowerShell script snippets.

### 📦 UNC Software Catalog & Winget Package Manager Integration
- **Hybrid Distribution Strategy**: Deploy software packages silently either from local SMB/UNC network shares (e.g., `\\fs01.acme.corp\software$\...`) OR directly from official Microsoft Windows Package Manager (**Winget**) repositories.
- **Default Winget Catalog Items**: Preloaded support for essential workstation software that doesn't need to live on the local UNC share:
  - **7-Zip** (`7zip.7zip`)
  - **VLC Media Player** (`VideoLAN.VLC`)
  - **Microsoft Outlook Classic** (`Microsoft.Outlook`)
  - **Google Chrome** (`Google.Chrome`)
  - **Notepad++** (`Notepad++.Notepad++`)
  - **Adobe Acrobat Reader DC** (`Adobe.Acrobat.Reader.64-bit`)
- **Installer Presets & Silent Switches**: Built-in support and parameter presets for:
  - **Winget**: `winget install --id "<ID>" --exact --silent --accept-package-agreements --accept-source-agreements --disable-interactivity`
  - **MSI / Windows Installer**: `/qn /norestart ALLUSERS=1` with custom public properties (`ASSIGNMENTOPTIONS`, `APITOKEN`, etc.).
  - **Inno Setup**: `/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-`
  - **NSIS**: `/S`
  - **WiX Toolset**: `/quiet /norestart`
  - **TeamViewer Host**: Full support for config file imports (`.tvopt`), API tokens, and assignment options.
- **Manual Package Creation (No AI Required)**: Quickly register internal or bespoke enterprise packages (UNC or Winget) with custom detection rules (registry keys or file paths), silent arguments, and installation timeout safeguards.
- **AI-Assisted Switch Discovery**: Optional switch and silent argument discovery for rare or legacy installers via the Gemini API.

### 📜 Automated PowerShell Script Synthesis
- Generates hardened, stand-alone `.ps1` deployment scripts that:
  - Require elevation (`#Requires -RunAsAdministrator`).
  - Verify Active Directory domain reachability prior to execution.
  - Test UNC path availability before downloading or running installers.
  - Maintain an execution transcript log in `C:\ProgramData\AutoPC-Deploy\Logs\`.
  - Report exact return exit codes with graceful rollback warnings.

### 🖧 User First-Logon Staging (Network Drives & Printers via Active Setup)
- **Solves Non-Logged-In User Limitation**: Workstation provisioning runs as Administrator or SYSTEM before the employee ever logs in. Network drive mappings (`HKCU:\Network`) and per-user network printers require the user's interactive Kerberos security token.
- **Enterprise Dual-Engine Solution**:
  1. **Per-Machine Network Printers**: Configured machine-wide during provisioning using `rundll32 printui.dll,PrintUIEntry /ga /n"\\printserver\printer"`, making them immediately available to every present and future user on the PC.
  2. **Active Setup First-Logon Staging**: AutoPC generates a self-contained payload at `C:\ProgramData\AutoPC\UserLogonSetup.ps1` and registers it in `HKLM:\SOFTWARE\Microsoft\Active Setup\Installed Components\AutoPC_UserProvisioning` (with a secondary Scheduled Task trigger at logon). When any user signs in for the first time, the Windows Shell silently executes the script in their user context, mapping persistent drives (`net use S: "\\server\share" /persistent:yes` with dynamic `%USERNAME%` resolution) and assigning printers!

### ⏱️ Interactive Live Runner & Audit Certificates
- **Step-by-Step Execution Console**: Real-time simulated or live execution terminal with timer tracking, status chips, and step-level rerun capabilities.
- **Compliance Audit Certificates**: Generates downloadable, cryptographically identifiable completion certificates documenting machine hostname, domain, customer profile, applied system switches, and installed package inventory.
- **Historical Deployment Log**: Filterable record of historical deployments with fast export and review capabilities.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   React 19 • Vite • Tailwind CSS • Lucide Icons • Motion   │
│                                                             │
│  ┌─────────────────┐ ┌──────────────────┐ ┌───────────────┐ │
│  │ New PC Wizard   │ │ Customer Manager │ │ UNC Catalog   │ │
│  ├─────────────────┤ ├──────────────────┤ ├───────────────┤ │
│  │ System Switches │ │ Live Runner      │ │ Audit Logs    │ │
│  └─────────────────┘ └──────────────────┘ └───────────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST APIs
┌──────────────────────────────▼──────────────────────────────┐
│                     Node.js / Express                       │
│                     (server.ts / tsx)                       │
│                                                             │
│  • Customer Profiles Store    • System Switches Engine      │
│  • Software Catalog API       • PowerShell Script Synthesizer│
│  • Deployment History Store   • Optional Gemini AI Analysis │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/)
- **Backend**: [Express 4](https://expressjs.com/), [Node.js](https://nodejs.org/), [tsx](https://github.com/privatenumber/tsx)
- **Deployment Script Target**: Microsoft Windows 10/11 Pro & Enterprise, Windows Server, PowerShell 5.1 & PowerShell 7+

---

## 📁 Repository Structure

```
├── server.ts                       # Express backend & PowerShell script generator
├── src/
│   ├── main.tsx                    # React client entry point
│   ├── App.tsx                     # Main application layout and state coordination
│   ├── index.css                   # Global styling with Tailwind CSS imports
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces (Profiles, Packages, Switches)
│   └── components/
│       ├── Header.tsx              # Main navigation & deployment summary bar
│       ├── NewPCWizard.tsx         # 3-step PC deployment wizard
│       ├── CustomerProfilesManager.tsx # Customer profiles & default software manager
│       ├── PackageLibrary.tsx      # UNC Software catalog & manual package creator
│       ├── SystemConfigManager.tsx # Enterprise system switches configuration
│       ├── LiveRunner.tsx          # Real-time execution console & simulator
│       ├── DeploymentHistory.tsx   # Past deployment audit logs
│       ├── ScriptModal.tsx         # PowerShell script preview, copy & download
│       └── AuditCertificateModal.tsx # Post-deployment compliance certificate
├── metadata.json                   # Applet metadata & permission declarations
├── package.json                    # Dependencies and npm scripts
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite build configuration
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Target Workstation (for scripts)**: Windows 10/11 (Domain-joined, Administrator privileges)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/autopc-deploy.git
   cd autopc-deploy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**:
   Create a `.env` file in the project root if you wish to enable AI-powered switch detection:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   PORT=3000
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📖 Deployment Workflow

### 1. Configure Customer Profiles
Navigate to the **Customer Profiles** tab:
1. Click **+ Add Customer Profile**.
2. Enter the customer company name, unique customer code, Active Directory domain name (FQDN or NetBIOS), delegated AD admin group name, and primary UNC repository path.
3. Select which software packages should be assigned as **Default Software** for all new workstations deployed under this profile.
4. Save the profile.

### 2. Manage System Configuration Switches
Navigate to **System Switches**:
1. Review or toggle default switches:
   - **Enable Remote Desktop**: Enables RDP, sets NLA, and adds firewall exceptions.
   - **Add AD Group to Administrators**: Adds `DOMAIN\Group` to the local Administrators group.
   - **Power Plan**: Configures monitor off (AC) and standby timeout (AC) via `powercfg`.
2. Click **+ Add Custom Switch** to register additional company policies (e.g., disable Fast Startup, map network drives, or configure corporate proxy).

### 3. Register UNC Software Packages
Navigate to the **UNC Catalog**:
1. Use **+ Add Package Manually** to register internal software installers without needing AI.
2. Select your installer architecture (MSI, Inno Setup, NSIS, WiX, or TeamViewer Host).
3. Specify the UNC network path (`\\fileserver\deploy\App.exe`).
4. Enter silent flags, extra parameters, configuration files, and detection rules (registry path or file path).

### 4. Deploy a New Workstation
Navigate to **Deploy New PC**:
- **Step 1 - Profile & Hostname**: Select the Customer Profile. The workstation hostname defaults to `$env:COMPUTERNAME` (or you can override it for target generation).
- **Step 2 - System Configuration**: Review active switches and adjust parameters (such as the specific AD Admin group or timeout minutes).
- **Step 3 - Software Selection**: Default customer software is automatically selected. Check or uncheck packages as needed.
- **Launch Execution**:
  - Click **Generate Script (.ps1)** to inspect, copy, or download the PowerShell script.
  - Click **Launch Deployment Runner** to test execution in the live step-by-step console.

---

## 🔒 Security & Best Practices

- **Zero Hardcoded Credentials**: Generated PowerShell scripts rely on the executing technician's Windows/AD token or group policy context; no plaintext passwords or secrets are embedded into scripts.
- **UNC Path Validation**: Scripts verify UNC share reachability before initiating downloads or child processes.
- **Audit Trails**: All completed deployments write an entry to the local log and create an exportable audit certificate for compliance documentation.
- **PowerShell Execution Policy**: Scripts can be executed using:
  ```powershell
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Deploy-Workstation.ps1
  ```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
