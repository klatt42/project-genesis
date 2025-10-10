"""
End-to-End Test Suite - Phase 2 Complete System Test

Tests the complete autonomous agent workflow:
1. Project type detection
2. Pattern matching
3. Code generation for all patterns
4. File writing verification
5. Performance benchmarking
"""

import asyncio
import time
from pathlib import Path
from typing import Dict, Any, List

# Test imports
from agents.genesis_setup.core.project_detector import ProjectTypeDetector, ProjectType
from agents.genesis_feature.core.pattern_library import GenesisPatternLibrary
from agents.genesis_feature.core.pattern_matcher import PatternMatcher
from agents.genesis_feature.core.code_generator import CodeGenerator


class TestResults:
    """Track test results."""
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures: List[str] = []

    def record_pass(self, test_name: str):
        self.tests_run += 1
        self.tests_passed += 1
        print(f"  ✅ {test_name}")

    def record_fail(self, test_name: str, error: str):
        self.tests_run += 1
        self.tests_failed += 1
        self.failures.append(f"{test_name}: {error}")
        print(f"  ❌ {test_name}: {error}")

    def summary(self):
        print("\n" + "=" * 70)
        print("TEST SUMMARY")
        print("=" * 70)
        print(f"Tests Run: {self.tests_run}")
        print(f"Passed: {self.tests_passed} ({self.tests_passed/self.tests_run*100:.1f}%)")
        print(f"Failed: {self.tests_failed}")

        if self.failures:
            print("\nFailures:")
            for failure in self.failures:
                print(f"  - {failure}")

        return self.tests_failed == 0


async def test_project_type_detection():
    """Test project type detection."""
    print("\n" + "=" * 70)
    print("TEST 1: Project Type Detection")
    print("=" * 70)

    results = TestResults()
    detector = ProjectTypeDetector()

    # Test cases
    test_cases = [
        ("Build a landing page for our product launch", ProjectType.LANDING_PAGE),
        ("Create a SaaS app with user authentication", ProjectType.SAAS_APP),
        ("Marketing website with hero section", ProjectType.LANDING_PAGE),
        ("Task management app with team collaboration", ProjectType.SAAS_APP),
        ("Product landing page with pricing", ProjectType.LANDING_PAGE),
    ]

    for description, expected_type in test_cases:
        try:
            result = detector.detect_project_type(description)
            detected_type = result['project_type']
            confidence = result['confidence']

            if detected_type == expected_type:
                results.record_pass(f"Detected '{expected_type.value}' ({confidence:.0%} confidence)")
            else:
                results.record_fail(
                    f"Expected '{expected_type.value}'",
                    f"got '{detected_type.value}'"
                )
        except Exception as e:
            results.record_fail(f"Detection failed", str(e))

    return results.summary()


async def test_pattern_matching():
    """Test pattern matching for all patterns."""
    print("\n" + "=" * 70)
    print("TEST 2: Pattern Matching")
    print("=" * 70)

    results = TestResults()
    matcher = PatternMatcher()

    # Test landing page patterns
    lp_tests = [
        ("hero section", "lp_hero_section"),
        ("features showcase", "lp_features_showcase"),
        ("contact form", "lp_contact_form"),
        ("testimonials", "lp_social_proof"),
        ("pricing table", "lp_pricing_table"),
        ("faq section", "lp_faq"),
    ]

    print("\nLanding Page Patterns:")
    for feature_name, expected_id in lp_tests:
        try:
            match = matcher.match_pattern(feature_name, "", "landing_page")
            pattern = match['pattern']

            if pattern.id == expected_id:
                results.record_pass(f"{feature_name} → {pattern.name}")
            else:
                results.record_fail(
                    f"{feature_name}",
                    f"expected {expected_id}, got {pattern.id}"
                )
        except Exception as e:
            results.record_fail(f"{feature_name}", str(e))

    # Test SaaS patterns
    saas_tests = [
        ("user authentication", "saas_authentication"),
        ("dashboard", "saas_dashboard"),
        ("user settings", "saas_settings"),
        ("team management", "saas_team_management"),
        ("api routes", "saas_api_routes"),
        ("notifications", "saas_notifications"),
        ("billing", "saas_billing"),
    ]

    print("\nSaaS App Patterns:")
    for feature_name, expected_id in saas_tests:
        try:
            match = matcher.match_pattern(feature_name, "", "saas_app")
            pattern = match['pattern']

            if pattern.id == expected_id:
                results.record_pass(f"{feature_name} → {pattern.name}")
            else:
                results.record_fail(
                    f"{feature_name}",
                    f"expected {expected_id}, got {pattern.id}"
                )
        except Exception as e:
            results.record_fail(f"{feature_name}", str(e))

    return results.summary()


async def test_code_generation():
    """Test code generation for all patterns."""
    print("\n" + "=" * 70)
    print("TEST 3: Code Generation")
    print("=" * 70)

    results = TestResults()
    generator = CodeGenerator()
    library = GenesisPatternLibrary()

    all_patterns = library.get_all_patterns()

    for pattern in all_patterns:
        try:
            feature_spec = {
                "feature_name": pattern.name.lower().replace(" ", "_"),
                "description": pattern.description,
            }

            files = generator.generate_from_pattern(
                {
                    "id": pattern.id,
                    "name": pattern.name,
                    "category": pattern.category
                },
                feature_spec
            )

            if files and len(files) > 0:
                total_lines = sum(len(f.content.split('\n')) for f in files)
                results.record_pass(
                    f"{pattern.name}: {len(files)} files, {total_lines} lines"
                )
            else:
                results.record_fail(f"{pattern.name}", "no files generated")

        except Exception as e:
            results.record_fail(f"{pattern.name}", str(e))

    return results.summary()


async def test_landing_page_generation():
    """Test complete landing page project generation."""
    print("\n" + "=" * 70)
    print("TEST 4: Complete Landing Page Generation")
    print("=" * 70)

    results = TestResults()
    generator = CodeGenerator()

    # Create test output directory
    test_dir = Path.cwd() / "test_output" / "landing_page_test"
    test_dir.mkdir(parents=True, exist_ok=True)
    generator.project_root = test_dir

    patterns = [
        "lp_hero_section",
        "lp_features_showcase",
        "lp_contact_form",
        "lp_pricing_table",
        "lp_faq"
    ]

    total_files = 0
    total_lines = 0
    start_time = time.time()

    for pattern_id in patterns:
        try:
            files = generator.generate_from_pattern(
                {"id": pattern_id, "name": pattern_id, "category": "landing_page"},
                {"feature_name": pattern_id, "description": ""}
            )

            write_result = generator.write_files(files, dry_run=False)

            if write_result['files_written']:
                files_count = len(write_result['files_written'])
                lines_count = sum(len(f.content.split('\n')) for f in files)
                total_files += files_count
                total_lines += lines_count
                results.record_pass(f"{pattern_id}: {files_count} files written")
            else:
                results.record_fail(f"{pattern_id}", "no files written")

        except Exception as e:
            results.record_fail(f"{pattern_id}", str(e))

    elapsed = time.time() - start_time

    print(f"\n📊 Statistics:")
    print(f"   Total files: {total_files}")
    print(f"   Total lines: {total_lines}")
    print(f"   Time: {elapsed:.2f}s")
    print(f"   Output: {test_dir}")

    return results.summary()


async def test_saas_app_generation():
    """Test complete SaaS app project generation."""
    print("\n" + "=" * 70)
    print("TEST 5: Complete SaaS App Generation")
    print("=" * 70)

    results = TestResults()
    generator = CodeGenerator()

    # Create test output directory
    test_dir = Path.cwd() / "test_output" / "saas_app_test"
    test_dir.mkdir(parents=True, exist_ok=True)
    generator.project_root = test_dir

    patterns = [
        "saas_authentication",
        "saas_dashboard",
        "saas_settings",
        "saas_team_management",
        "saas_notifications"
    ]

    total_files = 0
    total_lines = 0
    start_time = time.time()

    for pattern_id in patterns:
        try:
            files = generator.generate_from_pattern(
                {"id": pattern_id, "name": pattern_id, "category": "saas_app"},
                {"feature_name": pattern_id, "description": ""}
            )

            write_result = generator.write_files(files, dry_run=False)

            if write_result['files_written']:
                files_count = len(write_result['files_written'])
                lines_count = sum(len(f.content.split('\n')) for f in files)
                total_files += files_count
                total_lines += lines_count
                results.record_pass(f"{pattern_id}: {files_count} files written")
            else:
                results.record_fail(f"{pattern_id}", "no files written")

        except Exception as e:
            results.record_fail(f"{pattern_id}", str(e))

    elapsed = time.time() - start_time

    print(f"\n📊 Statistics:")
    print(f"   Total files: {total_files}")
    print(f"   Total lines: {total_lines}")
    print(f"   Time: {elapsed:.2f}s")
    print(f"   Output: {test_dir}")

    return results.summary()


async def test_performance_benchmarks():
    """Benchmark code generation performance."""
    print("\n" + "=" * 70)
    print("TEST 6: Performance Benchmarks")
    print("=" * 70)

    results = TestResults()
    generator = CodeGenerator()
    library = GenesisPatternLibrary()

    all_patterns = library.get_all_patterns()

    # Benchmark individual patterns
    print("\nIndividual Pattern Generation:")
    for pattern in all_patterns[:5]:  # Test first 5
        try:
            start = time.time()
            files = generator.generate_from_pattern(
                {"id": pattern.id, "name": pattern.name, "category": pattern.category},
                {"feature_name": pattern.name, "description": ""}
            )
            elapsed = time.time() - start

            if elapsed < 1.0:  # Should be under 1 second
                results.record_pass(f"{pattern.name}: {elapsed*1000:.0f}ms")
            else:
                results.record_fail(f"{pattern.name}", f"too slow: {elapsed:.2f}s")
        except Exception as e:
            results.record_fail(f"{pattern.name}", str(e))

    # Benchmark complete library
    print("\nComplete Library Generation:")
    try:
        start = time.time()
        total_files = 0
        total_lines = 0

        for pattern in all_patterns:
            files = generator.generate_from_pattern(
                {"id": pattern.id, "name": pattern.name, "category": pattern.category},
                {"feature_name": pattern.name, "description": ""}
            )
            total_files += len(files)
            total_lines += sum(len(f.content.split('\n')) for f in files)

        elapsed = time.time() - start

        print(f"\n   Patterns: {len(all_patterns)}")
        print(f"   Files: {total_files}")
        print(f"   Lines: {total_lines}")
        print(f"   Time: {elapsed:.2f}s")
        print(f"   Avg per pattern: {elapsed/len(all_patterns)*1000:.0f}ms")

        if elapsed < 20.0:  # Should be under 20 seconds for all patterns
            results.record_pass(f"Complete library: {elapsed:.2f}s")
        else:
            results.record_fail("Complete library", f"too slow: {elapsed:.2f}s")

    except Exception as e:
        results.record_fail("Complete library", str(e))

    return results.summary()


async def main():
    """Run all end-to-end tests."""
    print("\n" + "=" * 70)
    print("PHASE 2 END-TO-END TEST SUITE")
    print("=" * 70)
    print("\nTesting complete autonomous agent system...")

    all_passed = True

    # Run all tests
    tests = [
        test_project_type_detection(),
        test_pattern_matching(),
        test_code_generation(),
        test_landing_page_generation(),
        test_saas_app_generation(),
        test_performance_benchmarks(),
    ]

    for test in tests:
        passed = await test
        all_passed = all_passed and passed

    # Final summary
    print("\n" + "=" * 70)
    print("FINAL RESULT")
    print("=" * 70)

    if all_passed:
        print("\n✅ ALL TESTS PASSED")
        print("\nPhase 2 system is working correctly and ready for production use!")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED")
        print("\nPlease review failures above.")
        return 1


if __name__ == "__main__":
    import sys
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
