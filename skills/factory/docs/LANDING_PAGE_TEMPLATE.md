# Genesis Landing Page Template

## Purpose
High-conversion landing pages for lead generation with GoHighLevel integration.

## Architecture Pattern

### Page Structure
```
Landing Page
├── Hero Section (Above fold)
│   ├── Headline (value proposition)
│   ├── Subheadline (benefit)
│   ├── CTA Button (primary action)
│   └── Hero Image/Video
├── Social Proof Section
│   ├── Client logos
│   ├── Testimonials
│   └── Stats/Numbers
├── Features/Benefits
│   ├── 3-5 key features
│   └── Icon + Description format
├── Lead Capture Form
│   ├── Name (required)
│   ├── Email (required)
│   ├── Phone (required)
│   └── Custom fields (optional)
└── Footer
    ├── Contact info
    └── Legal links
```

## Form Pattern

### Standard Lead Capture Form

```typescript
// components/forms/LeadCaptureForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function LeadCaptureForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    // Submit to API route
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Success handling
      alert('Thank you! We\'ll be in touch soon.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('name')} placeholder="Full Name" />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('phone')} placeholder="Phone" />
      {errors.phone && <span>{errors.phone.message}</span>}

      <button type="submit">Get Started</button>
    </form>
  );
}
```

## GoHighLevel Integration

### API Route Pattern

```typescript
// app/api/leads/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();

  // Send to GoHighLevel
  const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: data.name.split(' ')[0],
      lastName: data.name.split(' ').slice(1).join(' '),
      email: data.email,
      phone: data.phone,
      // Add to specific pipeline/campaign
      tags: ['website-lead', 'landing-page'],
    }),
  });

  if (!ghlResponse.ok) {
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

## SEO Pattern

### Metadata Configuration

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Service | Transform Your Business',
  description: 'Compelling description of your service that drives conversions',
  openGraph: {
    title: 'Your Service | Transform Your Business',
    description: 'Compelling description of your service that drives conversions',
    images: ['/og-image.jpg'],
  },
};
```

## Conversion Optimization Patterns

### CTA Best Practices
1. **Above the fold**: Primary CTA visible without scrolling
2. **Action-oriented**: "Get Started" > "Submit"
3. **Color contrast**: CTA button stands out
4. **Multiple CTAs**: Repeat at logical points (hero, after features, footer)

### Form Optimization
1. **Minimal fields**: Only ask for essential info
2. **Progressive disclosure**: Show advanced fields conditionally
3. **Inline validation**: Real-time error feedback
4. **Success feedback**: Clear confirmation after submission

### Trust Elements
1. **Social proof**: Client logos, testimonials
2. **Security badges**: SSL, privacy policy
3. **Guarantees**: Money-back, satisfaction guarantee
4. **Contact info**: Phone, email visible

## Deployment Checklist

- [ ] Environment variables configured (GHL_API_KEY, etc.)
- [ ] Forms tested with real GoHighLevel account
- [ ] SEO metadata complete
- [ ] Mobile responsive verified
- [ ] Page speed optimized (<3s load)
- [ ] Analytics tracking installed
- [ ] Domain configured (if custom)
- [ ] SSL certificate active

## Performance Targets

- **First Contentful Paint**: <1.8s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.5s
- **Cumulative Layout Shift**: <0.1

## Common Enhancements

- Exit-intent popup
- Countdown timer (for limited offers)
- Live chat widget
- Video testimonials
- FAQ section
- Price comparison table
