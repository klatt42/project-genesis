// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/dashboard/app.tsx
// PURPOSE: Main dashboard application
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 3
// WSL PATH: ~/project-genesis/agents/dashboard/app.tsx
// ================================

import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import { AgentGrid } from './components/AgentGrid.js';
import { ProgressBars } from './components/ProgressBars.js';
import { ResourceMonitor } from './components/ResourceMonitor.js';
import { ErrorPanel } from './components/ErrorPanel.js';
import { LogStream } from './components/LogStream.js';
import type { DashboardState, DashboardError, LogEntry } from './types.js';
import type { Worker, QueuedTask, ProgressMetrics } from '../parallel-executor/types.js';
import type { AgentStatus } from '../coordination/types.js';

interface DashboardProps {
  updateInterval?: number;
  onStateRequest?: () => DashboardState | Promise<DashboardState>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  updateInterval = 500,
  onStateRequest
}) => {
  const { exit } = useApp();

  const [state, setState] = useState<DashboardState>({
    workers: [],
    tasks: [],
    metrics: {
      totalTasks: 0,
      queuedTasks: 0,
      runningTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      blockedTasks: 0,
      activeWorkers: 0,
      idleWorkers: 0,
      averageTaskDuration: 0,
      estimatedTimeRemaining: 0,
      throughput: 0
    },
    agents: [],
    errors: [],
    logs: [],
    startTime: Date.now()
  });

  const [isComplete, setIsComplete] = useState(false);

  // Update state periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (onStateRequest) {
        try {
          const newState = await onStateRequest();
          setState(newState);

          // Check if all tasks complete
          if (
            newState.metrics.completedTasks + newState.metrics.failedTasks ===
            newState.metrics.totalTasks &&
            newState.metrics.totalTasks > 0
          ) {
            setIsComplete(true);
            clearInterval(interval);

            // Exit after showing final state for 2 seconds
            setTimeout(() => {
              exit();
            }, 2000);
          }
        } catch (error) {
          console.error('Dashboard update error:', error);
        }
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval, onStateRequest, exit]);

  const elapsedTime = Date.now() - state.startTime;

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="magenta">
          ╔═══════════════════════════════════════════════╗
        </Text>
      </Box>
      <Box marginBottom={1} justifyContent="center">
        <Text bold color="magenta">
          ║  🚀 Genesis Parallel Build Dashboard  ║
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text bold color="magenta">
          ╚═══════════════════════════════════════════════╝
        </Text>
      </Box>

      {/* Status */}
      <Box marginBottom={1} marginLeft={1}>
        <Text>
          Status:{' '}
          <Text bold color={isComplete ? 'green' : 'yellow'}>
            {isComplete ? 'COMPLETE' : 'RUNNING'}
          </Text>
          {'  '}
          Elapsed: {formatElapsed(elapsedTime)}
        </Text>
      </Box>

      {/* Agent Grid */}
      <AgentGrid workers={state.workers} />

      {/* Progress Bars */}
      <ProgressBars metrics={state.metrics} />

      {/* Resource Monitor */}
      <ResourceMonitor agents={state.agents} />

      {/* Error Panel */}
      <ErrorPanel errors={state.errors} maxErrors={3} />

      {/* Log Stream */}
      <LogStream logs={state.logs} maxLogs={8} />

      {/* Footer */}
      <Box marginTop={1}>
        <Text dimColor>
          Press Ctrl+C to exit • Refreshing every {updateInterval}ms
        </Text>
      </Box>
    </Box>
  );
};

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Export demo state for testing
export function createDemoState(): DashboardState {
  return {
    workers: [
      {
        id: 'worker-1',
        status: 'busy',
        tasksCompleted: 5,
        tasksFailed: 0,
        startTime: new Date().toISOString(),
        lastActivityTime: new Date().toISOString(),
        errorCount: 0,
        currentTask: {
          task: {
            id: 'task-6',
            name: 'Build Hero component',
            description: 'Create hero section',
            agent: 'build',
            estimatedMinutes: 10,
            dependencies: [],
            phase: 'Components',
            status: 'pending',
            priority: 75,
            canRunInParallel: true
          },
          priority: 'high',
          queuedAt: new Date().toISOString(),
          status: 'running',
          retryCount: 0,
          dependencies: [],
          dependents: []
        }
      },
      {
        id: 'worker-2',
        status: 'busy',
        tasksCompleted: 4,
        tasksFailed: 1,
        startTime: new Date().toISOString(),
        lastActivityTime: new Date().toISOString(),
        errorCount: 1
      },
      {
        id: 'worker-3',
        status: 'idle',
        tasksCompleted: 3,
        tasksFailed: 0,
        startTime: new Date().toISOString(),
        lastActivityTime: new Date().toISOString(),
        errorCount: 0
      }
    ],
    tasks: [],
    metrics: {
      totalTasks: 15,
      queuedTasks: 2,
      runningTasks: 2,
      completedTasks: 10,
      failedTasks: 1,
      blockedTasks: 0,
      activeWorkers: 2,
      idleWorkers: 1,
      averageTaskDuration: 45000,
      estimatedTimeRemaining: 120000,
      throughput: 2.5
    },
    agents: [
      {
        agentId: 'worker-1',
        type: 'worker',
        health: 'healthy',
        lastHeartbeat: new Date().toISOString(),
        tasksInProgress: 1,
        tasksCompleted: 5,
        tasksFailed: 0,
        errorCount: 0,
        cpuUsage: 67,
        memoryUsage: 2147483648 // 2GB
      },
      {
        agentId: 'worker-2',
        type: 'worker',
        health: 'healthy',
        lastHeartbeat: new Date().toISOString(),
        tasksInProgress: 1,
        tasksCompleted: 4,
        tasksFailed: 1,
        errorCount: 1,
        cpuUsage: 78,
        memoryUsage: 2684354560 // 2.5GB
      },
      {
        agentId: 'worker-3',
        type: 'worker',
        health: 'healthy',
        lastHeartbeat: new Date().toISOString(),
        tasksInProgress: 0,
        tasksCompleted: 3,
        tasksFailed: 0,
        errorCount: 0,
        cpuUsage: 12,
        memoryUsage: 1610612736 // 1.5GB
      }
    ],
    errors: [
      {
        id: 'err-1',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        severity: 'warning',
        source: 'worker-2',
        message: 'Validation score below threshold (7.5/10)'
      }
    ],
    logs: [
      {
        timestamp: new Date(Date.now() - 5000).toISOString(),
        agentId: 'worker-1',
        level: 'info',
        message: '✓ HeroSection.tsx validated'
      },
      {
        timestamp: new Date(Date.now() - 3000).toISOString(),
        agentId: 'worker-2',
        level: 'warn',
        message: 'Retry attempt 1/2 for LeadForm.tsx'
      },
      {
        timestamp: new Date(Date.now() - 1000).toISOString(),
        agentId: 'worker-3',
        level: 'info',
        message: 'Waiting for available task...'
      }
    ],
    startTime: Date.now() - 180000 // Started 3 minutes ago
  };
}
