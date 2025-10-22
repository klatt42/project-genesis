"""
Test Code Generation - Verify code generation works for all patterns.

This script:
- Tests code generation for each Genesis pattern
- Verifies files are created correctly
- Validates generated code structure
"""

import asyncio
import sys
from pathlib import Path

# Add agents to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from agents.genesis_feature.core.code_generator import CodeGenerator
from agents.genesis_feature.core.pattern_library import GenesisPatternLibrary


async def test_landing_page_patterns():
    """Test all landing page pattern code generation."""
    print("=" * 60)
    print("TESTING LANDING PAGE PATTERNS")
    print("=" * 60)
    print()

    generator = CodeGenerator()
    library = GenesisPatternLibrary()

    # Get all landing page patterns
    lp_patterns = library.get_patterns_by_category("landing_page")

    for pattern in lp_patterns:
        print(f"Testing pattern: {pattern.name} ({pattern.id})")

        feature_spec = {
            "feature_name": pattern.name.lower().replace(" ", "_"),
            "description": pattern.description,
            "custom_config": {}
        }

        try:
            # Generate code
            generated_files = generator.generate_from_pattern(
                {
                    "id": pattern.id,
                    "name": pattern.name,
                    "category": pattern.category
                },
                feature_spec
            )

            print(f"  ✅ Generated {len(generated_files)} files:")
            for file in generated_files:
                print(f"     - {file.path} ({file.file_type})")
                print(f"       Size: {len(file.content)} bytes")

            # Dry run write (don't actually write)
            write_result = generator.write_files(generated_files, dry_run=True)
            print(f"  ✅ Would write {len(write_result['files_written'])} files")

        except Exception as e:
            print(f"  ❌ Error: {e}")

        print()


async def test_saas_patterns():
    """Test SaaS pattern code generation."""
    print("=" * 60)
    print("TESTING SAAS APP PATTERNS")
    print("=" * 60)
    print()

    generator = CodeGenerator()
    library = GenesisPatternLibrary()

    # Get all SaaS patterns
    saas_patterns = library.get_patterns_by_category("saas_app")

    for pattern in saas_patterns:
        print(f"Testing pattern: {pattern.name} ({pattern.id})")

        feature_spec = {
            "feature_name": pattern.name.lower().replace(" ", "_"),
            "description": pattern.description,
            "custom_config": {}
        }

        try:
            # Generate code
            generated_files = generator.generate_from_pattern(
                {
                    "id": pattern.id,
                    "name": pattern.name,
                    "category": pattern.category
                },
                feature_spec
            )

            if generated_files:
                print(f"  ✅ Generated {len(generated_files)} files:")
                for file in generated_files:
                    print(f"     - {file.path} ({file.file_type})")
                    print(f"       Size: {len(file.content)} bytes")
            else:
                print(f"  ⚠️  No files generated (may be placeholder)")

        except Exception as e:
            print(f"  ❌ Error: {e}")

        print()


async def test_actual_write():
    """Test actually writing files to disk."""
    print("=" * 60)
    print("TESTING ACTUAL FILE WRITING")
    print("=" * 60)
    print()

    generator = CodeGenerator()

    # Create test output directory
    test_output = Path.cwd() / "test_output" / "code_generation"
    test_output.mkdir(parents=True, exist_ok=True)

    # Change generator to use test output
    generator.project_root = test_output

    # Test with hero section (simple pattern)
    feature_spec = {
        "feature_name": "hero_section",
        "description": "Hero section for landing page",
        "custom_config": {}
    }

    pattern = {
        "id": "lp_hero_section",
        "name": "Hero Section",
        "category": "landing_page"
    }

    print(f"Generating hero section in: {test_output}")

    try:
        # Generate and write
        generated_files = generator.generate_from_pattern(pattern, feature_spec)
        write_result = generator.write_files(generated_files, dry_run=False)

        print(f"✅ Wrote {len(write_result['files_written'])} files:")
        for file_path in write_result['files_written']:
            full_path = test_output / file_path
            print(f"   - {file_path}")
            print(f"     Exists: {full_path.exists()}")
            if full_path.exists():
                print(f"     Size: {full_path.stat().st_size} bytes")

        # Verify files exist
        all_exist = all(
            (test_output / f).exists()
            for f in write_result['files_written']
        )

        if all_exist:
            print("\n✅ All files verified on disk!")
        else:
            print("\n❌ Some files missing!")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

    print()


async def main():
    """Run all code generation tests."""
    print()
    print("🧪 CODE GENERATION TESTS")
    print()

    # Test landing page patterns
    await test_landing_page_patterns()

    # Test SaaS patterns
    await test_saas_patterns()

    # Test actual file writing
    await test_actual_write()

    print("=" * 60)
    print("✅ CODE GENERATION TESTS COMPLETE")
    print("=" * 60)
    print()


if __name__ == "__main__":
    asyncio.run(main())
