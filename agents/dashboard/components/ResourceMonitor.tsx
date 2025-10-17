// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/dashboard/components/ResourceMonitor.tsx
// PURPOSE: Resource usage monitoring component
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 3
// WSL PATH: ~/project-genesis/agents/dashboard/components/ResourceMonitor.tsx
// ================================

import React from 'react';
import { Box, Text } from 'ink';
import type { AgentStatus } from '../../coordination/types.js';

interface ResourceMonitorProps {
  agents: AgentStatus[];
}

export const ResourceMonitor: React.FC<ResourceMonitorProps> = ({ agents }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="cyan">
        ═ Resources ════════════════════════════════════
      </Text>

      {agents.map((agent) => (
        <Box key={agent.agentId} marginLeft={1} flexDirection="column">
          <Text>
            {agent.agentId}:
          </Text>

          {agent.cpuUsage !== undefined && (
            <Box marginLeft={2}>
              <Text dimColor>
                CPU: {createSparkline([agent.cpuUsage])} {agent.cpuUsage.toFixed(1)}%
              </Text>
            </Box>
          )}

          {agent.memoryUsage !== undefined && (
            <Box marginLeft={2}>
              <Text dimColor>
                Mem: {formatBytes(agent.memoryUsage)}
              </Text>
            </Box>
          )}

          {agent.tasksInProgress > 0 && (
            <Box marginLeft={2}>
              <Text dimColor>
                Tasks: {agent.tasksInProgress} in progress
              </Text>
            </Box>
          )}
        </Box>
      ))}

      {agents.length === 0 && (
        <Box marginLeft={1}>
          <Text dimColor>No resource data available</Text>
        </Box>
      )}
    </Box>
  );
};

function createSparkline(values: number[]): string {
  const chars = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];

  if (values.length === 0) return '';

  const max = Math.max(...values, 1);

  return values
    .map((value) => {
      const index = Math.min(
        Math.floor((value / max) * chars.length),
        chars.length - 1
      );
      return chars[index];
    })
    .join('');
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
