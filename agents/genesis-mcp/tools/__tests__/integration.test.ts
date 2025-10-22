// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 2
// FILE: Integration Tests
// PURPOSE: Test validation + improvement workflow
// ================================

import { describe, it, expect } from '@jest/globals';
import { validateImplementation } from '../validation.js';
import { suggestImprovements } from '../improvement.js';

describe('Integration: Validation + Improvement Workflow', () => {

  it('should validate poor code and provide actionable improvements', async () => {
    const code = `
const supabase = createClient('https://xyz.supabase.co', 'hardcoded-key');

async function getUsers() {
  const { data } = await supabase.from('users').select('*');
  return data;
}
`;

    // Step 1: Validate
    const validation = await validateImplementation(code, 'supabase-client');

    expect(validation.isValid).toBe(false);
    expect(validation.score).toBeLessThan(8);

    // Step 2: Get improvements
    const improvements = await suggestImprovements(code, 'supabase-client');

    expect(improvements.length).toBeGreaterThan(0);

    // Should have security improvements
    const hasSecurityImprovement = improvements.some(i =>
      i.category === 'security'
    );
    expect(hasSecurityImprovement).toBe(true);

    // Should have high-priority items
    const hasHighPriority = improvements.some(i =>
      i.priority === 'high'
    );
    expect(hasHighPriority).toBe(true);
  });

  it('should validate good code and have minimal high-priority improvements', async () => {
    const code = `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUsers(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .limit(limit);

    if (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}
`;

    // Step 1: Validate
    const validation = await validateImplementation(code, 'supabase-client');

    expect(validation.isValid).toBe(true);
    expect(validation.score).toBeGreaterThanOrEqual(8);

    // Step 2: Get improvements
    const improvements = await suggestImprovements(code, 'supabase-client');

    // Should have zero or very few high-priority improvements
    const highPriorityImprovements = improvements.filter(i =>
      i.priority === 'high'
    );
    expect(highPriorityImprovements.length).toBe(0);
  });

  describe('Complete Development Workflow', () => {
    it('should guide developer from failing to passing code', async () => {
      // Phase 1: Initial implementation (poor quality)
      const initialCode = `
const supabase = createClient('url', 'key');
async function getData() {
  const data = await supabase.from('table').select('*');
  return data;
}
`;

      const initialValidation = await validateImplementation(initialCode, 'supabase-client');
      expect(initialValidation.isValid).toBe(false);

      // Phase 2: Get improvements
      const initialImprovements = await suggestImprovements(initialCode, 'supabase-client');
      expect(initialImprovements.length).toBeGreaterThan(0);

      // Phase 3: Improved implementation
      const improvedCode = `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getData() {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .limit(100);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get data:', error);
    return [];
  }
}
`;

      const improvedValidation = await validateImplementation(improvedCode, 'supabase-client');

      // Should now pass or have significantly improved score
      expect(improvedValidation.score).toBeGreaterThan(initialValidation.score);
      expect(improvedValidation.score).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Performance Validation', () => {
    it('should complete validation and improvement analysis in under 500ms', async () => {
      const code = `
const supabase = createClient(process.env.URL, process.env.KEY);
export async function test() {
  try {
    const { data } = await supabase.from('test').select('*').limit(10);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
`;

      const startTime = Date.now();

      await validateImplementation(code, 'supabase-client');
      await suggestImprovements(code, 'supabase-client');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
    });
  });
});
