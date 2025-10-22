// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/component-library/component-packager.ts
// PURPOSE: Component packaging for installation (Task 3)
// GENESIS REF: Week 7 Task 3 - Shared Component Library
// WSL PATH: ~/project-genesis/agents/component-library/component-packager.ts
// ================================
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
export class ComponentPackager {
    packagesPath;
    constructor(packagesPath) {
        this.packagesPath = packagesPath || path.join(process.env.HOME || '', '.genesis', 'portfolio', 'packages');
    }
    /**
     * Initialize packager
     */
    async initialize() {
        await fs.mkdir(this.packagesPath, { recursive: true });
    }
    /**
     * Package a component
     */
    async packageComponent(component) {
        const packagePath = path.join(this.packagesPath, component.id);
        // Create package directory
        await fs.mkdir(packagePath, { recursive: true });
        // Write component files
        for (const file of component.files) {
            const filePath = path.join(packagePath, file.path);
            const fileDir = path.dirname(filePath);
            await fs.mkdir(fileDir, { recursive: true });
            await fs.writeFile(filePath, file.content, 'utf-8');
        }
        // Generate README
        const readme = this.generateReadme(component);
        await fs.writeFile(path.join(packagePath, 'README.md'), readme, 'utf-8');
        // Generate package.json
        const packageJson = this.generatePackageJson(component);
        await fs.writeFile(path.join(packagePath, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf-8');
        // Extract examples
        const examples = this.extractExamples(component);
        // Create examples directory if we have examples
        if (examples.length > 0) {
            const examplesDir = path.join(packagePath, 'examples');
            await fs.mkdir(examplesDir, { recursive: true });
            for (let i = 0; i < examples.length; i++) {
                await fs.writeFile(path.join(examplesDir, `example-${i + 1}.tsx`), examples[i], 'utf-8');
            }
        }
        return {
            component,
            packagePath,
            readme,
            examples
        };
    }
    /**
     * Generate README for component
     */
    generateReadme(component) {
        const lines = [];
        // Title and description
        lines.push(`# ${component.name}`);
        lines.push('');
        if (component.description) {
            lines.push(component.description);
            lines.push('');
        }
        // Metadata
        lines.push('## Metadata');
        lines.push('');
        lines.push(`- **Version**: ${component.version}`);
        lines.push(`- **Type**: ${component.type}`);
        lines.push(`- **Category**: ${component.category}`);
        lines.push(`- **Quality Score**: ${component.quality}/10`);
        lines.push(`- **Source Project**: ${component.sourceProjectName}`);
        lines.push(`- **Tests**: ${component.hasTests ? '✅ Yes' : '❌ No'}`);
        lines.push(`- **TypeScript**: ${component.hasTypes ? '✅ Yes' : '❌ No'}`);
        lines.push(`- **Documentation**: ${component.hasDocumentation ? '✅ Yes' : '❌ No'}`);
        lines.push('');
        // Keywords
        if (component.keywords.length > 0) {
            lines.push('## Keywords');
            lines.push('');
            lines.push(component.keywords.map(k => `\`${k}\``).join(', '));
            lines.push('');
        }
        // Installation
        lines.push('## Installation');
        lines.push('');
        lines.push('Install this component into your Genesis project:');
        lines.push('');
        lines.push('```bash');
        lines.push(`genesis components --install "${component.name}"`);
        lines.push('```');
        lines.push('');
        // Dependencies
        if (Object.keys(component.dependencies).length > 0) {
            lines.push('## Dependencies');
            lines.push('');
            lines.push('This component requires the following dependencies:');
            lines.push('');
            for (const [dep, version] of Object.entries(component.dependencies)) {
                lines.push(`- \`${dep}\`: ${version}`);
            }
            lines.push('');
        }
        // Peer dependencies
        if (component.peerDependencies && Object.keys(component.peerDependencies).length > 0) {
            lines.push('## Peer Dependencies');
            lines.push('');
            lines.push('Make sure your project has these installed:');
            lines.push('');
            for (const [dep, version] of Object.entries(component.peerDependencies)) {
                lines.push(`- \`${dep}\`: ${version}`);
            }
            lines.push('');
        }
        // Usage
        lines.push('## Usage');
        lines.push('');
        lines.push('```tsx');
        lines.push(`import { ${this.getExportName(component)} } from './${component.mainFile.replace('.tsx', '').replace('.ts', '')}';`);
        lines.push('');
        lines.push('// Use the component in your application');
        lines.push('```');
        lines.push('');
        // Files
        lines.push('## Files');
        lines.push('');
        for (const file of component.files) {
            lines.push(`- \`${file.path}\` (${file.type})`);
        }
        lines.push('');
        // Version history
        if (component.versions.length > 0) {
            lines.push('## Version History');
            lines.push('');
            for (const version of component.versions) {
                lines.push(`### ${version.version}${version.breaking ? ' ⚠️ BREAKING' : ''}`);
                lines.push('');
                lines.push(version.changes);
                lines.push('');
            }
        }
        // Compatible frameworks
        if (component.compatibleFrameworks.length > 0) {
            lines.push('## Compatible Frameworks');
            lines.push('');
            lines.push(component.compatibleFrameworks.join(', '));
            lines.push('');
        }
        // Usage stats
        if (component.installations.length > 0) {
            lines.push('## Usage Statistics');
            lines.push('');
            lines.push(`Used in ${component.installations.length} project(s)`);
            lines.push('');
        }
        // Footer
        lines.push('---');
        lines.push('');
        lines.push('*Generated by Genesis Component Library*');
        return lines.join('\n');
    }
    /**
     * Generate package.json for component
     */
    generatePackageJson(component) {
        return {
            name: `@genesis/${component.name}`,
            version: component.version,
            description: component.description || '',
            main: component.mainFile,
            types: component.hasTypes ? component.mainFile.replace('.tsx', '.d.ts').replace('.ts', '.d.ts') : undefined,
            keywords: component.keywords,
            author: 'Genesis Component Library',
            license: 'MIT',
            dependencies: component.dependencies,
            peerDependencies: component.peerDependencies,
            genesis: {
                type: component.type,
                category: component.category,
                quality: component.quality,
                sourceProject: component.sourceProjectId,
                compatibleFrameworks: component.compatibleFrameworks
            }
        };
    }
    /**
     * Extract examples from component code
     */
    extractExamples(component) {
        const examples = [];
        // Look for test files which often contain examples
        const testFiles = component.files.filter(f => f.type === 'test');
        for (const testFile of testFiles) {
            // Extract test cases as examples
            const testCases = this.extractTestCases(testFile.content);
            examples.push(...testCases);
        }
        // If no test examples, generate a basic example
        if (examples.length === 0) {
            examples.push(this.generateBasicExample(component));
        }
        return examples;
    }
    /**
     * Extract test cases from test file
     */
    extractTestCases(testContent) {
        const examples = [];
        const testRegex = /it\(['"](.*?)['"],\s*(?:async\s*)?\(\)\s*=>\s*\{([\s\S]*?)\n\s*\}\)/g;
        let match;
        while ((match = testRegex.exec(testContent)) !== null) {
            const description = match[1];
            const code = match[2];
            examples.push(`// Example: ${description}\n${code.trim()}\n`);
        }
        return examples;
    }
    /**
     * Generate a basic usage example
     */
    generateBasicExample(component) {
        const exportName = this.getExportName(component);
        const lines = [];
        lines.push(`// Basic usage example for ${component.name}`);
        lines.push(`import { ${exportName} } from './${component.mainFile.replace('.tsx', '').replace('.ts', '')}';`);
        lines.push('');
        if (component.type === 'react-component') {
            lines.push('function App() {');
            lines.push(`  return <${exportName} />;`);
            lines.push('}');
        }
        else if (component.type === 'react-hook') {
            lines.push('function MyComponent() {');
            lines.push(`  const result = ${exportName}();`);
            lines.push('  return <div>{/* Use result */}</div>;');
            lines.push('}');
        }
        else if (component.type === 'utility') {
            lines.push('// Use the utility function');
            lines.push(`const result = ${exportName}();`);
        }
        return lines.join('\n');
    }
    /**
     * Get export name from component
     */
    getExportName(component) {
        // Try to extract export name from main file
        const mainFile = component.files.find(f => f.path === component.mainFile);
        if (mainFile) {
            const exportMatch = mainFile.content.match(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/);
            if (exportMatch) {
                return exportMatch[1];
            }
        }
        // Fallback to component name
        return component.name;
    }
    /**
     * Get package path for component
     */
    getPackagePath(componentId) {
        return path.join(this.packagesPath, componentId);
    }
    /**
     * Check if component is packaged
     */
    async isPackaged(componentId) {
        const packagePath = this.getPackagePath(componentId);
        return existsSync(packagePath);
    }
    /**
     * Get package info
     */
    async getPackageInfo(componentId) {
        const packagePath = this.getPackagePath(componentId);
        if (!existsSync(packagePath)) {
            return null;
        }
        // Read package.json
        const packageJsonPath = path.join(packagePath, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        // Read README
        const readmePath = path.join(packagePath, 'README.md');
        const readme = existsSync(readmePath)
            ? await fs.readFile(readmePath, 'utf-8')
            : '';
        // Read examples
        const examplesDir = path.join(packagePath, 'examples');
        const examples = [];
        if (existsSync(examplesDir)) {
            const exampleFiles = await fs.readdir(examplesDir);
            for (const file of exampleFiles) {
                const content = await fs.readFile(path.join(examplesDir, file), 'utf-8');
                examples.push(content);
            }
        }
        // Reconstruct component info (minimal)
        const component = {
            id: componentId,
            name: packageJson.name.replace('@genesis/', ''),
            version: packageJson.version,
            files: [],
            mainFile: packageJson.main,
            description: packageJson.description,
            keywords: packageJson.keywords || [],
            category: packageJson.genesis?.category,
            type: packageJson.genesis?.type,
            dependencies: packageJson.dependencies || {},
            peerDependencies: packageJson.peerDependencies,
            sourceProjectId: packageJson.genesis?.sourceProject || '',
            sourceProjectName: '',
            extractedAt: new Date(),
            installations: [],
            usageCount: 0,
            hasTests: false,
            hasTypes: !!packageJson.types,
            hasDocumentation: !!readme,
            quality: packageJson.genesis?.quality || 5,
            versions: [],
            compatibleFrameworks: packageJson.genesis?.compatibleFrameworks || []
        };
        return {
            component,
            packagePath,
            readme,
            examples
        };
    }
    /**
     * Remove package
     */
    async removePackage(componentId) {
        const packagePath = this.getPackagePath(componentId);
        if (existsSync(packagePath)) {
            await fs.rm(packagePath, { recursive: true, force: true });
        }
    }
    /**
     * List all packaged components
     */
    async listPackages() {
        if (!existsSync(this.packagesPath)) {
            return [];
        }
        const entries = await fs.readdir(this.packagesPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    }
}
//# sourceMappingURL=component-packager.js.map