// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/coordination/message-bus.ts
// PURPOSE: Message bus for inter-agent communication
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 2
// WSL PATH: ~/project-genesis/agents/coordination/message-bus.ts
// ================================

import type {
  AgentMessage,
  MessagePriority,
  MessageBusConfig,
  CoordinationEvent
} from './types.js';

/**
 * Message handler callback
 */
export type MessageHandler = (message: AgentMessage) => Promise<void> | void;

/**
 * Message Bus - Inter-agent communication
 */
export class MessageBus {
  private messages: Map<string, AgentMessage> = new Map(); // messageId -> message
  private queues: Map<string, AgentMessage[]> = new Map(); // agentId -> messages
  private handlers: Map<string, MessageHandler[]> = new Map(); // agentId -> handlers
  private config: MessageBusConfig;
  private events: CoordinationEvent[] = [];
  private messageCounter: number = 0;

  // Priority values for sorting
  private readonly PRIORITY_VALUES: Record<MessagePriority, number> = {
    critical: 100,
    high: 75,
    normal: 50,
    low: 25
  };

  constructor(config: Partial<MessageBusConfig> = {}) {
    this.config = {
      enableBroadcast: config.enableBroadcast ?? true,
      messageRetention: config.messageRetention || 3600000, // 1 hour
      maxQueueSize: config.maxQueueSize || 1000,
      enablePriority: config.enablePriority ?? true
    };

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Send message to agent(s)
   */
  send(
    from: string,
    to: string | string[],
    type: AgentMessage['type'],
    payload: any,
    priority: MessagePriority = 'normal',
    correlationId?: string
  ): string {
    const messageId = `msg-${++this.messageCounter}`;

    const message: AgentMessage = {
      id: messageId,
      from,
      to,
      type,
      priority,
      payload,
      timestamp: new Date().toISOString(),
      correlationId,
      expiresAt: new Date(Date.now() + this.config.messageRetention).toISOString()
    };

    this.messages.set(messageId, message);

    // Route message
    if (to === 'broadcast') {
      if (this.config.enableBroadcast) {
        this.broadcast(message);
      }
    } else if (Array.isArray(to)) {
      for (const recipient of to) {
        this.queueMessage(recipient, message);
      }
    } else {
      this.queueMessage(to, message);
    }

    this.emitEvent({
      id: `event-${Date.now()}`,
      timestamp: message.timestamp,
      type: 'message_sent',
      agentId: from,
      details: { to, type, priority }
    });

    return messageId;
  }

  /**
   * Broadcast message to all registered agents
   */
  private broadcast(message: AgentMessage): void {
    for (const agentId of this.queues.keys()) {
      if (agentId !== message.from) {
        this.queueMessage(agentId, message);
      }
    }
  }

  /**
   * Queue message for agent
   */
  private queueMessage(agentId: string, message: AgentMessage): void {
    if (!this.queues.has(agentId)) {
      this.queues.set(agentId, []);
    }

    const queue = this.queues.get(agentId)!;

    // Check queue size limit
    if (queue.length >= this.config.maxQueueSize) {
      console.warn(`⚠️  Message queue full for ${agentId}, dropping oldest message`);
      queue.shift(); // Remove oldest
    }

    queue.push(message);

    // Sort by priority if enabled
    if (this.config.enablePriority) {
      queue.sort((a, b) =>
        this.PRIORITY_VALUES[b.priority] - this.PRIORITY_VALUES[a.priority]
      );
    }

    // Trigger handlers
    this.triggerHandlers(agentId, message);
  }

  /**
   * Receive messages for agent
   */
  receive(agentId: string, limit?: number): AgentMessage[] {
    const queue = this.queues.get(agentId) || [];

    if (limit) {
      return queue.splice(0, limit);
    }

    const messages = [...queue];
    queue.length = 0; // Clear queue

    return messages;
  }

  /**
   * Peek at messages without removing
   */
  peek(agentId: string, limit?: number): AgentMessage[] {
    const queue = this.queues.get(agentId) || [];

    if (limit) {
      return queue.slice(0, limit);
    }

    return [...queue];
  }

  /**
   * Register message handler for agent
   */
  subscribe(agentId: string, handler: MessageHandler): void {
    if (!this.handlers.has(agentId)) {
      this.handlers.set(agentId, []);
    }

    this.handlers.get(agentId)!.push(handler);

    // Ensure queue exists
    if (!this.queues.has(agentId)) {
      this.queues.set(agentId, []);
    }

    console.log(`📡 ${agentId} subscribed to message bus`);
  }

  /**
   * Unsubscribe agent
   */
  unsubscribe(agentId: string): void {
    this.handlers.delete(agentId);
    console.log(`📡 ${agentId} unsubscribed from message bus`);
  }

  /**
   * Trigger handlers for new message
   */
  private triggerHandlers(agentId: string, message: AgentMessage): void {
    const handlers = this.handlers.get(agentId) || [];

    for (const handler of handlers) {
      try {
        handler(message);
      } catch (error) {
        console.error(`❌ Error in message handler for ${agentId}:`, error);
      }
    }
  }

  /**
   * Send request and wait for response
   */
  async request(
    from: string,
    to: string,
    payload: any,
    timeout: number = 5000
  ): Promise<any> {
    const correlationId = `req-${Date.now()}-${Math.random()}`;

    // Send request
    this.send(from, to, 'query', payload, 'high', correlationId);

    // Wait for response
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        // Check for response
        const queue = this.queues.get(from) || [];
        const response = queue.find(
          m => m.type === 'response' && m.correlationId === correlationId
        );

        if (response) {
          clearInterval(checkInterval);

          // Remove response from queue
          const index = queue.indexOf(response);
          queue.splice(index, 1);

          resolve(response.payload);
        }

        // Check timeout
        if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error(`Request timeout: no response from ${to}`));
        }
      }, 100);
    });
  }

  /**
   * Send response to request
   */
  respond(from: string, to: string, correlationId: string, payload: any): void {
    this.send(from, to, 'response', payload, 'high', correlationId);
  }

  /**
   * Get message by ID
   */
  getMessage(messageId: string): AgentMessage | undefined {
    return this.messages.get(messageId);
  }

  /**
   * Get queue size for agent
   */
  getQueueSize(agentId: string): number {
    return (this.queues.get(agentId) || []).length;
  }

  /**
   * Clear queue for agent
   */
  clearQueue(agentId: string): void {
    this.queues.set(agentId, []);
  }

  /**
   * Get all queues
   */
  getAllQueues(): Map<string, AgentMessage[]> {
    return new Map(this.queues);
  }

  /**
   * Get statistics
   */
  getStats() {
    let totalMessages = 0;
    let criticalMessages = 0;

    for (const queue of this.queues.values()) {
      totalMessages += queue.length;
      criticalMessages += queue.filter(m => m.priority === 'critical').length;
    }

    return {
      totalMessages: this.messages.size,
      queuedMessages: totalMessages,
      criticalMessages,
      activeAgents: this.queues.size,
      subscribers: this.handlers.size,
      averageQueueSize: this.queues.size > 0 ? totalMessages / this.queues.size : 0
    };
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredMessages();
    }, 60000); // Every minute
  }

  /**
   * Clean up expired messages
   */
  private cleanupExpiredMessages(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, message] of this.messages.entries()) {
      if (message.expiresAt) {
        const expires = new Date(message.expiresAt).getTime();
        if (now > expires) {
          toDelete.push(id);
        }
      }
    }

    for (const id of toDelete) {
      this.messages.delete(id);
    }

    if (toDelete.length > 0) {
      console.log(`🧹 Cleaned up ${toDelete.length} expired messages`);
    }
  }

  /**
   * Get events
   */
  getEvents(): CoordinationEvent[] {
    return [...this.events];
  }

  /**
   * Emit event
   */
  private emitEvent(event: CoordinationEvent): void {
    this.events.push(event);

    // Keep last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.messages.clear();
    this.queues.clear();
    this.handlers.clear();
    this.events = [];
  }
}
