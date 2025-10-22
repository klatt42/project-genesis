#!/usr/bin/env python3
"""
Archon Bridge - Direct API integration for Project Genesis
Creates and manages Archon projects and tasks programmatically
"""

import json
import requests
from datetime import datetime
from typing import List, Dict, Optional

class ArchonBridge:
    """Bridge to Archon API for project and task management"""

    def __init__(self, base_url: str = "http://localhost:8181"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"

    def create_project(
        self,
        title: str,
        description: str,
        github_repo: Optional[str] = None
    ) -> Dict:
        """
        Create new project in Archon

        Args:
            title: Project title
            description: Project description
            github_repo: Optional GitHub repository URL

        Returns:
            Project data with ID
        """
        endpoint = f"{self.api_url}/projects"

        payload = {
            "title": title,
            "description": description
        }

        if github_repo:
            payload["github_repo"] = github_repo

        response = requests.post(endpoint, json=payload)

        if response.status_code == 200:
            data = response.json()
            # Handle progress_id if async creation
            if "progress_id" in data:
                return self._poll_progress(data["progress_id"])
            return data
        else:
            raise Exception(f"Failed to create project: {response.text}")

    def _poll_progress(self, progress_id: str, max_attempts: int = 10) -> Dict:
        """Poll progress endpoint for async operations"""
        import time

        endpoint = f"{self.api_url}/progress/{progress_id}"

        for _ in range(max_attempts):
            response = requests.get(endpoint)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "completed":
                    return data.get("result", {})
                elif data.get("status") == "failed":
                    raise Exception(f"Operation failed: {data.get('error')}")
            time.sleep(1)

        raise Exception("Progress polling timeout")

    def add_tasks(self, project_id: str, tasks: List[Dict]) -> List[Dict]:
        """
        Add multiple tasks to project

        Args:
            project_id: Archon project ID
            tasks: List of task dicts with title, description, status

        Returns:
            List of created task data
        """
        created_tasks = []

        for task in tasks:
            created = self.add_task(
                project_id=project_id,
                title=task["title"],
                description=task.get("description", ""),
                status=task.get("status", "pending")
            )
            created_tasks.append(created)

        return created_tasks

    def add_task(
        self,
        project_id: str,
        title: str,
        description: str = "",
        status: str = "pending"
    ) -> Dict:
        """
        Add single task to project

        Args:
            project_id: Archon project ID
            title: Task title
            description: Task description
            status: Task status (pending/in_progress/completed)

        Returns:
            Created task data
        """
        endpoint = f"{self.api_url}/projects/{project_id}/tasks"

        payload = {
            "title": title,
            "description": description,
            "status": status
        }

        response = requests.post(endpoint, json=payload)

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to create task: {response.text}")

    def update_task_status(
        self,
        project_id: str,
        task_id: str,
        status: str
    ) -> Dict:
        """Update task status"""
        endpoint = f"{self.api_url}/projects/{project_id}/tasks/{task_id}"

        payload = {"status": status}
        response = requests.patch(endpoint, json=payload)

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to update task: {response.text}")

    def get_project(self, project_id: str) -> Dict:
        """Get project details"""
        endpoint = f"{self.api_url}/projects/{project_id}"
        response = requests.get(endpoint)

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to get project: {response.text}")

    def list_projects(self) -> List[Dict]:
        """List all projects"""
        endpoint = f"{self.api_url}/projects"
        response = requests.get(endpoint)

        if response.status_code == 200:
            return response.json().get("projects", [])
        else:
            raise Exception(f"Failed to list projects: {response.text}")


def create_genesis_phase1_project():
    """
    Create Project Genesis - Claude Code 2.0 Integration project in Archon
    with all Phase 1 tasks
    """
    bridge = ArchonBridge()

    # Create project
    project = bridge.create_project(
        title="Project Genesis - Claude Code 2.0 Integration",
        description="Integration of Claude Code 2.0 Scout-Plan-Build workflow with Project Genesis framework. Includes agentic command files, context loading strategy, and Archon integration.",
        github_repo="https://github.com/klatt42/project-genesis"
    )

    project_id = project.get("project", {}).get("id") or project.get("id")

    print(f"✅ Created project: {project_id}")

    # Define Phase 1 tasks
    tasks = [
        {
            "title": "Create Scout-Plan-Build Command Files",
            "description": "Create 4 Claude Code command files: scout-genesis-pattern, plan-genesis-implementation, build-genesis-feature, generate-transition",
            "status": "completed"
        },
        {
            "title": "Create Context Loading Strategy Documentation",
            "description": "Document priority-based context loading (P0/P1/P2/P3) for 50-60% token savings",
            "status": "completed"
        },
        {
            "title": "Create Thread Transition Template V2",
            "description": "Enhanced template for <2 minute context restoration between sessions",
            "status": "completed"
        },
        {
            "title": "Create Project Genesis Boilerplate Structure",
            "description": "Initialize boilerplate directories for landing-page and saas-app templates",
            "status": "completed"
        },
        {
            "title": "Create Archon Integration Bridge",
            "description": "Python script for direct Archon API interaction, project/task management",
            "status": "in_progress"
        },
        {
            "title": "Update CLAUDE_CODE_INSTRUCTIONS.md",
            "description": "Add Scout-Plan-Build workflow section with usage examples",
            "status": "pending"
        },
        {
            "title": "Update PROJECT_KICKOFF_CHECKLIST.md",
            "description": "Add context loading configuration section",
            "status": "pending"
        },
        {
            "title": "Update CHANGELOG.md",
            "description": "Document Phase 1 changes and features",
            "status": "pending"
        },
        {
            "title": "Create Initial Git Commit",
            "description": "Commit all Phase 1 artifacts to project-genesis repository",
            "status": "pending"
        },
        {
            "title": "Verify Archon Dashboard Integration",
            "description": "Confirm project and tasks visible in Archon UI at localhost:3737",
            "status": "pending"
        }
    ]

    # Add tasks
    created_tasks = bridge.add_tasks(project_id, tasks)

    print(f"✅ Created {len(created_tasks)} tasks")
    print(f"\n🎯 View in Archon Dashboard: http://localhost:3737")
    print(f"📋 Project ID: {project_id}")

    return {
        "project_id": project_id,
        "tasks": created_tasks,
        "dashboard_url": "http://localhost:3737"
    }


if __name__ == "__main__":
    try:
        result = create_genesis_phase1_project()

        print("\n" + "="*50)
        print("Phase 1 Project Created in Archon!")
        print("="*50)
        print(f"\nProject ID: {result['project_id']}")
        print(f"Tasks Created: {len(result['tasks'])}")
        print(f"\n🌐 Archon Dashboard: {result['dashboard_url']}")
        print("\nNext: Complete pending tasks and verify in dashboard")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Verify Archon is running: docker ps | grep archon")
        print("2. Check Archon API: curl http://localhost:8181/health")
        print("3. Review Archon logs: docker logs Archon-Server")
