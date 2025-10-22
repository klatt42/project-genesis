// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/dashboard/components/LogStream.tsx
// PURPOSE: Log streaming component
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 3
// WSL PATH: ~/project-genesis/agents/dashboard/components/LogStream.tsx
// ================================

import React from 'react';
import { Box, Text } from 'ink';
import type { LogEntry } from '../types.js';

interface LogStreamProps {
  logs: LogEntry[];
  maxLogs?: number;
}

export const LogStream: React.FC<LogStreamProps> = ({ logs, maxLogs = 10 }) => {
  const displayLogs = logs.slice(-maxLogs);

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="cyan">
        ═ Logs ═════════════════════════════════════════
      </Text>

      {displayLogs.length === 0 ? (
        <Box marginLeft={1}>
          <Text dimColor>No logs yet...</Text>
        </Box>
      ) : (
        displayLogs.map((log, index) => (
          <Box key={`${log.timestamp}-${index}`} marginLeft={1}>
            <Text dimColor>
              [{formatTimestamp(log.timestamp)}]
            </Text>
            <Text> </Text>
            <Text color={getLevelColor(log.level)}>
              [{log.level.toUpperCase()}]
            </Text>
            <Text> </Text>
            <Text bold>[{log.agentId}]</Text>
            <Text> </Text>
            <Text>{log.message}</Text>
          </Box>
        ))
      )}

      {logs.length > maxLogs && (
        <Box marginLeft={1}>
          <Text dimColor>
            ... {logs.length - maxLogs} more logs (scrolled)
          </Text>
        </Box>
      )}
    </Box>
  );
};

function getLevelColor(level: LogEntry['level']): string {
  switch (level) {
    case 'error':
      return 'red';
    case 'warn':
      return 'yellow';
    case 'info':
      return 'green';
    case 'debug':
      return 'gray';
    default:
      return 'white';
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour12: false });
}
