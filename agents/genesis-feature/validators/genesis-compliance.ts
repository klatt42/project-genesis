// ================================
// PROJECT: Genesis Agent SDK - Genesis Feature Agent
// FILE: agents/genesis-feature/validators/genesis-compliance.ts
// PURPOSE: Genesis pattern compliance validator
// GENESIS REF: Autonomous Agent Development - Task 3
// WSL PATH: ~/project-genesis/agents/genesis-feature/validators/genesis-compliance.ts
// ================================

import { GeneratedCode, ValidationResult, ValidationCheck } from '../types/feature-types.js';

export class GenesisComplianceValidator {
  /**
   * Validate Genesis pattern compliance
   */
  async validate(
    generated: GeneratedCode[],
    projectPath: string
  ): Promise<ValidationResult> {
    console.log('🔍 Validating Genesis compliance...');

    const checks: ValidationCheck[] = [];
    const issues: any[] = [];
    const warnings: any[] = [];

    // Check file structure
    const structureCheck = this.validateFileStructure(generated);
    checks.push(structureCheck);
    if (!structureCheck.passed) {
      issues.push({ type: 'structure', message: structureCheck.message, severity: 'error' });
    }

    // Check TypeScript usage
    const tsCheck = this.validateTypeScript(generated);
    checks.push(tsCheck);
    if (!tsCheck.passed) {
      issues.push({ type: 'typescript', message: tsCheck.message, severity: 'error' });
    }

    // Check component patterns
    const componentCheck = this.validateComponentPattern(generated);
    checks.push(componentCheck);
    if (!componentCheck.passed) {
      warnings.push({ message: componentCheck.message });
    }

    // Check testing
    const testCheck = this.validateTesting(generated);
    checks.push(testCheck);
    if (!testCheck.passed) {
      issues.push({ type: 'testing', message: testCheck.message, severity: 'warning' });
    }

    // Calculate score
    const passedChecks = checks.filter(c => c.passed).length;
    const score = (passedChecks / checks.length) * 100;

    console.log(`   ${score >= 95 ? '✅' : '⚠️'} Compliance score: ${score.toFixed(0)}%`);

    return {
      passed: score >= 95,
      score,
      checks,
      issues,
      warnings
    };
  }

  /**
   * Validate file structure follows Genesis conventions
   */
  private validateFileStructure(generated: GeneratedCode[]): ValidationCheck {
    const hasComponent = generated.some(f => f.path.includes('components/'));
    const hasTest = generated.some(f => f.path.includes('.test.'));

    return {
      name: 'File Structure',
      passed: hasComponent && hasTest,
      message: hasComponent && hasTest
        ? 'Component and test files present'
        : 'Missing required files',
      severity: 'error'
    };
  }

  /**
   * Validate TypeScript usage
   */
  private validateTypeScript(generated: GeneratedCode[]): ValidationCheck {
    const tsFiles = generated.filter(f => f.type === 'typescript');
    const hasInterfaces = tsFiles.some(f => f.content.includes('interface'));
    const hasTypes = tsFiles.some(f => f.content.includes(': '));

    return {
      name: 'TypeScript Usage',
      passed: hasInterfaces || hasTypes,
      message: hasInterfaces || hasTypes
        ? 'TypeScript types properly used'
        : 'Missing TypeScript type definitions',
      severity: 'error'
    };
  }

  /**
   * Validate React component patterns
   */
  private validateComponentPattern(generated: GeneratedCode[]): ValidationCheck {
    const components = generated.filter(f =>
      f.path.includes('components/') && f.type === 'typescript'
    );

    const hasProperExports = components.every(f => f.content.includes('export'));
    const hasFunctionalComponents = components.every(f =>
      f.content.includes('React.FC') || f.content.includes('=>')
    );

    return {
      name: 'Component Pattern',
      passed: hasProperExports && hasFunctionalComponents,
      message: hasProperExports && hasFunctionalComponents
        ? 'Components follow React functional pattern'
        : 'Components should use React.FC functional pattern',
      severity: 'warning'
    };
  }

  /**
   * Validate testing coverage
   */
  private validateTesting(generated: GeneratedCode[]): ValidationCheck {
    const testFiles = generated.filter(f => f.path.includes('.test.'));
    const componentFiles = generated.filter(f =>
      f.path.includes('components/') && !f.path.includes('.test.')
    );

    const hasTests = testFiles.length >= componentFiles.length;

    return {
      name: 'Testing Coverage',
      passed: hasTests,
      message: hasTests
        ? 'All components have test files'
        : 'Some components missing test files',
      severity: 'warning'
    };
  }
}
