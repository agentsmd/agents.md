# AGENTS.ARCH.md

## 1. Introduction

AGENTS.ARCH.md extends the agent execution model defined in AGENTS.md, specifically for:

- **Contextually aware, multi-file, interdependent systems** - Ensuring agents understand the full system architecture before making changes
- **Architecturally safe and non-destructive generation** - Preventing agents from breaking existing functionality or dependencies
- **Real-world codebases with fragile dependencies** - Protecting critical paths and maintaining system integrity

This specification complements AGENTS.md by adding architectural awareness and safety constraints to agent-assisted development workflows.

## 2. SYSTEM IMAGE DECLARATION (SID)

Agents must read and internalize a system image before any generation or modification. This block-based format provides essential architectural context:

```txt
SYSTEM IMAGE:
- Framework: Next.js 15 with TypeScript
- Styling: Tailwind CSS with component-scoped styles
- Architecture: Component-based with pages/ and components/ separation
- Data: Static generation with GitHub API integration
- Build: Turbopack for development, standard Next.js for production
- Dependencies: React 19, Vercel Analytics, SVG icons
- TypeScript: Strict typing required, explicit interfaces for all props
- Type Patterns: React.PropsWithChildren, discriminated unions, shared interfaces
- Constraints: No new API routes, maintain existing component interfaces
- Critical Paths: pages/index.tsx, components/Hero.tsx, components/ExamplesSection.tsx
- Existing Types: SectionProps, ExamplesSectionProps, ContributorData patterns
Agents must internalize this image before modifying or creating files.
```

## 3. PROMPT FRAMEWORK (REQUIRED)

All prompts to agents must follow this structured format:

```
Input:        // Describe what currently exists in the system
Change:       // Describe what needs to be added or modified
Constraints:  // What files, logic, or components must not be touched
```

### Example:
```
Input:        Next.js landing page with Hero, Examples, and Footer components
Change:       Add a new "Features" section between Hero and Examples
Constraints:  Do not modify existing component interfaces, maintain Tailwind styling patterns
```

## 4. SAFE GENERATION DEFAULTS

### ALLOW_MODIFY Flag
- Core system files require explicit `ALLOW_MODIFY` flag to be altered
- This includes: `pages/_app.tsx`, `next.config.ts`, `package.json`, core component interfaces

### Non-Destructive Defaults
- All generations are non-destructive by default
- New components must not break existing functionality
- Dependencies cannot be added without explicit instruction

### Endpoint and Logic Protection
- Agents must not add new API routes without explicit instruction
- No new database connections or external integrations without permission
- Existing data fetching patterns must be preserved

## 5. AGENT SNAPSHOT PROTOCOL

Agents must return a structured understanding of the system upon request:

```
AGENT SNAPSHOT
Files Read:
- pages/index.tsx
- components/Hero.tsx
- components/ExamplesSection.tsx

Components Used:
- CodeExample (CodeExampleProps)
- Section (SectionProps)
- GitHubIcon (GitHubIconProps)

Type Definitions Known:
- LandingPageProps
- ExamplesSectionProps
- ContributorData: Record<string, { avatars: string[]; total: number }>
- SectionProps extends React.PropsWithChildren

Dependencies Known:
- Next.js 15
- React 19
- Tailwind CSS
- TypeScript with strict mode

Endpoints Known:
- Static generation only
- No API routes

Constraints:
- No new API endpoints
- No new external dependencies
- Maintain existing component interfaces
- All new components must have explicit TypeScript interfaces
```

This allows developers to correct agent assumptions and ensure architectural awareness.

## 6. VIOLATION LOGGING

If an agent violates a rule or constraint, it must return a structured violation report:

```
VIOLATION REPORT
Attempted Action: Adding new API route /api/feature
Reason Invalid: System uses static generation only, no API routes defined
Violation Type: Architectural constraint breach
Suggested Alternative: Use static data or client-side state management
Corrective Action: Remove API route, implement as static component
```

## 7. STRONG TYPING REQUIREMENTS

### TypeScript Enforcement
- **All components must be TypeScript functional components** with explicit return types where beneficial
- **Props interfaces must be explicitly defined** and exported for reuse
- **Avoid `any` types** - use proper type definitions or `unknown` with type guards
- **Use generic types** where appropriate for reusable components
- **Leverage union types** for component variants and state management

### Interface Design Patterns
```typescript
// ✅ Good: Explicit interface with documentation
interface ComponentProps {
  /** Brief description of the prop */
  title: string;
  /** Optional prop with default behavior documented */
  variant?: 'primary' | 'secondary';
  /** Complex props should reference other interfaces */
  data: ComponentData;
}

// ✅ Good: Extending existing interfaces
interface ExtendedProps extends BaseComponentProps {
  additionalFeature: boolean;
}

// ❌ Avoid: Implicit any types
function Component(props) { ... }
```

### Type Relationships
- **Create shared type definitions** for common data structures
- **Use discriminated unions** for component variants
- **Define API response types** even for static data
- **Export types from dedicated files** when used across multiple components

## 8. RELATIONSHIP AND DEPENDENCY MANAGEMENT

### Component Relationships
- **Identify shared interfaces** between related components
- **Create base types** for common prop patterns
- **Use composition over inheritance** for component relationships
- **Document component dependencies** in interface definitions

### Data Relationship Patterns
```typescript
// ✅ Good: Shared types for related data
interface BaseEntity {
  id: string;
  createdAt: Date;
}

interface User extends BaseEntity {
  name: string;
  email: string;
}

interface UserProfile extends BaseEntity {
  userId: string;
  bio: string;
  avatar: string;
}

// ✅ Good: Relationship-aware props
interface UserCardProps {
  user: User;
  profile?: UserProfile; // Optional relationship
  showActions?: boolean;
}
```

### Dependency Injection Patterns
- **Use context providers** for shared state with proper typing
- **Define provider interfaces** for dependency injection
- **Create typed hooks** for accessing shared resources
- **Document component dependency requirements**

### Relationship Opportunity Detection
Agents should identify opportunities to create relationships between components:

```typescript
// ✅ Opportunity: Shared contributor data pattern
// Multiple components use similar contributor structures
interface ContributorData {
  avatars: string[];
  total: number;
}

// ✅ Opportunity: Base component props pattern
// Many components share common styling and layout props
interface BaseSectionProps {
  id?: string;
  className?: string;
  title: string;
  center?: boolean;
}

// ✅ Opportunity: Icon component standardization
// All icons should follow the same interface pattern
interface IconProps {
  className?: string;
}
```

### Relationship Enforcement Rules
- **When adding new components**, check for existing similar interfaces to extend
- **When modifying data structures**, update all related type definitions
- **When creating new types**, consider if they should be shared across components
- **When adding props to components**, check if they could benefit from base interfaces

### Existing Codebase Type Patterns
Based on the current codebase, agents should follow these established patterns:

```typescript
// ✅ Existing Pattern: React.PropsWithChildren for layout components
export type SectionProps = React.PropsWithChildren<{
  id?: string;
  className?: string;
  title: string;
  center?: boolean;
}>;

// ✅ Existing Pattern: Record types for API data
interface ExamplesSectionProps {
  contributorsByRepo: Record<string, { avatars: string[]; total: number }>;
}

// ✅ Existing Pattern: Union types for variants
type AgentEntry = {
  name: string;
  url: string;
  from?: string;
  imageSrc?: string;
  imageSrcLight?: string;
  imageSrcDark?: string;
};

// ✅ Existing Pattern: Inline types for simple data
interface FAQItem {
  question: string;
  answer: React.ReactNode;
}
```

### Type Consolidation Opportunities
The current codebase has opportunities for type consolidation:

1. **Icon Components**: All icons should extend a common `IconProps` interface
2. **Section Components**: Many components could extend `SectionProps` or similar base interfaces
3. **API Data Types**: Contributor data patterns could be centralized
4. **Styling Props**: Common styling props could be abstracted into base interfaces

## 9. ARCHITECTURAL PATTERNS

### Component Architecture
- All components must be TypeScript functional components with explicit interfaces
- Props interfaces must be explicitly defined and exported for reuse
- Components should be self-contained with minimal external dependencies
- Use composition patterns for complex component relationships

### Styling Patterns
- Use Tailwind CSS classes consistently
- Follow existing responsive design patterns
- Maintain dark mode compatibility
- Create typed style variants when appropriate

### Data Flow
- Static generation for initial page load
- Client-side interactions for dynamic behavior
- No server-side API routes without explicit permission
- Type all data transformations and API responses

## 10. INTEGRATION WITH AGENTS.md

AGENTS.ARCH.md works alongside the existing AGENTS.md guidelines:

- **AGENTS.md**: Provides development workflow and tooling guidance
- **AGENTS.ARCH.md**: Provides architectural integrity and safety constraints
- Both files should be present in repositories using agent-assisted development

## 11. AGENTIC ARCHITECTURE WITH PERSISTENT COGNITION

### Adaptive Learning System
The AGENTS.ARCH.md specification includes an adaptive learning system that enables agents to improve their architectural understanding over time:

#### Outcome-Based Ranking
```typescript
interface ArchitecturalMemory {
  id: string;
  context: string;
  decision: string;
  outcome: 'success' | 'failure' | 'neutral';
  confidence: number;
  timestamp: Date;
  metadata: {
    filesModified: string[];
    patternsUsed: string[];
    constraintsRespected: boolean;
  };
}

interface MemoryRanking {
  memoryId: string;
  winRate: number;
  usageCount: number;
  lastUsed: Date;
  weight: number; // Automatically adjusted based on performance
}
```

#### Multi-Armed Bandit Learning
- **Task-specific optimization**: Learns optimal approaches for different architectural tasks
- **Context-aware decision making**: Adapts strategies based on codebase characteristics
- **Exploration vs exploitation**: Balances trying new approaches with proven methods

```typescript
interface TaskLearning {
  taskType: 'component_creation' | 'interface_design' | 'refactoring' | 'bug_fix';
  kValues: Record<string, number>; // Optimal parameters per task
  successRate: number;
  adaptations: AdaptationRecord[];
}

interface AdaptationRecord {
  timestamp: Date;
  change: string;
  impact: number; // Positive/negative impact on success rate
}
```

### Memory Consolidation System

#### K-Means Clustering for Memory Grouping
```typescript
interface MemoryCluster {
  id: string;
  centroid: ArchitecturalPattern;
  memories: ArchitecturalMemory[];
  consolidatedKnowledge: ConsolidatedKnowledge;
  confidence: number;
}

interface ConsolidatedKnowledge {
  pattern: string;
  bestPractices: string[];
  commonPitfalls: string[];
  contextRules: ContextRule[];
  successFactors: SuccessFactor[];
}
```

#### Automatic Summarization
- **Pattern extraction**: Identifies recurring successful patterns
- **Rule generation**: Creates IF/THEN rules with confidence scores
- **Belief promotion**: Elevates proven patterns to architectural principles

```typescript
interface ArchitecturalRule {
  condition: string; // IF condition
  action: string;    // THEN action
  confidence: number;
  supportCount: number; // Minimum occurrences threshold
  winRate: number;
  context: string[];
  examples: ArchitecturalMemory[];
}
```

### Pattern Mining & Rules Engine

#### Feature-Based Pattern Detection
```typescript
interface PatternMining {
  features: FeatureExtraction;
  rules: GeneratedRule[];
  validation: PatternValidation;
}

interface FeatureExtraction {
  codePatterns: string[];
  architecturalDecisions: string[];
  constraintViolations: string[];
  performanceMetrics: PerformanceMetric[];
}

interface GeneratedRule {
  id: string;
  pattern: string;
  confidence: number;
  support: number; // Number of occurrences
  winRate: number;
  context: string[];
  provenance: string[]; // Source memories
}
```

#### Context Tracking & Provenance
```typescript
interface ContextTracking {
  sessionId: string;
  decisions: DecisionRecord[];
  memoryUsage: MemoryUsageRecord[];
  outcomes: OutcomeRecord[];
}

interface DecisionRecord {
  timestamp: Date;
  context: string;
  memoriesUsed: string[];
  decision: string;
  reasoning: string;
  confidence: number;
}
```

## 12. IMPLEMENTATION FRAMEWORK

### Memory Storage Architecture
```typescript
interface PersistentCognitionSystem {
  memoryStore: MemoryStore;
  learningEngine: LearningEngine;
  patternMiner: PatternMiner;
  ruleEngine: RuleEngine;
  contextTracker: ContextTracker;
}

interface MemoryStore {
  architecturalMemories: Map<string, ArchitecturalMemory>;
  consolidatedKnowledge: Map<string, ConsolidatedKnowledge>;
  learningMetrics: Map<string, LearningMetric>;
  patternCache: Map<string, PatternCache>;
}
```

### Adaptive Weight Adjustment
```typescript
interface WeightAdjustment {
  baseWeights: Record<string, number>;
  adaptiveWeights: Record<string, number>;
  performanceHistory: PerformanceRecord[];
  adjustmentAlgorithm: 'exponential_decay' | 'momentum' | 'adaptive_rate';
}

interface PerformanceRecord {
  timestamp: Date;
  taskType: string;
  success: boolean;
  weightUsed: number;
  outcome: number; // -1 to 1 scale
}
```

### Learning Feedback Loop
```typescript
interface LearningFeedbackLoop {
  collectOutcomes(): OutcomeData;
  updateWeights(outcomes: OutcomeData): void;
  consolidateMemories(): void;
  generateRules(): ArchitecturalRule[];
  validatePatterns(): PatternValidation[];
  adaptStrategies(): StrategyAdaptation[];
}

interface OutcomeData {
  taskId: string;
  success: boolean;
  performanceMetrics: PerformanceMetric[];
  userFeedback: UserFeedback;
  systemMetrics: SystemMetric[];
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

interface UserFeedback {
  rating: number; // 1-5 scale
  comments: string;
  suggestions: string[];
  approval: boolean;
}
```

### Learning Algorithms Implementation

#### Outcome-Based Ranking Algorithm
```typescript
interface RankingAlgorithm {
  calculateWinRate(memoryId: string): number;
  updateWeights(performanceData: PerformanceRecord[]): void;
  boostSuccessfulMemories(threshold: number): void;
  decayUnusedMemories(decayRate: number): void;
}

// Implementation example
class OutcomeBasedRanking implements RankingAlgorithm {
  calculateWinRate(memoryId: string): number {
    const memory = this.memoryStore.get(memoryId);
    const outcomes = memory.outcomes;
    const successes = outcomes.filter(o => o.success).length;
    return successes / outcomes.length;
  }

  updateWeights(performanceData: PerformanceRecord[]): void {
    performanceData.forEach(record => {
      const weight = this.calculateWeight(record);
      this.adjustMemoryWeight(record.memoryId, weight);
    });
  }
}
```

#### Multi-Armed Bandit Implementation
```typescript
interface MultiArmedBandit {
  selectArm(taskType: string, context: string): string;
  updateReward(armId: string, reward: number): void;
  getOptimalK(taskType: string): number;
}

class UCB1Bandit implements MultiArmedBandit {
  private arms: Map<string, BanditArm> = new Map();
  
  selectArm(taskType: string, context: string): string {
    const availableArms = this.getArmsForTask(taskType);
    const totalPlays = Array.from(availableArms.values())
      .reduce((sum, arm) => sum + arm.plays, 0);
    
    let bestArm = '';
    let bestValue = -Infinity;
    
    for (const [armId, arm] of availableArms) {
      const value = this.calculateUCBValue(arm, totalPlays);
      if (value > bestValue) {
        bestValue = value;
        bestArm = armId;
      }
    }
    
    return bestArm;
  }
  
  private calculateUCBValue(arm: BanditArm, totalPlays: number): number {
    if (arm.plays === 0) return Infinity;
    
    const exploitation = arm.reward / arm.plays;
    const exploration = Math.sqrt(2 * Math.log(totalPlays) / arm.plays);
    
    return exploitation + exploration;
  }
}
```

#### K-Means Memory Clustering
```typescript
interface MemoryClustering {
  clusterMemories(memories: ArchitecturalMemory[], k: number): MemoryCluster[];
  findOptimalK(memories: ArchitecturalMemory[]): number;
  updateClusters(newMemories: ArchitecturalMemory[]): void;
}

class KMeansClustering implements MemoryClustering {
  clusterMemories(memories: ArchitecturalMemory[], k: number): MemoryCluster[] {
    const clusters: MemoryCluster[] = [];
    const centroids = this.initializeCentroids(memories, k);
    
    let converged = false;
    let iterations = 0;
    const maxIterations = 100;
    
    while (!converged && iterations < maxIterations) {
      // Assign memories to nearest centroid
      const assignments = this.assignToClusters(memories, centroids);
      
      // Update centroids
      const newCentroids = this.updateCentroids(assignments, memories);
      
      // Check convergence
      converged = this.checkConvergence(centroids, newCentroids);
      centroids.splice(0, centroids.length, ...newCentroids);
      iterations++;
    }
    
    return this.createClusters(assignments, memories, centroids);
  }
  
  private calculateDistance(memory: ArchitecturalMemory, centroid: ArchitecturalPattern): number {
    // Implement distance calculation based on architectural features
    const contextDistance = this.calculateContextDistance(memory.context, centroid.context);
    const patternDistance = this.calculatePatternDistance(memory.patterns, centroid.patterns);
    const outcomeDistance = this.calculateOutcomeDistance(memory.outcome, centroid.expectedOutcome);
    
    return Math.sqrt(contextDistance + patternDistance + outcomeDistance);
  }
}
```

#### Pattern Mining & Rule Generation
```typescript
interface PatternMiningEngine {
  extractFeatures(memories: ArchitecturalMemory[]): FeatureVector[];
  generateRules(features: FeatureVector[], minSupport: number): ArchitecturalRule[];
  validateRules(rules: ArchitecturalRule[]): ValidationResult[];
}

class AprioriPatternMiner implements PatternMiningEngine {
  generateRules(features: FeatureVector[], minSupport: number): ArchitecturalRule[] {
    const frequentItemsets = this.findFrequentItemsets(features, minSupport);
    const rules: ArchitecturalRule[] = [];
    
    for (const itemset of frequentItemsets) {
      const subsets = this.generateSubsets(itemset);
      
      for (const subset of subsets) {
        const confidence = this.calculateConfidence(subset, itemset);
        if (confidence >= this.minConfidence) {
          const rule = this.createRule(subset, itemset, confidence);
          rules.push(rule);
        }
      }
    }
    
    return rules.sort((a, b) => b.confidence - a.confidence);
  }
  
  private createRule(antecedent: string[], consequent: string[], confidence: number): ArchitecturalRule {
    return {
      id: this.generateRuleId(),
      condition: `IF ${antecedent.join(' AND ')}`,
      action: `THEN ${consequent.join(' AND ')}`,
      confidence,
      supportCount: this.calculateSupport(antecedent),
      winRate: this.calculateWinRate(antecedent, consequent),
      context: this.extractContext(antecedent),
      examples: this.findExamples(antecedent, consequent)
    };
  }
}
```

## 13. INTEGRATION WITH EXISTING ARCHITECTURE

### Enhanced System Image Declaration
```txt
SYSTEM IMAGE (Enhanced with Agentic Learning):
- Framework: Next.js 15 with TypeScript + Persistent Cognition Layer
- Styling: Tailwind CSS with component-scoped styles
- Architecture: Component-based with pages/ and components/ separation
- Learning: Adaptive memory system with outcome-based ranking
- Memory: K-means clustering for pattern consolidation
- Rules: IF/THEN rule generation with confidence scoring
- Context: Multi-armed bandit optimization per task type
- Constraints: No new API routes, maintain existing component interfaces
- Critical Paths: pages/index.tsx, components/Hero.tsx, components/ExamplesSection.tsx
- Existing Types: SectionProps, ExamplesSectionProps, ContributorData patterns
- Learning Metrics: Success rates, pattern confidence, rule validation scores
Agents must internalize this enhanced image before modifying or creating files.
```

### Enhanced Agent Snapshot Protocol
```txt
AGENT SNAPSHOT (with Learning Context)
Files Read:
- pages/index.tsx
- components/Hero.tsx
- components/ExamplesSection.tsx

Components Used:
- CodeExample (CodeExampleProps)
- Section (SectionProps)
- GitHubIcon (GitHubIconProps)

Type Definitions Known:
- LandingPageProps
- ExamplesSectionProps
- ContributorData: Record<string, { avatars: string[]; total: number }>
- SectionProps extends React.PropsWithChildren

Learning Context:
- Similar Tasks: [list of related architectural decisions]
- Successful Patterns: [list of proven approaches]
- Failed Attempts: [list of approaches to avoid]
- Confidence Score: [0-1 based on past performance]

Memory Usage:
- Memories Retrieved: [list of relevant architectural memories]
- Patterns Applied: [list of consolidated patterns used]
- Rules Triggered: [list of generated rules that applied]

Dependencies Known:
- Next.js 15
- React 19
- Tailwind CSS
- TypeScript with strict mode
- Persistent Cognition Layer

Constraints:
- No new API endpoints
- No new external dependencies
- Maintain existing component interfaces
- All new components must have explicit TypeScript interfaces
- Learning decisions must be logged for future improvement
```

## 14. Conclusion

This enhanced specification ensures:

- **Developer Trust**: Agents understand system boundaries and constraints while learning from experience
- **Architectural Fidelity**: Changes maintain existing patterns and dependencies with adaptive improvement
- **Long-term Stability**: Non-destructive defaults prevent system degradation while enabling learning
- **System-aware Collaboration**: Move from prompt-based hacking to architectural understanding with persistent cognition
- **Adaptive Intelligence**: Self-improving system that gets better at architectural decisions over time
- **Pattern Recognition**: Automatic discovery and consolidation of successful architectural patterns
- **Contextual Learning**: Task-specific optimization and context-aware decision making

AGENTS.ARCH.md transforms agent-assisted development from ad-hoc code generation to systematic, architecture-aware collaboration with persistent cognition that respects existing system design while continuously improving through experience.
