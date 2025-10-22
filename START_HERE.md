# 🚀 START HERE - Phase 1 Quick Test

**Time Required**: 15 minutes
**Status**: Ready for immediate testing
**Goal**: Validate Scout-Plan-Build commands work

---

## ⚡ 15-Minute Quick Test

### Step 1: Verify Installation (2 min)

```bash
# Check repository
cd ~/Developer/projects/project-genesis
git status

# Verify commands exist
ls .claude/commands/

# Expected: 4 .md files
# scout-genesis-pattern.md
# plan-genesis-implementation.md
# build-genesis-feature.md
# generate-transition.md
```

✅ **Checkpoint**: All 4 command files present

---

### Step 2: Test Scout Command (5 min)

**In Claude Code, run:**
```
/scout-genesis-pattern "add a contact form with name, email, and message fields"
```

**Expected Output**:
- Analysis of current project structure
- Requirements breakdown
- Genesis pattern recommendations
- File locations to modify
- Dependencies needed
- Next steps

✅ **Checkpoint**: Scout produces comprehensive analysis (>500 words)

---

### Step 3: Test Plan Command (5 min)

**In Claude Code, run:**
```
/plan-genesis-implementation --from-last-scout
```

**Expected Output**:
- References scout findings
- 3+ implementation phases
- Code examples
- Test strategy
- Validation checkpoints

✅ **Checkpoint**: Plan is detailed and actionable

---

### Step 4: Test Context Loading (3 min)

**In Claude Code, check:**
```
/context-status
```

**Expected**:
- Shows loaded files
- Token usage displayed
- Priority levels indicated

**Then try:**
```
/load-priority P1
```

✅ **Checkpoint**: Context commands respond

---

## 🎯 Success Indicators

After 15 minutes, you should see:

- [x] All 4 commands recognized by Claude Code
- [x] Scout produces quality analysis
- [x] Plan builds on scout results
- [x] Context management works
- [x] No errors or crashes

**If all checked**: ✅ Phase 1 is working!

**If any unchecked**: See Troubleshooting below

---

## 🐛 Quick Troubleshooting

### Commands Not Recognized
```bash
# Restart Claude Code
exit
cd ~/Developer/projects/project-genesis
claude-code

# Verify files are in .claude/commands/
ls -la .claude/commands/
```

### Scout Doesn't Produce Analysis
- Check you're in a project directory
- Verify feature description is clear
- Try a simpler feature first

### Context Commands Don't Work
- These are custom additions
- May need implementation in future
- Core Scout-Plan-Build works independently

---

## 📚 Next Steps

### If Quick Test Passes
1. ✅ Proceed to full testing protocol
2. ✅ Read: `docs/PHASE_1_TESTING_PROTOCOL.md`
3. ✅ Track metrics: `docs/METRICS_TRACKER.md`

### If Issues Found
1. ⚠️ Document in METRICS_TRACKER.md
2. ⚠️ Check GitHub issues
3. ⚠️ Review documentation

---

## 🎓 Full Testing

**Ready for comprehensive testing?**

Read the complete protocol:
```bash
cat docs/PHASE_1_TESTING_PROTOCOL.md
```

**Duration**: 3 hours
**Coverage**: 18 tests across 6 categories
**Goal**: Validate 30-40% speed improvement

---

## 📊 Track Your Results

Use the metrics tracker:
```bash
# Open metrics tracker
cat docs/METRICS_TRACKER.md

# Or edit to record results
nano docs/METRICS_TRACKER.md
```

---

## 🔗 Important Links

- **Full Test Protocol**: [docs/PHASE_1_TESTING_PROTOCOL.md](docs/PHASE_1_TESTING_PROTOCOL.md)
- **Metrics Tracker**: [docs/METRICS_TRACKER.md](docs/METRICS_TRACKER.md)
- **Phase 1 Summary**: [PHASE_1_SUMMARY.md](PHASE_1_SUMMARY.md)
- **Context Strategy**: [docs/CONTEXT_LOADING_STRATEGY.md](docs/CONTEXT_LOADING_STRATEGY.md)
- **GitHub**: https://github.com/klatt42/project-genesis
- **Archon Dashboard**: http://localhost:3737

---

## ✅ Quick Win Checklist

- [ ] 15-minute quick test passed
- [ ] Commands working in Claude Code
- [ ] Scout produces analysis
- [ ] Plan builds on scout
- [ ] Ready for full testing

**Status**: ⏳ Testing / ✅ Validated / ❌ Issues Found

---

**Time to test**: 15 minutes now
**Time for full suite**: 3 hours later
**Expected ROI**: 30-40% faster development

🚀 **Let's validate Phase 1!**
