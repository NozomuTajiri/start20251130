/**
 * Culture Transformation Engine
 * 4.9 組織文化変容支援エンジン
 */

import type {
  FunctionResult,
  CultureDimension,
  CultureAssessment,
  CultureArtifact,
  CultureValue,
  CultureAssumption,
  CultureTransformation,
  CultureIntervention,
} from '../types';

export interface CultureInput {
  dimensions?: DimensionInput[];
  artifacts?: ArtifactInput[];
  values?: ValueInput[];
  context?: CultureContext;
}

export interface DimensionInput {
  name: string;
  currentPosition?: number;
  targetPosition?: number;
  importance?: number;
}

export interface ArtifactInput {
  type: CultureArtifact['type'];
  description: string;
  alignment?: 'reinforcing' | 'neutral' | 'conflicting';
}

export interface ValueInput {
  stated: string;
  practiced?: string;
}

export interface CultureContext {
  organizationType: 'startup' | 'growth' | 'mature' | 'turnaround';
  industry: string;
  geographies?: string[];
  transformationGoals?: string[];
}

export class CultureTransformationEngine {
  private standardDimensions: DimensionDefinition[] = [
    { name: 'Innovation', description: 'Risk-taking vs. stability', scale: 'low-high' },
    { name: 'Collaboration', description: 'Individual vs. team focus', scale: 'low-high' },
    { name: 'Customer Focus', description: 'Internal vs. external orientation', scale: 'low-high' },
    { name: 'Hierarchy', description: 'Flat vs. hierarchical structure', scale: 'low-high' },
    { name: 'Speed', description: 'Deliberate vs. fast decision-making', scale: 'low-high' },
    { name: 'Results Orientation', description: 'Process vs. outcome focus', scale: 'low-high' },
    { name: 'Learning', description: 'Fixed vs. growth mindset', scale: 'low-high' },
    { name: 'Transparency', description: 'Closed vs. open communication', scale: 'low-high' },
  ];

  /**
   * Assess organizational culture
   */
  async assess(input: CultureInput): Promise<FunctionResult<CultureAssessment>> {
    const startTime = Date.now();

    const dimensions = this.assessDimensions(input.dimensions, input.context);
    const artifacts = this.assessArtifacts(input.artifacts);
    const values = this.assessValues(input.values);
    const assumptions = this.identifyAssumptions(dimensions, artifacts, values);
    const overallAlignment = this.calculateOverallAlignment(dimensions, values);

    const assessment: CultureAssessment = {
      dimensions,
      artifacts,
      values,
      assumptions,
      overallAlignment,
    };

    return {
      data: assessment,
      confidence: this.calculateConfidence(input),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateAssessmentRecommendations(assessment),
    };
  }

  /**
   * Design culture transformation
   */
  async design(
    assessment: CultureAssessment,
    targetCulture: TargetCulture
  ): Promise<FunctionResult<CultureTransformation>> {
    const startTime = Date.now();

    const interventions = this.designInterventions(assessment, targetCulture);
    const timeline = this.estimateTimeline(assessment, interventions);
    const successIndicators = this.defineSuccessIndicators(targetCulture);

    const transformation: CultureTransformation = {
      assessment,
      interventions,
      timeline,
      successIndicators,
    };

    return {
      data: transformation,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: [
        'Start with visible leadership behavior changes',
        'Align systems and processes with target culture',
        'Celebrate early wins to build momentum',
      ],
    };
  }

  /**
   * Design specific intervention
   */
  async designIntervention(
    dimension: CultureDimension,
    context: CultureContext
  ): Promise<FunctionResult<DetailedIntervention>> {
    const startTime = Date.now();

    const strategies = this.selectStrategies(dimension, context);
    const tactics = this.developTactics(dimension, strategies);
    const timeline = this.planInterventionTimeline(strategies);
    const resources = this.estimateResources(strategies);
    const risks = this.assessInterventionRisks(strategies);

    const intervention: DetailedIntervention = {
      dimension: dimension.name,
      currentGap: dimension.targetPosition - dimension.currentPosition,
      strategies,
      tactics,
      timeline,
      resources,
      risks,
      expectedOutcome: this.projectOutcome(dimension, strategies),
    };

    return {
      data: intervention,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Monitor culture change
   */
  async monitor(
    baseline: CultureAssessment,
    currentIndicators: CultureIndicator[]
  ): Promise<FunctionResult<CultureMonitoringReport>> {
    const startTime = Date.now();

    const dimensionProgress = this.assessDimensionProgress(baseline.dimensions, currentIndicators);
    const valueProgress = this.assessValueProgress(baseline.values, currentIndicators);
    const overallProgress = this.calculateOverallProgress(dimensionProgress, valueProgress);
    const insights = this.generateInsights(dimensionProgress, valueProgress);
    const recommendations = this.generateMonitoringRecommendations(overallProgress);

    const report: CultureMonitoringReport = {
      timestamp: new Date(),
      baseline,
      dimensionProgress,
      valueProgress,
      overallProgress,
      insights,
      recommendations,
    };

    return {
      data: report,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Generate culture narratives
   */
  async generateNarrative(
    assessment: CultureAssessment,
    audience: 'leadership' | 'employees' | 'external'
  ): Promise<FunctionResult<CultureNarrative>> {
    const startTime = Date.now();

    const currentCulture = this.describeCulture(assessment, audience);
    const targetCulture = this.describeTargetCulture(assessment, audience);
    const transformationStory = this.createTransformationStory(assessment, audience);
    const callToAction = this.createCallToAction(audience);

    const narrative: CultureNarrative = {
      audience,
      currentCulture,
      targetCulture,
      transformationStory,
      callToAction,
      keyMessages: this.extractKeyMessages(assessment, audience),
    };

    return {
      data: narrative,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  private assessDimensions(
    inputs?: DimensionInput[],
    context?: CultureContext
  ): CultureDimension[] {
    if (inputs && inputs.length > 0) {
      return inputs.map((input) => this.buildDimension(input, context));
    }

    // Return standard dimensions with defaults
    return this.standardDimensions.map((def) => ({
      name: def.name,
      currentPosition: this.getContextualDefault(def.name, context),
      targetPosition: this.getContextualTarget(def.name, context),
      gap: 0,
      importance: this.getImportance(def.name, context),
    })).map((d) => ({ ...d, gap: d.targetPosition - d.currentPosition }));
  }

  private buildDimension(input: DimensionInput, context?: CultureContext): CultureDimension {
    const current = input.currentPosition ?? this.getContextualDefault(input.name, context);
    const target = input.targetPosition ?? this.getContextualTarget(input.name, context);

    return {
      name: input.name,
      currentPosition: current,
      targetPosition: target,
      gap: target - current,
      importance: input.importance ?? this.getImportance(input.name, context),
    };
  }

  private getContextualDefault(dimensionName: string, context?: CultureContext): number {
    const defaults: Record<string, Record<string, number>> = {
      startup: { Innovation: 0.7, Speed: 0.8, Hierarchy: 0.3, Learning: 0.7 },
      growth: { Innovation: 0.6, Speed: 0.7, Hierarchy: 0.4, Learning: 0.6 },
      mature: { Innovation: 0.4, Speed: 0.4, Hierarchy: 0.7, Learning: 0.4 },
      turnaround: { Innovation: 0.3, Speed: 0.5, Hierarchy: 0.6, Learning: 0.5 },
    };

    const orgType = context?.organizationType || 'mature';
    return defaults[orgType]?.[dimensionName] ?? 0.5;
  }

  private getContextualTarget(dimensionName: string, context?: CultureContext): number {
    const targets: Record<string, Record<string, number>> = {
      startup: { Innovation: 0.8, Speed: 0.8, Hierarchy: 0.2, Learning: 0.8 },
      growth: { Innovation: 0.7, Speed: 0.7, Hierarchy: 0.4, Learning: 0.7 },
      mature: { Innovation: 0.6, Speed: 0.6, Hierarchy: 0.5, Learning: 0.6 },
      turnaround: { Innovation: 0.6, Speed: 0.7, Hierarchy: 0.4, Learning: 0.7 },
    };

    const orgType = context?.organizationType || 'mature';
    return targets[orgType]?.[dimensionName] ?? 0.7;
  }

  private getImportance(dimensionName: string, context?: CultureContext): number {
    const baseImportance: Record<string, number> = {
      Innovation: 0.8,
      Collaboration: 0.7,
      'Customer Focus': 0.9,
      Hierarchy: 0.5,
      Speed: 0.7,
      'Results Orientation': 0.8,
      Learning: 0.8,
      Transparency: 0.7,
    };

    let importance = baseImportance[dimensionName] ?? 0.5;

    // Adjust for transformation goals
    if (context?.transformationGoals) {
      for (const goal of context.transformationGoals) {
        if (goal.toLowerCase().includes(dimensionName.toLowerCase())) {
          importance = Math.min(1, importance + 0.2);
        }
      }
    }

    return importance;
  }

  private assessArtifacts(inputs?: ArtifactInput[]): CultureArtifact[] {
    if (!inputs || inputs.length === 0) {
      return this.getDefaultArtifacts();
    }

    return inputs.map((input) => ({
      type: input.type,
      description: input.description,
      alignment: input.alignment || this.inferAlignment(input),
      recommendation: this.generateArtifactRecommendation(input),
    }));
  }

  private getDefaultArtifacts(): CultureArtifact[] {
    return [
      {
        type: 'symbol',
        description: 'Office layout and design',
        alignment: 'neutral',
        recommendation: 'Review workspace design to reinforce target culture',
      },
      {
        type: 'ritual',
        description: 'Team meetings and ceremonies',
        alignment: 'neutral',
        recommendation: 'Evaluate meeting practices against cultural goals',
      },
      {
        type: 'language',
        description: 'Communication style and terminology',
        alignment: 'neutral',
        recommendation: 'Assess language patterns for cultural alignment',
      },
    ];
  }

  private inferAlignment(artifact: ArtifactInput): CultureArtifact['alignment'] {
    // Simple heuristic based on type
    const description = artifact.description.toLowerCase();

    if (description.includes('traditional') || description.includes('formal')) {
      return 'neutral';
    }
    if (description.includes('innovative') || description.includes('collaborative')) {
      return 'reinforcing';
    }
    if (description.includes('outdated') || description.includes('bureaucratic')) {
      return 'conflicting';
    }

    return 'neutral';
  }

  private generateArtifactRecommendation(artifact: ArtifactInput): string {
    const recommendations: Record<string, string> = {
      symbol: 'Review and update physical and visual symbols to reflect target culture',
      ritual: 'Redesign rituals to reinforce desired behaviors',
      language: 'Develop new vocabulary that embodies cultural values',
      story: 'Create and share stories that exemplify target culture',
      practice: 'Align daily practices with cultural objectives',
    };

    return recommendations[artifact.type] || 'Assess artifact for cultural alignment';
  }

  private assessValues(inputs?: ValueInput[]): CultureValue[] {
    if (!inputs || inputs.length === 0) {
      return this.getDefaultValues();
    }

    return inputs.map((input) => ({
      stated: input.stated,
      practiced: input.practiced || this.inferPracticedValue(input.stated),
      gapAnalysis: this.analyzeValueGap(input.stated, input.practiced),
      bridgingActions: this.suggestBridgingActions(input.stated, input.practiced),
    }));
  }

  private getDefaultValues(): CultureValue[] {
    return [
      {
        stated: 'Innovation',
        practiced: 'Risk aversion in practice',
        gapAnalysis: 'Gap between stated innovation value and actual risk tolerance',
        bridgingActions: ['Create safe-to-fail experiments', 'Reward calculated risk-taking'],
      },
      {
        stated: 'Customer Focus',
        practiced: 'Internal focus predominates',
        gapAnalysis: 'Insufficient customer voice in decisions',
        bridgingActions: ['Increase customer touchpoints', 'Include customer metrics in goals'],
      },
      {
        stated: 'Collaboration',
        practiced: 'Siloed operations',
        gapAnalysis: 'Structural barriers to collaboration',
        bridgingActions: ['Create cross-functional teams', 'Reward collaborative outcomes'],
      },
    ];
  }

  private inferPracticedValue(stated: string): string {
    const practiceGaps: Record<string, string> = {
      Innovation: 'Traditional approaches often prevail',
      'Customer Focus': 'Internal priorities sometimes dominate',
      Collaboration: 'Individual contributions emphasized',
      Excellence: 'Speed sometimes prioritized over quality',
      Integrity: 'Generally practiced but tested under pressure',
    };

    return practiceGaps[stated] || `${stated} partially practiced`;
  }

  private analyzeValueGap(stated: string, practiced?: string): string {
    if (!practiced || practiced.toLowerCase().includes('practiced')) {
      return 'Value appears to be lived consistently';
    }

    return `Gap exists between stated value "${stated}" and observed behavior: ${practiced}`;
  }

  private suggestBridgingActions(stated: string, _practiced?: string): string[] {
    const actions: Record<string, string[]> = {
      Innovation: [
        'Allocate time for experimentation',
        'Celebrate learning from failures',
        'Recognize innovative contributions',
      ],
      'Customer Focus': [
        'Increase customer interaction for all employees',
        'Share customer feedback broadly',
        'Include customer metrics in performance reviews',
      ],
      Collaboration: [
        'Create cross-functional project teams',
        'Reward team achievements',
        'Design workspace for collaboration',
      ],
      Excellence: [
        'Establish clear quality standards',
        'Provide resources for professional development',
        'Celebrate excellence consistently',
      ],
      Integrity: [
        'Model ethical behavior at all levels',
        'Create safe channels for raising concerns',
        'Make decisions transparent',
      ],
    };

    return actions[stated] || [
      `Reinforce ${stated} through leadership behavior`,
      `Align systems to reward ${stated}`,
      `Communicate importance of ${stated} consistently`,
    ];
  }

  private identifyAssumptions(
    dimensions: CultureDimension[],
    _artifacts: CultureArtifact[],
    _values: CultureValue[]
  ): CultureAssumption[] {
    const assumptions: CultureAssumption[] = [];

    // Infer assumptions from dimension positions
    for (const dim of dimensions) {
      if (dim.name === 'Hierarchy' && dim.currentPosition > 0.6) {
        assumptions.push({
          assumption: 'Decisions should flow through formal hierarchy',
          implication: 'May slow decision-making and discourage initiative',
          needsChange: dim.gap < 0,
          changeStrategy: 'Empower teams with decision rights at appropriate levels',
        });
      }

      if (dim.name === 'Innovation' && dim.currentPosition < 0.4) {
        assumptions.push({
          assumption: 'Stability and predictability are more valuable than innovation',
          implication: 'May miss market opportunities and discourage creativity',
          needsChange: dim.gap > 0,
          changeStrategy: 'Create safe spaces for experimentation and reward learning',
        });
      }

      if (dim.name === 'Speed' && dim.currentPosition < 0.4) {
        assumptions.push({
          assumption: 'Thorough analysis should precede all decisions',
          implication: 'May result in missed opportunities and slow response',
          needsChange: dim.gap > 0,
          changeStrategy: 'Implement decision frameworks for different decision types',
        });
      }
    }

    // Add general assumption
    assumptions.push({
      assumption: 'Current way of working has been successful',
      implication: 'May create resistance to change',
      needsChange: true,
      changeStrategy: 'Acknowledge past success while building case for change',
    });

    return assumptions;
  }

  private calculateOverallAlignment(
    dimensions: CultureDimension[],
    values: CultureValue[]
  ): number {
    // Calculate dimension alignment
    const dimAlignment = dimensions.reduce((acc, d) => {
      const gapScore = 1 - Math.abs(d.gap);
      return acc + gapScore * d.importance;
    }, 0);

    const dimWeight = dimensions.reduce((acc, d) => acc + d.importance, 0);
    const dimAlignmentScore = dimWeight > 0 ? dimAlignment / dimWeight : 0.5;

    // Calculate value alignment (simple heuristic)
    const valueAlignment = values.reduce((acc, v) => {
      const hasGap = v.gapAnalysis.toLowerCase().includes('gap');
      return acc + (hasGap ? 0.5 : 1);
    }, 0);

    const valueAlignmentScore = values.length > 0 ? valueAlignment / values.length : 0.5;

    return (dimAlignmentScore + valueAlignmentScore) / 2;
  }

  private designInterventions(
    assessment: CultureAssessment,
    target: TargetCulture
  ): CultureIntervention[] {
    const interventions: CultureIntervention[] = [];

    // Dimension-based interventions
    for (const dim of assessment.dimensions.filter((d) => Math.abs(d.gap) > 0.2)) {
      interventions.push(this.createDimensionIntervention(dim, target));
    }

    // Value-based interventions
    for (const value of assessment.values.filter((v) => v.gapAnalysis.includes('Gap'))) {
      interventions.push(this.createValueIntervention(value));
    }

    // Artifact-based interventions
    for (const artifact of assessment.artifacts.filter((a) => a.alignment === 'conflicting')) {
      interventions.push(this.createArtifactIntervention(artifact));
    }

    return interventions;
  }

  private createDimensionIntervention(
    dimension: CultureDimension,
    _target: TargetCulture
  ): CultureIntervention {
    const direction = dimension.gap > 0 ? 'increase' : 'decrease';

    return {
      name: `${dimension.name} Culture Shift`,
      targetDimension: dimension.name,
      type: this.selectInterventionType(dimension.name),
      description: `${direction.charAt(0).toUpperCase() + direction.slice(1)} ${dimension.name.toLowerCase()} orientation from ${dimension.currentPosition.toFixed(1)} to ${dimension.targetPosition.toFixed(1)}`,
      expectedImpact: `Close ${Math.abs(dimension.gap).toFixed(1)} gap in ${dimension.name.toLowerCase()}`,
      timeline: this.estimateInterventionTimeline(Math.abs(dimension.gap)),
    };
  }

  private createValueIntervention(value: CultureValue): CultureIntervention {
    return {
      name: `${value.stated} Value Activation`,
      targetDimension: value.stated,
      type: 'behavioral',
      description: `Bridge gap between stated and practiced ${value.stated.toLowerCase()}`,
      expectedImpact: `Align behaviors with ${value.stated} value`,
      timeline: '6-12 months',
    };
  }

  private createArtifactIntervention(artifact: CultureArtifact): CultureIntervention {
    return {
      name: `${artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)} Alignment`,
      targetDimension: 'Cultural Artifacts',
      type: 'symbolic',
      description: `Realign ${artifact.type}: ${artifact.description}`,
      expectedImpact: 'Remove cultural inconsistency',
      timeline: '3-6 months',
    };
  }

  private selectInterventionType(dimension: string): CultureIntervention['type'] {
    const typeMap: Record<string, CultureIntervention['type']> = {
      Innovation: 'structural',
      Collaboration: 'structural',
      Hierarchy: 'structural',
      Speed: 'systems',
      Learning: 'behavioral',
      Transparency: 'systems',
      'Customer Focus': 'behavioral',
      'Results Orientation': 'systems',
    };

    return typeMap[dimension] || 'behavioral';
  }

  private estimateInterventionTimeline(gap: number): string {
    if (gap > 0.4) return '12-18 months';
    if (gap > 0.2) return '6-12 months';
    return '3-6 months';
  }

  private estimateTimeline(
    _assessment: CultureAssessment,
    interventions: CultureIntervention[]
  ): string {
    const maxMonths = Math.max(
      ...interventions.map((i) => {
        const match = i.timeline.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 6;
      })
    );

    return `${maxMonths} months`;
  }

  private defineSuccessIndicators(target: TargetCulture): string[] {
    const indicators: string[] = [];

    for (const dimension of target.dimensions) {
      indicators.push(`${dimension} dimension reaches target level`);
    }

    indicators.push('Employee culture survey scores improve');
    indicators.push('Values-behavior alignment increases');
    indicators.push('Cultural artifacts consistently reinforce target culture');

    return indicators;
  }

  private selectStrategies(dimension: CultureDimension, _context: CultureContext): Strategy[] {
    const strategies: Strategy[] = [];
    const direction = dimension.gap > 0 ? 'increase' : 'decrease';

    // Leadership behavior strategy
    strategies.push({
      name: 'Leadership Role Modeling',
      description: `Leaders consistently demonstrate ${dimension.name.toLowerCase()} behaviors`,
      category: 'behavioral',
      priority: 'high',
    });

    // Structural strategy
    strategies.push({
      name: 'Structural Alignment',
      description: `Adjust organizational structures to ${direction} ${dimension.name.toLowerCase()}`,
      category: 'structural',
      priority: 'medium',
    });

    // Systems strategy
    strategies.push({
      name: 'Systems Reinforcement',
      description: `Align reward, recognition, and measurement systems with ${dimension.name.toLowerCase()} goals`,
      category: 'systems',
      priority: 'high',
    });

    return strategies;
  }

  private developTactics(dimension: CultureDimension, strategies: Strategy[]): Tactic[] {
    const tactics: Tactic[] = [];

    for (const strategy of strategies) {
      switch (strategy.category) {
        case 'behavioral':
          tactics.push({
            strategy: strategy.name,
            tactic: `Create ${dimension.name} leadership workshop`,
            frequency: 'Quarterly',
            owner: 'HR/OD',
          });
          tactics.push({
            strategy: strategy.name,
            tactic: `Include ${dimension.name.toLowerCase()} in leadership expectations`,
            frequency: 'Annual review',
            owner: 'Leadership Team',
          });
          break;

        case 'structural':
          tactics.push({
            strategy: strategy.name,
            tactic: `Review and adjust decision rights for ${dimension.name.toLowerCase()}`,
            frequency: 'One-time',
            owner: 'Executive Team',
          });
          break;

        case 'systems':
          tactics.push({
            strategy: strategy.name,
            tactic: `Add ${dimension.name.toLowerCase()} metrics to performance reviews`,
            frequency: 'Ongoing',
            owner: 'HR',
          });
          tactics.push({
            strategy: strategy.name,
            tactic: `Create recognition program for ${dimension.name.toLowerCase()} behaviors`,
            frequency: 'Monthly',
            owner: 'HR',
          });
          break;
      }
    }

    return tactics;
  }

  private planInterventionTimeline(strategies: Strategy[]): InterventionTimeline {
    return {
      phases: [
        {
          name: 'Preparation',
          duration: '4 weeks',
          activities: ['Design interventions', 'Prepare materials', 'Train facilitators'],
        },
        {
          name: 'Launch',
          duration: '4 weeks',
          activities: strategies.map((s) => `Launch ${s.name}`),
        },
        {
          name: 'Execution',
          duration: '16-24 weeks',
          activities: ['Implement strategies', 'Monitor progress', 'Adjust as needed'],
        },
        {
          name: 'Sustainment',
          duration: 'Ongoing',
          activities: ['Reinforce changes', 'Celebrate wins', 'Continuous improvement'],
        },
      ],
    };
  }

  private estimateResources(strategies: Strategy[]): ResourceEstimate {
    const baseResources = {
      budget: 50000,
      people: 2,
      time: 100,
    };

    return {
      budget: `$${(baseResources.budget * strategies.length).toLocaleString()}`,
      people: `${baseResources.people + strategies.length} FTEs`,
      time: `${baseResources.time * strategies.length} hours`,
      external: strategies.length > 3 ? 'Consider external support' : 'Internal resources sufficient',
    };
  }

  private assessInterventionRisks(strategies: Strategy[]): InterventionRisk[] {
    const risks: InterventionRisk[] = [];

    if (strategies.some((s) => s.category === 'structural')) {
      risks.push({
        risk: 'Structural changes may face resistance',
        probability: 0.4,
        impact: 'high',
        mitigation: 'Engage stakeholders early and communicate rationale',
      });
    }

    risks.push({
      risk: 'Culture change takes longer than planned',
      probability: 0.6,
      impact: 'medium',
      mitigation: 'Build in flexibility and plan for extended timeline',
    });

    risks.push({
      risk: 'Leadership commitment wavers',
      probability: 0.3,
      impact: 'high',
      mitigation: 'Regular leadership engagement and progress reporting',
    });

    return risks;
  }

  private projectOutcome(dimension: CultureDimension, _strategies: Strategy[]): string {
    return `Expected ${dimension.name} shift from ${dimension.currentPosition.toFixed(1)} to ${dimension.targetPosition.toFixed(1)} within 12-18 months`;
  }

  private assessDimensionProgress(
    baseline: CultureDimension[],
    indicators: CultureIndicator[]
  ): DimensionProgress[] {
    return baseline.map((dim) => {
      const indicator = indicators.find((i) => i.dimension === dim.name);
      const current = indicator?.currentValue ?? dim.currentPosition;
      const change = current - dim.currentPosition;

      return {
        dimension: dim.name,
        baseline: dim.currentPosition,
        current,
        target: dim.targetPosition,
        change,
        onTrack: Math.abs(current - dim.targetPosition) < Math.abs(dim.gap),
      };
    });
  }

  private assessValueProgress(
    baseline: CultureValue[],
    indicators: CultureIndicator[]
  ): ValueProgress[] {
    return baseline.map((value) => {
      const indicator = indicators.find((i) => i.dimension === value.stated);

      return {
        value: value.stated,
        alignmentScore: indicator?.currentValue ?? 0.5,
        trend: indicator ? (indicator.currentValue > 0.5 ? 'improving' : 'stable') : 'unknown',
        observations: indicator?.observations || [],
      };
    });
  }

  private calculateOverallProgress(
    dimensionProgress: DimensionProgress[],
    valueProgress: ValueProgress[]
  ): number {
    const dimProgress = dimensionProgress.reduce((acc, d) => {
      const targetChange = d.target - d.baseline;
      const actualChange = d.change;
      return acc + (targetChange !== 0 ? actualChange / targetChange : 1);
    }, 0) / dimensionProgress.length;

    const valProgress = valueProgress.reduce((acc, v) =>
      acc + v.alignmentScore, 0) / valueProgress.length;

    return (dimProgress + valProgress) / 2;
  }

  private generateInsights(
    dimensionProgress: DimensionProgress[],
    _valueProgress: ValueProgress[]
  ): string[] {
    const insights: string[] = [];

    const improving = dimensionProgress.filter((d) => d.change > 0.1);
    if (improving.length > 0) {
      insights.push(`${improving.length} dimension(s) showing positive momentum`);
    }

    const lagging = dimensionProgress.filter((d) => d.change < -0.1);
    if (lagging.length > 0) {
      insights.push(`${lagging.length} dimension(s) need attention: ${lagging.map((d) => d.dimension).join(', ')}`);
    }

    const onTrack = dimensionProgress.filter((d) => d.onTrack);
    insights.push(`${onTrack.length}/${dimensionProgress.length} dimensions on track to reach target`);

    return insights;
  }

  private generateMonitoringRecommendations(progress: number): string[] {
    const recommendations: string[] = [];

    if (progress < 0.3) {
      recommendations.push('Progress below expectations - review and adjust interventions');
      recommendations.push('Consider increasing leadership involvement');
    } else if (progress < 0.6) {
      recommendations.push('Progress moderate - maintain momentum');
      recommendations.push('Identify and address specific barriers');
    } else {
      recommendations.push('Progress on track - continue current approach');
      recommendations.push('Look for opportunities to accelerate');
    }

    return recommendations;
  }

  private describeCulture(assessment: CultureAssessment, audience: string): string {
    const highDimensions = assessment.dimensions
      .filter((d) => d.currentPosition > 0.6)
      .map((d) => d.name.toLowerCase());

    const lowDimensions = assessment.dimensions
      .filter((d) => d.currentPosition < 0.4)
      .map((d) => d.name.toLowerCase());

    let description = 'Our current culture is characterized by ';

    if (highDimensions.length > 0) {
      description += `strong ${highDimensions.join(' and ')}`;
    }

    if (lowDimensions.length > 0 && audience !== 'external') {
      description += `, with opportunities to develop ${lowDimensions.join(' and ')}`;
    }

    description += '.';

    return description;
  }

  private describeTargetCulture(assessment: CultureAssessment, _audience: string): string {
    const targetDimensions = assessment.dimensions
      .filter((d) => d.gap > 0.2)
      .map((d) => d.name.toLowerCase());

    return `Our target culture emphasizes ${targetDimensions.join(', ')} to drive organizational success.`;
  }

  private createTransformationStory(assessment: CultureAssessment, _audience: string): string {
    const gaps = assessment.dimensions.filter((d) => Math.abs(d.gap) > 0.2);

    return `We are on a journey to transform our culture. By strengthening ${gaps.map((g) => g.name.toLowerCase()).join(', ')}, we will be better positioned to achieve our strategic goals and create value for all stakeholders.`;
  }

  private createCallToAction(audience: string): string {
    const ctas: Record<string, string> = {
      leadership: 'Lead by example - your behavior sets the tone for the entire organization.',
      employees: 'Be the change - every day is an opportunity to live our culture.',
      external: 'Partner with us as we build a culture of excellence.',
    };

    return ctas[audience] || 'Join us on this cultural transformation journey.';
  }

  private extractKeyMessages(assessment: CultureAssessment, _audience: string): string[] {
    return [
      'Culture is everyone\'s responsibility',
      `Our key focus areas: ${assessment.dimensions.filter((d) => Math.abs(d.gap) > 0.2).map((d) => d.name).join(', ')}`,
      'Progress requires consistent effort over time',
      'Your voice matters - share feedback and ideas',
    ];
  }

  private calculateConfidence(input: CultureInput): number {
    let confidence = 0.5;

    if (input.dimensions && input.dimensions.length > 3) confidence += 0.15;
    if (input.artifacts && input.artifacts.length > 2) confidence += 0.1;
    if (input.values && input.values.length > 2) confidence += 0.1;
    if (input.context) confidence += 0.1;

    return Math.min(0.9, confidence);
  }

  private generateAssessmentRecommendations(assessment: CultureAssessment): string[] {
    const recommendations: string[] = [];

    if (assessment.overallAlignment < 0.5) {
      recommendations.push('Significant culture alignment work needed');
    }

    const largeGaps = assessment.dimensions.filter((d) => Math.abs(d.gap) > 0.3);
    if (largeGaps.length > 0) {
      recommendations.push(`Priority focus on: ${largeGaps.map((d) => d.name).join(', ')}`);
    }

    const conflictingArtifacts = assessment.artifacts.filter((a) => a.alignment === 'conflicting');
    if (conflictingArtifacts.length > 0) {
      recommendations.push('Address conflicting cultural artifacts');
    }

    recommendations.push('Validate assessment with stakeholder input');

    return recommendations;
  }
}

// Additional types for this engine
interface DimensionDefinition {
  name: string;
  description: string;
  scale: string;
}

interface TargetCulture {
  dimensions: string[];
  values?: string[];
  timeline?: string;
}

interface DetailedIntervention {
  dimension: string;
  currentGap: number;
  strategies: Strategy[];
  tactics: Tactic[];
  timeline: InterventionTimeline;
  resources: ResourceEstimate;
  risks: InterventionRisk[];
  expectedOutcome: string;
}

interface Strategy {
  name: string;
  description: string;
  category: 'behavioral' | 'structural' | 'systems' | 'symbolic';
  priority: 'high' | 'medium' | 'low';
}

interface Tactic {
  strategy: string;
  tactic: string;
  frequency: string;
  owner: string;
}

interface InterventionTimeline {
  phases: Array<{ name: string; duration: string; activities: string[] }>;
}

interface ResourceEstimate {
  budget: string;
  people: string;
  time: string;
  external: string;
}

interface InterventionRisk {
  risk: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface CultureIndicator {
  dimension: string;
  currentValue: number;
  observations?: string[];
}

interface CultureMonitoringReport {
  timestamp: Date;
  baseline: CultureAssessment;
  dimensionProgress: DimensionProgress[];
  valueProgress: ValueProgress[];
  overallProgress: number;
  insights: string[];
  recommendations: string[];
}

interface DimensionProgress {
  dimension: string;
  baseline: number;
  current: number;
  target: number;
  change: number;
  onTrack: boolean;
}

interface ValueProgress {
  value: string;
  alignmentScore: number;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  observations: string[];
}

interface CultureNarrative {
  audience: string;
  currentCulture: string;
  targetCulture: string;
  transformationStory: string;
  callToAction: string;
  keyMessages: string[];
}

export const cultureTransformationEngine = new CultureTransformationEngine();
