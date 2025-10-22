---
name: genesis-testing
description: Testing patterns, validation scripts, and quality assurance for Genesis projects
---

# Genesis Testing

## When to Use This Skill

Load this skill when user mentions:
- "test" OR "testing" OR "tests"
- "validation" OR "validate"
- "verify" OR "check"
- "quality" OR "qa" OR "quality assurance"
- "e2e" OR "integration" OR "unit tests"

## Key Patterns

### Pattern 1: Pre-Deployment Testing Sequence

```bash
# 1. TypeScript check
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Build test
npm run build

# 4. Test production build locally
npm start

# 5. Manual testing checklist
# (See checklist below)
```

**All tests pass** → Ready to deploy

### Pattern 2: Landing Page Validation

```bash
# Test checklist
- [ ] Hero section loads
- [ ] Form validation works (try invalid email)
- [ ] Form submits successfully
- [ ] Success message displays
- [ ] Lead appears in GoHighLevel
- [ ] Mobile responsive (resize browser)
- [ ] Page load < 3 seconds
- [ ] SEO meta tags present (view source)
```

**Test form submission**:
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890"}'

# Should return: {"success":true}
# Check GHL dashboard for lead
```

### Pattern 3: SaaS App Validation

```bash
# Auth flow checklist
- [ ] Sign up works
- [ ] Email verification (if enabled)
- [ ] Sign in works
- [ ] Dashboard loads (protected route)
- [ ] Sign out works
- [ ] Can't access dashboard when logged out

# CRUD operations checklist
- [ ] Create resource (e.g., project)
- [ ] List resources (shows only user's data)
- [ ] Update resource
- [ ] Delete resource
- [ ] RLS prevents seeing other user's data

# Multi-tenant isolation test
- [ ] Create 2 test accounts
- [ ] Create data in account 1
- [ ] Switch to account 2
- [ ] Verify can't see account 1's data
```

**Test RLS** (critical!):
```sql
-- In Supabase SQL Editor
-- Test as different user
SET request.jwt.claims = '{"sub":"user-id-2"}';

SELECT * FROM projects WHERE user_id = 'user-id-1';
-- Should return 0 rows (RLS blocking)
```

### Pattern 4: Integration Testing

```bash
# Test API routes
npm run dev

# Test each endpoint
curl http://localhost:3000/api/projects  # GET
curl -X POST http://localhost:3000/api/projects -d '{"name":"Test"}' # POST
curl -X PATCH http://localhost:3000/api/projects/[id] -d '{"name":"Updated"}' # PATCH
curl -X DELETE http://localhost:3000/api/projects/[id]  # DELETE

# Expected: 401 if not authenticated, 200 if authenticated
```

### Pattern 5: CopilotKit Testing (if applicable)

```bash
# Test prompts
"Create a project called 'Test Project'"
# Expected: AI calls createProject action

"Show me my projects"
# Expected: AI shows project list

"Update Test Project to high priority"
# Expected: AI calls updateProject action

"Delete Test Project"
# Expected: AI calls deleteProject action
```

## Quick Reference

| Test Type | Command | What It Checks |
|-----------|---------|----------------|
| TypeScript | `npx tsc --noEmit` | Type errors |
| Lint | `npm run lint` | Code quality |
| Build | `npm run build` | Production build |
| Manual | Browser testing | User flows |
| RLS | SQL query test | Data isolation |
| API | curl commands | Endpoints work |

### Common Issues & Fixes

**Build fails**:
```bash
# Check error message
npm run build

# Common fixes:
- Fix TypeScript errors
- Update imports
- Check environment variables exist
```

**Form doesn't submit**:
- Check browser console for errors
- Verify API route exists
- Test API route directly with curl
- Check environment variables (GHL_API_KEY)

**Auth doesn't work**:
- Check Supabase URL/key in .env.local
- Verify RLS policies exist
- Test with Supabase dashboard

**RLS blocking queries**:
- Check policy using clause: `auth.uid() = user_id`
- Verify user is authenticated
- Test policy in Supabase SQL editor

## Command Templates

```bash
# Complete test workflow
npx tsc --noEmit && \
npm run lint && \
npm run build && \
echo "✅ All automated tests passed"

# Pre-deployment checklist
npm run build  # Must pass
npm start  # Test manually
# Run manual tests
netlify deploy  # Deploy

# Test in production
curl https://your-site.com/api/health
# Check critical user flows in browser
```

## Integration with Other Skills

- Use **genesis-commands** for pre-deployment workflow
- Use **genesis-deployment** for production testing
- Use **genesis-supabase** for RLS testing patterns
- Use **genesis-saas-app** for multi-tenant testing

## Testing Checklist by Project Type

### Landing Page
- [ ] Hero section loads
- [ ] Form validation
- [ ] Form submission → GHL
- [ ] Success message
- [ ] Mobile responsive
- [ ] SEO meta tags
- [ ] Page speed <3s

### SaaS Application
- [ ] Auth flow (sign up, sign in, sign out)
- [ ] Protected routes work
- [ ] CRUD operations
- [ ] RLS data isolation
- [ ] User-specific data only
- [ ] Mobile responsive
- [ ] TypeScript no errors
- [ ] Build succeeds

### With CopilotKit
- [ ] AI assistant loads
- [ ] Actions work (create, read, update, delete)
- [ ] Context available to AI
- [ ] Error handling works
- [ ] All above + SaaS checklist

## Best Practices

1. **Test before deploying**: Always run `npm run build` locally first
2. **Test RLS thoroughly**: Create 2 accounts, verify isolation
3. **Test on mobile**: Resize browser, test touch interactions
4. **Test error states**: Try invalid inputs, unauthorized access
5. **Test integrations**: Verify GHL, Supabase, CopilotKit work

## Troubleshooting

**Tests pass locally but fail in production**:
- Check environment variables in Netlify
- Verify all secrets are set
- Check Netlify build logs

**RLS tests failing**:
- Verify policies exist
- Check auth.uid() matches user_id
- Test in Supabase SQL editor

**Form tests failing**:
- Check browser console
- Test API route with curl
- Verify environment variables

## Deep Dive

For complete validation patterns, reference:
- docs/MILESTONE_COMPRESSION_CHECKLIST.md (Testing strategies, validation)
- docs/DEPLOYMENT_GUIDE.md (Pre-deployment checklist)
