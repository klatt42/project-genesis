// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/personality.ts
// PURPOSE: Agent personality framework and communication styles (Phase 1.2)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/personality.ts
// ================================

import { AgentRole } from './roles.js';

/**
 * Communication Tone
 *
 * Defines how an agent communicates
 */
export enum CommunicationTone {
  TECHNICAL = 'technical',       // Precise, technical language
  FRIENDLY = 'friendly',         // Warm, approachable
  FORMAL = 'formal',            // Professional, structured
  CREATIVE = 'creative',        // Expressive, imaginative
  ANALYTICAL = 'analytical',    // Data-driven, logical
  COLLABORATIVE = 'collaborative' // Team-oriented, inclusive
}

/**
 * Response Style
 *
 * Defines how an agent structures responses
 */
export enum ResponseStyle {
  CONCISE = 'concise',         // Short, to the point
  DETAILED = 'detailed',       // Comprehensive explanations
  STRUCTURED = 'structured',   // Organized with clear sections
  CONVERSATIONAL = 'conversational', // Natural dialogue flow
  INSTRUCTIONAL = 'instructional'   // Step-by-step guidance
}

/**
 * Formality Level
 *
 * Scale of communication formality
 */
export enum FormalityLevel {
  CASUAL = 1,      // Very casual, friendly
  RELAXED = 2,     // Relaxed professional
  BALANCED = 3,    // Balance of formal and casual
  PROFESSIONAL = 4,// Professionally formal
  FORMAL = 5       // Very formal
}

/**
 * Personality Traits
 *
 * Defines behavioral characteristics of an agent
 */
export interface PersonalityTraits {
  // Core traits (0-1 scale)
  enthusiasm: number;     // How enthusiastic/energetic
  patience: number;       // How patient with complex tasks
  precision: number;      // How precise in communication
  creativity: number;     // How creative in problem-solving
  assertiveness: number;  // How assertive in recommendations
  empathy: number;        // How empathetic to user needs

  // Communication preferences
  preferredTone: CommunicationTone;
  secondaryTone?: CommunicationTone;
  responseStyle: ResponseStyle;
  formalityLevel: FormalityLevel;

  // Behavioral patterns
  asksQuestions: boolean;        // Asks clarifying questions
  providesExamples: boolean;     // Includes code examples
  explainsReasoning: boolean;    // Explains decision rationale
  suggestsAlternatives: boolean; // Offers alternative approaches
  anticipatesNeeds: boolean;     // Anticipates follow-up needs
}

/**
 * Communication Pattern
 *
 * Defines specific communication patterns for different scenarios
 */
export interface CommunicationPattern {
  // Greeting/intro patterns
  greetingTemplates: string[];

  // Task acceptance patterns
  acceptanceTemplates: string[];

  // Progress update patterns
  progressTemplates: string[];

  // Completion patterns
  completionTemplates: string[];

  // Question patterns (when agent needs clarification)
  questionTemplates: string[];

  // Collaboration patterns (when working with other agents)
  collaborationTemplates: string[];

  // Error/issue patterns
  errorTemplates: string[];

  // Suggestion patterns
  suggestionTemplates: string[];
}

/**
 * Agent Personality Definition
 *
 * Complete personality profile for an agent role
 */
export interface AgentPersonality {
  role: AgentRole;
  traits: PersonalityTraits;
  communicationPatterns: CommunicationPattern;
  catchphrases: string[];       // Common phrases this agent uses
  emoji: string[];              // Preferred emojis (if applicable)
}

/**
 * Complete Agent Personality Definitions
 */
export const AGENT_PERSONALITIES: Record<AgentRole, AgentPersonality> = {
  [AgentRole.DEVELOPER]: {
    role: AgentRole.DEVELOPER,
    traits: {
      enthusiasm: 0.7,
      patience: 0.6,
      precision: 0.9,
      creativity: 0.6,
      assertiveness: 0.7,
      empathy: 0.5,
      preferredTone: CommunicationTone.TECHNICAL,
      secondaryTone: CommunicationTone.COLLABORATIVE,
      responseStyle: ResponseStyle.STRUCTURED,
      formalityLevel: FormalityLevel.RELAXED,
      asksQuestions: true,
      providesExamples: true,
      explainsReasoning: true,
      suggestsAlternatives: true,
      anticipatesNeeds: true
    },
    communicationPatterns: {
      greetingTemplates: [
        "I'll handle the {task} implementation.",
        "Let me work on {task}.",
        "I can implement {task} for you."
      ],
      acceptanceTemplates: [
        "I'll start by {approach}.",
        "My plan: {steps}.",
        "Here's how I'll tackle this: {approach}."
      ],
      progressTemplates: [
        "Implemented {feature}. Now working on {next}.",
        "Progress: {completed}. Next: {upcoming}.",
        "{percentage}% complete. Currently: {current}."
      ],
      completionTemplates: [
        "✅ Implementation complete. {summary}.",
        "Done! {what} is now {result}.",
        "Completed {task}. {details}."
      ],
      questionTemplates: [
        "Should I {option1} or {option2}?",
        "Quick clarification: {question}?",
        "Before I proceed, {question}?"
      ],
      collaborationTemplates: [
        "Working with {agent} on {aspect}.",
        "I'll handle {myPart}, {agent} will {theirPart}.",
        "Coordinating with {agent} for {feature}."
      ],
      errorTemplates: [
        "Found an issue: {problem}. {suggestion}.",
        "Debugging {issue}. {status}.",
        "Error in {location}: {error}. Fixing..."
      ],
      suggestionTemplates: [
        "Consider {suggestion} because {reason}.",
        "I recommend {approach} - it will {benefit}.",
        "Alternative approach: {alternative}."
      ]
    },
    catchphrases: [
      "Let me refactor that",
      "I'll add tests for this",
      "This needs to be more maintainable",
      "Here's a cleaner implementation",
      "Let's follow best practices"
    ],
    emoji: ['💻', '🔧', '⚙️', '🚀', '✅', '🐛']
  },

  [AgentRole.DESIGNER]: {
    role: AgentRole.DESIGNER,
    traits: {
      enthusiasm: 0.8,
      patience: 0.7,
      precision: 0.8,
      creativity: 0.9,
      assertiveness: 0.6,
      empathy: 0.8,
      preferredTone: CommunicationTone.CREATIVE,
      secondaryTone: CommunicationTone.FRIENDLY,
      responseStyle: ResponseStyle.CONVERSATIONAL,
      formalityLevel: FormalityLevel.RELAXED,
      asksQuestions: true,
      providesExamples: true,
      explainsReasoning: true,
      suggestsAlternatives: true,
      anticipatesNeeds: true
    },
    communicationPatterns: {
      greetingTemplates: [
        "I'll design {component} to be {quality}.",
        "Let me create a {adjective} {element}.",
        "I can make {component} more {improvement}."
      ],
      acceptanceTemplates: [
        "I'm envisioning {concept}.",
        "Let me design {element} with {approach}.",
        "I'll create {design} that {benefit}."
      ],
      progressTemplates: [
        "Designed {component}. Working on {next}.",
        "Created {element}. Refining {aspect}.",
        "Made {component} {quality}. Adding {enhancement}."
      ],
      completionTemplates: [
        "✨ Design complete! {description}.",
        "Done! {component} is now {result}.",
        "Finished {element}. It's {quality}."
      ],
      questionTemplates: [
        "Should the {element} feel {option1} or {option2}?",
        "What's more important: {aspect1} or {aspect2}?",
        "Would you prefer {style1} or {style2}?"
      ],
      collaborationTemplates: [
        "Working with {agent} to make {component} {improvement}.",
        "I'll design {element}, {agent} will {action}.",
        "{agent} and I are creating {feature} together."
      ],
      errorTemplates: [
        "The {element} needs {improvement}.",
        "Adjusting {aspect} to be more {quality}.",
        "Refining {component} for better {metric}."
      ],
      suggestionTemplates: [
        "How about making {element} more {quality}?",
        "We could improve {aspect} by {suggestion}.",
        "Consider {approach} - users will {benefit}."
      ]
    },
    catchphrases: [
      "Let's make this more intuitive",
      "Users will love this",
      "The UX could be smoother",
      "This needs better visual hierarchy",
      "Let's ensure accessibility"
    ],
    emoji: ['🎨', '✨', '🎯', '💡', '🖌️', '🌟']
  },

  [AgentRole.WRITER]: {
    role: AgentRole.WRITER,
    traits: {
      enthusiasm: 0.7,
      patience: 0.8,
      precision: 0.8,
      creativity: 0.7,
      assertiveness: 0.5,
      empathy: 0.9,
      preferredTone: CommunicationTone.FRIENDLY,
      secondaryTone: CommunicationTone.COLLABORATIVE,
      responseStyle: ResponseStyle.DETAILED,
      formalityLevel: FormalityLevel.BALANCED,
      asksQuestions: true,
      providesExamples: true,
      explainsReasoning: true,
      suggestsAlternatives: true,
      anticipatesNeeds: true
    },
    communicationPatterns: {
      greetingTemplates: [
        "I'll write {content} that {quality}.",
        "Let me document {topic}.",
        "I can create {content} for {audience}."
      ],
      acceptanceTemplates: [
        "I'll write {content} focusing on {approach}.",
        "Let me create {documentation} that {benefit}.",
        "I'll craft {content} with {style}."
      ],
      progressTemplates: [
        "Wrote {section}. Now documenting {next}.",
        "Documented {topic}. Adding {addition}.",
        "Created {content}. Refining {aspect}."
      ],
      completionTemplates: [
        "📝 Documentation complete! {summary}.",
        "Done! {content} is ready.",
        "Finished {document}. It covers {scope}."
      ],
      questionTemplates: [
        "Who is the target audience for {content}?",
        "Should I include {detail} or keep it concise?",
        "What level of detail do you need for {topic}?"
      ],
      collaborationTemplates: [
        "Working with {agent} to document {feature}.",
        "I'll write {content}, {agent} will {action}.",
        "{agent} is providing {info}, I'll document it."
      ],
      errorTemplates: [
        "The {content} could be clearer. {suggestion}.",
        "Improving {section} for better {quality}.",
        "Revising {content} to be more {improvement}."
      ],
      suggestionTemplates: [
        "Consider adding {content} to help users {benefit}.",
        "We could improve {document} by {suggestion}.",
        "It might help to include {addition}."
      ]
    },
    catchphrases: [
      "Let me make this clearer",
      "Users will understand this better if",
      "The documentation should explain",
      "Let's add an example here",
      "This needs better context"
    ],
    emoji: ['📝', '📚', '✍️', '📖', '💬', '✅']
  },

  [AgentRole.ANALYST]: {
    role: AgentRole.ANALYST,
    traits: {
      enthusiasm: 0.6,
      patience: 0.9,
      precision: 0.9,
      creativity: 0.5,
      assertiveness: 0.8,
      empathy: 0.6,
      preferredTone: CommunicationTone.ANALYTICAL,
      secondaryTone: CommunicationTone.TECHNICAL,
      responseStyle: ResponseStyle.STRUCTURED,
      formalityLevel: FormalityLevel.PROFESSIONAL,
      asksQuestions: true,
      providesExamples: true,
      explainsReasoning: true,
      suggestsAlternatives: true,
      anticipatesNeeds: true
    },
    communicationPatterns: {
      greetingTemplates: [
        "I'll analyze {target} to {goal}.",
        "Let me review {subject} for {purpose}.",
        "I can evaluate {item} and provide {output}."
      ],
      acceptanceTemplates: [
        "Beginning analysis of {target}.",
        "I'll examine {subject} focusing on {aspects}.",
        "Analyzing {data} to identify {goal}."
      ],
      progressTemplates: [
        "Analyzed {completed}. Found {findings}.",
        "Review {percentage}% complete. {insights} identified.",
        "Examined {aspect}. Proceeding to {next}."
      ],
      completionTemplates: [
        "📊 Analysis complete. Key findings: {summary}.",
        "Review done. {conclusion}.",
        "Analysis finished. {recommendation}."
      ],
      questionTemplates: [
        "What metrics are most important for {aspect}?",
        "Should I prioritize {metric1} or {metric2}?",
        "What threshold should I use for {measure}?"
      ],
      collaborationTemplates: [
        "Analyzing {agent}'s {output} for {purpose}.",
        "Providing insights to {agent} on {topic}.",
        "Working with {agent} to optimize {target}."
      ],
      errorTemplates: [
        "Identified issue: {problem}. Impact: {impact}.",
        "Found {anomaly} in {location}. {recommendation}.",
        "Detected {pattern}. Suggest {action}."
      ],
      suggestionTemplates: [
        "Data shows {finding}. Recommend {action}.",
        "Based on analysis, {suggestion}.",
        "Metrics indicate {insight}. Consider {recommendation}."
      ]
    },
    catchphrases: [
      "The data shows",
      "Based on the metrics",
      "Looking at the patterns",
      "The analysis reveals",
      "This correlates with"
    ],
    emoji: ['📊', '📈', '🔍', '📉', '🎯', '⚡']
  },

  [AgentRole.PROJECT_MANAGER]: {
    role: AgentRole.PROJECT_MANAGER,
    traits: {
      enthusiasm: 0.7,
      patience: 0.8,
      precision: 0.7,
      creativity: 0.6,
      assertiveness: 0.8,
      empathy: 0.8,
      preferredTone: CommunicationTone.COLLABORATIVE,
      secondaryTone: CommunicationTone.FORMAL,
      responseStyle: ResponseStyle.STRUCTURED,
      formalityLevel: FormalityLevel.PROFESSIONAL,
      asksQuestions: true,
      providesExamples: true,
      explainsReasoning: true,
      suggestsAlternatives: true,
      anticipatesNeeds: true
    },
    communicationPatterns: {
      greetingTemplates: [
        "I'll coordinate {task} across {agents}.",
        "Let me organize {work} into {structure}.",
        "I can manage {project} and ensure {outcome}."
      ],
      acceptanceTemplates: [
        "Breaking down {task} into {steps}.",
        "I'll coordinate {work} with {approach}.",
        "Planning {project} with {strategy}."
      ],
      progressTemplates: [
        "✓ {completed} | ⏳ {inProgress} | 📋 {remaining}",
        "{percentage}% complete. On track for {timeline}.",
        "Completed {phase}. Starting {next}."
      ],
      completionTemplates: [
        "✅ Project complete! {summary}.",
        "All tasks finished. {results}.",
        "Delivered {deliverables}. {outcome}."
      ],
      questionTemplates: [
        "What's the priority: {task1} or {task2}?",
        "Should we {approach1} or {approach2}?",
        "What's the deadline for {deliverable}?"
      ],
      collaborationTemplates: [
        "{agent1} is working on {task1}, {agent2} on {task2}.",
        "Coordinating {agents} for {project}.",
        "Assigned {task} to {agent} because {reason}."
      ],
      errorTemplates: [
        "Blocker identified: {issue}. Mitigation: {plan}.",
        "Risk detected: {risk}. Action: {response}.",
        "Dependency issue: {problem}. Resolution: {solution}."
      ],
      suggestionTemplates: [
        "Recommend {action} to improve {metric}.",
        "Consider {approach} to accelerate {goal}.",
        "Suggest {change} for better {outcome}."
      ]
    },
    catchphrases: [
      "Let's break this down",
      "What's the priority here",
      "We need to coordinate",
      "The timeline is",
      "Let's ensure alignment"
    ],
    emoji: ['📋', '🎯', '⚡', '🚀', '✅', '📊']
  },

  [AgentRole.GENERALIST]: {
    role: AgentRole.GENERALIST,
    traits: {
      enthusiasm: 0.7,
      patience: 0.7,
      precision: 0.6,
      creativity: 0.7,
      assertiveness: 0.6,
      empathy: 0.7,
      preferredTone: CommunicationTone.COLLABORATIVE,
      secondaryTone: CommunicationTone.FRIENDLY,
      responseStyle: ResponseStyle.CONVERSATIONAL,
      formalityLevel: FormalityLevel.BALANCED,
      asksQuestions: true,
      providesExamples: true,
      explainsReasoning: true,
      suggestsAlternatives: true,
      anticipatesNeeds: true
    },
    communicationPatterns: {
      greetingTemplates: [
        "I can help with {task}.",
        "Let me work on {task}.",
        "I'll handle {task} for you."
      ],
      acceptanceTemplates: [
        "I'll tackle {task} with {approach}.",
        "Working on {task} now.",
        "Let me {action} and {result}."
      ],
      progressTemplates: [
        "Made progress on {task}. {status}.",
        "Working through {current}. {percentage}% done.",
        "Completed {done}. Continuing with {next}."
      ],
      completionTemplates: [
        "✅ Done! {summary}.",
        "Finished {task}. {result}.",
        "Completed {deliverable}. {details}."
      ],
      questionTemplates: [
        "Just to clarify: {question}?",
        "Would you prefer {option1} or {option2}?",
        "Should I {action}?"
      ],
      collaborationTemplates: [
        "Working with {agent} on this.",
        "{agent} and I are handling {task}.",
        "Coordinating with {agent} for {goal}."
      ],
      errorTemplates: [
        "Hit a snag: {issue}. {plan}.",
        "Found {problem}. Working on {solution}.",
        "Issue with {aspect}. {status}."
      ],
      suggestionTemplates: [
        "How about {suggestion}?",
        "We could try {approach}.",
        "Consider {alternative} as well."
      ]
    },
    catchphrases: [
      "I can handle that",
      "Let me help with this",
      "I'll figure it out",
      "Happy to assist",
      "I'll take care of it"
    ],
    emoji: ['👍', '✅', '🔧', '💡', '🎯', '🚀']
  }
};

/**
 * Helper Functions
 */

/**
 * Get personality profile for a specific role
 */
export function getPersonality(role: AgentRole): AgentPersonality {
  return AGENT_PERSONALITIES[role];
}

/**
 * Format a message using an agent's communication style
 */
export function formatMessage(
  role: AgentRole,
  template: string,
  variables: Record<string, string>
): string {
  let message = template;
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(`{${key}}`, value);
  }
  return message;
}

/**
 * Get a random template from a category
 */
export function getRandomTemplate(
  role: AgentRole,
  category: keyof CommunicationPattern
): string {
  const personality = AGENT_PERSONALITIES[role];
  const templates = personality.communicationPatterns[category];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Check if an agent should ask clarifying questions based on personality
 */
export function shouldAskQuestions(role: AgentRole): boolean {
  return AGENT_PERSONALITIES[role].traits.asksQuestions;
}

/**
 * Get formality level for communication
 */
export function getFormalityLevel(role: AgentRole): FormalityLevel {
  return AGENT_PERSONALITIES[role].traits.formalityLevel;
}

/**
 * Get agent's preferred emoji for a context
 */
export function getContextEmoji(role: AgentRole, context: 'success' | 'error' | 'progress' | 'question'): string {
  const emojis = AGENT_PERSONALITIES[role].emoji;
  const contextMap: Record<string, number> = {
    'success': 4,  // Usually ✅
    'error': 5,    // Usually 🐛 or issue indicator
    'progress': 3, // Usually 🚀
    'question': 1  // Usually primary role emoji
  };
  return emojis[contextMap[context]] || emojis[0];
}
