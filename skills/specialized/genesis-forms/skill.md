---
name: genesis-forms
description: Form patterns for Genesis projects including validation, error handling, and multi-step forms
---

# Genesis Forms

## When to Use This Skill

Load this skill when user mentions:
- "form" OR "forms" OR "input"
- "validation" OR "validate"
- "lead capture" OR "contact form" OR "signup form"
- "multi-step" OR "wizard" OR "multi-page form"
- "error handling" OR "error messages"
- "react hook form" OR "zod"

## Key Patterns

### Pattern 1: Basic Lead Capture Form

**Form component** (React Hook Form + Zod):
```typescript
// components/forms/LeadCaptureForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

// Define schema
const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  message: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function LeadCaptureForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Submission failed');

      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name *
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email *
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Phone *
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Message (optional) */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>

      {/* Status messages */}
      {submitStatus === 'success' && (
        <p className="text-green-600 text-sm">
          Thank you! We'll be in touch soon.
        </p>
      )}
      {submitStatus === 'error' && (
        <p className="text-red-600 text-sm">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
```

### Pattern 2: Advanced Validation Schemas

**Complex validation**:
```typescript
// types/schemas.ts
import { z } from 'zod';

// Phone validation
const phoneRegex = /^[\d\s\-\+\(\)]+$/;
const phoneSchema = z.string()
  .regex(phoneRegex, 'Invalid phone number format')
  .min(10, 'Phone too short')
  .max(15, 'Phone too long');

// Custom email validation
const emailSchema = z.string()
  .email('Invalid email')
  .refine((email) => !email.includes('+'), 'Aliases not allowed');

// Password with requirements
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

// Signup form
export const signupSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, 'Must accept terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

// Conditional validation
export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  contactMethod: z.enum(['email', 'phone']),
  phone: z.string().optional(),
}).refine((data) => {
  if (data.contactMethod === 'phone') {
    return data.phone && data.phone.length >= 10;
  }
  return true;
}, {
  message: 'Phone required when selecting phone contact',
  path: ['phone'],
});
```

### Pattern 3: Multi-Step Form (Wizard)

**Multi-step form pattern**:
```typescript
// components/forms/MultiStepForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Step 1 schema
const step1Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// Step 2 schema
const step2Schema = z.object({
  company: z.string().min(2),
  industry: z.string(),
});

// Step 3 schema
const step3Schema = z.object({
  budget: z.number().min(1000),
  timeline: z.string(),
});

// Combined schema
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormData = z.infer<typeof fullSchema>;

export function MultiStepForm() {
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    if (step === 1) fieldsToValidate = ['name', 'email'];
    if (step === 2) fieldsToValidate = ['company', 'industry'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data: FormData) => {
    console.log('Form submitted:', data);
    // Submit to API
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className={step >= 1 ? 'text-blue-600' : 'text-gray-400'}>
            Personal Info
          </span>
          <span className={step >= 2 ? 'text-blue-600' : 'text-gray-400'}>
            Company Info
          </span>
          <span className={step >= 3 ? 'text-blue-600' : 'text-gray-400'}>
            Project Details
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label>Name</label>
              <input {...register('name')} type="text" />
              {errors.name && <p className="text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label>Email</label>
              <input {...register('email')} type="email" />
              {errors.email && <p className="text-red-600">{errors.email.message}</p>}
            </div>

            <button type="button" onClick={nextStep}>
              Next
            </button>
          </div>
        )}

        {/* Step 2: Company Info */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label>Company</label>
              <input {...register('company')} type="text" />
              {errors.company && <p className="text-red-600">{errors.company.message}</p>}
            </div>

            <div>
              <label>Industry</label>
              <select {...register('industry')}>
                <option value="">Select...</option>
                <option value="tech">Technology</option>
                <option value="retail">Retail</option>
                <option value="services">Services</option>
              </select>
              {errors.industry && <p className="text-red-600">{errors.industry.message}</p>}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={prevStep}>
                Back
              </button>
              <button type="button" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Project Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label>Budget</label>
              <input {...register('budget', { valueAsNumber: true })} type="number" />
              {errors.budget && <p className="text-red-600">{errors.budget.message}</p>}
            </div>

            <div>
              <label>Timeline</label>
              <input {...register('timeline')} type="text" />
              {errors.timeline && <p className="text-red-600">{errors.timeline.message}</p>}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={prevStep}>
                Back
              </button>
              <button type="submit">
                Submit
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
```

### Pattern 4: Real-Time Validation Feedback

**Live validation with debounce**:
```typescript
// components/forms/EmailInput.tsx
'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export function EmailInput({ register, errors }) {
  const [emailValue, setEmailValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const debouncedEmail = useDebounce(emailValue, 500);

  useEffect(() => {
    if (debouncedEmail && debouncedEmail.includes('@')) {
      checkEmailAvailability(debouncedEmail);
    }
  }, [debouncedEmail]);

  const checkEmailAvailability = async (email: string) => {
    setIsChecking(true);
    try {
      const response = await fetch(`/api/check-email?email=${email}`);
      const { available } = await response.json();
      setIsAvailable(available);
    } catch (error) {
      console.error('Email check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <label>Email</label>
      <input
        {...register('email')}
        type="email"
        onChange={(e) => setEmailValue(e.target.value)}
        className="..."
      />

      {/* Real-time feedback */}
      {isChecking && <p className="text-gray-500">Checking...</p>}
      {isAvailable === true && <p className="text-green-600">✓ Available</p>}
      {isAvailable === false && <p className="text-red-600">✗ Email already taken</p>}
      {errors.email && <p className="text-red-600">{errors.email.message}</p>}
    </div>
  );
}

// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### Pattern 5: Form Persistence

**Auto-save draft**:
```typescript
// components/forms/PersistentForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

export function PersistentForm() {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const formValues = watch();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('formDraft');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach((key) => {
        setValue(key as any, parsed[key]);
      });
    }
  }, [setValue]);

  // Save to localStorage on change
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('formDraft', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: any) => {
    // Submit form
    console.log(data);

    // Clear draft on successful submit
    localStorage.removeItem('formDraft');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Quick Reference

| Form Type | Pattern | Use Case |
|-----------|---------|----------|
| Lead capture | React Hook Form + Zod | Contact forms, signups |
| Multi-step | Wizard with validation per step | Complex forms, onboarding |
| Real-time | Debounced validation | Email/username availability |
| Auto-save | localStorage persistence | Long forms, drafts |
| File upload | FormData with progress | Image/document uploads |

### Validation Patterns

| Field Type | Validation | Example |
|------------|------------|---------|
| Email | `.email()` | `z.string().email()` |
| Phone | `.regex()` | `z.string().regex(/^\d{10}$/)` |
| Password | `.min().regex()` | `z.string().min(8).regex(/[A-Z]/)` |
| URL | `.url()` | `z.string().url()` |
| Date | `.date()` | `z.date().min(new Date())` |
| Number | `.number().min().max()` | `z.number().min(0).max(100)` |

## Command Templates

```bash
# Install dependencies
npm install react-hook-form @hookform/resolvers/zod zod

# Create form component
mkdir -p components/forms
touch components/forms/LeadCaptureForm.tsx

# Create validation schemas
mkdir -p types
touch types/schemas.ts

# Test form validation
npm run dev
# Navigate to form page, test all validations
```

## Integration with Other Skills

- Use **genesis-landing-page** for form placement and styling
- Use **genesis-stack-setup** for GHL lead submission
- Use **genesis-seo-optimization** for form accessibility
- Use **genesis-analytics** for form conversion tracking
- Use **genesis-testing** for form validation testing
- Reference **genesis-troubleshooting** for form submission errors

## Common Form Patterns

### Conditional Fields
```typescript
const schema = z.object({
  needsInvoice: z.boolean(),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
}).refine((data) => {
  if (data.needsInvoice) {
    return data.companyName && data.taxId;
  }
  return true;
}, {
  message: 'Company details required for invoice',
  path: ['companyName'],
});
```

### File Upload
```typescript
const fileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5000000, 'Max 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png'].includes(file.type),
      'Only JPG/PNG'
    ),
});
```

### Array Fields
```typescript
const teamSchema = z.object({
  members: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
  })).min(1, 'At least one member required'),
});
```

## Best Practices

1. **Client-side validation** - Use Zod for instant feedback
2. **Server-side validation** - Always validate in API routes
3. **Error messages** - Clear, actionable messages
4. **Accessibility** - Proper labels, ARIA attributes
5. **Loading states** - Disable button during submission
6. **Success feedback** - Confirm submission to user
7. **Persistence** - Auto-save for long forms

## Deep Dive

For complete form patterns:
- React Hook Form docs: https://react-hook-form.com/
- Zod validation: https://zod.dev/
- Form accessibility: https://www.w3.org/WAI/tutorials/forms/
