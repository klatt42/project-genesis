---
name: genesis-analytics
description: Analytics integration patterns for Genesis projects including GA4, conversion tracking, and custom events
---

# Genesis Analytics

## When to Use This Skill

Load this skill when user mentions:
- "analytics" OR "tracking" OR "metrics"
- "google analytics" OR "ga4" OR "gtm"
- "conversion" OR "conversion tracking"
- "events" OR "event tracking" OR "custom events"
- "user behavior" OR "user tracking"
- "a/b test" OR "split test" OR "experiments"

## Key Patterns

### Pattern 1: Google Analytics 4 Setup

**Install dependencies**:
```bash
npm install react-ga4
# Or use Next.js Script component (no deps needed)
```

**GA4 component** (app/components/GoogleAnalytics.tsx):
```typescript
'use client';

import Script from 'next/script';

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
```

**Add to layout** (app/layout.tsx):
```typescript
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      </body>
    </html>
  );
}
```

**Environment variable** (.env.local):
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Pattern 2: Custom Event Tracking

**Event tracking utility** (lib/analytics.ts):
```typescript
// lib/analytics.ts
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Specific event helpers
export const trackLeadSubmission = (leadData: {
  source?: string;
  campaign?: string;
}) => {
  trackEvent('lead_submission', {
    event_category: 'engagement',
    event_label: leadData.source || 'website',
    campaign_name: leadData.campaign,
  });
};

export const trackButtonClick = (buttonName: string) => {
  trackEvent('button_click', {
    event_category: 'interaction',
    event_label: buttonName,
  });
};

export const trackPageView = (pagePath: string) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: document.title,
  });
};

export const trackFormStart = (formName: string) => {
  trackEvent('form_start', {
    event_category: 'engagement',
    event_label: formName,
  });
};

export const trackFormComplete = (formName: string) => {
  trackEvent('form_complete', {
    event_category: 'conversion',
    event_label: formName,
  });
};
```

**TypeScript types** (types/gtag.d.ts):
```typescript
// types/gtag.d.ts
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export {};
```

**Use in components**:
```typescript
'use client';

import { trackLeadSubmission, trackFormStart } from '@/lib/analytics';

export function LeadForm() {
  const handleSubmit = async (data: FormData) => {
    // Track form start
    trackFormStart('lead_capture_form');

    // Submit form
    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Track successful submission
      trackLeadSubmission({
        source: 'landing_page',
        campaign: 'summer_2024',
      });
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Pattern 3: Conversion Tracking

**Set up conversions in GA4**:
1. GA4 Dashboard → Configure → Events
2. Create custom event: `lead_submission`, `purchase`, etc.
3. Mark as conversion

**Track conversions**:
```typescript
// lib/analytics.ts
export const trackConversion = (
  conversionName: string,
  value?: number,
  currency: string = 'USD'
) => {
  trackEvent(conversionName, {
    value,
    currency,
    event_category: 'conversion',
  });
};

// Usage in form submission
trackConversion('lead_submission', 0);  // Free lead

// Usage in purchase
trackConversion('purchase', 99.99, 'USD');
```

**GoHighLevel webhook integration**:
```typescript
// app/api/leads/route.ts
import { trackConversion } from '@/lib/analytics';

export async function POST(request: Request) {
  const data = await request.json();

  // Send to GHL
  const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: data.name,
      email: data.email,
      phone: data.phone,
      tags: ['website-lead'],
    }),
  });

  if (ghlResponse.ok) {
    // Track conversion in GA4
    trackConversion('lead_submission');
  }

  return Response.json({ success: true });
}
```

### Pattern 4: UTM Parameter Tracking

**Capture UTM params** (lib/utm.ts):
```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function UTMTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utmParams = {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_term: searchParams.get('utm_term'),
      utm_content: searchParams.get('utm_content'),
    };

    // Filter out null values
    const validParams = Object.fromEntries(
      Object.entries(utmParams).filter(([_, value]) => value !== null)
    );

    // Store in session storage
    if (Object.keys(validParams).length > 0) {
      sessionStorage.setItem('utmParams', JSON.stringify(validParams));

      // Send to GA4
      if (window.gtag) {
        window.gtag('set', 'user_properties', validParams);
      }
    }
  }, [searchParams]);

  return null;
}
```

**Add to layout**:
```typescript
import { UTMTracker } from '@/lib/utm';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <UTMTracker />
        {children}
      </body>
    </html>
  );
}
```

**Include in lead submission**:
```typescript
// components/LeadForm.tsx
const onSubmit = async (data: FormData) => {
  // Get stored UTM params
  const utmParams = sessionStorage.getItem('utmParams');
  const parsedUTM = utmParams ? JSON.parse(utmParams) : {};

  // Include in submission
  const response = await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      ...parsedUTM,  // Include UTM params
    }),
  });
};
```

### Pattern 5: Page View Tracking (App Router)

**Auto-track route changes**:
```typescript
// app/components/PageViewTracker.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}
```

**Add to layout**:
```typescript
import { PageViewTracker } from '@/components/PageViewTracker';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
```

## Quick Reference

| Tracking Need | Function | Parameters |
|---------------|----------|------------|
| Custom event | `trackEvent()` | name, parameters |
| Lead submission | `trackLeadSubmission()` | source, campaign |
| Conversion | `trackConversion()` | name, value, currency |
| Page view | `trackPageView()` | path |
| Button click | `trackButtonClick()` | button name |
| Form start | `trackFormStart()` | form name |
| Form complete | `trackFormComplete()` | form name |

### Event Naming Conventions

| Event Type | Naming Pattern | Example |
|------------|----------------|---------|
| User action | `{action}_{object}` | `click_cta_button` |
| Conversion | `{conversion_type}` | `lead_submission`, `purchase` |
| Navigation | `{page}_{view}` | `pricing_page_view` |
| Form | `form_{stage}` | `form_start`, `form_complete` |

## Command Templates

```bash
# Set up GA4
npm install react-ga4  # Optional

# Create analytics utilities
mkdir -p lib
touch lib/analytics.ts

# Create GA component
mkdir -p components
touch components/GoogleAnalytics.tsx

# Add environment variable
echo "NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX" >> .env.local

# Test analytics (check browser console)
npm run dev
# Open DevTools → Network → Filter: google-analytics
# Trigger events, watch requests
```

### GA4 Dashboard Setup

```bash
# 1. Create GA4 property
# https://analytics.google.com → Admin → Create Property

# 2. Get Measurement ID
# Admin → Data Streams → Web → Copy Measurement ID (G-XXXXXXXXXX)

# 3. Set up conversions
# Configure → Events → Mark as conversion

# 4. Create custom events
# Configure → Events → Create event

# 5. Set up audiences
# Configure → Audiences → New audience
```

## Integration with Other Skills

- Use **genesis-forms** to track form interactions
- Use **genesis-landing-page** for conversion optimization
- Use **genesis-seo-optimization** for traffic source analysis
- Use **genesis-deployment** to add analytics to production
- Use **genesis-testing** to verify tracking implementation
- Reference **genesis-troubleshooting** for tracking issues

## Advanced Tracking Patterns

### E-commerce Tracking
```typescript
// Track purchase
export const trackPurchase = (transaction: {
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{
    itemId: string;
    itemName: string;
    price: number;
    quantity: number;
  }>;
}) => {
  trackEvent('purchase', {
    transaction_id: transaction.transactionId,
    value: transaction.value,
    currency: transaction.currency,
    items: transaction.items,
  });
};

// Usage
trackPurchase({
  transactionId: 'T12345',
  value: 99.99,
  currency: 'USD',
  items: [{
    itemId: 'SKU123',
    itemName: 'Product Name',
    price: 99.99,
    quantity: 1,
  }],
});
```

### User Identification
```typescript
// Track user ID (after login)
export const identifyUser = (userId: string) => {
  if (window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      user_id: userId,
    });
  }
};

// Usage in auth callback
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  identifyUser(user.id);
}
```

### Scroll Depth Tracking
```typescript
// components/ScrollTracker.tsx
'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export function ScrollTracker() {
  const [milestones, setMilestones] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      // Track at 25%, 50%, 75%, 100%
      [25, 50, 75, 100].forEach((milestone) => {
        if (scrollPercent >= milestone && !milestones.has(milestone)) {
          trackEvent('scroll_depth', {
            event_category: 'engagement',
            event_label: `${milestone}%`,
            value: milestone,
          });
          setMilestones((prev) => new Set(prev).add(milestone));
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [milestones]);

  return null;
}
```

## Testing Analytics

```bash
# Use GA4 DebugView
# 1. Install Google Analytics Debugger extension
# 2. Enable debug mode
# 3. View events in GA4: Configure → DebugView

# Or check browser console
# Open DevTools → Console → Filter: gtag

# Validate events
# Use GA4 event builder: https://ga-dev-tools.google/ga4/event-builder/
```

## Common Tracking Errors

**Events not showing in GA4**:
```typescript
// Check if gtag loaded
if (typeof window !== 'undefined' && window.gtag) {
  console.log('GA4 loaded');
} else {
  console.error('GA4 not loaded');
}

// Check Measurement ID
console.log('Measurement ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

// Verify events sent
window.gtag = new Proxy(window.gtag, {
  apply(target, thisArg, args) {
    console.log('gtag called:', args);
    return target.apply(thisArg, args);
  }
});
```

**UTM params not captured**:
```typescript
// Debug UTM tracking
const searchParams = new URLSearchParams(window.location.search);
console.log('UTM Source:', searchParams.get('utm_source'));
console.log('UTM Medium:', searchParams.get('utm_medium'));
console.log('Stored UTM:', sessionStorage.getItem('utmParams'));
```

## Best Practices

1. **Track meaningful events** - Focus on user intent, not every click
2. **Consistent naming** - Use snake_case for event names
3. **Privacy compliance** - Respect GDPR/CCPA, anonymize IP
4. **Test before deploy** - Use DebugView to verify tracking
5. **Document events** - Keep list of tracked events and parameters
6. **Avoid PII** - Never track personally identifiable information
7. **Page view tracking** - Auto-track route changes in SPA

## Deep Dive

For complete analytics implementation:
- GA4 setup guide: https://support.google.com/analytics/answer/9304153
- Event tracking: https://developers.google.com/analytics/devguides/collection/ga4/events
- Enhanced ecommerce: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
- Privacy: https://support.google.com/analytics/answer/9019185
