// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/portfolio-manager/portfolio-dashboard.ts
// PURPOSE: Portfolio dashboard display
// GENESIS REF: Week 7 Task 1 - Project Registry & Portfolio Manager
// WSL PATH: ~/project-genesis/agents/portfolio-manager/portfolio-dashboard.ts
// ================================
export class PortfolioDashboard {
    /**
     * Display portfolio overview
     */
    displayOverview(stats, health) {
        console.log(this.createBox('Genesis Project Portfolio', 70));
        console.log();
        // Summary line
        const summaryLine = `Total Projects: ${stats.totalProjects}        Healthy: ${health.healthy}        Degraded: ${health.degraded}        Down: ${health.down}`;
        console.log(this.centerText(summaryLine, 70));
        // Deployment stats
        const deploymentLine = `This Week: ${stats.deploymentsThisWeek} deployments      Success Rate: ${stats.deploymentSuccessRate.toFixed(1)}%`;
        console.log(this.centerText(deploymentLine, 70));
        console.log(this.createSeparator(70));
    }
    /**
     * Display project list
     */
    displayProjectList(projects) {
        if (projects.length === 0) {
            console.log('\n  No projects found. Run "genesis portfolio --register" to add projects.\n');
            return;
        }
        console.log();
        console.log(this.formatRow(['PROJECT', 'TYPE', 'STATUS', 'LAST DEPLOYED'], 70));
        console.log(this.createSeparator(70));
        projects.forEach(project => {
            const statusEmoji = this.getStatusEmoji(project.status);
            const lastDeployed = project.lastDeployedAt
                ? this.formatTimeAgo(project.lastDeployedAt)
                : 'Never';
            console.log(this.formatRow([
                `${statusEmoji} ${project.name}`,
                project.type,
                project.status,
                lastDeployed
            ], 70));
        });
        console.log();
    }
    /**
     * Display detailed statistics
     */
    displayStatistics(stats) {
        console.log('\n' + this.createBox('Portfolio Statistics', 70));
        console.log();
        // Projects by type
        console.log('📊 Projects by Type:');
        Object.entries(stats.projectsByType)
            .sort((a, b) => b[1] - a[1])
            .forEach(([type, count]) => {
            const bar = this.createBar(count, stats.totalProjects, 30);
            console.log(`  ${type.padEnd(15)} ${bar} ${count}`);
        });
        console.log();
        // Deployment statistics
        console.log('🚀 Deployment Statistics:');
        console.log(`  Total deployments:     ${stats.totalDeployments}`);
        console.log(`  This week:             ${stats.deploymentsThisWeek}`);
        console.log(`  This month:            ${stats.deploymentsThisMonth}`);
        console.log(`  Success rate:          ${stats.deploymentSuccessRate.toFixed(1)}%`);
        console.log(`  Avg duration:          ${this.formatDuration(stats.averageDeploymentDuration)}`);
        console.log();
        // Health statistics
        console.log('❤️  Health Statistics:');
        console.log(`  Average uptime:        ${stats.averageUptime.toFixed(1)}%`);
        console.log(`  Average error rate:    ${stats.averageErrorRate.toFixed(2)}%`);
        console.log(`  Healthy:               ${stats.healthyProjects}`);
        console.log(`  Degraded:              ${stats.degradedProjects}`);
        console.log(`  Down:                  ${stats.downProjects}`);
        console.log();
        // Technology distribution
        console.log('🛠️  Technology Stack:');
        console.log('  Frameworks:');
        Object.entries(stats.frameworkDistribution)
            .sort((a, b) => b[1] - a[1])
            .forEach(([framework, count]) => {
            const bar = this.createBar(count, stats.totalProjects, 20);
            console.log(`    ${framework.padEnd(12)} ${bar} ${count}`);
        });
        console.log('  Platforms:');
        Object.entries(stats.deploymentPlatforms)
            .sort((a, b) => b[1] - a[1])
            .forEach(([platform, count]) => {
            const bar = this.createBar(count, stats.totalProjects, 20);
            console.log(`    ${platform.padEnd(12)} ${bar} ${count}`);
        });
        console.log();
        // Most used patterns
        if (stats.mostUsedPatterns.length > 0) {
            console.log('✨ Most Used Patterns:');
            stats.mostUsedPatterns.slice(0, 5).forEach(({ pattern, count }) => {
                console.log(`  ${pattern.padEnd(30)} ${count} projects`);
            });
            console.log();
        }
        // Most used components
        if (stats.mostUsedComponents.length > 0) {
            console.log('🧩 Most Used Components:');
            stats.mostUsedComponents.slice(0, 5).forEach(({ component, count }) => {
                console.log(`  ${component.padEnd(30)} ${count} projects`);
            });
            console.log();
        }
        console.log(this.createSeparator(70));
    }
    /**
     * Display health report
     */
    displayHealth(health) {
        console.log('\n' + this.createBox('Portfolio Health Report', 70));
        console.log();
        // Overall score
        const scoreColor = health.overallScore >= 80 ? '🟢' : health.overallScore >= 50 ? '🟡' : '🔴';
        console.log(`${scoreColor} Overall Health Score: ${health.overallScore}/100`);
        console.log();
        // Status breakdown
        console.log('Status Breakdown:');
        console.log(`  ✓ Healthy:   ${health.healthy}`);
        console.log(`  ⚠ Degraded:  ${health.degraded}`);
        console.log(`  ✗ Down:      ${health.down}`);
        console.log(`  ? Unknown:   ${health.unknown}`);
        console.log();
        // Issues
        if (health.issues.length > 0) {
            console.log('Issues:');
            health.issues.forEach(issue => {
                const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : 'ℹ️';
                console.log(`  ${emoji} ${issue.project}: ${issue.message}`);
            });
            console.log();
        }
        else {
            console.log('✅ No issues detected!');
            console.log();
        }
        console.log(this.createSeparator(70));
    }
    /**
     * Display project details
     */
    displayProjectDetails(project) {
        console.log('\n' + this.createBox(`Project: ${project.name}`, 70));
        console.log();
        console.log('📋 Basic Information:');
        console.log(`  ID:              ${project.id}`);
        console.log(`  Name:            ${project.name}`);
        console.log(`  Type:            ${project.type}`);
        console.log(`  Status:          ${this.getStatusEmoji(project.status)} ${project.status}`);
        console.log(`  Path:            ${project.path}`);
        console.log(`  Version:         ${project.currentVersion}`);
        console.log(`  Genesis:         ${project.genesisVersion}`);
        console.log();
        console.log('🛠️  Technology Stack:');
        console.log(`  Framework:       ${project.stack.framework}`);
        console.log(`  Language:        ${project.stack.language}`);
        console.log(`  Database:        ${project.stack.database || 'None'}`);
        console.log(`  Deployment:      ${project.stack.deployment}`);
        console.log(`  CI/CD:           ${project.stack.cicd || 'None'}`);
        console.log(`  Monitoring:      ${project.stack.monitoring.join(', ') || 'None'}`);
        console.log();
        console.log('❤️  Health Metrics:');
        console.log(`  Uptime:          ${project.uptime.toFixed(1)}%`);
        console.log(`  Error Rate:      ${project.errorRate.toFixed(2)}%`);
        console.log();
        if (project.deployments.length > 0) {
            console.log('🚀 Recent Deployments:');
            project.deployments.slice(0, 5).forEach(deployment => {
                console.log(`  ${deployment.environment.padEnd(12)} ${deployment.url}`);
                console.log(`    Deployed: ${this.formatTimeAgo(deployment.deployedAt)} (${deployment.status})`);
            });
            console.log();
        }
        if (project.patterns.length > 0) {
            console.log('✨ Patterns:');
            project.patterns.slice(0, 10).forEach(pattern => {
                console.log(`  - ${pattern}`);
            });
            console.log();
        }
        if (project.components.length > 0) {
            console.log('🧩 Components:');
            project.components.slice(0, 10).forEach(component => {
                console.log(`  - ${component}`);
            });
            console.log();
        }
        console.log('📅 Dates:');
        console.log(`  Created:         ${project.createdAt.toLocaleString()}`);
        console.log(`  Updated:         ${project.updatedAt.toLocaleString()}`);
        if (project.lastDeployedAt) {
            console.log(`  Last Deployed:   ${project.lastDeployedAt.toLocaleString()}`);
        }
        console.log();
        console.log(this.createSeparator(70));
    }
    // Helper methods
    createBox(title, width) {
        const padding = Math.max(0, width - title.length - 4);
        const leftPad = Math.floor(padding / 2);
        const rightPad = Math.ceil(padding / 2);
        const top = '╔' + '═'.repeat(width - 2) + '╗';
        const middle = '║ ' + ' '.repeat(leftPad) + title + ' '.repeat(rightPad) + ' ║';
        const bottom = '╚' + '═'.repeat(width - 2) + '╝';
        return `${top}\n${middle}\n${bottom}`;
    }
    createSeparator(width) {
        return '─'.repeat(width);
    }
    centerText(text, width) {
        const padding = Math.max(0, width - text.length);
        const leftPad = Math.floor(padding / 2);
        return ' '.repeat(leftPad) + text;
    }
    formatRow(columns, width) {
        const colWidth = Math.floor(width / columns.length);
        return columns.map(col => col.padEnd(colWidth).substring(0, colWidth)).join('');
    }
    getStatusEmoji(status) {
        const emojis = {
            healthy: '✓',
            degraded: '⚠',
            down: '✗',
            unknown: '?'
        };
        return emojis[status] || '?';
    }
    formatTimeAgo(date) {
        const now = Date.now();
        const diff = now - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        if (weeks > 0)
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        if (days > 0)
            return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0)
            return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }
    formatDuration(ms) {
        if (ms < 1000)
            return `${Math.round(ms)}ms`;
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60)
            return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ${seconds % 60}s`;
    }
    createBar(value, max, width) {
        const filled = Math.round((value / max) * width);
        const empty = width - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }
}
//# sourceMappingURL=portfolio-dashboard.js.map