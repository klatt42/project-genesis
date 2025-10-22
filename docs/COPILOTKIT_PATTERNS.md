# Genesis CopilotKit Integration Patterns

## Purpose
AI-powered features integration using CopilotKit for Genesis applications.

## When to Use CopilotKit

**Use CopilotKit for**:
- AI chat assistant in your app
- AI-powered actions (CRUD with natural language)
- Context-aware suggestions
- AI-enhanced user interactions
- Automated workflows

**Don't Use for**:
- Simple OpenAI API calls (use OpenAI SDK directly)
- Background AI processing (use API routes)
- One-off AI features (use API routes)

---

## Installation & Setup

### Step 1: Install Dependencies

```bash
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/backend
npm install openai  # Peer dependency
```

### Step 2: Environment Variables

```bash
# .env.local
OPENAI_API_KEY=your-openai-api-key
```

### Step 3: Create Backend Runtime

```typescript
// app/api/copilotkit/route.ts
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/backend';

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

### Step 4: Setup Provider

```typescript
// app/providers.tsx
'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar>
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}
```

### Step 5: Wrap Application

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Pattern 1: CRUD Actions

### Define Actions with useCopilotAction

```typescript
// app/dashboard/projects/page.tsx
'use client';

import { useCopilotAction } from '@copilotkit/react-core';
import { useState } from 'react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  // CREATE action
  useCopilotAction({
    name: 'createProject',
    description: 'Create a new project with a name and optional description',
    parameters: [
      {
        name: 'projectName',
        type: 'string',
        description: 'The name of the project',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        description: 'Optional project description',
        required: false,
      },
    ],
    handler: async ({ projectName, description }) => {
      // Call your API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, description }),
      });

      const newProject = await response.json();
      setProjects([...projects, newProject]);

      return `Project "${projectName}" created successfully!`;
    },
  });

  // READ action (provide context)
  useCopilotAction({
    name: 'listProjects',
    description: 'Get a list of all projects',
    parameters: [],
    handler: async () => {
      return `You have ${projects.length} projects: ${projects.map(p => p.name).join(', ')}`;
    },
  });

  // UPDATE action
  useCopilotAction({
    name: 'updateProject',
    description: 'Update an existing project',
    parameters: [
      {
        name: 'projectId',
        type: 'string',
        description: 'The ID of the project to update',
        required: true,
      },
      {
        name: 'updates',
        type: 'object',
        description: 'The fields to update (name, description, etc.)',
        required: true,
      },
    ],
    handler: async ({ projectId, updates }) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const updatedProject = await response.json();

      // Update local state
      setProjects(projects.map(p =>
        p.id === projectId ? updatedProject : p
      ));

      return `Project updated successfully!`;
    },
  });

  // DELETE action
  useCopilotAction({
    name: 'deleteProject',
    description: 'Delete a project',
    parameters: [
      {
        name: 'projectId',
        type: 'string',
        description: 'The ID of the project to delete',
        required: true,
      },
    ],
    handler: async ({ projectId }) => {
      await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));

      return `Project deleted successfully!`;
    },
  });

  return (
    <div>
      <h1>Projects</h1>
      {/* Your UI */}
    </div>
  );
}
```

**User Experience**:
```
User: "Create a project called 'Website Redesign' with description 'New company website'"
AI: [Calls createProject action] "Project 'Website Redesign' created successfully!"

User: "Show me my projects"
AI: [Calls listProjects action] "You have 5 projects: Website Redesign, Mobile App, ..."

User: "Update the Website Redesign project to be called 'Website Refresh'"
AI: [Calls updateProject action] "Project updated successfully!"

User: "Delete the Mobile App project"
AI: [Calls deleteProject action] "Project deleted successfully!"
```

---

## Pattern 2: Context-Aware Assistant

### Provide Application Context

```typescript
'use client';

import { useCopilotReadable } from '@copilotkit/react-core';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  // Make user context available to AI
  useCopilotReadable({
    description: 'Current user information',
    value: user,
  });

  // Make statistics available to AI
  useCopilotReadable({
    description: 'Dashboard statistics including project count, task count, etc.',
    value: stats,
  });

  return (
    <div>
      {/* Dashboard UI */}
    </div>
  );
}
```

**User Experience**:
```
User: "How many projects do I have?"
AI: [Reads stats context] "You currently have 12 projects."

User: "What's my email address?"
AI: [Reads user context] "Your email is john@example.com"
```

---

## Pattern 3: AI-Enhanced Forms

### Form Generation with AI

```typescript
'use client';

import { useCopilotAction } from '@copilotkit/react-core';
import { useState } from 'react';

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    priority: 'medium',
  });

  useCopilotAction({
    name: 'fillProjectForm',
    description: 'Fill out the project form with provided information',
    parameters: [
      {
        name: 'projectInfo',
        type: 'object',
        description: 'Project information to fill in the form',
        required: true,
      },
    ],
    handler: async ({ projectInfo }) => {
      setFormData({
        name: projectInfo.name || formData.name,
        description: projectInfo.description || formData.description,
        deadline: projectInfo.deadline || formData.deadline,
        priority: projectInfo.priority || formData.priority,
      });

      return 'Form filled successfully!';
    },
  });

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {/* Other form fields */}
    </form>
  );
}
```

**User Experience**:
```
User: "Fill in the form for a new project called 'Marketing Campaign' with high priority and deadline next Friday"
AI: [Calls fillProjectForm] "Form filled successfully!"
[Form fields are populated automatically]
```

---

## Pattern 4: Multi-Step Workflows

### Complex Action Sequences

```typescript
useCopilotAction({
  name: 'setupNewClient',
  description: 'Set up a new client with project, team, and initial tasks',
  parameters: [
    {
      name: 'clientName',
      type: 'string',
      description: 'Name of the client',
      required: true,
    },
    {
      name: 'projectType',
      type: 'string',
      description: 'Type of project (website, app, etc.)',
      required: true,
    },
  ],
  handler: async ({ clientName, projectType }) => {
    // Step 1: Create client
    const client = await fetch('/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: clientName }),
    }).then(r => r.json());

    // Step 2: Create project
    const project = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: `${clientName} ${projectType}`,
        clientId: client.id,
      }),
    }).then(r => r.json());

    // Step 3: Create default tasks
    const tasks = ['Discovery', 'Design', 'Development', 'Launch'];
    await Promise.all(
      tasks.map(task =>
        fetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({
            name: task,
            projectId: project.id,
          }),
        })
      )
    );

    return `Client "${clientName}" set up successfully with ${tasks.length} initial tasks!`;
  },
});
```

**User Experience**:
```
User: "Set up a new client called 'Acme Corp' for a website project"
AI: [Calls setupNewClient] "Client 'Acme Corp' set up successfully with 4 initial tasks!"
```

---

## Pattern 5: Supabase Integration

### AI-Powered Database Operations

```typescript
'use client';

import { useCopilotAction } from '@copilotkit/react-core';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DataPage() {
  const supabase = createClientComponentClient();

  useCopilotAction({
    name: 'queryProjects',
    description: 'Query projects from database with filters',
    parameters: [
      {
        name: 'filter',
        type: 'object',
        description: 'Filter criteria (status, priority, etc.)',
        required: false,
      },
    ],
    handler: async ({ filter = {} }) => {
      let query = supabase.from('projects').select('*');

      // Apply filters
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      if (filter.priority) {
        query = query.eq('priority', filter.priority);
      }

      const { data, error } = await query;

      if (error) throw error;

      return `Found ${data.length} projects matching your criteria`;
    },
  });

  return <div>{/* UI */}</div>;
}
```

**User Experience**:
```
User: "Show me all high priority projects that are in progress"
AI: [Calls queryProjects with filter] "Found 3 projects matching your criteria"
```

---

## Pattern 6: Custom UI Components

### Custom Chat Interface

```typescript
'use client';

import { CopilotChat } from '@copilotkit/react-ui';

export default function CustomChatPage() {
  return (
    <div className="flex h-screen">
      <div className="flex-1">
        {/* Your main content */}
      </div>

      <div className="w-96 border-l">
        <CopilotChat
          instructions="You are a helpful assistant for managing projects. Help users create, update, and organize their work."
          labels={{
            title: "Project Assistant",
            initial: "Hi! I can help you manage your projects. Try asking me to create a new project!",
          }}
        />
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. Action Naming
- Use clear, descriptive names
- Follow verb-noun pattern (createProject, updateTask)
- Be consistent across similar actions

### 2. Parameter Descriptions
- Provide detailed descriptions
- Specify required vs optional
- Include examples in description

### 3. Error Handling
```typescript
useCopilotAction({
  name: 'createProject',
  // ... other config
  handler: async ({ projectName }) => {
    try {
      const result = await createProject(projectName);
      return `Success: ${result.message}`;
    } catch (error) {
      return `Error: ${error.message}. Please try again.`;
    }
  },
});
```

### 4. State Synchronization
- Always update local state after actions
- Use optimistic UI updates
- Provide feedback to AI about state changes

### 5. Context Management
```typescript
// Only expose necessary context
useCopilotReadable({
  description: 'Current project details',
  value: {
    id: project.id,
    name: project.name,
    // Don't expose sensitive data
  },
});
```

---

## Advanced Patterns

### Custom Model Configuration

```typescript
// app/api/copilotkit/route.ts
import { OpenAIAdapter } from '@copilotkit/backend';

const adapter = new OpenAIAdapter({
  model: 'gpt-4',  // Use GPT-4 for better results
  temperature: 0.7,
});

export const POST = async (req: Request) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: adapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
```

### Streaming Responses

```typescript
useCopilotAction({
  name: 'generateReport',
  description: 'Generate a detailed project report',
  parameters: [
    {
      name: 'projectId',
      type: 'string',
      required: true,
    },
  ],
  handler: async ({ projectId }) => {
    // Long-running operation
    const report = await generateDetailedReport(projectId);

    // Return structured data
    return {
      summary: report.summary,
      metrics: report.metrics,
      recommendations: report.recommendations,
    };
  },
});
```

---

## Deployment Considerations

### Environment Variables
```bash
# Production
OPENAI_API_KEY=your-production-key

# Rate Limiting (optional)
COPILOTKIT_MAX_REQUESTS_PER_MINUTE=60
```

### Cost Management
- Use GPT-3.5-turbo for most actions (cheaper)
- Reserve GPT-4 for complex reasoning
- Implement caching for repeated queries
- Monitor OpenAI usage dashboard

### Security
- Never expose sensitive data in context
- Validate action parameters
- Implement rate limiting
- Use server-side API routes for sensitive operations

---

## Troubleshooting

### CopilotKit Not Loading
```typescript
// Check provider setup
// Ensure CopilotKit wraps your components
<CopilotKit runtimeUrl="/api/copilotkit">
  {children}
</CopilotKit>
```

### Actions Not Working
- Verify action names are unique
- Check parameter descriptions are clear
- Ensure handler returns a string or object
- Check console for errors

### Context Not Available
- Verify useCopilotReadable is called in rendered component
- Check value is serializable (no functions)
- Ensure description is descriptive

---

## Testing CopilotKit Features

```typescript
// Example test prompts
"Create a project called 'Test Project'"
"Show me my projects"
"Update Test Project to be high priority"
"Delete the oldest project"
"Set up a new client called 'Test Client' for a website"
```

Monitor responses and refine action descriptions/handlers as needed.
