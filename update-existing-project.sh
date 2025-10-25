#!/bin/bash
# Genesis v1.1.0 - Update existing project with new templates
# Usage: ./update-existing-project.sh /path/to/project

set -e  # Exit on error

PROJECT_PATH=$1

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if project path is provided
if [ -z "$PROJECT_PATH" ]; then
  echo -e "${YELLOW}Usage: ./update-existing-project.sh /path/to/project${NC}"
  echo ""
  echo "Example:"
  echo "  ./update-existing-project.sh ~/projects/my-erp-plan"
  exit 1
fi

# Check if project path exists
if [ ! -d "$PROJECT_PATH" ]; then
  echo -e "${YELLOW}Error: Project path does not exist: $PROJECT_PATH${NC}"
  exit 1
fi

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}Genesis v1.1.0 Project Update${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""
echo -e "Updating project at: ${GREEN}$PROJECT_PATH${NC}"
echo ""

# Get project name from path
PROJECT_NAME=$(basename "$PROJECT_PATH")

# Copy templates
echo -e "${BLUE}[1/5] Copying GENESIS_QUICK_START.md...${NC}"
cp ~/projects/project-genesis/templates/GENESIS_QUICK_START.md "$PROJECT_PATH/"
echo -e "${GREEN} GENESIS_QUICK_START.md copied${NC}"

echo -e "${BLUE}[2/5] Copying PROJECT_STATUS.md...${NC}"
cp ~/projects/project-genesis/templates/PROJECT_STATUS.md "$PROJECT_PATH/"
echo -e "${GREEN} PROJECT_STATUS.md copied${NC}"

echo -e "${BLUE}[3/5] Creating .github directory...${NC}"
mkdir -p "$PROJECT_PATH/.github"
echo -e "${GREEN} .github directory created${NC}"

echo -e "${BLUE}[4/5] Copying CLAUDE_CODE_REMINDER.md...${NC}"
cp ~/projects/project-genesis/templates/.github/CLAUDE_CODE_REMINDER.md "$PROJECT_PATH/.github/"
echo -e "${GREEN} CLAUDE_CODE_REMINDER.md copied${NC}"

echo -e "${BLUE}[5/5] Copying README.md template...${NC}"
# Only copy if README doesn't exist, otherwise show message
if [ ! -f "$PROJECT_PATH/README.md" ]; then
  cp ~/projects/project-genesis/templates/README.md "$PROJECT_PATH/"
  echo -e "${GREEN} README.md copied${NC}"
else
  echo -e "${YELLOW}  README.md already exists - skipped (manually add context recovery section)${NC}"
fi

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Templates copied successfully!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo -e "${YELLOW}1. Edit GENESIS_QUICK_START.md${NC}"
echo "   cd $PROJECT_PATH"
echo "   - Replace [PROJECT_NAME] with: $PROJECT_NAME"
echo "   - Set project type: [SaaS Application / Landing Page]"
echo "   - Fill in environment status (Supabase URL, GitHub repo, etc.)"
echo "   - Update current phase and progress"
echo ""
echo -e "${YELLOW}2. Edit PROJECT_STATUS.md${NC}"
echo "   cd $PROJECT_PATH"
echo "   - Replace [PROJECT_NAME] with: $PROJECT_NAME"
echo "   - Document current position (active task, current file)"
echo "   - Update phase progress"
echo "   - Fill in database status"
echo "   - List recent changes"
echo "   - Define next actions"
echo ""
echo -e "${YELLOW}3. Update README.md (if existing)${NC}"
echo "   - Add context recovery section at the top"
echo "   - Link to GENESIS_QUICK_START.md"
echo "   - Link to PROJECT_STATUS.md"
echo "   - Link to .github/CLAUDE_CODE_REMINDER.md"
echo ""
echo -e "${YELLOW}4. Commit changes${NC}"
echo "   cd $PROJECT_PATH"
echo "   git add ."
echo "   git commit -m \"feat: Add Genesis v1.1.0 context recovery templates\""
echo "   git push"
echo ""
echo -e "${BLUE}Files added:${NC}"
echo "  - GENESIS_QUICK_START.md"
echo "  - PROJECT_STATUS.md"
echo "  - .github/CLAUDE_CODE_REMINDER.md"
if [ ! -f "$PROJECT_PATH/README.md" ]; then
  echo "  - README.md"
fi
echo ""
echo -e "${GREEN}Update complete!${NC}"
