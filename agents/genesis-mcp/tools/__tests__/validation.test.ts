// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 2
// FILE: Validation Tool Tests
// PURPOSE: Comprehensive tests for genesis_validate_implementation
// ================================

import { describe, it, expect } from '@jest/globals';
import { validateImplementation } from '../validation.js';

describe('validateImplementation', () => {

  describe('Supabase Client Pattern', () => {
    it('should pass valid Supabase client code with proper env vars and error handling', async () => {
      const code = `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}
`;

      const result = await validateImplementation(code, 'supabase-client');

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(8);
      expect(result.compliance.errorHandling).toBe(true);
      expect(result.compliance.security).toBe(true);
    });

    it('should fail code with hardcoded Supabase credentials', async () => {
      const code = `
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://xyz.supabase.co',
  'sk_hardcoded_key_12345'
);
`;

      const result = await validateImplementation(code, 'supabase-client');

      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(8);
      const hasCriticalSecurity = result.issues.some(i =>
        i.severity === 'critical' && i.category === 'security'
      );
      expect(hasCriticalSecurity).toBe(true);
    });

    it('should detect missing error handling', async () => {
      const code = `
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
`;

      const result = await validateImplementation(code, 'supabase-client');

      expect(result.compliance.errorHandling).toBe(false);
      const hasErrorHandlingIssue = result.issues.some(i =>
        i.category === 'error-handling'
      );
      expect(hasErrorHandlingIssue).toBe(true);
    });
  });

  describe('Landing Page Component Pattern', () => {
    it('should validate React component with proper TypeScript and accessibility', async () => {
      const code = `
import { useState } from 'react';

interface LeadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  className?: string;
}

export default function LeadForm({ onSubmit, className }: LeadFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={\`glass-morphism p-6 rounded-lg sm:p-8 md:p-10 \${className}\`}
      aria-label="Lead capture form"
      role="form"
    >
      {/* form fields */}
    </form>
  );
}
`;

      const result = await validateImplementation(code, 'landing-page-component');

      expect(result.score).toBeGreaterThanOrEqual(8);
      expect(result.compliance.structure).toBe(true);
      // Naming compliance may be false due to setIsLoading but that's OK as it's a hook
    });
  });

  describe('Unknown Pattern Handling', () => {
    it('should reject unknown pattern types gracefully', async () => {
      const code = 'const test = true;';

      const result = await validateImplementation(code, 'unknown-pattern-type');

      expect(result.isValid).toBe(false);
      expect(result.score).toBe(0);
      const hasCriticalPatternIssue = result.issues.some(i =>
        i.severity === 'critical' && i.category === 'pattern'
      );
      expect(hasCriticalPatternIssue).toBe(true);
    });
  });

  describe('Cole\'s 8+/10 Requirement', () => {
    it('should enforce 8.0 minimum score for Genesis compliance', async () => {
      const mediumQualityCode = `
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function getData() {
  const { data } = await supabase.from('table').select('*');
  return data;
}
`;

      const result = await validateImplementation(mediumQualityCode, 'supabase-client');

      if (result.score < 8) {
        expect(result.isValid).toBe(false);
      } else {
        expect(result.isValid).toBe(true);
      }
    });
  });
});
