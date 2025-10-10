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
        """Generate authentication system."""
        # For now, return placeholder
        # This would be implemented with NextAuth.js or similar
        return [
            GeneratedFile(
                path="app/(auth)/login/page.tsx",
                content="// TODO: Implement login page with NextAuth.js",
                file_type="component"
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
        """Generate settings page."""
        return [
            GeneratedFile(
                path="app/settings/page.tsx",
                content="// TODO: Implement settings page",
                file_type="component"
            )
        ]

    def _generate_team_management(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate team management."""
        return [
            GeneratedFile(
                path="app/team/page.tsx",
                content="// TODO: Implement team management",
                file_type="component"
            )
        ]

    def _generate_api_routes(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate API routes."""
        return [
            GeneratedFile(
                path="app/api/example/route.ts",
                content="// TODO: Implement API routes",
                file_type="api"
            )
        ]

    def _generate_notifications(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate notifications system."""
        return [
            GeneratedFile(
                path="components/Notifications.tsx",
                content="// TODO: Implement notifications",
                file_type="component"
            )
        ]

    def _generate_billing(self, feature_spec: Dict[str, Any]) -> List[GeneratedFile]:
        """Generate billing integration."""
        return [
            GeneratedFile(
                path="app/billing/page.tsx",
                content="// TODO: Implement billing with Stripe",
                file_type="component"
            )
        ]
