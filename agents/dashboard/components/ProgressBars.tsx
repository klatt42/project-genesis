// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/dashboard/components/ProgressBars.tsx
// PURPOSE: Progress bars component
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 3
// WSL PATH: ~/project-genesis/agents/dashboard/components/ProgressBars.tsx
// ================================

import React from 'react';
import { Box, Text } from 'ink';
import type { ProgressMetrics } from '../../parallel-executor/types.js';

interface ProgressBarsProps {
  metrics: ProgressMetrics;
}

export const ProgressBars: React.FC<ProgressBarsProps> = ({ metrics }) => {
  const percentage = Math.round(
    (metrics.completedTasks / Math.max(1, metrics.totalTasks)) * 100
  );

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="cyan">
        ═ Progress ═════════════════════════════════════
      </Text>

      <Box marginLeft={1}>
        <Text>
          Overall: {createProgressBar(percentage, 30)} {percentage}%
        </Text>
      </Box>

      <Box marginLeft={1}>
        <Text dimColor>
          Tasks: {metrics.completedTasks}/{metrics.totalTasks} •{' '}
          Running: {metrics.runningTasks} • Queued: {metrics.queuedTasks}
        </Text>
      </Box>

      {metrics.failedTasks > 0 && (
        <Box marginLeft={1}>
          <Text color="red">
            ⚠️  Failed: {metrics.failedTasks}
          </Text>
        </Box>
      )}

      {metrics.blockedTasks > 0 && (
        <Box marginLeft={1}>
          <Text color="yellow">
            🚫 Blocked: {metrics.blockedTasks}
          </Text>
        </Box>
      )}

      {metrics.estimatedTimeRemaining !== Infinity && (
        <Box marginLeft={1}>
          <Text dimColor>
            Estimated: {formatTime(metrics.estimatedTimeRemaining)} remaining
          </Text>
        </Box>
      )}

      {metrics.throughput > 0 && (
        <Box marginLeft={1}>
          <Text dimColor>
            Throughput: {metrics.throughput.toFixed(2)} tasks/min
          </Text>
        </Box>
      )}
    </Box>
  );
};

function createProgressBar(percentage: number, width: number = 30): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  return `[${'\u2588'.repeat(filled)}${'\u2591'.repeat(empty)}]`;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
