import { Injectable, inject } from '@angular/core';
import { AuditLog } from '../../shared/models/models';
import { AuthService } from '../auth/auth.service';

const STORAGE_KEY = 'tancura_v1_audit_ledger';

const INITIAL_LOGS: AuditLog[] = [
  { logId: 100, timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), userId: 'system-init', userRole: 'System', action: 'Initialized', targetEntity: 'Core Engine', entityId: 'SYS-001', status: 'Success' },
  { logId: 101, timestamp: new Date(Date.now() - 86400000).toISOString(), userId: 'admin@tancura.io', userRole: 'Admin', action: 'Added', targetEntity: 'Patient', entityId: 'PAT-001', status: 'Success' }
];

@Injectable({ providedIn: 'root' })
export class AuditService {
  private auth = inject(AuthService);
  private logs: AuditLog[] = this.loadFromStorage();

  getAuditLogs() {
    return [...this.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  log(action: string, targetEntity: string, entityId: string, status: 'Success' | 'Failure' = 'Success') {
    const user = this.auth.currentUser();
    const newLog: AuditLog = {
      logId: Math.floor(Math.random() * 100000),
      timestamp: new Date().toISOString(),
      userId: user?.email || 'Anonymous',
      userRole: user?.role || 'Guest',
      action,
      targetEntity,
      entityId,
      status,
      ipAddress: '127.0.0.1 (Local)'
    };

    this.logs = [newLog, ...this.logs];
    this.saveToStorage();
    console.log('AuditService: Telemetry logged', newLog);
  }

  private loadFromStorage(): AuditLog[] {
    if (typeof window === 'undefined') return [...INITIAL_LOGS];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [...INITIAL_LOGS];
    } catch {
      return [...INITIAL_LOGS];
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch {}
  }
}
