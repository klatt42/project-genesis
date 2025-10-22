# Genesis CLI

Command-line interface for Genesis Agent SDK.

## Installation

```bash
npm install
npm run build
npm link
```

This makes the `genesis` command available globally.

## Commands

### Create a new project

```bash
genesis create my-project --type landing-page
genesis create my-saas-app --type saas-app
```

Interactive mode (prompts for options):

```bash
genesis create
```

### Validate project setup

```bash
cd my-project
genesis validate
```

### Configure services

```bash
cd my-project
genesis setup-services
```

### Deploy to Netlify

```bash
cd my-project
genesis deploy --prod
```

### Show information

```bash
genesis info
```

### Help

```bash
genesis --help
genesis create --help
```

## Usage Examples

### Create landing page

```bash
genesis create awesome-landing --type landing-page
cd awesome-landing
npm install
# Configure .env.local with Supabase credentials
npm run dev
```

### Create SaaS app

```bash
genesis create my-saas --type saas-app
cd my-saas
npm install
# Configure .env.local with Supabase credentials
npm run dev
```

### Validate before deployment

```bash
genesis validate
# Fix any issues
genesis deploy --prod
```

## Features

- 🎨 **Interactive prompts** for easy project setup
- 📦 **Template selection** (landing-page, saas-app)
- 🔧 **Service integration** (Supabase, GHL, Netlify)
- ✅ **Validation** checks before deployment
- 🎯 **Colorful output** with progress indicators

## Dependencies

- `commander`: CLI framework
- `inquirer`: Interactive prompts
- `ora`: Loading spinners
- `chalk`: Colored terminal output

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Link globally
npm run link

# Unlink
npm run unlink
```

## Uninstall

```bash
npm run unlink
# or
npm unlink -g @genesis/cli
```

## License

MIT
