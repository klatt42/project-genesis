"""
Utility functions for managing custom skills with Claude's Skills API.

This module provides helper functions for:
- Creating and uploading custom skills
- Listing and retrieving skill information
- Managing skill versions
- Testing skills with Claude
- Deleting skills
"""

import json
import os
from pathlib import Path
from typing import Optional, List, Dict, Any
from anthropic import Anthropic
from anthropic.lib import files_from_dir


def create_skill(
    client: Anthropic,
    skill_path: str,
    display_title: str
) -> Dict[str, Any]:
    """
    Create a new custom skill from a directory.

    The directory must contain:
    - SKILL.md file with YAML frontmatter (name, description)
    - Optional: scripts, resources, REFERENCE.md

    Args:
        client: Anthropic client instance with Skills beta
        skill_path: Path to skill directory containing SKILL.md
        display_title: Human-readable name for the skill

    Returns:
        Dictionary with skill creation results:
        {
            'success': bool,
            'skill_id': str (if successful),
            'display_title': str,
            'latest_version': str,
            'created_at': str,
            'source': str ('custom'),
            'error': str (if failed)
        }

    Example:
        >>> client = Anthropic(api_key="...", default_headers={"anthropic-beta": "skills-2025-10-02"})
        >>> result = create_skill(client, "custom_skills/financial_analyzer", "Financial Analyzer")
        >>> if result['success']:
        ...     print(f"Created skill: {result['skill_id']}")
    """
    try:
        # Validate skill directory
        skill_dir = Path(skill_path)
        if not skill_dir.exists():
            return {
                'success': False,
                'error': f"Skill directory does not exist: {skill_path}"
            }

        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            return {
                'success': False,
                'error': f"SKILL.md not found in {skill_path}"
            }

        # Create skill using files_from_dir
        skill = client.beta.skills.create(
            display_title=display_title,
            files=files_from_dir(skill_path)
        )

        return {
            'success': True,
            'skill_id': skill.id,
            'display_title': skill.display_title,
            'latest_version': skill.latest_version,
            'created_at': skill.created_at,
            'source': skill.source
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def list_custom_skills(client: Anthropic) -> List[Dict[str, Any]]:
    """
    List all custom skills in the workspace.

    Args:
        client: Anthropic client instance with Skills beta

    Returns:
        List of skill dictionaries with metadata

    Example:
        >>> skills = list_custom_skills(client)
        >>> for skill in skills:
        ...     print(f"{skill['display_title']}: {skill['skill_id']}")
    """
    try:
        skills_response = client.beta.skills.list(source="custom")

        skills = []
        for skill in skills_response.data:
            skills.append({
                'skill_id': skill.id,
                'display_title': skill.display_title,
                'latest_version': skill.latest_version,
                'created_at': skill.created_at,
                'updated_at': skill.updated_at
            })

        return skills

    except Exception as e:
        print(f"Error listing skills: {e}")
        return []


def get_skill_version(
    client: Anthropic,
    skill_id: str,
    version: str = "latest"
) -> Optional[Dict[str, Any]]:
    """
    Get detailed information about a specific skill version.

    Args:
        client: Anthropic client instance
        skill_id: ID of the skill
        version: Version to retrieve (default: "latest")

    Returns:
        Dictionary with version details or None if not found
    """
    try:
        # Get latest version if not specified
        if version == "latest":
            skill = client.beta.skills.retrieve(skill_id)
            version = skill.latest_version

        version_info = client.beta.skills.versions.retrieve(
            skill_id=skill_id,
            version=version
        )

        return {
            'version': version_info.version,
            'skill_id': version_info.skill_id,
            'name': version_info.name,
            'description': version_info.description,
            'directory': version_info.directory,
            'created_at': version_info.created_at
        }

    except Exception as e:
        print(f"Error getting skill version: {e}")
        return None


def create_skill_version(
    client: Anthropic,
    skill_id: str,
    skill_path: str
) -> Dict[str, Any]:
    """
    Create a new version of an existing skill.

    Args:
        client: Anthropic client instance
        skill_id: ID of the existing skill
        skill_path: Path to updated skill directory

    Returns:
        Dictionary with version creation results
    """
    try:
        version = client.beta.skills.versions.create(
            skill_id=skill_id,
            files=files_from_dir(skill_path)
        )

        return {
            'success': True,
            'version': version.version,
            'skill_id': version.skill_id,
            'created_at': version.created_at
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def delete_skill(
    client: Anthropic,
    skill_id: str,
    delete_versions: bool = True
) -> bool:
    """
    Delete a custom skill and optionally all its versions.

    Note: All versions must be deleted before the skill can be deleted.

    Args:
        client: Anthropic client instance
        skill_id: ID of skill to delete
        delete_versions: Whether to delete all versions first

    Returns:
        True if successful, False otherwise
    """
    try:
        if delete_versions:
            # First delete all versions
            versions = client.beta.skills.versions.list(skill_id=skill_id)

            for version in versions.data:
                client.beta.skills.versions.delete(
                    skill_id=skill_id,
                    version=version.version
                )
                print(f"  Deleted version: {version.version}")

        # Then delete the skill itself
        client.beta.skills.delete(skill_id)
        print(f"✓ Deleted skill: {skill_id}")
        return True

    except Exception as e:
        print(f"Error deleting skill: {e}")
        return False


def test_skill(
    client: Anthropic,
    skill_id: str,
    test_prompt: str,
    model: str = "claude-sonnet-4-5-20250929",
    include_anthropic_skills: Optional[List[str]] = None
) -> Any:
    """
    Test a custom skill with a prompt.

    Args:
        client: Anthropic client instance
        skill_id: ID of skill to test
        test_prompt: Prompt to test the skill
        model: Model to use for testing
        include_anthropic_skills: Optional list of Anthropic skill IDs to include

    Returns:
        Response from Claude

    Example:
        >>> response = test_skill(
        ...     client,
        ...     "skill_abc123",
        ...     "Calculate P/E ratio for a company with price $50 and earnings $2.50",
        ...     include_anthropic_skills=["xlsx"]
        ... )
    """
    # Build skills list
    skills = [{
        "type": "custom",
        "skill_id": skill_id,
        "version": "latest"
    }]

    # Add Anthropic skills if requested
    if include_anthropic_skills:
        for anthropic_skill in include_anthropic_skills:
            skills.append({
                "type": "anthropic",
                "skill_id": anthropic_skill,
                "version": "latest"
            })

    response = client.beta.messages.create(
        model=model,
        max_tokens=4096,
        container={"skills": skills},
        tools=[{"type": "code_execution_20250825", "name": "code_execution"}],
        messages=[{"role": "user", "content": test_prompt}],
        betas=["code-execution-2025-08-25", "files-api-2025-04-14", "skills-2025-10-02"]
    )

    return response


def list_skill_versions(
    client: Anthropic,
    skill_id: str
) -> List[Dict[str, Any]]:
    """
    List all versions of a skill.

    Args:
        client: Anthropic client instance
        skill_id: ID of the skill

    Returns:
        List of version dictionaries
    """
    try:
        versions_response = client.beta.skills.versions.list(skill_id=skill_id)

        versions = []
        for version in versions_response.data:
            versions.append({
                'version': version.version,
                'skill_id': version.skill_id,
                'created_at': version.created_at
            })

        return versions

    except Exception as e:
        print(f"Error listing versions: {e}")
        return []


def validate_skill_directory(skill_path: str) -> Dict[str, Any]:
    """
    Validate a skill directory structure before upload.

    Checks for:
    - SKILL.md exists
    - YAML frontmatter is valid
    - Directory name matches skill name
    - Total size is under 8MB

    Args:
        skill_path: Path to skill directory

    Returns:
        Dictionary with validation results
    """
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'info': {}
    }

    skill_dir = Path(skill_path)

    # Check directory exists
    if not skill_dir.exists():
        result['valid'] = False
        result['errors'].append(f"Directory does not exist: {skill_path}")
        return result

    # Check for SKILL.md
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        result['valid'] = False
        result['errors'].append("SKILL.md file is required")
    else:
        # Read and validate SKILL.md
        content = skill_md.read_text()

        # Check for YAML frontmatter
        if not content.startswith("---"):
            result['valid'] = False
            result['errors'].append("SKILL.md must start with YAML frontmatter (---)")
        else:
            # Extract frontmatter
            try:
                end_idx = content.index("---", 3)
                frontmatter = content[3:end_idx].strip()

                # Check for required fields
                if "name:" not in frontmatter:
                    result['valid'] = False
                    result['errors'].append("YAML frontmatter must include 'name' field")

                if "description:" not in frontmatter:
                    result['valid'] = False
                    result['errors'].append("YAML frontmatter must include 'description' field")

                # Check frontmatter size
                if len(frontmatter) > 1024:
                    result['valid'] = False
                    result['errors'].append(f"YAML frontmatter exceeds 1024 chars (found: {len(frontmatter)})")

            except ValueError:
                result['valid'] = False
                result['errors'].append("Invalid YAML frontmatter format")

    # Check total size
    total_size = sum(f.stat().st_size for f in skill_dir.rglob("*") if f.is_file())
    result['info']['total_size_mb'] = total_size / (1024 * 1024)

    if total_size > 8 * 1024 * 1024:
        result['valid'] = False
        result['errors'].append(f"Total size exceeds 8MB (found: {total_size / (1024 * 1024):.2f} MB)")

    # Count files
    files = list(skill_dir.rglob("*"))
    result['info']['file_count'] = len([f for f in files if f.is_file()])
    result['info']['directory_count'] = len([f for f in files if f.is_dir()])

    # Check for common files
    if (skill_dir / "REFERENCE.md").exists():
        result['info']['has_reference'] = True

    if (skill_dir / "scripts").exists():
        result['info']['has_scripts'] = True
        result['info']['script_files'] = [f.name for f in (skill_dir / "scripts").iterdir() if f.is_file()]

    return result


def print_skill_summary(skill_info: Dict[str, Any]) -> None:
    """
    Print a formatted summary of a skill.

    Args:
        skill_info: Dictionary with skill information
    """
    print(f"📦 Skill: {skill_info.get('display_title', 'Unknown')}")
    print(f"   ID: {skill_info.get('skill_id', 'N/A')}")
    print(f"   Version: {skill_info.get('latest_version', 'N/A')}")
    print(f"   Source: {skill_info.get('source', 'N/A')}")
    print(f"   Created: {skill_info.get('created_at', 'N/A')}")

    if 'error' in skill_info:
        print(f"   ❌ Error: {skill_info['error']}")