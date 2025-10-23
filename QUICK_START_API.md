# Quick Start: Switch to API Usage

**When**: You hit your weekly Claude usage limit
**What**: Use your Anthropic API key instead of web credits

---

## Immediate Setup (30 seconds)

```bash
# 1. Set your API key (get from API_KEY_SETUP.md - local file only)
export ANTHROPIC_API_KEY="your-api-key-here"

# 2. Verify it's set
echo $ANTHROPIC_API_KEY

# 3. Continue using Claude Code as normal
claude-code "continue Genesis development"

# That's it! Claude Code now uses your API key instead of weekly credits
```

**Note**: Your actual API key is stored locally in `API_KEY_SETUP.md` (gitignored, not pushed to GitHub)

---

## Make It Permanent (so you don't have to re-export)

```bash
# Add to your shell profile (use your actual key from API_KEY_SETUP.md)
echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.bashrc

# Reload your shell
source ~/.bashrc

# Now it's always available in new terminals
```

---

## Check Your Usage

**Track costs**: https://console.anthropic.com/settings/usage

**Estimated costs**:
- ~$0.14 per Genesis command
- ~$7/week for heavy usage (50 commands)
- ~$30/month typical

---

## Troubleshooting

**If Claude Code still says "usage limit exceeded"**:
```bash
# Check if API key is set
echo $ANTHROPIC_API_KEY

# If empty, run the export command again with your actual key
# (Get key from local file: API_KEY_SETUP.md)
```

**Test API connection**:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Test"}]
  }'

# Should return a response (not an error)
```

---

## What Happens When API Key is Set

**Before** (using web credits):
- Weekly usage limit applies
- All Claude.ai/Desktop/Code usage counted together
- Hit limit = wait for reset

**After** (using API key):
- No weekly limit
- Pay per use (~$0.14/command)
- Track costs in Anthropic dashboard
- Budget alerts available

---

## Security Note

⚠️ **Never commit API keys to Git**

Your actual API key is stored in:
- `~/project-genesis/API_KEY_SETUP.md` (local only, gitignored)
- This file does NOT contain the actual key (safe to push to GitHub)

---

## Status

✅ Quick reference ready
✅ Actual API key in local file only (API_KEY_SETUP.md)
✅ This file safe to commit (no secrets)

**For full setup details**: See API_KEY_SETUP.md (local file)
