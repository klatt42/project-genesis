# Genesis Scaffolding Agent

Autonomous project scaffolding agent for Genesis Agent SDK.

## Features

- **Landing Page Template**: Complete lead capture page with Supabase + GHL integration
- **SaaS App Template**: Multi-tenant application with authentication
- **Service Integration**: Automated setup for Supabase, GoHighLevel, and Netlify
- **Validation**: Comprehensive project setup validation

## Installation

```bash
npm install
npm run build
```

## Usage

### Programmatic API

```typescript
import { createScaffoldingAgent } from '@genesis/scaffolding-agent';

const agent = await createScaffoldingAgent();

const result = await agent.scaffold({
  name: 'my-project',
  type: 'landing-page',
  integrations: ['supabase', 'netlify'],
  branding: {
    companyName: 'My Company'
  }
});

console.log(`Created ${result.filesCreated.length} files`);
```

### CLI

Use via the Genesis CLI:

```bash
genesis create my-project --type landing-page
```

## Architecture

```
scaffolding-agent/
├── agent.ts                 # Core orchestrator
├── templates/
│   ├── landing-page.ts      # Landing page scaffolder
│   └── saas-app.ts          # SaaS app scaffolder
├── services/
│   ├── supabase.ts          # Supabase setup
│   ├── ghl.ts               # GHL integration
│   └── netlify.ts           # Netlify deployment
└── validators/
    └── setup-validator.ts   # Project validation
```

## Templates

### Landing Page
- Hero section with CTA
- Lead capture form
- Supabase integration
- GHL sync
- Thank you page
- Responsive design

### SaaS App
- Authentication (login/signup)
- Protected dashboard routes
- Multi-tenant architecture
- User management
- Organization support

## Services

### Supabase
- Automated schema generation
- Environment configuration
- Connection validation

### GoHighLevel
- API key validation
- Webhook configuration
- Lead sync setup

### Netlify
- Deployment configuration
- Build settings
- Environment variables

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Clean
npm run clean
```

## Testing

```bash
cd ../cli
npm run build
npm link
genesis create test-project --type landing-page
```

## License

MIT
