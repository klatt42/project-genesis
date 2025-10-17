// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/dashboard/components/AgentGrid.tsx
// PURPOSE: Agent status grid component
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 3
// WSL PATH: ~/project-genesis/agents/dashboard/components/AgentGrid.tsx
// ================================

import React from 'react';
import { Box, Text } from 'ink';
import type { Worker } from '../../parallel-executor/types.js';

interface AgentGridProps {
  workers: Worker[];
}

export const AgentGrid: React.FC<AgentGridProps> = ({ workers }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="cyan">
        ═ Agents ═══════════════════════════════════════
      </Text>

      {workers.map((worker) => (
        <Box key={worker.id} marginLeft={1}>
          <Text>
            {getStatusIcon(worker.status)} {worker.id}:{' '}
            <Text color={getStatusColor(worker.status)}>
              {worker.status.toUpperCase()}
            </Text>
            {worker.currentTask && (
              <Text dimColor> → {worker.currentTask.task.name}</Text>
            )}
            {' '}
            <Text dimColor>
              ({worker.tasksCompleted} done, {worker.tasksFailed} failed)
            </Text>
          </Text>
        </Box>
      ))}

      {workers.length === 0 && (
        <Box marginLeft={1}>
          <Text dimColor>No workers active</Text>
        </Box>
      )}
    </Box>
  );
};

function getStatusIcon(status: Worker['status']): string {
  switch (status) {
    case 'busy':
      return '🔨';
    case 'idle':
      return '💤';
    case 'error':
      return '❌';
    case 'terminated':
      return '🛑';
    default:
      return '•';
  }
}

function getStatusColor(status: Worker['status']): string {
  switch (status) {
    case 'busy':
      return 'green';
    case 'idle':
      return 'yellow';
    case 'error':
      return 'red';
    case 'terminated':
      return 'gray';
    default:
      return 'white';
  }
}
