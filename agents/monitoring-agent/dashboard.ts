// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/monitoring-agent/dashboard.ts
// PURPOSE: Status page and dashboard generator
// GENESIS REF: Week 6 Task 3 - Monitoring Agent
// WSL PATH: ~/project-genesis/agents/monitoring-agent/dashboard.ts
// ================================

import { DashboardStatus, ServiceStatus, Incident, CodeSnippet } from './types.js';

export class DashboardService {
  generateStatusPageCode(): CodeSnippet[] {
    return [
      this.generateStatusPageComponent(),
      this.generateStatusPageAPI(),
      this.generateStatusPageStyles(),
    ];
  }

  private generateStatusPageComponent(): CodeSnippet {
    const code = `// app/status/page.tsx
'use client';

import { useEffect, useState } from 'react';
import './status.css';

interface StatusData {
  overall: 'operational' | 'degraded' | 'down';
  services: Array<{
    name: string;
    status: 'operational' | 'degraded' | 'down';
    responseTime?: number;
    lastChecked: string;
  }>;
  uptime: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  incidents: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function fetchStatus() {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="status-page">
        <div className="status-header">
          <h1>System Status</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="status-page">
        <div className="status-header">
          <h1>System Status</h1>
          <p>Unable to load status</p>
        </div>
      </div>
    );
  }

  const getOverallStatusMessage = () => {
    switch (status.overall) {
      case 'operational':
        return 'All systems operational';
      case 'degraded':
        return 'Some systems experiencing issues';
      case 'down':
        return 'Systems are down';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'down':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <div className="status-page">
      {/* Header */}
      <div className="status-header">
        <h1>System Status</h1>
        <div className={\`status-badge status-\${status.overall}\`}>
          {getStatusIcon(status.overall)} {getOverallStatusMessage()}
        </div>
        <p className="last-updated">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Active Incidents */}
      {status.incidents.length > 0 && (
        <div className="incidents-section">
          <h2>Active Incidents</h2>
          {status.incidents.map(incident => (
            <div key={incident.id} className={\`incident incident-\${incident.severity}\`}>
              <div className="incident-header">
                <h3>{incident.title}</h3>
                <span className="incident-status">{incident.status}</span>
              </div>
              <p className="incident-description">{incident.description}</p>
              <p className="incident-time">
                Started: {new Date(incident.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Services Status */}
      <div className="services-section">
        <h2>Services</h2>
        <div className="services-grid">
          {status.services.map(service => (
            <div key={service.name} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
                <span className={\`service-status status-\${service.status}\`}>
                  {getStatusIcon(service.status)}
                </span>
              </div>
              {service.responseTime && (
                <p className="service-metric">
                  Response time: {service.responseTime}ms
                </p>
              )}
              <p className="service-updated">
                Checked: {new Date(service.lastChecked).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Uptime Stats */}
      <div className="uptime-section">
        <h2>Uptime</h2>
        <div className="uptime-grid">
          <div className="uptime-card">
            <div className="uptime-value">{status.uptime.last24h.toFixed(2)}%</div>
            <div className="uptime-label">Last 24 hours</div>
          </div>
          <div className="uptime-card">
            <div className="uptime-value">{status.uptime.last7d.toFixed(2)}%</div>
            <div className="uptime-label">Last 7 days</div>
          </div>
          <div className="uptime-card">
            <div className="uptime-value">{status.uptime.last30d.toFixed(2)}%</div>
            <div className="uptime-label">Last 30 days</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="status-footer">
        <p>
          Subscribe to updates • View incident history • Contact support
        </p>
      </div>
    </div>
  );
}
`;

    return {
      file: 'app/status/page.tsx',
      code,
      description: 'Status page React component'
    };
  }

  private generateStatusPageAPI(): CodeSnippet {
    const code = `// app/api/status/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch status from your monitoring system
    const status = await getSystemStatus();

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({
      overall: 'down',
      services: [],
      uptime: { last24h: 0, last7d: 0, last30d: 0 },
      incidents: [],
    }, { status: 500 });
  }
}

async function getSystemStatus() {
  // Example implementation
  // Replace with your actual monitoring data

  const services = await checkServices();
  const uptime = await getUptimeStats();
  const incidents = await getActiveIncidents();

  // Determine overall status
  const hasDown = services.some(s => s.status === 'down');
  const hasDegraded = services.some(s => s.status === 'degraded');

  const overall = hasDown ? 'down' : hasDegraded ? 'degraded' : 'operational';

  return {
    overall,
    services,
    uptime,
    incidents,
  };
}

async function checkServices() {
  // Check each service
  const services = [
    { name: 'API', url: '/api/health' },
    { name: 'Database', url: '/api/health/db' },
    { name: 'Authentication', url: '/api/health/auth' },
  ];

  return Promise.all(
    services.map(async (service) => {
      try {
        const start = Date.now();
        const response = await fetch(\`\${process.env.NEXT_PUBLIC_APP_URL}\${service.url}\`);
        const responseTime = Date.now() - start;

        return {
          name: service.name,
          status: response.ok ? 'operational' : 'down',
          responseTime,
          lastChecked: new Date().toISOString(),
        };
      } catch {
        return {
          name: service.name,
          status: 'down' as const,
          lastChecked: new Date().toISOString(),
        };
      }
    })
  );
}

async function getUptimeStats() {
  // Calculate uptime from your monitoring data
  // This is a simplified example

  return {
    last24h: 99.95,
    last7d: 99.90,
    last30d: 99.85,
  };
}

async function getActiveIncidents() {
  // Fetch active incidents from your database or monitoring system
  // This is a simplified example

  return [];
}

// Export reusable function
export { getSystemStatus };
`;

    return {
      file: 'app/api/status/route.ts',
      code,
      description: 'Status API endpoint'
    };
  }

  private generateStatusPageStyles(): CodeSnippet {
    const code = `/* app/status/status.css */
.status-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.status-header {
  text-align: center;
  margin-bottom: 3rem;
}

.status-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.status-badge {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.status-badge.status-operational {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-degraded {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-down {
  background: #fee2e2;
  color: #991b1b;
}

.last-updated {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Incidents */
.incidents-section {
  margin-bottom: 3rem;
}

.incidents-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.incident {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.incident-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.incident-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.incident-status {
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.incident-description {
  color: #4b5563;
  margin: 0.5rem 0;
}

.incident-time {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
}

/* Services */
.services-section {
  margin-bottom: 3rem;
}

.services-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.service-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.service-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.service-status {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
}

.service-status.status-operational {
  background: #d1fae5;
  color: #065f46;
}

.service-status.status-degraded {
  background: #fef3c7;
  color: #92400e;
}

.service-status.status-down {
  background: #fee2e2;
  color: #991b1b;
}

.service-metric {
  color: #4b5563;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.service-updated {
  color: #9ca3af;
  font-size: 0.75rem;
  margin: 0;
}

/* Uptime */
.uptime-section {
  margin-bottom: 3rem;
}

.uptime-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.uptime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.uptime-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.uptime-value {
  font-size: 2rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 0.5rem;
}

.uptime-label {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Footer */
.status-footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .status-page {
    padding: 1rem;
  }

  .status-header h1 {
    font-size: 2rem;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .uptime-grid {
    grid-template-columns: 1fr;
  }
}
`;

    return {
      file: 'app/status/status.css',
      code,
      description: 'Status page styles'
    };
  }

  /**
   * Get current dashboard status
   */
  async getCurrentStatus(): Promise<DashboardStatus> {
    // This would fetch real data from your monitoring systems
    return {
      overall: 'operational',
      services: [
        {
          name: 'API',
          status: 'operational',
          responseTime: 45,
          lastChecked: new Date(),
        },
        {
          name: 'Database',
          status: 'operational',
          responseTime: 12,
          lastChecked: new Date(),
        },
      ],
      uptime: {
        last24h: 99.95,
        last7d: 99.90,
        last30d: 99.85,
      },
      incidents: [],
    };
  }

  /**
   * Create incident
   */
  async createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    const newIncident: Incident = {
      ...incident,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store incident in database
    console.log('Created incident:', newIncident);

    return newIncident;
  }

  /**
   * Update incident
   */
  async updateIncident(id: string, updates: Partial<Incident>): Promise<void> {
    console.log('Updated incident:', id, updates);
  }
}
