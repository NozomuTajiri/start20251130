/**
 * Organizational Capability Engine
 * 4.1 組織能力分析エンジン
 */

import type {
  FunctionResult,
  OrganizationalCapability,
  CapabilityComponent,
  CapabilityAssessment,
  StrategicGap,
  DevelopmentPriority,
} from '../types';

export interface CapabilityInput {
  capabilities: CapabilityData[];
  organizationContext?: OrganizationContext;
  strategicPriorities?: string[];
}

export interface CapabilityData {
  name: string;
  category?: 'core' | 'supporting' | 'dynamic';
  components?: Partial<CapabilityComponent>[];
  currentLevel?: number;
  targetLevel?: number;
}

export interface OrganizationContext {
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  maturityStage: 'startup' | 'growth' | 'mature' | 'renewal';
  competitivePosition: string;
}

export class OrganizationalCapabilityEngine {
  private industryBenchmarks: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.initializeBenchmarks();
  }

  /**
   * Assess organizational capabilities
   */
  async assess(input: CapabilityInput): Promise<FunctionResult<CapabilityAssessment>> {
    const startTime = Date.now();

    const capabilities = input.capabilities.map((cap, index) =>
      this.buildCapability(cap, index)
    );

    const strengths = this.identifyStrengths(capabilities);
    const weaknesses = this.identifyWeaknesses(capabilities);
    const strategicGaps = this.analyzeStrategicGaps(
      capabilities,
      input.strategicPriorities || []
    );
    const developmentPriorities = this.prioritizeDevelopment(
      capabilities,
      strategicGaps,
      input.strategicPriorities
    );

    const assessment: CapabilityAssessment = {
      capabilities,
      overallMaturity: this.calculateOverallMaturity(capabilities),
      strengths,
      weaknesses,
      strategicGaps,
      developmentPriorities,
    };

    return {
      data: assessment,
      confidence: this.calculateConfidence(capabilities),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateRecommendations(assessment),
    };
  }

  /**
   * Benchmark capabilities against industry standards
   */
  async benchmark(
    capabilities: OrganizationalCapability[],
    industry: string
  ): Promise<FunctionResult<BenchmarkResult>> {
    const startTime = Date.now();

    const benchmarks = this.industryBenchmarks.get(industry) || new Map();
    const comparisons: CapabilityComparison[] = [];

    for (const cap of capabilities) {
      const benchmark = benchmarks.get(cap.name) || 3;
      comparisons.push({
        capability: cap.name,
        currentLevel: cap.currentLevel,
        benchmarkLevel: benchmark,
        gap: cap.currentLevel - benchmark,
        position: this.determinePosition(cap.currentLevel, benchmark),
      });
    }

    const result: BenchmarkResult = {
      industry,
      comparisons,
      overallPosition: this.calculateOverallPosition(comparisons),
      competitiveAdvantages: comparisons
        .filter((c) => c.position === 'leader')
        .map((c) => c.capability),
      competitiveDisadvantages: comparisons
        .filter((c) => c.position === 'laggard')
        .map((c) => c.capability),
    };

    return {
      data: result,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Identify capability dependencies
   */
  async analyzeDependencies(
    capabilities: OrganizationalCapability[]
  ): Promise<FunctionResult<DependencyAnalysis>> {
    const startTime = Date.now();

    const dependencies: CapabilityDependency[] = [];

    for (const cap of capabilities) {
      for (const depName of cap.dependencies) {
        const dependent = capabilities.find((c) => c.name === depName);
        if (dependent) {
          dependencies.push({
            from: cap.name,
            to: depName,
            strength: this.estimateDependencyStrength(cap, dependent),
            type: this.classifyDependency(cap, dependent),
          });
        }
      }
    }

    const criticalPath = this.findCriticalPath(capabilities, dependencies);
    const bottlenecks = this.identifyBottlenecks(capabilities, dependencies);

    const result: DependencyAnalysis = {
      dependencies,
      criticalPath,
      bottlenecks,
      clusters: this.clusterCapabilities(capabilities, dependencies),
    };

    return {
      data: result,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Generate capability development plan
   */
  async generateDevelopmentPlan(
    assessment: CapabilityAssessment,
    _constraints?: DevelopmentConstraints
  ): Promise<FunctionResult<DevelopmentPlan>> {
    const startTime = Date.now();

    const phases: DevelopmentPhase[] = [];
    const sortedPriorities = [...assessment.developmentPriorities].sort(
      (a, b) => a.priority - b.priority
    );

    // Group priorities into phases
    const phasesCount = Math.min(3, Math.ceil(sortedPriorities.length / 3));
    for (let i = 0; i < phasesCount; i++) {
      const phaseItems = sortedPriorities.slice(i * 3, (i + 1) * 3);
      if (phaseItems.length > 0) {
        phases.push({
          phase: i + 1,
          name: this.getPhaseNAme(i),
          capabilities: phaseItems.map((p) => p.capability),
          duration: phaseItems[0]?.expectedTimeframe || '3 months',
          objectives: phaseItems.map(
            (p) => `Develop ${p.capability} capability`
          ),
          milestones: this.generateMilestones(phaseItems),
        });
      }
    }

    const plan: DevelopmentPlan = {
      vision: 'Build world-class organizational capabilities',
      phases,
      totalDuration: this.calculateTotalDuration(phases),
      investmentRequired: this.estimateInvestment(sortedPriorities),
      expectedOutcomes: this.projectOutcomes(assessment),
      risks: this.identifyDevelopmentRisks(assessment),
    };

    return {
      data: plan,
      confidence: 0.65,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: [
        'Start with foundational capabilities before building advanced ones',
        'Ensure adequate resources before starting each phase',
        'Monitor progress regularly and adjust as needed',
      ],
    };
  }

  private buildCapability(data: CapabilityData, index: number): OrganizationalCapability {
    const currentLevel = data.currentLevel || 3;
    const targetLevel = data.targetLevel || 4;

    return {
      id: `cap-${index + 1}`,
      name: data.name,
      category: data.category || this.inferCategory(data.name),
      currentLevel,
      targetLevel,
      gap: targetLevel - currentLevel,
      components: (data.components || []).map((c) => ({
        name: c.name || 'Component',
        type: c.type || 'process',
        maturityLevel: c.maturityLevel || currentLevel,
        description: c.description || '',
      })),
      dependencies: this.inferDependencies(data.name),
    };
  }

  private inferCategory(name: string): 'core' | 'supporting' | 'dynamic' {
    const corePatterms = ['product', 'service', 'customer', 'market', 'technology'];
    const dynamicPatterns = ['innovation', 'learning', 'agility', 'adaptation'];

    const lowerName = name.toLowerCase();

    if (dynamicPatterns.some((p) => lowerName.includes(p))) {
      return 'dynamic';
    }
    if (corePatterms.some((p) => lowerName.includes(p))) {
      return 'core';
    }
    return 'supporting';
  }

  private inferDependencies(name: string): string[] {
    const dependencyMap: Record<string, string[]> = {
      innovation: ['learning', 'technology', 'culture'],
      technology: ['infrastructure', 'talent'],
      customer: ['product', 'service', 'marketing'],
      leadership: ['culture', 'talent'],
      operations: ['process', 'technology', 'quality'],
    };

    const lowerName = name.toLowerCase();
    for (const [key, deps] of Object.entries(dependencyMap)) {
      if (lowerName.includes(key)) {
        return deps;
      }
    }
    return [];
  }

  private identifyStrengths(capabilities: OrganizationalCapability[]): string[] {
    return capabilities
      .filter((c) => c.currentLevel >= 4)
      .map((c) => `Strong ${c.name} capability (Level ${c.currentLevel})`);
  }

  private identifyWeaknesses(capabilities: OrganizationalCapability[]): string[] {
    return capabilities
      .filter((c) => c.currentLevel <= 2)
      .map((c) => `Weak ${c.name} capability requires development`);
  }

  private analyzeStrategicGaps(
    capabilities: OrganizationalCapability[],
    priorities: string[]
  ): StrategicGap[] {
    return capabilities
      .filter((c) => c.gap > 0)
      .map((c) => ({
        capability: c.name,
        currentState: `Level ${c.currentLevel}`,
        desiredState: `Level ${c.targetLevel}`,
        impact: this.assessGapImpact(c, priorities),
        closingStrategies: this.generateClosingStrategies(c),
      }));
  }

  private assessGapImpact(
    capability: OrganizationalCapability,
    priorities: string[]
  ): 'critical' | 'high' | 'medium' | 'low' {
    const isPriority = priorities.some((p) =>
      capability.name.toLowerCase().includes(p.toLowerCase())
    );
    const isCore = capability.category === 'core';

    if (isPriority && capability.gap >= 2) return 'critical';
    if (isPriority || (isCore && capability.gap >= 2)) return 'high';
    if (capability.gap >= 2) return 'medium';
    return 'low';
  }

  private generateClosingStrategies(capability: OrganizationalCapability): string[] {
    const strategies: string[] = [];

    if (capability.gap >= 2) {
      strategies.push('Consider external partnerships or acquisitions');
    }
    strategies.push('Develop internal training programs');
    strategies.push('Hire experienced talent');
    if (capability.category === 'dynamic') {
      strategies.push('Establish learning and experimentation culture');
    }

    return strategies;
  }

  private prioritizeDevelopment(
    capabilities: OrganizationalCapability[],
    gaps: StrategicGap[],
    _priorities?: string[]
  ): DevelopmentPriority[] {
    const impactOrder = { critical: 1, high: 2, medium: 3, low: 4 };

    return gaps
      .map((gap, index) => {
        const cap = capabilities.find((c) => c.name === gap.capability);
        return {
          capability: gap.capability,
          priority: impactOrder[gap.impact] * 10 + index,
          rationale: `${gap.impact} impact gap from ${gap.currentState} to ${gap.desiredState}`,
          requiredInvestment: this.estimateCapabilityInvestment(cap),
          expectedTimeframe: this.estimateTimeframe(gap.impact),
        };
      })
      .sort((a, b) => a.priority - b.priority);
  }

  private estimateCapabilityInvestment(cap?: OrganizationalCapability): string {
    if (!cap) return 'Medium';
    if (cap.gap >= 2) return 'High';
    if (cap.gap === 1) return 'Medium';
    return 'Low';
  }

  private estimateTimeframe(impact: string): string {
    switch (impact) {
      case 'critical':
        return '3-6 months';
      case 'high':
        return '6-12 months';
      case 'medium':
        return '12-18 months';
      default:
        return '18-24 months';
    }
  }

  private calculateOverallMaturity(capabilities: OrganizationalCapability[]): number {
    if (capabilities.length === 0) return 0;
    const sum = capabilities.reduce((acc, c) => acc + c.currentLevel, 0);
    return sum / capabilities.length;
  }

  private calculateConfidence(capabilities: OrganizationalCapability[]): number {
    // Higher confidence with more complete data
    let score = 0.5;
    if (capabilities.length > 5) score += 0.1;
    if (capabilities.every((c) => c.components.length > 0)) score += 0.2;
    if (capabilities.every((c) => c.dependencies.length > 0)) score += 0.1;
    return Math.min(0.95, score);
  }

  private generateRecommendations(assessment: CapabilityAssessment): string[] {
    const recommendations: string[] = [];

    if (assessment.overallMaturity < 3) {
      recommendations.push('Focus on foundational capability building');
    }
    if (assessment.strategicGaps.some((g) => g.impact === 'critical')) {
      recommendations.push('Address critical capability gaps immediately');
    }
    if (assessment.strengths.length > 0) {
      recommendations.push('Leverage existing strengths to accelerate development');
    }

    return recommendations;
  }

  private determinePosition(
    current: number,
    benchmark: number
  ): 'leader' | 'competitive' | 'average' | 'laggard' {
    const gap = current - benchmark;
    if (gap >= 1) return 'leader';
    if (gap >= 0) return 'competitive';
    if (gap >= -1) return 'average';
    return 'laggard';
  }

  private calculateOverallPosition(
    comparisons: CapabilityComparison[]
  ): 'leader' | 'competitive' | 'average' | 'laggard' {
    const avgGap =
      comparisons.reduce((acc, c) => acc + c.gap, 0) / comparisons.length;
    return this.determinePosition(avgGap + 3, 3);
  }

  private estimateDependencyStrength(
    cap: OrganizationalCapability,
    _dependent: OrganizationalCapability
  ): number {
    // Core capabilities have stronger dependencies
    if (cap.category === 'core') return 0.8;
    if (cap.category === 'dynamic') return 0.6;
    return 0.5;
  }

  private classifyDependency(
    cap: OrganizationalCapability,
    dependent: OrganizationalCapability
  ): 'enables' | 'requires' | 'enhances' {
    if (cap.category === 'supporting' && dependent.category === 'core') {
      return 'enables';
    }
    if (cap.category === 'dynamic') {
      return 'enhances';
    }
    return 'requires';
  }

  private findCriticalPath(
    capabilities: OrganizationalCapability[],
    dependencies: CapabilityDependency[]
  ): string[] {
    // Find capabilities that are most depended upon
    const dependencyCount = new Map<string, number>();

    for (const dep of dependencies) {
      dependencyCount.set(dep.to, (dependencyCount.get(dep.to) || 0) + 1);
    }

    return capabilities
      .filter((c) => (dependencyCount.get(c.name) || 0) > 1)
      .sort((a, b) => (dependencyCount.get(b.name) || 0) - (dependencyCount.get(a.name) || 0))
      .map((c) => c.name);
  }

  private identifyBottlenecks(
    capabilities: OrganizationalCapability[],
    dependencies: CapabilityDependency[]
  ): string[] {
    // Capabilities that are heavily depended upon but have low maturity
    const dependencyCount = new Map<string, number>();

    for (const dep of dependencies) {
      dependencyCount.set(dep.to, (dependencyCount.get(dep.to) || 0) + 1);
    }

    return capabilities
      .filter(
        (c) => (dependencyCount.get(c.name) || 0) > 1 && c.currentLevel < 3
      )
      .map((c) => c.name);
  }

  private clusterCapabilities(
    capabilities: OrganizationalCapability[],
    _dependencies: CapabilityDependency[]
  ): CapabilityCluster[] {
    // Group by category
    const clusters: CapabilityCluster[] = [];
    const byCategory = new Map<string, OrganizationalCapability[]>();

    for (const cap of capabilities) {
      const category = cap.category;
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(cap);
    }

    for (const [category, caps] of byCategory) {
      clusters.push({
        name: `${category} capabilities`,
        capabilities: caps.map((c) => c.name),
        cohesion: 0.7,
      });
    }

    return clusters;
  }

  private getPhaseNAme(index: number): string {
    const names = ['Foundation', 'Acceleration', 'Excellence'];
    return names[index] || `Phase ${index + 1}`;
  }

  private generateMilestones(priorities: DevelopmentPriority[]): string[] {
    return priorities.map(
      (p) => `${p.capability} reaches target level within ${p.expectedTimeframe}`
    );
  }

  private calculateTotalDuration(phases: DevelopmentPhase[]): string {
    const totalMonths = phases.reduce((acc, p) => {
      const match = p.duration.match(/(\d+)/);
      return acc + (match ? parseInt(match[1], 10) : 3);
    }, 0);
    return `${totalMonths} months`;
  }

  private estimateInvestment(priorities: DevelopmentPriority[]): string {
    const highCount = priorities.filter((p) => p.requiredInvestment === 'High').length;
    if (highCount > priorities.length / 2) return 'Significant investment required';
    return 'Moderate investment required';
  }

  private projectOutcomes(assessment: CapabilityAssessment): string[] {
    return [
      `Overall maturity improvement from ${assessment.overallMaturity.toFixed(1)} to ${(assessment.overallMaturity + 1).toFixed(1)}`,
      `Address ${assessment.strategicGaps.filter((g) => g.impact === 'critical').length} critical gaps`,
      `Build ${assessment.developmentPriorities.length} key capabilities`,
    ];
  }

  private identifyDevelopmentRisks(assessment: CapabilityAssessment): string[] {
    const risks: string[] = [];

    if (assessment.strategicGaps.length > 5) {
      risks.push('Scope creep due to multiple gaps');
    }
    if (assessment.overallMaturity < 2) {
      risks.push('Low baseline may require longer development time');
    }
    risks.push('Resource constraints may delay implementation');
    risks.push('Change resistance from organization');

    return risks;
  }

  private initializeBenchmarks(): void {
    const techBenchmarks = new Map<string, number>();
    techBenchmarks.set('Technology', 4);
    techBenchmarks.set('Innovation', 3.5);
    techBenchmarks.set('Operations', 3.5);
    this.industryBenchmarks.set('technology', techBenchmarks);

    const financeBenchmarks = new Map<string, number>();
    financeBenchmarks.set('Risk Management', 4);
    financeBenchmarks.set('Compliance', 4.5);
    financeBenchmarks.set('Operations', 4);
    this.industryBenchmarks.set('finance', financeBenchmarks);
  }
}

// Additional types for this engine
interface BenchmarkResult {
  industry: string;
  comparisons: CapabilityComparison[];
  overallPosition: 'leader' | 'competitive' | 'average' | 'laggard';
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
}

interface CapabilityComparison {
  capability: string;
  currentLevel: number;
  benchmarkLevel: number;
  gap: number;
  position: 'leader' | 'competitive' | 'average' | 'laggard';
}

interface DependencyAnalysis {
  dependencies: CapabilityDependency[];
  criticalPath: string[];
  bottlenecks: string[];
  clusters: CapabilityCluster[];
}

interface CapabilityDependency {
  from: string;
  to: string;
  strength: number;
  type: 'enables' | 'requires' | 'enhances';
}

interface CapabilityCluster {
  name: string;
  capabilities: string[];
  cohesion: number;
}

interface DevelopmentConstraints {
  budget?: number;
  timeline?: string;
  resources?: number;
}

interface DevelopmentPlan {
  vision: string;
  phases: DevelopmentPhase[];
  totalDuration: string;
  investmentRequired: string;
  expectedOutcomes: string[];
  risks: string[];
}

interface DevelopmentPhase {
  phase: number;
  name: string;
  capabilities: string[];
  duration: string;
  objectives: string[];
  milestones: string[];
}

export const organizationalCapabilityEngine = new OrganizationalCapabilityEngine();
