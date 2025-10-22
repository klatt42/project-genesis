// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/monitoring-agent/analytics.ts
// PURPOSE: Multi-provider analytics integration
// GENESIS REF: Week 6 Task 3 - Monitoring Agent
// WSL PATH: ~/project-genesis/agents/monitoring-agent/analytics.ts
// ================================

import { MonitoringConfig, MonitoringProvider, AnalyticsEvent, CodeSnippet } from './types.js';

export class AnalyticsService {
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async setup(): Promise<{
    success: boolean;
    codeSnippets: CodeSnippet[];
    instructions: string[];
  }> {
    console.log('📊 Setting up analytics...');

    const codeSnippets: CodeSnippet[] = [];
    const instructions: string[] = [];

    if (!this.config.analytics) {
      console.log('⚠️  No analytics provider configured');
      return { success: false, codeSnippets, instructions };
    }

    const provider = this.config.analytics.provider;

    switch (provider) {
      case MonitoringProvider.POSTHOG:
        codeSnippets.push(...this.generatePostHogCode());
        instructions.push(...this.getPostHogInstructions());
        break;

      case MonitoringProvider.PLAUSIBLE:
        codeSnippets.push(...this.generatePlausibleCode());
        instructions.push(...this.getPlausibleInstructions());
        break;

      case MonitoringProvider.GOOGLE_ANALYTICS:
        codeSnippets.push(...this.generateGoogleAnalyticsCode());
        instructions.push(...this.getGoogleAnalyticsInstructions());
        break;
    }

    // Generate common analytics utilities
    codeSnippets.push(this.generateAnalyticsUtils());

    console.log(`✅ ${provider} analytics configuration generated`);

    return {
      success: true,
      codeSnippets,
      instructions
    };
  }

  // ==================== PostHog ====================

  private generatePostHogCode(): CodeSnippet[] {
    const apiKey = this.config.analytics?.apiKey || 'YOUR_POSTHOG_API_KEY';

    const initCode: CodeSnippet = {
      file: 'lib/analytics/posthog.ts',
      code: `// PostHog Analytics Integration
import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window === 'undefined') return;

  posthog.init('${apiKey}', {
    api_host: 'https://app.posthog.com',

    // Privacy settings
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.opt_out_capturing();
        console.log('PostHog: Opted out in development');
      }
    },

    // Auto-capture settings
    capture_pageview: true,
    capture_pageleave: true,

    // Session recording (privacy-focused)
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*',
    },

    // Person profiles
    person_profiles: 'identified_only',

    // Autocapture
    autocapture: {
      dom_event_allowlist: ['click'], // Only capture clicks
      url_allowlist: [], // Optionally filter URLs
    },
  });

  return posthog;
}

export { posthog };
`,
      description: 'PostHog initialization'
    };

    const providerCode: CodeSnippet = {
      file: 'lib/analytics/provider.tsx',
      code: `// Analytics Provider Component
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, posthog } from './posthog';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize PostHog
    initPostHog();
  }, []);

  useEffect(() => {
    // Track page views
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? \`?\${searchParams.toString()}\` : '');
      posthog.capture('$pageview', { url });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
`,
      description: 'React Analytics Provider with auto page tracking'
    };

    const hooksCode: CodeSnippet = {
      file: 'lib/analytics/hooks.ts',
      code: `// Analytics Hooks
import { posthog } from './posthog';

/**
 * Track custom events
 */
export function useAnalytics() {
  const track = (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties);
  };

  const identify = (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties);
  };

  const reset = () => {
    posthog.reset();
  };

  return { track, identify, reset };
}

// Usage examples:
// const { track } = useAnalytics();
// track('button_clicked', { button_name: 'signup' });
`,
      description: 'Analytics hooks for React components'
    };

    return [initCode, providerCode, hooksCode];
  }

  private getPostHogInstructions(): string[] {
    return [
      '📋 PostHog Setup Instructions:',
      '',
      '1. Create a PostHog account at https://posthog.com',
      '',
      '2. Get your project API key from Settings',
      '',
      '3. Add environment variable:',
      `   NEXT_PUBLIC_POSTHOG_KEY=${this.config.analytics?.apiKey || 'your-api-key'}`,
      '',
      '4. Install PostHog:',
      '   npm install posthog-js',
      '',
      '5. Wrap your app with AnalyticsProvider:',
      '   import { AnalyticsProvider } from "@/lib/analytics/provider"',
      '   ',
      '   <AnalyticsProvider>',
      '     <YourApp />',
      '   </AnalyticsProvider>',
      '',
      '6. Track events:',
      '   import { useAnalytics } from "@/lib/analytics/hooks"',
      '   const { track } = useAnalytics();',
      '   track("button_clicked", { button: "signup" });',
      '',
    ];
  }

  // ==================== Plausible ====================

  private generatePlausibleCode(): CodeSnippet[] {
    const domain = this.config.analytics?.domain || this.config.projectUrl;

    const scriptCode: CodeSnippet = {
      file: 'lib/analytics/plausible.tsx',
      code: `// Plausible Analytics Integration
import Script from 'next/script';

export function PlausibleScript() {
  return (
    <Script
      defer
      data-domain="${domain}"
      src="https://plausible.io/js/script.js"
    />
  );
}

// For custom events
export function PlausibleCustomEvents() {
  return (
    <Script
      defer
      data-domain="${domain}"
      src="https://plausible.io/js/script.tagged-events.js"
    />
  );
}

// Track custom events
export function trackEvent(eventName: string, props?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(eventName, { props });
  }
}
`,
      description: 'Plausible analytics integration'
    };

    const layoutCode: CodeSnippet = {
      file: 'app/layout.tsx (add to head)',
      code: `// Add to your root layout
import { PlausibleScript } from '@/lib/analytics/plausible';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <PlausibleScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
`,
      description: 'Add Plausible script to layout'
    };

    return [scriptCode, layoutCode];
  }

  private getPlausibleInstructions(): string[] {
    return [
      '📋 Plausible Setup Instructions:',
      '',
      '1. Create a Plausible account at https://plausible.io',
      '',
      '2. Add your website domain',
      '',
      '3. Plausible is privacy-focused and GDPR compliant by default',
      '',
      '4. No environment variables needed for basic tracking',
      '',
      '5. Add PlausibleScript to your app layout (see generated code)',
      '',
      '6. Track custom events:',
      '   import { trackEvent } from "@/lib/analytics/plausible"',
      '   trackEvent("signup", { plan: "pro" });',
      '',
      '7. Use tagged events in HTML:',
      '   <button className="plausible-event-name=Signup">Sign Up</button>',
      '',
    ];
  }

  // ==================== Google Analytics ====================

  private generateGoogleAnalyticsCode(): CodeSnippet[] {
    const measurementId = this.config.analytics?.apiKey || 'G-XXXXXXXXXX';

    const gaCode: CodeSnippet = {
      file: 'lib/analytics/google-analytics.tsx',
      code: `// Google Analytics Integration
import Script from 'next/script';

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={\`https://www.googletagmanager.com/gtag/js?id=\${measurementId}\`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {\`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '\${measurementId}', {
            page_path: window.location.pathname,
          });
        \`}
      </Script>
    </>
  );
}

// Track page views
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', '${measurementId}', {
      page_path: url,
    });
  }
}

// Track events
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}
`,
      description: 'Google Analytics integration'
    };

    const providerCode: CodeSnippet = {
      file: 'lib/analytics/ga-provider.tsx',
      code: `// Google Analytics Provider
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GoogleAnalytics, trackPageView } from './google-analytics';

export function GAProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? \`?\${searchParams.toString()}\` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <GoogleAnalytics measurementId="${measurementId}" />
      {children}
    </>
  );
}
`,
      description: 'GA Provider with auto page tracking'
    };

    return [gaCode, providerCode];
  }

  private getGoogleAnalyticsInstructions(): string[] {
    return [
      '📋 Google Analytics Setup Instructions:',
      '',
      '1. Create a Google Analytics account at https://analytics.google.com',
      '',
      '2. Create a new GA4 property',
      '',
      '3. Get your Measurement ID (G-XXXXXXXXXX)',
      '',
      '4. Add environment variable:',
      '   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX',
      '',
      '5. Wrap your app with GAProvider:',
      '   import { GAProvider } from "@/lib/analytics/ga-provider"',
      '   ',
      '   <GAProvider>',
      '     <YourApp />',
      '   </GAProvider>',
      '',
      '6. Track events:',
      '   import { trackEvent } from "@/lib/analytics/google-analytics"',
      '   trackEvent("click", "button", "signup");',
      '',
    ];
  }

  // ==================== Common Utilities ====================

  private generateAnalyticsUtils(): CodeSnippet {
    return {
      file: 'lib/analytics/utils.ts',
      code: `// Analytics Utilities
export function isAnalyticsEnabled(): boolean {
  // Respect Do Not Track
  if (typeof window !== 'undefined' && navigator.doNotTrack === '1') {
    return false;
  }

  // Disable in development
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  return true;
}

// Track function that respects privacy settings
export function safeTrack(eventName: string, properties?: Record<string, any>) {
  if (!isAnalyticsEnabled()) {
    console.log('[Analytics] Skipped:', eventName, properties);
    return;
  }

  // Your tracking implementation
  console.log('[Analytics] Track:', eventName, properties);
}

// Common events
export const AnalyticsEvents = {
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PURCHASE: 'purchase',
  ERROR: 'error',
} as const;
`,
      description: 'Common analytics utilities and helpers'
    };
  }

  /**
   * Track event manually (for use in deployed app)
   */
  trackEvent(event: AnalyticsEvent): void {
    console.log('Analytics event:', {
      name: event.name,
      properties: event.properties,
      timestamp: event.timestamp || new Date(),
    });
  }

  /**
   * Identify user
   */
  identifyUser(userId: string, properties?: Record<string, any>): void {
    console.log('User identified:', userId, properties);
  }

  /**
   * Reset analytics session
   */
  reset(): void {
    console.log('Analytics session reset');
  }
}
