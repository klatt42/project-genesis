// ================================
// PROJECT: Genesis Agent SDK Integration - Phase 1 Week 2
// FILE: agents/genesis-mcp/tools/pattern-recording.ts
// PURPOSE: Record newly discovered patterns for Genesis evolution
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Pattern Recording
// WSL PATH: ~/project-genesis/agents/genesis-mcp/tools/pattern-recording.ts
// ================================

import fs from 'fs/promises';
import path from 'path';

/**
 * New pattern structure
 */
export interface NewPattern {
  name: string;
  category: 'integration' | 'component' | 'architecture' | 'deployment' | 'testing';
  description: string;
  problem: string;
  solution: string;
  codeExample: string;
  useCases: string[];
  prerequisites?: string[];
  relatedPatterns?: string[];
  genesisDoc?: string; // Which Genesis doc should include this
  discoveredBy: string;
  discoveredDate: string;
  projectContext?: string;
}

/**
 * Record a new pattern discovered during development
 */
export async function recordNewPattern(pattern: NewPattern): Promise<void> {
  const patternsDir = process.env.GENESIS_DOCS_PATH
    ? path.join(process.env.GENESIS_DOCS_PATH, '..', 'patterns-discovered')
    : path.join(process.cwd(), '..', '..', 'patterns-discovered');

  // Ensure directory exists
  await fs.mkdir(patternsDir, { recursive: true });

  // Create filename from pattern name
  const filename = `${pattern.name.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filepath = path.join(patternsDir, filename);

  // Format pattern as markdown
  const markdown = formatPatternAsMarkdown(pattern);

  // Save pattern
  await fs.writeFile(filepath, markdown, 'utf-8');

  // Update patterns index
  await updatePatternsIndex(pattern, filename, patternsDir);
}

/**
 * Format pattern as markdown
 */
function formatPatternAsMarkdown(pattern: NewPattern): string {
  return `# ${pattern.name}

**Category**: ${pattern.category}
**Discovered**: ${pattern.discoveredDate}
**Discovered By**: ${pattern.discoveredBy}
**Project Context**: ${pattern.projectContext || 'N/A'}

## Problem

${pattern.problem}

## Solution

${pattern.solution}

## Code Example

\`\`\`typescript
${pattern.codeExample}
\`\`\`

## Use Cases

${pattern.useCases.map((uc, i) => `${i + 1}. ${uc}`).join('\n')}

${pattern.prerequisites && pattern.prerequisites.length > 0 ? `
## Prerequisites

${pattern.prerequisites.map((p, i) => `${i + 1}. ${p}`).join('\n')}
` : ''}

${pattern.relatedPatterns && pattern.relatedPatterns.length > 0 ? `
## Related Patterns

${pattern.relatedPatterns.map(p => `- ${p}`).join('\n')}
` : ''}

## Genesis Integration

${pattern.genesisDoc
    ? `Should be added to: **${pattern.genesisDoc}**`
    : 'Genesis doc placement to be determined'}

---

*This pattern was discovered during active development and should be reviewed for inclusion in the Genesis documentation.*
`;
}

/**
 * Update patterns index file
 */
async function updatePatternsIndex(
  pattern: NewPattern,
  filename: string,
  patternsDir: string
): Promise<void> {
  const indexPath = path.join(patternsDir, 'INDEX.md');

  let indexContent: string;
  try {
    indexContent = await fs.readFile(indexPath, 'utf-8');
  } catch {
    // Create new index
    indexContent = `# Discovered Genesis Patterns

This directory contains patterns discovered during development that should be considered for inclusion in Genesis documentation.

## Patterns by Category

`;
  }

  // Add pattern to appropriate category section
  const categoryName = pattern.category.charAt(0).toUpperCase() + pattern.category.slice(1);
  const categorySection = `### ${categoryName}`;

  if (!indexContent.includes(categorySection)) {
    indexContent += `\n${categorySection}\n\n`;
  }

  const patternEntry = `- [${pattern.name}](./${filename}) - ${pattern.description} (Discovered: ${pattern.discoveredDate})`;

  // Check if pattern already exists in index
  if (indexContent.includes(patternEntry)) {
    return; // Already recorded
  }

  // Add to category section
  const categoryIndex = indexContent.indexOf(categorySection);
  const nextCategoryIndex = indexContent.indexOf('###', categoryIndex + 1);
  const insertIndex = nextCategoryIndex === -1
    ? indexContent.length
    : nextCategoryIndex;

  indexContent =
    indexContent.slice(0, insertIndex).trim() +
    `\n${patternEntry}\n\n` +
    indexContent.slice(insertIndex);

  await fs.writeFile(indexPath, indexContent, 'utf-8');
}

/**
 * List all discovered patterns
 */
export async function listDiscoveredPatterns(): Promise<NewPattern[]> {
  const patternsDir = process.env.GENESIS_DOCS_PATH
    ? path.join(process.env.GENESIS_DOCS_PATH, '..', 'patterns-discovered')
    : path.join(process.cwd(), '..', '..', 'patterns-discovered');

  try {
    const files = await fs.readdir(patternsDir);
    const patternFiles = files.filter(f => f.endsWith('.md') && f !== 'INDEX.md');

    const patterns: NewPattern[] = [];
    for (const file of patternFiles) {
      const content = await fs.readFile(path.join(patternsDir, file), 'utf-8');
      const pattern = parsePatternFromMarkdown(content);
      if (pattern) patterns.push(pattern);
    }

    return patterns;
  } catch {
    return [];
  }
}

/**
 * Parse pattern from markdown
 */
function parsePatternFromMarkdown(markdown: string): NewPattern | null {
  const lines = markdown.split('\n');

  const nameMatch = lines[0].match(/^#\s+(.+)/);
  if (!nameMatch) return null;

  const extractField = (field: string): string => {
    const line = lines.find(l => l.startsWith(`**${field}**:`));
    return line ? line.split(':').slice(1).join(':').trim() : '';
  };

  return {
    name: nameMatch[1],
    category: extractField('Category') as any,
    description: '',
    problem: extractSection(markdown, 'Problem'),
    solution: extractSection(markdown, 'Solution'),
    codeExample: extractCodeBlock(markdown),
    useCases: extractList(markdown, 'Use Cases'),
    prerequisites: extractList(markdown, 'Prerequisites'),
    relatedPatterns: extractList(markdown, 'Related Patterns'),
    genesisDoc: extractGenesisDoc(markdown),
    discoveredBy: extractField('Discovered By'),
    discoveredDate: extractField('Discovered'),
    projectContext: extractField('Project Context')
  };
}

function extractSection(markdown: string, heading: string): string {
  const match = markdown.match(new RegExp(`## ${heading}\\n\\n([^#]+)`, 's'));
  return match ? match[1].trim() : '';
}

function extractCodeBlock(markdown: string): string {
  const match = markdown.match(/```[\w]*\n([\s\S]*?)```/);
  return match ? match[1].trim() : '';
}

function extractList(markdown: string, heading: string): string[] {
  const section = extractSection(markdown, heading);
  if (!section) return [];
  return section
    .split('\n')
    .filter(l => l.trim().match(/^[\d-]\./))
    .map(l => l.replace(/^[\d-]\.\s*/, '').trim());
}

function extractGenesisDoc(markdown: string): string | undefined {
  const match = markdown.match(/Should be added to: \*\*(.+)\*\*/);
  return match ? match[1] : undefined;
}
