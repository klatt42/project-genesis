// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/unified-monitoring/dashboard-generator.ts
// PURPOSE: Dashboard generation and display (Task 4)
// GENESIS REF: Week 7 Task 4 - Unified Monitoring Dashboard
// WSL PATH: ~/project-genesis/agents/unified-monitoring/dashboard-generator.ts
// ================================
export class DashboardGenerator {
    config;
    constructor(config) {
        this.config = {
            refreshInterval: 60,
            metrics: ['errors', 'analytics', 'performance', 'uptime'],
            theme: 'dark',
            ...config
        };
    }
    /**
     * Generate full dashboard
     */
    generateDashboard(aggregated, projectMetrics) {
        const sections = [];
        // Header
        sections.push(this.generateHeader(aggregated));
        sections.push('');
        // Portfolio overview
        sections.push(this.generatePortfolioOverview(aggregated));
        sections.push('');
        // Metrics sections
        if (this.config.metrics.includes('errors')) {
            sections.push(this.generateErrorsSection(aggregated));
            sections.push('');
        }
        if (this.config.metrics.includes('analytics')) {
            sections.push(this.generateAnalyticsSection(aggregated));
            sections.push('');
        }
        if (this.config.metrics.includes('performance')) {
            sections.push(this.generatePerformanceSection(aggregated));
            sections.push('');
        }
        if (this.config.metrics.includes('uptime')) {
            sections.push(this.generateUptimeSection(aggregated));
            sections.push('');
        }
        // Project list
        sections.push(this.generateProjectList(projectMetrics));
        return sections.join('\n');
    }
    /**
     * Generate dashboard header
     */
    generateHeader(aggregated) {
        const width = 80;
        const title = 'Genesis Unified Monitoring Dashboard';
        const timestamp = new Date().toLocaleString();
        return this.createBox([
            this.centerText(title, width - 4),
            this.centerText(`Last Updated: ${timestamp}`, width - 4),
            '',
            this.centerText(`Overall Health: ${this.getHealthBar(aggregated.portfolioWide.overallHealth)}`, width - 4)
        ], width);
    }
    /**
     * Generate portfolio overview
     */
    generatePortfolioOverview(aggregated) {
        const lines = [];
        const pw = aggregated.portfolioWide;
        lines.push('📊 PORTFOLIO OVERVIEW');
        lines.push('─'.repeat(80));
        lines.push('');
        lines.push(`  Total Projects:     ${pw.totalProjects}`);
        lines.push(`  Healthy:            ${this.colorize(pw.healthyProjects, '✓ ' + pw.healthyProjects, 'green')}`);
        lines.push(`  Degraded:           ${this.colorize(pw.degradedProjects, '⚠ ' + pw.degradedProjects, 'yellow')}`);
        lines.push(`  Down:               ${this.colorize(pw.downProjects, '✗ ' + pw.downProjects, 'red')}`);
        lines.push('');
        lines.push(`  Overall Health:     ${pw.overallHealth}/100 ${this.getHealthBar(pw.overallHealth)}`);
        return lines.join('\n');
    }
    /**
     * Generate errors section
     */
    generateErrorsSection(aggregated) {
        const lines = [];
        const errors = aggregated.errors;
        lines.push('🐛 ERRORS & EXCEPTIONS');
        lines.push('─'.repeat(80));
        lines.push('');
        lines.push(`  Total Errors:       ${errors.totalErrors.toLocaleString()}`);
        lines.push(`  Average Rate:       ${errors.avgErrorRate} errors/min`);
        lines.push(`  Projects Affected:  ${errors.projectsWithErrors}`);
        lines.push('');
        if (errors.topErrorsByProject.length > 0) {
            lines.push('  Top Projects by Errors:');
            for (let i = 0; i < Math.min(5, errors.topErrorsByProject.length); i++) {
                const project = errors.topErrorsByProject[i];
                const bar = this.createBar(project.errorCount, Math.max(...errors.topErrorsByProject.map(p => p.errorCount)), 30);
                lines.push(`    ${(i + 1)}. ${project.projectName.padEnd(25)} ${bar} ${project.errorCount}`);
            }
        }
        return lines.join('\n');
    }
    /**
     * Generate analytics section
     */
    generateAnalyticsSection(aggregated) {
        const lines = [];
        const analytics = aggregated.analytics;
        lines.push('📈 ANALYTICS & TRAFFIC');
        lines.push('─'.repeat(80));
        lines.push('');
        lines.push(`  Total Page Views:   ${analytics.totalPageViews.toLocaleString()}`);
        lines.push(`  Unique Visitors:    ${analytics.totalVisitors.toLocaleString()}`);
        lines.push(`  Avg Bounce Rate:    ${analytics.avgBounceRate}%`);
        lines.push('');
        if (analytics.topProjects.length > 0) {
            lines.push('  Top Projects by Traffic:');
            for (let i = 0; i < Math.min(5, analytics.topProjects.length); i++) {
                const project = analytics.topProjects[i];
                const bar = this.createBar(project.pageViews, Math.max(...analytics.topProjects.map(p => p.pageViews)), 30);
                lines.push(`    ${(i + 1)}. ${project.projectName.padEnd(25)} ${bar} ${project.pageViews.toLocaleString()} views`);
            }
        }
        return lines.join('\n');
    }
    /**
     * Generate performance section
     */
    generatePerformanceSection(aggregated) {
        const lines = [];
        const perf = aggregated.performance;
        lines.push('⚡ PERFORMANCE METRICS');
        lines.push('─'.repeat(80));
        lines.push('');
        lines.push(`  Avg Performance:    ${perf.avgPerformanceScore}/100`);
        lines.push(`  Avg LCP:            ${perf.avgLCP}ms`);
        lines.push(`  Avg FID:            ${perf.avgFID}ms`);
        lines.push(`  Avg CLS:            ${perf.avgCLS}`);
        lines.push('');
        lines.push(`  Above Threshold:    ${perf.projectsAboveThreshold} projects (≥90)`);
        lines.push(`  Below Threshold:    ${perf.projectsBelowThreshold} projects (<90)`);
        return lines.join('\n');
    }
    /**
     * Generate uptime section
     */
    generateUptimeSection(aggregated) {
        const lines = [];
        const uptime = aggregated.uptime;
        lines.push('🔄 UPTIME & AVAILABILITY');
        lines.push('─'.repeat(80));
        lines.push('');
        lines.push(`  Average Uptime:     ${uptime.avgUptime}%`);
        lines.push(`  Total Incidents:    ${uptime.totalIncidents}`);
        lines.push(`  Avg Response Time:  ${uptime.avgResponseTime}ms`);
        lines.push(`  Projects Down:      ${this.colorize(uptime.projectsDown, uptime.projectsDown.toString(), uptime.projectsDown > 0 ? 'red' : 'green')}`);
        return lines.join('\n');
    }
    /**
     * Generate project list
     */
    generateProjectList(projects) {
        const lines = [];
        lines.push('📦 PROJECT STATUS');
        lines.push('─'.repeat(80));
        lines.push('');
        // Sort by health score descending
        const sorted = [...projects].sort((a, b) => b.healthScore - a.healthScore);
        for (const project of sorted) {
            const statusIcon = this.getStatusIcon(project.status);
            const healthBar = this.createBar(project.healthScore, 100, 20);
            lines.push(`  ${statusIcon} ${project.projectName.padEnd(30)} ${healthBar} ${project.healthScore}/100`);
            lines.push(`     Errors: ${project.errors.totalErrors} | Uptime: ${project.uptime.uptimePercentage}% | Perf: ${project.performance.performanceScore}`);
            lines.push('');
        }
        return lines.join('\n');
    }
    /**
     * Create a box around text
     */
    createBox(lines, width) {
        const topBorder = '╔' + '═'.repeat(width - 2) + '╗';
        const bottomBorder = '╚' + '═'.repeat(width - 2) + '╝';
        const boxLines = [topBorder];
        for (const line of lines) {
            const padding = width - 4 - line.length;
            boxLines.push('║ ' + line + ' '.repeat(Math.max(0, padding)) + ' ║');
        }
        boxLines.push(bottomBorder);
        return boxLines.join('\n');
    }
    /**
     * Center text
     */
    centerText(text, width) {
        const padding = Math.max(0, width - text.length);
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
    }
    /**
     * Create a horizontal bar
     */
    createBar(value, max, width) {
        const percentage = max > 0 ? value / max : 0;
        const filled = Math.round(percentage * width);
        const empty = width - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
    /**
     * Get health bar with color
     */
    getHealthBar(health) {
        const bar = this.createBar(health, 100, 20);
        if (health >= 80)
            return this.colorize(health, bar, 'green');
        if (health >= 50)
            return this.colorize(health, bar, 'yellow');
        return this.colorize(health, bar, 'red');
    }
    /**
     * Get status icon
     */
    getStatusIcon(status) {
        switch (status) {
            case 'healthy': return '✓';
            case 'degraded': return '⚠';
            case 'down': return '✗';
            default: return '?';
        }
    }
    /**
     * Colorize text (placeholder - terminal colors would be added here)
     */
    colorize(value, text, color) {
        // In a real implementation, this would use terminal color codes
        // For now, just return the text
        return text;
    }
    /**
     * Generate compact summary
     */
    generateCompactSummary(aggregated) {
        const lines = [];
        lines.push('Genesis Portfolio Status:');
        lines.push(`  Health: ${aggregated.portfolioWide.overallHealth}/100 | ` +
            `Projects: ${aggregated.portfolioWide.totalProjects} | ` +
            `Healthy: ${aggregated.portfolioWide.healthyProjects} | ` +
            `Down: ${aggregated.portfolioWide.downProjects}`);
        lines.push(`  Errors: ${aggregated.errors.totalErrors} | ` +
            `Views: ${aggregated.analytics.totalPageViews.toLocaleString()} | ` +
            `Uptime: ${aggregated.uptime.avgUptime}%`);
        return lines.join('\n');
    }
    /**
     * Export dashboard as JSON
     */
    exportAsJson(aggregated, projects) {
        return JSON.stringify({
            aggregated,
            projects,
            generated: new Date().toISOString()
        }, null, 2);
    }
}
//# sourceMappingURL=dashboard-generator.js.map