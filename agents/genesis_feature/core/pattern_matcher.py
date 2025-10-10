"""
Pattern Matcher for GenesisFeatureAgent.

Intelligent matching of feature requests to Genesis patterns.
"""

from typing import Dict, Any, Optional, List
from agents.genesis_feature.core.pattern_library import GenesisPatternLibrary, GenesisPattern


class PatternMatcher:
    """
    Intelligent pattern matching for feature implementation.

    Uses multiple strategies:
    1. Keyword matching
    2. Semantic similarity (feature name vs pattern name)
    3. Category filtering
    4. Confidence scoring
    """

    def __init__(self):
        self.pattern_library = GenesisPatternLibrary()
        self.confidence_threshold = 0.5  # 50% confidence required

    def match_pattern(
        self,
        feature_name: str,
        description: str = "",
        project_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Match feature request to best Genesis pattern.

        Args:
            feature_name: Name of feature to implement
            description: Feature description
            project_type: Optional project type hint ('landing_page' or 'saas_app')

        Returns:
            Dictionary with:
                - pattern: Matched GenesisPattern
                - confidence: Match confidence (0.0 to 1.0)
                - reasoning: Explanation of match
                - alternatives: List of alternative patterns
        """
        # Find best matching pattern
        pattern = self.pattern_library.find_pattern(
            feature_name,
            description,
            category=project_type
        )

        if pattern:
            confidence = self._calculate_confidence(
                feature_name,
                description,
                pattern
            )
            reasoning = self._explain_match(feature_name, pattern)
            alternatives = self._find_alternatives(feature_name, pattern, project_type)

            return {
                "pattern": pattern,
                "confidence": confidence,
                "reasoning": reasoning,
                "alternatives": alternatives[:3]  # Top 3 alternatives
            }
        else:
            # No pattern found - use generic pattern
            return self._create_generic_pattern(feature_name, description, project_type)

    def _calculate_confidence(
        self,
        feature_name: str,
        description: str,
        pattern: GenesisPattern
    ) -> float:
        """Calculate confidence score for pattern match"""
        search_text = f"{feature_name} {description}".lower()

        score = 0.0

        # Keyword matching (40% weight)
        keyword_matches = sum(1 for kw in pattern.keywords if kw in search_text)
        keyword_score = keyword_matches / len(pattern.keywords) if pattern.keywords else 0
        score += keyword_score * 0.4

        # Name similarity (30% weight)
        if feature_name.lower() in pattern.name.lower():
            score += 0.3
        elif any(word in pattern.name.lower() for word in feature_name.lower().split()):
            score += 0.15

        # Description match (30% weight)
        desc_words = description.lower().split()
        pattern_desc_words = pattern.description.lower().split()
        common_words = set(desc_words) & set(pattern_desc_words)
        if desc_words:
            desc_score = len(common_words) / len(desc_words)
            score += desc_score * 0.3

        return min(score, 1.0)

    def _explain_match(
        self,
        feature_name: str,
        pattern: GenesisPattern
    ) -> str:
        """Generate explanation for pattern match"""
        matched_keywords = [
            kw for kw in pattern.keywords
            if kw in feature_name.lower()
        ]

        if matched_keywords:
            return (
                f"Matched to '{pattern.name}' pattern based on keywords: "
                f"{', '.join(matched_keywords[:3])}"
            )
        else:
            return f"Matched to '{pattern.name}' pattern based on feature description"

    def _find_alternatives(
        self,
        feature_name: str,
        primary_pattern: GenesisPattern,
        project_type: Optional[str]
    ) -> List[GenesisPattern]:
        """Find alternative patterns that could also work"""
        alternatives = []

        for pattern in self.pattern_library.list_all_patterns():
            # Skip the primary pattern
            if pattern.id == primary_pattern.id:
                continue

            # Skip wrong category if specified
            if project_type and pattern.category != project_type:
                continue

            # Check if any keywords match
            if any(kw in feature_name.lower() for kw in pattern.keywords):
                alternatives.append(pattern)

        # Sort by keyword match count
        alternatives.sort(
            key=lambda p: sum(1 for kw in p.keywords if kw in feature_name.lower()),
            reverse=True
        )

        return alternatives

    def _create_generic_pattern(
        self,
        feature_name: str,
        description: str,
        project_type: Optional[str]
    ) -> Dict[str, Any]:
        """Create a generic pattern when no match is found"""
        # Determine category based on project type
        category = project_type if project_type else "saas_app"

        # Create generic pattern
        generic_pattern = GenesisPattern(
            id=f"custom_{feature_name.lower().replace(' ', '_')}",
            name=feature_name,
            category=category,
            description=description or f"Custom {feature_name} implementation",
            keywords=[],
            components=[feature_name.replace(" ", "")],
            files_to_create=[
                f"components/{feature_name.replace(' ', '')}.tsx",
                f"app/api/{feature_name.lower().replace(' ', '-')}/route.ts"
            ],
            dependencies=["tailwindcss"],
            estimated_time_minutes=30,
            complexity="medium"
        )

        return {
            "pattern": generic_pattern,
            "confidence": 0.3,  # Low confidence for generic pattern
            "reasoning": "No exact pattern match - using generic component pattern",
            "alternatives": []
        }

    def suggest_related_features(
        self,
        implemented_features: List[str],
        project_type: str
    ) -> List[GenesisPattern]:
        """
        Suggest related features based on what's been implemented.

        Args:
            implemented_features: List of already implemented features
            project_type: Project type ('landing_page' or 'saas_app')

        Returns:
            List of suggested GenesisPatterns
        """
        # Get all patterns for project type
        available_patterns = self.pattern_library.get_patterns_by_category(project_type)

        # Filter out already implemented
        implemented_ids = {f.lower().replace(" ", "_") for f in implemented_features}
        suggestions = [
            p for p in available_patterns
            if p.id not in implemented_ids
        ]

        # Sort by complexity (simple first)
        complexity_order = {"simple": 0, "medium": 1, "complex": 2}
        suggestions.sort(key=lambda p: complexity_order.get(p.complexity, 1))

        return suggestions[:5]  # Top 5 suggestions

    def estimate_implementation_time(
        self,
        features: List[str],
        project_type: str
    ) -> Dict[str, Any]:
        """
        Estimate total implementation time for a list of features.

        Args:
            features: List of feature names
            project_type: Project type

        Returns:
            Dictionary with time estimates
        """
        total_minutes = 0
        feature_estimates = []

        for feature_name in features:
            match_result = self.match_pattern(feature_name, "", project_type)
            pattern = match_result["pattern"]

            feature_estimates.append({
                "feature": feature_name,
                "pattern": pattern.name,
                "minutes": pattern.estimated_time_minutes,
                "complexity": pattern.complexity
            })

            total_minutes += pattern.estimated_time_minutes

        # Add setup overhead (15 minutes)
        setup_time = 15

        # Calculate parallel execution time (assuming 3 parallel agents)
        sequential_time = total_minutes
        parallel_time = setup_time + (total_minutes // 3) + (total_minutes % 3)

        return {
            "total_features": len(features),
            "setup_time_minutes": setup_time,
            "sequential_time_minutes": sequential_time,
            "parallel_time_minutes": parallel_time,
            "speedup": sequential_time / parallel_time if parallel_time > 0 else 1.0,
            "feature_estimates": feature_estimates
        }
