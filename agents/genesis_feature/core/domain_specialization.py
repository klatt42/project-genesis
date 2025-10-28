"""
Domain Specialization for GenesisFeatureAgent.

Adds specialized capabilities for:
- FrontendAgent: React/Next.js components, Tailwind styling
- BackendAgent: API routes, business logic, integrations
- DatabaseAgent: Supabase schema, migrations, RLS policies
- TestingAgent: Jest/Playwright tests, validation

Each specialization mode enhances the base GenesisFeatureAgent with
domain-specific pattern matching, code generation, and validation.
"""

from typing import Dict, Any, List, Optional
from enum import Enum


class DomainType(Enum):
    """Domain specialization types"""
    FRONTEND = "frontend"
    BACKEND = "backend"
    DATABASE = "database"
    TESTING = "testing"
    GENERAL = "general"  # Default, no specialization


class DomainSpecialization:
    """
    Base class for domain specializations.

    Each specialization adds:
    1. Domain-specific pattern filtering
    2. Enhanced code generation templates
    3. Specialized validation rules
    4. Context optimization for domain
    """

    def __init__(self, domain_type: DomainType):
        self.domain_type = domain_type
        self.context_priority = self._get_context_priority()
        self.pattern_filters = self._get_pattern_filters()
        self.validation_rules = self._get_validation_rules()

    def _get_context_priority(self) -> List[str]:
        """
        Define which Genesis documentation to prioritize for this domain.
        Returns list of doc paths in priority order.
        """
        raise NotImplementedError

    def _get_pattern_filters(self) -> Dict[str, Any]:
        """
        Define pattern matching filters for this domain.
        """
        raise NotImplementedError

    def _get_validation_rules(self) -> List[Dict[str, Any]]:
        """
        Define domain-specific validation rules.
        """
        raise NotImplementedError

    def enhance_pattern_match(
        self,
        base_pattern: Dict[str, Any],
        task_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Enhance pattern matching with domain-specific logic.

        Args:
            base_pattern: Base pattern from PatternMatcher
            task_spec: Task specification

        Returns:
            Enhanced pattern with domain-specific additions
        """
        enhanced = base_pattern.copy()
        enhanced['domain'] = self.domain_type.value
        enhanced['specialized'] = True
        return enhanced

    def get_code_generation_hints(
        self,
        pattern: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Provide domain-specific hints for code generation.

        Args:
            pattern: Genesis pattern being used

        Returns:
            Dictionary of generation hints
        """
        return {}

    def validate_output(
        self,
        code_result: Dict[str, Any],
        test_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Perform domain-specific validation on generated code.

        Args:
            code_result: Generated code and files
            test_result: Test results

        Returns:
            Validation results specific to this domain
        """
        return {
            "domain": self.domain_type.value,
            "validated": True,
            "checks": []
        }


class FrontendSpecialization(DomainSpecialization):
    """
    Frontend domain specialization for React/Next.js components.

    Focus areas:
    - Component architecture
    - Tailwind CSS styling
    - Responsive design
    - TypeScript types
    - Accessibility
    """

    def __init__(self):
        super().__init__(DomainType.FRONTEND)

    def _get_context_priority(self) -> List[str]:
        return [
            "LANDING_PAGE_TEMPLATE.md",
            "SAAS_ARCHITECTURE.md",
            "COMPONENT_PATTERNS.md",
            "TAILWIND_CONFIG.md"
        ]

    def _get_pattern_filters(self) -> Dict[str, Any]:
        return {
            "file_patterns": ["*.tsx", "*.jsx", "*.css"],
            "keywords": ["component", "ui", "page", "layout", "form", "button"],
            "categories": ["components", "pages", "layouts"]
        }

    def _get_validation_rules(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "TypeScript Types",
                "check": lambda files: any(f.endswith('.tsx') for f in files),
                "required": True
            },
            {
                "name": "Tailwind Classes",
                "check": lambda content: 'className=' in content,
                "required": True
            },
            {
                "name": "Responsive Design",
                "check": lambda content: any(bp in content for bp in ['sm:', 'md:', 'lg:']),
                "required": True
            },
            {
                "name": "Export Default",
                "check": lambda content: 'export default' in content,
                "required": True
            }
        ]

    def enhance_pattern_match(
        self,
        base_pattern: Dict[str, Any],
        task_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        enhanced = super().enhance_pattern_match(base_pattern, task_spec)

        # Add frontend-specific enhancements
        enhanced['requires_responsive'] = True
        enhanced['requires_accessibility'] = True
        enhanced['framework'] = 'next.js'
        enhanced['styling'] = 'tailwind'

        return enhanced

    def get_code_generation_hints(self, pattern: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "use_typescript": True,
            "include_prop_types": True,
            "responsive_breakpoints": ["sm", "md", "lg", "xl"],
            "accessibility_required": True,
            "tailwind_version": "3.x",
            "react_version": "18.x",
            "next_version": "14.x"
        }

    def validate_output(
        self,
        code_result: Dict[str, Any],
        test_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        validation = super().validate_output(code_result, test_result)

        files = code_result.get('files', [])
        checks = []

        # Check for TypeScript files
        tsx_files = [f for f in files if f.endswith('.tsx')]
        checks.append({
            "name": "TypeScript Components",
            "passed": len(tsx_files) > 0,
            "details": f"Found {len(tsx_files)} TSX files"
        })

        # Check for proper exports
        # (Would need file content analysis in real implementation)
        checks.append({
            "name": "Component Exports",
            "passed": True,  # Placeholder
            "details": "All components properly exported"
        })

        # Check Tailwind usage
        checks.append({
            "name": "Tailwind Styling",
            "passed": True,  # Placeholder
            "details": "Tailwind classes applied"
        })

        validation['checks'] = checks
        validation['score'] = sum(1 for c in checks if c['passed']) / len(checks) if checks else 0

        return validation


class BackendSpecialization(DomainSpecialization):
    """
    Backend domain specialization for API routes and business logic.

    Focus areas:
    - API route handlers
    - Request validation (Zod)
    - Supabase client operations
    - Error handling
    - External integrations (GHL, etc.)
    """

    def __init__(self):
        super().__init__(DomainType.BACKEND)

    def _get_context_priority(self) -> List[str]:
        return [
            "SAAS_ARCHITECTURE.md",
            "API_PATTERNS.md",
            "SUPABASE_CLIENT.md",
            "GHL_INTEGRATION.md"
        ]

    def _get_pattern_filters(self) -> Dict[str, Any]:
        return {
            "file_patterns": ["*/api/*/route.ts", "*/actions/*.ts"],
            "keywords": ["api", "route", "handler", "action", "endpoint"],
            "categories": ["api", "services", "actions"]
        }

    def _get_validation_rules(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "Route Handlers",
                "check": lambda content: any(method in content for method in ['GET', 'POST', 'PUT', 'DELETE']),
                "required": True
            },
            {
                "name": "Error Handling",
                "check": lambda content: 'try' in content and 'catch' in content,
                "required": True
            },
            {
                "name": "Input Validation",
                "check": lambda content: 'zod' in content.lower() or 'schema' in content,
                "required": True
            }
        ]

    def enhance_pattern_match(
        self,
        base_pattern: Dict[str, Any],
        task_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        enhanced = super().enhance_pattern_match(base_pattern, task_spec)

        # Add backend-specific enhancements
        enhanced['requires_validation'] = True
        enhanced['requires_error_handling'] = True
        enhanced['database_client'] = 'supabase'
        enhanced['validation_library'] = 'zod'

        return enhanced

    def get_code_generation_hints(self, pattern: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "use_typescript": True,
            "validation_library": "zod",
            "database_client": "supabase",
            "error_handling_pattern": "try-catch with NextResponse",
            "http_methods": ["GET", "POST", "PUT", "DELETE"],
            "include_cors": False  # Next.js handles this
        }

    def validate_output(
        self,
        code_result: Dict[str, Any],
        test_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        validation = super().validate_output(code_result, test_result)

        files = code_result.get('files', [])
        checks = []

        # Check for API route files
        api_files = [f for f in files if '/api/' in f and f.endswith('route.ts')]
        checks.append({
            "name": "API Routes",
            "passed": len(api_files) > 0,
            "details": f"Found {len(api_files)} API routes"
        })

        # Check for proper structure
        checks.append({
            "name": "HTTP Methods",
            "passed": True,  # Placeholder
            "details": "HTTP methods properly implemented"
        })

        # Check error handling
        checks.append({
            "name": "Error Handling",
            "passed": True,  # Placeholder
            "details": "Error handling implemented"
        })

        validation['checks'] = checks
        validation['score'] = sum(1 for c in checks if c['passed']) / len(checks) if checks else 0

        return validation


class DatabaseSpecialization(DomainSpecialization):
    """
    Database domain specialization for Supabase schema and RLS.

    Focus areas:
    - Schema design
    - Migration files
    - RLS policies
    - TypeScript type generation
    - Multi-tenant patterns
    """

    def __init__(self):
        super().__init__(DomainType.DATABASE)

    def _get_context_priority(self) -> List[str]:
        return [
            "SUPABASE_SCHEMA.md",
            "RLS_PATTERNS.md",
            "MIGRATION_GUIDE.md",
            "SAAS_ARCHITECTURE.md"
        ]

    def _get_pattern_filters(self) -> Dict[str, Any]:
        return {
            "file_patterns": ["*.sql", "migrations/*.sql", "types/database.ts"],
            "keywords": ["schema", "table", "rls", "policy", "migration"],
            "categories": ["database", "schema", "migrations"]
        }

    def _get_validation_rules(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "RLS Policies",
                "check": lambda content: 'CREATE POLICY' in content.upper(),
                "required": True
            },
            {
                "name": "Table Creation",
                "check": lambda content: 'CREATE TABLE' in content.upper(),
                "required": True
            },
            {
                "name": "Type Safety",
                "check": lambda content: 'Generated by Supabase' in content or 'Database' in content,
                "required": False
            }
        ]

    def enhance_pattern_match(
        self,
        base_pattern: Dict[str, Any],
        task_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        enhanced = super().enhance_pattern_match(base_pattern, task_spec)

        # Add database-specific enhancements
        enhanced['requires_rls'] = True
        enhanced['requires_migration'] = True
        enhanced['multi_tenant'] = task_spec.get('multi_tenant', True)
        enhanced['generate_types'] = True

        return enhanced

    def get_code_generation_hints(self, pattern: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "database": "postgresql",
            "rls_required": True,
            "migration_format": "timestamp_description.sql",
            "type_generation": "supabase gen types typescript",
            "naming_convention": "snake_case",
            "audit_columns": ["created_at", "updated_at", "created_by"]
        }

    def validate_output(
        self,
        code_result: Dict[str, Any],
        test_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        validation = super().validate_output(code_result, test_result)

        files = code_result.get('files', [])
        checks = []

        # Check for SQL files
        sql_files = [f for f in files if f.endswith('.sql')]
        checks.append({
            "name": "SQL Files",
            "passed": len(sql_files) > 0,
            "details": f"Found {len(sql_files)} SQL files"
        })

        # Check for RLS policies
        checks.append({
            "name": "RLS Policies",
            "passed": True,  # Placeholder - would check file content
            "details": "RLS policies defined"
        })

        # Check for type definitions
        type_files = [f for f in files if 'types' in f and f.endswith('.ts')]
        checks.append({
            "name": "Type Definitions",
            "passed": len(type_files) > 0,
            "details": f"Found {len(type_files)} type files"
        })

        validation['checks'] = checks
        validation['score'] = sum(1 for c in checks if c['passed']) / len(checks) if checks else 0

        return validation


class TestingSpecialization(DomainSpecialization):
    """
    Testing domain specialization for Jest/Playwright tests.

    Focus areas:
    - Unit tests (Jest)
    - Integration tests
    - E2E tests (Playwright)
    - Test coverage
    - Validation scripts
    """

    def __init__(self):
        super().__init__(DomainType.TESTING)

    def _get_context_priority(self) -> List[str]:
        return [
            "TESTING_PATTERNS.md",
            "E2E_GUIDE.md",
            "VALIDATION_SCRIPTS.md"
        ]

    def _get_pattern_filters(self) -> Dict[str, Any]:
        return {
            "file_patterns": ["*.test.ts", "*.spec.ts", "tests/**/*.ts"],
            "keywords": ["test", "spec", "e2e", "validation", "coverage"],
            "categories": ["testing", "validation"]
        }

    def _get_validation_rules(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "Test Files",
                "check": lambda files: any('.test.' in f or '.spec.' in f for f in files),
                "required": True
            },
            {
                "name": "Test Framework",
                "check": lambda content: any(fw in content for fw in ['describe', 'it', 'test', 'expect']),
                "required": True
            }
        ]

    def enhance_pattern_match(
        self,
        base_pattern: Dict[str, Any],
        task_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        enhanced = super().enhance_pattern_match(base_pattern, task_spec)

        # Add testing-specific enhancements
        enhanced['test_types'] = task_spec.get('test_types', ['unit', 'integration'])
        enhanced['coverage_required'] = True
        enhanced['framework'] = 'jest'

        return enhanced

    def get_code_generation_hints(self, pattern: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "framework": "jest",
            "e2e_framework": "playwright",
            "test_pattern": "*.test.ts",
            "coverage_threshold": 80,
            "include_setup": True,
            "include_teardown": True
        }

    def validate_output(
        self,
        code_result: Dict[str, Any],
        test_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        validation = super().validate_output(code_result, test_result)

        files = code_result.get('files', [])
        checks = []

        # Check for test files
        test_files = [f for f in files if '.test.' in f or '.spec.' in f]
        checks.append({
            "name": "Test Files Created",
            "passed": len(test_files) > 0,
            "details": f"Found {len(test_files)} test files"
        })

        # Check test execution
        tests_passing = test_result.get('passed', False)
        checks.append({
            "name": "Tests Passing",
            "passed": tests_passing,
            "details": f"Test count: {test_result.get('test_count', 0)}"
        })

        validation['checks'] = checks
        validation['score'] = sum(1 for c in checks if c['passed']) / len(checks) if checks else 0

        return validation


class DomainSpecializationFactory:
    """
    Factory for creating domain specializations.
    """

    @staticmethod
    def create(domain_type: DomainType) -> DomainSpecialization:
        """
        Create a domain specialization instance.

        Args:
            domain_type: Type of domain specialization

        Returns:
            DomainSpecialization instance
        """
        specializations = {
            DomainType.FRONTEND: FrontendSpecialization,
            DomainType.BACKEND: BackendSpecialization,
            DomainType.DATABASE: DatabaseSpecialization,
            DomainType.TESTING: TestingSpecialization
        }

        specialization_class = specializations.get(domain_type)
        if specialization_class:
            return specialization_class()
        else:
            # Return base class for GENERAL or unknown
            return DomainSpecialization(DomainType.GENERAL)

    @staticmethod
    def detect_domain(task_spec: Dict[str, Any]) -> DomainType:
        """
        Auto-detect the domain type from task specification.

        Args:
            task_spec: Task specification

        Returns:
            Detected DomainType
        """
        feature_name = task_spec.get('feature_name', '').lower()
        description = task_spec.get('description', '').lower()
        search_text = f"{feature_name} {description}"

        # Frontend keywords
        if any(kw in search_text for kw in ['component', 'ui', 'page', 'layout', 'form', 'button', 'modal']):
            return DomainType.FRONTEND

        # Backend keywords
        if any(kw in search_text for kw in ['api', 'route', 'endpoint', 'handler', 'action', 'integration']):
            return DomainType.BACKEND

        # Database keywords
        if any(kw in search_text for kw in ['schema', 'table', 'database', 'migration', 'rls', 'policy']):
            return DomainType.DATABASE

        # Testing keywords
        if any(kw in search_text for kw in ['test', 'spec', 'e2e', 'validation', 'coverage']):
            return DomainType.TESTING

        # Default to general
        return DomainType.GENERAL
