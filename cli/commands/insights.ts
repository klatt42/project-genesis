// ================================
// PROJECT: Genesis Agent SDK - CLI
// FILE: cli/commands/insights.ts
// PURPOSE: Knowledge graph & insights CLI commands
// ================================

import * as path from 'path';
import { KnowledgeGraphManager } from '../../agents/knowledge-graph/index.js';
import { PortfolioManager } from '../../agents/portfolio-manager/index.js';
import { PatternLibrary } from '../../agents/pattern-library/index.js';
import { ComponentLibrary } from '../../agents/component-library/index.js';

interface InsightsOptions {
  build?: boolean;
  generate?: boolean;
  recommend?: string;
  similar?: string;
  technologies?: boolean;
  export?: string;
}

export async function insightsCommand(options: InsightsOptions) {
  const knowledgeGraph = new KnowledgeGraphManager();

  try {
    if (options.build) {
      console.log('🔨 Building knowledge graph...');

      // Load data from all sources
      const portfolio = new PortfolioManager();
      await portfolio.initialize();
      const projects = portfolio.getProjects();

      const patternLibrary = new PatternLibrary();
      await patternLibrary.initialize();
      const patterns = patternLibrary.listPatterns();

      const componentLibrary = new ComponentLibrary();
      await componentLibrary.initialize();
      const components = await componentLibrary.listComponents();

      await knowledgeGraph.buildGraph({
        projects,
        patterns,
        components
      });

      const stats = knowledgeGraph.getStatistics();
      console.log('✅ Knowledge graph built successfully!');
      console.log(`   Nodes: ${stats.totalNodes}`);
      console.log(`   Edges: ${stats.totalEdges}`);
      console.log(`   Avg Connections: ${stats.avgConnections.toFixed(2)}`);
    }

    if (options.generate) {
      console.log('💡 Generating AI insights...\n');

      const insights = await knowledgeGraph.generateInsights();

      if (insights.length === 0) {
        console.log('No insights generated. Build the knowledge graph first with --build');
        return;
      }

      console.log(`Generated ${insights.length} insight(s):\n`);

      // Group by priority
      const high = insights.filter(i => i.impact === 'high');
      const medium = insights.filter(i => i.impact === 'medium');
      const low = insights.filter(i => i.impact === 'low');

      if (high.length > 0) {
        console.log('🔴 HIGH PRIORITY:\n');
        for (const insight of high) {
          console.log(`${insight.title}`);
          console.log(`   ${insight.description}`);
          console.log(`   Confidence: ${Math.round(insight.confidence * 100)}%`);
          console.log(`   Type: ${insight.type}`);
          if (insight.suggestions.length > 0) {
            console.log(`   Suggestions:`);
            for (const suggestion of insight.suggestions) {
              console.log(`   - ${suggestion}`);
            }
          }
          console.log('');
        }
      }

      if (medium.length > 0) {
        console.log('🟡 MEDIUM PRIORITY:\n');
        for (const insight of medium.slice(0, 3)) {
          console.log(`${insight.title}`);
          console.log(`   ${insight.description}`);
          console.log('');
        }
        if (medium.length > 3) {
          console.log(`... and ${medium.length - 3} more medium priority insights\n`);
        }
      }

      if (low.length > 0) {
        console.log(`ℹ️  ${low.length} low priority insight(s) (use --export to see all)\n`);
      }
    }

    if (options.recommend) {
      console.log(`💡 Getting recommendations for: ${options.recommend}\n`);

      // Build graph first if needed
      const stats = knowledgeGraph.getStatistics();
      if (stats.totalNodes === 0) {
        console.log('Building knowledge graph first...');
        const portfolio = new PortfolioManager();
        await portfolio.initialize();
        const projects = portfolio.getProjects();
        const patternLibrary = new PatternLibrary();
        await patternLibrary.initialize();
        const patterns = patternLibrary.listPatterns();
        const componentLibrary = new ComponentLibrary();
        await componentLibrary.initialize();
        const components = await componentLibrary.listComponents();
        await knowledgeGraph.buildGraph({ projects, patterns, components });
      }

      const recommendations = await knowledgeGraph.generateRecommendations(options.recommend);

      if (recommendations.length === 0) {
        console.log('No recommendations found for this project');
        return;
      }

      console.log(`Found ${recommendations.length} recommendation(s):\n`);

      for (let i = 0; i < Math.min(10, recommendations.length); i++) {
        const rec = recommendations[i];
        const priorityIcon = rec.priority === 'high' ? '🔴' :
                            rec.priority === 'medium' ? '🟡' : '🟢';

        console.log(`${i + 1}. ${priorityIcon} ${rec.type.toUpperCase()}: ${rec.itemName}`);
        console.log(`   Reason: ${rec.reason}`);
        console.log(`   Benefit: ${rec.benefit}`);
        console.log(`   Confidence: ${Math.round(rec.confidence * 100)}%`);
        console.log('');
      }
    }

    if (options.similar) {
      console.log(`🔍 Finding projects similar to: ${options.similar}\n`);

      const similar = await knowledgeGraph.findSimilarProjects(options.similar);

      if (similar.length === 0) {
        console.log('No similar projects found');
        return;
      }

      console.log(`Found ${similar.length} similar project(s):\n`);

      for (let i = 0; i < Math.min(5, similar.length); i++) {
        const result = similar[i];
        console.log(`${i + 1}. ${result.node2.name} (${Math.round(result.similarity * 100)}% similar)`);
        console.log(`   Reasons:`);
        for (const reason of result.reasons) {
          console.log(`   - ${reason}`);
        }
        console.log('');
      }
    }

    if (options.technologies) {
      console.log('🔧 Technology Adoption Analysis:\n');

      const adoption = await knowledgeGraph.findTechnologyAdoption();

      if (adoption.length === 0) {
        console.log('No technology data available. Build the knowledge graph first with --build');
        return;
      }

      console.log(`Technology Usage Across Portfolio:\n`);

      for (const tech of adoption.slice(0, 10)) {
        const bar = '█'.repeat(Math.round(tech.adoptionRate * 20));
        console.log(`${tech.technology.padEnd(20)} ${bar} ${Math.round(tech.adoptionRate * 100)}% (${tech.projects.length} projects)`);
      }
    }

    if (options.export) {
      console.log(`💾 Exporting knowledge graph to ${options.export}...`);

      const graph = knowledgeGraph.exportGraph();
      const fs = await import('fs/promises');
      await fs.writeFile(options.export, JSON.stringify(graph, null, 2), 'utf-8');

      console.log('✅ Export complete');
      console.log(`   Nodes: ${graph.nodes.length}`);
      console.log(`   Edges: ${graph.edges.length}`);
    }

    // If no options, show help
    if (!Object.values(options).some(Boolean)) {
      console.log('Genesis Knowledge Graph & Insights\n');
      console.log('Usage:');
      console.log('  genesis insights --build                    Build/rebuild knowledge graph');
      console.log('  genesis insights --generate                 Generate AI insights');
      console.log('  genesis insights --recommend <project>      Get recommendations for project');
      console.log('  genesis insights --similar <project>        Find similar projects');
      console.log('  genesis insights --technologies             View technology adoption');
      console.log('  genesis insights --export <path>            Export knowledge graph');
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
