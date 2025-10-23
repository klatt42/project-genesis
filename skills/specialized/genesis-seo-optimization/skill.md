---
name: genesis-seo-optimization
description: SEO enhancement patterns for Genesis projects including meta tags, schema markup, and performance optimization
---

# Genesis SEO Optimization

## When to Use This Skill

Load this skill when user mentions:
- "seo" OR "search optimization" OR "search engine"
- "meta tags" OR "metadata" OR "open graph"
- "schema markup" OR "structured data"
- "sitemap" OR "robots.txt"
- "lighthouse" OR "page speed" OR "core web vitals"
- "local seo" OR "business listing"

## Key Patterns

### Pattern 1: Essential Meta Tags

**Base template** (app/layout.tsx or page.tsx):
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Page Title | Brand Name',
  description: 'Clear, compelling description (150-160 chars)',
  keywords: ['keyword1', 'keyword2', 'keyword3'],

  // Open Graph (social sharing)
  openGraph: {
    title: 'Your Page Title',
    description: 'Description for social media',
    url: 'https://yourdomain.com',
    siteName: 'Your Site Name',
    images: [{
      url: 'https://yourdomain.com/og-image.jpg',
      width: 1200,
      height: 630,
    }],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Your Page Title',
    description: 'Description for Twitter',
    images: ['https://yourdomain.com/twitter-image.jpg'],
  },

  // Additional
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

**Page-specific metadata**:
```typescript
// app/about/page.tsx
export const metadata: Metadata = {
  title: 'About Us | Company Name',
  description: 'Learn about our mission and team',
};
```

### Pattern 2: Schema.org Markup

**LocalBusiness** (for local landing pages):
```typescript
// components/SchemaMarkup.tsx
export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Business Name",
    "image": "https://yourdomain.com/business-photo.jpg",
    "@id": "https://yourdomain.com",
    "url": "https://yourdomain.com",
    "telephone": "+1-555-555-5555",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main St",
      "addressLocality": "City",
      "addressRegion": "ST",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    },
    "priceRange": "$$"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Product/Service** schema:
```typescript
export function ProductSchema({ product }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": product.price,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Pattern 3: Sitemap & Robots.txt

**Sitemap generation** (app/sitemap.ts):
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourdomain.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
}
```

**Robots.txt** (app/robots.ts):
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

### Pattern 4: Image Optimization

**Next.js Image component**:
```typescript
import Image from 'next/image';

// Optimized image
<Image
  src="/hero-image.jpg"
  alt="Descriptive alt text"
  width={1200}
  height={600}
  priority  // For above-fold images
  quality={90}
/>

// Lazy-loaded image
<Image
  src="/feature-image.jpg"
  alt="Feature description"
  width={800}
  height={400}
  loading="lazy"  // Default, but explicit
  quality={85}
/>
```

**Image sizing guide**:
| Use Case | Dimensions | Format | Quality |
|----------|------------|--------|---------|
| Hero image | 1920x1080 | WebP | 90% |
| OG image | 1200x630 | JPG | 85% |
| Twitter card | 1200x600 | JPG | 85% |
| Thumbnails | 400x300 | WebP | 80% |

### Pattern 5: Performance Optimization

**Core Web Vitals checklist**:
```typescript
// 1. Largest Contentful Paint (LCP) - Target < 2.5s
// - Use priority loading for hero images
// - Optimize server response time
// - Use CDN for static assets

// 2. First Input Delay (FID) - Target < 100ms
// - Minimize JavaScript execution
// - Code splitting
// - Use dynamic imports

// 3. Cumulative Layout Shift (CLS) - Target < 0.1
// - Set width/height on images
// - Reserve space for dynamic content
// - Avoid inserting content above existing content

// Example: Reserve space for ads/dynamic content
<div className="ad-container" style={{ minHeight: '250px' }}>
  {/* Ad loads here without layout shift */}
</div>
```

**Font optimization** (app/layout.tsx):
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Prevent invisible text
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## Quick Reference

| SEO Task | Implementation | File Location |
|----------|---------------|---------------|
| Meta tags | `export const metadata` | app/page.tsx |
| Schema markup | Schema component | components/SchemaMarkup.tsx |
| Sitemap | `export default sitemap()` | app/sitemap.ts |
| Robots.txt | `export default robots()` | app/robots.ts |
| Images | `<Image>` component | Next.js built-in |
| Fonts | Font optimization | app/layout.tsx |

### Local SEO Checklist

For local business landing pages:
- [ ] LocalBusiness schema with address
- [ ] GeoCoordinates for map integration
- [ ] Opening hours specification
- [ ] Phone number in schema and visible
- [ ] NAP (Name, Address, Phone) consistency
- [ ] Local keywords in title/description
- [ ] City/region in meta tags

### Technical SEO Checklist

- [ ] Meta title (50-60 chars)
- [ ] Meta description (150-160 chars)
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Schema.org markup
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Images optimized (WebP)
- [ ] Alt text on all images
- [ ] Mobile responsive
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] Core Web Vitals passing

## Command Templates

```bash
# Test SEO with Lighthouse
npx lighthouse https://your-site.com --view

# Check structured data
# Visit: https://search.google.com/test/rich-results
# Enter your URL

# Validate sitemap
# Visit: https://www.xml-sitemaps.com/validate-xml-sitemap.html
# Enter: https://your-site.com/sitemap.xml

# Test mobile-friendliness
# Visit: https://search.google.com/test/mobile-friendly
# Enter your URL

# Check page speed
npx unlighthouse --site https://your-site.com
```

## Integration with Other Skills

- Use **genesis-landing-page** for page structure before SEO
- Use **genesis-deployment** for production URL configuration
- Use **genesis-analytics** for tracking SEO performance
- Use **genesis-testing** for validating SEO implementation
- Reference **genesis-forms** for lead capture optimization

## Deep Dive

For complete SEO patterns and advanced optimization, reference:
- Next.js Metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Schema.org types: https://schema.org/docs/schemas.html
- Google Search Central: https://developers.google.com/search/docs
- Web.dev Performance: https://web.dev/performance

## Common SEO Issues

**Missing OG images**:
```bash
# Create og-image.jpg (1200x630)
# Place in public/og-image.jpg
# Reference in metadata: url: '/og-image.jpg'
```

**Schema validation errors**:
```bash
# Test at: https://validator.schema.org/
# Fix required fields
# Ensure correct @type
```

**Poor Lighthouse scores**:
```bash
# Run audit: npx lighthouse https://your-site.com
# Focus on: Performance, Accessibility, Best Practices, SEO
# Address red/yellow items first
```

## Best Practices

1. **Meta tags first** - Set before any other SEO work
2. **Schema markup** - Add relevant structured data
3. **Image optimization** - Use WebP, set dimensions, lazy load
4. **Performance** - Optimize for Core Web Vitals
5. **Testing** - Validate with Google tools before launch
6. **Local SEO** - Include location data for local businesses
7. **Mobile-first** - Ensure responsive design
