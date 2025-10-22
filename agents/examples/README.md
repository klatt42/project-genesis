# Phase 2 Autonomous Agents - Examples

Practical examples demonstrating the Phase 2 autonomous agent system.

---

## 📚 Available Examples

### 1. Pattern Detection Example

**File**: `autonomous_project.py pattern`

**What it demonstrates**:
- Project type detection from descriptions
- Pattern matching for features
- Implementation time estimation

**Run**:
```bash
cd ~/Developer/projects/project-genesis
python agents/examples/autonomous_project.py pattern
```

**Output**:
- Detects project types (landing page vs SaaS)
- Matches features to Genesis patterns
- Estimates sequential vs parallel execution time

---

### 2. Simple Feature Implementation

**File**: `autonomous_project.py simple`

**What it demonstrates**:
- Single GenesisFeatureAgent execution
- Pattern matching and code generation
- Quality validation

**Run**:
```bash
python agents/examples/autonomous_project.py simple
```

**Features demonstrated**:
- Pattern library usage
- Automated file creation
- Test execution
- Archon task creation

---

### 3. Full Autonomous Project

**File**: `autonomous_project.py full`

**What it demonstrates**:
- Complete end-to-end workflow
- CoordinationAgent orchestration
- Parallel execution of multiple features
- Real performance metrics

**Run**:
```bash
python agents/examples/autonomous_project.py full
```

**Expected flow**:
```
1. CoordinationAgent initializes
2. GenesisSetupAgent creates project (~15 min)
3. Multiple GenesisFeatureAgents work in parallel (~25 min)
4. Results validated and reported
5. Total: ~40-60 minutes (vs 225 min baseline)
```

---

## 🎯 Quick Start

### Prerequisites

1. **Install dependencies**:
```bash
cd ~/Developer/projects/project-genesis
pip install -r agents/requirements.txt
```

2. **Ensure Archon is running**:
```bash
# Check Archon health
curl http://localhost:8181/health
curl http://localhost:8051/health
```

3. **Verify Phase 1 commands**:
```bash
ls .claude/commands/
# Should see: scout, plan, build, transition commands
```

---

## 📊 Example Scenarios

### Scenario 1: Landing Page Project

```python
project_spec = {
    "description": "Build a landing page for product launch with lead capture",
    "features": [
        "hero section",
        "features showcase",
        "contact form",
        "pricing table"
    ],
    "project_type": "landing_page",
    "max_parallel": 3
}

# Expected patterns matched:
# - lp_hero_section (15 min)
# - lp_features_showcase (20 min)
# - lp_contact_form (30 min)
# - lp_pricing_table (20 min)

# Sequential: 85 minutes
# Parallel: ~35 minutes (2.4x speedup)
```

### Scenario 2: SaaS Application

```python
project_spec = {
    "description": "Build a task management SaaS with team collaboration",
    "features": [
        "user authentication",
        "dashboard",
        "team management",
        "notifications"
    ],
    "project_type": "saas_app",
    "max_parallel": 3
}

# Expected patterns matched:
# - saas_authentication (45 min)
# - saas_dashboard (30 min)
# - saas_team_management (40 min)
# - saas_notifications (30 min)

# Sequential: 145 minutes
# Parallel: ~60 minutes (2.4x speedup)
```

---

## 🔍 Understanding the Output

### Pattern Detection Output

```
🔍 Project Type Detection:

Description: Build a landing page for our new product launch...
Detected Type: landing_page
Confidence: 85%
Reasoning: Landing page indicators found: 'landing page', 'product launch'
```

**What this means**:
- System identified key indicators in description
- High confidence (>80%) = reliable detection
- Recommended template: `boilerplate/landing-page`

### Pattern Matching Output

```
🎯 Pattern Matching:

Feature: user authentication
Matched Pattern: User Authentication
Confidence: 95%
Complexity: complex
Estimated Time: 45 minutes
```

**What this means**:
- Feature matched to `saas_authentication` pattern
- High confidence match (keywords: auth, login, signup)
- Complex implementation (multiple files, dependencies)
- Realistic time estimate based on pattern

### Time Estimation Output

```
⏱️ Implementation Time Estimation:

Features: authentication, dashboard, team management, billing
Setup Time: 15 minutes
Sequential Time: 160 minutes
Parallel Time: 65 minutes
Speedup: 2.46x
```

**What this means**:
- Total time if features built one-by-one: 160 min
- Total time with 3 parallel agents: 65 min
- Speedup factor: 2.46x faster
- Includes 15-minute setup overhead

---

## 🛠️ Customizing Examples

### Change Project Type

```python
# Landing page
project_spec["project_type"] = "landing_page"

# SaaS app
project_spec["project_type"] = "saas_app"
```

### Adjust Parallelization

```python
# Run 2 features in parallel
project_spec["max_parallel"] = 2

# Run 5 features in parallel (if you have the resources)
project_spec["max_parallel"] = 5
```

### Add Custom Features

```python
project_spec["features"] = [
    "your custom feature",  # Will use pattern matching
    "another feature",
    # ...
]
```

---

## 📈 Performance Expectations

### Simple Projects (1-3 features)

| Metric | Baseline | Phase 2 | Improvement |
|--------|----------|---------|-------------|
| Setup | 30 min | 15 min | 50% |
| Implementation | 60 min | 25 min | 58% |
| **Total** | **90 min** | **40 min** | **56%** |

### Complex Projects (4-6 features)

| Metric | Baseline | Phase 2 | Improvement |
|--------|----------|---------|-------------|
| Setup | 45 min | 15 min | 67% |
| Implementation | 180 min | 60 min | 67% |
| **Total** | **225 min** | **75 min** | **67%** |

---

## 🐛 Troubleshooting

### "ArchonMCPClient not initialized"

**Solution**: Ensure Archon services are running:
```bash
docker ps | grep archon
# Should see: Archon-Server, Archon-MCP, Archon-UI, Archon-Agents
```

### "Phase1CommandExecutor not initialized"

**Solution**: Call `agent.initialize()` before `agent.execute()`:
```python
agent = GenesisFeatureAgent()
await agent.initialize()  # Important!
result = await agent.execute(task_spec)
```

### "Pattern library not loaded"

**Solution**: This happens if pattern matching fails. Check:
- Feature name is descriptive
- Description includes relevant keywords
- Project type is specified

### No parallel speedup

**Cause**: Not enough features to parallelize

**Example**:
- 1-2 features: ~1.0x speedup (minimal parallelization)
- 3-4 features: ~1.5-2.0x speedup
- 5-6 features: ~2.0-2.5x speedup

---

## 🔗 Related Documentation

- **Pattern Library**: `agents/genesis_feature/core/pattern_library.py`
- **Project Detector**: `agents/genesis_setup/core/project_detector.py`
- **Agent Docs**: `agents/README.md`
- **Phase 1 Commands**: `.claude/commands/`

---

## 🎯 Next Steps

After running examples:

1. **Review generated code** in Archon dashboard
2. **Check task tracking** at http://localhost:3737
3. **Validate implementation** against Genesis patterns
4. **Measure actual performance** vs estimates

---

**Happy autonomous developing!** 🚀
