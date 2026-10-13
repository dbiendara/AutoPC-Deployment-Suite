import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import {
  CustomerProfile,
  SoftwarePackage,
  SystemConfigSwitch,
  DeploymentRecord,
  AppSettings,
  AuthUser,
} from '../src/types';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'fdim.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency
try {
  db.exec('PRAGMA journal_mode = WAL;');
} catch {
  // Ignore if WAL pragma not supported in environment
}

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS system_switches (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS deployments (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    started_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    data TEXT NOT NULL
  );
`);

// -------------------------------------------------------------
// SEEDING DEFAULT DATA (if empty)
// -------------------------------------------------------------

export function seedInitialDataIfEmpty(
  initialPackages: SoftwarePackage[],
  initialCustomers: CustomerProfile[],
  initialSwitches: SystemConfigSwitch[],
  initialDeployments: DeploymentRecord[]
) {
  const pkgCount = (db.prepare('SELECT COUNT(*) as cnt FROM packages').get() as { cnt: number }).cnt;
  if (pkgCount === 0) {
    const insertPkg = db.prepare('INSERT INTO packages (id, data, updated_at) VALUES (?, ?, ?)');
    for (const pkg of initialPackages) {
      insertPkg.run(pkg.id, JSON.stringify(pkg), new Date().toISOString());
    }
  }

  const custCount = (db.prepare('SELECT COUNT(*) as cnt FROM customers').get() as { cnt: number }).cnt;
  if (custCount === 0) {
    const insertCust = db.prepare('INSERT INTO customers (id, data, updated_at) VALUES (?, ?, ?)');
    for (const cust of initialCustomers) {
      insertCust.run(cust.id, JSON.stringify(cust), new Date().toISOString());
    }
  }

  const switchCount = (db.prepare('SELECT COUNT(*) as cnt FROM system_switches').get() as { cnt: number }).cnt;
  if (switchCount === 0) {
    const insertSwitch = db.prepare('INSERT INTO system_switches (id, data, updated_at) VALUES (?, ?, ?)');
    for (const sw of initialSwitches) {
      insertSwitch.run(sw.id, JSON.stringify(sw), new Date().toISOString());
    }
  }

  const depCount = (db.prepare('SELECT COUNT(*) as cnt FROM deployments').get() as { cnt: number }).cnt;
  if (depCount === 0) {
    const insertDep = db.prepare('INSERT INTO deployments (id, data, started_at) VALUES (?, ?, ?)');
    for (const dep of initialDeployments) {
      insertDep.run(dep.id, JSON.stringify(dep), dep.startedAt || new Date().toISOString());
    }
  }

  // Initial App Settings
  const defaultSettings: AppSettings = {
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
  };

  const settingsRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('global') as { value: string } | undefined;
  if (!settingsRow) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('global', JSON.stringify(defaultSettings));
  }

  // Initial Users
  const userCount = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt;
  if (userCount === 0) {
    const insertUser = db.prepare('INSERT INTO users (id, username, data) VALUES (?, ?, ?)');
    const defaultAdmin: AuthUser = {
      id: 'usr-admin',
      username: 'admin',
      displayName: 'FDIM Domain Administrator',
      domain: 'CORP',
      role: 'Administrator',
      authProvider: 'local',
      avatarInitials: 'DA',
    };
    const defaultTech: AuthUser = {
      id: 'usr-tech1',
      username: 'technician',
      displayName: 'MSP Field Engineer',
      domain: 'CORP',
      role: 'Technician',
      authProvider: 'local',
      avatarInitials: 'FE',
    };
    insertUser.run(defaultAdmin.id, defaultAdmin.username, JSON.stringify(defaultAdmin));
    insertUser.run(defaultTech.id, defaultTech.username, JSON.stringify(defaultTech));
  }
}

// -------------------------------------------------------------
// CRUD METHODS
// -------------------------------------------------------------

// Packages
export function getAllPackages(): SoftwarePackage[] {
  const rows = db.prepare('SELECT data FROM packages ORDER BY updated_at DESC').all() as Array<{ data: string }>;
  return rows.map((r) => JSON.parse(r.data));
}

export function savePackage(pkg: SoftwarePackage): SoftwarePackage {
  const existing = db.prepare('SELECT id FROM packages WHERE id = ?').get(pkg.id);
  const now = new Date().toISOString();
  if (existing) {
    db.prepare('UPDATE packages SET data = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(pkg), now, pkg.id);
  } else {
    db.prepare('INSERT INTO packages (id, data, updated_at) VALUES (?, ?, ?)').run(pkg.id, JSON.stringify(pkg), now);
  }
  return pkg;
}

export function deletePackage(id: string): boolean {
  const result = db.prepare('DELETE FROM packages WHERE id = ?').run(id);
  return (result as { changes?: number }).changes ? (result as { changes: number }).changes > 0 : true;
}

// Customers
export function getAllCustomers(): CustomerProfile[] {
  const rows = db.prepare('SELECT data FROM customers ORDER BY updated_at DESC').all() as Array<{ data: string }>;
  return rows.map((r) => JSON.parse(r.data));
}

export function getCustomerById(id: string): CustomerProfile | null {
  const row = db.prepare('SELECT data FROM customers WHERE id = ?').get(id) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

export function saveCustomer(cust: CustomerProfile): CustomerProfile {
  const existing = db.prepare('SELECT id FROM customers WHERE id = ?').get(cust.id);
  const now = new Date().toISOString();
  if (existing) {
    db.prepare('UPDATE customers SET data = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(cust), now, cust.id);
  } else {
    db.prepare('INSERT INTO customers (id, data, updated_at) VALUES (?, ?, ?)').run(cust.id, JSON.stringify(cust), now);
  }
  return cust;
}

export function deleteCustomer(id: string): boolean {
  const result = db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  return (result as { changes?: number }).changes ? (result as { changes: number }).changes > 0 : true;
}

// System Switches
export function getAllSystemSwitches(): SystemConfigSwitch[] {
  const rows = db.prepare('SELECT data FROM system_switches ORDER BY id ASC').all() as Array<{ data: string }>;
  return rows.map((r) => JSON.parse(r.data));
}

export function saveSystemSwitch(sw: SystemConfigSwitch): SystemConfigSwitch {
  const existing = db.prepare('SELECT id FROM system_switches WHERE id = ?').get(sw.id);
  const now = new Date().toISOString();
  if (existing) {
    db.prepare('UPDATE system_switches SET data = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(sw), now, sw.id);
  } else {
    db.prepare('INSERT INTO system_switches (id, data, updated_at) VALUES (?, ?, ?)').run(sw.id, JSON.stringify(sw), now);
  }
  return sw;
}

// Deployments
export function getAllDeployments(): DeploymentRecord[] {
  const rows = db.prepare('SELECT data FROM deployments ORDER BY started_at DESC').all() as Array<{ data: string }>;
  return rows.map((r) => JSON.parse(r.data));
}

export function saveDeployment(dep: DeploymentRecord): DeploymentRecord {
  const existing = db.prepare('SELECT id FROM deployments WHERE id = ?').get(dep.id);
  if (existing) {
    db.prepare('UPDATE deployments SET data = ? WHERE id = ?').run(JSON.stringify(dep), dep.id);
  } else {
    db.prepare('INSERT INTO deployments (id, data, started_at) VALUES (?, ?, ?)').run(
      dep.id,
      JSON.stringify(dep),
      dep.startedAt || new Date().toISOString()
    );
  }
  return dep;
}

// App Settings
export function getAppSettings(): AppSettings {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('global') as { value: string } | undefined;
  if (!row) {
    return {
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
    };
  }
  return JSON.parse(row.value);
}

export function updateAppSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const merged: AppSettings = {
    ...current,
    ...partial,
    adLdapConfig: {
      ...current.adLdapConfig,
      ...(partial.adLdapConfig || {}),
    },
    keycloakConfig: {
      ...current.keycloakConfig,
      ...(partial.keycloakConfig || {}),
    },
  };
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('global', JSON.stringify(merged));
  return merged;
}

// Users / Auth
export function getAllUsers(): AuthUser[] {
  const rows = db.prepare('SELECT data FROM users').all() as Array<{ data: string }>;
  return rows.map((r) => JSON.parse(r.data));
}

export function findUserByUsername(username: string): AuthUser | null {
  const row = db.prepare('SELECT data FROM users WHERE LOWER(username) = LOWER(?)').get(username) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

// Database stats & file info
export function getDatabaseMetadata() {
  let fileSize = 0;
  try {
    const stats = fs.statSync(dbPath);
    fileSize = stats.size;
  } catch {
    fileSize = 0;
  }

  const packageCount = (db.prepare('SELECT COUNT(*) as cnt FROM packages').get() as { cnt: number }).cnt;
  const customerCount = (db.prepare('SELECT COUNT(*) as cnt FROM customers').get() as { cnt: number }).cnt;
  const deploymentCount = (db.prepare('SELECT COUNT(*) as cnt FROM deployments').get() as { cnt: number }).cnt;
  const switchCount = (db.prepare('SELECT COUNT(*) as cnt FROM system_switches').get() as { cnt: number }).cnt;

  return {
    engine: 'SQLite (Node.js 22 Native DatabaseSync)',
    path: dbPath,
    fileSizeBytes: fileSize,
    fileSizeFormatted: `${(fileSize / 1024).toFixed(1)} KB`,
    stats: {
      packages: packageCount,
      customers: customerCount,
      deployments: deploymentCount,
      systemSwitches: switchCount,
    },
  };
}

export function getDatabaseFilePath(): string {
  return dbPath;
}
