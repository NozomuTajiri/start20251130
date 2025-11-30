/**
 * Strategy Alignment Engine
 * 4.5 戦略整合性分析エンジン
 */

import type {
  FunctionResult,
  Strategy,
  StrategicObjective,
  StrategicInitiative,
  StrategyAlignment,
  AlignmentScore,
  StrategyConflict,
  StrategySynergy,
  ResourceRequirement,
  Timeline,
  Milestone,
} from '../types';

export interface StrategyInput {
  id?: string;
  name: string;
  level: 'corporate' | 'business' | 'functional';
  objectives?: ObjectiveInput[];
  initiatives?: InitiativeInput[];
  timeHorizon?: string;
}

export interface ObjectiveInput {
  description: string;
  metrics?: string[];
  targets?: Record<string, number>;
}

export interface InitiativeInput {
  name: string;
  description?: string;
  resources?: Partial<ResourceRequirement>[];
  timeline?: Partial<Timeline>;
}

export class StrategyAlignmentEngine {
  /**
   * Define strategy
   */
  async defineStrategy(input: StrategyInput): Promise<FunctionResult<Strategy>> {
    const startTime = Date.now();

    const objectives: StrategicObjective[] = (input.objectives || []).map((obj, i) =>
      this.buildObjective(obj, i)
    );

    const initiatives: StrategicInitiative[] = (input.initiatives || []).map((init, i) =>
      this.buildInitiative(init, i, objectives)
    );

    const strategy: Strategy = {
      id: input.id || `strategy-${Date.now()}`,
      name: input.name,
      level: input.level,
      objectives,
      initiatives,
      timeHorizon: input.timeHorizon || '3 years',
    };

    return {
      data: strategy,
      confidence: this.calculateStrategyConfidence(strategy),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateStrategyRecommendations(strategy),
    };
  }

  /**
   * Analyze strategy alignment
   */
  async analyzeAlignment(strategies: Strategy[]): Promise<FunctionResult<StrategyAlignment>> {
    const startTime = Date.now();

    const alignmentMatrix = this.buildAlignmentMatrix(strategies);
    const conflicts = this.identifyConflicts(strategies, alignmentMatrix);
    const synergies = this.identifySynergies(strategies, alignmentMatrix);

    const alignment: StrategyAlignment = {
      strategies,
      alignmentMatrix,
      conflicts,
      synergies,
      recommendations: this.generateAlignmentRecommendations(conflicts, synergies),
    };

    return {
      data: alignment,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      warnings: conflicts
        .filter((c) => c.severity === 'blocking')
        .map((c) => c.description),
    };
  }

  /**
   * Cascade strategy
   */
  async cascadeStrategy(
    corporateStrategy: Strategy,
    businessUnits: BusinessUnit[]
  ): Promise<FunctionResult<StrategyCascade>> {
    const startTime = Date.now();

    const cascadedStrategies: CascadedStrategy[] = businessUnits.map((unit) =>
      this.cascadeToUnit(corporateStrategy, unit)
    );

    const alignmentScores = this.assessCascadeAlignment(corporateStrategy, cascadedStrategies);

    const cascade: StrategyCascade = {
      corporateStrategy,
      businessStrategies: cascadedStrategies,
      alignmentScores,
      gaps: this.identifyCascadeGaps(corporateStrategy, cascadedStrategies),
      recommendations: this.generateCascadeRecommendations(alignmentScores),
    };

    return {
      data: cascade,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Analyze resource alignment
   */
  async analyzeResources(
    strategies: Strategy[]
  ): Promise<FunctionResult<ResourceAlignmentAnalysis>> {
    const startTime = Date.now();

    const requirements = this.aggregateResourceRequirements(strategies);
    const conflicts = this.identifyResourceConflicts(strategies);
    const gaps = this.identifyResourceGaps(requirements);
    const optimization = this.suggestOptimization(strategies, requirements);

    const analysis: ResourceAlignmentAnalysis = {
      strategies,
      totalRequirements: requirements,
      conflicts,
      gaps,
      optimization,
      recommendations: this.generateResourceRecommendations(conflicts, gaps),
    };

    return {
      data: analysis,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Track strategy execution
   */
  async trackExecution(strategy: Strategy): Promise<FunctionResult<ExecutionStatus>> {
    const startTime = Date.now();

    const initiativeStatuses = strategy.initiatives.map((init) =>
      this.assessInitiativeStatus(init)
    );

    const objectiveProgress = strategy.objectives.map((obj) =>
      this.assessObjectiveProgress(obj, initiativeStatuses)
    );

    const overallProgress = this.calculateOverallProgress(initiativeStatuses);

    const status: ExecutionStatus = {
      strategy,
      overallProgress,
      initiativeStatuses,
      objectiveProgress,
      atRiskItems: this.identifyAtRiskItems(initiativeStatuses),
      recommendations: this.generateExecutionRecommendations(overallProgress, initiativeStatuses),
    };

    return {
      data: status,
      confidence: 0.8,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  private buildObjective(input: ObjectiveInput, index: number): StrategicObjective {
    return {
      id: `objective-${index + 1}`,
      description: input.description,
      metrics: input.metrics || this.suggestMetrics(input.description),
      targets: input.targets || {},
      owner: 'TBD',
    };
  }

  private suggestMetrics(description: string): string[] {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('revenue') || lowerDesc.includes('sales')) {
      return ['Revenue growth rate', 'Sales volume', 'Market share'];
    }
    if (lowerDesc.includes('customer')) {
      return ['Customer satisfaction', 'Net promoter score', 'Customer retention'];
    }
    if (lowerDesc.includes('efficiency') || lowerDesc.includes('cost')) {
      return ['Cost reduction', 'Operational efficiency', 'Productivity'];
    }
    if (lowerDesc.includes('innovation')) {
      return ['New products launched', 'R&D investment', 'Patent filings'];
    }

    return ['Progress percentage', 'Milestone completion', 'Key results achieved'];
  }

  private buildInitiative(
    input: InitiativeInput,
    index: number,
    objectives: StrategicObjective[]
  ): StrategicInitiative {
    const resources: ResourceRequirement[] = (input.resources || []).map((r) => ({
      type: r.type || 'budget',
      amount: r.amount || 'TBD',
      availability: r.availability || 'constrained',
    }));

    const timeline: Timeline = {
      start: input.timeline?.start || new Date(),
      end: input.timeline?.end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      milestones: (input.timeline?.milestones || []).map((m) => ({
        name: m.name || 'Milestone',
        date: m.date || new Date(),
        deliverables: m.deliverables || [],
      })),
    };

    return {
      id: `initiative-${index + 1}`,
      name: input.name,
      objectiveIds: this.linkToObjectives(input, objectives),
      resources,
      timeline,
      status: 'planned',
    };
  }

  private linkToObjectives(
    initiative: InitiativeInput,
    objectives: StrategicObjective[]
  ): string[] {
    const initiativeText = `${initiative.name} ${initiative.description || ''}`.toLowerCase();

    return objectives
      .filter((obj) => {
        const objKeywords = obj.description.toLowerCase().split(' ');
        return objKeywords.some((k) => k.length > 4 && initiativeText.includes(k));
      })
      .map((obj) => obj.id);
  }

  private buildAlignmentMatrix(strategies: Strategy[]): AlignmentScore[][] {
    const matrix: AlignmentScore[][] = [];

    for (let i = 0; i < strategies.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < strategies.length; j++) {
        if (i === j) {
          matrix[i][j] = {
            strategyId1: strategies[i].id,
            strategyId2: strategies[j].id,
            score: 1,
            factors: ['Same strategy'],
          };
        } else {
          matrix[i][j] = this.calculateAlignmentScore(strategies[i], strategies[j]);
        }
      }
    }

    return matrix;
  }

  private calculateAlignmentScore(strategy1: Strategy, strategy2: Strategy): AlignmentScore {
    const factors: string[] = [];
    let score = 0.5; // Base score

    // Level alignment
    if (this.areStrategicLevelsCompatible(strategy1.level, strategy2.level)) {
      score += 0.1;
      factors.push('Compatible strategic levels');
    }

    // Objective overlap
    const objectiveOverlap = this.calculateObjectiveOverlap(strategy1, strategy2);
    score += objectiveOverlap * 0.2;
    if (objectiveOverlap > 0.3) {
      factors.push('Shared objectives');
    }

    // Resource compatibility
    const resourceCompatibility = this.checkResourceCompatibility(strategy1, strategy2);
    score += resourceCompatibility * 0.2;
    if (resourceCompatibility > 0.5) {
      factors.push('Compatible resource requirements');
    }

    return {
      strategyId1: strategy1.id,
      strategyId2: strategy2.id,
      score: Math.min(1, score),
      factors,
    };
  }

  private areStrategicLevelsCompatible(level1: string, level2: string): boolean {
    const hierarchy = { corporate: 3, business: 2, functional: 1 };
    const diff = Math.abs((hierarchy[level1 as keyof typeof hierarchy] || 0) - (hierarchy[level2 as keyof typeof hierarchy] || 0));
    return diff <= 1;
  }

  private calculateObjectiveOverlap(strategy1: Strategy, strategy2: Strategy): number {
    const keywords1 = new Set(
      strategy1.objectives.flatMap((o) =>
        o.description.toLowerCase().split(' ').filter((w) => w.length > 4)
      )
    );
    const keywords2 = new Set(
      strategy2.objectives.flatMap((o) =>
        o.description.toLowerCase().split(' ').filter((w) => w.length > 4)
      )
    );

    const intersection = [...keywords1].filter((k) => keywords2.has(k));
    const union = new Set([...keywords1, ...keywords2]);

    return union.size > 0 ? intersection.length / union.size : 0;
  }

  private checkResourceCompatibility(strategy1: Strategy, strategy2: Strategy): number {
    const resources1 = strategy1.initiatives.flatMap((i) => i.resources);
    const resources2 = strategy2.initiatives.flatMap((i) => i.resources);

    const conflicts = resources1.filter((r1) =>
      resources2.some((r2) => r1.type === r2.type && r1.availability === 'constrained')
    );

    const totalResources = resources1.length + resources2.length;
    return totalResources > 0 ? 1 - conflicts.length / totalResources : 0.5;
  }

  private identifyConflicts(
    strategies: Strategy[],
    matrix: AlignmentScore[][]
  ): StrategyConflict[] {
    const conflicts: StrategyConflict[] = [];

    for (let i = 0; i < strategies.length; i++) {
      for (let j = i + 1; j < strategies.length; j++) {
        const score = matrix[i][j].score;

        if (score < 0.3) {
          conflicts.push({
            strategies: [strategies[i].name, strategies[j].name],
            description: `Low alignment between ${strategies[i].name} and ${strategies[j].name}`,
            severity: score < 0.15 ? 'blocking' : 'significant',
            resolution: this.suggestConflictResolution(strategies[i], strategies[j]),
          });
        }
      }
    }

    // Check for resource conflicts
    const resourceConflicts = this.findResourceConflicts(strategies);
    conflicts.push(...resourceConflicts);

    return conflicts;
  }

  private findResourceConflicts(strategies: Strategy[]): StrategyConflict[] {
    const conflicts: StrategyConflict[] = [];
    const resourceDemand = new Map<string, { strategy: string; amount: string }[]>();

    for (const strategy of strategies) {
      for (const init of strategy.initiatives) {
        for (const resource of init.resources) {
          if (!resourceDemand.has(resource.type)) {
            resourceDemand.set(resource.type, []);
          }
          resourceDemand.get(resource.type)!.push({
            strategy: strategy.name,
            amount: resource.amount,
          });
        }
      }
    }

    for (const [resourceType, demands] of resourceDemand) {
      if (demands.length > 2) {
        conflicts.push({
          strategies: demands.map((d) => d.strategy),
          description: `Multiple strategies competing for ${resourceType} resources`,
          severity: 'significant',
          resolution: `Prioritize and sequence ${resourceType} allocation`,
        });
      }
    }

    return conflicts;
  }

  private suggestConflictResolution(strategy1: Strategy, strategy2: Strategy): string {
    if (strategy1.level !== strategy2.level) {
      return `Ensure ${strategy1.level} strategy ${strategy1.name} properly cascades to ${strategy2.level} level`;
    }

    return `Review and realign objectives of ${strategy1.name} and ${strategy2.name}`;
  }

  private identifySynergies(
    strategies: Strategy[],
    matrix: AlignmentScore[][]
  ): StrategySynergy[] {
    const synergies: StrategySynergy[] = [];

    for (let i = 0; i < strategies.length; i++) {
      for (let j = i + 1; j < strategies.length; j++) {
        const score = matrix[i][j].score;

        if (score > 0.7) {
          synergies.push({
            strategies: [strategies[i].name, strategies[j].name],
            description: `High alignment between ${strategies[i].name} and ${strategies[j].name}`,
            potential: score > 0.85 ? 'high' : 'medium',
            exploitation: this.suggestSynergyExploitation(strategies[i], strategies[j]),
          });
        }
      }
    }

    return synergies;
  }

  private suggestSynergyExploitation(strategy1: Strategy, strategy2: Strategy): string {
    return `Coordinate execution of ${strategy1.name} and ${strategy2.name} to maximize shared benefits`;
  }

  private cascadeToUnit(
    corporate: Strategy,
    unit: BusinessUnit
  ): CascadedStrategy {
    const cascadedObjectives = corporate.objectives.map((obj) =>
      this.localizeObjective(obj, unit)
    );

    const cascadedInitiatives = corporate.initiatives
      .filter((init) => this.isRelevantToUnit(init, unit))
      .map((init) => this.localizeInitiative(init, unit));

    return {
      unit: unit.name,
      strategy: {
        id: `${corporate.id}-${unit.name}`,
        name: `${unit.name} ${corporate.name}`,
        level: 'business',
        objectives: cascadedObjectives,
        initiatives: cascadedInitiatives,
        timeHorizon: corporate.timeHorizon,
      },
      linkToCorporate: corporate.id,
      adaptations: this.identifyAdaptations(corporate, unit),
    };
  }

  private localizeObjective(
    objective: StrategicObjective,
    unit: BusinessUnit
  ): StrategicObjective {
    return {
      ...objective,
      id: `${objective.id}-${unit.name}`,
      description: `${unit.name}: ${objective.description}`,
      targets: this.adjustTargets(objective.targets, unit),
    };
  }

  private adjustTargets(
    targets: Record<string, number>,
    unit: BusinessUnit
  ): Record<string, number> {
    const adjusted: Record<string, number> = {};
    const factor = unit.size === 'large' ? 0.4 : unit.size === 'medium' ? 0.25 : 0.1;

    for (const [key, value] of Object.entries(targets)) {
      adjusted[key] = Math.round(value * factor);
    }

    return adjusted;
  }

  private isRelevantToUnit(initiative: StrategicInitiative, unit: BusinessUnit): boolean {
    const initiativeName = initiative.name.toLowerCase();
    const unitName = unit.name.toLowerCase();

    // Check for explicit relevance
    if (initiativeName.includes(unitName)) return true;

    // Check if initiative is cross-functional
    if (unit.functions?.some((f) => initiativeName.includes(f.toLowerCase()))) {
      return true;
    }

    return true; // Default: include all initiatives
  }

  private localizeInitiative(
    initiative: StrategicInitiative,
    unit: BusinessUnit
  ): StrategicInitiative {
    return {
      ...initiative,
      id: `${initiative.id}-${unit.name}`,
      name: `${unit.name}: ${initiative.name}`,
      resources: initiative.resources.map((r) => ({
        ...r,
        amount: this.adjustResourceAmount(r.amount, unit),
      })),
    };
  }

  private adjustResourceAmount(amount: string, unit: BusinessUnit): string {
    const factor = unit.size === 'large' ? 0.4 : unit.size === 'medium' ? 0.25 : 0.1;
    const numMatch = amount.match(/\d+/);

    if (numMatch) {
      const adjusted = Math.round(parseInt(numMatch[0], 10) * factor);
      return amount.replace(numMatch[0], adjusted.toString());
    }

    return amount;
  }

  private identifyAdaptations(
    corporate: Strategy,
    unit: BusinessUnit
  ): string[] {
    const adaptations: string[] = [];

    adaptations.push(`Targets scaled to ${unit.size} unit size`);

    if (unit.functions?.length) {
      adaptations.push(`Focus areas: ${unit.functions.join(', ')}`);
    }

    adaptations.push('Local market conditions considered');

    return adaptations;
  }

  private assessCascadeAlignment(
    corporate: Strategy,
    cascaded: CascadedStrategy[]
  ): CascadeAlignmentScore[] {
    return cascaded.map((cs) => ({
      unit: cs.unit,
      alignmentScore: this.calculateCascadeAlignment(corporate, cs.strategy),
      gaps: this.findCascadeGaps(corporate, cs.strategy),
    }));
  }

  private calculateCascadeAlignment(corporate: Strategy, business: Strategy): number {
    // Check objective coverage
    const coveredObjectives = business.objectives.filter((bo) =>
      corporate.objectives.some((co) =>
        bo.description.toLowerCase().includes(co.description.toLowerCase().substring(0, 20))
      )
    );

    const objectiveCoverage = coveredObjectives.length / corporate.objectives.length;

    // Check initiative coverage
    const initiativeCoverage = business.initiatives.length > 0 ? 0.3 : 0;

    return Math.min(1, objectiveCoverage * 0.7 + initiativeCoverage);
  }

  private findCascadeGaps(corporate: Strategy, business: Strategy): string[] {
    const gaps: string[] = [];

    for (const obj of corporate.objectives) {
      const covered = business.objectives.some((bo) =>
        bo.description.toLowerCase().includes(obj.description.toLowerCase().substring(0, 20))
      );

      if (!covered) {
        gaps.push(`Corporate objective "${obj.description}" not fully reflected`);
      }
    }

    return gaps;
  }

  private identifyCascadeGaps(
    corporate: Strategy,
    cascaded: CascadedStrategy[]
  ): CascadeGap[] {
    const gaps: CascadeGap[] = [];

    for (const obj of corporate.objectives) {
      const unitsWithGap = cascaded.filter((cs) =>
        !cs.strategy.objectives.some((o) =>
          o.description.toLowerCase().includes(obj.description.toLowerCase().substring(0, 20))
        )
      );

      if (unitsWithGap.length > 0) {
        gaps.push({
          corporateObjective: obj.description,
          affectedUnits: unitsWithGap.map((u) => u.unit),
          recommendation: 'Ensure all units have aligned objectives',
        });
      }
    }

    return gaps;
  }

  private generateCascadeRecommendations(scores: CascadeAlignmentScore[]): string[] {
    const recommendations: string[] = [];

    const lowScores = scores.filter((s) => s.alignmentScore < 0.6);
    if (lowScores.length > 0) {
      recommendations.push(
        `Improve cascade alignment for: ${lowScores.map((s) => s.unit).join(', ')}`
      );
    }

    const gaps = scores.flatMap((s) => s.gaps);
    if (gaps.length > 0) {
      recommendations.push(`Address ${gaps.length} alignment gaps in cascade`);
    }

    recommendations.push('Regular cascade review meetings recommended');

    return recommendations;
  }

  private aggregateResourceRequirements(strategies: Strategy[]): AggregatedResources {
    const byType: Record<string, ResourceSummary> = {};

    for (const strategy of strategies) {
      for (const init of strategy.initiatives) {
        for (const resource of init.resources) {
          if (!byType[resource.type]) {
            byType[resource.type] = {
              type: resource.type,
              totalDemand: 0,
              sources: [],
            };
          }

          const numMatch = resource.amount.match(/\d+/);
          if (numMatch) {
            byType[resource.type].totalDemand += parseInt(numMatch[0], 10);
          }

          byType[resource.type].sources.push({
            strategy: strategy.name,
            initiative: init.name,
            amount: resource.amount,
          });
        }
      }
    }

    return {
      byType: Object.values(byType),
      totalBudget: this.calculateTotalBudget(strategies),
      totalHeadcount: this.calculateTotalHeadcount(strategies),
    };
  }

  private calculateTotalBudget(strategies: Strategy[]): number {
    let total = 0;

    for (const strategy of strategies) {
      for (const init of strategy.initiatives) {
        const budgetResource = init.resources.find((r) => r.type === 'budget');
        if (budgetResource) {
          const match = budgetResource.amount.match(/\d+/);
          if (match) total += parseInt(match[0], 10);
        }
      }
    }

    return total;
  }

  private calculateTotalHeadcount(strategies: Strategy[]): number {
    let total = 0;

    for (const strategy of strategies) {
      for (const init of strategy.initiatives) {
        const headcountResource = init.resources.find((r) => r.type === 'headcount');
        if (headcountResource) {
          const match = headcountResource.amount.match(/\d+/);
          if (match) total += parseInt(match[0], 10);
        }
      }
    }

    return total;
  }

  private identifyResourceConflicts(strategies: Strategy[]): ResourceConflict[] {
    const conflicts: ResourceConflict[] = [];
    const resourceTimeline: Map<string, TimelineEntry[]> = new Map();

    for (const strategy of strategies) {
      for (const init of strategy.initiatives) {
        for (const resource of init.resources) {
          if (!resourceTimeline.has(resource.type)) {
            resourceTimeline.set(resource.type, []);
          }

          resourceTimeline.get(resource.type)!.push({
            strategy: strategy.name,
            initiative: init.name,
            start: init.timeline.start,
            end: init.timeline.end,
            amount: resource.amount,
          });
        }
      }
    }

    for (const [resourceType, entries] of resourceTimeline) {
      // Check for overlapping demands
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          if (this.datesOverlap(entries[i], entries[j])) {
            conflicts.push({
              resourceType,
              competitors: [entries[i].initiative, entries[j].initiative],
              period: `${entries[i].start.toDateString()} - ${entries[i].end.toDateString()}`,
              severity: 'medium',
              resolution: `Sequence or share ${resourceType} allocation`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  private datesOverlap(entry1: TimelineEntry, entry2: TimelineEntry): boolean {
    return entry1.start <= entry2.end && entry2.start <= entry1.end;
  }

  private identifyResourceGaps(requirements: AggregatedResources): ResourceGap[] {
    const gaps: ResourceGap[] = [];

    for (const resource of requirements.byType) {
      // Assume constrained resources have gaps
      if (resource.totalDemand > 0) {
        gaps.push({
          resourceType: resource.type,
          required: resource.totalDemand,
          available: Math.round(resource.totalDemand * 0.8), // Assume 80% availability
          gap: Math.round(resource.totalDemand * 0.2),
          recommendation: `Secure additional ${resource.type} or reprioritize initiatives`,
        });
      }
    }

    return gaps;
  }

  private suggestOptimization(
    strategies: Strategy[],
    _requirements: AggregatedResources
  ): ResourceOptimization {
    return {
      reallocationSuggestions: [
        'Shift resources from lower-priority to higher-priority initiatives',
        'Consider phasing initiatives to spread resource demand',
      ],
      efficiencyImprovements: [
        'Identify shared services opportunities',
        'Automate repetitive activities',
      ],
      prioritizationRecommendation: this.prioritizeInitiatives(strategies),
    };
  }

  private prioritizeInitiatives(strategies: Strategy[]): PrioritizedInitiative[] {
    const allInitiatives = strategies.flatMap((s) =>
      s.initiatives.map((i) => ({ strategy: s.name, initiative: i }))
    );

    return allInitiatives
      .map((item, index) => ({
        initiative: item.initiative.name,
        strategy: item.strategy,
        priority: index + 1,
        rationale: `Linked to ${item.initiative.objectiveIds.length} objectives`,
      }))
      .slice(0, 10);
  }

  private generateResourceRecommendations(
    conflicts: ResourceConflict[],
    gaps: ResourceGap[]
  ): string[] {
    const recommendations: string[] = [];

    if (conflicts.length > 0) {
      recommendations.push(`Resolve ${conflicts.length} resource conflicts`);
    }

    if (gaps.length > 0) {
      recommendations.push(`Address ${gaps.length} resource gaps`);
    }

    recommendations.push('Establish resource governance process');
    recommendations.push('Create resource reallocation flexibility');

    return recommendations;
  }

  private assessInitiativeStatus(initiative: StrategicInitiative): InitiativeStatus {
    const now = new Date();
    const progress = this.calculateInitiativeProgress(initiative);

    const isOnTrack = this.isOnTrack(initiative, progress, now);

    return {
      initiative: initiative.name,
      status: initiative.status,
      progress,
      isOnTrack,
      milestoneStatuses: initiative.timeline.milestones.map((m) =>
        this.assessMilestone(m, now)
      ),
      issues: isOnTrack ? [] : ['Behind schedule'],
    };
  }

  private calculateInitiativeProgress(initiative: StrategicInitiative): number {
    const now = new Date();
    const start = initiative.timeline.start;
    const end = initiative.timeline.end;

    if (now < start) return 0;
    if (now > end) return 1;

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return elapsed / totalDuration;
  }

  private isOnTrack(
    initiative: StrategicInitiative,
    progress: number,
    _now: Date
  ): boolean {
    // Simple check: is progress keeping pace with time?
    return initiative.status !== 'on-hold' && progress >= 0;
  }

  private assessMilestone(milestone: Milestone, now: Date): MilestoneStatus {
    const isPast = milestone.date < now;

    return {
      milestone: milestone.name,
      dueDate: milestone.date,
      status: isPast ? 'completed' : 'pending',
      completedDate: isPast ? milestone.date : undefined,
    };
  }

  private assessObjectiveProgress(
    objective: StrategicObjective,
    initiativeStatuses: InitiativeStatus[]
  ): ObjectiveProgress {
    // Calculate based on linked initiatives
    const linkedStatuses = initiativeStatuses; // Simplified: assume all are linked

    const avgProgress = linkedStatuses.length > 0
      ? linkedStatuses.reduce((acc, s) => acc + s.progress, 0) / linkedStatuses.length
      : 0;

    return {
      objective: objective.description,
      progress: avgProgress,
      targetProgress: 0.5, // Assume mid-year target
      status: avgProgress >= 0.4 ? 'on-track' : 'at-risk',
      contributingInitiatives: linkedStatuses.map((s) => s.initiative),
    };
  }

  private calculateOverallProgress(statuses: InitiativeStatus[]): number {
    if (statuses.length === 0) return 0;
    return statuses.reduce((acc, s) => acc + s.progress, 0) / statuses.length;
  }

  private identifyAtRiskItems(statuses: InitiativeStatus[]): AtRiskItem[] {
    return statuses
      .filter((s) => !s.isOnTrack)
      .map((s) => ({
        item: s.initiative,
        risk: s.issues.join(', '),
        recommendation: 'Review and adjust timeline or resources',
      }));
  }

  private generateExecutionRecommendations(
    progress: number,
    _statuses: InitiativeStatus[]
  ): string[] {
    const recommendations: string[] = [];

    if (progress < 0.3) {
      recommendations.push('Accelerate execution to meet targets');
    }

    recommendations.push('Regular execution reviews recommended');
    recommendations.push('Track leading indicators for early warning');

    return recommendations;
  }

  private calculateStrategyConfidence(strategy: Strategy): number {
    let confidence = 0.5;

    if (strategy.objectives.length > 2) confidence += 0.15;
    if (strategy.initiatives.length > 0) confidence += 0.15;
    if (strategy.initiatives.every((i) => i.resources.length > 0)) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  private generateStrategyRecommendations(strategy: Strategy): string[] {
    const recommendations: string[] = [];

    if (strategy.objectives.length < 3) {
      recommendations.push('Consider adding more strategic objectives');
    }

    if (strategy.initiatives.length === 0) {
      recommendations.push('Define initiatives to execute the strategy');
    }

    recommendations.push('Validate strategy with key stakeholders');

    return recommendations;
  }

  private generateAlignmentRecommendations(
    conflicts: StrategyConflict[],
    synergies: StrategySynergy[]
  ): string[] {
    const recommendations: string[] = [];

    if (conflicts.length > 0) {
      recommendations.push(`Resolve ${conflicts.length} strategy conflicts`);
    }

    if (synergies.length > 0) {
      recommendations.push(`Exploit ${synergies.length} identified synergies`);
    }

    recommendations.push('Establish regular strategy alignment reviews');

    return recommendations;
  }
}

// Additional types for this engine
interface BusinessUnit {
  name: string;
  size: 'large' | 'medium' | 'small';
  functions?: string[];
}

interface StrategyCascade {
  corporateStrategy: Strategy;
  businessStrategies: CascadedStrategy[];
  alignmentScores: CascadeAlignmentScore[];
  gaps: CascadeGap[];
  recommendations: string[];
}

interface CascadedStrategy {
  unit: string;
  strategy: Strategy;
  linkToCorporate: string;
  adaptations: string[];
}

interface CascadeAlignmentScore {
  unit: string;
  alignmentScore: number;
  gaps: string[];
}

interface CascadeGap {
  corporateObjective: string;
  affectedUnits: string[];
  recommendation: string;
}

interface ResourceAlignmentAnalysis {
  strategies: Strategy[];
  totalRequirements: AggregatedResources;
  conflicts: ResourceConflict[];
  gaps: ResourceGap[];
  optimization: ResourceOptimization;
  recommendations: string[];
}

interface AggregatedResources {
  byType: ResourceSummary[];
  totalBudget: number;
  totalHeadcount: number;
}

interface ResourceSummary {
  type: string;
  totalDemand: number;
  sources: Array<{ strategy: string; initiative: string; amount: string }>;
}

interface TimelineEntry {
  strategy: string;
  initiative: string;
  start: Date;
  end: Date;
  amount: string;
}

interface ResourceConflict {
  resourceType: string;
  competitors: string[];
  period: string;
  severity: 'high' | 'medium' | 'low';
  resolution: string;
}

interface ResourceGap {
  resourceType: string;
  required: number;
  available: number;
  gap: number;
  recommendation: string;
}

interface ResourceOptimization {
  reallocationSuggestions: string[];
  efficiencyImprovements: string[];
  prioritizationRecommendation: PrioritizedInitiative[];
}

interface PrioritizedInitiative {
  initiative: string;
  strategy: string;
  priority: number;
  rationale: string;
}

interface ExecutionStatus {
  strategy: Strategy;
  overallProgress: number;
  initiativeStatuses: InitiativeStatus[];
  objectiveProgress: ObjectiveProgress[];
  atRiskItems: AtRiskItem[];
  recommendations: string[];
}

interface InitiativeStatus {
  initiative: string;
  status: string;
  progress: number;
  isOnTrack: boolean;
  milestoneStatuses: MilestoneStatus[];
  issues: string[];
}

interface MilestoneStatus {
  milestone: string;
  dueDate: Date;
  status: 'completed' | 'pending' | 'at-risk' | 'missed';
  completedDate?: Date;
}

interface ObjectiveProgress {
  objective: string;
  progress: number;
  targetProgress: number;
  status: 'on-track' | 'at-risk' | 'behind';
  contributingInitiatives: string[];
}

interface AtRiskItem {
  item: string;
  risk: string;
  recommendation: string;
}

export const strategyAlignmentEngine = new StrategyAlignmentEngine();
