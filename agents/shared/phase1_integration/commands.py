"""
Phase 1 Command Executor for autonomous agent integration.

Programmatically executes Phase 1 Scout-Plan-Build commands.
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional


class Phase1CommandExecutor:
    """
    Executor for Phase 1 Scout-Plan-Build commands.

    Provides programmatic access to:
    - Scout command: Analyze patterns and requirements
    - Plan command: Create implementation plans
    - Build command: Execute systematic implementation
    - Transition command: Generate context preservation documents
    """

    def __init__(self, commands_dir: Optional[Path] = None):
        """
        Initialize Phase 1 command executor.

        Args:
            commands_dir: Directory containing Phase 1 command files
                         (defaults to project-genesis/.claude/commands/)
        """
        if commands_dir is None:
            # Default to project-genesis/.claude/commands/
            project_root = Path(__file__).parent.parent.parent.parent
            commands_dir = project_root / ".claude" / "commands"

        self.commands_dir = commands_dir
        self.commands = self._load_commands()

    def _load_commands(self) -> Dict[str, str]:
        """
        Load Phase 1 command files.

        Returns:
            Dictionary mapping command names to their content
        """
        commands = {}
        command_files = {
            "scout": "scout-genesis-pattern.md",
            "plan": "plan-genesis-implementation.md",
            "build": "build-genesis-feature.md",
            "transition": "generate-transition.md"
        }

        for cmd_name, filename in command_files.items():
            filepath = self.commands_dir / filename
            if filepath.exists():
                with open(filepath, 'r') as f:
                    commands[cmd_name] = f.read()
            else:
                print(f"Warning: Command file not found: {filepath}")

        return commands

    def get_command_content(self, command: str) -> Optional[str]:
        """
        Get the content of a Phase 1 command.

        Args:
            command: Command name (scout, plan, build, transition)

        Returns:
            Command content or None if not found
        """
        return self.commands.get(command)

    def get_scout_prompt(self, feature_description: str) -> str:
        """
        Generate Scout command prompt.

        Args:
            feature_description: Description of feature/pattern to scout

        Returns:
            Full Scout command prompt
        """
        scout_content = self.get_command_content("scout")
        if not scout_content:
            raise ValueError("Scout command not loaded")

        # Scout command structure from scout-genesis-pattern.md
        return f"""Execute Scout phase for: {feature_description}

{scout_content}

Feature to scout: {feature_description}
"""

    def get_plan_prompt(
        self,
        scout_results: str,
        think_level: str = "think-hard"
    ) -> str:
        """
        Generate Plan command prompt from scout results.

        Args:
            scout_results: Results from scout phase
            think_level: Thinking level (think, think-hard, think-harder, ultrathink)

        Returns:
            Full Plan command prompt
        """
        plan_content = self.get_command_content("plan")
        if not plan_content:
            raise ValueError("Plan command not loaded")

        return f"""Execute Plan phase based on scout results.

{plan_content}

Think level: {think_level}

Scout Results:
{scout_results}
"""

    def get_build_prompt(self, plan_results: str) -> str:
        """
        Generate Build command prompt from plan results.

        Args:
            plan_results: Results from plan phase

        Returns:
            Full Build command prompt
        """
        build_content = self.get_command_content("build")
        if not build_content:
            raise ValueError("Build command not loaded")

        return f"""Execute Build phase based on plan.

{build_content}

Implementation Plan:
{plan_results}
"""

    def get_transition_prompt(self, work_summary: str) -> str:
        """
        Generate Transition command prompt.

        Args:
            work_summary: Summary of work completed

        Returns:
            Full Transition command prompt
        """
        transition_content = self.get_command_content("transition")
        if not transition_content:
            raise ValueError("Transition command not loaded")

        return f"""Generate transition document for work completed.

{transition_content}

Work Summary:
{work_summary}
"""

    async def execute_scout(
        self,
        feature_description: str
    ) -> Dict[str, Any]:
        """
        Execute Scout command analysis.

        Args:
            feature_description: Feature/pattern to analyze

        Returns:
            Dictionary with scout results
        """
        # NOTE: In actual implementation, this would invoke Claude Code
        # with the Scout command prompt. For now, we return a structured
        # result that agents can use.

        prompt = self.get_scout_prompt(feature_description)

        return {
            "command": "scout",
            "input": feature_description,
            "prompt": prompt,
            "status": "ready",
            "note": "Prompt prepared for Scout execution"
        }

    async def execute_plan(
        self,
        scout_results: str,
        think_level: str = "think-hard"
    ) -> Dict[str, Any]:
        """
        Execute Plan command.

        Args:
            scout_results: Results from scout phase
            think_level: Thinking level to use

        Returns:
            Dictionary with plan results
        """
        prompt = self.get_plan_prompt(scout_results, think_level)

        return {
            "command": "plan",
            "scout_results": scout_results,
            "think_level": think_level,
            "prompt": prompt,
            "status": "ready",
            "note": "Prompt prepared for Plan execution"
        }

    async def execute_build(self, plan_results: str) -> Dict[str, Any]:
        """
        Execute Build command.

        Args:
            plan_results: Results from plan phase

        Returns:
            Dictionary with build results
        """
        prompt = self.get_build_prompt(plan_results)

        return {
            "command": "build",
            "plan_results": plan_results,
            "prompt": prompt,
            "status": "ready",
            "note": "Prompt prepared for Build execution"
        }

    async def execute_transition(
        self,
        work_summary: str
    ) -> Dict[str, Any]:
        """
        Execute Transition command.

        Args:
            work_summary: Summary of work completed

        Returns:
            Dictionary with transition results
        """
        prompt = self.get_transition_prompt(work_summary)

        return {
            "command": "transition",
            "work_summary": work_summary,
            "prompt": prompt,
            "status": "ready",
            "note": "Prompt prepared for Transition generation"
        }

    def __repr__(self) -> str:
        loaded_cmds = list(self.commands.keys())
        return f"Phase1CommandExecutor(commands_loaded={loaded_cmds})"
