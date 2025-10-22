// ================================
// PROJECT: Genesis Agent SDK Integration - Phase 1 Week 2
// FILE: agents/genesis-mcp/tests/validation.test.ts
// PURPOSE: Test genesis_validate_implementation tool
// ================================

import {
  validateImplementation,
  formatValidationResult,
} from "../tools/validation.js";

// Test 1: Valid Supabase Client Implementation
const validSupabaseCode = `
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function getUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}
`;

// Test 2: Invalid Supabase Client (hardcoded credentials)
const invalidSupabaseCode = `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://myproject.supabase.co";
const supabaseKey = "sk_test_12345678901234567890";

export const supabase = createClient(supabaseUrl, supabaseKey);
`;

// Test 3: Valid Landing Page Component
const validComponentCode = `
interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
}

export function Hero({ title, subtitle, ctaText, onCtaClick }: HeroProps) {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900"
      role="banner"
      aria-label="Hero section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
          {title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8">
          {subtitle}
        </p>
        <button
          onClick={onCtaClick}
          className="px-6 py-3 sm:px-8 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          aria-label={ctaText}
        >
          {ctaText}
        </button>
      </div>
    </section>
  );
}
`;

async function runTests() {
  console.log("=".repeat(50));
  console.log("Genesis Validation Tool Tests");
  console.log("=".repeat(50));
  console.log();

  // Test 1: Valid Supabase Implementation
  console.log("Test 1: Valid Supabase Client Implementation");
  console.log("-".repeat(50));
  const result1 = await validateImplementation(
    validSupabaseCode,
    "supabase-client"
  );
  console.log(formatValidationResult(result1));
  console.log(
    result1.isValid && result1.score >= 8
      ? "✅ PASS: Should have high score"
      : "❌ FAIL: Expected high score"
  );
  console.log();

  // Test 2: Invalid Supabase Implementation
  console.log("Test 2: Invalid Supabase Client (Hardcoded Credentials)");
  console.log("-".repeat(50));
  const result2 = await validateImplementation(
    invalidSupabaseCode,
    "supabase-client"
  );
  console.log(formatValidationResult(result2));
  console.log(
    !result2.isValid && result2.issues.some((i) => i.severity === "critical")
      ? "✅ PASS: Should detect critical security issues"
      : "❌ FAIL: Expected critical security issues"
  );
  console.log();

  // Test 3: Valid Component Implementation
  console.log("Test 3: Valid Landing Page Component");
  console.log("-".repeat(50));
  const result3 = await validateImplementation(
    validComponentCode,
    "landing-page-component"
  );
  console.log(formatValidationResult(result3));
  console.log(
    result3.isValid && result3.score >= 8
      ? "✅ PASS: Should have high score"
      : "❌ FAIL: Expected high score"
  );
  console.log();

  // Test 4: Unknown Pattern Type
  console.log("Test 4: Unknown Pattern Type");
  console.log("-".repeat(50));
  const result4 = await validateImplementation(validSupabaseCode, "unknown-pattern");
  console.log(formatValidationResult(result4));
  console.log(
    !result4.isValid && result4.score === 0
      ? "✅ PASS: Should fail for unknown pattern"
      : "❌ FAIL: Expected failure for unknown pattern"
  );
  console.log();

  // Summary
  console.log("=".repeat(50));
  console.log("Test Summary");
  console.log("=".repeat(50));
  const allTests = [result1, result2, result3, result4];
  const passedTests = [
    result1.isValid && result1.score >= 8,
    !result2.isValid &&
      result2.issues.some((i) => i.severity === "critical"),
    result3.isValid && result3.score >= 8,
    !result4.isValid && result4.score === 0,
  ];
  const totalPassed = passedTests.filter((p) => p).length;
  console.log(`Passed: ${totalPassed}/4 tests`);
  console.log(totalPassed === 4 ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED");
}

// Run tests
runTests().catch((error) => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
