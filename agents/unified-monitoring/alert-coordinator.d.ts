import type { Alert, AlertRule, ProjectMetrics } from './types.js';
export declare class AlertCoordinator {
    private alertsPath;
    private rulesPath;
    private alerts;
    private rules;
    constructor();
    /**
     * Initialize alert coordinator
     */
    initialize(): Promise<void>;
    /**
     * Check metrics against alert rules
     */
    checkAlerts(metrics: ProjectMetrics[]): Promise<Alert[]>;
    /**
     * Evaluate a rule against metrics
     */
    private evaluateRule;
    /**
     * Check if value meets threshold condition
     */
    private meetsThreshold;
    /**
     * Create a new alert
     */
    createAlert(alert: Alert): Promise<void>;
    /**
     * Resolve an alert
     */
    resolveAlert(alertId: string): Promise<void>;
    /**
     * Send alert through channels
     */
    private sendAlert;
    /**
     * Send to Slack
     */
    private sendToSlack;
    /**
     * Send to Discord
     */
    private sendToDiscord;
    /**
     * Send to email
     */
    private sendToEmail;
    /**
     * Send to webhook
     */
    private sendToWebhook;
    /**
     * Add alert rule
     */
    addRule(rule: AlertRule): Promise<void>;
    /**
     * Remove alert rule
     */
    removeRule(ruleId: string): Promise<void>;
    /**
     * Enable/disable rule
     */
    toggleRule(ruleId: string, enabled: boolean): Promise<void>;
    /**
     * Get all alerts
     */
    getAlerts(resolved?: boolean): Alert[];
    /**
     * Get alerts for project
     */
    getProjectAlerts(projectId: string, resolved?: boolean): Alert[];
    /**
     * Get all rules
     */
    getRules(): AlertRule[];
    /**
     * Create default alert rules
     */
    private createDefaultRules;
    /**
     * Generate alert ID
     */
    private generateAlertId;
    /**
     * Load alerts from disk
     */
    private loadAlerts;
    /**
     * Save alerts to disk
     */
    private saveAlerts;
    /**
     * Load rules from disk
     */
    private loadRules;
    /**
     * Save rules to disk
     */
    private saveRules;
}
//# sourceMappingURL=alert-coordinator.d.ts.map