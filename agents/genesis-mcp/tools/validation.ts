// ================================
// PROJECT: Genesis Agent SDK Integration - Phase 1 Week 2
// FILE: agents/genesis-mcp/tools/validation.ts
// PURPOSE: Implement genesis_validate_implementation MCP tool
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Validation Tools
// WSL PATH: ~/project-genesis/agents/genesis-mcp/tools/validation.ts
// ================================

import fs from 'fs/promises';
import path from 'path';

/**
 * Validation result structure
 */
interface ValidationResult {
  isValid: boolean;
  score: number; // 0-10 scale (Cole's 8+/10 requirement)
  issues: ValidationIssue[];
  suggestions: string[];
  genesisPattern: string;
  compliance: {
    structure: boolean;
    naming: boolean;
    errorHandling: boolean;
    bestPractices: boolean;
    security: boolean;
  };
}

interface ValidationIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  line?: number;
  fix?: string;
}

/**
 * Pattern validators for different Genesis patterns
 */
const PATTERN_VALIDATORS = {
  'supabase-client': {
    required: [
      'createClient',
      'error handling',
      'environment variables',
      'typescript types'
    ],
    checks: [
      { pattern: /process\.env\.SUPABASE_URL|SUPABASE_URL.*process\.env/s, message: 'Must use environment variables for Supabase URL' },
      { pattern: /process\.env\.SUPABASE.*KEY|SUPABASE.*KEY.*process\.env/s, message: 'Must use environment variables for Supabase key' },
      { pattern: /try\s*{[\s\S]*catch/m, message: 'Must include error handling' },
      { pattern: /:\s*Database|<Database>/m, message: 'Should use TypeScript types from Supabase' }
    ],
    bestPractices: [
      'Singleton pattern for client instance',
      'Proper error boundaries',
      'Connection pooling for production'
    ]
  },

  'ghl-sync': {
    required: [
      'API key validation',
      'rate limiting',
      'webhook verification',
      'error handling'
    ],
    checks: [
      { pattern: /GHL_API_KEY/, message: 'Must use environment variable for GHL API key' },
      { pattern: /rate.*limit|throttle/i, message: 'Should implement rate limiting' },
      { pattern: /webhook.*verify|signature/i, message: 'Should verify webhook signatures' },
      { pattern: /try\s*{[\s\S]*catch/m, message: 'Must include error handling' }
    ],
    bestPractices: [
      'Retry logic with exponential backoff',
      'Queue failed syncs for retry',
      'Log all sync attempts',
      'Validate data before sending to GHL'
    ]
  },

  'landing-page-component': {
    required: [
      'TypeScript props interface',
      'accessibility attributes',
      'responsive design',
      'error boundaries'
    ],
    checks: [
      { pattern: /interface\s+\w+Props/, message: 'Must define props interface' },
      { pattern: /aria-|role=/, message: 'Should include accessibility attributes' },
      { pattern: /className.*sm:|md:|lg:/, message: 'Should use responsive Tailwind classes' }
    ],
    bestPractices: [
      'Use semantic HTML elements',
      'Implement loading states',
      'Add error boundaries',
      'Follow Genesis mystical theme (glass-morphism, gradients)'
    ]
  },

  'saas-auth': {
    required: [
      'Supabase auth integration',
      'protected routes',
      'session management',
      'RLS policies'
    ],
    checks: [
      { pattern: /signIn|signUp|signOut/, message: 'Must implement auth methods' },
      { pattern: /useEffect.*session/s, message: 'Should track session state' },
      { pattern: /protected|auth.*required/i, message: 'Should implement route protection' }
    ],
    bestPractices: [
      'Refresh tokens automatically',
      'Clear session on logout',
      'Redirect to login on auth failure',
      'Implement RLS policies in Supabase'
    ]
  },

  'copilotkit-integration': {
    required: [
      'CopilotKit provider',
      'action definitions',
      'render functions',
      'error handling'
    ],
    checks: [
      { pattern: /<CopilotKit/, message: 'Must use CopilotKit provider' },
      { pattern: /useCopilotAction/, message: 'Should define actions' },
      { pattern: /render:/, message: 'Should implement render functions' }
    ],
    bestPractices: [
      'Follow Genesis CopilotKit patterns',
      'Provide clear action descriptions',
      'Validate parameters',
      'Handle action failures gracefully'
    ]
  }
};

/**
 * Validate code implementation against Genesis pattern
 */
export async function validateImplementation(
  code: string,
  patternType: string,
  filePath?: string
): Promise<ValidationResult> {
  const validator = PATTERN_VALIDATORS[patternType as keyof typeof PATTERN_VALIDATORS];

  if (!validator) {
    return {
      isValid: false,
      score: 0,
      issues: [{
        severity: 'critical',
        category: 'pattern',
        message: `Unknown pattern type: ${patternType}. Valid types: ${Object.keys(PATTERN_VALIDATORS).join(', ')}`
      }],
      suggestions: ['Use one of the supported Genesis patterns'],
      genesisPattern: 'unknown',
      compliance: {
        structure: false,
        naming: false,
        errorHandling: false,
        bestPractices: false,
        security: false
      }
    };
  }

  const issues: ValidationIssue[] = [];
  const suggestions: string[] = [];
  let score = 10; // Start at perfect, deduct for issues

  // Check required patterns
  for (const check of validator.checks) {
    if (!check.pattern.test(code)) {
      issues.push({
        severity: 'warning',
        category: 'pattern',
        message: check.message
      });
      score -= 1.5;
    }
  }

  // Check naming conventions
  const namingIssues = checkNamingConventions(code, patternType);
  issues.push(...namingIssues);
  score -= namingIssues.length * 0.5;

  // Check error handling
  const errorHandlingScore = checkErrorHandling(code);
  if (errorHandlingScore < 8) {
    issues.push({
      severity: 'warning',
      category: 'error-handling',
      message: 'Insufficient error handling coverage'
    });
    score -= (10 - errorHandlingScore) * 0.3;
  }

  // Check security
  const securityIssues = checkSecurity(code, patternType);
  issues.push(...securityIssues);
  score -= securityIssues.filter(i => i.severity === 'critical').length * 2;
  score -= securityIssues.filter(i => i.severity === 'warning').length * 1;

  // Add best practice suggestions
  suggestions.push(...validator.bestPractices);

  // Ensure score is in 0-10 range
  score = Math.max(0, Math.min(10, score));

  // Determine overall compliance
  const compliance = {
    structure: score >= 7,
    naming: namingIssues.length === 0,
    errorHandling: errorHandlingScore >= 8,
    bestPractices: score >= 8,
    security: securityIssues.filter(i => i.severity === 'critical').length === 0
  };

  return {
    isValid: score >= 8, // Cole's 8+/10 requirement
    score: Math.round(score * 10) / 10,
    issues,
    suggestions,
    genesisPattern: patternType,
    compliance
  };
}

/**
 * Check naming conventions
 */
function checkNamingConventions(code: string, patternType: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for non-descriptive variable names
  const badVarNames = code.match(/\b(data|result|temp|foo|bar|test)\b/g);
  if (badVarNames && badVarNames.length > 2) {
    issues.push({
      severity: 'info',
      category: 'naming',
      message: 'Use more descriptive variable names',
      fix: 'Rename generic variables to describe their purpose'
    });
  }

  // Check for proper component naming (PascalCase)
  if (patternType.includes('component') || patternType.includes('page')) {
    const componentMatch = code.match(/(?:function|const)\s+([a-z]\w+)/);
    if (componentMatch) {
      issues.push({
        severity: 'warning',
        category: 'naming',
        message: `Component name should be PascalCase: ${componentMatch[1]}`,
        fix: `Rename to ${componentMatch[1].charAt(0).toUpperCase() + componentMatch[1].slice(1)}`
      });
    }
  }

  // Check for proper file naming
  const fileMatch = code.match(/\/\/ @filename: (.+)/);
  if (fileMatch) {
    const filename = fileMatch[1];
    if (patternType.includes('component') && !filename.endsWith('.tsx')) {
      issues.push({
        severity: 'info',
        category: 'naming',
        message: 'React components should use .tsx extension'
      });
    }
  }

  return issues;
}

/**
 * Check error handling coverage
 */
function checkErrorHandling(code: string): number {
  let score = 10;

  // Check for try-catch blocks
  const tryCount = (code.match(/try\s*{/g) || []).length;
  const catchCount = (code.match(/catch\s*\(/g) || []).length;

  if (tryCount !== catchCount) {
    score -= 3;
  }

  // Check for error logging
  if (!code.includes('console.error') && !code.includes('logger.error')) {
    score -= 2;
  }

  // Check for async error handling
  const asyncFuncs = (code.match(/async\s+(?:function|\()/g) || []).length;
  if (asyncFuncs > 0 && tryCount === 0) {
    score -= 4;
  }

  // Check for error return values
  if (!code.includes('throw') && !code.includes('return') && tryCount === 0) {
    score -= 2;
  }

  return Math.max(0, score);
}

/**
 * Check security issues
 */
function checkSecurity(code: string, patternType: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for hardcoded secrets
  const secretPatterns = [
    { pattern: /['"]sk_[a-zA-Z0-9_]{15,}['"]/, message: 'Hardcoded API key detected' },
    { pattern: /['"]https:\/\/[^'"]*\.supabase\.co['"]/, message: 'Hardcoded Supabase URL detected' },
    { pattern: /['"]password['"]:\s*['"][^'"]+['"]/, message: 'Hardcoded password detected' },
    { pattern: /['"]secret['"]:\s*['"][^'"]+['"]/, message: 'Hardcoded secret detected' }
  ];

  for (const { pattern, message } of secretPatterns) {
    if (pattern.test(code)) {
      issues.push({
        severity: 'critical',
        category: 'security',
        message,
        fix: 'Use environment variables instead'
      });
    }
  }

  // Check for SQL injection risks
  if (code.includes('${') && code.includes('query') || code.includes('sql`')) {
    if (!code.includes('sanitize') && !code.includes('escape')) {
      issues.push({
        severity: 'critical',
        category: 'security',
        message: 'Possible SQL injection vulnerability',
        fix: 'Use parameterized queries or sanitize inputs'
      });
    }
  }

  // Check for XSS risks
  if (code.includes('dangerouslySetInnerHTML') || code.includes('innerHTML')) {
    issues.push({
      severity: 'warning',
      category: 'security',
      message: 'Potential XSS vulnerability',
      fix: 'Sanitize user input before rendering HTML'
    });
  }

  // Check for CORS issues (if API routes)
  if (patternType.includes('api') || patternType.includes('route')) {
    if (!code.includes('cors') && code.includes('fetch')) {
      issues.push({
        severity: 'info',
        category: 'security',
        message: 'Consider CORS configuration for API routes'
      });
    }
  }

  return issues;
}

/**
 * Get Genesis pattern documentation
 */
export async function getGenesisPattern(patternType: string): Promise<string> {
  const docsPath = process.env.GENESIS_DOCS_PATH || '/home/ubuntu/project-genesis/docs';

  // Map pattern types to Genesis docs
  const patternDocs: Record<string, string> = {
    'supabase-client': 'STACK_SETUP.md',
    'ghl-sync': 'STACK_SETUP.md',
    'landing-page-component': 'LANDING_PAGE_TEMPLATE.md',
    'saas-auth': 'SAAS_ARCHITECTURE.md',
    'copilotkit-integration': 'COPILOTKIT_PATTERNS.md'
  };

  const docFile = patternDocs[patternType] || 'STACK_SETUP.md';

  try {
    const docPath = path.join(docsPath, docFile);
    const content = await fs.readFile(docPath, 'utf-8');

    // Extract relevant section for pattern
    const sections = content.split(/^##\s+/m);
    const relevantSection = sections.find(s =>
      s.toLowerCase().includes(patternType.replace('-', ' '))
    );

    return relevantSection || content.substring(0, 2000);
  } catch (error) {
    return `Could not load Genesis pattern documentation: ${error}`;
  }
}

/**
 * Format validation result for display
 */
export function formatValidationResult(result: ValidationResult): string {
  let output = `
=================================
Genesis Pattern Validation Result
=================================

Pattern: ${result.genesisPattern}
Score: ${result.score}/10 ${result.isValid ? '✅ PASS' : '❌ FAIL'}
Status: ${result.isValid ? 'Genesis Compliant' : 'Needs Improvement'}

Compliance Checklist:
  ${result.compliance.structure ? '✅' : '❌'} Structure & Organization
  ${result.compliance.naming ? '✅' : '❌'} Naming Conventions
  ${result.compliance.errorHandling ? '✅' : '❌'} Error Handling
  ${result.compliance.bestPractices ? '✅' : '❌'} Best Practices
  ${result.compliance.security ? '✅' : '❌'} Security Standards

`;

  if (result.issues.length > 0) {
    output += `\nIssues Found (${result.issues.length}):\n`;
    output += '─────────────────────────\n';

    const critical = result.issues.filter(i => i.severity === 'critical');
    const warnings = result.issues.filter(i => i.severity === 'warning');
    const info = result.issues.filter(i => i.severity === 'info');

    if (critical.length > 0) {
      output += '\n🚨 CRITICAL:\n';
      critical.forEach((issue, i) => {
        output += `  ${i + 1}. ${issue.message}\n`;
        if (issue.fix) output += `     Fix: ${issue.fix}\n`;
      });
    }

    if (warnings.length > 0) {
      output += '\n⚠️  WARNINGS:\n';
      warnings.forEach((issue, i) => {
        output += `  ${i + 1}. ${issue.message}\n`;
        if (issue.fix) output += `     Fix: ${issue.fix}\n`;
      });
    }

    if (info.length > 0) {
      output += '\nℹ️  INFO:\n';
      info.forEach((issue, i) => {
        output += `  ${i + 1}. ${issue.message}\n`;
      });
    }
  }

  if (result.suggestions.length > 0) {
    output += `\n\nGenesis Best Practices:\n`;
    output += '─────────────────────────\n';
    result.suggestions.forEach((suggestion, i) => {
      output += `  ${i + 1}. ${suggestion}\n`;
    });
  }

  output += '\n=================================\n';
  return output;
}
