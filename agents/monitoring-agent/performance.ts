// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/monitoring-agent/performance.ts
// PURPOSE: Performance monitoring with Web Vitals
// GENESIS REF: Week 6 Task 3 - Monitoring Agent
// WSL PATH: ~/project-genesis/agents/monitoring-agent/performance.ts
// ================================

import { PerformanceMetrics, CodeSnippet } from './types.js';

export class PerformanceMonitoringService {
  async setup(): Promise<{
    success: boolean;
    codeSnippets: CodeSnippet[];
    instructions: string[];
  }> {
    console.log('⚡ Setting up performance monitoring...');

    const codeSnippets: CodeSnippet[] = [];

    // Web Vitals tracking
    codeSnippets.push(this.generateWebVitalsConfig());

    // Next.js integration
    codeSnippets.push(this.generateNextJsWebVitals());

    // Lighthouse CI config
    codeSnippets.push(this.generateLighthouseConfig());

    // Performance budget
    codeSnippets.push(this.generatePerformanceBudget());

    // Custom performance monitoring
    codeSnippets.push(this.generateCustomPerformanceMonitoring());

    const instructions = this.getSetupInstructions();

    console.log('✅ Performance monitoring configured');

    return {
      success: true,
      codeSnippets,
      instructions
    };
  }

  private generateWebVitalsConfig(): CodeSnippet {
    const code = `// lib/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

type Metric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
};

function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });

  // Send to PostHog
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture('web_vital', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Send to custom endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', body);
  } else {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'application/json' }
    }).catch(console.error);
  }
}

// Track all Web Vitals
export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}

// For Next.js, use the built-in reportWebVitals
export function reportWebVitals(metric: Metric) {
  sendToAnalytics(metric);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }
}
`;

    return {
      file: 'lib/web-vitals.ts',
      code,
      description: 'Web Vitals tracking configuration'
    };
  }

  private generateNextJsWebVitals(): CodeSnippet {
    const code = `// app/_app.tsx (Pages Router) or app/layout.tsx (App Router)

// For Pages Router:
import type { AppProps } from 'next/app';
import { reportWebVitals } from '@/lib/web-vitals';

export { reportWebVitals };

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

// For App Router, create a client component:
// components/WebVitalsReporter.tsx
'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}

// Then add to your root layout:
// import { WebVitalsReporter } from '@/components/WebVitalsReporter';
//
// export default function RootLayout({ children }) {
//   return (
//     <html>
//       <body>
//         <WebVitalsReporter />
//         {children}
//       </body>
//     </html>
//   );
// }
`;

    return {
      file: 'app/_app.tsx',
      code,
      description: 'Next.js Web Vitals integration'
    };
  }

  private generateLighthouseConfig(): CodeSnippet {
    const code = `// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run start',
      url: ['http://localhost:3000'],
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        'speed-index': ['error', { maxNumericValue: 3400 }],

        // Additional metrics
        'max-potential-fid': ['error', { maxNumericValue: 130 }],
        'server-response-time': ['error', { maxNumericValue: 600 }],

        // Resource optimization
        'uses-optimized-images': 'warn',
        'modern-image-formats': 'warn',
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',

        // JavaScript optimization
        'unused-javascript': 'warn',
        'bootup-time': ['warn', { maxNumericValue: 3500 }],
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
`;

    return {
      file: 'lighthouserc.js',
      code,
      description: 'Lighthouse CI configuration with performance budgets'
    };
  }

  private generatePerformanceBudget(): CodeSnippet {
    const code = `// performance-budget.json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "document",
          "budget": 50
        },
        {
          "resourceType": "script",
          "budget": 170
        },
        {
          "resourceType": "stylesheet",
          "budget": 30
        },
        {
          "resourceType": "image",
          "budget": 200
        },
        {
          "resourceType": "font",
          "budget": 100
        },
        {
          "resourceType": "media",
          "budget": 300
        },
        {
          "resourceType": "total",
          "budget": 500
        }
      ],
      "resourceCounts": [
        {
          "resourceType": "script",
          "budget": 10
        },
        {
          "resourceType": "stylesheet",
          "budget": 4
        },
        {
          "resourceType": "font",
          "budget": 4
        },
        {
          "resourceType": "third-party",
          "budget": 10
        }
      ]
    }
  ],
  "timings": [
    {
      "metric": "first-contentful-paint",
      "budget": 2000,
      "tolerance": 100
    },
    {
      "metric": "largest-contentful-paint",
      "budget": 2500,
      "tolerance": 200
    },
    {
      "metric": "cumulative-layout-shift",
      "budget": 0.1,
      "tolerance": 0.02
    },
    {
      "metric": "total-blocking-time",
      "budget": 300,
      "tolerance": 50
    },
    {
      "metric": "speed-index",
      "budget": 3000,
      "tolerance": 200
    },
    {
      "metric": "interactive",
      "budget": 3800,
      "tolerance": 300
    }
  ]
}
`;

    return {
      file: 'performance-budget.json',
      code,
      description: 'Performance budget configuration'
    };
  }

  private generateCustomPerformanceMonitoring(): CodeSnippet {
    const code = `// lib/performance-monitor.ts
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  /**
   * Start a performance mark
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
    performance.mark(name);
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(\`Performance mark "\${startMark}" not found\`);
      return 0;
    }

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (!end) {
      console.warn(\`Performance mark "\${endMark}" not found\`);
      return 0;
    }

    const duration = end - start;

    performance.measure(name, startMark, endMark);

    // Send to analytics
    this.sendMetric(name, duration);

    return duration;
  }

  /**
   * Get navigation timing
   */
  getNavigationTiming(): Record<string, number> | null {
    if (typeof window === 'undefined') return null;

    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!perfData) return null;

    return {
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      request: perfData.responseStart - perfData.requestStart,
      response: perfData.responseEnd - perfData.responseStart,
      dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      load: perfData.loadEventEnd - perfData.loadEventStart,
      total: perfData.loadEventEnd - perfData.fetchStart,
    };
  }

  /**
   * Get resource timing
   */
  getResourceTiming(): Array<{
    name: string;
    type: string;
    duration: number;
    size: number;
  }> {
    if (typeof window === 'undefined') return [];

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    return resources.map(resource => ({
      name: resource.name,
      type: resource.initiatorType,
      duration: resource.duration,
      size: resource.transferSize || 0,
    }));
  }

  /**
   * Monitor long tasks
   */
  observeLongTasks(callback: (tasks: PerformanceEntry[]) => void): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long Task API not supported');
    }
  }

  /**
   * Send metric to analytics
   */
  private sendMetric(name: string, value: number): void {
    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('performance_metric', {
        metric: name,
        value: Math.round(value),
      });
    }

    // Custom endpoint
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/performance', JSON.stringify({
        metric: name,
        value: Math.round(value),
        timestamp: Date.now(),
      }));
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Usage:
// performanceMonitor.mark('api-call-start');
// await fetchData();
// performanceMonitor.mark('api-call-end');
// const duration = performanceMonitor.measure('api-call', 'api-call-start', 'api-call-end');
`;

    return {
      file: 'lib/performance-monitor.ts',
      code,
      description: 'Custom performance monitoring utilities'
    };
  }

  private getSetupInstructions(): string[] {
    return [
      '📋 Performance Monitoring Setup:',
      '',
      '1. Install web-vitals:',
      '   npm install web-vitals',
      '',
      '2. Install Lighthouse CI:',
      '   npm install -g @lhci/cli',
      '   # or',
      '   npm install --save-dev @lhci/cli',
      '',
      '3. Initialize Web Vitals in your app:',
      '   - For Pages Router: Export reportWebVitals from _app.tsx',
      '   - For App Router: Add WebVitalsReporter component',
      '',
      '4. Add API endpoint to receive Web Vitals data:',
      '   // app/api/analytics/web-vitals/route.ts',
      '   export async function POST(request: Request) {',
      '     const metric = await request.json();',
      '     // Store or forward metric',
      '     return new Response("OK");',
      '   }',
      '',
      '5. Run Lighthouse CI in your CI/CD pipeline:',
      '   lhci autorun',
      '',
      '6. Add to package.json scripts:',
      '   "lighthouse": "lhci autorun"',
      '',
      '7. Monitor custom performance:',
      '   import { performanceMonitor } from "@/lib/performance-monitor"',
      '   performanceMonitor.mark("operation-start");',
      '   // ... your code',
      '   performanceMonitor.measure("operation", "operation-start");',
      '',
      '8. View Web Vitals in:',
      '   - Your analytics dashboard (PostHog/GA)',
      '   - Chrome DevTools (Performance tab)',
      '   - Lighthouse reports',
      '',
    ];
  }

  /**
   * Capture performance metrics manually
   */
  captureMetrics(metrics: PerformanceMetrics): void {
    console.log('Performance metrics:', metrics);
  }

  /**
   * Get current Web Vitals
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined') return null;

    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!perfData) return null;

    return {
      FCP: perfData.domContentLoadedEventEnd - perfData.fetchStart,
      TTFB: perfData.responseStart - perfData.requestStart,
    };
  }
}
