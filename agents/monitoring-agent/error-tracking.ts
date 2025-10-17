// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/monitoring-agent/error-tracking.ts
// PURPOSE: Sentry error tracking integration
// GENESIS REF: Week 6 Task 3 - Monitoring Agent
// WSL PATH: ~/project-genesis/agents/monitoring-agent/error-tracking.ts
// ================================

import * as fs from 'fs';
import * as path from 'path';
import { MonitoringConfig, ErrorEvent, CodeSnippet } from './types.js';

export class ErrorTrackingService {
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async setup(): Promise<{
    success: boolean;
    codeSnippets: CodeSnippet[];
    instructions: string[];
  }> {
    console.log('🔍 Setting up error tracking with Sentry...');

    const dsn = this.config.errorTracking?.dsn || process.env.SENTRY_DSN;
    if (!dsn) {
      console.log('⚠️  SENTRY_DSN not provided - will need manual configuration');
    }

    const codeSnippets: CodeSnippet[] = [];
    const instructions: string[] = [];

    // Generate initialization code
    codeSnippets.push(this.generateSentryInit(dsn));

    // Generate error boundary
    codeSnippets.push(this.generateErrorBoundary());

    // Generate Next.js config (if applicable)
    if (this.isNextJsProject()) {
      codeSnippets.push(this.generateNextJsConfig(dsn));
      codeSnippets.push(this.generateNextJsSentryFiles(dsn));
    }

    // Generate environment variables template
    codeSnippets.push(this.generateEnvTemplate(dsn));

    instructions.push(...this.getSetupInstructions(dsn));

    console.log('✅ Sentry configuration generated');

    return {
      success: true,
      codeSnippets,
      instructions
    };
  }

  private generateSentryInit(dsn?: string): CodeSnippet {
    const code = `// lib/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: '${dsn || 'YOUR_SENTRY_DSN'}',
  environment: process.env.NODE_ENV || 'development',

  // Performance Monitoring
  tracesSampleRate: ${this.config.errorTracking?.tracesSampleRate || 0.1},

  // Session Replay
  replaysSessionSampleRate: ${this.config.errorTracking?.replaysSessionSampleRate || 0.1},
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.BrowserTracing({
      // Set sampling rate for performance monitoring
      tracePropagationTargets: ['localhost', /^https:\\/\\/yourapp\\.com\\/api/],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Release tracking
  release: process.env.NEXT_PUBLIC_RELEASE_VERSION,

  // Before send hook for filtering
  beforeSend(event, hint) {
    // Filter out non-error console logs
    if (event.level === 'log') {
      return null;
    }

    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error (not sent in dev):', event);
      return null;
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    // Network errors
    'NetworkError',
    'Network request failed',
    // Random plugins
    'fb_xd_fragment',
    'bmi_SafeAddOnload',
  ],
});

export default Sentry;
`;

    return {
      file: 'lib/sentry.ts',
      code,
      description: 'Sentry initialization and configuration'
    };
  }

  private generateErrorBoundary(): CodeSnippet {
    const code = `// components/ErrorBoundary.tsx
import React from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      scope.setTag('error_boundary', 'true');
      Sentry.captureException(error);
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary" style={{
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <h2>Something went wrong</h2>
          <p>We've been notified and will fix it soon.</p>
          <details style={{ marginTop: '1rem', textAlign: 'left' }}>
            <summary>Error details</summary>
            <pre style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {this.state.error?.message}
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={this.resetError}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export with Sentry HOC
export default Sentry.withErrorBoundary(ErrorBoundary, {
  fallback: ({ error, resetError }) => (
    <div>
      <h2>An error occurred</h2>
      <button onClick={resetError}>Try again</button>
    </div>
  ),
  showDialog: false,
});
`;

    return {
      file: 'components/ErrorBoundary.tsx',
      code,
      description: 'React Error Boundary with Sentry integration'
    };
  }

  private generateNextJsConfig(dsn?: string): CodeSnippet {
    const code = `// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  // Your Next.js config
  reactStrictMode: true,

  // Sentry config
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps for better error tracking
  silent: true,
  dryRun: process.env.NODE_ENV === 'development',

  // Additional config
  include: '.next',
  ignore: ['node_modules'],
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
`;

    return {
      file: 'next.config.js',
      code,
      description: 'Next.js configuration with Sentry source map upload'
    };
  }

  private generateNextJsSentryFiles(dsn?: string): CodeSnippet {
    const code = `// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});

// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
`;

    return {
      file: 'sentry.*.config.ts',
      code,
      description: 'Next.js Sentry configuration files for client, server, and edge'
    };
  }

  private generateEnvTemplate(dsn?: string): CodeSnippet {
    const code = `# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=${dsn || 'your-sentry-dsn-here'}
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token

# Optional: Release tracking
NEXT_PUBLIC_RELEASE_VERSION=\${npm_package_version}
`;

    return {
      file: '.env.example',
      code,
      description: 'Environment variables template for Sentry'
    };
  }

  private isNextJsProject(): boolean {
    const projectPath = this.config.projectPath || process.cwd();
    const nextConfigPath = path.join(projectPath, 'next.config.js');
    const nextConfigTs = path.join(projectPath, 'next.config.ts');
    return fs.existsSync(nextConfigPath) || fs.existsSync(nextConfigTs);
  }

  private getSetupInstructions(dsn?: string): string[] {
    const isNextJs = this.isNextJsProject();

    const instructions = [
      '📋 Sentry Setup Instructions:',
      '',
      '1. Create a Sentry account at https://sentry.io',
      '',
      '2. Create a new project for your app',
      '',
      '3. Add environment variables to .env.local:',
      `   NEXT_PUBLIC_SENTRY_DSN=${dsn || 'your-sentry-dsn'}`,
      '   SENTRY_ORG=your-org-name',
      '   SENTRY_PROJECT=your-project-name',
      '   SENTRY_AUTH_TOKEN=your-auth-token',
      '',
      '4. Install Sentry packages:',
    ];

    if (isNextJs) {
      instructions.push('   npm install @sentry/nextjs');
    } else {
      instructions.push('   npm install @sentry/react');
    }

    instructions.push(
      '',
      '5. Import and use ErrorBoundary in your app:',
      '   import ErrorBoundary from "@/components/ErrorBoundary"',
      '   ',
      '   <ErrorBoundary>',
      '     <YourApp />',
      '   </ErrorBoundary>',
      '',
      '6. Initialize Sentry in your app entry point:',
      '   import "@/lib/sentry"',
      '',
      '7. Test error tracking:',
      '   throw new Error("Test Sentry integration");',
      '',
      '8. Manually capture errors:',
      '   import * as Sentry from "@sentry/react";',
      '   Sentry.captureException(new Error("Test error"));',
      '',
      '9. Add user context:',
      '   Sentry.setUser({ id: "user-id", email: "user@example.com" });',
      '',
      '10. Add breadcrumbs:',
      '    Sentry.addBreadcrumb({ message: "User clicked button" });',
    );

    return instructions;
  }

  /**
   * Capture error manually (for use in deployed app)
   */
  captureError(error: ErrorEvent): void {
    console.error('Error captured:', {
      message: error.message,
      level: error.level,
      tags: error.tags,
      user: error.user,
    });
  }

  /**
   * Set user context
   */
  setUser(user: { id?: string; email?: string; username?: string }): void {
    console.log('User context set:', user);
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: { message: string; category?: string; level?: string }): void {
    console.log('Breadcrumb added:', breadcrumb);
  }
}
