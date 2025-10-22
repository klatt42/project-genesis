"""
Project Type Detection for GenesisSetupAgent.

Analyzes project requirements to determine the appropriate Genesis template:
- Landing Page: Marketing sites, lead generation, product launches
- SaaS App: Multi-tenant applications, dashboards, user management
"""

from typing import Dict, Any, Optional
from enum import Enum


class ProjectType(Enum):
    """Supported Genesis project types"""
    LANDING_PAGE = "landing_page"
    SAAS_APP = "saas_app"
    UNKNOWN = "unknown"


class ProjectTypeDetector:
    """
    Intelligent project type detection based on requirements analysis.

    Uses keyword matching and feature analysis to determine the most
    appropriate Genesis template.
    """

    # Keywords that indicate landing page projects
    LANDING_PAGE_KEYWORDS = [
        "landing page", "marketing", "lead generation", "lead capture",
        "product launch", "campaign", "promotional", "conversion",
        "email signup", "waitlist", "pre-launch", "coming soon",
        "sales page", "squeeze page", "opt-in", "contact form"
    ]

    # Keywords that indicate SaaS app projects
    SAAS_APP_KEYWORDS = [
        "saas", "application", "dashboard", "user management",
        "authentication", "auth", "login", "signup", "register",
        "multi-tenant", "subscription", "billing", "payment",
        "admin panel", "user portal", "team", "organization",
        "api", "database", "crud", "backend"
    ]

    # Feature patterns for landing pages
    LANDING_PAGE_FEATURES = [
        "hero section", "features showcase", "testimonials",
        "pricing table", "faq", "call to action", "cta",
        "social proof", "trust badges", "video embed"
    ]

    # Feature patterns for SaaS apps
    SAAS_APP_FEATURES = [
        "user dashboard", "profile", "settings", "notifications",
        "team management", "role-based access", "permissions",
        "data visualization", "analytics", "reports",
        "file upload", "export", "import", "api integration"
    ]

    def __init__(self):
        self.confidence_threshold = 0.6  # 60% confidence required

    def detect_project_type(
        self,
        description: str,
        scout_results: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Detect project type from description and scout results.

        Args:
            description: Project description text
            scout_results: Optional results from Scout command

        Returns:
            Dictionary with:
                - project_type: Detected ProjectType
                - confidence: Confidence score (0.0 to 1.0)
                - reasoning: Explanation of detection
                - recommended_template: Template path to use
        """
        description_lower = description.lower()

        # Calculate scores for each project type
        landing_score = self._calculate_landing_page_score(
            description_lower,
            scout_results
        )
        saas_score = self._calculate_saas_app_score(
            description_lower,
            scout_results
        )

        # Determine project type based on scores
        if landing_score > saas_score and landing_score >= self.confidence_threshold:
            project_type = ProjectType.LANDING_PAGE
            confidence = landing_score
            reasoning = self._explain_landing_page_detection(description_lower)
        elif saas_score > landing_score and saas_score >= self.confidence_threshold:
            project_type = ProjectType.SAAS_APP
            confidence = saas_score
            reasoning = self._explain_saas_app_detection(description_lower)
        else:
            # Default to SaaS if unclear (more common use case)
            project_type = ProjectType.SAAS_APP
            confidence = 0.5
            reasoning = "Defaulting to SaaS app (insufficient indicators for landing page)"

        return {
            "project_type": project_type,
            "confidence": confidence,
            "reasoning": reasoning,
            "recommended_template": self._get_template_path(project_type),
            "scores": {
                "landing_page": landing_score,
                "saas_app": saas_score
            }
        }

    def _calculate_landing_page_score(
        self,
        description: str,
        scout_results: Optional[Dict[str, Any]]
    ) -> float:
        """Calculate confidence score for landing page project type"""
        score = 0.0
        matches = []

        # Check keywords
        for keyword in self.LANDING_PAGE_KEYWORDS:
            if keyword in description:
                score += 0.15
                matches.append(keyword)

        # Check feature patterns
        for feature in self.LANDING_PAGE_FEATURES:
            if feature in description:
                score += 0.1
                matches.append(f"feature:{feature}")

        # Penalize if SaaS indicators are present
        for keyword in self.SAAS_APP_KEYWORDS[:5]:  # Check top SaaS keywords
            if keyword in description:
                score -= 0.2

        # Boost from scout results if available
        if scout_results:
            scout_text = str(scout_results).lower()
            if "landing page" in scout_text or "marketing" in scout_text:
                score += 0.2

        # Normalize score to 0-1 range
        return min(max(score, 0.0), 1.0)

    def _calculate_saas_app_score(
        self,
        description: str,
        scout_results: Optional[Dict[str, Any]]
    ) -> float:
        """Calculate confidence score for SaaS app project type"""
        score = 0.0
        matches = []

        # Check keywords
        for keyword in self.SAAS_APP_KEYWORDS:
            if keyword in description:
                score += 0.15
                matches.append(keyword)

        # Check feature patterns
        for feature in self.SAAS_APP_FEATURES:
            if feature in description:
                score += 0.1
                matches.append(f"feature:{feature}")

        # Penalize if landing page indicators are strong
        for keyword in self.LANDING_PAGE_KEYWORDS[:5]:
            if keyword in description:
                score -= 0.15

        # Boost from scout results if available
        if scout_results:
            scout_text = str(scout_results).lower()
            if "saas" in scout_text or "application" in scout_text:
                score += 0.2

        # Normalize score to 0-1 range
        return min(max(score, 0.0), 1.0)

    def _explain_landing_page_detection(self, description: str) -> str:
        """Generate explanation for landing page detection"""
        indicators = []

        for keyword in self.LANDING_PAGE_KEYWORDS:
            if keyword in description:
                indicators.append(f"'{keyword}'")
                if len(indicators) >= 3:
                    break

        if indicators:
            return f"Landing page indicators found: {', '.join(indicators)}"
        return "Project description suggests a landing page"

    def _explain_saas_app_detection(self, description: str) -> str:
        """Generate explanation for SaaS app detection"""
        indicators = []

        for keyword in self.SAAS_APP_KEYWORDS:
            if keyword in description:
                indicators.append(f"'{keyword}'")
                if len(indicators) >= 3:
                    break

        if indicators:
            return f"SaaS app indicators found: {', '.join(indicators)}"
        return "Project description suggests a SaaS application"

    def _get_template_path(self, project_type: ProjectType) -> str:
        """Get template path for project type"""
        template_map = {
            ProjectType.LANDING_PAGE: "boilerplate/landing-page",
            ProjectType.SAAS_APP: "boilerplate/saas-app",
            ProjectType.UNKNOWN: "boilerplate/saas-app"  # Default
        }
        return template_map.get(project_type, "boilerplate/saas-app")

    def suggest_features(
        self,
        project_type: ProjectType
    ) -> list:
        """
        Suggest initial features based on project type.

        Args:
            project_type: Detected project type

        Returns:
            List of recommended initial features
        """
        if project_type == ProjectType.LANDING_PAGE:
            return [
                "hero_section",
                "features_showcase",
                "contact_form",
                "social_proof"
            ]
        elif project_type == ProjectType.SAAS_APP:
            return [
                "user_authentication",
                "user_dashboard",
                "settings_page",
                "api_routes"
            ]
        else:
            return ["user_authentication", "dashboard"]
