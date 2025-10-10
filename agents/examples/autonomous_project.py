"""
Example: Autonomous Project Development with Phase 2 Agents

This example demonstrates the complete autonomous workflow:
1. GenesisSetupAgent initializes the project
2. CoordinationAgent orchestrates parallel feature implementation
3. GenesisFeatureAgents work in parallel on different features

Expected result: Complete project in ~40-60 minutes (vs 225 minutes baseline)
"""

import asyncio
from agents.coordination.core import CoordinationAgent


async def main():
    """
    Autonomous project development example.

    This demonstrates:
    - Project type detection
    - Parallel feature implementation
    - Real-time progress monitoring
    - 2-3x speedup through parallelization
    """

    print("=" * 60)
    print("PHASE 2 AUTONOMOUS PROJECT DEVELOPMENT")
    print("=" * 60)
    print()

    # Define project specification
    project_spec = {
        "description": """
            Build a SaaS application for task management with team collaboration.
            Users should be able to create tasks, assign them to team members,
            track progress, and collaborate with comments.
        """,
        "features": [
            "user authentication",
            "user dashboard",
            "team management",
            "task tracking",
            "notifications"
        ],
        "project_type": "saas_app",  # Optional hint
        "max_parallel": 3  # Maximum parallel feature agents
    }

    print("📋 Project Specification:")
    print(f"   Description: {project_spec['description'].strip()}")
    print(f"   Features: {', '.join(project_spec['features'])}")
    print(f"   Max Parallel Agents: {project_spec['max_parallel']}")
    print()

    # Create and initialize coordination agent
    print("🤖 Initializing CoordinationAgent...")
    ca = CoordinationAgent(agent_id="ca-main")
    await ca.initialize()
    print("✅ CoordinationAgent ready")
    print()

    # Execute autonomous project development
    print("🚀 Starting autonomous project development...")
    print()

    try:
        result = await ca.execute(project_spec)

        print()
        print("=" * 60)
        print("✅ PROJECT DEVELOPMENT COMPLETE!")
        print("=" * 60)
        print()

        # Display results
        print("📊 Results:")
        print(f"   Project ID: {result['project_id']}")
        print(f"   Features Completed: {len(result['features_completed'])}")
        print(f"   Total Time: {result['total_time_seconds'] // 60} minutes")
        print(f"   Parallel Speedup: {result['parallel_speedup']:.2f}x")
        print()

        print("✅ Completed Features:")
        for feature in result['features_completed']:
            print(f"   - {feature}")
        print()

        # Show validation results
        validation = result.get('validation', {})
        print("🔍 Validation:")
        print(f"   Project Created: {'✅' if validation.get('project_created') else '❌'}")
        print(f"   Features Completed: {validation.get('features_completed', 0)}")
        print(f"   All Agents Succeeded: {'✅' if validation.get('all_agents_succeeded') else '❌'}")
        print()

        # Show agent execution details
        print("🤖 Agent Executions:")
        for agent_log in result.get('agent_executions', []):
            print(f"   - {agent_log['agent_type']} ({agent_log['agent_id']})")
            print(f"     Status: {agent_log['status']}")
            print(f"     Tasks: {agent_log['metrics']['tasks_succeeded']}/{agent_log['metrics']['tasks_executed']}")
        print()

        # Performance comparison
        estimated_baseline = 15 + (len(project_spec['features']) * 30)  # Minutes
        actual_time = result['total_time_seconds'] // 60
        improvement = ((estimated_baseline - actual_time) / estimated_baseline) * 100

        print("📈 Performance Comparison:")
        print(f"   Baseline (sequential): ~{estimated_baseline} minutes")
        print(f"   Actual (parallel): {actual_time} minutes")
        print(f"   Improvement: {improvement:.1f}%")
        print()

        # Next steps
        print("🎯 Next Steps:")
        print("   1. Review code in Archon dashboard: http://localhost:3737")
        print(f"   2. View project: http://localhost:3737/projects/{result['project_id']}")
        print("   3. Check tasks and implementation details")
        print("   4. Test the implemented features")

    except Exception as e:
        print(f"❌ Error during execution: {e}")
        import traceback
        traceback.print_exc()


async def simple_feature_example():
    """
    Simpler example: Single feature implementation

    This demonstrates:
    - Pattern matching
    - Code generation
    - Quality validation
    """
    from agents.genesis_feature.core import GenesisFeatureAgent

    print("=" * 60)
    print("SIMPLE FEATURE IMPLEMENTATION EXAMPLE")
    print("=" * 60)
    print()

    # Create feature agent
    gfa = GenesisFeatureAgent(agent_id="gfa-example")
    await gfa.initialize()

    # Define feature to implement
    feature_spec = {
        "feature_name": "contact form",
        "description": "Contact form with name, email, and message fields",
        "project_id": "example-project-123"
    }

    print(f"📝 Implementing: {feature_spec['feature_name']}")
    print(f"   Description: {feature_spec['description']}")
    print()

    # Execute feature implementation
    result = await gfa.execute(feature_spec)

    print("✅ Feature Implementation Complete!")
    print(f"   Pattern Used: {result['pattern_used']}")
    print(f"   Files Created: {len(result['files_created'])}")
    print(f"   Tests Passing: {'✅' if result['tests_passing'] else '❌'}")
    print(f"   Time: {result['implementation_time_seconds']} seconds")


async def pattern_detection_example():
    """
    Example: Pattern detection and matching

    This demonstrates:
    - Project type detection
    - Pattern matching
    - Feature suggestions
    """
    from agents.genesis_setup.core.project_detector import ProjectTypeDetector
    from agents.genesis_feature.core.pattern_matcher import PatternMatcher

    print("=" * 60)
    print("PATTERN DETECTION EXAMPLE")
    print("=" * 60)
    print()

    # Project type detection
    print("🔍 Project Type Detection:")
    detector = ProjectTypeDetector()

    test_cases = [
        "Build a landing page for our new product launch with lead capture",
        "Create a SaaS app for task management with user authentication",
        "Marketing website with hero section and pricing table"
    ]

    for description in test_cases:
        result = detector.detect_project_type(description)
        print(f"\n   Description: {description[:60]}...")
        print(f"   Detected Type: {result['project_type'].value}")
        print(f"   Confidence: {result['confidence']:.0%}")
        print(f"   Reasoning: {result['reasoning']}")

    print()
    print("-" * 60)
    print()

    # Pattern matching
    print("🎯 Pattern Matching:")
    matcher = PatternMatcher()

    features = [
        ("hero section", "landing page with headline and CTA"),
        ("user authentication", "login and signup with password reset"),
        ("pricing table", "show different subscription plans")
    ]

    for feature_name, description in features:
        match = matcher.match_pattern(feature_name, description)
        pattern = match['pattern']
        print(f"\n   Feature: {feature_name}")
        print(f"   Matched Pattern: {pattern.name}")
        print(f"   Confidence: {match['confidence']:.0%}")
        print(f"   Complexity: {pattern.complexity}")
        print(f"   Estimated Time: {pattern.estimated_time_minutes} minutes")

    print()
    print("-" * 60)
    print()

    # Time estimation
    print("⏱️  Implementation Time Estimation:")
    features_list = ["authentication", "dashboard", "team management", "billing"]
    estimates = matcher.estimate_implementation_time(features_list, "saas_app")

    print(f"\n   Features: {', '.join(features_list)}")
    print(f"   Setup Time: {estimates['setup_time_minutes']} minutes")
    print(f"   Sequential Time: {estimates['sequential_time_minutes']} minutes")
    print(f"   Parallel Time: {estimates['parallel_time_minutes']} minutes")
    print(f"   Speedup: {estimates['speedup']:.2f}x")
    print()


if __name__ == "__main__":
    import sys

    print()
    print("🤖 Phase 2 Autonomous Agents - Examples")
    print()

    if len(sys.argv) > 1:
        example = sys.argv[1]

        if example == "simple":
            asyncio.run(simple_feature_example())
        elif example == "pattern":
            asyncio.run(pattern_detection_example())
        elif example == "full":
            asyncio.run(main())
        else:
            print(f"Unknown example: {example}")
            print("Available: simple, pattern, full")
    else:
        print("Available examples:")
        print("  python autonomous_project.py simple   - Single feature implementation")
        print("  python autonomous_project.py pattern  - Pattern detection demo")
        print("  python autonomous_project.py full     - Full autonomous project")
        print()

        # Run pattern detection example by default
        asyncio.run(pattern_detection_example())
