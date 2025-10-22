#!/bin/bash

# Genesis Skills v2.0 Installation Script
# Installs all Genesis skills to ~/.claude/skills/genesis/

set -e  # Exit on error

echo "🚀 Genesis Skills v2.0 Installer"
echo "=================================="
echo ""

# Define target directory
TARGET_DIR="$HOME/.claude/skills/genesis"

# Create target directory if it doesn't exist
echo "📁 Creating skills directory..."
mkdir -p "$TARGET_DIR"

# Count skills
CORE_COUNT=$(find core -name "skill.md" 2>/dev/null | wc -l)
SPECIALIZED_COUNT=$(find specialized -name "skill.md" 2>/dev/null | wc -l)
TOTAL_COUNT=$((CORE_COUNT + SPECIALIZED_COUNT))

echo "📦 Found $TOTAL_COUNT skills ($CORE_COUNT core + $SPECIALIZED_COUNT specialized)"
echo ""

# Install core skills
if [ $CORE_COUNT -gt 0 ]; then
    echo "Installing core skills..."
    cp -r core/* "$TARGET_DIR/" 2>/dev/null || true
    echo "  ✅ $CORE_COUNT core skills installed"
fi

# Install specialized skills
if [ $SPECIALIZED_COUNT -gt 0 ]; then
    echo "Installing specialized skills..."
    cp -r specialized/* "$TARGET_DIR/" 2>/dev/null || true
    echo "  ✅ $SPECIALIZED_COUNT specialized skills installed"
fi

echo ""
echo "✨ Installation Complete!"
echo ""
echo "Installed skills:"
ls -1 "$TARGET_DIR" | sed 's/^/  - /'
echo ""
echo "📍 Location: $TARGET_DIR"
echo ""
echo "🔄 Next Steps:"
echo "  1. Restart Claude Desktop (if running)"
echo "  2. Test skills by starting a new project:"
echo "     \"I want to create a new Genesis project\""
echo ""
echo "🎉 Genesis Skills v2.0 ready to use!"
