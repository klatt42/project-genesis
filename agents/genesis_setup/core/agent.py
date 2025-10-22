"""
GenesisSetupAgent - Autonomous project initialization.

Capabilities:
- Project type detection (landing page vs SaaS)
- Genesis template selection
- Repository initialization
- Service configuration (Supabase, GHL, Netlify)
- Environment setup
"""

from typing import Dict, Any
from agents.shared.base_agent import BaseAgent, AgentStatus


class GenesisSetupAgent(BaseAgent):
    """
    Autonomous agent for Genesis project initialization.

    Handles complete project setup from description to ready-to-develop state.
    Expected duration: 10-15 minutes
    """

    def __init__(self, agent_id: str = "gsa-1"):
        """
        Initialize GenesisSetupAgent.

        Args:
            agent_id: Unique identifier for this agent instance
        """
        super().__init__(
            agent_id=agent_id,
            agent_type="GenesisSetupAgent"
        )

    async def execute(self, task_spec: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute autonomous project setup.

        Args:
            task_spec: Project specification with keys:
                - description: Project description
                - project_type: Optional project type hint
                - services: Optional list of services to configure

        Returns:
            Dictionary with setup results:
                - project_id: Created project ID in Archon
                - repository_url: Git repository URL
                - services_configured: List of configured services
                - setup_time_seconds: Total setup time
        """
        self._track_task_start("Project Setup")
        self._update_status(AgentStatus.EXECUTING)

        try:
            # Step 1: Analyze requirements using Scout
            self._log("Step 1: Analyzing project requirements...")
            scout_result = await self._scout_requirements(
                task_spec.get("description", "")
            )

            # Step 2: Detect project type
            self._log("Step 2: Detecting project type...")
            project_type = await self._detect_project_type(scout_result)

            # Step 3: Create project in Archon
            self._log("Step 3: Creating project in Archon...")
            project = await self._create_archon_project(
                task_spec.get("description", ""),
                project_type
            )

            # Step 4: Initialize repository
            self._log("Step 4: Initializing repository...")
            repo_url = await self._initialize_repository(
                project_type,
                project.get("id")
            )

            # Step 5: Configure services
            self._log("Step 5: Configuring services...")
            services = await self._configure_services(
                task_spec.get("services", []),
                project_type
            )

            result = {
                "project_id": project.get("id"),
                "project_type": project_type,
                "repository_url": repo_url,
                "services_configured": services,
                "setup_time_seconds": 0  # Will be calculated
            }

            self._track_task_complete(success=True, result=result)
            self._update_status(AgentStatus.COMPLETED)

            return result

        except Exception as e:
            self._handle_error(e, {"task_spec": task_spec})
            self._track_task_complete(success=False)
            raise

    async def validate(self, result: Dict[str, Any]) -> bool:
        """
        Validate project setup results.

        Args:
            result: Setup results to validate

        Returns:
            True if setup is valid and complete
        """
        self._update_status(AgentStatus.VALIDATING)

        # Check required fields
        required_fields = ["project_id", "project_type", "repository_url"]
        if not all(field in result for field in required_fields):
            return False

        # Validate project exists in Archon
        if self.mcp_client:
            projects = await self.mcp_client.find_projects(
                project_id=result["project_id"]
            )
            if not projects:
                return False

        return True

    # ========================================================================
    # Private helper methods
    # ========================================================================

    async def _scout_requirements(self, description: str) -> Dict[str, Any]:
        """
        Use Scout command to analyze project requirements.

        Args:
            description: Project description

        Returns:
            Scout analysis results
        """
        if not self.phase1_executor:
            raise ValueError("Phase1CommandExecutor not initialized")

        return await self.phase1_executor.execute_scout(description)

    async def _detect_project_type(
        self,
        scout_result: Dict[str, Any]
    ) -> str:
        """
        Detect project type from scout results.

        Args:
            scout_result: Results from scout phase

        Returns:
            Project type: "landing_page" or "saas_app"
        """
        from agents.genesis_setup.core.project_detector import ProjectTypeDetector

        detector = ProjectTypeDetector()

        # Extract description from scout results
        description = scout_result.get("input", "")

        # Detect project type
        detection_result = detector.detect_project_type(
            description,
            scout_results=scout_result
        )

        self._log(f"Detected project type: {detection_result['project_type'].value}")
        self._log(f"Confidence: {detection_result['confidence']:.0%}")
        self._log(f"Reasoning: {detection_result['reasoning']}")

        return detection_result['project_type'].value

    async def _create_archon_project(
        self,
        description: str,
        project_type: str
    ) -> Dict[str, Any]:
        """
        Create project in Archon.

        Args:
            description: Project description
            project_type: Detected project type

        Returns:
            Created project dictionary
        """
        if not self.mcp_client:
            raise ValueError("ArchonMCPClient not initialized")

        return await self.mcp_client.create_project(
            title=f"Genesis {project_type.replace('_', ' ').title()}",
            description=description,
            features=[]
        )

    async def _initialize_repository(
        self,
        project_type: str,
        project_id: str
    ) -> str:
        """
        Initialize Git repository with Genesis template.

        Args:
            project_type: Type of project
            project_id: Archon project ID

        Returns:
            Repository URL or path
        """
        import subprocess
        from pathlib import Path

        # Determine project directory
        project_name = f"genesis-{project_type}-{project_id}"
        project_path = Path.cwd() / "generated" / project_name

        # Create project directory
        project_path.mkdir(parents=True, exist_ok=True)
        self._log(f"Created project directory: {project_path}")

        # Check if already a git repo
        git_dir = project_path / ".git"
        if not git_dir.exists():
            # Initialize git repository
            subprocess.run(
                ["git", "init"],
                cwd=project_path,
                check=True,
                capture_output=True
            )
            self._log("Initialized Git repository")

            # Create initial commit
            readme_path = project_path / "README.md"
            readme_path.write_text(f"# {project_name}\n\nGenesis {project_type} project\n")

            subprocess.run(
                ["git", "add", "README.md"],
                cwd=project_path,
                check=True,
                capture_output=True
            )

            subprocess.run(
                ["git", "commit", "-m", "Initial commit: Genesis project setup"],
                cwd=project_path,
                check=True,
                capture_output=True
            )
            self._log("Created initial commit")
        else:
            self._log("Git repository already exists")

        # Return local path (could be GitHub URL in production)
        return str(project_path)

    async def _configure_services(
        self,
        services: list,
        project_type: str
    ) -> list:
        """
        Configure external services.

        Args:
            services: List of services to configure
            project_type: Type of project

        Returns:
            List of successfully configured services
        """
        # TODO: Implement service configuration
        return []
