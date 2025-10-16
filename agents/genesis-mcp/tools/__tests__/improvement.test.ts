// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 2
// FILE: Improvement Tool Tests
// PURPOSE: Tests for genesis_suggest_improvement
// ================================

import { describe, it, expect } from '@jest/globals';
import { suggestImprovements } from '../improvement.js';

describe('suggestImprovements', () => {

  describe('Performance Analysis', () => {
    it('should detect inefficient async loops with forEach', async () => {
      const code = `
async function processItems(items: Item[]) {
  items.forEach(async (item) => {
    await processItem(item);
  });
}
`;

      const suggestions = await suggestImprovements(code, 'landing-page-component');

      const hasAsyncLoopSuggestion = suggestions.some(s =>
        s.category === 'performance' &&
        s.title.toLowerCase().includes('async loop')
      );
      expect(hasAsyncLoopSuggestion).toBe(true);
    });

    it('should suggest memoization for React components', async () => {
      const code = `
function ExpensiveComponent({ data }: Props) {
  const expensiveCalculation = data.map(item => {
    return complexOperation(item);
  });

  return <div>{expensiveCalculation}</div>;
}
`;

      const suggestions = await suggestImprovements(code, 'landing-page-component');

      const hasMemoizationSuggestion = suggestions.some(s =>
        s.title.toLowerCase().includes('memoization')
      );
      expect(hasMemoizationSuggestion).toBe(true);
    });

    it('should detect unbounded database queries', async () => {
      const code = `
async function getAllUsers() {
  const { data } = await supabase.from('users').select('*');
  return data;
}
`;

      const suggestions = await suggestImprovements(code, 'supabase-client');

      const hasUnboundedQuery = suggestions.some(s =>
        s.priority === 'high' &&
        s.title.toLowerCase().includes('unbounded')
      );
      expect(hasUnboundedQuery).toBe(true);
    });
  });

  describe('Maintainability Analysis', () => {
    it('should identify long functions over 50 lines', async () => {
      const code = `
function longFunction() {
${'  const x = 1;\n'.repeat(60)}}
`;

      const suggestions = await suggestImprovements(code, 'landing-page-component');

      const hasLongFunctionSuggestion = suggestions.some(s =>
        s.category === 'maintainability' &&
        s.title.toLowerCase().includes('long function')
      );
      expect(hasLongFunctionSuggestion).toBe(true);
    });

    it('should detect weak TypeScript types (any)', async () => {
      const code = `
async function fetchData(): Promise<any> {
  const data: any = await fetch('/api/data');
  return data;
}
`;

      const suggestions = await suggestImprovements(code, 'landing-page-component');

      const hasTypeScriptTypeSuggestion = suggestions.some(s =>
        s.title.toLowerCase().includes('typescript') ||
        s.title.toLowerCase().includes('types')
      );
      expect(hasTypeScriptTypeSuggestion).toBe(true);
    });
  });

  describe('Priority System', () => {
    it('should prioritize critical security issues as HIGH', async () => {
      const code = `
const supabase = createClient('https://xyz.supabase.co', 'hardcoded-key');
`;

      const suggestions = await suggestImprovements(code, 'supabase-client');

      const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');
      expect(highPrioritySuggestions.length).toBeGreaterThan(0);
    });

    it('should sort suggestions by priority (high, medium, low)', async () => {
      const code = `
const data: any = { test: true };
items.forEach(async (item) => await process(item));
const supabase = createClient('url', 'key');
`;

      const suggestions = await suggestImprovements(code, 'supabase-client');

      // Check that high priority items come first
      if (suggestions.length > 1) {
        const priorities = suggestions.map(s => s.priority);
        const firstHigh = priorities.indexOf('high');
        const firstLow = priorities.indexOf('low');

        if (firstHigh !== -1 && firstLow !== -1) {
          expect(firstHigh).toBeLessThan(firstLow);
        }
      }
    });
  });

  describe('Genesis Compliance', () => {
    it('should suggest improvements for code with score < 8', async () => {
      const code = `
const supabase = createClient(process.env.URL, process.env.KEY);
async function getData() {
  const { data } = await supabase.from('table').select('*');
  return data;
}
`;

      const suggestions = await suggestImprovements(code, 'supabase-client');

      // Should have some suggestions since code lacks error handling
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});
