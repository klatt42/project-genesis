// ================================
// PROJECT: Genesis Agent SDK - Weeks 9 & 10
// FILE: maintenance/agents/security-scanner.ts
// PURPOSE: Continuous security vulnerability scanning and patching (Phase 2.2)
// GENESIS REF: Week 10 - Autonomous Maintenance
// WSL PATH: ~/project-genesis/maintenance/agents/security-scanner.ts
// ================================

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Genesis Security Scanner Agent
 *
 * Continuous security monitoring with:
 * - Automated vulnerability scanning
 * - Automatic security patching
 * - CVE tracking and monitoring
 * - Compliance checking
 * - Security trend analysis
 * - Alert management
 */

/**
 * Severity Level
 */
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Security Vulnerability
 */
export interface SecurityVulnerability {
  id: string;
  package: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  affectedVersions: string;
  patchedVersion: string;
  cve?: string;
  cwe?: string;
  cvssScore?: number;
  publishedDate: Date;
  exploitAvailable: boolean;
  fixAvailable: boolean;
  recommendation: string;
}

/**
 * Security Configuration
 */
export interface SecurityConfig {
  autoFixEnabled: boolean;
  severityThreshold: SeverityLevel;
  notifyOnVulnerability: boolean;
  createSecurityIssues: boolean;
  scanInterval: number; // hours
  failOnCritical: boolean;
  ignoreDevDependencies: boolean;
  allowedVulnerabilities: string[]; // CVE IDs to ignore
}

/**
 * Security Audit Result
 */
export interface SecurityAuditResult {
  timestamp: Date;
  vulnerabilities: SecurityVulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  fixable: number;
  requiresManualReview: number;
  complianceScore: number;
}

/**
 * Security Fix Result
 */
export interface SecurityFixResult {
  vulnerability: SecurityVulnerability;
  success: boolean;
  fixed: boolean;
  method: 'automatic' | 'manual' | 'none';
  errors: string[];
  testsPassed: boolean;
}

/**
 * Scan History Entry
 */
export interface ScanHistoryEntry {
  timestamp: Date;
  result: SecurityAuditResult;
  fixesApplied: number;
  duration: number;
}

/**
 * Security Scanner Agent
 *
 * Continuously monitors and fixes security vulnerabilities
 */
export class SecurityScannerAgent {
  private config: SecurityConfig;
  private projectPath: string;
  private scanHistory: ScanHistoryEntry[];
  private scanInterval?: NodeJS.Timeout;
  private currentVulnerabilities: Map<string, SecurityVulnerability>;

  constructor(projectPath: string, config?: Partial<SecurityConfig>) {
    this.projectPath = projectPath;
    this.scanHistory = [];
    this.currentVulnerabilities = new Map();

    // Default configuration
    this.config = {
      autoFixEnabled: true,
      severityThreshold: 'high',
      notifyOnVulnerability: true,
      createSecurityIssues: true,
      scanInterval: 24, // Daily scans
      failOnCritical: true,
      ignoreDevDependencies: false,
      allowedVulnerabilities: [],
      ...config
    };
  }

  /**
   * Perform security scan
   */
  async scan(): Promise<SecurityAuditResult> {
    const startTime = Date.now();

    try {
      const { stdout } = await execAsync('npm audit --json', {
        cwd: this.projectPath
      });

      const audit = JSON.parse(stdout);
      const vulnerabilities = this.parseAuditResults(audit);
      const result = this.buildAuditResult(vulnerabilities);

      // Update current vulnerabilities
      this.currentVulnerabilities.clear();
      for (const vuln of vulnerabilities) {
        this.currentVulnerabilities.set(vuln.id, vuln);
      }

      // Record in history
      this.scanHistory.push({
        timestamp: new Date(),
        result,
        fixesApplied: 0,
        duration: Date.now() - startTime
      });

      return result;

    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities found
      if (error instanceof Error && 'stdout' in error) {
        try {
          const audit = JSON.parse((error as any).stdout);
          const vulnerabilities = this.parseAuditResults(audit);
          const result = this.buildAuditResult(vulnerabilities);

          this.currentVulnerabilities.clear();
          for (const vuln of vulnerabilities) {
            this.currentVulnerabilities.set(vuln.id, vuln);
          }

          this.scanHistory.push({
            timestamp: new Date(),
            result,
            fixesApplied: 0,
            duration: Date.now() - startTime
          });

          return result;
        } catch (parseError) {
          // Return empty result on parse error
          return this.buildAuditResult([]);
        }
      }

      // Return empty result on error
      return this.buildAuditResult([]);
    }
  }

  /**
   * Automatically fix vulnerabilities
   */
  async autoFix(): Promise<SecurityFixResult[]> {
    if (!this.config.autoFixEnabled) {
      return [];
    }

    const results: SecurityFixResult[] = [];

    // Get current vulnerabilities
    const vulnerabilities = Array.from(this.currentVulnerabilities.values());

    // Filter by severity threshold
    const fixableVulns = vulnerabilities.filter(v => {
      if (!v.fixAvailable) return false;
      if (this.config.allowedVulnerabilities.includes(v.cve || v.id)) return false;
      return this.meetsThreshold(v.severity);
    });

    // Sort by severity (critical first)
    fixableVulns.sort((a, b) => this.getSeverityPriority(b.severity) - this.getSeverityPriority(a.severity));

    // Attempt to fix
    for (const vuln of fixableVulns) {
      const fixResult = await this.fixVulnerability(vuln);
      results.push(fixResult);
    }

    // Update scan history
    const lastScan = this.scanHistory[this.scanHistory.length - 1];
    if (lastScan) {
      lastScan.fixesApplied = results.filter(r => r.success).length;
    }

    return results;
  }

  /**
   * Fix a specific vulnerability
   */
  private async fixVulnerability(vuln: SecurityVulnerability): Promise<SecurityFixResult> {
    const result: SecurityFixResult = {
      vulnerability: vuln,
      success: false,
      fixed: false,
      method: 'none',
      errors: [],
      testsPassed: false
    };

    try {
      // Try automatic fix first
      const { stdout, stderr } = await execAsync(
        `npm install ${vuln.package}@${vuln.patchedVersion} --save`,
        { cwd: this.projectPath }
      );

      result.method = 'automatic';
      result.fixed = true;

      // Run tests to verify fix doesn't break anything
      const testsPassed = await this.runSecurityTests();
      result.testsPassed = testsPassed;

      if (testsPassed) {
        result.success = true;
      } else {
        result.errors.push('Tests failed after applying security fix');
        // Optionally rollback
      }

    } catch (error) {
      result.errors.push(`Failed to fix vulnerability: ${error}`);
      result.method = 'manual';
    }

    return result;
  }

  /**
   * Run tests to verify security fixes
   */
  private async runSecurityTests(): Promise<boolean> {
    try {
      await execAsync('npm test', {
        cwd: this.projectPath,
        timeout: 300000 // 5 minutes
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start continuous scanning
   */
  startContinuousScanning(): void {
    if (this.scanInterval) {
      this.stopContinuousScanning();
    }

    // Initial scan
    this.scan().then(result => {
      if (this.config.autoFixEnabled) {
        this.autoFix();
      }
    });

    // Schedule periodic scans
    const intervalMs = this.config.scanInterval * 60 * 60 * 1000;
    this.scanInterval = setInterval(async () => {
      const result = await this.scan();

      if (this.config.autoFixEnabled) {
        await this.autoFix();
      }
    }, intervalMs);
  }

  /**
   * Stop continuous scanning
   */
  stopContinuousScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = undefined;
    }
  }

  /**
   * Get current vulnerabilities
   */
  getCurrentVulnerabilities(filters?: {
    severity?: SeverityLevel;
    fixable?: boolean;
    package?: string;
  }): SecurityVulnerability[] {
    let vulns = Array.from(this.currentVulnerabilities.values());

    if (filters) {
      if (filters.severity) {
        vulns = vulns.filter(v => v.severity === filters.severity);
      }
      if (filters.fixable !== undefined) {
        vulns = vulns.filter(v => v.fixAvailable === filters.fixable);
      }
      if (filters.package) {
        vulns = vulns.filter(v => v.package === filters.package);
      }
    }

    return vulns.sort((a, b) =>
      this.getSeverityPriority(b.severity) - this.getSeverityPriority(a.severity)
    );
  }

  /**
   * Get scan history
   */
  getScanHistory(filters?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): ScanHistoryEntry[] {
    let history = [...this.scanHistory];

    if (filters) {
      if (filters.startDate) {
        history = history.filter(h => h.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        history = history.filter(h => h.timestamp <= filters.endDate!);
      }
      if (filters.limit) {
        history = history.slice(-filters.limit);
      }
    }

    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get security trends
   */
  getTrends(): {
    vulnerabilityTrend: 'improving' | 'worsening' | 'stable';
    averageFixTime: number;
    complianceTrend: 'improving' | 'declining' | 'stable';
    criticalVulnerabilities: number[];
    timestamps: Date[];
  } {
    if (this.scanHistory.length < 2) {
      return {
        vulnerabilityTrend: 'stable',
        averageFixTime: 0,
        complianceTrend: 'stable',
        criticalVulnerabilities: [],
        timestamps: []
      };
    }

    const recentScans = this.scanHistory.slice(-10);

    // Analyze vulnerability trend
    const first = recentScans[0];
    const last = recentScans[recentScans.length - 1];

    let vulnerabilityTrend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (last.result.summary.total < first.result.summary.total * 0.8) {
      vulnerabilityTrend = 'improving';
    } else if (last.result.summary.total > first.result.summary.total * 1.2) {
      vulnerabilityTrend = 'worsening';
    }

    // Calculate average fix time
    const averageFixTime = recentScans.reduce((sum, s) => sum + s.duration, 0) / recentScans.length;

    // Analyze compliance trend
    let complianceTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (last.result.complianceScore > first.result.complianceScore + 10) {
      complianceTrend = 'improving';
    } else if (last.result.complianceScore < first.result.complianceScore - 10) {
      complianceTrend = 'declining';
    }

    return {
      vulnerabilityTrend,
      averageFixTime,
      complianceTrend,
      criticalVulnerabilities: recentScans.map(s => s.result.summary.critical),
      timestamps: recentScans.map(s => s.timestamp)
    };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalScans: number;
    totalVulnerabilitiesFound: number;
    totalVulnerabilitiesFixed: number;
    averageScanDuration: number;
    currentComplianceScore: number;
    criticalVulnerabilities: number;
  } {
    const totalScans = this.scanHistory.length;
    const totalVulnerabilitiesFound = this.scanHistory.reduce(
      (sum, s) => sum + s.result.summary.total,
      0
    );
    const totalVulnerabilitiesFixed = this.scanHistory.reduce(
      (sum, s) => sum + s.fixesApplied,
      0
    );
    const averageScanDuration = totalScans > 0
      ? this.scanHistory.reduce((sum, s) => sum + s.duration, 0) / totalScans
      : 0;

    const lastScan = this.scanHistory[this.scanHistory.length - 1];
    const currentComplianceScore = lastScan?.result.complianceScore || 100;
    const criticalVulnerabilities = lastScan?.result.summary.critical || 0;

    return {
      totalScans,
      totalVulnerabilitiesFound,
      totalVulnerabilitiesFixed,
      averageScanDuration,
      currentComplianceScore,
      criticalVulnerabilities
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = {
      ...this.config,
      ...updates
    };

    // Restart scanning if interval changed
    if (updates.scanInterval && this.scanInterval) {
      this.startContinuousScanning();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Parse npm audit results
   */
  private parseAuditResults(audit: any): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    if (!audit.vulnerabilities) {
      return vulnerabilities;
    }

    for (const [packageName, vulnData] of Object.entries(audit.vulnerabilities)) {
      const data = vulnData as any;

      // Handle both old and new npm audit formats
      if (data.via && Array.isArray(data.via)) {
        for (const viaItem of data.via) {
          if (typeof viaItem === 'object' && viaItem.title) {
            vulnerabilities.push({
              id: viaItem.url || `${packageName}-${Date.now()}`,
              package: packageName,
              severity: data.severity || 'medium',
              title: viaItem.title,
              description: viaItem.title,
              affectedVersions: data.range || '*',
              patchedVersion: data.fixAvailable?.version || 'unknown',
              cve: viaItem.cve,
              cwe: viaItem.cwe,
              cvssScore: viaItem.cvss?.score,
              publishedDate: new Date(),
              exploitAvailable: false,
              fixAvailable: !!data.fixAvailable,
              recommendation: data.fixAvailable
                ? `Update to version ${data.fixAvailable.version}`
                : 'Manual review required'
            });
          }
        }
      }
    }

    return vulnerabilities;
  }

  /**
   * Build audit result
   */
  private buildAuditResult(vulnerabilities: SecurityVulnerability[]): SecurityAuditResult {
    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length
    };

    const fixable = vulnerabilities.filter(v => v.fixAvailable).length;
    const requiresManualReview = summary.total - fixable;

    // Calculate compliance score (100 - weighted severity)
    const complianceScore = Math.max(0, 100 - (
      summary.critical * 10 +
      summary.high * 5 +
      summary.medium * 2 +
      summary.low * 0.5
    ));

    return {
      timestamp: new Date(),
      vulnerabilities,
      summary,
      fixable,
      requiresManualReview,
      complianceScore: Math.round(complianceScore)
    };
  }

  /**
   * Check if severity meets threshold
   */
  private meetsThreshold(severity: SeverityLevel): boolean {
    const priorities = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };

    return priorities[severity] >= priorities[this.config.severityThreshold];
  }

  /**
   * Get severity priority
   */
  private getSeverityPriority(severity: SeverityLevel): number {
    const priorities = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    return priorities[severity];
  }
}

/**
 * Create a security scanner agent
 */
export function createSecurityScanner(
  projectPath: string,
  config?: Partial<SecurityConfig>
): SecurityScannerAgent {
  return new SecurityScannerAgent(projectPath, config);
}

/**
 * Example usage:
 *
 * ```typescript
 * import { createSecurityScanner } from './maintenance/agents/security-scanner.js';
 *
 * // Create security scanner
 * const scanner = createSecurityScanner('./my-project', {
 *   autoFixEnabled: true,
 *   severityThreshold: 'high',
 *   scanInterval: 24 // Daily scans
 * });
 *
 * // Perform security scan
 * const result = await scanner.scan();
 * console.log(`Found ${result.summary.total} vulnerabilities`);
 * console.log(`Compliance score: ${result.complianceScore}%`);
 *
 * // Auto-fix vulnerabilities
 * const fixes = await scanner.autoFix();
 * console.log(`Fixed ${fixes.filter(f => f.success).length} vulnerabilities`);
 *
 * // Start continuous monitoring
 * scanner.startContinuousScanning();
 *
 * // Get security trends
 * const trends = scanner.getTrends();
 * console.log(`Vulnerability trend: ${trends.vulnerabilityTrend}`);
 * ```
 */
