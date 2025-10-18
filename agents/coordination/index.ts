// ================================
// PROJECT: Genesis Agent SDK - Coordination Agent
// FILE: agents/coordination/index.ts
// PURPOSE: Main exports for coordination agent
// GENESIS REF: Autonomous Agent Development - Task 1
// WSL PATH: ~/project-genesis/agents/coordination/index.ts
// ================================

export { CoordinationAgent, createCoordinationAgent } from './coordinator.js';
export { TaskDecomposer } from './task-decomposer.js';
export { ExecutionPlanner } from './execution-planner.js';
export * from './types/coordination-types.js';
