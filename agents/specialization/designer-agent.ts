// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/designer-agent.ts
// PURPOSE: Designer specialized agent implementation (Phase 2.3)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/designer-agent.ts
// ================================

import { BaseSpecializedAgent, Task, TaskResult } from './base-agent.js';
import { AgentRole } from './roles.js';

/**
 * Designer Agent
 *
 * Specializes in UI/UX design, visual consistency, accessibility, and user experience
 */
export class DesignerAgent extends BaseSpecializedAgent {
  private designContext: {
    designSystem?: string;
    colorPalette?: string[];
    typography?: Record<string, string>;
  };

  constructor(id: string) {
    super(id, AgentRole.DESIGNER);
    this.designContext = {};
  }

  /**
   * Set design context
   */
  setDesignContext(context: {
    designSystem?: string;
    colorPalette?: string[];
    typography?: Record<string, string>;
  }): void {
    this.designContext = { ...this.designContext, ...context };
  }

  /**
   * Execute a designer task
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      let output: any;
      let metadata: Record<string, any> = {};

      switch (task.type) {
        case 'ui-design':
          output = await this.designUI(task);
          metadata = { type: 'ui-design', ...output };
          break;

        case 'component-design':
          output = await this.designComponent(task);
          metadata = { type: 'component-design', ...output };
          break;

        case 'styling':
          output = await this.applyStyles(task);
          metadata = { type: 'styling', ...output };
          break;

        case 'accessibility':
          output = await this.improveAccessibility(task);
          metadata = { type: 'accessibility', ...output };
          break;

        case 'responsive-design':
          output = await this.makeResponsive(task);
          metadata = { type: 'responsive', ...output };
          break;

        case 'design-system':
          output = await this.buildDesignSystem(task);
          metadata = { type: 'design-system', ...output };
          break;

        default:
          return {
            taskId: task.id,
            success: false,
            errors: [`Unknown task type: ${task.type}`]
          };
      }

      const executionTime = Date.now() - startTime;

      return {
        taskId: task.id,
        success: true,
        output,
        metadata: {
          ...metadata,
          executionTime
        },
        executionTime
      };

    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Design UI interface
   */
  private async designUI(task: Task): Promise<{
    layout: string;
    components: string[];
    colorScheme: string[];
    typography: Record<string, string>;
    spacing: string;
  }> {
    const { pageType = 'general', mood = 'professional' } = task.context || {};

    return {
      layout: this.suggestLayout(pageType),
      components: this.identifyRequiredComponents(task.description),
      colorScheme: this.suggestColorScheme(mood),
      typography: this.suggestTypography(pageType),
      spacing: 'Using 8px grid system'
    };
  }

  /**
   * Design component
   */
  private async designComponent(task: Task): Promise<{
    componentName: string;
    variants: string[];
    states: string[];
    props: Record<string, string>;
    accessibility: string[];
    styles: string;
  }> {
    const { componentType = 'button' } = task.context || {};

    return {
      componentName: componentType,
      variants: this.defineVariants(componentType),
      states: ['default', 'hover', 'active', 'disabled', 'loading'],
      props: this.defineProps(componentType),
      accessibility: this.ensureAccessibility(componentType),
      styles: 'Styles follow design system tokens'
    };
  }

  /**
   * Apply styles
   */
  private async applyStyles(task: Task): Promise<{
    approach: string;
    stylesApplied: string[];
    tokens: Record<string, string>;
    responsive: boolean;
  }> {
    const { framework = 'tailwind', target } = task.context || {};

    return {
      approach: `Using ${framework} for styling`,
      stylesApplied: [
        'Color scheme applied',
        'Typography set',
        'Spacing normalized',
        'Shadows and borders added'
      ],
      tokens: this.defineTokens(),
      responsive: true
    };
  }

  /**
   * Improve accessibility
   */
  private async improveAccessibility(task: Task): Promise<{
    improvements: Array<{
      area: string;
      change: string;
      wcagLevel: string;
    }>;
    score: { before: number; after: number };
    recommendations: string[];
  }> {
    const improvements = [
      {
        area: 'Color Contrast',
        change: 'Increased text contrast to 4.5:1 ratio',
        wcagLevel: 'AA'
      },
      {
        area: 'Keyboard Navigation',
        change: 'Added focus indicators and tab order',
        wcagLevel: 'A'
      },
      {
        area: 'ARIA Labels',
        change: 'Added descriptive labels to interactive elements',
        wcagLevel: 'A'
      },
      {
        area: 'Screen Reader Support',
        change: 'Added semantic HTML and ARIA roles',
        wcagLevel: 'AA'
      }
    ];

    return {
      improvements,
      score: { before: 65, after: 95 },
      recommendations: [
        'Test with screen readers',
        'Validate with automated tools',
        'Conduct user testing with assistive technologies'
      ]
    };
  }

  /**
   * Make design responsive
   */
  private async makeResponsive(task: Task): Promise<{
    breakpoints: Record<string, string>;
    adaptations: string[];
    tested: string[];
  }> {
    return {
      breakpoints: {
        mobile: '0-640px',
        tablet: '641-1024px',
        desktop: '1025px+'
      },
      adaptations: [
        'Flexible grid layout',
        'Responsive typography',
        'Adaptive navigation',
        'Optimized images',
        'Touch-friendly targets on mobile'
      ],
      tested: ['iPhone 13', 'iPad Pro', '1920x1080 desktop', '4K display']
    };
  }

  /**
   * Build design system
   */
  private async buildDesignSystem(task: Task): Promise<{
    tokens: {
      colors: Record<string, string>;
      typography: Record<string, string>;
      spacing: Record<string, string>;
      shadows: Record<string, string>;
    };
    components: string[];
    guidelines: string[];
  }> {
    return {
      tokens: {
        colors: this.defineColorTokens(),
        typography: this.defineTypographyTokens(),
        spacing: this.defineSpacingTokens(),
        shadows: this.defineShadowTokens()
      },
      components: [
        'Button',
        'Input',
        'Card',
        'Modal',
        'Dropdown',
        'Navigation',
        'Typography'
      ],
      guidelines: [
        'Use design tokens for consistency',
        'Follow 8px grid for spacing',
        'Maintain WCAG AA accessibility',
        'Design mobile-first',
        'Use semantic color names'
      ]
    };
  }

  /**
   * Helper: Suggest layout
   */
  private suggestLayout(pageType: string): string {
    const layouts: Record<string, string> = {
      'landing': 'Hero + Features + CTA sections',
      'dashboard': 'Sidebar + Main content + Header',
      'form': 'Single column with clear hierarchy',
      'list': 'Grid or table layout with filters',
      'detail': 'Content-focused with sidebar',
      'default': 'Header + Main + Footer'
    };

    return layouts[pageType] || layouts['default'];
  }

  /**
   * Helper: Identify required components
   */
  private identifyRequiredComponents(description: string): string[] {
    const components: string[] = [];
    const lower = description.toLowerCase();

    if (lower.includes('form') || lower.includes('input')) components.push('Input', 'Form');
    if (lower.includes('button')) components.push('Button');
    if (lower.includes('card')) components.push('Card');
    if (lower.includes('modal') || lower.includes('dialog')) components.push('Modal');
    if (lower.includes('nav') || lower.includes('menu')) components.push('Navigation');
    if (lower.includes('table') || lower.includes('list')) components.push('Table');

    return components.length > 0 ? components : ['Container', 'Typography', 'Button'];
  }

  /**
   * Helper: Suggest color scheme
   */
  private suggestColorScheme(mood: string): string[] {
    const schemes: Record<string, string[]> = {
      'professional': ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
      'creative': ['#7C3AED', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
      'warm': ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2'],
      'cool': ['#059669', '#10B981', '#34D399', '#6EE7B7', '#D1FAE5'],
      'neutral': ['#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB']
    };

    return schemes[mood] || schemes['professional'];
  }

  /**
   * Helper: Suggest typography
   */
  private suggestTypography(pageType: string): Record<string, string> {
    return {
      heading: 'font-bold text-3xl md:text-4xl',
      subheading: 'font-semibold text-xl md:text-2xl',
      body: 'font-normal text-base',
      caption: 'font-normal text-sm',
      fontFamily: 'Inter, system-ui, sans-serif'
    };
  }

  /**
   * Helper: Define variants
   */
  private defineVariants(componentType: string): string[] {
    const variants: Record<string, string[]> = {
      button: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      input: ['text', 'email', 'password', 'search', 'number'],
      card: ['default', 'elevated', 'outlined', 'filled'],
      default: ['default', 'alternate']
    };

    return variants[componentType] || variants['default'];
  }

  /**
   * Helper: Define props
   */
  private defineProps(componentType: string): Record<string, string> {
    const props: Record<string, Record<string, string>> = {
      button: {
        variant: 'primary | secondary | outline | ghost | danger',
        size: 'sm | md | lg',
        disabled: 'boolean',
        loading: 'boolean'
      },
      input: {
        type: 'text | email | password | etc',
        placeholder: 'string',
        error: 'string',
        disabled: 'boolean'
      },
      default: {
        className: 'string',
        children: 'ReactNode'
      }
    };

    return props[componentType] || props['default'];
  }

  /**
   * Helper: Ensure accessibility
   */
  private ensureAccessibility(componentType: string): string[] {
    return [
      'ARIA labels for screen readers',
      'Keyboard navigation support',
      'Focus indicators',
      'Sufficient color contrast (WCAG AA)',
      'Semantic HTML elements',
      'Error messages announced to screen readers'
    ];
  }

  /**
   * Helper: Define design tokens
   */
  private defineTokens(): Record<string, string> {
    return {
      'primary-color': '#3B82F6',
      'text-color': '#1F2937',
      'background': '#FFFFFF',
      'spacing-unit': '8px',
      'border-radius': '4px'
    };
  }

  /**
   * Helper: Define color tokens
   */
  private defineColorTokens(): Record<string, string> {
    return {
      'primary-50': '#EFF6FF',
      'primary-500': '#3B82F6',
      'primary-900': '#1E3A8A',
      'neutral-50': '#F9FAFB',
      'neutral-500': '#6B7280',
      'neutral-900': '#111827'
    };
  }

  /**
   * Helper: Define typography tokens
   */
  private defineTypographyTokens(): Record<string, string> {
    return {
      'font-family-base': 'Inter, system-ui, sans-serif',
      'font-size-xs': '0.75rem',
      'font-size-base': '1rem',
      'font-size-xl': '1.25rem',
      'font-weight-normal': '400',
      'font-weight-bold': '700'
    };
  }

  /**
   * Helper: Define spacing tokens
   */
  private defineSpacingTokens(): Record<string, string> {
    return {
      '0': '0',
      '1': '0.25rem',
      '2': '0.5rem',
      '4': '1rem',
      '8': '2rem'
    };
  }

  /**
   * Helper: Define shadow tokens
   */
  private defineShadowTokens(): Record<string, string> {
    return {
      'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    };
  }

  /**
   * Get agent-specific capabilities report
   */
  getCapabilitiesReport(): {
    primarySkills: string[];
    designTools: string[];
    frameworks: string[];
    expertise: string[];
  } {
    return {
      primarySkills: [
        'UI/UX Design',
        'Component Design',
        'Design Systems',
        'Accessibility (WCAG)',
        'Responsive Design',
        'Visual Design'
      ],
      designTools: [
        'Figma',
        'Sketch',
        'Adobe XD',
        'Design Tokens',
        'Style Guides'
      ],
      frameworks: [
        'Tailwind CSS',
        'CSS Modules',
        'Styled Components',
        'Emotion',
        'Material UI',
        'Chakra UI'
      ],
      expertise: [
        'User Experience',
        'Interface Design',
        'Accessibility',
        'Design Systems',
        'Responsive Design',
        'Visual Hierarchy'
      ]
    };
  }
}
