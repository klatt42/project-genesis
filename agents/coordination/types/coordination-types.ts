// ================================
// PROJECT: Genesis Agent SDK - Coordination Agent
// FILE: agents/coordination/types/coordination-types.ts
// PURPOSE: Core type definitions for multi-agent coordination
// GENESIS REF: Autonomous Agent Development - Task 1
// WSL PATH: ~/project-genesis/agents/coordination/types/coordination-types.ts
// ================================

// ================================
// CORE COORDINATION TYPES
// ================================

export interface ProjectSpec {
  id: string;
  name: string;
  type: 'landing-page' | 'saas-app';
  prd: ProductRequirementDocument;
  genesisPatterns: string[];
  constraints: ProjectConstraints;
  metadata: ProjectMetadata;
}

export interface ProductRequirementDocument {
  vision: string;
  targetUsers: string[];
  keyFeatures: string[];
  successMetrics: string[];
  constraints: string[];
  timeline?: string;
}

export interface ProjectConstraints {
  budget?: number;
  timeline?: string;
  teamSize?: number;
  technicalConstraints?: string[];
  businessConstraints?: string[];
}

export interface ProjectMetadata {
  createdAt: Date;
  createdBy: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  repository?: string;
}

// ================================
// TASK TREE STRUCTURE
// ================================

export interface TaskTree {
  root: TaskNode;
  totalTasks: number;
  estimatedDuration: number;
  criticalPath: string[]; // Task IDs on critical path
  parallelGroups: ParallelTaskGroup[];
}

export interface TaskNode {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  assignedAgent: AgentRole;
  dependencies: string[]; // Task IDs this depends on
  subtasks: TaskNode[];
  estimatedDuration: number;
  priority: number;
  genesisPattern?: string;
  metadata: TaskMetadata;
}

export type TaskType =
  | 'setup'
  | 'configuration'
  | 'implementation'
  | 'testing'
  | 'deployment'
  | 'validation';

export type TaskStatus =
  | 'pending'
  | 'ready'
  | 'in-progress'
  | 'blocked'
  | 'completed'
  | 'failed';

export type AgentRole =
  | 'genesis-setup'
  | 'genesis-feature'
  | 'bmad-victoria'    // Quality/Testing
  | 'bmad-elena'       // Deployment
  | 'coordination';

export interface TaskMetadata {
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  attempts: number;
  errors: TaskError[];
  checkpoints: TaskCheckpoint[];
}

export interface TaskError {
  timestamp: Date;
  message: string;
  stack?: string;
  recoveryAttempted: boolean;
  recovered: boolean;
}

export interface TaskCheckpoint {
  timestamp: Date;
  description: string;
  progress: number; // 0-100
  artifacts: string[];
}

// ================================
// PARALLEL EXECUTION
// ================================

export interface ParallelTaskGroup {
  id: string;
  name: string;
  tasks: TaskNode[];
  strategy: ExecutionStrategy;
  dependencies: string[]; // Group IDs this depends on
  estimatedDuration: number;
  maxParallelism: number;
}

export type ExecutionStrategy =
  | 'parallel'      // All tasks simultaneously
  | 'sequential'    // One after another
  | 'pipeline'      // Output of one feeds next
  | 'collaborative'; // Agents work together

export interface ExecutionPlan {
  projectId: string;
  taskTree: TaskTree;
  executionOrder: ExecutionPhase[];
  resourceAllocation: ResourceAllocation;
  estimatedTotalDuration: number;
  parallelismDegree: number; // Average concurrent tasks
}

export interface ExecutionPhase {
  phase: number;
  name: string;
  parallelGroups: ParallelTaskGroup[];
  sequentialTasks: TaskNode[];
  dependencies: number[]; // Phase numbers this depends on
  estimatedDuration: number;
}

export interface ResourceAllocation {
  agentAssignments: Map<AgentRole, TaskNode[]>;
  cpuAllocation: Map<AgentRole, number>;
  memoryAllocation: Map<AgentRole, number>;
  contextTokens: Map<AgentRole, number>;
}

// ================================
// AGENT COMMUNICATION
// ================================

export interface AgentCoordinationMessage {
  messageId: string;
  timestamp: Date;
  fromAgent: AgentRole;
  toAgent: AgentRole | 'broadcast';
  messageType: MessageType;
  payload: MessagePayload;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresResponse: boolean;
}

export type MessageType =
  | 'task-assignment'
  | 'task-started'
  | 'task-progress'
  | 'task-completed'
  | 'task-failed'
  | 'resource-request'
  | 'context-share'
  | 'dependency-met'
  | 'coordination-query';

export interface MessagePayload {
  taskId?: string;
  status?: TaskStatus;
  progress?: number;
  result?: TaskResult;
  error?: TaskError;
  contextData?: Record<string, any>;
  [key: string]: any;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  output: any;
  artifacts: string[];
  duration: number;
  quality: number; // 0-100
  genesisCompliance: number; // 0-100
  notes: string[];
}

// ================================
// ERROR RECOVERY
// ================================

export interface RecoveryStrategy {
  errorPattern: string;
  recoveryActions: RecoveryAction[];
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential';
  fallbackStrategy?: string;
}

export interface RecoveryAction {
  action: 'retry' | 'rollback' | 'skip' | 'reassign' | 'manual-intervention';
  params: Record<string, any>;
  estimatedDuration: number;
}

// ================================
// PROGRESS MONITORING
// ================================

export interface ProjectProgress {
  projectId: string;
  overallProgress: number; // 0-100
  completedTasks: number;
  totalTasks: number;
  currentPhase: string;
  activeTasks: TaskNode[];
  blockedTasks: TaskNode[];
  estimatedCompletion: Date;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export interface AgentStatus {
  agent: AgentRole;
  status: 'idle' | 'busy' | 'blocked' | 'error';
  currentTask?: TaskNode;
  tasksCompleted: number;
  averageTaskDuration: number;
  errorRate: number;
  lastActivity: Date;
}
