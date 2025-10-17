// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/dashboard/components/ErrorPanel.tsx
// PURPOSE: Error display panel component
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 3
// WSL PATH: ~/project-genesis/agents/dashboard/components/ErrorPanel.tsx
// ================================

import React from 'react';
import { Box, Text } from 'ink';
import type { DashboardError } from '../types.js';

interface ErrorPanelProps {
  errors: DashboardError[];
  maxErrors?: number;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ errors, maxErrors = 5 }) => {
  const displayErrors = errors.slice(-maxErrors).reverse();

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text bold color="cyan">
        ═ Errors ═══════════════════════════════════════
      </Text>

      {displayErrors.length === 0 ? (
        <Box marginLeft={1}>
          <Text color="green">✓ No errors</Text>
        </Box>
      ) : (
        displayErrors.map((error) => (
          <Box key={error.id} marginLeft={1} flexDirection="column">
            <Text>
              <Text color={getSeverityColor(error.severity)}>
                {getSeverityIcon(error.severity)}
              </Text>
              {' '}
              <Text dimColor>
                [{formatTimestamp(error.timestamp)}]
              </Text>
              {' '}
              <Text bold>{error.source}:</Text>
              {' '}
              {error.message}
            </Text>

            {error.stack && (
              <Box marginLeft={3}>
                <Text dimColor>{error.stack.split('\n')[0]}</Text>
              </Box>
            )}
          </Box>
        ))
      )}

      {errors.length > maxErrors && (
        <Box marginLeft={1}>
          <Text dimColor>
            ... and {errors.length - maxErrors} more errors
          </Text>
        </Box>
      )}
    </Box>
  );
};

function getSeverityIcon(severity: DashboardError['severity']): string {
  switch (severity) {
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️ ';
    case 'info':
      return 'ℹ️ ';
    default:
      return '•';
  }
}

function getSeverityColor(severity: DashboardError['severity']): string {
  switch (severity) {
    case 'error':
      return 'red';
    case 'warning':
      return 'yellow';
    case 'info':
      return 'blue';
    default:
      return 'white';
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour12: false });
}
