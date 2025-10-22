"""
Code Generator - Generates actual code from Genesis patterns.

This module:
- Takes Genesis patterns and specifications
- Generates actual code files
- Uses templates for each pattern type
- Integrates with Phase 1 Build command
"""

import os
from typing import Dict, Any, List
from pathlib import Path
from dataclasses import dataclass


@dataclass
class GeneratedFile:
    """Represents a generated file."""
    path: str
    content: str
    file_type: str  # 'component', 'api', 'lib', 'test', etc.


class CodeGenerator:
    """
    Generates code from Genesis patterns.

    Supports:
    - Template-based generation
    - Pattern-specific code
    - File creation in target directory
    - Integration with existing codebase
    """

    def __init__(self, project_root: str = None):
        """
        Initialize code generator.

        Args:
            project_root: Root directory of target project (defaults to cwd)
        """
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.templates_dir = Path(__file__).parent.parent / "templates"

    def generate_from_pattern(
        self,
        pattern: Dict[str, Any],
        feature_spec: Dict[str, Any]
    ) -> List[GeneratedFile]:
        """
        Generate code from a Genesis pattern.

        Args:
            pattern: Genesis pattern dictionary
            feature_spec: Feature specification with:
                - feature_name: Name of feature
                - description: Feature description
                - custom_config: Optional custom configuration

        Returns:
            List of GeneratedFile objects
        """
        pattern_id = pattern.get("id", "")

        # Route to pattern-specific generator
        if pattern_id.startswith("lp_"):
            return self._generate_landing_page_pattern(pattern, feature_spec)
        elif pattern_id.startswith("saas_"):
            return self._generate_saas_pattern(pattern, feature_spec)
        else:
            raise ValueError(f"Unknown pattern type: {pattern_id}")

    def write_files(
        self,
        files: List[GeneratedFile],
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """
        Write generated files to disk.

        Args:
            files: List of GeneratedFile objects
            dry_run: If True, don't actually write files

        Returns:
            Dictionary with:
                - files_written: List of file paths
                - files_skipped: List of skipped files (already exist)
                - dry_run: Whether this was a dry run
        """
        written = []
        skipped = []

        for file in files:
            file_path = self.project_root / file.path

            # Check if file already exists
            if file_path.exists():
                skipped.append(file.path)
                continue

            if not dry_run:
                # Create parent directories
                file_path.parent.mkdir(parents=True, exist_ok=True)

                # Write file
                file_path.write_text(file.content)
                written.append(file.path)
            else:
                written.append(f"{file.path} (dry run)")

        return {
            "files_written": written,
            "files_skipped": skipped,
            "dry_run": dry_run
        }

    # ========================================================================
    # Landing Page Pattern Generators
    # ========================================================================

    def _generate_landing_page_pattern(
        self,
        pattern: Dict[str, Any],
        feature_spec: Dict[str, Any]
    ) -> List[GeneratedFile]:
        """Generate code for landing page patterns."""
        pattern_id = pattern["id"]

        generators = {
            "lp_hero_section": self._generate_hero_section,
            "lp_features_showcase": self._generate_features_showcase,
            "lp_contact_form": self._generate_contact_form,
            "lp_social_proof": self._generate_social_proof,
            "lp_pricing_table": self._generate_pricing_table,
            "lp_faq": self._generate_faq_section,
        }

        generator = generators.get(pattern_id)
        if not generator:
            raise ValueError(f"No generator for pattern: {pattern_id}")

        return generator(feature_spec)

    def _generate_hero_section(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate hero section component."""
        component_content = '''import React from 'react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">
            Transform Your Workflow
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Build faster, ship smarter, and scale effortlessly with our platform.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              Get Started
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
'''

        return [
            GeneratedFile(
                path="components/Hero.tsx",
                content=component_content,
                file_type="component"
            )
        ]

    def _generate_features_showcase(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate features showcase component."""
        component_content = '''import React from 'react';

const features = [
  {
    title: "Fast Performance",
    description: "Lightning-fast load times and optimized performance",
    icon: "⚡"
  },
  {
    title: "Secure by Default",
    description: "Enterprise-grade security built into every layer",
    icon: "🔒"
  },
  {
    title: "Easy Integration",
    description: "Seamless integration with your existing tools",
    icon: "🔌"
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock support from our expert team",
    icon: "💬"
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

        return [
            GeneratedFile(
                path="components/Features.tsx",
                content=component_content,
                file_type="component"
            )
        ]

    def _generate_contact_form(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate contact form with API route."""
        component_content = '''import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <h2 className="text-4xl font-bold text-center mb-12">Get In Touch</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>

          {status === 'success' && (
            <p className="text-green-600 text-center">Message sent successfully!</p>
          )}
          {status === 'error' && (
            <p className="text-red-600 text-center">Failed to send. Please try again.</p>
          )}
        </form>
      </div>
    </section>
  );
}
'''

        api_route_content = '''import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Implement email sending (e.g., with SendGrid, Resend, etc.)
    console.log('Contact form submission:', { name, email, message });

    // For now, just return success
    return NextResponse.json(
      { success: true, message: 'Contact form received' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
'''

        return [
            GeneratedFile(
                path="components/ContactForm.tsx",
                content=component_content,
                file_type="component"
            ),
            GeneratedFile(
                path="app/api/contact/route.ts",
                content=api_route_content,
                file_type="api"
            )
        ]

    def _generate_social_proof(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate social proof/testimonials component."""
        component_content = '''import React from 'react';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechCorp",
    content: "This platform transformed our workflow. We're 3x more productive!",
    avatar: "👩‍💼"
  },
  {
    name: "Mike Chen",
    role: "CTO, StartupXYZ",
    content: "The best investment we've made. ROI within 2 months.",
    avatar: "👨‍💻"
  },
  {
    name: "Emily Davis",
    role: "Product Manager",
    content: "Intuitive, powerful, and reliable. Our team loves it!",
    avatar: "👩‍🔬"
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">
          Loved by Teams Worldwide
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg">
              <div className="text-5xl mb-4">{testimonial.avatar}</div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

        return [
            GeneratedFile(
                path="components/Testimonials.tsx",
                content=component_content,
                file_type="component"
            )
        ]

    def _generate_pricing_table(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate pricing table component."""
        component_content = '''import React from 'react';

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    features: [
      "Up to 10 users",
      "Basic features",
      "Email support",
      "1GB storage"
    ],
    highlighted: false
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    features: [
      "Up to 50 users",
      "All features",
      "Priority support",
      "10GB storage",
      "Advanced analytics"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited users",
      "Custom features",
      "24/7 dedicated support",
      "Unlimited storage",
      "Custom integrations",
      "SLA guarantee"
    ],
    highlighted: false
  }
];

export default function Pricing() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">
          Simple, Transparent Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-lg ${
                plan.highlighted ? 'ring-4 ring-blue-500 shadow-2xl' : 'shadow-md'
              }`}
            >
              {plan.highlighted && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  Popular
                </span>
              )}
              <h3 className="text-2xl font-bold mt-4 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

        return [
            GeneratedFile(
                path="components/Pricing.tsx",
                content=component_content,
                file_type="component"
            )
        ]

    def _generate_faq_section(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate FAQ section component."""
        component_content = '''import React, { useState } from 'react';

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "Our 14-day free trial gives you full access to all features. No credit card required."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time with no penalties or fees."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and wire transfers for enterprise plans."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-4xl font-bold text-center mb-16">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-semibold">{faq.question}</span>
                <span className="text-2xl">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

        return [
            GeneratedFile(
                path="components/FAQ.tsx",
                content=component_content,
                file_type="component"
            )
        ]

    # ========================================================================
    # SaaS Pattern Generators
    # ========================================================================

    def _generate_saas_pattern(
        self,
        pattern: Dict[str, Any],
        feature_spec: Dict[str, Any]
    ) -> List[GeneratedFile]:
        """Generate code for SaaS patterns."""
        pattern_id = pattern["id"]

        generators = {
            "saas_authentication": self._generate_authentication,
            "saas_dashboard": self._generate_dashboard,
            "saas_settings": self._generate_settings,
            "saas_team_management": self._generate_team_management,
            "saas_api_routes": self._generate_api_routes,
            "saas_notifications": self._generate_notifications,
            "saas_billing": self._generate_billing,
        }

        generator = generators.get(pattern_id)
        if not generator:
            raise ValueError(f"No generator for pattern: {pattern_id}")

        return generator(feature_spec)

    def _generate_authentication(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate authentication system with NextAuth.js."""

        # Login page
        login_content = '''import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Integrate with NextAuth.js signIn
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
'''

        # Signup page
        signup_content = '''import React from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        window.location.href = '/login?signup=success';
      } else {
        const data = await response.json();
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
'''

        # Auth config
        auth_config_content = '''// NextAuth.js configuration
// Install: npm install next-auth @auth/prisma-adapter
// Docs: https://next-auth.js.org/

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Implement user authentication logic
        // Verify credentials against database
        // Return user object if valid, null if invalid

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Example placeholder
        // const user = await prisma.user.findUnique({ where: { email: credentials.email }});
        // if (user && await bcrypt.compare(credentials.password, user.password)) {
        //   return { id: user.id, email: user.email, name: user.name };
        // }

        return null;
      }
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
'''

        # Middleware for protected routes
        middleware_content = '''import { withAuth } from 'next-auth/middleware';

// Protect routes that require authentication
export default withAuth({
  pages: {
    signIn: '/login',
  },
});

// Specify which routes to protect
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/team/:path*',
  ],
};
'''

        return [
            GeneratedFile(
                path="app/(auth)/login/page.tsx",
                content=login_content,
                file_type="component"
            ),
            GeneratedFile(
                path="app/(auth)/signup/page.tsx",
                content=signup_content,
                file_type="component"
            ),
            GeneratedFile(
                path="lib/auth/config.ts",
                content=auth_config_content,
                file_type="lib"
            ),
            GeneratedFile(
                path="middleware.ts",
                content=middleware_content,
                file_type="lib"
            )
        ]

    def _generate_dashboard(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate dashboard component."""
        component_content = '''import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm mb-2">Total Users</h3>
          <p className="text-3xl font-bold">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm mb-2">Active Projects</h3>
          <p className="text-3xl font-bold">42</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm mb-2">Revenue</h3>
          <p className="text-3xl font-bold">$12.5K</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">New user registered</p>
              <p className="text-sm text-gray-600">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Project completed</p>
              <p className="text-sm text-gray-600">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Payment received</p>
              <p className="text-sm text-gray-600">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'''

        return [
            GeneratedFile(
                path="app/dashboard/page.tsx",
                content=component_content,
                file_type="component"
            )
        ]

    def _generate_settings(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate settings page with profile and preferences."""

        settings_content = '''import React from 'react';

export default function SettingsPage() {
  const [formData, setFormData] = React.useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Inc',
    bio: '',
    emailNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
  });
  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Email Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications about your account activity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-gray-600">Receive emails about new features and offers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.marketingEmails}
                    onChange={(e) => setFormData({ ...formData, marketingEmails: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Digest</p>
                  <p className="text-sm text-gray-600">Receive a weekly summary of your activity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.weeklyDigest}
                    onChange={(e) => setFormData({ ...formData, weeklyDigest: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white p-6 rounded-lg shadow border-2 border-red-200">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-gray-600 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Delete Account
            </button>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between">
            <div>
              {saved && (
                <span className="text-green-600 font-medium">✓ Settings saved successfully</span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'''

        return [
            GeneratedFile(
                path="app/settings/page.tsx",
                content=settings_content,
                file_type="component"
            )
        ]

    def _generate_team_management(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate team management with members and invitations."""

        team_page_content = '''import React from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar: string;
  joinedAt: string;
}

export default function TeamPage() {
  const [members, setMembers] = React.useState<TeamMember[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', avatar: '👨', joinedAt: '2024-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin', avatar: '👩', joinedAt: '2024-02-20' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'member', avatar: '👤', joinedAt: '2024-03-10' },
  ]);
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'admin' | 'member'>('member');

  const handleInvite = async () => {
    // TODO: Implement invitation API call
    console.log('Inviting:', inviteEmail, 'as', inviteRole);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setMembers(members.filter(m => m.id !== memberId));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Team Management</h1>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            + Invite Member
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{member.avatar}</span>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="colleague@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'''

        return [
            GeneratedFile(
                path="app/team/page.tsx",
                content=team_page_content,
                file_type="component"
            )
        ]

    def _generate_api_routes(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate RESTful API routes with examples."""

        # Example API route for users
        users_api_content = '''import { NextRequest, NextResponse } from 'next/server';

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch users from database
    const users = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // TODO: Create user in database
    const newUser = { id: Date.now().toString(), name, email };

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
'''

        # Dynamic API route for user by ID
        user_by_id_api_content = '''import { NextRequest, NextResponse } from 'next/server';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Fetch user from database
    const user = { id, name: 'John Doe', email: 'john@example.com' };

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // TODO: Update user in database
    const updatedUser = { id, ...body };

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Delete user from database

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
'''

        return [
            GeneratedFile(
                path="app/api/users/route.ts",
                content=users_api_content,
                file_type="api"
            ),
            GeneratedFile(
                path="app/api/users/[id]/route.ts",
                content=user_by_id_api_content,
                file_type="api"
            )
        ]

    def _generate_notifications(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate toast notifications system with context."""

        # Notification context
        context_content = '''import React, { createContext, useContext, useState } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: NotificationType, message: string, duration = 5000) => {
    const id = Date.now().toString();
    const notification = { id, type, message, duration };

    setNotifications((prev) => [...prev, notification]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => removeNotification(id), duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
'''

        # Notification component
        component_content = '''import React from 'react';
import { useNotifications } from '@/lib/notifications/context';

export default function Notifications() {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center justify-between p-4 rounded-lg border shadow-lg min-w-[320px] animate-slide-in ${getNotificationStyles(
            notification.type
          )}`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getIcon(notification.type)}</span>
            <p className="font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
'''

        return [
            GeneratedFile(
                path="lib/notifications/context.tsx",
                content=context_content,
                file_type="lib"
            ),
            GeneratedFile(
                path="components/Notifications.tsx",
                content=component_content,
                file_type="component"
            )
        ]

    def _generate_billing(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate Stripe billing integration."""

        # Billing page
        billing_page_content = '''import React from 'react';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = React.useState('pro');
  const [loading, setLoading] = React.useState(false);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      features: ['10 projects', '5 GB storage', 'Email support']
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 79,
      features: ['Unlimited projects', '50 GB storage', 'Priority support', 'Advanced analytics']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      features: ['Everything in Pro', 'Unlimited storage', '24/7 dedicated support', 'Custom integrations']
    }
  ];

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      // TODO: Integrate with Stripe API
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Failed to start checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      // TODO: Create Stripe customer portal session
      const response = await fetch('/api/billing/customer-portal', {
        method: 'POST'
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-gray-600 mb-8">Manage your subscription and billing information</p>

        {/* Current Plan */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold capitalize">{currentPlan} Plan</p>
              <p className="text-gray-600">
                ${plans.find(p => p.id === currentPlan)?.price}/month
              </p>
            </div>
            <button
              onClick={handleManageSubscription}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                💳
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-gray-600">Expires 12/2025</p>
              </div>
            </div>
            <button
              onClick={handleManageSubscription}
              className="text-blue-600 hover:text-blue-800"
            >
              Update
            </button>
          </div>
        </div>

        {/* Available Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white p-6 rounded-lg shadow ${
                  plan.id === currentPlan ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold mb-6">
                  ${plan.price}
                  <span className="text-base font-normal text-gray-600">/month</span>
                </p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id === currentPlan ? (
                  <button
                    disabled
                    className="w-full py-2 bg-gray-200 text-gray-600 rounded-md"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Processing...' : 'Upgrade'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3">Date</th>
                <th className="text-left py-3">Description</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-right py-3">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-3">Oct 1, 2024</td>
                <td className="py-3">Professional Plan</td>
                <td className="py-3">$79.00</td>
                <td className="py-3 text-right">
                  <button className="text-blue-600 hover:text-blue-800">Download</button>
                </td>
              </tr>
              <tr>
                <td className="py-3">Sep 1, 2024</td>
                <td className="py-3">Professional Plan</td>
                <td className="py-3">$79.00</td>
                <td className="py-3 text-right">
                  <button className="text-blue-600 hover:text-blue-800">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
'''

        # Stripe checkout API route
        checkout_api_content = '''import { NextRequest, NextResponse } from 'next/server';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json();

    // TODO: Create Stripe Checkout Session
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   payment_method_types: ['card'],
    //   line_items: [
    //     {
    //       price: getPriceIdForPlan(planId),
    //       quantity: 1,
    //     },
    //   ],
    //   success_url: `${process.env.NEXT_PUBLIC_URL}/billing?success=true`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing?canceled=true`,
    // });

    // return NextResponse.json({ url: session.url });

    // Placeholder response
    return NextResponse.json({
      url: '/billing?success=true',
      message: 'Stripe integration needed'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
'''

        return [
            GeneratedFile(
                path="app/billing/page.tsx",
                content=billing_page_content,
                file_type="component"
            ),
            GeneratedFile(
                path="app/api/billing/create-checkout-session/route.ts",
                content=checkout_api_content,
                file_type="api"
            )
        ]
