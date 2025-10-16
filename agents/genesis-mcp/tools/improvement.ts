// ================================
// PROJECT: Genesis Agent SDK Integration - Phase 1 Week 2
// FILE: agents/genesis-mcp/tools/improvement.ts
// PURPOSE: Generate improvement suggestions based on code analysis
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Improvement Tools
// WSL PATH: ~/project-genesis/agents/genesis-mcp/tools/improvement.ts
// ================================

import { validateImplementation, type ValidationResult } from './validation.js';

/**
 * Improvement suggestion structure
 */
export interface ImprovementSuggestion {
  category: 'performance' | 'security' | 'maintainability' | 'genesis-compliance';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentApproach: string;
  suggestedApproach: string;
  genesisReference?: string;
  codeExample?: string;
  impact: string;
}

/**
 * Generate improvement suggestions based on code analysis
 */
export async function suggestImprovements(
  code: string,
  patternType: string,
  context?: string
): Promise<ImprovementSuggestion[]> {
  const suggestions: ImprovementSuggestion[] = [];

  // First, validate to identify issues
  const validation = await validateImplementation(code, patternType);

  // Convert validation issues to improvement suggestions
  for (const issue of validation.issues) {
    if (issue.severity === 'critical' || issue.severity === 'warning') {
      suggestions.push({
        category: issue.category === 'security' ? 'security' : 'genesis-compliance',
        priority: issue.severity === 'critical' ? 'high' : 'medium',
        title: issue.message,
        description: issue.fix || 'Follow Genesis best practices',
        currentApproach: 'Current implementation has issues',
        suggestedApproach: issue.fix || 'Update to match Genesis pattern',
        impact: issue.severity === 'critical'
          ? 'Critical - Security or functionality risk'
          : 'Improves code quality and maintainability'
      });
    }
  }

  // Add performance suggestions
  const perfSuggestions = analyzePerformance(code, patternType);
  suggestions.push(...perfSuggestions);

  // Add maintainability suggestions
  const maintSuggestions = analyzeMaintainability(code);
  suggestions.push(...maintSuggestions);

  // Add Genesis-specific improvements
  const genesisSuggestions = await analyzeGenesisCompliance(code, patternType, validation);
  suggestions.push(...genesisSuggestions);

  // Sort by priority
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Analyze performance opportunities
 */
function analyzePerformance(code: string, patternType: string): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // Check for inefficient loops
  if (code.includes('.forEach') && code.includes('await')) {
    suggestions.push({
      category: 'performance',
      priority: 'medium',
      title: 'Inefficient async loop detected',
      description: 'Using forEach with async operations processes sequentially',
      currentApproach: 'items.forEach(async (item) => await process(item))',
      suggestedApproach: 'await Promise.all(items.map(item => process(item)))',
      codeExample: `
// Instead of:
items.forEach(async (item) => {
  await processItem(item);
});

// Use:
await Promise.all(items.map(item => processItem(item)));
`,
      impact: 'Significant performance improvement for multiple async operations'
    });
  }

  // Check for missing memoization in React components
  if (patternType.includes('component')) {
    if (code.includes('function ') && !code.includes('useMemo') && !code.includes('useCallback')) {
      suggestions.push({
        category: 'performance',
        priority: 'low',
        title: 'Consider memoization for expensive computations',
        description: 'React components can benefit from useMemo and useCallback',
        currentApproach: 'Direct computation on every render',
        suggestedApproach: 'Use useMemo for expensive calculations, useCallback for functions',
        genesisReference: 'LANDING_PAGE_TEMPLATE.md - Performance Optimization',
        impact: 'Reduces unnecessary re-renders and computations'
      });
    }
  }

  // Check for inefficient database queries
  if (code.includes('supabase') && (code.includes('.select(') || code.includes('.select ('))){
    if (!code.includes('.limit(') && !code.includes('.range(')) {
      suggestions.push({
        category: 'performance',
        priority: 'high',
        title: 'Unbounded database query',
        description: 'Query results should be limited to prevent memory issues',
        currentApproach: '.select("*")',
        suggestedApproach: '.select("*").limit(100) or .range(0, 99)',
        genesisReference: 'STACK_SETUP.md - Supabase Query Optimization',
        impact: 'Prevents loading excessive data and potential timeouts'
      });
    }
  }

  return suggestions;
}

/**
 * Analyze maintainability
 */
function analyzeMaintainability(code: string): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // Check function length - count actual lines not just split
  const lines = code.split('\n');
  if (lines.length > 50) {
    // Try to detect if there's actually a long function
    const functionMatches = code.matchAll(/(?:function|const)\s+(\w+)[^{]*{/g);
    let hasLongFunction = false;

    for (const match of functionMatches) {
      const functionStart = match.index || 0;
      const afterFunction = code.substring(functionStart);
      const functionCode = afterFunction.substring(0, afterFunction.indexOf('}') + 1);

      if (functionCode.split('\n').length > 50) {
        hasLongFunction = true;
        break;
      }
    }

    if (hasLongFunction) {
      suggestions.push({
        category: 'maintainability',
        priority: 'medium',
        title: 'Long function detected',
        description: 'Functions over 50 lines are harder to test and maintain',
        currentApproach: 'Single large function',
        suggestedApproach: 'Break into smaller, focused functions',
        impact: 'Improves code readability, testability, and maintainability'
      });
    }
  }

  // Check for magic numbers
  const magicNumbers = code.match(/\b\d{3,}\b/g);
  if (magicNumbers && magicNumbers.length > 2) {
    suggestions.push({
      category: 'maintainability',
      priority: 'low',
      title: 'Magic numbers found',
      description: 'Replace hardcoded numbers with named constants',
      currentApproach: 'Hardcoded numeric values',
      suggestedApproach: 'const MAX_RETRIES = 3; const TIMEOUT_MS = 5000;',
      impact: 'Makes code more readable and easier to configure'
    });
  }

  // Check for missing TypeScript types
  if (code.includes('any') || code.includes(': Object')) {
    suggestions.push({
      category: 'maintainability',
      priority: 'medium',
      title: 'Weak TypeScript types',
      description: 'Avoid "any" and generic "Object" types',
      currentApproach: 'any or Object types',
      suggestedApproach: 'Define specific interfaces or types',
      codeExample: `
// Instead of:
const data: any = await fetchData();

// Use:
interface UserData {
  id: string;
  name: string;
  email: string;
}
const data: UserData = await fetchData();
`,
      impact: 'Better type safety and IDE autocomplete'
    });
  }

  return suggestions;
}

/**
 * Analyze Genesis compliance
 */
async function analyzeGenesisCompliance(
  code: string,
  patternType: string,
  validation: ValidationResult
): Promise<ImprovementSuggestion[]> {
  const suggestions: ImprovementSuggestion[] = [];

  // Check for missing Genesis patterns
  if (validation.score < 8) {
    suggestions.push({
      category: 'genesis-compliance',
      priority: 'high',
      title: `Genesis compliance score: ${validation.score}/10`,
      description: 'Code does not meet Genesis 8+/10 requirement',
      currentApproach: 'Custom implementation',
      suggestedApproach: 'Follow Genesis pattern exactly',
      genesisReference: `See ${patternType} pattern in Genesis docs`,
      impact: 'Ensures consistency with Genesis architecture'
    });
  }

  // Check for missing error handling patterns
  if (!validation.compliance.errorHandling) {
    suggestions.push({
      category: 'genesis-compliance',
      priority: 'high',
      title: 'Insufficient error handling',
      description: 'Genesis requires comprehensive error handling',
      currentApproach: 'Minimal or no error handling',
      suggestedApproach: 'Add try-catch, error logging, and user-friendly error messages',
      genesisReference: 'All Genesis patterns include error handling',
      codeExample: `
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return {
    success: false,
    error: 'User-friendly error message'
  };
}
`,
      impact: 'Better user experience and easier debugging'
    });
  }

  // Check for missing documentation
  if (!code.includes('/**') && !code.includes('//')) {
    suggestions.push({
      category: 'genesis-compliance',
      priority: 'low',
      title: 'Missing documentation',
      description: 'Genesis patterns include comprehensive documentation',
      currentApproach: 'No inline documentation',
      suggestedApproach: 'Add JSDoc comments for functions and complex logic',
      impact: 'Improves code maintainability and team collaboration'
    });
  }

  return suggestions;
}

/**
 * Format improvement suggestions for display
 */
export function formatImprovementSuggestions(suggestions: ImprovementSuggestion[]): string {
  if (suggestions.length === 0) {
    return `
=================================
Genesis Improvement Analysis
=================================

✅ No improvements needed!
Code follows Genesis best practices.
=================================
`;
  }

  let output = `
=================================
Genesis Improvement Suggestions
=================================

Found ${suggestions.length} improvement${suggestions.length > 1 ? 's' : ''}

`;

  const high = suggestions.filter(s => s.priority === 'high');
  const medium = suggestions.filter(s => s.priority === 'medium');
  const low = suggestions.filter(s => s.priority === 'low');

  if (high.length > 0) {
    output += '\n🔴 HIGH PRIORITY\n';
    output += '─────────────────────────\n';
    high.forEach((s, i) => {
      output += formatSuggestion(s, i + 1);
    });
  }

  if (medium.length > 0) {
    output += '\n🟡 MEDIUM PRIORITY\n';
    output += '─────────────────────────\n';
    medium.forEach((s, i) => {
      output += formatSuggestion(s, i + 1);
    });
  }

  if (low.length > 0) {
    output += '\n🟢 LOW PRIORITY\n';
    output += '─────────────────────────\n';
    low.forEach((s, i) => {
      output += formatSuggestion(s, i + 1);
    });
  }

  output += '\n=================================\n';
  return output;
}

function formatSuggestion(s: ImprovementSuggestion, index: number): string {
  let output = `\n${index}. ${s.title}\n`;
  output += `   Category: ${s.category}\n`;
  output += `   Description: ${s.description}\n`;
  output += `   Current: ${s.currentApproach}\n`;
  output += `   Suggested: ${s.suggestedApproach}\n`;
  if (s.genesisReference) {
    output += `   Genesis Ref: ${s.genesisReference}\n`;
  }
  if (s.codeExample) {
    output += `   Example:${s.codeExample}\n`;
  }
  output += `   Impact: ${s.impact}\n`;
  return output;
}
