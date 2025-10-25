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

## Pattern 6: Landing Page Restart Workflow (v1.2.0)

Landing pages include focused restart workflow with conversion funnel tracking:

### Customize PROJECT_STATUS.md for Landing Page

Include these landing page-specific sections:

```markdown
## Current Phase
- Design ✅ / Development 🔄 / Integration ⏳ / Launch 📅

## Components Status
- [ ] Hero section (headline, CTA, image)
- [ ] Social proof (testimonials, logos, stats)
- [ ] Features section (3-5 key benefits)
- [ ] Lead capture form
- [ ] CTA sections (multiple CTAs throughout)
- [ ] Footer

## Integration Status
- GoHighLevel: ⏳ Pending / ✅ Connected (Webhook: [url])
- Analytics: ⏳ Pending / ✅ GA4 configured (ID: [tracking-id])
- Email: ⏳ Pending / ✅ SendGrid/Mailchimp configured
- Chat Widget: ⏳ Pending / ✅ Installed

## Performance Metrics
- Target Page Speed: <3s load time
- Target FCP: <1.8s
- Target LCP: <2.5s
- Current Speed: [test with Lighthouse]
- Conversion Rate Target: [percentage]
```

### Customize GENESIS_QUICK_START.md for Landing Page

Include landing page-specific commands:

```markdown
## Landing Page Development Quick Reference

### GoHighLevel Webhook Testing
\`\`\`bash
# Test GHL webhook integration
curl -X POST http://localhost:3000/api/leads \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test User","email":"test@example.com","phone":"5551234567"}'

# Check GHL contact created in dashboard
\`\`\`

### Analytics Setup
\`\`\`bash
# Google Analytics 4
# Add GA_MEASUREMENT_ID to .env.local
echo "NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX" >> .env.local
\`\`\`

### Deployment Commands
\`\`\`bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod

# Check live performance
npx unlighthouse --site https://yourdomain.com
\`\`\`

### Common Landing Page Tasks
- Start dev: \`npm run dev\`
- Test form: Visit http://localhost:3000 and submit
- Check GHL: Verify contact in GHL dashboard
- Performance audit: \`npm run build && npx lighthouse http://localhost:3000\`
\`\`\`
```

### Landing Page-Specific Context Recovery

When context is lost, include these landing page reminders in PROJECT_STATUS.md:

- **Conversion Focus**: Every element drives toward lead capture
- **Form Pattern**: React Hook Form + Zod validation → API route → GHL
- **GHL Integration**: Using REST API v1 with Bearer token auth
- **SEO Priority**: Metadata, Open Graph, structured data
- **Performance Target**: <3s load time for maximum conversions

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

# Setup restart workflow (v1.2.0+)
~/projects/project-genesis/templates/generate-restart-script.sh [project-name] "Landing Page"
~/projects/project-genesis/update-existing-project.sh ~/projects/[project-name]
# Then customize PROJECT_STATUS.md with landing page sections above
```

## Integration with Other Skills

- Use **genesis-stack-setup** for GHL API configuration
- Use **genesis-deployment** for Netlify deployment
- Use **genesis-commands** for complete command sequence
- For multi-page site, consider **genesis-saas-app** patterns

## Deep Dive

For complete patterns and code examples, reference:
- docs/LANDING_PAGE_TEMPLATE.md (full form patterns, GHL integration, optimization)
