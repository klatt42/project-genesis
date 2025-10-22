#!/bin/bash

# Genesis Skills v2.0 Uninstaller
# Removes all Genesis skills from ~/.claude/skills/genesis/

set -e  # Exit on error

echo "🗑️  Genesis Skills v2.0 Uninstaller"
echo "===================================="
echo ""

# Define target directory
TARGET_DIR="$HOME/.claude/skills/genesis"

# Check if directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "ℹ️  Genesis skills not found at $TARGET_DIR"
    echo "Nothing to uninstall."
    exit 0
fi

# Count skills before removal
SKILL_COUNT=$(ls -1 "$TARGET_DIR" 2>/dev/null | wc -l)

echo "📦 Found $SKILL_COUNT Genesis skills to remove"
echo ""
echo "Skills to be removed:"
ls -1 "$TARGET_DIR" | sed 's/^/  - /'
echo ""

# Confirm removal
read -p "❓ Remove all Genesis skills? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Uninstall cancelled."
    exit 0
fi

# Remove Genesis skills directory
echo "🗑️  Removing Genesis skills..."
rm -rf "$TARGET_DIR"

echo ""
echo "✅ Uninstall Complete!"
echo ""
echo "🔄 Next Steps:"
echo "  1. Restart Claude Desktop (if running)"
echo "  2. Genesis skills will no longer auto-load"
echo ""
echo "To reinstall, run: ./install.sh"
