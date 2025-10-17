// ================================
// PROJECT: Genesis Agent SDK - CLI
// FILE: cli/commands/components.ts
// PURPOSE: Component library CLI commands
// ================================

import * as path from 'path';
import { ComponentLibrary } from '../../agents/component-library/index.js';
import type { ComponentSearchQuery, InstallOptions } from '../../agents/component-library/types.js';

interface ComponentsOptions {
  install?: string;
  search?: string;
  list?: boolean;
  publish?: string;
  updates?: boolean;
  uninstall?: string;
  info?: string;
}

export async function componentsCommand(options: ComponentsOptions) {
  const library = new ComponentLibrary();
  await library.initialize();

  try {
    if (options.install) {
      console.log(`📦 Installing component: ${options.install}`);

      const installOptions: InstallOptions = {
        targetPath: path.join(process.cwd(), 'components'),
        targetProject: path.basename(process.cwd()),
        updateImports: true,
        installDependencies: true
      };

      const result = await library.installComponent(options.install, installOptions);

      if (result.success) {
        console.log('✅ Installation complete!');
        console.log(`   Files installed: ${result.installedFiles.length}`);
        if (result.warnings && result.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          for (const warning of result.warnings) {
            console.log(`   ${warning}`);
          }
        }
      } else {
        console.log('❌ Installation failed');
        if (result.errors) {
          for (const error of result.errors) {
            console.log(`   ${error}`);
          }
        }
      }
    }

    if (options.search) {
      console.log(`🔍 Searching for components: "${options.search}"\n`);

      const query: ComponentSearchQuery = {
        query: options.search
      };

      const components = await library.searchComponents(query);

      if (components.length === 0) {
        console.log('No components found.');
      } else {
        console.log(`Found ${components.length} component(s):\n`);
        for (let i = 0; i < Math.min(10, components.length); i++) {
          const component = components[i];
          console.log(`${i + 1}. ${component.name} v${component.version}`);
          console.log(`   Type: ${component.type} | Quality: ${component.quality}/10`);
          console.log(`   ${component.description || 'No description'}`);
          console.log(`   Installations: ${component.installations.length}`);
          console.log('');
        }
        if (components.length > 10) {
          console.log(`... and ${components.length - 10} more`);
        }
      }
    }

    if (options.list) {
      const components = await library.listComponents();
      console.log(`\n📦 Component Library (${components.length} components):\n`);

      for (const component of components) {
        console.log(`${component.name.padEnd(30)} v${component.version.padEnd(10)} ${component.type}`);
      }
    }

    if (options.publish) {
      console.log('🚀 Publishing component...');
      // This would need implementation to extract component from current project
      console.log('⚠️  Component publishing not yet implemented');
      console.log('   Please use the Component Library API directly');
    }

    if (options.updates) {
      console.log('🔍 Checking for component updates...\n');

      // Get installed components (this would need to be tracked in project)
      console.log('⚠️  Update checking not yet implemented');
      console.log('   This requires tracking installed components in project metadata');
    }

    if (options.uninstall) {
      console.log(`🗑️  Uninstalling component: ${options.uninstall}`);

      const targetPath = path.join(process.cwd(), 'components');
      const targetProject = path.basename(process.cwd());

      const result = await library.uninstallComponent(options.uninstall, targetPath, targetProject);

      if (result.success) {
        console.log('✅ Uninstallation complete!');
        console.log(`   Files removed: ${result.installedFiles.length}`);
      } else {
        console.log('❌ Uninstallation failed');
        if (result.errors) {
          for (const error of result.errors) {
            console.log(`   ${error}`);
          }
        }
      }
    }

    if (options.info) {
      console.log(`ℹ️  Component Information: ${options.info}\n`);

      const component = await library.getComponent(options.info);

      if (!component) {
        console.log('Component not found.');
      } else {
        console.log(`Name: ${component.name}`);
        console.log(`Version: ${component.version}`);
        console.log(`Type: ${component.type}`);
        console.log(`Category: ${component.category}`);
        console.log(`Quality: ${component.quality}/10`);
        console.log(`\nDescription:`);
        console.log(component.description || 'No description available');
        console.log(`\nSource: ${component.sourceProjectName}`);
        console.log(`Installations: ${component.installations.length} project(s)`);
        console.log(`\nDependencies:`);
        for (const [dep, version] of Object.entries(component.dependencies)) {
          console.log(`  ${dep}: ${version}`);
        }
        console.log(`\nVersions: ${component.versions.length}`);
        for (const version of component.versions.slice(0, 5)) {
          console.log(`  v${version.version} ${version.breaking ? '⚠️ BREAKING' : ''}`);
        }
      }
    }

    // If no options, show help
    if (!Object.values(options).some(Boolean)) {
      console.log('Genesis Component Library\n');
      console.log('Usage:');
      console.log('  genesis components --install <name>     Install a component');
      console.log('  genesis components --search "query"     Search for components');
      console.log('  genesis components --list               List all components');
      console.log('  genesis components --info <name>        Show component information');
      console.log('  genesis components --uninstall <name>   Uninstall a component');
      console.log('  genesis components --updates            Check for updates');
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
