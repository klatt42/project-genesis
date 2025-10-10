"""
Genesis Pattern Library for autonomous feature implementation.

Comprehensive library of proven Genesis patterns for:
- Landing pages (hero, features, forms, social proof)
- SaaS applications (auth, dashboard, team management, API)
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass


@dataclass
class GenesisPattern:
    """Genesis pattern definition"""
    id: str
    name: str
    category: str  # 'landing_page' or 'saas_app'
    description: str
    keywords: List[str]
    components: List[str]
    files_to_create: List[str]
    dependencies: List[str]
    estimated_time_minutes: int
    complexity: str  # 'simple', 'medium', 'complex'


class GenesisPatternLibrary:
    """
    Comprehensive library of Genesis implementation patterns.

    Patterns are based on proven templates from Genesis documentation
    and follow best practices for Next.js, React, TypeScript, and Tailwind.
    """

    def __init__(self):
        self.patterns = self._load_patterns()

    def _load_patterns(self) -> Dict[str, GenesisPattern]:
        """Load all available Genesis patterns"""
        patterns = {}

        # Landing Page Patterns
        patterns.update(self._get_landing_page_patterns())

        # SaaS App Patterns
        patterns.update(self._get_saas_app_patterns())

        return patterns

    # ========================================================================
    # LANDING PAGE PATTERNS
    # ========================================================================

    def _get_landing_page_patterns(self) -> Dict[str, GenesisPattern]:
        """Get all landing page patterns"""
        return {
            "lp_hero_section": GenesisPattern(
                id="lp_hero_section",
                name="Hero Section",
                category="landing_page",
                description="Main hero section with headline, subheadline, CTA, and optional image/video",
                keywords=["hero", "header", "headline", "banner", "above fold", "cta", "call to action"],
                components=["Hero", "CTAButton", "VideoEmbed"],
                files_to_create=[
                    "components/Hero.tsx",
                    "components/ui/Button.tsx"
                ],
                dependencies=["tailwindcss", "lucide-react"],
                estimated_time_minutes=15,
                complexity="simple"
            ),

            "lp_features_showcase": GenesisPattern(
                id="lp_features_showcase",
                name="Features Showcase",
                category="landing_page",
                description="Grid or list of product/service features with icons and descriptions",
                keywords=["features", "benefits", "what we offer", "why us", "advantages"],
                components=["Features", "FeatureCard"],
                files_to_create=[
                    "components/Features.tsx",
                    "components/FeatureCard.tsx"
                ],
                dependencies=["tailwindcss", "lucide-react"],
                estimated_time_minutes=20,
                complexity="simple"
            ),

            "lp_contact_form": GenesisPattern(
                id="lp_contact_form",
                name="Lead Capture Form",
                category="landing_page",
                description="Contact/lead capture form with validation and email integration",
                keywords=["contact", "form", "lead", "signup", "email capture", "subscribe", "newsletter"],
                components=["ContactForm", "Input", "Textarea", "Button"],
                files_to_create=[
                    "components/ContactForm.tsx",
                    "components/ui/Input.tsx",
                    "components/ui/Textarea.tsx",
                    "app/api/contact/route.ts",
                    "lib/email.ts"
                ],
                dependencies=["react-hook-form", "zod", "@hookform/resolvers", "resend"],
                estimated_time_minutes=30,
                complexity="medium"
            ),

            "lp_social_proof": GenesisPattern(
                id="lp_social_proof",
                name="Social Proof / Testimonials",
                category="landing_page",
                description="Customer testimonials, reviews, or trust indicators",
                keywords=["testimonials", "reviews", "social proof", "customers", "trust", "ratings"],
                components=["Testimonials", "TestimonialCard", "TrustBadges"],
                files_to_create=[
                    "components/Testimonials.tsx",
                    "components/TestimonialCard.tsx",
                    "lib/testimonials-data.ts"
                ],
                dependencies=["tailwindcss"],
                estimated_time_minutes=15,
                complexity="simple"
            ),

            "lp_pricing_table": GenesisPattern(
                id="lp_pricing_table",
                name="Pricing Table",
                category="landing_page",
                description="Pricing plans comparison table with features and CTAs",
                keywords=["pricing", "plans", "packages", "subscription", "cost", "price"],
                components=["Pricing", "PricingCard"],
                files_to_create=[
                    "components/Pricing.tsx",
                    "components/PricingCard.tsx",
                    "lib/pricing-data.ts"
                ],
                dependencies=["tailwindcss"],
                estimated_time_minutes=20,
                complexity="simple"
            ),

            "lp_faq": GenesisPattern(
                id="lp_faq",
                name="FAQ Section",
                category="landing_page",
                description="Frequently asked questions with collapsible answers",
                keywords=["faq", "questions", "help", "support", "answers"],
                components=["FAQ", "Accordion"],
                files_to_create=[
                    "components/FAQ.tsx",
                    "components/ui/Accordion.tsx",
                    "lib/faq-data.ts"
                ],
                dependencies=["tailwindcss", "@radix-ui/react-accordion"],
                estimated_time_minutes=15,
                complexity="simple"
            ),
        }

    # ========================================================================
    # SAAS APP PATTERNS
    # ========================================================================

    def _get_saas_app_patterns(self) -> Dict[str, GenesisPattern]:
        """Get all SaaS application patterns"""
        return {
            "saas_authentication": GenesisPattern(
                id="saas_authentication",
                name="User Authentication",
                category="saas_app",
                description="Complete auth system with login, signup, password reset, and session management",
                keywords=["auth", "authentication", "login", "signup", "register", "password", "session"],
                components=["LoginForm", "SignupForm", "AuthProvider"],
                files_to_create=[
                    "app/(auth)/login/page.tsx",
                    "app/(auth)/signup/page.tsx",
                    "app/api/auth/[...nextauth]/route.ts",
                    "lib/auth/config.ts",
                    "lib/auth/session.ts",
                    "middleware.ts"
                ],
                dependencies=["next-auth", "bcrypt", "@prisma/client"],
                estimated_time_minutes=45,
                complexity="complex"
            ),

            "saas_dashboard": GenesisPattern(
                id="saas_dashboard",
                name="User Dashboard",
                category="saas_app",
                description="Main user dashboard with navigation, stats, and recent activity",
                keywords=["dashboard", "home", "overview", "stats", "analytics", "main page"],
                components=["Dashboard", "StatCard", "Sidebar", "Navigation"],
                files_to_create=[
                    "app/(dashboard)/dashboard/page.tsx",
                    "components/dashboard/Sidebar.tsx",
                    "components/dashboard/StatCard.tsx",
                    "components/dashboard/RecentActivity.tsx"
                ],
                dependencies=["tailwindcss", "recharts"],
                estimated_time_minutes=30,
                complexity="medium"
            ),

            "saas_settings": GenesisPattern(
                id="saas_settings",
                name="User Settings",
                category="saas_app",
                description="User profile and account settings with preferences",
                keywords=["settings", "preferences", "profile", "account", "configuration"],
                components=["Settings", "SettingsForm", "ProfileUpload"],
                files_to_create=[
                    "app/(dashboard)/settings/page.tsx",
                    "components/settings/ProfileForm.tsx",
                    "components/settings/PasswordForm.tsx",
                    "app/api/user/settings/route.ts"
                ],
                dependencies=["react-hook-form", "zod", "@hookform/resolvers"],
                estimated_time_minutes=25,
                complexity="medium"
            ),

            "saas_team_management": GenesisPattern(
                id="saas_team_management",
                name="Team Management",
                category="saas_app",
                description="Multi-tenant team/organization management with invitations and roles",
                keywords=["team", "organization", "members", "invite", "roles", "permissions", "multi-tenant"],
                components=["TeamList", "MemberCard", "InviteDialog", "RoleSelector"],
                files_to_create=[
                    "app/(dashboard)/team/page.tsx",
                    "components/team/MemberCard.tsx",
                    "components/team/InviteDialog.tsx",
                    "app/api/team/route.ts",
                    "lib/team/permissions.ts"
                ],
                dependencies=["@prisma/client", "zod"],
                estimated_time_minutes=40,
                complexity="complex"
            ),

            "saas_api_routes": GenesisPattern(
                id="saas_api_routes",
                name="API Routes",
                category="saas_app",
                description="RESTful API endpoints for data operations (CRUD)",
                keywords=["api", "endpoints", "rest", "crud", "backend", "routes"],
                components=["API Routes"],
                files_to_create=[
                    "app/api/[resource]/route.ts",
                    "app/api/[resource]/[id]/route.ts",
                    "lib/api/middleware.ts",
                    "lib/api/validators.ts"
                ],
                dependencies=["zod", "@prisma/client"],
                estimated_time_minutes=35,
                complexity="medium"
            ),

            "saas_notifications": GenesisPattern(
                id="saas_notifications",
                name="Notifications System",
                category="saas_app",
                description="In-app notifications with real-time updates and preferences",
                keywords=["notifications", "alerts", "updates", "messages", "real-time"],
                components=["NotificationCenter", "NotificationItem", "NotificationProvider"],
                files_to_create=[
                    "components/notifications/NotificationCenter.tsx",
                    "components/notifications/NotificationItem.tsx",
                    "app/api/notifications/route.ts",
                    "lib/notifications/send.ts"
                ],
                dependencies=["@prisma/client", "pusher-js"],
                estimated_time_minutes=30,
                complexity="medium"
            ),

            "saas_billing": GenesisPattern(
                id="saas_billing",
                name="Subscription Billing",
                category="saas_app",
                description="Stripe integration for subscription management and payments",
                keywords=["billing", "payment", "stripe", "subscription", "checkout", "pricing"],
                components=["BillingPage", "SubscriptionCard", "PaymentForm"],
                files_to_create=[
                    "app/(dashboard)/billing/page.tsx",
                    "app/api/stripe/webhook/route.ts",
                    "app/api/create-checkout/route.ts",
                    "lib/stripe/config.ts",
                    "lib/stripe/webhooks.ts"
                ],
                dependencies=["stripe", "@stripe/stripe-js"],
                estimated_time_minutes=50,
                complexity="complex"
            ),
        }

    # ========================================================================
    # PATTERN MATCHING
    # ========================================================================

    def find_pattern(
        self,
        feature_name: str,
        description: str = "",
        category: Optional[str] = None
    ) -> Optional[GenesisPattern]:
        """
        Find best matching pattern for a feature.

        Args:
            feature_name: Name of the feature to implement
            description: Feature description
            category: Optional category filter ('landing_page' or 'saas_app')

        Returns:
            Best matching GenesisPattern or None
        """
        search_text = f"{feature_name} {description}".lower()

        best_match = None
        best_score = 0.0

        for pattern in self.patterns.values():
            # Skip if category doesn't match
            if category and pattern.category != category:
                continue

            # Calculate match score based on keywords
            score = 0.0
            for keyword in pattern.keywords:
                if keyword in search_text:
                    score += 1.0

            # Boost if feature name closely matches pattern name
            if feature_name.lower() in pattern.name.lower():
                score += 2.0

            # Update best match
            if score > best_score:
                best_score = score
                best_match = pattern

        return best_match if best_score > 0 else None

    def get_pattern_by_id(self, pattern_id: str) -> Optional[GenesisPattern]:
        """Get pattern by ID"""
        return self.patterns.get(pattern_id)

    def get_patterns_by_category(self, category: str) -> List[GenesisPattern]:
        """Get all patterns for a category"""
        return [
            pattern for pattern in self.patterns.values()
            if pattern.category == category
        ]

    def list_all_patterns(self) -> List[GenesisPattern]:
        """Get all available patterns"""
        return list(self.patterns.values())

    def get_pattern_summary(self, pattern: GenesisPattern) -> Dict[str, Any]:
        """Get summary information for a pattern"""
        return {
            "id": pattern.id,
            "name": pattern.name,
            "category": pattern.category,
            "description": pattern.description,
            "complexity": pattern.complexity,
            "estimated_minutes": pattern.estimated_time_minutes,
            "files_count": len(pattern.files_to_create),
            "dependencies_count": len(pattern.dependencies)
        }
