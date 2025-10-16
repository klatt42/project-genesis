# Quality Reports Directory

This directory stores quality validation reports for Project Genesis projects.

## Directory Structure

```
quality-reports/
├── README.md                           # This file
├── REPORT_TEMPLATE.md                  # Standard report template
├── [project-name]/                     # Per-project reports
│   ├── baseline-YYYY-MM-DD.md         # Initial baseline scan
│   ├── daily-YYYY-MM-DD.md            # Daily quality checks
│   ├── pre-deployment-YYYY-MM-DD.md   # Pre-deployment scans
│   └── post-deployment-YYYY-MM-DD.md  # Post-deployment verification
```

## Report Types

### Baseline Report
- **When**: First quality scan of a new project
- **Purpose**: Establish quality baseline for tracking improvements
- **Filename**: `baseline-YYYY-MM-DD.md`

### Daily Report
- **When**: Daily quality checks during active development
- **Purpose**: Track quality trends and catch regressions early
- **Filename**: `daily-YYYY-MM-DD.md`

### Pre-Deployment Report
- **When**: Before deploying to production
- **Purpose**: Quality gate to ensure deployment standards met
- **Filename**: `pre-deployment-YYYY-MM-DD.md`

### Post-Deployment Report
- **When**: After deployment to production
- **Purpose**: Verify production quality matches pre-deployment
- **Filename**: `post-deployment-YYYY-MM-DD.md`

### Performance Report
- **When**: Focused performance optimization efforts
- **Purpose**: Track performance improvements
- **Filename**: `performance-YYYY-MM-DD.md`

### Accessibility Report
- **When**: Focused accessibility improvements
- **Purpose**: Track WCAG compliance
- **Filename**: `accessibility-YYYY-MM-DD.md`

## Naming Conventions

### Date Format
Use ISO 8601 format: `YYYY-MM-DD`

Examples:
- `baseline-2025-10-16.md`
- `daily-2025-10-17.md`
- `pre-deployment-2025-10-20.md`

### Project-Specific Reports
Create subdirectories for each project:

```
quality-reports/
├── commercial-lead-gen/
│   ├── baseline-2025-10-16.md
│   ├── daily-2025-10-17.md
│   └── pre-deployment-2025-10-20.md
├── my-saas-app/
│   ├── baseline-2025-10-15.md
│   └── daily-2025-10-16.md
```

## Report Standards

### Minimum Content
Every report must include:
1. **Overall Score** (1-10)
2. **Section Scores** (each major section)
3. **Performance Metrics** (LCP, CLS, FID with pass/fail)
4. **Issues Found** (prioritized: High/Medium/Low)
5. **Recommendations** (specific, actionable fixes)

### Quality Gates
Before deployment, verify:
- Landing Page: Overall ≥ 8.0, Performance ≥ 8.5
- SaaS App: Overall ≥ 8.5, Security ≥ 9.0
- All: Accessibility ≥ 90, Core Web Vitals pass

## Usage Examples

### Generate Baseline Report
```
Run comprehensive quality validation on localhost:3000 and save report to
docs/quality-reports/[project-name]/baseline-2025-10-16.md
```

### Generate Daily Report
```
Quick quality check on localhost:3000 and save to
docs/quality-reports/[project-name]/daily-2025-10-17.md
```

### Generate Pre-Deployment Report
```
Run full quality scan with deployment gate checks on localhost:3000
and save to docs/quality-reports/[project-name]/pre-deployment-2025-10-20.md
```

## Tracking Progress

### Compare Reports
```
Compare quality-reports/[project]/baseline-2025-10-16.md to
quality-reports/[project]/daily-2025-10-17.md and show improvements
```

### Generate Trend Report
```
Analyze all reports in quality-reports/[project]/ and generate quality
trend report showing score progression over time
```

## Best Practices

### ✅ Do
- Save reports immediately after scans
- Use consistent naming conventions
- Include all required sections
- Document fixes applied between reports
- Track quality trends over time

### ❌ Don't
- Skip baseline reports
- Overwrite existing reports
- Deploy without pre-deployment report
- Ignore failing quality gates

## Automated Report Generation

### With BMAD Agents
```
QA Agent, run quality scan and save report to
docs/quality-reports/[project]/[type]-[date].md
```

### With Archon Dashboard
Reports automatically saved to knowledge base and can be exported.

## Report Retention

### Keep Forever
- Baseline reports
- Pre-deployment reports
- Post-deployment reports

### Keep for 30 Days
- Daily reports (archive older ones)

### Archive Monthly
Create monthly summaries:
```
quality-reports/[project]/monthly-summary-2025-10.md
```

## Git Integration

### Commit Reports
```bash
git add docs/quality-reports/
git commit -m "Add quality reports for [project] [date]"
```

### Track Changes
Reports in git allow you to:
- See quality progression over time
- Compare scores across branches
- Track fixes and their impact
- Audit quality history

## Related Documentation

- [Quality Standards](../QUALITY_STANDARDS.md)
- [Chrome DevTools MCP](../CHROME_DEVTOOLS_MCP.md)
- [Validation Templates](../QUALITY_VALIDATION_TEMPLATES.md)
- [Command Reference](../CHROME_DEVTOOLS_COMMAND_REFERENCE.md)

---

**Note**: This directory is part of Project Genesis quality assurance system.
All reports should follow Genesis quality standards and templates.
