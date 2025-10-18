// ================================
// PROJECT: Genesis Agent SDK - Genesis Feature Agent
// FILE: agents/genesis-feature/patterns/landing-page-patterns.ts
// PURPOSE: Landing page component patterns library
// GENESIS REF: Autonomous Agent Development - Task 3
// WSL PATH: ~/project-genesis/agents/genesis-feature/patterns/landing-page-patterns.ts
// ================================

import { GenesisPattern, FeatureType } from '../types/feature-types.js';

/**
 * Landing Page Pattern Templates
 * Following LANDING_PAGE_TEMPLATE.md from Genesis patterns
 */
export const LANDING_PAGE_PATTERNS: Partial<Record<FeatureType, GenesisPattern>> = {
  'hero-section': {
    id: 'hero-section-v1',
    name: 'Hero Section',
    type: 'hero-section',
    description: 'Compelling hero section with headline, subheadline, and CTA',
    template: {
      component: `import React from 'react';

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  headline,
  subheadline,
  ctaText,
  ctaLink,
  backgroundImage
}) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: \`url(\${backgroundImage})\` }}
        />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          {headline}
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-gray-100">
          {subheadline}
        </p>

        <a
          href={ctaLink}
          className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
};`,
      test: `import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  const defaultProps = {
    headline: 'Test Headline',
    subheadline: 'Test Subheadline',
    ctaText: 'Get Started',
    ctaLink: '#signup'
  };

  it('renders headline and subheadline', () => {
    render(<HeroSection {...defaultProps} />);
    expect(screen.getByText('Test Headline')).toBeInTheDocument();
    expect(screen.getByText('Test Subheadline')).toBeInTheDocument();
  });

  it('renders CTA button with correct link', () => {
    render(<HeroSection {...defaultProps} />);
    const cta = screen.getByText('Get Started');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '#signup');
  });
});`
    },
    requirements: {
      imports: [
        { module: 'react', imports: ['React'], type: 'default' }
      ],
      props: [
        { name: 'headline', type: 'string', required: true, description: 'Main headline text' },
        { name: 'subheadline', type: 'string', required: true, description: 'Supporting subheadline' },
        { name: 'ctaText', type: 'string', required: true, description: 'CTA button text' },
        { name: 'ctaLink', type: 'string', required: true, description: 'CTA button link' }
      ]
    },
    examples: [
      {
        title: 'Basic Hero',
        description: 'Simple hero with gradient background',
        code: '<HeroSection headline="Transform Your Business" subheadline="Complete solution" ctaText="Start Free Trial" ctaLink="/signup" />',
        usage: 'Use for value propositions'
      }
    ],
    metadata: {
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'genesis-pattern-library',
      usageCount: 0,
      successRate: 1.0
    }
  },

  'lead-form': {
    id: 'lead-form-v1',
    name: 'Lead Capture Form',
    type: 'lead-form',
    description: 'Lead capture form with Supabase integration',
    template: {
      component: `import React, { useState } from 'react';

interface LeadFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit logic here
      setSubmitted(true);
      onSuccess?.();
    } catch (error) {
      console.error('Lead submission error:', error);
      onError?.(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h3>
        <p className="text-green-700">We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Get Started</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name *</label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};`,
      test: `import { render, screen, fireEvent } from '@testing-library/react';
import { LeadForm } from './LeadForm';

describe('LeadForm', () => {
  it('renders form fields', () => {
    render(<LeadForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('shows success message after submission', async () => {
    const onSuccess = jest.fn();
    render(<LeadForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getByText('Submit'));

    // Add assertions for success state
  });
});`
    },
    requirements: {
      imports: [
        { module: 'react', imports: ['React', 'useState'], type: 'named' }
      ],
      props: [
        { name: 'onSuccess', type: '() => void', required: false, description: 'Success callback' },
        { name: 'onError', type: '(error: string) => void', required: false, description: 'Error callback' }
      ],
      state: [
        { name: 'formData', type: 'object', initialValue: {}, description: 'Form field values' },
        { name: 'loading', type: 'boolean', initialValue: false, description: 'Submission state' }
      ]
    },
    examples: [
      {
        title: 'Basic Lead Form',
        description: 'Standard lead capture',
        code: '<LeadForm onSuccess={() => console.log("Lead captured!")} />',
        usage: 'Use on landing pages'
      }
    ],
    metadata: {
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'genesis-pattern-library',
      usageCount: 0,
      successRate: 1.0
    }
  }
};

/**
 * Get landing page pattern by feature type
 */
export function getLandingPagePattern(type: FeatureType): GenesisPattern | undefined {
  return LANDING_PAGE_PATTERNS[type];
}
