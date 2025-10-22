// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/deployment-agent/health-checker.ts
// PURPOSE: Post-deployment health check system
// GENESIS REF: Week 6 Task 1 - Deployment Agent
// WSL PATH: ~/project-genesis/agents/deployment-agent/health-checker.ts
// ================================

import {
  HealthCheckResult,
  HealthCheck,
  DeploymentError,
  DeploymentErrorCode
} from './types.js';

export class HealthChecker {
  private timeout: number;
  private maxRetries: number;

  constructor(timeout: number = 30000, maxRetries: number = 3) {
    this.timeout = timeout;
    this.maxRetries = maxRetries;
  }

  /**
   * Run health checks on deployed application
   */
  async check(url: string): Promise<HealthCheckResult> {
    console.log('🏥 Running health checks...\n');

    const checks: HealthCheck[] = [];

    // Run all health checks
    checks.push(await this.checkHomePage(url));
    checks.push(await this.checkResponseTime(url));
    checks.push(await this.checkSSL(url));

    // Optional: Check API health endpoint if it exists
    const apiHealthCheck = await this.checkApiHealth(url);
    if (apiHealthCheck) {
      checks.push(apiHealthCheck);
    }

    // Determine overall status
    const failedChecks = checks.filter(c => !c.passed);
    const passedChecks = checks.filter(c => c.passed);

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks.length === 0) {
      overallStatus = 'healthy';
    } else if (passedChecks.length > failedChecks.length) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    const success = overallStatus === 'healthy' || overallStatus === 'degraded';

    // Log results
    console.log('Health Check Results:');
    for (const check of checks) {
      const icon = check.passed ? '✅' : '❌';
      console.log(`  ${icon} ${check.name} (${check.duration}ms)`);
      if (check.error) {
        console.log(`     Error: ${check.error}`);
      }
    }
    console.log();

    return {
      success,
      checks,
      overallStatus,
      timestamp: new Date()
    };
  }

  private async checkHomePage(url: string): Promise<HealthCheck> {
    const startTime = Date.now();
    const checkName = 'Homepage load';

    try {
      const response = await this.fetchWithTimeout(url, this.timeout);

      if (response.status >= 200 && response.status < 400) {
        return {
          name: checkName,
          passed: true,
          duration: Date.now() - startTime
        };
      }

      return {
        name: checkName,
        passed: false,
        duration: Date.now() - startTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      };

    } catch (error) {
      return {
        name: checkName,
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkResponseTime(url: string): Promise<HealthCheck> {
    const startTime = Date.now();
    const checkName = 'Response time';
    const maxResponseTime = 3000; // 3 seconds

    try {
      await this.fetchWithTimeout(url, this.timeout);
      const duration = Date.now() - startTime;

      if (duration <= maxResponseTime) {
        return {
          name: checkName,
          passed: true,
          duration
        };
      }

      return {
        name: checkName,
        passed: false,
        duration,
        error: `Response time ${duration}ms exceeds threshold of ${maxResponseTime}ms`
      };

    } catch (error) {
      return {
        name: checkName,
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkSSL(url: string): Promise<HealthCheck> {
    const startTime = Date.now();
    const checkName = 'SSL certificate';

    try {
      // Skip SSL check for non-HTTPS URLs
      if (!url.startsWith('https://')) {
        return {
          name: checkName,
          passed: true,
          duration: Date.now() - startTime
        };
      }

      // Fetch will fail if SSL is invalid
      await this.fetchWithTimeout(url, this.timeout);

      return {
        name: checkName,
        passed: true,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        name: checkName,
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'SSL validation failed'
      };
    }
  }

  private async checkApiHealth(url: string): Promise<HealthCheck | null> {
    const startTime = Date.now();
    const checkName = 'API health endpoint';

    // Try common health check endpoints
    const healthEndpoints = [
      '/api/health',
      '/health',
      '/api/status',
      '/status'
    ];

    for (const endpoint of healthEndpoints) {
      const healthUrl = new URL(endpoint, url).toString();

      try {
        const response = await this.fetchWithTimeout(healthUrl, 5000);

        if (response.status === 200) {
          return {
            name: checkName,
            passed: true,
            duration: Date.now() - startTime
          };
        }
      } catch {
        // Endpoint doesn't exist, try next one
        continue;
      }
    }

    // No health endpoint found - that's okay
    return null;
  }

  /**
   * Run smoke tests (critical user flows)
   */
  async runSmokeTests(url: string, tests: SmokeTest[]): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    for (const test of tests) {
      const startTime = Date.now();

      try {
        const testUrl = new URL(test.path, url).toString();
        const response = await this.fetchWithTimeout(testUrl, this.timeout);

        const passed = test.expectedStatus
          ? response.status === test.expectedStatus
          : response.status >= 200 && response.status < 400;

        checks.push({
          name: test.name,
          passed,
          duration: Date.now() - startTime,
          error: passed ? undefined : `Expected status ${test.expectedStatus}, got ${response.status}`
        });

      } catch (error) {
        checks.push({
          name: test.name,
          passed: false,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Test failed'
        });
      }
    }

    return checks;
  }

  /**
   * Fetch with timeout using native fetch (Node 18+)
   */
  private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Genesis-Deployment-Agent/1.0'
        }
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * Wait for deployment to be accessible
   */
  async waitForAvailability(url: string, maxWaitTime: number = 60000): Promise<boolean> {
    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await this.fetchWithTimeout(url, 5000);
        if (response.status < 500) {
          return true; // Site is responding
        }
      } catch {
        // Site not ready yet
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between attempts
    }

    return false;
  }
}

/**
 * Smoke test definition
 */
export interface SmokeTest {
  name: string;
  path: string;
  expectedStatus?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}
