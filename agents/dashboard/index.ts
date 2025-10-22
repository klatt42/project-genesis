// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/dashboard/index.ts
// PURPOSE: Dashboard entry point and exports
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 3
// WSL PATH: ~/project-genesis/agents/dashboard/index.ts
// ================================

import React from 'react';
import { render } from 'ink';
import { Dashboard, createDemoState } from './app.js';
import type { DashboardState } from './types.js';

// Re-export main components and types
export { Dashboard, createDemoState } from './app.js';
export type { DashboardState, DashboardError, LogEntry, ResourceUsage } from './types.js';

/**
 * Render the dashboard with a custom state provider
 *
 * @param onStateRequest - Function that returns current dashboard state
 * @param updateInterval - Refresh interval in milliseconds (default: 500)
 * @returns Ink instance with cleanup function
 */
export function renderDashboard(
  onStateRequest: () => DashboardState | Promise<DashboardState>,
  updateInterval: number = 500
) {
  return render(
    React.createElement(Dashboard, {
      onStateRequest,
      updateInterval
    })
  );
}

/**
 * Run the dashboard in demo mode
 * Shows simulated worker activity with mock data
 */
export function runDemo() {
  const instance = render(
    React.createElement(Dashboard, {
      onStateRequest: createDemoState,
      updateInterval: 500
    })
  );

  // Handle cleanup
  instance.waitUntilExit().then(() => {
    process.exit(0);
  });

  return instance;
}

// CLI entry point - run demo mode if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo();
}
