---
name: genesis-copilotkit
description: AI feature integration with CopilotKit for CRUD actions and context-aware assistance
---

# Genesis CopilotKit

## When to Use This Skill

Load this skill when user mentions:
- "copilotkit" OR "copilot kit" OR "copilotkitai"
- "ai features" OR "ai integration" OR "add ai"
- "ai assistant" OR "ai chat"
- "natural language" OR "voice commands"
- "ai actions" OR "ai powered"

## Key Patterns

### Pattern 1: Setup (4 Steps)

```bash
# 1. Install
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/backend openai

# 2. Environment
echo "OPENAI_API_KEY=your-key" >> .env.local

# 3. Create providers (app/providers.tsx)
# 4. Create API route (app/api/copilotkit/route.ts)
```

**Providers**:
```typescript
'use client';
import { CopilotKit } from '@copilotkit/react-core';

export function Providers({ children }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      {children}
    </CopilotKit>
  );
}
```

**API Route**:
```typescript
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/backend';

const runtime = new CopilotRuntime();

export const POST = async (req: Request) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new OpenAIAdapter(),
    endpoint: '/api/copilotkit',
  });
  return handleRequest(req);
};
```

### Pattern 2: CRUD Actions

```typescript
import { useCopilotAction } from '@copilotkit/react-core';

// CREATE
useCopilotAction({
  name: 'createProject',
  description: 'Create a new project with a name',
  parameters: [
    { name: 'projectName', type: 'string', required: true }
  ],
  handler: async ({ projectName }) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: projectName }),
    });
    return `Project "${projectName}" created!`;
  },
});

// READ, UPDATE, DELETE - same pattern
```

**User says**: "Create a project called 'Website Redesign'"
**AI does**: Calls createProject action automatically

### Pattern 3: Context-Aware Assistant

```typescript
import { useCopilotReadable } from '@copilotkit/react-core';

// Make data available to AI
useCopilotReadable({
  description: 'Current user information',
  value: { name: user.name, email: user.email },
});

useCopilotReadable({
  description: 'Dashboard statistics',
  value: { projectCount: 12, taskCount: 45 },
});
```

**User says**: "How many projects do I have?"
**AI knows**: "You have 12 projects" (reads context automatically)

### Pattern 4: AI-Enhanced Forms

```typescript
useCopilotAction({
  name: 'fillForm',
  description: 'Fill out the project form',
  parameters: [
    { name: 'formData', type: 'object', required: true }
  ],
  handler: async ({ formData }) => {
    setFormData(formData);
    return 'Form filled!';
  },
});
```

**User says**: "Fill in a project called 'Marketing' with high priority"
**AI does**: Populates form fields automatically

### Pattern 5: Multi-Step Workflows

```typescript
useCopilotAction({
  name: 'setupNewClient',
  description: 'Create client, project, and tasks',
  parameters: [
    { name: 'clientName', type: 'string', required: true },
    { name: 'projectType', type: 'string', required: true },
  ],
  handler: async ({ clientName, projectType }) => {
    // Step 1: Create client
    const client = await createClient(clientName);
    // Step 2: Create project
    const project = await createProject(projectType, client.id);
    // Step 3: Create tasks
    await createTasks(['Discovery', 'Design', 'Launch'], project.id);

    return `Client "${clientName}" set up with 3 tasks!`;
  },
});
```

**User says**: "Set up Acme Corp for a website project"
**AI does**: 3 operations in sequence automatically

## Quick Reference

| Pattern | Hook | Use Case |
|---------|------|----------|
| CRUD Actions | useCopilotAction | Create, update, delete via AI |
| Context | useCopilotReadable | Make app state available to AI |
| Forms | useCopilotAction | AI fills form fields |
| Workflows | useCopilotAction | Multi-step operations |

### Action Naming Best Practices

- Use verb-noun pattern: createProject, updateTask
- Be descriptive: "Create a new project" > "Add"
- Include parameter descriptions
- Return user-friendly messages

## Command Templates

```bash
# Complete CopilotKit setup
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/backend openai
echo "OPENAI_API_KEY=your-key" >> .env.local
mkdir -p app/api/copilotkit

# Test actions
# User: "Create a project called 'Test'"
# User: "Show me my projects"
# User: "Update Test Project to high priority"
```

## Integration with Other Skills

- Use **genesis-stack-setup** for installation steps
- Use **genesis-saas-app** for database-backed actions
- Combine with **genesis-supabase** for AI-powered queries
- Use with **genesis-deployment** for production config

## Best Practices

1. **Action names**: Clear verb-noun pattern (createProject)
2. **Descriptions**: Detailed parameter descriptions
3. **Error handling**: Try-catch in handlers, return error messages
4. **State sync**: Update local state after AI actions
5. **Security**: Never expose sensitive data in context

## Troubleshooting

**CopilotKit not loading**:
- Check OPENAI_API_KEY is set
- Verify /api/copilotkit route exists
- Ensure provider wraps components

**Actions not working**:
- Check action names are unique
- Verify parameter descriptions are clear
- Ensure handler returns string or object

## Deep Dive

For complete patterns and examples, reference:
- docs/COPILOTKIT_PATTERNS.md (all 6 patterns, advanced config, troubleshooting)
