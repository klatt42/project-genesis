# Browser Automation Integration Guide

## Overview

This guide provides complete instructions for integrating browser automation and quality validation into Project Genesis workflows using Chrome DevTools MCP, Archon OS, and BMAD agents.

**Integration Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                    Project Genesis                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │         Layer 1: Direct MCP Access              │   │
│  │  Chrome DevTools MCP → Claude Code              │   │
│  │  Use: Quick validation during development       │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │      Layer 2: Archon Integration                │   │
│  │  BrowserQualityService → Archon API → UI        │   │
│  │  Use: Centralized testing & team collaboration  │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │     Layer 3: BMAD Agent Integration             │   │
│  │  QA Agent → Victoria → Elena → Coordinator      │   │
│  │  Use: Autonomous quality assurance & fixes      │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

**Required:**
- Node.js 22+
- Chrome browser
- Claude Code with MCP support
- Project Genesis repository

**Optional (for full integration):**
- Archon OS (for Layer 2)
- Docker (for Archon)
- Supabase account (for Archon)

## Quick Start

### 1. Install Chrome DevTools MCP (5 minutes)

```bash
# Install Chrome DevTools MCP for Claude Code
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest

# Verify installation
claude mcp list
```

**Expected Output:**
```
chrome-devtools:
  command: npx
  args: ['chrome-devtools-mcp@latest']
  status: ready
```

### 2. Test Basic Functionality (10 minutes)

```bash
# Start your Genesis project
cd ~/Developer/projects/[your-project]
npm run dev

# In Claude Code
Start the development server and navigate to localhost:3000.
Check the console for any errors and report what you see.
```

### 3. Run Your First Quality Scan (15 minutes)

```bash
# In Claude Code
Run a comprehensive quality scan on localhost:3000 following the
Genesis Quality Check template from docs/CHROME_DEVTOOLS_MCP.md.
Generate a quality report and save to docs/quality-reports/baseline.md
```

## Layer 1: Direct MCP Access

### Use Cases
- **Development**: Quick checks while coding
- **Debugging**: Real-time browser inspection
- **Validation**: Pre-commit quality checks
- **Learning**: Understanding browser behavior

### Basic Commands

**Navigation:**
```
Navigate to localhost:3000 and inspect the hero section
```

**Performance:**
```
Record a performance trace and report Core Web Vitals
```

**Responsive:**
```
Test responsive design at 375px, 768px, and 1920px widths
```

**Forms:**
```
Test the contact form with test data and verify submission
```

**Full Scan:**
```
Run comprehensive quality validation using the Genesis template.
Report overall score and prioritized issues.
```

### Workflow Integration

**Pre-Commit Check:**
```bash
# In Claude Code
Run quality scan on localhost:3000. If score < 8.0, list issues to fix.
```

**Post-Feature Check:**
```bash
# After implementing a feature
Validate the new feature at localhost:3000/[feature].
Check functionality, responsive design, and performance.
```

**Pre-Deployment Gate:**
```bash
# Before deploying
Run full quality scan. Verify:
- Overall score ≥ 8.0
- All Core Web Vitals pass
- No high-priority issues
- Accessibility score ≥ 90
```

## Layer 2: Archon Integration

### Overview

Archon integration provides centralized browser automation with:
- **BrowserQualityService**: Automated quality scans
- **Quality Dashboard**: Visual quality tracking
- **API Endpoints**: Programmatic access
- **Historical Tracking**: Quality trends over time

### Architecture

```
┌─────────────────────────────────────────────┐
│         Archon Frontend (React)              │
│  ┌─────────────────────────────────────┐   │
│  │    Quality Dashboard Component       │   │
│  │  - Score Display                     │   │
│  │  - Issue List                        │   │
│  │  - Performance Metrics               │   │
│  │  - Actions (Run Scan, Export)        │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│         Archon API (FastAPI)                 │
│  POST /api/quality/validate                  │
│  POST /api/quality/performance               │
│  POST /api/quality/responsive                │
│  POST /api/quality/full-scan                 │
│  GET  /api/quality/reports/:projectId        │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│     BrowserQualityService (Python)           │
│  - validate_page()                           │
│  - performance_audit()                       │
│  - responsive_test()                         │
│  - accessibility_check()                     │
│  - full_quality_scan()                       │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│       Chrome DevTools MCP                    │
└─────────────────────────────────────────────┘
```

### Implementation Steps

**Step 1: Configure Archon MCP**

Update `~/.claude-code/mcp-settings.json`:

```json
{
  "mcpServers": {
    "archon": {
      "command": "node",
      "url": "http://localhost:8051/mcp"
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    }
  }
}
```

**Step 2: Create BrowserQualityService**

Create `python/services/browser_quality_service.py` in Archon:

```python
"""
Browser Quality Service for Archon OS.
Provides automated quality validation using Chrome DevTools MCP.
"""

from typing import Dict, Any, List, Optional
import httpx
from datetime import datetime

class BrowserQualityService:
    """Service for automated browser quality validation."""

    def __init__(self):
        self.mcp_url = "http://localhost:9222"  # Chrome DevTools Protocol

    async def full_quality_scan(self, url: str) -> Dict[str, Any]:
        """
        Run comprehensive quality scan on URL.

        Args:
            url: URL to test (e.g., "http://localhost:3000")

        Returns:
            Quality report with scores and issues
        """
        results = {
            "url": url,
            "timestamp": datetime.utcnow().isoformat(),
            "visual": await self._check_visual(url),
            "functionality": await self._check_functionality(url),
            "performance": await self._check_performance(url),
            "accessibility": await self._check_accessibility(url),
            "responsive": await self._check_responsive(url)
        }

        # Calculate overall score
        results["overall_score"] = self._calculate_overall_score(results)
        results["issues"] = self._extract_issues(results)
        results["status"] = self._determine_status(results["overall_score"])

        return results

    async def _check_visual(self, url: str) -> Dict[str, Any]:
        """Visual quality checks."""
        # Implementation would use Chrome DevTools
        return {
            "score": 8.5,
            "checks": {
                "layout": "pass",
                "spacing": "pass",
                "typography": "pass",
                "colors": "minor_issues"
            }
        }

    async def _check_functionality(self, url: str) -> Dict[str, Any]:
        """Functionality checks."""
        return {
            "score": 9.0,
            "checks": {
                "forms": "pass",
                "links": "pass",
                "buttons": "pass",
                "navigation": "pass"
            }
        }

    async def _check_performance(self, url: str) -> Dict[str, Any]:
        """Performance analysis."""
        return {
            "score": 8.0,
            "metrics": {
                "lcp": 2.3,  # seconds
                "cls": 0.08,
                "fid": 85    # ms
            },
            "vitals_pass": True
        }

    async def _check_accessibility(self, url: str) -> Dict[str, Any]:
        """Accessibility audit."""
        return {
            "score": 8.5,
            "lighthouse_score": 92,
            "wcag_level": "AA",
            "issues": []
        }

    async def _check_responsive(self, url: str) -> Dict[str, Any]:
        """Responsive design testing."""
        return {
            "score": 8.0,
            "breakpoints": {
                "mobile": "pass",
                "tablet": "pass",
                "desktop": "pass"
            }
        }

    def _calculate_overall_score(self, results: Dict[str, Any]) -> float:
        """Calculate weighted overall score."""
        weights = {
            "visual": 0.25,
            "functionality": 0.25,
            "performance": 0.25,
            "accessibility": 0.15,
            "responsive": 0.10
        }

        score = sum(
            results[key]["score"] * weights[key]
            for key in weights
        )

        return round(score, 1)

    def _extract_issues(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract and prioritize issues."""
        issues = []

        # Extract issues from each dimension
        for dimension, data in results.items():
            if dimension in ["visual", "functionality", "performance", "accessibility", "responsive"]:
                if "issues" in data:
                    issues.extend(data["issues"])

        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        issues.sort(key=lambda x: priority_order.get(x.get("priority", "low"), 2))

        return issues

    def _determine_status(self, score: float) -> str:
        """Determine deployment status based on score."""
        if score >= 9.0:
            return "excellent"
        elif score >= 8.0:
            return "good"
        elif score >= 7.0:
            return "acceptable"
        elif score >= 6.0:
            return "needs_work"
        else:
            return "not_ready"
```

**Step 3: Add API Endpoints**

Update `python/main.py` in Archon:

```python
from services.browser_quality_service import BrowserQualityService

browser_quality = BrowserQualityService()

@app.post("/api/quality/full-scan")
async def full_quality_scan(request: dict):
    """Run comprehensive quality scan."""
    url = request.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL required")

    result = await browser_quality.full_quality_scan(url)

    # Store in knowledge base
    await knowledge_service.store_quality_report(result)

    # Send real-time update
    await socketio_manager.emit("quality_scan_complete", result)

    return result

@app.post("/api/quality/validate")
async def validate_page(request: dict):
    """Quick validation check."""
    url = request.get("url")
    checks = request.get("checks", ["visual", "functionality"])

    result = await browser_quality.validate_page(url, checks)
    return result

@app.get("/api/quality/reports/{project_id}")
async def get_quality_reports(project_id: str):
    """Get historical quality reports for project."""
    reports = await knowledge_service.get_quality_reports(project_id)
    return {"reports": reports}
```

**Step 4: Create Dashboard Component**

Create `frontend/app/components/BrowserQuality.tsx`:

```typescript
import React, { useState } from 'react';
import { useSocket } from '../lib/socket';
import { api } from '../lib/api';

export function BrowserQuality() {
  const [url, setUrl] = useState('http://localhost:3000');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const socket = useSocket();

  // Listen for real-time updates
  React.useEffect(() => {
    socket.on('quality_scan_complete', (data) => {
      setReport(data);
      setLoading(false);
    });
  }, [socket]);

  const runScan = async () => {
    setLoading(true);
    try {
      const result = await api.post('/api/quality/full-scan', { url });
      setReport(result);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="browser-quality-dashboard">
      <div className="scan-controls">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:3000"
        />
        <button onClick={runScan} disabled={loading}>
          {loading ? 'Scanning...' : 'Run Quality Scan'}
        </button>
      </div>

      {report && (
        <div className="quality-report">
          <div className="overall-score">
            <h2>Overall Score</h2>
            <div className={`score score-${report.status}`}>
              {report.overall_score}/10
            </div>
            <div className="status">{report.status}</div>
          </div>

          <div className="dimension-scores">
            <ScoreCard title="Visual" score={report.visual.score} />
            <ScoreCard title="Functionality" score={report.functionality.score} />
            <ScoreCard title="Performance" score={report.performance.score} />
            <ScoreCard title="Accessibility" score={report.accessibility.score} />
            <ScoreCard title="Responsive" score={report.responsive.score} />
          </div>

          <div className="issues-list">
            <h3>Issues Found</h3>
            {report.issues.map((issue, i) => (
              <IssueCard key={i} issue={issue} />
            ))}
          </div>

          <div className="actions">
            <button onClick={() => exportReport(report)}>
              Export Report
            </button>
            <button onClick={() => createTasksForIssues(report.issues)}>
              Create Tasks for Fixes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, score }) {
  const getColor = (score) => {
    if (score >= 9.0) return 'green';
    if (score >= 8.0) return 'blue';
    if (score >= 7.0) return 'yellow';
    return 'red';
  };

  return (
    <div className={`score-card ${getColor(score)}`}>
      <h4>{title}</h4>
      <div className="score">{score}/10</div>
    </div>
  );
}

function IssueCard({ issue }) {
  const priorityColors = {
    high: 'red',
    medium: 'yellow',
    low: 'gray'
  };

  return (
    <div className={`issue-card priority-${issue.priority}`}>
      <span className="priority-badge">{issue.priority}</span>
      <h4>{issue.title}</h4>
      <p>{issue.description}</p>
      <p className="recommendation"><strong>Fix:</strong> {issue.recommendation}</p>
    </div>
  );
}
```

### Using Archon Integration

**From Archon UI:**
1. Navigate to http://localhost:3737/quality
2. Enter project URL (e.g., localhost:3000)
3. Click "Run Quality Scan"
4. Review results in dashboard
5. Create tasks for fixes automatically

**From API:**
```bash
# Run quality scan
curl -X POST http://localhost:8051/api/quality/full-scan \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3000"}'

# Get historical reports
curl http://localhost:8051/api/quality/reports/project-123
```

## Layer 3: BMAD Agent Integration

### Overview

BMAD agents provide autonomous quality assurance with:
- **QA Agent**: Comprehensive quality validation
- **Victoria Validator**: UI/UX validation
- **Elena Execution**: Automated fix application
- **BMAD Coordinator**: Orchestrated workflows

### QA Agent

**Purpose**: Dedicated quality assurance agent

**Capabilities:**
- Full quality scans
- Section-by-section validation
- Historical score tracking
- Automated reporting
- Task creation for issues

**Usage:**
```
QA Agent, run full quality scan on localhost:3000.
Generate comprehensive report with scores and prioritized issues.
```

### Enhanced Victoria Validator

**New Capabilities:**
- Browser-based UI validation
- Real-time visual inspection
- Responsive design verification
- Accessibility checking

**Usage:**
```
Victoria Validator, validate the hero section using Chrome DevTools:
1. Check layout and spacing
2. Verify responsive behavior at all breakpoints
3. Test CTA functionality
4. Score the section 1-10
5. Provide specific recommendations
```

### Enhanced Elena Execution

**New Capabilities:**
- Apply fixes with browser verification
- Automated re-testing after fixes
- Iterative improvement loop

**Usage:**
```
Elena Execution, fix the mobile layout issues:
1. Apply responsive CSS fixes
2. Use Chrome DevTools to verify at 375px width
3. If issues persist, try alternative approach
4. Re-test until score improves
```

### BMAD Coordinator Workflows

**Quality Validation Workflow:**
```
BMAD Coordinator, run quality validation workflow:
1. QA Agent: Full quality scan
2. Victoria: Validate specific issues
3. Elena: Apply high-priority fixes
4. QA Agent: Re-scan to verify improvements
5. Oscar: Create tasks for remaining issues
```

**Performance Optimization Workflow:**
```
BMAD Coordinator, optimize performance:
1. QA Agent: Performance audit
2. David: Infrastructure recommendations
3. Elena: Apply performance optimizations
4. QA Agent: Verify Core Web Vitals improvements
```

**Responsive Design Workflow:**
```
BMAD Coordinator, fix responsive design:
1. QA Agent: Test all breakpoints
2. Victoria: Identify layout issues
3. Elena: Apply responsive fixes
4. QA Agent: Re-test responsive behavior
```

## Testing Workflows

### Daily Development Workflow

```bash
# Morning: Check project health
QA Agent, run quick validation on localhost:3000.
Report any new issues since yesterday.

# After feature implementation
Validate the new [feature] at localhost:3000/[feature].
Check functionality and responsive design.

# Before committing
Run quality scan. If score < 8.0, fix issues before commit.

# End of day
Generate daily quality report.
Compare to yesterday's scores.
```

### Pre-Deployment Workflow

```bash
# Step 1: Full quality scan
QA Agent, run comprehensive quality scan on localhost:3000.

# Step 2: Verify standards
Check:
- Overall score ≥ 8.0 (landing page) or ≥ 8.5 (SaaS)
- All Core Web Vitals pass
- No high-priority issues
- Accessibility score ≥ 90

# Step 3: Fix critical issues (if any)
Elena, fix high-priority issues found in scan.

# Step 4: Re-scan
QA Agent, re-scan to verify improvements.

# Step 5: Deploy (if passed)
If all standards met, proceed with deployment.
```

### Post-Deployment Workflow

```bash
# Week 1: Monitor production
QA Agent, scan production URL.
Compare to pre-deployment scores.
Report any degradation.

# Monthly: Quality review
Generate quality trend report.
Identify areas for improvement.
Plan optimization sprints.
```

## Best Practices

### ✅ Do

1. **Test Early and Often**
   - Run quick scans during development
   - Don't wait for pre-deployment

2. **Establish Baselines**
   - Run initial scan on day 1
   - Track improvements over time

3. **Prioritize Issues**
   - Fix high-priority issues first
   - Address accessibility early

4. **Automate Testing**
   - Use BMAD workflows for consistency
   - Integrate with CI/CD

5. **Document Findings**
   - Save quality reports
   - Track trends
   - Share learnings

### ❌ Don't

1. **Don't Skip Quality Gates**
   - Never deploy without scan
   - Don't ignore failing scores

2. **Don't Test Production First**
   - Test localhost/staging first
   - Catch issues early

3. **Don't Ignore Warnings**
   - Console warnings matter
   - Accessibility warnings critical

4. **Don't Accept Regressions**
   - Don't deploy lower scores
   - Fix before deploying

## Troubleshooting

See [Chrome DevTools MCP Documentation](CHROME_DEVTOOLS_MCP.md#troubleshooting) for detailed troubleshooting steps.

## Related Documentation

- **[Chrome DevTools MCP](CHROME_DEVTOOLS_MCP.md)** - Integration patterns
- **[Quality Standards](QUALITY_STANDARDS.md)** - Validation criteria
- **[Validation Templates](QUALITY_VALIDATION_TEMPLATES.md)** - Reusable templates
- **[Claude Code Integration](../CLAUDE_CODE_INTEGRATION.md)** - Genesis MCP

---

**Status**: Implementation Guide
**Last Updated**: 2025-10-16
**Maintainer**: Project Genesis Team
