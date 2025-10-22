// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 3
// FILE: agents/scaffolding-agent/templates/landing-page.ts
// PURPOSE: Landing page project scaffolder
// GENESIS REF: LANDING_PAGE_TEMPLATE.md
// WSL PATH: ~/project-genesis/agents/scaffolding-agent/templates/landing-page.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import type { ProjectConfig } from '../agent.js';

/**
 * Scaffold a complete landing page project from Genesis template
 *
 * Creates:
 * - Next.js 14 app router structure
 * - Hero section with CTA
 * - Lead capture form
 * - Footer with branding
 * - Supabase integration
 * - GHL sync integration
 * - Thank you page
 * - Proper TypeScript types
 */
export async function scaffoldLandingPage(
  projectPath: string,
  config: ProjectConfig
): Promise<string[]> {
  const filesCreated: string[] = [];

  try {
    // Create directory structure
    const dirs = [
      'app',
      'app/api',
      'app/api/submit-lead',
      'app/thank-you',
      'components',
      'lib',
      'public',
      'types'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }

    // Generate files
    await createPackageJson(projectPath, config, filesCreated);
    await createTsConfig(projectPath, filesCreated);
    await createTailwindConfig(projectPath, filesCreated);
    await createNextConfig(projectPath, filesCreated);
    await createEnvExample(projectPath, filesCreated);
    await createGitignore(projectPath, filesCreated);

    // App files
    await createAppLayout(projectPath, config, filesCreated);
    await createAppPage(projectPath, config, filesCreated);
    await createThankYouPage(projectPath, config, filesCreated);
    await createGlobalsCSS(projectPath, filesCreated);

    // API routes
    await createSubmitLeadAPI(projectPath, filesCreated);

    // Components
    await createHeroSection(projectPath, config, filesCreated);
    await createLeadForm(projectPath, filesCreated);
    await createFooter(projectPath, config, filesCreated);

    // Lib files
    await createSupabaseClient(projectPath, filesCreated);
    await createGHLSync(projectPath, filesCreated);

    // Types
    await createTypes(projectPath, filesCreated);

    // README
    await createReadme(projectPath, config, filesCreated);

    return filesCreated;

  } catch (error) {
    console.error('Error scaffolding landing page:', error);
    throw error;
  }
}

async function createPackageJson(projectPath: string, config: ProjectConfig, filesCreated: string[]) {
  const content = {
    name: config.name,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint"
    },
    dependencies: {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "next": "14.2.0",
      "@supabase/supabase-js": "^2.39.0",
      "axios": "^1.6.7"
    },
    devDependencies: {
      "typescript": "^5",
      "@types/node": "^20",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "tailwindcss": "^3.4.1",
      "postcss": "^8",
      "autoprefixer": "^10.0.1",
      "eslint": "^8",
      "eslint-config-next": "14.2.0"
    }
  };

  const filePath = path.join(projectPath, 'package.json');
  await fs.writeFile(filePath, JSON.stringify(content, null, 2));
  filesCreated.push('package.json');
}

async function createTsConfig(projectPath: string, filesCreated: string[]) {
  const content = {
    compilerOptions: {
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: {
        "@/*": ["./*"]
      }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  };

  const filePath = path.join(projectPath, 'tsconfig.json');
  await fs.writeFile(filePath, JSON.stringify(content, null, 2));
  filesCreated.push('tsconfig.json');
}

async function createTailwindConfig(projectPath: string, filesCreated: string[]) {
  const content = `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
};

export default config;
`;

  const filePath = path.join(projectPath, 'tailwind.config.ts');
  await fs.writeFile(filePath, content);
  filesCreated.push('tailwind.config.ts');
}

async function createNextConfig(projectPath: string, filesCreated: string[]) {
  const content = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`;

  const filePath = path.join(projectPath, 'next.config.ts');
  await fs.writeFile(filePath, content);
  filesCreated.push('next.config.ts');
}

async function createEnvExample(projectPath: string, filesCreated: string[]) {
  const content = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# GoHighLevel
GHL_API_KEY=your-ghl-api-key
GHL_LOCATION_ID=your-location-id
GHL_WEBHOOK_URL=your-webhook-url
`;

  const filePath = path.join(projectPath, '.env.example');
  await fs.writeFile(filePath, content);
  filesCreated.push('.env.example');
}

async function createGitignore(projectPath: string, filesCreated: string[]) {
  const content = `# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`;

  const filePath = path.join(projectPath, '.gitignore');
  await fs.writeFile(filePath, content);
  filesCreated.push('.gitignore');
}

async function createAppLayout(projectPath: string, config: ProjectConfig, filesCreated: string[]) {
  const companyName = config.branding?.companyName || config.name;

  const content = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${companyName}",
  description: "Generated with Genesis Agent SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
`;

  const filePath = path.join(projectPath, 'app/layout.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/layout.tsx');
}

async function createAppPage(projectPath: string, config: ProjectConfig, filesCreated: string[]) {
  const content = `import HeroSection from "@/components/HeroSection";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      <LeadForm />
      <Footer />
    </main>
  );
}
`;

  const filePath = path.join(projectPath, 'app/page.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/page.tsx');
}

async function createThankYouPage(projectPath: string, config: ProjectConfig, filesCreated: string[]) {
  const companyName = config.branding?.companyName || config.name;

  const content = `import Link from "next/link";

export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Thank You!
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          We've received your information and will be in touch soon.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
`;

  const filePath = path.join(projectPath, 'app/thank-you/page.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/thank-you/page.tsx');
}

async function createGlobalsCSS(projectPath: string, filesCreated: string[]) {
  const content = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
`;

  const filePath = path.join(projectPath, 'app/globals.css');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/globals.css');
}

async function createSubmitLeadAPI(projectPath: string, filesCreated: string[]) {
  const content = `import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { syncToGHL } from '@/lib/ghl-sync';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([{ name, email, phone, message, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // Sync to GHL asynchronously (don't block response)
    syncToGHL({ name, email, phone, message }).catch(err => {
      console.error('GHL sync failed:', err);
      // Don't fail the request if GHL sync fails
    });

    return NextResponse.json({ success: true, lead: data });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

  const filePath = path.join(projectPath, 'app/api/submit-lead/route.ts');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/api/submit-lead/route.ts');
}

async function createHeroSection(projectPath: string, config: ProjectConfig, filesCreated: string[]) {
  const companyName = config.branding?.companyName || config.name;

  const content = `export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-600 to-primary-700 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome to ${companyName}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-primary-100">
          Your journey to success starts here
        </p>
        <a
          href="#lead-form"
          className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition transform hover:scale-105"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
`;

  const filePath = path.join(projectPath, 'components/HeroSection.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('components/HeroSection.tsx');
}

async function createLeadForm(projectPath: string, filesCreated: string[]) {
  const content = `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      router.push('/thank-you');
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Failed to submit form. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <section id="lead-form" className="py-20 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Get in Touch</h2>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tell us about your project..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </section>
  );
}
`;

  const filePath = path.join(projectPath, 'components/LeadForm.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('components/LeadForm.tsx');
}

async function createFooter(projectPath: string, config: ProjectConfig, filesCreated: string[]) {
  const companyName = config.branding?.companyName || config.name;
  const year = new Date().getFullYear();

  const content = `export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-lg font-semibold mb-2">${companyName}</p>
        <p className="text-gray-400">&copy; ${year} ${companyName}. All rights reserved.</p>
        <div className="mt-6 space-x-6">
          <a href="/privacy" className="text-gray-400 hover:text-white transition">
            Privacy Policy
          </a>
          <a href="/terms" className="text-gray-400 hover:text-white transition">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
`;

  const filePath = path.join(projectPath, 'components/Footer.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('components/Footer.tsx');
}

async function createSupabaseClient(projectPath: string, filesCreated: string[]) {
  const content = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`;

  const filePath = path.join(projectPath, 'lib/supabase-client.ts');
  await fs.writeFile(filePath, content);
  filesCreated.push('lib/supabase-client.ts');
}

async function createGHLSync(projectPath: string, filesCreated: string[]) {
  const content = `import axios from 'axios';

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export async function syncToGHL(leadData: LeadData): Promise<void> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.warn('GHL credentials not configured. Skipping sync.');
    return;
  }

  try {
    const response = await axios.post(
      'https://rest.gohighlevel.com/v1/contacts/',
      {
        locationId,
        firstName: leadData.name.split(' ')[0],
        lastName: leadData.name.split(' ').slice(1).join(' ') || '',
        email: leadData.email,
        phone: leadData.phone,
        customField: {
          message: leadData.message || ''
        }
      },
      {
        headers: {
          'Authorization': \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('GHL sync successful:', response.data);
  } catch (error) {
    console.error('GHL sync failed:', error);
    throw error;
  }
}
`;

  const filePath = path.join(projectPath, 'lib/ghl-sync.ts');
  await fs.writeFile(filePath, content);
  filesCreated.push('lib/ghl-sync.ts');
}

async function createTypes(projectPath: string, filesCreated: string[]) {
  const content = `export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  created_at?: string;
}

export interface FormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}
`;

  const filePath = path.join(projectPath, 'types/index.ts');
  await fs.writeFile(filePath, content);
  filesCreated.push('types/index.ts');
}

async function createReadme(projectPath: string, config: ProjectConfig, filesCreated: string[]) {
  const content = `# ${config.name}

Generated with Genesis Agent SDK

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Copy \`.env.example\` to \`.env.local\`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Update the following variables:
- \`NEXT_PUBLIC_SUPABASE_URL\`: Your Supabase project URL
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: Your Supabase anon key
- \`GHL_API_KEY\`: Your GoHighLevel API key (optional)
- \`GHL_LOCATION_ID\`: Your GHL location ID (optional)

### 3. Setup Supabase Database

Create a \`leads\` table in your Supabase project:

\`\`\`sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for lead capture)
CREATE POLICY "Allow public inserts" ON leads
  FOR INSERT TO anon WITH CHECK (true);
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- ✅ Responsive landing page with hero section
- ✅ Lead capture form
- ✅ Supabase integration for data storage
- ✅ GoHighLevel sync (optional)
- ✅ Thank you page
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling

## Project Structure

\`\`\`
├── app/                  # Next.js 14 App Router
│   ├── api/             # API routes
│   ├── thank-you/       # Thank you page
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── HeroSection.tsx
│   ├── LeadForm.tsx
│   └── Footer.tsx
├── lib/                 # Utility functions
│   ├── supabase-client.ts
│   └── ghl-sync.ts
└── types/               # TypeScript types
    └── index.ts
\`\`\`

## Deploy

### Netlify

1. Push to GitHub
2. Connect to Netlify
3. Add environment variables
4. Deploy!

### Vercel

\`\`\`bash
npx vercel
\`\`\`

## Support

Generated by Genesis Agent SDK - Built with ❤️
`;

  const filePath = path.join(projectPath, 'README.md');
  await fs.writeFile(filePath, content);
  filesCreated.push('README.md');
}
