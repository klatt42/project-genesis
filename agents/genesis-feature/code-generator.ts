// ================================
// PROJECT: Genesis Agent SDK - Genesis Feature Agent
// FILE: agents/genesis-feature/code-generator.ts
// PURPOSE: Code generation engine from Genesis patterns
// GENESIS REF: Autonomous Agent Development - Task 3
// WSL PATH: ~/project-genesis/agents/genesis-feature/code-generator.ts
// ================================

import { GenesisPattern, FeatureTask, GeneratedCode } from './types/feature-types.js';
import * as fs from 'fs';
import * as path from 'path';

export class CodeGenerator {
  /**
   * Generate code from pattern and task configuration
   */
  async generateCode(
    pattern: GenesisPattern,
    task: FeatureTask,
    projectPath: string
  ): Promise<GeneratedCode[]> {
    console.log(`🔨 Generating code for: ${task.featureName}`);

    const generated: GeneratedCode[] = [];

    // Generate component file
    const componentCode = this.generateComponent(pattern, task);
    generated.push(componentCode);

    // Generate test file
    const testCode = this.generateTest(pattern, task);
    generated.push(testCode);

    // Write files to disk
    await this.writeFiles(generated, projectPath);

    console.log(`   ✅ Generated ${generated.length} files`);

    return generated;
  }

  /**
   * Generate component file
   */
  private generateComponent(pattern: GenesisPattern, task: FeatureTask): GeneratedCode {
    let code = pattern.template.component;

    // Apply customizations
    code = this.applyCustomizations(code, task);

    // Format component name
    const componentName = task.configuration.componentName || this.formatComponentName(task.featureName);
    code = code.replace(/ComponentName/g, componentName);

    const filePath = task.configuration.filePath || `components/${componentName}.tsx`;

    return {
      path: filePath,
      type: 'typescript',
      content: code,
      lines: code.split('\n').length
    };
  }

  /**
   * Generate test file
   */
  private generateTest(pattern: GenesisPattern, task: FeatureTask): GeneratedCode {
    let code = pattern.template.test;

    // Apply customizations
    code = this.applyCustomizations(code, task);

    // Format component name
    const componentName = task.configuration.componentName || this.formatComponentName(task.featureName);
    code = code.replace(/ComponentName/g, componentName);

    const componentPath = task.configuration.filePath || `components/${componentName}.tsx`;
    const testPath = componentPath.replace('.tsx', '.test.tsx');

    return {
      path: testPath,
      type: 'typescript',
      content: code,
      lines: code.split('\n').length
    };
  }

  /**
   * Apply task-specific customizations to code
   */
  private applyCustomizations(code: string, task: FeatureTask): string {
    let customized = code;

    // Apply other customizations
    for (const [key, value] of Object.entries(task.configuration.customizations)) {
      customized = customized.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return customized;
  }

  /**
   * Format component name from feature name
   */
  private formatComponentName(featureName: string): string {
    return featureName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Write generated files to disk
   */
  private async writeFiles(generated: GeneratedCode[], projectPath: string): Promise<void> {
    for (const file of generated) {
      const fullPath = path.join(projectPath, file.path);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(fullPath, file.content, 'utf-8');
      console.log(`   📝 Created: ${file.path}`);
    }
  }

  /**
   * Validate generated code
   */
  async validateCode(generated: GeneratedCode[]): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    for (const file of generated) {
      // Check for syntax issues (simplified)
      if (file.type === 'typescript' && !file.content.includes('export')) {
        errors.push(`${file.path}: Missing export statement`);
      }

      // Check minimum length
      if (file.lines < 5) {
        errors.push(`${file.path}: File too short (${file.lines} lines)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
