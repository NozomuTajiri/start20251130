/**
 * Dynamic Goal Engine
 * 4.12 動的目標管理エンジン
 */

import type {
  FunctionResult,
  Goal,
  GoalHierarchy,
  GoalRelationship,
  DynamicGoalManagement,
  GoalProgress,
  MilestoneStatus,
  GoalAdjustment,
  GoalAlert,
  GoalForecast,
} from '../types';

export interface GoalInput {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  owner?: string;
  dueDate?: Date;
  parentId?: string;
  metrics?: MetricInput[];
}

export interface MetricInput {
  name: string;
  baseline: number;
  target: number;
  current?: number;
}

export interface GoalContext {
  organizationLevel: 'corporate' | 'business' | 'team' | 'individual';
  timeframe?: string;
  strategicPriorities?: string[];
}

export class DynamicGoalEngine {
  /**
   * Create goal hierarchy
   */
  async createHierarchy(
    goals: GoalInput[],
    context?: GoalContext
  ): Promise<FunctionResult<GoalHierarchy>> {
    const startTime = Date.now();

    const builtGoals = goals.map((g, i) => this.buildGoal(g, i, context));
    const relationships = this.buildRelationships(goals);
    const alignmentScore = this.calculateAlignmentScore(builtGoals, relationships);

    const hierarchy: GoalHierarchy = {
      goals: builtGoals,
      relationships,
      alignmentScore,
    };

    return {
      data: hierarchy,
      confidence: this.calculateConfidence(hierarchy),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateHierarchyRecommendations(hierarchy),
    };
  }

  /**
   * Manage goals dynamically
   */
  async manage(
    hierarchy: GoalHierarchy,
    currentStatus: GoalStatusInput[]
  ): Promise<FunctionResult<DynamicGoalManagement>> {
    const startTime = Date.now();

    const progress = this.assessProgress(hierarchy, currentStatus);
    const adjustments = this.identifyAdjustments(hierarchy, progress);
    const alerts = this.generateAlerts(progress);
    const forecasts = this.generateForecasts(hierarchy, progress);

    const management: DynamicGoalManagement = {
      hierarchy,
      progress,
      adjustments,
      alerts,
      forecasts,
    };

    return {
      data: management,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateManagementRecommendations(management),
    };
  }

  /**
   * Align goals with strategy
   */
  async alignWithStrategy(
    hierarchy: GoalHierarchy,
    strategicObjectives: StrategicObjective[]
  ): Promise<FunctionResult<AlignmentAnalysis>> {
    const startTime = Date.now();

    const mappings = this.mapGoalsToObjectives(hierarchy, strategicObjectives);
    const coverage = this.calculateCoverage(strategicObjectives, mappings);
    const gaps = this.identifyAlignmentGaps(strategicObjectives, mappings);
    const recommendations = this.generateAlignmentRecommendations(coverage, gaps);

    const analysis: AlignmentAnalysis = {
      mappings,
      coverage,
      gaps,
      recommendations,
    };

    return {
      data: analysis,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Cascade goals
   */
  async cascade(
    topLevelGoal: Goal,
    targetLevels: CascadeLevel[]
  ): Promise<FunctionResult<CascadedGoals>> {
    const startTime = Date.now();

    const cascadedGoals = this.generateCascadedGoals(topLevelGoal, targetLevels);
    const relationships = this.buildCascadeRelationships(topLevelGoal, cascadedGoals);
    const alignmentScore = this.calculateCascadeAlignment(topLevelGoal, cascadedGoals);

    const cascaded: CascadedGoals = {
      sourceGoal: topLevelGoal,
      cascadedGoals,
      relationships,
      alignmentScore,
    };

    return {
      data: cascaded,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: [
        'Review cascaded goals with each level owner',
        'Ensure metrics are appropriately scaled',
        'Maintain regular alignment reviews',
      ],
    };
  }

  /**
   * Optimize goal portfolio
   */
  async optimize(
    hierarchy: GoalHierarchy,
    constraints: PortfolioConstraints
  ): Promise<FunctionResult<OptimizedPortfolio>> {
    const startTime = Date.now();

    const prioritizedGoals = this.prioritizeGoals(hierarchy.goals, constraints);
    const resourceAllocation = this.optimizeResources(prioritizedGoals, constraints);
    const tradeoffs = this.identifyTradeoffs(prioritizedGoals, constraints);
    const recommendations = this.generateOptimizationRecommendations(prioritizedGoals, tradeoffs);

    const portfolio: OptimizedPortfolio = {
      prioritizedGoals,
      resourceAllocation,
      tradeoffs,
      recommendations,
    };

    return {
      data: portfolio,
      confidence: 0.65,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  private buildGoal(input: GoalInput, index: number, context?: GoalContext): Goal {
    return {
      id: input.id || `goal-${index + 1}`,
      name: input.name,
      description: input.description || input.name,
      category: input.category || this.inferCategory(input.name, context),
      owner: input.owner || 'TBD',
      dueDate: input.dueDate || this.calculateDefaultDueDate(context),
      status: 'not-started',
    };
  }

  private inferCategory(name: string, context?: GoalContext): string {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('revenue') || lowerName.includes('profit') ||
        lowerName.includes('cost') || lowerName.includes('financial')) {
      return 'Financial';
    }
    if (lowerName.includes('customer') || lowerName.includes('satisfaction') ||
        lowerName.includes('market')) {
      return 'Customer';
    }
    if (lowerName.includes('process') || lowerName.includes('efficiency') ||
        lowerName.includes('quality')) {
      return 'Operations';
    }
    if (lowerName.includes('employee') || lowerName.includes('talent') ||
        lowerName.includes('culture')) {
      return 'People';
    }

    return context?.strategicPriorities?.[0] || 'General';
  }

  private calculateDefaultDueDate(context?: GoalContext): Date {
    const today = new Date();
    let months = 12;

    if (context?.timeframe) {
      const match = context.timeframe.match(/(\d+)/);
      if (match) {
        months = parseInt(match[1], 10);
      }
    }

    return new Date(today.setMonth(today.getMonth() + months));
  }

  private buildRelationships(inputs: GoalInput[]): GoalRelationship[] {
    const relationships: GoalRelationship[] = [];

    for (const input of inputs) {
      if (input.parentId) {
        relationships.push({
          parentId: input.parentId,
          childId: input.id || `goal-${inputs.indexOf(input) + 1}`,
          contributionWeight: 1 / inputs.filter((i) => i.parentId === input.parentId).length,
        });
      }
    }

    return relationships;
  }

  private calculateAlignmentScore(
    goals: Goal[],
    relationships: GoalRelationship[]
  ): number {
    if (goals.length <= 1) return 1;

    // Goals without parents at top level
    const topLevelGoals = goals.filter((g) =>
      !relationships.some((r) => r.childId === g.id)
    );

    // Goals without children at bottom level
    const _bottomLevelGoals = goals.filter((g) =>
      !relationships.some((r) => r.parentId === g.id)
    );

    // Connected goals
    const connectedGoals = goals.filter((g) =>
      relationships.some((r) => r.parentId === g.id || r.childId === g.id)
    );

    // Score based on connectivity
    const connectivityScore = goals.length > 0
      ? (connectedGoals.length + topLevelGoals.length) / goals.length
      : 0;

    return Math.min(1, connectivityScore);
  }

  private assessProgress(
    hierarchy: GoalHierarchy,
    currentStatus: GoalStatusInput[]
  ): GoalProgress[] {
    return hierarchy.goals.map((goal) => {
      const status = currentStatus.find((s) => s.goalId === goal.id);

      const progressPercent = status?.progressPercent ?? 0;
      const milestones = (status?.milestones || []).map((m) => ({
        name: m.name,
        dueDate: m.dueDate,
        status: this.determineMilestoneStatus(m),
      }));

      return {
        goalId: goal.id,
        progressPercent,
        milestones,
        blockers: status?.blockers || [],
      };
    });
  }

  private determineMilestoneStatus(
    milestone: MilestoneInput
  ): MilestoneStatus['status'] {
    const now = new Date();
    const dueDate = milestone.dueDate;

    if (milestone.completed) return 'completed';
    if (dueDate < now) return 'missed';
    if (this.isWithinDays(dueDate, 7)) return 'at-risk';
    return 'on-track';
  }

  private isWithinDays(date: Date, days: number): boolean {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return diff > 0 && diff < days * 24 * 60 * 60 * 1000;
  }

  private identifyAdjustments(
    hierarchy: GoalHierarchy,
    progress: GoalProgress[]
  ): GoalAdjustment[] {
    const adjustments: GoalAdjustment[] = [];
    const now = new Date();

    for (const goal of hierarchy.goals) {
      const goalProgress = progress.find((p) => p.goalId === goal.id);
      if (!goalProgress) continue;

      // Check if goal is at risk
      const expectedProgress = this.calculateExpectedProgress(goal);
      const actualProgress = goalProgress.progressPercent;

      if (actualProgress < expectedProgress - 20) {
        // Significantly behind
        adjustments.push({
          goalId: goal.id,
          type: 'timeline',
          previousValue: goal.dueDate.toISOString(),
          newValue: this.extendDeadline(goal.dueDate, 30).toISOString(),
          rationale: `Goal is ${(expectedProgress - actualProgress).toFixed(0)}% behind expected progress`,
          approvedBy: 'System suggested',
          date: now,
        });
      }

      // Check for blockers
      if (goalProgress.blockers.length > 2) {
        adjustments.push({
          goalId: goal.id,
          type: 'scope',
          previousValue: 'Original scope',
          newValue: 'Reduced scope to address blockers',
          rationale: `${goalProgress.blockers.length} blockers identified`,
          approvedBy: 'System suggested',
          date: now,
        });
      }
    }

    return adjustments;
  }

  private calculateExpectedProgress(goal: Goal): number {
    const now = new Date();
    const startDate = new Date(goal.dueDate);
    startDate.setMonth(startDate.getMonth() - 12); // Assume 12-month goal

    const totalDuration = goal.dueDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  private extendDeadline(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  private generateAlerts(progress: GoalProgress[]): GoalAlert[] {
    const alerts: GoalAlert[] = [];

    for (const goalProgress of progress) {
      // Critical: Very low progress
      if (goalProgress.progressPercent < 20) {
        alerts.push({
          goalId: goalProgress.goalId,
          severity: 'critical',
          message: 'Goal progress critically low',
          suggestedAction: 'Immediate intervention required',
        });
      }

      // Warning: Missed milestones
      const missedMilestones = goalProgress.milestones.filter(
        (m) => m.status === 'missed'
      );
      if (missedMilestones.length > 0) {
        alerts.push({
          goalId: goalProgress.goalId,
          severity: 'warning',
          message: `${missedMilestones.length} milestone(s) missed`,
          suggestedAction: 'Review and adjust timeline',
        });
      }

      // Warning: Multiple blockers
      if (goalProgress.blockers.length >= 2) {
        alerts.push({
          goalId: goalProgress.goalId,
          severity: 'warning',
          message: `${goalProgress.blockers.length} blockers identified`,
          suggestedAction: 'Prioritize blocker resolution',
        });
      }

      // Info: At-risk milestones
      const atRiskMilestones = goalProgress.milestones.filter(
        (m) => m.status === 'at-risk'
      );
      if (atRiskMilestones.length > 0) {
        alerts.push({
          goalId: goalProgress.goalId,
          severity: 'info',
          message: `${atRiskMilestones.length} milestone(s) at risk`,
          suggestedAction: 'Monitor closely',
        });
      }
    }

    return alerts;
  }

  private generateForecasts(
    hierarchy: GoalHierarchy,
    progress: GoalProgress[]
  ): GoalForecast[] {
    return hierarchy.goals.map((goal) => {
      const goalProgress = progress.find((p) => p.goalId === goal.id);
      const currentProgress = goalProgress?.progressPercent || 0;

      // Simple linear forecast
      const expectedProgress = this.calculateExpectedProgress(goal);
      const progressRatio = expectedProgress > 0 ? currentProgress / expectedProgress : 1;

      const predictedValue = Math.min(100, currentProgress + (100 - currentProgress) * progressRatio);
      const confidence = this.calculateForecastConfidence(progressRatio, goalProgress);

      return {
        goalId: goal.id,
        forecastDate: goal.dueDate,
        predictedValue,
        confidence,
        assumptions: [
          `Current progress: ${currentProgress}%`,
          `Expected progress: ${expectedProgress.toFixed(0)}%`,
          `Progress ratio: ${(progressRatio * 100).toFixed(0)}%`,
        ],
      };
    });
  }

  private calculateForecastConfidence(
    progressRatio: number,
    _progress?: GoalProgress
  ): number {
    // Higher confidence when on track
    if (progressRatio >= 0.9) return 0.85;
    if (progressRatio >= 0.7) return 0.7;
    if (progressRatio >= 0.5) return 0.55;
    return 0.4;
  }

  private mapGoalsToObjectives(
    hierarchy: GoalHierarchy,
    objectives: StrategicObjective[]
  ): GoalObjectiveMapping[] {
    const mappings: GoalObjectiveMapping[] = [];

    for (const goal of hierarchy.goals) {
      const matchingObjectives = objectives.filter((obj) =>
        this.isGoalAlignedWithObjective(goal, obj)
      );

      mappings.push({
        goalId: goal.id,
        goalName: goal.name,
        alignedObjectives: matchingObjectives.map((obj) => ({
          objectiveId: obj.id,
          objectiveName: obj.name,
          alignmentStrength: this.calculateAlignmentStrength(goal, obj),
        })),
      });
    }

    return mappings;
  }

  private isGoalAlignedWithObjective(goal: Goal, objective: StrategicObjective): boolean {
    const goalText = `${goal.name} ${goal.description}`.toLowerCase();
    const objectiveText = `${objective.name} ${objective.description}`.toLowerCase();

    // Check for keyword overlap
    const goalWords = new Set(goalText.split(/\s+/).filter((w) => w.length > 4));
    const objectiveWords = objectiveText.split(/\s+/).filter((w) => w.length > 4);

    const matchingWords = objectiveWords.filter((w) => goalWords.has(w));
    return matchingWords.length >= 1;
  }

  private calculateAlignmentStrength(goal: Goal, objective: StrategicObjective): number {
    const goalText = `${goal.name} ${goal.description}`.toLowerCase();
    const objectiveText = `${objective.name} ${objective.description}`.toLowerCase();

    const goalWords = new Set(goalText.split(/\s+/).filter((w) => w.length > 4));
    const objectiveWords = objectiveText.split(/\s+/).filter((w) => w.length > 4);

    const matchingWords = objectiveWords.filter((w) => goalWords.has(w));
    const totalWords = goalWords.size + objectiveWords.length;

    return totalWords > 0 ? (matchingWords.length * 2) / totalWords : 0;
  }

  private calculateCoverage(
    objectives: StrategicObjective[],
    mappings: GoalObjectiveMapping[]
  ): StrategicCoverage {
    const coveredObjectives = new Set<string>();

    for (const mapping of mappings) {
      for (const aligned of mapping.alignedObjectives) {
        coveredObjectives.add(aligned.objectiveId);
      }
    }

    return {
      totalObjectives: objectives.length,
      coveredObjectives: coveredObjectives.size,
      coveragePercent: objectives.length > 0
        ? (coveredObjectives.size / objectives.length) * 100
        : 0,
      uncoveredObjectives: objectives
        .filter((obj) => !coveredObjectives.has(obj.id))
        .map((obj) => obj.name),
    };
  }

  private identifyAlignmentGaps(
    objectives: StrategicObjective[],
    mappings: GoalObjectiveMapping[]
  ): AlignmentGap[] {
    const gaps: AlignmentGap[] = [];
    const coveredObjectives = new Set<string>();

    for (const mapping of mappings) {
      for (const aligned of mapping.alignedObjectives) {
        coveredObjectives.add(aligned.objectiveId);
      }
    }

    for (const objective of objectives) {
      if (!coveredObjectives.has(objective.id)) {
        gaps.push({
          objectiveId: objective.id,
          objectiveName: objective.name,
          gapType: 'uncovered',
          recommendation: `Create goals aligned with "${objective.name}"`,
        });
      }
    }

    // Check for weak alignments
    for (const mapping of mappings) {
      const strongAlignments = mapping.alignedObjectives.filter(
        (a) => a.alignmentStrength > 0.5
      );
      if (mapping.alignedObjectives.length > 0 && strongAlignments.length === 0) {
        gaps.push({
          objectiveId: mapping.goalId,
          objectiveName: mapping.goalName,
          gapType: 'weak-alignment',
          recommendation: `Strengthen alignment of goal "${mapping.goalName}"`,
        });
      }
    }

    return gaps;
  }

  private generateAlignmentRecommendations(
    coverage: StrategicCoverage,
    gaps: AlignmentGap[]
  ): string[] {
    const recommendations: string[] = [];

    if (coverage.coveragePercent < 80) {
      recommendations.push(`Improve strategic coverage from ${coverage.coveragePercent.toFixed(0)}% to 80%+`);
    }

    if (gaps.length > 0) {
      recommendations.push(`Address ${gaps.length} alignment gap(s)`);
    }

    if (coverage.uncoveredObjectives.length > 0) {
      recommendations.push(`Create goals for: ${coverage.uncoveredObjectives.slice(0, 3).join(', ')}`);
    }

    return recommendations;
  }

  private generateCascadedGoals(
    topLevelGoal: Goal,
    targetLevels: CascadeLevel[]
  ): Goal[] {
    const cascadedGoals: Goal[] = [];

    for (const level of targetLevels) {
      const levelGoals = this.createLevelGoals(topLevelGoal, level);
      cascadedGoals.push(...levelGoals);
    }

    return cascadedGoals;
  }

  private createLevelGoals(topLevelGoal: Goal, level: CascadeLevel): Goal[] {
    const goals: Goal[] = [];
    const contributionPerUnit = 1 / level.units.length;

    for (const unit of level.units) {
      goals.push({
        id: `${topLevelGoal.id}-${level.level}-${unit}`,
        name: `${unit}: ${topLevelGoal.name}`,
        description: `Contribute ${(contributionPerUnit * 100).toFixed(0)}% to ${topLevelGoal.name}`,
        category: topLevelGoal.category,
        owner: unit,
        dueDate: topLevelGoal.dueDate,
        status: 'not-started',
      });
    }

    return goals;
  }

  private buildCascadeRelationships(
    sourceGoal: Goal,
    cascadedGoals: Goal[]
  ): GoalRelationship[] {
    return cascadedGoals.map((goal) => ({
      parentId: sourceGoal.id,
      childId: goal.id,
      contributionWeight: 1 / cascadedGoals.length,
    }));
  }

  private calculateCascadeAlignment(
    sourceGoal: Goal,
    cascadedGoals: Goal[]
  ): number {
    if (cascadedGoals.length === 0) return 0;

    // All cascaded goals should sum to 100% contribution
    const totalContribution = cascadedGoals.length * (1 / cascadedGoals.length);

    // Check name alignment
    const nameAlignmentScore = cascadedGoals.filter((g) =>
      g.name.includes(sourceGoal.name)
    ).length / cascadedGoals.length;

    return (totalContribution + nameAlignmentScore) / 2;
  }

  private prioritizeGoals(
    goals: Goal[],
    constraints: PortfolioConstraints
  ): PrioritizedGoal[] {
    return goals.map((goal) => {
      const strategicScore = this.calculateStrategicScore(goal, constraints);
      const feasibilityScore = this.calculateFeasibilityScore(goal, constraints);
      const urgencyScore = this.calculateUrgencyScore(goal);

      const overallScore = strategicScore * 0.4 + feasibilityScore * 0.3 + urgencyScore * 0.3;

      return {
        goal,
        strategicScore,
        feasibilityScore,
        urgencyScore,
        overallScore,
        priority: 0, // Will be assigned after sorting
      };
    }).sort((a, b) => b.overallScore - a.overallScore)
      .map((pg, index) => ({ ...pg, priority: index + 1 }));
  }

  private calculateStrategicScore(goal: Goal, constraints: PortfolioConstraints): number {
    if (!constraints.strategicPriorities) return 0.5;

    const matchingPriorities = constraints.strategicPriorities.filter((p) =>
      goal.name.toLowerCase().includes(p.toLowerCase()) ||
      goal.category.toLowerCase().includes(p.toLowerCase())
    );

    return matchingPriorities.length / constraints.strategicPriorities.length;
  }

  private calculateFeasibilityScore(_goal: Goal, _constraints: PortfolioConstraints): number {
    // Simplified feasibility assessment
    return 0.7;
  }

  private calculateUrgencyScore(goal: Goal): number {
    const now = new Date();
    const dueDate = goal.dueDate;
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);

    if (daysUntilDue < 30) return 1;
    if (daysUntilDue < 90) return 0.7;
    if (daysUntilDue < 180) return 0.5;
    return 0.3;
  }

  private optimizeResources(
    prioritizedGoals: PrioritizedGoal[],
    constraints: PortfolioConstraints
  ): ResourceAllocation[] {
    const totalResource = constraints.availableResources || 100;
    const allocations: ResourceAllocation[] = [];

    // Allocate based on priority
    let remainingResource = totalResource;
    for (const pg of prioritizedGoals) {
      const allocation = Math.min(
        remainingResource * 0.3, // Max 30% per goal
        remainingResource * (pg.overallScore / prioritizedGoals.length)
      );

      allocations.push({
        goalId: pg.goal.id,
        allocatedPercent: (allocation / totalResource) * 100,
        resourceAmount: allocation,
      });

      remainingResource -= allocation;
    }

    return allocations;
  }

  private identifyTradeoffs(
    prioritizedGoals: PrioritizedGoal[],
    constraints: PortfolioConstraints
  ): Tradeoff[] {
    const tradeoffs: Tradeoff[] = [];

    // Check if any high-strategic goals are de-prioritized due to feasibility
    const highStrategicLowPriority = prioritizedGoals.filter(
      (pg) => pg.strategicScore > 0.7 && pg.priority > prioritizedGoals.length / 2
    );

    for (const goal of highStrategicLowPriority) {
      tradeoffs.push({
        description: `${goal.goal.name} is strategically important but ranked lower`,
        impact: 'Potential strategic misalignment',
        recommendation: 'Review feasibility to improve ranking',
      });
    }

    // Check for resource constraints
    if (constraints.maxGoals && prioritizedGoals.length > constraints.maxGoals) {
      tradeoffs.push({
        description: `${prioritizedGoals.length - constraints.maxGoals} goals may not be resourced`,
        impact: 'Some goals may not be achievable',
        recommendation: 'Consider phasing or combining goals',
      });
    }

    return tradeoffs;
  }

  private generateOptimizationRecommendations(
    prioritizedGoals: PrioritizedGoal[],
    tradeoffs: Tradeoff[]
  ): string[] {
    const recommendations: string[] = [];

    const topPriority = prioritizedGoals.slice(0, 3);
    recommendations.push(
      `Focus on top priorities: ${topPriority.map((pg) => pg.goal.name).join(', ')}`
    );

    if (tradeoffs.length > 0) {
      recommendations.push(`Review ${tradeoffs.length} identified tradeoff(s)`);
    }

    recommendations.push('Regularly re-prioritize based on progress and changes');

    return recommendations;
  }

  private calculateConfidence(hierarchy: GoalHierarchy): number {
    let confidence = 0.5;

    if (hierarchy.goals.length > 3) confidence += 0.1;
    if (hierarchy.relationships.length > 0) confidence += 0.15;
    if (hierarchy.alignmentScore > 0.7) confidence += 0.1;

    return Math.min(0.9, confidence);
  }

  private generateHierarchyRecommendations(hierarchy: GoalHierarchy): string[] {
    const recommendations: string[] = [];

    if (hierarchy.alignmentScore < 0.7) {
      recommendations.push('Improve goal hierarchy alignment');
    }

    const orphanGoals = hierarchy.goals.filter((g) =>
      !hierarchy.relationships.some((r) => r.parentId === g.id || r.childId === g.id)
    );
    if (orphanGoals.length > 1) {
      recommendations.push(`Connect ${orphanGoals.length} orphan goal(s) to hierarchy`);
    }

    recommendations.push('Assign owners to all goals');
    recommendations.push('Define metrics for progress tracking');

    return recommendations;
  }

  private generateManagementRecommendations(management: DynamicGoalManagement): string[] {
    const recommendations: string[] = [];

    const criticalAlerts = management.alerts.filter((a) => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push(`Address ${criticalAlerts.length} critical alert(s) immediately`);
    }

    const suggestedAdjustments = management.adjustments.filter(
      (a) => a.approvedBy === 'System suggested'
    );
    if (suggestedAdjustments.length > 0) {
      recommendations.push(`Review ${suggestedAdjustments.length} suggested adjustment(s)`);
    }

    const lowConfidenceForecasts = management.forecasts.filter((f) => f.confidence < 0.5);
    if (lowConfidenceForecasts.length > 0) {
      recommendations.push(`${lowConfidenceForecasts.length} goal(s) have uncertain forecasts`);
    }

    return recommendations;
  }
}

// Additional types for this engine
interface GoalStatusInput {
  goalId: string;
  progressPercent: number;
  milestones?: MilestoneInput[];
  blockers?: string[];
}

interface MilestoneInput {
  name: string;
  dueDate: Date;
  completed?: boolean;
}

interface StrategicObjective {
  id: string;
  name: string;
  description: string;
}

interface AlignmentAnalysis {
  mappings: GoalObjectiveMapping[];
  coverage: StrategicCoverage;
  gaps: AlignmentGap[];
  recommendations: string[];
}

interface GoalObjectiveMapping {
  goalId: string;
  goalName: string;
  alignedObjectives: Array<{
    objectiveId: string;
    objectiveName: string;
    alignmentStrength: number;
  }>;
}

interface StrategicCoverage {
  totalObjectives: number;
  coveredObjectives: number;
  coveragePercent: number;
  uncoveredObjectives: string[];
}

interface AlignmentGap {
  objectiveId: string;
  objectiveName: string;
  gapType: 'uncovered' | 'weak-alignment';
  recommendation: string;
}

interface CascadeLevel {
  level: string;
  units: string[];
}

interface CascadedGoals {
  sourceGoal: Goal;
  cascadedGoals: Goal[];
  relationships: GoalRelationship[];
  alignmentScore: number;
}

interface PortfolioConstraints {
  strategicPriorities?: string[];
  availableResources?: number;
  maxGoals?: number;
}

interface OptimizedPortfolio {
  prioritizedGoals: PrioritizedGoal[];
  resourceAllocation: ResourceAllocation[];
  tradeoffs: Tradeoff[];
  recommendations: string[];
}

interface PrioritizedGoal {
  goal: Goal;
  strategicScore: number;
  feasibilityScore: number;
  urgencyScore: number;
  overallScore: number;
  priority: number;
}

interface ResourceAllocation {
  goalId: string;
  allocatedPercent: number;
  resourceAmount: number;
}

interface Tradeoff {
  description: string;
  impact: string;
  recommendation: string;
}

export const dynamicGoalEngine = new DynamicGoalEngine();
