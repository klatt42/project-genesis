# Genesis Troubleshooting Guide

## Skills Not Invoking

**Symptom**: "skill invocations are being blocked by your system configuration"

**Root Cause**: `~/.claude/settings.local.json` permissions whitelist missing "Skill" tool

### Solution

1. **Locate settings file**:
```bash
cat ~/.claude/settings.local.json
```

2. **Find the `permissions.allow` array**

3. **Add `"Skill"` to the array**:
```json
{
  "permissions": {
    "allow": [
      "Bash",
      "WebFetch",
      "Skill",  // <-- Add this line
      // ... other tools
    ]
  }
}
```

4. **Save the file**

5. **No restart required** - Changes take effect immediately

6. **Test with**: "Create a landing page for a restaurant"

### Verification

Skills should invoke without blocking message. You should see the skill load and provide Genesis patterns.

### Technical Details

**Discovery Date**: October 23, 2025
**Discovered During**: Multi-skill complex prompt testing
**Impact**: Blocks all Genesis skills from invoking
**Fix Applied**: Claude Code auto-detected and fixed the issue

### Prevention

When setting up Claude Code permissions whitelists, **always include `"Skill"`** in the allow array, or Genesis skills won't function.

---

## Other Common Issues

### Supabase Connection Errors

**Symptom**: Cannot connect to Supabase database

**Common Causes**:
- Missing environment variables
- Incorrect API keys
- RLS policies blocking access

**Solution**: See `genesis-troubleshooting` skill for complete Supabase debugging guide

### GoHighLevel Integration Errors

**Symptom**: Leads not appearing in GHL

**Common Causes**:
- Missing Bearer token prefix
- Wrong API key or location ID
- API endpoint incorrect

**Solution**: See `genesis-landing-page` skill for GHL integration patterns

### Build Failures

**Symptom**: npm run build fails

**Common Causes**:
- Missing dependencies
- TypeScript errors
- Environment variables not set

**Solution**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Deployment Issues

**Symptom**: Netlify deployment fails

**Common Causes**:
- Environment variables not set in Netlify dashboard
- Build command incorrect
- Node version mismatch

**Solution**: See `genesis-deployment` skill for Netlify configuration

---

## Getting Help

1. **Check the relevant Genesis skill** - Most issues are documented in skill files
2. **Review the documentation** - See `/docs` directory for detailed guides
3. **Check the GitHub issues** - Known issues and solutions
4. **Ask in Genesis discussions** - Community support

## Reporting Issues

When reporting issues, include:
- Genesis version (`git describe --tags`)
- Claude Code version
- Operating system
- Complete error message
- Steps to reproduce
- Expected vs actual behavior

Submit issues at: https://github.com/klatt42/project-genesis/issues
