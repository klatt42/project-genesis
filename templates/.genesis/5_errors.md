# Error Solutions Log - [Project Name]

**Created**: [Date]  
**Project Type**: [Landing Page / SaaS App]  
**Genesis Template**: [Boilerplate used]

---

## Error Log Purpose

This file maintains a **searchable database of errors encountered and solutions** for this project:
- Quick reference when same error reappears
- Learning resource for similar issues
- Documentation for team knowledge sharing
- Genesis update candidates (if error relates to Genesis patterns)

**Pattern 3: Structured Note-Taking** - Building troubleshooting knowledge base.

---

## Error Entry Format

```markdown
### Error: [Brief Title]
**Date**: [When encountered]  
**Severity**: [Critical / High / Medium / Low]  
**Status**: [Resolved / Workaround / Open]  
**Phase**: [Which project phase]

**Error Message**:
```
[Exact error text or screenshot description]
```

**Context**:
- What I was trying to do: [Action]
- Where it occurred: [File, command, or location]
- Environment: [Development / Production]

**Root Cause**:
[What actually caused the error]

**Solution**:
[Step-by-step how to fix]

**Prevention**:
[How to avoid this error in future]

**Genesis Impact**:
- [ ] Genesis pattern needs clarification
- [ ] Should be added to Genesis troubleshooting docs
- [ ] No Genesis update needed
```

---

## Critical Errors (Blocking Progress)

### Error: [Critical Issue Title]
**Date**: [Date]  
**Severity**: Critical  
**Status**: [Resolved / Open]  
**Phase**: [Phase when occurred]

**Error Message**:
```
[Exact error]
```

**Context**:
- Attempting: [What was being done]
- Location: [Where]
- Impact: [What's blocked]

**Root Cause**:
[Diagnosis]

**Solution**:
```bash
# Commands or code to fix
[solution steps]
```

**Time to Resolve**: [Duration]

**Prevention**:
[How to prevent]

**Genesis Impact**: [Relevant to Genesis?]

---

## High Priority Errors (Major Issues)

### Error: Supabase RLS Permission Denied
**Date**: [Date]  
**Severity**: High  
**Status**: Resolved  
**Phase**: Development - Database Integration

**Error Message**:
```
Error: new row violates row-level security policy for table "table_name"
```

**Context**:
- Attempting: Insert data into Supabase table
- Location: Form submission handler
- User: Authenticated user trying to create record

**Root Cause**:
RLS policy was too restrictive or missing INSERT policy for authenticated users.

**Solution**:
```sql
-- In Supabase SQL Editor, add INSERT policy:

CREATE POLICY "Users can insert their own records"
  ON table_name
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Or for public inserts (lead capture forms):
CREATE POLICY "Anyone can insert"
  ON table_name
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

**Verification**:
```bash
# Test the insert operation again
# Form submission should now work
```

**Time to Resolve**: 15 minutes

**Prevention**:
- Always test RLS policies after creation
- Create policies for all operations needed (SELECT, INSERT, UPDATE, DELETE)
- Use Supabase dashboard policy templates as starting point
- Reference: STACK_SETUP.md - RLS section

**Genesis Impact**:
✅ Genesis already covers this in STACK_SETUP.md - good to reference this section more prominently

---

### Error: Environment Variables Not Loading
**Date**: [Date]  
**Severity**: High  
**Status**: Resolved  
**Phase**: Development - Initial Setup

**Error Message**:
```
TypeError: Cannot read property 'SUPABASE_URL' of undefined
```

**Context**:
- Attempting: Initialize Supabase client
- Location: `lib/supabase-client.ts`
- Environment: Development server

**Root Cause**:
Environment variable names in `.env.local` didn't match Vite's naming convention. Vite requires `VITE_` prefix for client-side variables.

**Solution**:
```bash
# In .env.local, ensure all client-side variables have VITE_ prefix:

# ❌ Wrong:
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# ✅ Correct:
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...

# Then restart dev server:
npm run dev
```

**Code Fix**:
```typescript
// In supabase-client.ts, access as:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

**Time to Resolve**: 10 minutes

**Prevention**:
- Always use `VITE_` prefix for Vite projects
- Check framework-specific env var conventions
- Create `.env.example` template with correct naming
- Reference: STACK_SETUP.md should emphasize Vite naming

**Genesis Impact**:
📝 Genesis could be clearer about Vite-specific env var naming

---

## Medium Priority Errors (Notable Issues)

### Error: TypeScript Type Error in Component
**Date**: [Date]  
**Severity**: Medium  
**Status**: Resolved  
**Phase**: Development - Component Building

**Error Message**:
```typescript
Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
```

**Context**:
- Attempting: Pass form data to API function
- Location: Form component state
- Issue: Optional form field causing type mismatch

**Root Cause**:
Form field was optional (`string | undefined`) but API function expected required `string`.

**Solution**:
```typescript
// Option 1: Make API function accept optional field
interface ApiParams {
  name: string;
  email: string;
  company?: string; // Make optional
}

// Option 2: Provide default value
const companyName = formData.company ?? '';

// Option 3: Use type guard
if (formData.company) {
  // TypeScript knows it's string here
  apiFunction({ ...formData, company: formData.company });
}
```

**Time to Resolve**: 5 minutes

**Prevention**:
- Define clear interfaces for form data
- Decide early if fields are required or optional
- Use type guards or default values consistently
- Enable strict TypeScript mode

**Genesis Impact**:
Consider adding TypeScript best practices to COMPONENT_LIBRARY.md

---

### Error: Netlify Build Failing
**Date**: [Date]  
**Severity**: Medium  
**Status**: Resolved  
**Phase**: Deployment

**Error Message**:
```
Error: Module not found: Can't resolve './config'
```

**Context**:
- Attempting: First deployment to Netlify
- Location: Build process
- Local build worked fine

**Root Cause**:
Import path case sensitivity - local development on Windows wasn't case-sensitive, but Netlify build environment (Linux) is.

**Solution**:
```typescript
// ❌ Wrong (worked locally on Windows):
import config from './Config';

// ✅ Correct (matches actual filename):
import config from './config';
```

**Prevention**:
- Use exact case-sensitive imports always
- Test builds locally with `npm run build`
- Configure ESLint to catch case-sensitivity issues
- Use consistent lowercase naming for files

**Time to Resolve**: 20 minutes (debugging time)

**Genesis Impact**:
Add to DEPLOYMENT_GUIDE.md common build errors section

---

### Error: CORS Issue with External API
**Date**: [Date]  
**Severity**: Medium  
**Status**: Resolved  
**Phase**: Development - API Integration

**Error Message**:
```
Access to fetch at 'https://api.service.com' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Context**:
- Attempting: Call external API from client-side code
- Location: Service integration component
- API: [Service name]

**Root Cause**:
External API doesn't allow requests from localhost origin, and API key was being sent from client-side.

**Solution**:
Move API calls to Netlify serverless function to avoid CORS and protect API key.

```typescript
// Create netlify/functions/api-proxy.ts
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const response = await fetch('https://api.service.com/endpoint', {
    headers: {
      'Authorization': `Bearer ${process.env.SERVICE_API_KEY}`,
    },
  });
  
  const data = await response.json();
  
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};

// Then call from client:
const response = await fetch('/.netlify/functions/api-proxy');
```

**Time to Resolve**: 30 minutes

**Prevention**:
- Always make external API calls server-side (Netlify functions)
- Never expose API keys in client-side code
- Test API integrations early
- Reference: STACK_SETUP.md - Netlify Functions section

**Genesis Impact**:
✅ Genesis already covers this pattern

---

## Low Priority Errors (Minor Issues)

### Error: ESLint Warning About Unused Variable
**Date**: [Date]  
**Severity**: Low  
**Status**: Resolved  
**Phase**: Development

**Error Message**:
```
'data' is assigned a value but never used  eslint(no-unused-vars)
```

**Context**:
- Location: Component with async data fetch
- Variable assigned but not yet used in UI

**Solution**:
```typescript
// Option 1: Remove if truly unused
// const data = await fetchData(); // Remove this line

// Option 2: Prefix with underscore if intentionally unused
const _data = await fetchData();

// Option 3: Use the variable
const data = await fetchData();
return <div>{data.message}</div>; // Now used
```

**Prevention**:
- Enable ESLint pre-commit hooks
- Clean up unused code regularly
- Use meaningful variable names

---

## Build & Deployment Errors

### Error: [Build Error Title]
**Date**: [Date]  
**Phase**: Deployment  
**Status**: [Resolved / Open]

[Use standard format]

---

## Database Errors

### Error: [Database Error Title]
**Date**: [Date]  
**Phase**: [Phase]  
**Status**: [Resolved / Open]

[Use standard format]

---

## Integration Errors

### Error: [Integration Error Title]
**Date**: [Date]  
**Service**: [Which external service]  
**Status**: [Resolved / Open]

[Use standard format]

---

## Runtime Errors

### Error: [Runtime Error Title]
**Date**: [Date]  
**Environment**: [Dev / Production]  
**Status**: [Resolved / Open]

[Use standard format]

---

## Warnings (Not Blocking)

### Warning: [Warning Title]
**Date**: [Date]  
**Severity**: Low  
**Status**: [Acknowledged / Resolved / Suppressed]

**Warning Message**:
```
[Warning text]
```

**Context**:
[Where it appears]

**Action Taken**:
[What was done, if anything]

**Impact**:
[Does this affect functionality?]

---

## Known Issues (Workarounds Exist)

### Issue: [Known Issue Title]
**Date Discovered**: [Date]  
**Status**: Open - Workaround Implemented  
**Severity**: [Level]

**Issue Description**:
[What doesn't work perfectly]

**Workaround**:
[Temporary solution being used]

**Proper Fix** (for future):
[What should be done when time permits]

**Impact**:
[How this affects users or development]

---

## Error Pattern Analysis

### Common Error Categories

**Most Common Errors**:
1. [Error category] - Occurred [X] times
   - Pattern: [What causes this repeatedly]
   - Prevention: [How to avoid]

2. [Error category] - Occurred [X] times
   - Pattern: [Common cause]
   - Prevention: [Standard fix]

**Errors by Phase**:
- Setup Phase: [Count]
- Development: [Count]
- Testing: [Count]
- Deployment: [Count]

**Time Spent on Errors**:
- Total debugging time: [Hours]
- Longest error resolution: [Error name] - [Duration]
- Quickest resolution: [Error name] - [Duration]

---

## Debugging Strategies That Worked

### General Debugging Approach
1. **Read Error Message Carefully**: Often contains the exact solution
2. **Check Recent Changes**: What did I modify last?
3. **Isolate the Problem**: Comment out code to find issue
4. **Console.log Strategically**: Verify assumptions
5. **Check Genesis Docs**: Solution might be documented
6. **Search Error Message**: Exact error text in Google/Stack Overflow

### Project-Specific Debugging Tools
- **Browser DevTools**: [Which features most useful]
- **Supabase Dashboard**: [SQL editor, logs, table explorer]
- **Netlify Logs**: [Function logs, deploy logs]
- **[Tool]**: [How it helped]

---

## External Resources Used

### Helpful Documentation
- [Resource 1]: [What it helped with]
- [Resource 2]: [What it helped with]

### Community Solutions
- [Stack Overflow link]: [Error it solved]
- [GitHub issue]: [Problem it addressed]

---

## Genesis Update Recommendations

### Errors That Should Be in Genesis Troubleshooting

**Error**: [Error title from above]  
**Genesis Doc**: [Which file should include this]  
**Section**: [Where it belongs]  
**Rationale**: [Why it's valuable to include]

**Error**: [Another error]  
**Genesis Doc**: [File]  
**Section**: [Location]  
**Rationale**: [Value add]

---

## Quick Reference: Common Fixes

| Error Type | Quick Fix | Genesis Reference |
|-----------|----------|------------------|
| RLS denied | Check/add INSERT policy | STACK_SETUP.md - RLS |
| Env vars not loading | Add `VITE_` prefix | STACK_SETUP.md - Env |
| CORS error | Use Netlify function | STACK_SETUP.md - Functions |
| TypeScript error | Check interface definitions | - |
| Build failure | Check import case sensitivity | DEPLOYMENT_GUIDE.md |

---

## Error Prevention Checklist

Before starting new features, verify:
- [ ] Environment variables properly configured
- [ ] TypeScript types defined
- [ ] RLS policies created for new tables
- [ ] External API calls use server-side functions
- [ ] Import paths are case-sensitive
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Edge cases considered

---

## Open Issues Tracking

### Currently Open Errors
- [ ] [Issue 1]: [Description] - Priority: [Level]
- [ ] [Issue 2]: [Description] - Priority: [Level]

### Monitoring Required
- [ ] [Issue to watch]: [Why monitoring] - Check: [When]

---

## Error Metrics

**Total Errors Logged**: [Count]  
**Resolved**: [Count]  
**Open**: [Count]  
**With Workarounds**: [Count]

**Average Resolution Time**: [Time]  
**Fastest Fix**: [Time]  
**Longest Debugging**: [Time]

**Most Valuable Learning**: [Which error taught the most]

---

## Emergency Contacts

**When Stuck on Error**:
- Genesis Documentation: Check relevant .md file first
- Project Team: [Contact if applicable]
- Community: [Discord/Slack if available]
- Support: [Service support channels]

---

**Last Error Logged**: [Date/Time]  
**Last Update**: [Date/Time]  
**Review Schedule**: [When to review and clean up this log]
