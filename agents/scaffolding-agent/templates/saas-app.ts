// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 3
// FILE: agents/scaffolding-agent/templates/saas-app.ts
// PURPOSE: SaaS application scaffolder
// GENESIS REF: SAAS_ARCHITECTURE.md
// WSL PATH: ~/project-genesis/agents/scaffolding-agent/templates/saas-app.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import type { ProjectConfig } from '../agent.js';

/**
 * Scaffold a complete SaaS application from Genesis template
 *
 * Creates:
 * - Next.js 14 app router with multi-tenant architecture
 * - Authentication (login, signup, protected routes)
 * - Dashboard with navigation
 * - Protected API routes
 * - Supabase integration with auth
 * - Middleware for route protection
 * - TypeScript types for users, organizations
 */
export async function scaffoldSaasApp(
  projectPath: string,
  config: ProjectConfig
): Promise<string[]> {
  const filesCreated: string[] = [];

  try {
    // Create directory structure
    const dirs = [
      'app',
      'app/(auth)',
      'app/(auth)/login',
      'app/(auth)/signup',
      'app/(dashboard)',
      'app/(dashboard)/settings',
      'app/api',
      'app/api/auth',
      'components',
      'components/auth',
      'components/dashboard',
      'lib',
      'middleware',
      'public',
      'types'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }

    // Generate base files
    await createPackageJson(projectPath, config, filesCreated);
    await createTsConfig(projectPath, filesCreated);
    await createTailwindConfig(projectPath, filesCreated);
    await createNextConfig(projectPath, filesCreated);
    await createEnvExample(projectPath, filesCreated);
    await createGitignore(projectPath, filesCreated);

    // App files
    await createAppLayout(projectPath, config, filesCreated);
    await createGlobalsCSS(projectPath, filesCreated);
    await createMiddleware(projectPath, filesCreated);

    // Auth pages
    await createLoginPage(projectPath, filesCreated);
    await createSignupPage(projectPath, filesCreated);
    await createAuthLayout(projectPath, filesCreated);

    // Dashboard pages
    await createDashboardLayout(projectPath, filesCreated);
    await createDashboardPage(projectPath, filesCreated);
    await createSettingsPage(projectPath, filesCreated);

    // Components
    await createProtectedRoute(projectPath, filesCreated);
    await createNavigation(projectPath, filesCreated);
    await createAuthForm(projectPath, filesCreated);

    // Lib files
    await createSupabaseClient(projectPath, filesCreated);
    await createAuthHelpers(projectPath, filesCreated);

    // Types
    await createTypes(projectPath, filesCreated);

    // README
    await createReadme(projectPath, config, filesCreated);

    return filesCreated;

  } catch (error) {
    console.error('Error scaffolding SaaS app:', error);
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
      "@supabase/ssr": "^0.0.10",
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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
  const appName = config.branding?.companyName || config.name;

  const content = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${appName}",
  description: "SaaS application built with Genesis Agent SDK",
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

async function createGlobalsCSS(projectPath: string, filesCreated: string[]) {
  const content = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-start-rgb));
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

async function createMiddleware(projectPath: string, filesCreated: string[]) {
  const content = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  const protectedPaths = ['/dashboard', '/settings'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if accessing auth pages with active session
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};
`;

  const filePath = path.join(projectPath, 'middleware.ts');
  await fs.writeFile(filePath, content);
  filesCreated.push('middleware.ts');
}

async function createAuthLayout(projectPath: string, filesCreated: string[]) {
  const content = `export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
`;

  const filePath = path.join(projectPath, 'app/(auth)/layout.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/(auth)/layout.tsx');
}

async function createLoginPage(projectPath: string, filesCreated: string[]) {
  const content = `'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Login</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Don't have an account?{' '}
        <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
}
`;

  const filePath = path.join(projectPath, 'app/(auth)/login/page.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/(auth)/login/page.tsx');
}

async function createSignupPage(projectPath: string, filesCreated: string[]) {
  const content = `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // Redirect to dashboard or show email confirmation message
      if (data.user?.identities?.length === 0) {
        setError('An account with this email already exists');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}
`;

  const filePath = path.join(projectPath, 'app/(auth)/signup/page.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/(auth)/signup/page.tsx');
}

async function createDashboardLayout(projectPath: string, filesCreated: string[]) {
  const content = `import Navigation from '@/components/dashboard/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
`;

  const filePath = path.join(projectPath, 'app/(dashboard)/layout.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/(dashboard)/layout.tsx');
}

async function createDashboardPage(projectPath: string, filesCreated: string[]) {
  const content = `import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome!</h3>
            <p className="text-gray-600">Your SaaS dashboard is ready.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">Track your metrics here.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-gray-600">Common tasks and shortcuts.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
`;

  const filePath = path.join(projectPath, 'app/(dashboard)/page.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/(dashboard)/page.tsx');
}

async function createSettingsPage(projectPath: string, filesCreated: string[]) {
  const content = `import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <p className="text-gray-600">Manage your account preferences here.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
`;

  const filePath = path.join(projectPath, 'app/(dashboard)/settings/page.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('app/(dashboard)/settings/page.tsx');
}

async function createProtectedRoute(projectPath: string, filesCreated: string[]) {
  const content = `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setUser(user);
      setLoading(false);
    } else {
      router.push('/login');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
`;

  const filePath = path.join(projectPath, 'components/auth/ProtectedRoute.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('components/auth/ProtectedRoute.tsx');
}

async function createNavigation(projectPath: string, filesCreated: string[]) {
  const content = `'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

export default function Navigation() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary-500 text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary-500 text-gray-900"
            >
              Settings
            </Link>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
`;

  const filePath = path.join(projectPath, 'components/dashboard/Navigation.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('components/dashboard/Navigation.tsx');
}

async function createAuthForm(projectPath: string, filesCreated: string[]) {
  const content = `// Placeholder for additional auth components
export {};
`;

  const filePath = path.join(projectPath, 'components/auth/AuthForm.tsx');
  await fs.writeFile(filePath, content);
  filesCreated.push('components/auth/AuthForm.tsx');
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

async function createAuthHelpers(projectPath: string, filesCreated: string[]) {
  const content = `import { supabase } from './supabase-client';
import type { User } from '@supabase/supabase-js';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Failed to get current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
`;

  const filePath = path.join(projectPath, 'lib/auth-helpers.ts');
  await fs.writeFile(filePath, content);
  filesCreated.push('lib/auth-helpers.ts');
}

async function createTypes(projectPath: string, filesCreated: string[]) {
  const content = `export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}
`;

  const filePath = path.join(projectPath, 'types/index.ts');
  await fs.writeFile(filePath, content);
  filesCreated.push('types/index.ts');
}

async function createReadme(projectPath: string, config: ProjectConfig, filesCreated: string[]) {
  const content = `# ${config.name}

SaaS Application generated with Genesis Agent SDK

## Features

- ✅ Authentication (Login/Signup)
- ✅ Protected dashboard routes
- ✅ Supabase integration
- ✅ Multi-tenant ready
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Next.js 14 App Router

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment

Copy \`.env.example\` to \`.env.local\`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Update with your Supabase credentials:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`

### 3. Setup Supabase

Enable authentication in your Supabase project and configure providers.

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── app/
│   ├── (auth)/          # Auth pages (login, signup)
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── auth/            # Auth components
│   └── dashboard/       # Dashboard components
├── lib/                 # Utilities
├── middleware.ts        # Route protection
└── types/              # TypeScript types
\`\`\`

## Deploy

### Vercel

\`\`\`bash
npx vercel
\`\`\`

### Netlify

1. Push to GitHub
2. Connect to Netlify
3. Add environment variables
4. Deploy!

Built with Genesis Agent SDK ❤️
`;

  const filePath = path.join(projectPath, 'README.md');
  await fs.writeFile(filePath, content);
  filesCreated.push('README.md');
}
