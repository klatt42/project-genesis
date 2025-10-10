"""
Archon MCP Client implementation.

Provides programmatic access to Archon MCP tools:
- archon:find_projects / archon:manage_project
- archon:find_tasks / archon:manage_task
- archon:find_documents / archon:manage_document
- archon:rag_search_knowledge_base
"""

import httpx
from typing import Any, Dict, List, Optional
from datetime import datetime


class ArchonMCPClient:
    """
    Client for interacting with Archon MCP server and API.

    Provides high-level methods for:
    - Project management
    - Task management
    - Document management
    - Knowledge base search
    """

    def __init__(
        self,
        mcp_url: str = "http://localhost:8051",
        api_url: str = "http://localhost:8181"
    ):
        """
        Initialize Archon MCP client.

        Args:
            mcp_url: URL for Archon MCP server
            api_url: URL for Archon API server
        """
        self.mcp_url = mcp_url.rstrip("/")
        self.api_url = api_url.rstrip("/")
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    # ============================================================================
    # PROJECT MANAGEMENT
    # ============================================================================

    async def find_projects(
        self,
        search: Optional[str] = None,
        project_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Find projects using MCP find_projects tool.

        Args:
            search: Search term for project title/description
            project_id: Specific project ID to retrieve

        Returns:
            List of project dictionaries
        """
        url = f"{self.api_url}/api/projects"
        params = {}
        if search:
            params["search"] = search
        if project_id:
            url = f"{url}/{project_id}"

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return [data] if project_id else data
        except Exception as e:
            print(f"Error finding projects: {e}")
            return []

    async def create_project(
        self,
        title: str,
        description: str = "",
        github_repo: Optional[str] = None,
        features: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Create a new project using MCP manage_project tool.

        Args:
            title: Project title
            description: Project description
            github_repo: GitHub repository URL
            features: List of feature names

        Returns:
            Created project dictionary
        """
        url = f"{self.api_url}/api/projects"
        payload = {
            "title": title,
            "description": description
        }
        if github_repo:
            payload["github_repo"] = github_repo
        if features:
            payload["features"] = features

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error creating project: {e}")
            raise

    async def update_project(
        self,
        project_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        features: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Update an existing project.

        Args:
            project_id: Project ID to update
            title: New title (optional)
            description: New description (optional)
            features: New features list (optional)

        Returns:
            Updated project dictionary
        """
        url = f"{self.api_url}/api/projects/{project_id}"
        payload = {}
        if title:
            payload["title"] = title
        if description:
            payload["description"] = description
        if features is not None:
            payload["features"] = features

        try:
            response = await self.client.patch(url, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error updating project: {e}")
            raise

    # ============================================================================
    # TASK MANAGEMENT
    # ============================================================================

    async def find_tasks(
        self,
        project_id: Optional[str] = None,
        status: Optional[str] = None,
        task_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Find tasks using MCP find_tasks tool.

        Args:
            project_id: Filter by project ID
            status: Filter by status (todo, doing, review, done)
            task_id: Specific task ID to retrieve

        Returns:
            List of task dictionaries
        """
        url = f"{self.api_url}/api/tasks"
        params = {}
        if project_id:
            params["project_id"] = project_id
        if status:
            params["status"] = status
        if task_id:
            url = f"{url}/{task_id}"

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return [data] if task_id else data
        except Exception as e:
            print(f"Error finding tasks: {e}")
            return []

    async def create_task(
        self,
        title: str,
        description: str = "",
        project_id: Optional[str] = None,
        status: str = "todo",
        assignee: str = "Archon"
    ) -> Dict[str, Any]:
        """
        Create a new task using MCP manage_task tool.

        Args:
            title: Task title
            description: Task description
            project_id: Project ID to associate with
            status: Task status (todo, doing, review, done)
            assignee: Who the task is assigned to

        Returns:
            Created task dictionary
        """
        url = f"{self.api_url}/api/tasks"
        payload = {
            "title": title,
            "description": description,
            "status": status,
            "assignee": assignee
        }
        if project_id:
            payload["project_id"] = project_id

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error creating task: {e}")
            raise

    async def update_task(
        self,
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[str] = None,
        assignee: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update an existing task.

        Args:
            task_id: Task ID to update
            title: New title (optional)
            description: New description (optional)
            status: New status (optional)
            assignee: New assignee (optional)

        Returns:
            Updated task dictionary
        """
        url = f"{self.api_url}/api/tasks/{task_id}"
        payload = {}
        if title:
            payload["title"] = title
        if description:
            payload["description"] = description
        if status:
            payload["status"] = status
        if assignee:
            payload["assignee"] = assignee

        try:
            response = await self.client.patch(url, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error updating task: {e}")
            raise

    # ============================================================================
    # KNOWLEDGE BASE / RAG SEARCH
    # ============================================================================

    async def search_knowledge_base(
        self,
        query: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search knowledge base using RAG.

        Args:
            query: Search query
            top_k: Number of results to return

        Returns:
            List of relevant document chunks
        """
        # Note: This would use the MCP tool archon:rag_search_knowledge_base
        # For now, we'll use the API directly if available
        url = f"{self.api_url}/api/rag/search"
        payload = {
            "query": query,
            "top_k": top_k
        }

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error searching knowledge base: {e}")
            return []

    async def search_code_examples(
        self,
        query: str,
        language: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for code examples in knowledge base.

        Args:
            query: Search query
            language: Filter by programming language
            top_k: Number of results to return

        Returns:
            List of relevant code examples
        """
        url = f"{self.api_url}/api/code-examples/search"
        payload = {
            "query": query,
            "top_k": top_k
        }
        if language:
            payload["language"] = language

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error searching code examples: {e}")
            return []

    # ============================================================================
    # UTILITY METHODS
    # ============================================================================

    async def health_check(self) -> bool:
        """
        Check if Archon services are healthy.

        Returns:
            True if services are accessible
        """
        try:
            # Check API health
            response = await self.client.get(f"{self.api_url}/health")
            api_healthy = response.status_code == 200

            # Check MCP health
            response = await self.client.get(f"{self.mcp_url}/health")
            mcp_healthy = response.status_code == 200

            return api_healthy and mcp_healthy
        except Exception as e:
            print(f"Health check failed: {e}")
            return False

    def __repr__(self) -> str:
        return f"ArchonMCPClient(api={self.api_url}, mcp={self.mcp_url})"
