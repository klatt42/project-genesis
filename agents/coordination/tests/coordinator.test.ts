// ================================
// PROJECT: Genesis Agent SDK - Coordination Agent
// FILE: agents/coordination/tests/coordinator.test.ts
// PURPOSE: Test suite for coordination agent
// GENESIS REF: Autonomous Agent Development - Task 1
// WSL PATH: ~/project-genesis/agents/coordination/tests/coordinator.test.ts
// ================================

import { CoordinationAgent } from '../coordinator.js';
import { ProjectSpec } from '../types/coordination-types.js';

describe('CoordinationAgent', () => {
  let coordinator: CoordinationAgent;

  beforeEach(() => {
    coordinator = new CoordinationAgent();
  });

  test('should create coordination agent', () => {
    expect(coordinator).toBeDefined();
  });

  test('should decompose landing page project', async () => {
    const spec: ProjectSpec = {
      id: 'test-landing-1',
      name: 'Test Landing Page',
      type: 'landing-page',
      prd: {
        vision: 'Test landing page for lead generation',
        targetUsers: ['B2B customers'],
        keyFeatures: ['Hero', 'Lead Form', 'Social Proof'],
        successMetrics: ['50% conversion rate'],
        constraints: []
      },
      genesisPatterns: ['LANDING_PAGE_TEMPLATE.md'],
      constraints: {},
      metadata: {
        createdAt: new Date(),
        createdBy: 'test',
        priority: 'high',
        tags: ['test']
      }
    };

    const result = await coordinator.coordinateAutonomousProject(spec);

    expect(result.success).toBe(true);
    expect(result.quality).toBeGreaterThan(90);
  }, 30000); // 30 second timeout

  test('should decompose SaaS project', async () => {
    const spec: ProjectSpec = {
      id: 'test-saas-1',
      name: 'Test SaaS App',
      type: 'saas-app',
      prd: {
        vision: 'Test SaaS application',
        targetUsers: ['B2B users'],
        keyFeatures: ['Authentication', 'Dashboard', 'Settings'],
        successMetrics: ['User engagement'],
        constraints: []
      },
      genesisPatterns: ['SAAS_ARCHITECTURE.md'],
      constraints: {},
      metadata: {
        createdAt: new Date(),
        createdBy: 'test',
        priority: 'high',
        tags: ['test']
      }
    };

    const result = await coordinator.coordinateAutonomousProject(spec);

    expect(result.success).toBe(true);
    expect(result.quality).toBeGreaterThan(90);
  }, 30000); // 30 second timeout
});
