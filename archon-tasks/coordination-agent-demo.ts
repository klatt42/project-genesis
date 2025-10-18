// ================================
// PROJECT: Genesis Agent SDK - Coordination Agent
// FILE: archon-tasks/coordination-agent-demo.ts
// PURPOSE: Demo script for Archon OS integration
// GENESIS REF: Autonomous Agent Development - Task 1
// ================================

import { createCoordinationAgent } from '../agents/coordination/index.js';
import { ProjectSpec } from '../agents/coordination/types/coordination-types.js';

/**
 * Demo: Coordination Agent with sample landing page project
 */
async function runCoordinationDemo() {
  console.log('🎯 Genesis Coordination Agent - Demo\n');

  const coordinator = createCoordinationAgent();

  // Create sample landing page project
  const sampleSpec: ProjectSpec = {
    id: 'demo-landing-1',
    name: 'Sample Landing Page - Lead Generation',
    type: 'landing-page',
    prd: {
      vision: 'High-converting landing page for B2B lead generation',
      targetUsers: ['B2B decision makers', 'Enterprise customers'],
      keyFeatures: [
        'Compelling hero section with clear value proposition',
        'Lead capture form with CRM sync',
        'Social proof testimonials',
        'Feature showcase with benefits',
        'FAQ section',
        'Strong call-to-action'
      ],
      successMetrics: [
        '50% conversion rate',
        '<2 second page load time',
        '90+ Lighthouse score',
        'Mobile-first responsive design'
      ],
      constraints: ['WCAG AA compliance', 'Mobile-first design']
    },
    genesisPatterns: ['LANDING_PAGE_TEMPLATE.md', 'STACK_SETUP.md'],
    constraints: {
      timeline: '2 hours',
      technicalConstraints: ['React', 'TypeScript', 'Supabase', 'Netlify']
    },
    metadata: {
      createdAt: new Date(),
      createdBy: 'genesis-demo',
      priority: 'high',
      tags: ['landing-page', 'lead-gen', 'b2b']
    }
  };

  console.log(`📋 Project Specification:`);
  console.log(`   Name: ${sampleSpec.name}`);
  console.log(`   Type: ${sampleSpec.type}`);
  console.log(`   Features: ${sampleSpec.prd.keyFeatures.length}`);
  console.log(`   Constraints: ${sampleSpec.constraints.timeline}\n`);

  // Execute coordination
  const result = await coordinator.coordinateAutonomousProject(sampleSpec);

  console.log('\n📊 Coordination Results:');
  console.log(`   Success: ${result.success ? '✅' : '❌'}`);
  console.log(`   Quality Score: ${result.quality}%`);
  console.log(`   Genesis Compliance: ${result.genesisCompliance}%`);
  console.log(`   Duration: ${result.duration} minutes`);
  console.log(`   Notes: ${result.notes.join(', ')}\n`);

  return result;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCoordinationDemo()
    .then(() => console.log('✅ Demo completed successfully'))
    .catch(error => console.error('❌ Demo failed:', error));
}

export { runCoordinationDemo };
