/**
 * Transformation Roadmap Engine
 * 4.7 変革ロードマップ設計エンジン
 */

import type {
  FunctionResult,
  TransformationGoal,
  TransformationPhase,
  TransformationInitiative,
  TransformationRoadmap,
  RoadmapTimeline,
  GovernanceStructure,
  WorkingGroup,
  DecisionRight,
  TransformationMetric,
  ResourceRequirement,
  PhaseTimeline,
  Milestone,
} from '../types';

export interface TransformationInput {
  vision: string;
  goals: GoalInput[];
  constraints?: TransformationConstraints;
  context?: TransformationContext;
}

export interface GoalInput {
  description: string;
  category?: 'capability' | 'culture' | 'process' | 'technology';
  currentState?: string;
  targetState?: string;
  priority?: number;
}

export interface TransformationConstraints {
  budget?: number;
  timeline?: string;
  resources?: number;
  riskTolerance?: 'low' | 'medium' | 'high';
}

export interface TransformationContext {
  organizationSize: 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  currentMaturity: number;
  changeReadiness: number;
}

export class TransformationRoadmapEngine {
  /**
   * Design transformation roadmap
   */
  async design(input: TransformationInput): Promise<FunctionResult<TransformationRoadmap>> {
    const startTime = Date.now();

    const goals = input.goals.map((g, i) => this.buildGoal(g, i));
    const phases = this.designPhases(goals, input.constraints, input.context);
    const timeline = this.createTimeline(phases);
    const governance = this.designGovernance(phases, input.context);
    const metrics = this.defineMetrics(goals);

    const roadmap: TransformationRoadmap = {
      vision: input.vision,
      goals,
      phases,
      timeline,
      governance,
      metrics,
    };

    return {
      data: roadmap,
      confidence: this.calculateConfidence(roadmap),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateRecommendations(roadmap, input.context),
    };
  }

  /**
   * Assess transformation readiness
   */
  async assessReadiness(
    organization: OrganizationAssessment
  ): Promise<FunctionResult<ReadinessAssessment>> {
    const startTime = Date.now();

    const dimensions = this.assessReadinessDimensions(organization);
    const overallReadiness = this.calculateOverallReadiness(dimensions);
    const gaps = this.identifyReadinessGaps(dimensions);
    const recommendations = this.generateReadinessRecommendations(dimensions, gaps);

    const assessment: ReadinessAssessment = {
      overall: overallReadiness,
      dimensions,
      gaps,
      readinessLevel: this.categorizeReadiness(overallReadiness),
      recommendations,
    };

    return {
      data: assessment,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Track transformation progress
   */
  async trackProgress(
    roadmap: TransformationRoadmap,
    currentStatus: PhaseStatus[]
  ): Promise<FunctionResult<ProgressReport>> {
    const startTime = Date.now();

    const phaseProgress = this.assessPhaseProgress(roadmap.phases, currentStatus);
    const goalProgress = this.assessGoalProgress(roadmap.goals, currentStatus);
    const overallProgress = this.calculateOverallProgress(phaseProgress);
    const risks = this.identifyProgressRisks(phaseProgress);
    const recommendations = this.generateProgressRecommendations(phaseProgress, risks);

    const report: ProgressReport = {
      timestamp: new Date(),
      overallProgress,
      phaseProgress,
      goalProgress,
      onTrack: overallProgress.status === 'on-track',
      risks,
      recommendations,
    };

    return {
      data: report,
      confidence: 0.8,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Optimize roadmap
   */
  async optimize(
    roadmap: TransformationRoadmap,
    _constraints: TransformationConstraints,
    feedback: RoadmapFeedback
  ): Promise<FunctionResult<OptimizedRoadmap>> {
    const startTime = Date.now();

    const adjustments = this.identifyAdjustments(roadmap, feedback);
    const optimizedPhases = this.applyAdjustments(roadmap.phases, adjustments);
    const optimizedTimeline = this.recalculateTimeline(optimizedPhases);

    const optimized: OptimizedRoadmap = {
      original: roadmap,
      optimized: {
        ...roadmap,
        phases: optimizedPhases,
        timeline: optimizedTimeline,
      },
      adjustments,
      rationale: this.explainOptimization(adjustments),
      tradeoffs: this.identifyTradeoffs(adjustments),
    };

    return {
      data: optimized,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  private buildGoal(input: GoalInput, index: number): TransformationGoal {
    return {
      id: `goal-${index + 1}`,
      description: input.description,
      category: input.category || this.inferCategory(input.description),
      currentState: input.currentState || 'Current state not defined',
      targetState: input.targetState || 'Target state to be achieved',
      priority: input.priority || index + 1,
    };
  }

  private inferCategory(description: string): 'capability' | 'culture' | 'process' | 'technology' {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('culture') || lowerDesc.includes('behavior') ||
        lowerDesc.includes('mindset') || lowerDesc.includes('value')) {
      return 'culture';
    }
    if (lowerDesc.includes('process') || lowerDesc.includes('workflow') ||
        lowerDesc.includes('procedure')) {
      return 'process';
    }
    if (lowerDesc.includes('technology') || lowerDesc.includes('system') ||
        lowerDesc.includes('digital') || lowerDesc.includes('platform')) {
      return 'technology';
    }

    return 'capability';
  }

  private designPhases(
    goals: TransformationGoal[],
    constraints?: TransformationConstraints,
    context?: TransformationContext
  ): TransformationPhase[] {
    const phases: TransformationPhase[] = [];

    // Foundation phase
    phases.push(this.createFoundationPhase(goals, context));

    // Build phase
    phases.push(this.createBuildPhase(goals, context));

    // Scale phase
    phases.push(this.createScalePhase(goals, context));

    // Sustain phase
    phases.push(this.createSustainPhase(goals, context));

    // Adjust based on constraints
    if (constraints?.timeline) {
      this.adjustPhasesForTimeline(phases, constraints.timeline);
    }

    return phases;
  }

  private createFoundationPhase(
    goals: TransformationGoal[],
    context?: TransformationContext
  ): TransformationPhase {
    const foundationGoals = goals.filter(
      (g) => g.category === 'culture' || g.priority <= 2
    );

    const initiatives: TransformationInitiative[] = [
      {
        id: 'init-f1',
        name: 'Transformation Kickoff',
        description: 'Launch transformation program with leadership alignment',
        owner: 'Transformation Office',
        resources: this.estimateResources('foundation', context),
        risks: ['Lack of leadership commitment', 'Unclear vision communication'],
        benefits: ['Aligned leadership', 'Clear transformation direction'],
      },
      {
        id: 'init-f2',
        name: 'Change Network Establishment',
        description: 'Build network of change champions across organization',
        owner: 'HR/Change Management',
        resources: this.estimateResources('foundation', context),
        risks: ['Insufficient champions', 'Limited engagement'],
        benefits: ['Distributed change leadership', 'Local support'],
      },
    ];

    return {
      id: 'phase-foundation',
      name: 'Foundation',
      objectives: [
        'Establish transformation governance',
        'Align leadership on vision and goals',
        'Build change capability',
        ...foundationGoals.map((g) => `Begin ${g.description}`),
      ],
      initiatives,
      duration: '3-6 months',
      dependencies: [],
      successCriteria: [
        'Leadership alignment score > 80%',
        'Change network established',
        'Baseline metrics captured',
      ],
    };
  }

  private createBuildPhase(
    goals: TransformationGoal[],
    context?: TransformationContext
  ): TransformationPhase {
    const buildGoals = goals.filter(
      (g) => g.category === 'process' || g.category === 'technology'
    );

    const initiatives: TransformationInitiative[] = buildGoals.map((g, i) => ({
      id: `init-b${i + 1}`,
      name: `${g.description} Implementation`,
      description: `Build capabilities for ${g.description.toLowerCase()}`,
      owner: 'Transformation Team',
      resources: this.estimateResources('build', context),
      risks: ['Implementation complexity', 'Resource constraints'],
      benefits: [`${g.targetState}`, 'Capability advancement'],
    }));

    return {
      id: 'phase-build',
      name: 'Build',
      objectives: [
        'Implement core transformation initiatives',
        'Build new capabilities',
        'Pilot new processes',
        ...buildGoals.map((g) => `Achieve ${g.description}`),
      ],
      initiatives,
      duration: '6-12 months',
      dependencies: ['phase-foundation'],
      successCriteria: [
        'Core capabilities implemented',
        'Pilot results positive',
        '50% of goals achieved',
      ],
    };
  }

  private createScalePhase(
    goals: TransformationGoal[],
    context?: TransformationContext
  ): TransformationPhase {
    const initiatives: TransformationInitiative[] = [
      {
        id: 'init-s1',
        name: 'Organization-wide Rollout',
        description: 'Scale transformation across all units',
        owner: 'Transformation Office',
        resources: this.estimateResources('scale', context),
        risks: ['Inconsistent adoption', 'Scale challenges'],
        benefits: ['Full organizational transformation', 'Consistent practices'],
      },
      {
        id: 'init-s2',
        name: 'Capability Transfer',
        description: 'Transfer capabilities to business units',
        owner: 'Business Unit Leaders',
        resources: this.estimateResources('scale', context),
        risks: ['Knowledge loss', 'Capability degradation'],
        benefits: ['Self-sustaining capability', 'Reduced dependency'],
      },
    ];

    return {
      id: 'phase-scale',
      name: 'Scale',
      objectives: [
        'Scale transformation across organization',
        'Embed new capabilities in operations',
        'Achieve full adoption',
        ...goals.slice(0, 3).map((g) => `Complete ${g.description}`),
      ],
      initiatives,
      duration: '6-9 months',
      dependencies: ['phase-build'],
      successCriteria: [
        '80%+ adoption rate',
        'Capabilities embedded',
        '80% of goals achieved',
      ],
    };
  }

  private createSustainPhase(
    goals: TransformationGoal[],
    context?: TransformationContext
  ): TransformationPhase {
    const initiatives: TransformationInitiative[] = [
      {
        id: 'init-su1',
        name: 'Continuous Improvement',
        description: 'Establish continuous improvement practices',
        owner: 'Operations',
        resources: this.estimateResources('sustain', context),
        risks: ['Regression', 'Complacency'],
        benefits: ['Sustainable improvement', 'Ongoing value creation'],
      },
      {
        id: 'init-su2',
        name: 'Knowledge Management',
        description: 'Capture and institutionalize learning',
        owner: 'Learning & Development',
        resources: this.estimateResources('sustain', context),
        risks: ['Knowledge loss', 'Insufficient documentation'],
        benefits: ['Institutional knowledge', 'Repeatable success'],
      },
    ];

    return {
      id: 'phase-sustain',
      name: 'Sustain',
      objectives: [
        'Sustain transformation gains',
        'Build continuous improvement culture',
        'Ensure long-term success',
        'Complete all remaining goals',
      ],
      initiatives,
      duration: '6-12 months',
      dependencies: ['phase-scale'],
      successCriteria: [
        'All goals achieved',
        'Improvement culture established',
        'Metrics sustained for 6 months',
      ],
    };
  }

  private estimateResources(
    phase: string,
    context?: TransformationContext
  ): ResourceRequirement[] {
    const sizeMultiplier = {
      small: 0.5,
      medium: 1,
      large: 1.5,
      enterprise: 2,
    };

    const multiplier = sizeMultiplier[context?.organizationSize || 'medium'];

    const baseResources: Record<string, ResourceRequirement[]> = {
      foundation: [
        { type: 'budget', amount: `$${100 * multiplier}K`, availability: 'available' },
        { type: 'headcount', amount: `${3 * multiplier} FTEs`, availability: 'constrained' },
      ],
      build: [
        { type: 'budget', amount: `$${300 * multiplier}K`, availability: 'constrained' },
        { type: 'headcount', amount: `${8 * multiplier} FTEs`, availability: 'constrained' },
        { type: 'technology', amount: 'Implementation tools', availability: 'available' },
      ],
      scale: [
        { type: 'budget', amount: `$${200 * multiplier}K`, availability: 'constrained' },
        { type: 'headcount', amount: `${10 * multiplier} FTEs`, availability: 'constrained' },
      ],
      sustain: [
        { type: 'budget', amount: `$${100 * multiplier}K`, availability: 'available' },
        { type: 'headcount', amount: `${4 * multiplier} FTEs`, availability: 'available' },
      ],
    };

    return baseResources[phase] || [];
  }

  private adjustPhasesForTimeline(phases: TransformationPhase[], timeline: string): void {
    const totalMonths = this.parseTimeline(timeline);

    if (totalMonths < 18) {
      // Compress phases
      phases[0].duration = '2-3 months';
      phases[1].duration = '4-6 months';
      phases[2].duration = '3-4 months';
      phases[3].duration = '3-4 months';
    } else if (totalMonths > 30) {
      // Extend phases
      phases[1].duration = '9-15 months';
      phases[2].duration = '9-12 months';
    }
  }

  private parseTimeline(timeline: string): number {
    const match = timeline.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 24;
  }

  private createTimeline(phases: TransformationPhase[]): RoadmapTimeline {
    const phaseTimelines: PhaseTimeline[] = [];
    let currentDate = new Date();

    for (const phase of phases) {
      const durationMonths = this.parseDuration(phase.duration);
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      phaseTimelines.push({
        phaseId: phase.id,
        start: new Date(currentDate),
        end: endDate,
        milestones: this.generateMilestones(phase, currentDate, endDate),
      });

      currentDate = endDate;
    }

    const criticalPath = this.identifyCriticalPath(phases);

    return {
      totalDuration: `${this.calculateTotalMonths(phaseTimelines)} months`,
      phases: phaseTimelines,
      criticalPath,
    };
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)-(\d+)/);
    if (match) {
      return (parseInt(match[1], 10) + parseInt(match[2], 10)) / 2;
    }
    const singleMatch = duration.match(/(\d+)/);
    return singleMatch ? parseInt(singleMatch[1], 10) : 6;
  }

  private generateMilestones(
    phase: TransformationPhase,
    start: Date,
    end: Date
  ): Milestone[] {
    const milestones: Milestone[] = [];
    const duration = end.getTime() - start.getTime();

    // Start milestone
    milestones.push({
      name: `${phase.name} Kickoff`,
      date: new Date(start),
      deliverables: [`${phase.name} phase initiated`],
    });

    // Mid-phase milestone
    const midDate = new Date(start.getTime() + duration / 2);
    milestones.push({
      name: `${phase.name} Checkpoint`,
      date: midDate,
      deliverables: [`${phase.name} progress review`],
    });

    // End milestone
    milestones.push({
      name: `${phase.name} Complete`,
      date: new Date(end),
      deliverables: phase.successCriteria,
    });

    return milestones;
  }

  private identifyCriticalPath(phases: TransformationPhase[]): string[] {
    // Sequential phases form the critical path
    return phases.map((p) => p.id);
  }

  private calculateTotalMonths(phaseTimelines: PhaseTimeline[]): number {
    if (phaseTimelines.length === 0) return 0;

    const first = phaseTimelines[0].start;
    const last = phaseTimelines[phaseTimelines.length - 1].end;

    return Math.round((last.getTime() - first.getTime()) / (30 * 24 * 60 * 60 * 1000));
  }

  private designGovernance(
    phases: TransformationPhase[],
    _context?: TransformationContext
  ): GovernanceStructure {
    const workingGroups: WorkingGroup[] = [
      {
        name: 'Transformation Steering Committee',
        focus: 'Strategic direction and major decisions',
        members: ['CEO', 'CFO', 'CHRO', 'Transformation Lead'],
        meetingCadence: 'Monthly',
      },
      {
        name: 'Transformation Management Office',
        focus: 'Day-to-day transformation execution',
        members: ['Transformation Lead', 'Project Managers', 'Change Leads'],
        meetingCadence: 'Weekly',
      },
    ];

    // Add phase-specific working groups
    for (const phase of phases) {
      if (phase.initiatives.length > 2) {
        workingGroups.push({
          name: `${phase.name} Phase Team`,
          focus: `Execute ${phase.name} phase initiatives`,
          members: phase.initiatives.map((i) => i.owner),
          meetingCadence: 'Weekly',
        });
      }
    }

    const decisionRights: DecisionRight[] = [
      {
        decision: 'Budget allocation above $100K',
        authority: 'Steering Committee',
        consultedParties: ['Finance', 'Transformation Lead'],
      },
      {
        decision: 'Timeline adjustments',
        authority: 'Transformation Lead',
        consultedParties: ['Phase Leads', 'Affected stakeholders'],
      },
      {
        decision: 'Scope changes',
        authority: 'Steering Committee',
        consultedParties: ['Transformation Lead', 'Business owners'],
      },
    ];

    return {
      steeringCommittee: ['CEO', 'CFO', 'CHRO', 'COO'],
      workingGroups,
      decisionRights,
      escalationPath: [
        'Working Group → TMO',
        'TMO → Transformation Lead',
        'Transformation Lead → Steering Committee',
        'Steering Committee → CEO',
      ],
    };
  }

  private defineMetrics(goals: TransformationGoal[]): TransformationMetric[] {
    const metrics: TransformationMetric[] = [];

    // Overall transformation metrics
    metrics.push({
      name: 'Transformation Progress',
      baseline: 0,
      target: 100,
      current: 0,
      trend: 'stable',
    });

    metrics.push({
      name: 'Stakeholder Engagement',
      baseline: 50,
      target: 85,
      current: 50,
      trend: 'stable',
    });

    // Goal-specific metrics
    for (const goal of goals) {
      metrics.push({
        name: `${goal.description} Achievement`,
        baseline: 0,
        target: 100,
        current: 0,
        trend: 'stable',
      });
    }

    // Category metrics
    const categories = new Set(goals.map((g) => g.category));
    for (const category of categories) {
      metrics.push({
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} Transformation Index`,
        baseline: this.getBaselineForCategory(category),
        target: this.getTargetForCategory(category),
        current: this.getBaselineForCategory(category),
        trend: 'stable',
      });
    }

    return metrics;
  }

  private getBaselineForCategory(category: string): number {
    const baselines: Record<string, number> = {
      capability: 40,
      culture: 35,
      process: 45,
      technology: 50,
    };
    return baselines[category] || 40;
  }

  private getTargetForCategory(category: string): number {
    const targets: Record<string, number> = {
      capability: 80,
      culture: 75,
      process: 85,
      technology: 90,
    };
    return targets[category] || 80;
  }

  private assessReadinessDimensions(
    organization: OrganizationAssessment
  ): ReadinessDimension[] {
    return [
      {
        name: 'Leadership Alignment',
        score: organization.leadershipAlignment || 0.5,
        weight: 0.25,
        indicators: ['Vision clarity', 'Leadership commitment', 'Role modeling'],
      },
      {
        name: 'Change Capability',
        score: organization.changeCapability || 0.5,
        weight: 0.2,
        indicators: ['Change history', 'Change skills', 'Change resources'],
      },
      {
        name: 'Resource Availability',
        score: organization.resourceAvailability || 0.5,
        weight: 0.2,
        indicators: ['Budget', 'People', 'Technology'],
      },
      {
        name: 'Culture Readiness',
        score: organization.cultureReadiness || 0.5,
        weight: 0.2,
        indicators: ['Openness to change', 'Risk tolerance', 'Learning orientation'],
      },
      {
        name: 'Stakeholder Support',
        score: organization.stakeholderSupport || 0.5,
        weight: 0.15,
        indicators: ['Employee engagement', 'Union relations', 'Board support'],
      },
    ];
  }

  private calculateOverallReadiness(dimensions: ReadinessDimension[]): number {
    return dimensions.reduce((acc, d) => acc + d.score * d.weight, 0);
  }

  private identifyReadinessGaps(dimensions: ReadinessDimension[]): ReadinessGap[] {
    const gaps: ReadinessGap[] = [];

    for (const dim of dimensions) {
      if (dim.score < 0.6) {
        gaps.push({
          dimension: dim.name,
          gap: 0.6 - dim.score,
          impact: dim.weight > 0.2 ? 'high' : 'medium',
          recommendation: this.getReadinessRecommendation(dim.name),
        });
      }
    }

    return gaps;
  }

  private getReadinessRecommendation(dimension: string): string {
    const recommendations: Record<string, string> = {
      'Leadership Alignment': 'Conduct leadership alignment sessions',
      'Change Capability': 'Invest in change management training',
      'Resource Availability': 'Secure dedicated resources before starting',
      'Culture Readiness': 'Launch culture readiness initiatives',
      'Stakeholder Support': 'Develop comprehensive stakeholder engagement plan',
    };
    return recommendations[dimension] || 'Address gaps before transformation';
  }

  private categorizeReadiness(score: number): 'ready' | 'partially-ready' | 'not-ready' {
    if (score >= 0.7) return 'ready';
    if (score >= 0.5) return 'partially-ready';
    return 'not-ready';
  }

  private generateReadinessRecommendations(
    dimensions: ReadinessDimension[],
    gaps: ReadinessGap[]
  ): string[] {
    const recommendations: string[] = [];

    if (gaps.length > 0) {
      recommendations.push(`Address ${gaps.length} readiness gaps before transformation`);
    }

    const lowestDimension = dimensions.reduce((min, d) =>
      d.score < min.score ? d : min
    );
    recommendations.push(`Priority focus: ${lowestDimension.name}`);

    if (gaps.some((g) => g.impact === 'high')) {
      recommendations.push('High-impact gaps require immediate attention');
    }

    return recommendations;
  }

  private assessPhaseProgress(
    phases: TransformationPhase[],
    status: PhaseStatus[]
  ): PhaseProgressItem[] {
    return phases.map((phase) => {
      const phaseStatus = status.find((s) => s.phaseId === phase.id);

      return {
        phase: phase.name,
        planned: phase.duration,
        actual: phaseStatus?.actualDuration || 'In progress',
        progress: phaseStatus?.progress || 0,
        status: this.determineStatus(phaseStatus?.progress || 0, phase),
        issues: phaseStatus?.issues || [],
      };
    });
  }

  private determineStatus(
    progress: number,
    _phase: TransformationPhase
  ): 'not-started' | 'on-track' | 'at-risk' | 'delayed' | 'completed' {
    if (progress === 0) return 'not-started';
    if (progress >= 100) return 'completed';
    if (progress >= 70) return 'on-track';
    if (progress >= 40) return 'at-risk';
    return 'delayed';
  }

  private assessGoalProgress(
    goals: TransformationGoal[],
    _status: PhaseStatus[]
  ): GoalProgressItem[] {
    return goals.map((goal) => ({
      goal: goal.description,
      category: goal.category,
      progress: 0, // Would be calculated from actual data
      status: 'in-progress',
    }));
  }

  private calculateOverallProgress(
    phaseProgress: PhaseProgressItem[]
  ): OverallProgressSummary {
    const totalProgress = phaseProgress.reduce((acc, p) => acc + p.progress, 0);
    const avgProgress = phaseProgress.length > 0 ? totalProgress / phaseProgress.length : 0;

    const atRiskCount = phaseProgress.filter(
      (p) => p.status === 'at-risk' || p.status === 'delayed'
    ).length;

    return {
      percentage: avgProgress,
      status: atRiskCount > 0 ? 'at-risk' : avgProgress > 0 ? 'on-track' : 'not-started',
      phasesCompleted: phaseProgress.filter((p) => p.status === 'completed').length,
      totalPhases: phaseProgress.length,
    };
  }

  private identifyProgressRisks(phaseProgress: PhaseProgressItem[]): ProgressRisk[] {
    const risks: ProgressRisk[] = [];

    for (const phase of phaseProgress) {
      if (phase.status === 'delayed') {
        risks.push({
          phase: phase.phase,
          risk: 'Phase is delayed',
          impact: 'high',
          mitigation: 'Review and adjust plan, add resources',
        });
      } else if (phase.status === 'at-risk') {
        risks.push({
          phase: phase.phase,
          risk: 'Phase is at risk of delay',
          impact: 'medium',
          mitigation: 'Close monitoring, early intervention',
        });
      }

      for (const issue of phase.issues) {
        risks.push({
          phase: phase.phase,
          risk: issue,
          impact: 'medium',
          mitigation: 'Address specific issue',
        });
      }
    }

    return risks;
  }

  private generateProgressRecommendations(
    progress: PhaseProgressItem[],
    risks: ProgressRisk[]
  ): string[] {
    const recommendations: string[] = [];

    const delayed = progress.filter((p) => p.status === 'delayed');
    if (delayed.length > 0) {
      recommendations.push(`Urgent: ${delayed.length} phase(s) delayed - requires immediate action`);
    }

    if (risks.length > 0) {
      recommendations.push(`Address ${risks.length} identified risks`);
    }

    const completed = progress.filter((p) => p.status === 'completed');
    if (completed.length > 0) {
      recommendations.push(`Celebrate ${completed.length} completed phase(s)`);
    }

    return recommendations;
  }

  private identifyAdjustments(
    roadmap: TransformationRoadmap,
    feedback: RoadmapFeedback
  ): RoadmapAdjustment[] {
    const adjustments: RoadmapAdjustment[] = [];

    if (feedback.timelinePressure) {
      adjustments.push({
        type: 'timeline',
        target: 'All phases',
        change: 'Compress timeline',
        rationale: 'Timeline pressure from stakeholders',
      });
    }

    if (feedback.resourceConstraints) {
      adjustments.push({
        type: 'scope',
        target: 'Non-critical initiatives',
        change: 'Reduce scope or defer',
        rationale: 'Resource constraints',
      });
    }

    if (feedback.newPriorities && feedback.newPriorities.length > 0) {
      adjustments.push({
        type: 'priority',
        target: feedback.newPriorities.join(', '),
        change: 'Reprioritize initiatives',
        rationale: 'New strategic priorities',
      });
    }

    return adjustments;
  }

  private applyAdjustments(
    phases: TransformationPhase[],
    adjustments: RoadmapAdjustment[]
  ): TransformationPhase[] {
    let optimized = [...phases];

    for (const adj of adjustments) {
      if (adj.type === 'timeline') {
        optimized = optimized.map((p) => ({
          ...p,
          duration: this.compressDuration(p.duration),
        }));
      }
    }

    return optimized;
  }

  private compressDuration(duration: string): string {
    const match = duration.match(/(\d+)-(\d+)/);
    if (match) {
      const min = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);
      return `${Math.max(1, min - 1)}-${max - 1} months`;
    }
    return duration;
  }

  private recalculateTimeline(phases: TransformationPhase[]): RoadmapTimeline {
    return this.createTimeline(phases);
  }

  private explainOptimization(adjustments: RoadmapAdjustment[]): string {
    if (adjustments.length === 0) {
      return 'No significant adjustments required';
    }

    return `Made ${adjustments.length} adjustment(s): ${adjustments.map((a) => a.change).join(', ')}`;
  }

  private identifyTradeoffs(adjustments: RoadmapAdjustment[]): string[] {
    const tradeoffs: string[] = [];

    for (const adj of adjustments) {
      if (adj.type === 'timeline') {
        tradeoffs.push('Compressed timeline increases execution risk');
      }
      if (adj.type === 'scope') {
        tradeoffs.push('Reduced scope may limit transformation impact');
      }
    }

    return tradeoffs;
  }

  private calculateConfidence(roadmap: TransformationRoadmap): number {
    let confidence = 0.5;

    if (roadmap.goals.length > 3) confidence += 0.1;
    if (roadmap.phases.length >= 4) confidence += 0.1;
    if (roadmap.governance.workingGroups.length > 2) confidence += 0.1;
    if (roadmap.metrics.length > 5) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  private generateRecommendations(
    roadmap: TransformationRoadmap,
    context?: TransformationContext
  ): string[] {
    const recommendations: string[] = [];

    if (context?.changeReadiness && context.changeReadiness < 0.5) {
      recommendations.push('Invest in change readiness before starting');
    }

    if (roadmap.phases[0].initiatives.length < 2) {
      recommendations.push('Strengthen foundation phase with more initiatives');
    }

    recommendations.push('Establish regular governance cadence from day one');
    recommendations.push('Track metrics consistently throughout transformation');

    return recommendations;
  }
}

// Additional types for this engine
interface OrganizationAssessment {
  leadershipAlignment?: number;
  changeCapability?: number;
  resourceAvailability?: number;
  cultureReadiness?: number;
  stakeholderSupport?: number;
}

interface ReadinessAssessment {
  overall: number;
  dimensions: ReadinessDimension[];
  gaps: ReadinessGap[];
  readinessLevel: 'ready' | 'partially-ready' | 'not-ready';
  recommendations: string[];
}

interface ReadinessDimension {
  name: string;
  score: number;
  weight: number;
  indicators: string[];
}

interface ReadinessGap {
  dimension: string;
  gap: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface PhaseStatus {
  phaseId: string;
  progress: number;
  actualDuration?: string;
  issues: string[];
}

interface ProgressReport {
  timestamp: Date;
  overallProgress: OverallProgressSummary;
  phaseProgress: PhaseProgressItem[];
  goalProgress: GoalProgressItem[];
  onTrack: boolean;
  risks: ProgressRisk[];
  recommendations: string[];
}

interface OverallProgressSummary {
  percentage: number;
  status: 'not-started' | 'on-track' | 'at-risk' | 'delayed' | 'completed';
  phasesCompleted: number;
  totalPhases: number;
}

interface PhaseProgressItem {
  phase: string;
  planned: string;
  actual: string;
  progress: number;
  status: 'not-started' | 'on-track' | 'at-risk' | 'delayed' | 'completed';
  issues: string[];
}

interface GoalProgressItem {
  goal: string;
  category: string;
  progress: number;
  status: string;
}

interface ProgressRisk {
  phase: string;
  risk: string;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface RoadmapFeedback {
  timelinePressure?: boolean;
  resourceConstraints?: boolean;
  newPriorities?: string[];
}

interface OptimizedRoadmap {
  original: TransformationRoadmap;
  optimized: TransformationRoadmap;
  adjustments: RoadmapAdjustment[];
  rationale: string;
  tradeoffs: string[];
}

interface RoadmapAdjustment {
  type: 'timeline' | 'scope' | 'priority' | 'resource';
  target: string;
  change: string;
  rationale: string;
}

export const transformationRoadmapEngine = new TransformationRoadmapEngine();
