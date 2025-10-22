---
name: genesis-landing-page
description: Landing page patterns for lead generation with GoHighLevel integration
---

# Genesis Landing Page

## When to Use This Skill

Load this skill when user mentions:
- "landing page" OR "landing site"
- "lead generation" OR "lead capture" OR "capture leads"
- "ghl" OR "gohighlevel" OR "high level"
- "conversion" OR "convert visitors"
- "marketing page" OR "sales page"

## Key Patterns

### Pattern 1: Page Structure (5 Sections)

```
Hero (Above fold) → Social Proof → Features → Lead Form → Footer
```

**Hero essentials**:
- Value proposition headline
- CTA button (above fold)
- Hero image/video

**Form placement**: After features or floating sidebar

### Pattern 2: Lead Capture Form

```typescript
// React Hook Form + Zod validation
const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
});

// components/forms/LeadCaptureForm.tsx
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('name')} />
  <input {...register('email')} />
  <input {...register('phone')} />
  <button type="submit">Get Started</button>
</form>
```

Form → API route → GoHighLevel

### Pattern 3: GHL API Integration

```typescript
// app/api/leads/route.ts
export async function POST(request: Request) {
  const data = await request.json();

  const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: data.name.split(' ')[0],
      email: data.email,
      phone: data.phone,
      tags: ['website-lead'],
    }),
  });

  return NextResponse.json({ success: true });
}
```

ENV: `GHL_API_KEY`, `GHL_LOCATION_ID`

### Pattern 4: SEO & Conversion

**Metadata**:
```typescript
export const metadata: Metadata = {
  title: 'Your Service | Transform Business',
  description: 'Compelling conversion-focused description',
  openGraph: { images: ['/og-image.jpg'] },
};
```

**Conversion checklist**:
- [ ] CTA above the fold
- [ ] Multiple CTAs (hero, features, footer)
- [ ] Minimal form fields (name, email, phone only)
- [ ] Social proof (testimonials, logos)
- [ ] Mobile responsive
- [ ] <3s load time

### Pattern 5: Common Enhancements

- Exit-intent popup
- Countdown timer (urgency)
- Live chat widget
- Video testimonials
- FAQ accordion
- Trust badges (SSL, guarantees)

## Quick Reference

| Component | Location | Tool |
|-----------|----------|------|
| Form | components/forms/ | React Hook Form + Zod |
| API | app/api/leads/ | GHL API |
| SEO | app/page.tsx | next/seo |
| Styling | Tailwind classes | Utility-first |

### Performance Targets

- First Contentful Paint: <1.8s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s

## Command Templates

```bash
# Install dependencies
npm install react-hook-form @hookform/resolvers/zod zod

# Environment setup
echo "GHL_API_KEY=your_key" >> .env.local
echo "GHL_LOCATION_ID=your_location" >> .env.local

# Create form component
mkdir -p components/forms
# Create API route
mkdir -p app/api/leads
```

## Integration with Other Skills

- Use **genesis-stack-setup** for GHL API configuration
- Use **genesis-deployment** for Netlify deployment
- Use **genesis-commands** for complete command sequence
- For multi-page site, consider **genesis-saas-app** patterns

## Deep Dive

For complete patterns and code examples, reference:
- docs/LANDING_PAGE_TEMPLATE.md (full form patterns, GHL integration, optimization)
