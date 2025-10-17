// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/unified-monitoring/alert-coordinator.ts
// PURPOSE: Alert coordination and routing (Task 4)
// GENESIS REF: Week 7 Task 4 - Unified Monitoring Dashboard
// WSL PATH: ~/project-genesis/agents/unified-monitoring/alert-coordinator.ts
// ================================
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
export class AlertCoordinator {
    alertsPath;
    rulesPath;
    alerts = new Map();
    rules = new Map();
    constructor() {
        const basePath = path.join(process.env.HOME || '', '.genesis', 'portfolio', 'monitoring');
        this.alertsPath = path.join(basePath, 'alerts.json');
        this.rulesPath = path.join(basePath, 'alert-rules.json');
    }
    /**
     * Initialize alert coordinator
     */
    async initialize() {
        const baseDir = path.dirname(this.alertsPath);
        await fs.mkdir(baseDir, { recursive: true });
        // Load existing alerts and rules
        if (existsSync(this.alertsPath)) {
            await this.loadAlerts();
        }
        if (existsSync(this.rulesPath)) {
            await this.loadRules();
        }
        else {
            // Create default rules
            await this.createDefaultRules();
        }
    }
    /**
     * Check metrics against alert rules
     */
    async checkAlerts(metrics) {
        const newAlerts = [];
        for (const metric of metrics) {
            for (const rule of this.rules.values()) {
                if (!rule.enabled)
                    continue;
                const alert = this.evaluateRule(rule, metric);
                if (alert) {
                    // Check if this alert already exists (not resolved)
                    const existingAlert = Array.from(this.alerts.values()).find(a => a.projectId === metric.projectId &&
                        a.type === rule.type &&
                        !a.resolved);
                    if (!existingAlert) {
                        await this.createAlert(alert);
                        newAlerts.push(alert);
                        await this.sendAlert(alert, rule.channels);
                    }
                }
            }
        }
        return newAlerts;
    }
    /**
     * Evaluate a rule against metrics
     */
    evaluateRule(rule, metrics) {
        let value = 0;
        let message = '';
        let severity = 'info';
        // Extract value based on metric type
        switch (rule.type) {
            case 'error':
                if (rule.condition.metric === 'errorRate') {
                    value = metrics.errors.errorRate;
                    message = `Error rate is ${value} errors/min`;
                }
                else if (rule.condition.metric === 'totalErrors') {
                    value = metrics.errors.totalErrors;
                    message = `Total errors: ${value}`;
                }
                severity = value > rule.condition.threshold * 2 ? 'critical' : 'warning';
                break;
            case 'performance':
                if (rule.condition.metric === 'performanceScore') {
                    value = metrics.performance.performanceScore;
                    message = `Performance score is ${value}/100`;
                }
                else if (rule.condition.metric === 'lcp') {
                    value = metrics.performance.lcp;
                    message = `LCP is ${value}ms`;
                }
                severity = this.meetsThreshold(value, rule.condition) ? 'warning' : 'info';
                break;
            case 'uptime':
                if (rule.condition.metric === 'uptimePercentage') {
                    value = metrics.uptime.uptimePercentage;
                    message = `Uptime is ${value}%`;
                }
                else if (rule.condition.metric === 'responseTime') {
                    value = metrics.uptime.responseTime;
                    message = `Response time is ${value}ms`;
                }
                severity = value < 95 ? 'critical' : 'warning';
                break;
            case 'analytics':
                if (rule.condition.metric === 'bounceRate') {
                    value = metrics.analytics.bounceRate;
                    message = `Bounce rate is ${value}%`;
                }
                severity = 'info';
                break;
        }
        // Check if condition is met
        if (this.meetsThreshold(value, rule.condition)) {
            return {
                id: this.generateAlertId(),
                projectId: metrics.projectId,
                projectName: metrics.projectName,
                type: rule.type,
                severity,
                message: `${rule.name}: ${message}`,
                timestamp: new Date(),
                resolved: false
            };
        }
        return null;
    }
    /**
     * Check if value meets threshold condition
     */
    meetsThreshold(value, condition) {
        switch (condition.operator) {
            case '>': return value > condition.threshold;
            case '<': return value < condition.threshold;
            case '>=': return value >= condition.threshold;
            case '<=': return value <= condition.threshold;
            case '=': return value === condition.threshold;
            default: return false;
        }
    }
    /**
     * Create a new alert
     */
    async createAlert(alert) {
        this.alerts.set(alert.id, alert);
        await this.saveAlerts();
    }
    /**
     * Resolve an alert
     */
    async resolveAlert(alertId) {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = new Date();
            await this.saveAlerts();
        }
    }
    /**
     * Send alert through channels
     */
    async sendAlert(alert, channels) {
        for (const channel of channels) {
            try {
                switch (channel) {
                    case 'slack':
                        await this.sendToSlack(alert);
                        break;
                    case 'discord':
                        await this.sendToDiscord(alert);
                        break;
                    case 'email':
                        await this.sendToEmail(alert);
                        break;
                    case 'webhook':
                        await this.sendToWebhook(alert);
                        break;
                }
            }
            catch (error) {
                console.error(`Failed to send alert to ${channel}:`, error);
            }
        }
    }
    /**
     * Send to Slack
     */
    async sendToSlack(alert) {
        // In a real implementation, this would use Slack webhook
        console.log(`[Slack] ${alert.severity.toUpperCase()}: ${alert.message}`);
    }
    /**
     * Send to Discord
     */
    async sendToDiscord(alert) {
        // In a real implementation, this would use Discord webhook
        console.log(`[Discord] ${alert.severity.toUpperCase()}: ${alert.message}`);
    }
    /**
     * Send to email
     */
    async sendToEmail(alert) {
        // In a real implementation, this would send email
        console.log(`[Email] ${alert.severity.toUpperCase()}: ${alert.message}`);
    }
    /**
     * Send to webhook
     */
    async sendToWebhook(alert) {
        // In a real implementation, this would POST to webhook
        console.log(`[Webhook] ${alert.severity.toUpperCase()}: ${alert.message}`);
    }
    /**
     * Add alert rule
     */
    async addRule(rule) {
        this.rules.set(rule.id, rule);
        await this.saveRules();
    }
    /**
     * Remove alert rule
     */
    async removeRule(ruleId) {
        this.rules.delete(ruleId);
        await this.saveRules();
    }
    /**
     * Enable/disable rule
     */
    async toggleRule(ruleId, enabled) {
        const rule = this.rules.get(ruleId);
        if (rule) {
            rule.enabled = enabled;
            await this.saveRules();
        }
    }
    /**
     * Get all alerts
     */
    getAlerts(resolved) {
        const allAlerts = Array.from(this.alerts.values());
        if (resolved !== undefined) {
            return allAlerts.filter(a => a.resolved === resolved);
        }
        return allAlerts;
    }
    /**
     * Get alerts for project
     */
    getProjectAlerts(projectId, resolved) {
        return this.getAlerts(resolved).filter(a => a.projectId === projectId);
    }
    /**
     * Get all rules
     */
    getRules() {
        return Array.from(this.rules.values());
    }
    /**
     * Create default alert rules
     */
    async createDefaultRules() {
        const defaultRules = [
            {
                id: 'high-error-rate',
                name: 'High Error Rate',
                type: 'error',
                condition: {
                    metric: 'errorRate',
                    operator: '>',
                    threshold: 10
                },
                channels: ['slack', 'email'],
                enabled: true
            },
            {
                id: 'low-uptime',
                name: 'Low Uptime',
                type: 'uptime',
                condition: {
                    metric: 'uptimePercentage',
                    operator: '<',
                    threshold: 99
                },
                channels: ['slack', 'email'],
                enabled: true
            },
            {
                id: 'poor-performance',
                name: 'Poor Performance Score',
                type: 'performance',
                condition: {
                    metric: 'performanceScore',
                    operator: '<',
                    threshold: 80
                },
                channels: ['slack'],
                enabled: true
            },
            {
                id: 'high-bounce-rate',
                name: 'High Bounce Rate',
                type: 'analytics',
                condition: {
                    metric: 'bounceRate',
                    operator: '>',
                    threshold: 70
                },
                channels: ['email'],
                enabled: false
            }
        ];
        for (const rule of defaultRules) {
            this.rules.set(rule.id, rule);
        }
        await this.saveRules();
    }
    /**
     * Generate alert ID
     */
    generateAlertId() {
        return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Load alerts from disk
     */
    async loadAlerts() {
        try {
            const data = await fs.readFile(this.alertsPath, 'utf-8');
            const parsed = JSON.parse(data);
            this.alerts = new Map(parsed.alerts.map((a) => [
                a.id,
                {
                    ...a,
                    timestamp: new Date(a.timestamp),
                    resolvedAt: a.resolvedAt ? new Date(a.resolvedAt) : undefined
                }
            ]));
        }
        catch (error) {
            console.error('Error loading alerts:', error);
        }
    }
    /**
     * Save alerts to disk
     */
    async saveAlerts() {
        const data = {
            version: '1.0.0',
            updatedAt: new Date().toISOString(),
            alerts: Array.from(this.alerts.values())
        };
        await fs.writeFile(this.alertsPath, JSON.stringify(data, null, 2), 'utf-8');
    }
    /**
     * Load rules from disk
     */
    async loadRules() {
        try {
            const data = await fs.readFile(this.rulesPath, 'utf-8');
            const parsed = JSON.parse(data);
            this.rules = new Map(parsed.rules.map((r) => [r.id, r]));
        }
        catch (error) {
            console.error('Error loading alert rules:', error);
        }
    }
    /**
     * Save rules to disk
     */
    async saveRules() {
        const data = {
            version: '1.0.0',
            updatedAt: new Date().toISOString(),
            rules: Array.from(this.rules.values())
        };
        await fs.writeFile(this.rulesPath, JSON.stringify(data, null, 2), 'utf-8');
    }
}
//# sourceMappingURL=alert-coordinator.js.map