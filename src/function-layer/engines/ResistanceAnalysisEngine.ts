/**
 * Resistance Analysis Engine
 * 4.8 変革抵抗分析エンジン
 */

import type {
  FunctionResult,
  StakeholderGroup,
  ResistanceFactor,
  ResistanceAnalysis,
  StakeholderAssessment,
  ResistanceHotspot,
  ResistanceMitigation,
} from '../types';

export interface StakeholderInput {
  name: string;
  size?: number;
  influence?: number;
  impact?: number;
  currentAttitude?: StakeholderAssessment['currentAttitude'];
  concerns?: string[];
  motivations?: string[];
}

export interface ChangeContext {
  changeType: 'strategic' | 'operational' | 'cultural' | 'technological';
  changeScope: 'organization' | 'division' | 'department' | 'team';
  changeMagnitude: 'incremental' | 'moderate' | 'transformational';
  timeline?: string;
}

export class ResistanceAnalysisEngine {
  /**
   * Analyze resistance to change
   */
  async analyze(
    stakeholders: StakeholderInput[],
    changeContext: ChangeContext
  ): Promise<FunctionResult<ResistanceAnalysis>> {
    const startTime = Date.now();

    const stakeholderAssessments = stakeholders.map((s) =>
      this.assessStakeholder(s, changeContext)
    );

    const factors = this.identifyResistanceFactors(stakeholderAssessments, changeContext);
    const overallResistance = this.calculateOverallResistance(stakeholderAssessments, factors);
    const hotspots = this.identifyHotspots(stakeholderAssessments, factors);
    const strategies = this.developMitigationStrategies(hotspots, factors, changeContext);

    const analysis: ResistanceAnalysis = {
      stakeholders: stakeholderAssessments,
      factors,
      overallResistance,
      hotspots,
      strategies,
    };

    return {
      data: analysis,
      confidence: this.calculateConfidence(stakeholderAssessments),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateRecommendations(analysis, changeContext),
      warnings: hotspots
        .filter((h) => h.severity === 'critical')
        .map((h) => `Critical: ${h.description}`),
    };
  }

  /**
   * Predict resistance evolution
   */
  async predictEvolution(
    currentAnalysis: ResistanceAnalysis,
    interventions: Intervention[]
  ): Promise<FunctionResult<ResistanceEvolution>> {
    const startTime = Date.now();

    const predictions = this.generatePredictions(currentAnalysis, interventions);
    const scenarios = this.modelScenarios(currentAnalysis, interventions);
    const timeline = this.estimateTimeline(predictions);

    const evolution: ResistanceEvolution = {
      currentState: currentAnalysis.overallResistance,
      predictions,
      scenarios,
      timeline,
      recommendations: this.generateEvolutionRecommendations(predictions),
    };

    return {
      data: evolution,
      confidence: 0.65,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Design intervention strategy
   */
  async designIntervention(
    analysis: ResistanceAnalysis,
    constraints?: InterventionConstraints
  ): Promise<FunctionResult<InterventionPlan>> {
    const startTime = Date.now();

    const interventions = this.prioritizeInterventions(analysis, constraints);
    const phasing = this.phaseInterventions(interventions);
    const resources = this.estimateResources(interventions);
    const risks = this.assessInterventionRisks(interventions);

    const plan: InterventionPlan = {
      interventions,
      phasing,
      resources,
      risks,
      expectedOutcome: this.projectOutcome(analysis, interventions),
      contingencies: this.developContingencies(interventions, risks),
    };

    return {
      data: plan,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: [
        'Start with quick wins to build momentum',
        'Address high-influence stakeholders first',
        'Monitor resistance levels continuously',
      ],
    };
  }

  /**
   * Monitor resistance in real-time
   */
  async monitor(
    baselineAnalysis: ResistanceAnalysis,
    currentIndicators: ResistanceIndicator[]
  ): Promise<FunctionResult<ResistanceMonitoringReport>> {
    const startTime = Date.now();

    const currentResistance = this.calculateCurrentResistance(currentIndicators);
    const trend = this.analyzeTrend(baselineAnalysis.overallResistance, currentResistance);
    const alerts = this.generateAlerts(currentIndicators, trend);
    const actionItems = this.identifyActionItems(alerts);

    const report: ResistanceMonitoringReport = {
      timestamp: new Date(),
      baseline: baselineAnalysis.overallResistance,
      current: currentResistance,
      trend,
      alerts,
      actionItems,
    };

    return {
      data: report,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  private assessStakeholder(
    input: StakeholderInput,
    context: ChangeContext
  ): StakeholderAssessment {
    const group: StakeholderGroup = {
      id: `stakeholder-${input.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: input.name,
      size: input.size || 10,
      influence: input.influence || 0.5,
      impact: input.impact || 0.5,
    };

    const currentAttitude = input.currentAttitude || this.inferAttitude(input, context);
    const targetAttitude = this.determineTargetAttitude(currentAttitude);
    const concerns = input.concerns || this.inferConcerns(input, context);
    const motivations = input.motivations || this.inferMotivations(input, context);

    return {
      group,
      currentAttitude,
      targetAttitude,
      concerns,
      motivations,
    };
  }

  private inferAttitude(
    input: StakeholderInput,
    context: ChangeContext
  ): StakeholderAssessment['currentAttitude'] {
    // Higher influence tends to be more supportive (they have control)
    // Higher impact tends to be more resistant (more affected)
    const supportScore = (input.influence || 0.5) - (input.impact || 0.5);

    // Transformational changes create more resistance
    const changeFactor = context.changeMagnitude === 'transformational' ? -0.2 :
      context.changeMagnitude === 'moderate' ? -0.1 : 0;

    const score = supportScore + changeFactor;

    if (score > 0.3) return 'supporter';
    if (score > 0.1) return 'neutral';
    if (score > -0.1) return 'skeptic';
    return 'opponent';
  }

  private determineTargetAttitude(
    current: StakeholderAssessment['currentAttitude']
  ): StakeholderAssessment['targetAttitude'] {
    const progression: Record<string, StakeholderAssessment['targetAttitude']> = {
      opponent: 'skeptic',
      skeptic: 'neutral',
      neutral: 'supporter',
      supporter: 'champion',
      champion: 'champion',
    };
    return progression[current] || 'neutral';
  }

  private inferConcerns(input: StakeholderInput, context: ChangeContext): string[] {
    const concerns: string[] = [];

    if ((input.impact || 0.5) > 0.6) {
      concerns.push('Job security and role changes');
    }

    if (context.changeMagnitude === 'transformational') {
      concerns.push('Uncertainty about future state');
      concerns.push('Loss of established relationships');
    }

    if (context.changeType === 'technological') {
      concerns.push('Learning new skills');
      concerns.push('Technology competency');
    }

    if (context.changeType === 'cultural') {
      concerns.push('Values alignment');
      concerns.push('Behavioral expectations');
    }

    if (concerns.length === 0) {
      concerns.push('General uncertainty about change');
    }

    return concerns;
  }

  private inferMotivations(input: StakeholderInput, context: ChangeContext): string[] {
    const motivations: string[] = [];

    if ((input.influence || 0.5) > 0.6) {
      motivations.push('Opportunity to shape change');
      motivations.push('Leadership visibility');
    }

    if (context.changeType === 'strategic') {
      motivations.push('Organizational success');
      motivations.push('Competitive advantage');
    }

    if (context.changeType === 'technological') {
      motivations.push('Modern tools and capabilities');
      motivations.push('Efficiency improvements');
    }

    motivations.push('Professional growth');
    motivations.push('Better work environment');

    return motivations;
  }

  private identifyResistanceFactors(
    assessments: StakeholderAssessment[],
    context: ChangeContext
  ): ResistanceFactor[] {
    const factors: ResistanceFactor[] = [];

    // Analyze concerns across stakeholders
    const allConcerns = assessments.flatMap((a) => a.concerns);
    const concernCounts = this.countOccurrences(allConcerns);

    // Fear-based factors
    if (concernCounts.some(([concern]) =>
      concern.toLowerCase().includes('job') || concern.toLowerCase().includes('security')
    )) {
      factors.push({
        category: 'fear',
        description: 'Fear of job loss or role changes',
        intensity: this.calculateFactorIntensity(assessments, 'fear'),
        affectedGroups: assessments
          .filter((a) => a.concerns.some((c) => c.toLowerCase().includes('job')))
          .map((a) => a.group.name),
      });
    }

    // Habit-based factors
    if (context.changeMagnitude !== 'incremental') {
      factors.push({
        category: 'habit',
        description: 'Comfort with current ways of working',
        intensity: 0.6,
        affectedGroups: assessments
          .filter((a) => a.currentAttitude === 'skeptic' || a.currentAttitude === 'opponent')
          .map((a) => a.group.name),
      });
    }

    // Loss-based factors
    if (concernCounts.some(([concern]) =>
      concern.toLowerCase().includes('loss') || concern.toLowerCase().includes('relationships')
    )) {
      factors.push({
        category: 'loss',
        description: 'Perceived loss of status, autonomy, or relationships',
        intensity: this.calculateFactorIntensity(assessments, 'loss'),
        affectedGroups: assessments
          .filter((a) => a.concerns.some((c) => c.toLowerCase().includes('loss')))
          .map((a) => a.group.name),
      });
    }

    // Misunderstanding-based factors
    factors.push({
      category: 'misunderstanding',
      description: 'Lack of clarity about change purpose and process',
      intensity: 0.5,
      affectedGroups: assessments
        .filter((a) => a.currentAttitude === 'neutral' || a.currentAttitude === 'skeptic')
        .map((a) => a.group.name),
    });

    // Values-based factors
    if (context.changeType === 'cultural') {
      factors.push({
        category: 'values',
        description: 'Conflict with personal or organizational values',
        intensity: this.calculateFactorIntensity(assessments, 'values'),
        affectedGroups: assessments
          .filter((a) => a.concerns.some((c) => c.toLowerCase().includes('values')))
          .map((a) => a.group.name),
      });
    }

    return factors;
  }

  private countOccurrences(items: string[]): Array<[string, number]> {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }

  private calculateFactorIntensity(
    assessments: StakeholderAssessment[],
    _category: string
  ): number {
    const resistantCount = assessments.filter(
      (a) => a.currentAttitude === 'skeptic' || a.currentAttitude === 'opponent'
    ).length;

    return resistantCount / assessments.length;
  }

  private calculateOverallResistance(
    assessments: StakeholderAssessment[],
    factors: ResistanceFactor[]
  ): number {
    // Weight by influence and attitude
    const attitudeScores: Record<string, number> = {
      champion: -0.5,
      supporter: -0.2,
      neutral: 0,
      skeptic: 0.3,
      opponent: 0.6,
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const assessment of assessments) {
      const weight = assessment.group.influence * assessment.group.size;
      const score = attitudeScores[assessment.currentAttitude] || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    }

    const stakeholderResistance = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Add factor-based resistance
    const factorResistance = factors.reduce((acc, f) => acc + f.intensity, 0) / factors.length;

    return (stakeholderResistance + factorResistance) / 2;
  }

  private identifyHotspots(
    assessments: StakeholderAssessment[],
    factors: ResistanceFactor[]
  ): ResistanceHotspot[] {
    const hotspots: ResistanceHotspot[] = [];

    // High-influence opponents
    const highInfluenceOpponents = assessments.filter(
      (a) => a.group.influence > 0.6 &&
        (a.currentAttitude === 'opponent' || a.currentAttitude === 'skeptic')
    );

    for (const opponent of highInfluenceOpponents) {
      hotspots.push({
        area: opponent.group.name,
        description: `High-influence stakeholder ${opponent.group.name} shows resistance`,
        severity: opponent.currentAttitude === 'opponent' ? 'critical' : 'high',
        rootCauses: opponent.concerns,
      });
    }

    // Large resistant groups
    const largeResistantGroups = assessments.filter(
      (a) => a.group.size > 50 &&
        (a.currentAttitude === 'opponent' || a.currentAttitude === 'skeptic')
    );

    for (const group of largeResistantGroups) {
      hotspots.push({
        area: group.group.name,
        description: `Large group ${group.group.name} (${group.group.size} people) shows resistance`,
        severity: 'high',
        rootCauses: group.concerns,
      });
    }

    // High-intensity factors
    for (const factor of factors.filter((f) => f.intensity > 0.6)) {
      hotspots.push({
        area: factor.category,
        description: factor.description,
        severity: factor.intensity > 0.8 ? 'critical' : 'high',
        rootCauses: factor.affectedGroups,
      });
    }

    return hotspots;
  }

  private developMitigationStrategies(
    hotspots: ResistanceHotspot[],
    factors: ResistanceFactor[],
    _context: ChangeContext
  ): ResistanceMitigation[] {
    const strategies: ResistanceMitigation[] = [];

    // Address critical hotspots first
    for (const hotspot of hotspots.filter((h) => h.severity === 'critical')) {
      strategies.push({
        target: hotspot.area,
        strategy: this.selectStrategy(hotspot),
        tactics: this.selectTactics(hotspot),
        timeline: '1-2 weeks',
        expectedOutcome: `Reduce resistance in ${hotspot.area}`,
      });
    }

    // Address factors
    for (const factor of factors) {
      strategies.push({
        target: factor.category,
        strategy: this.getFactorStrategy(factor.category),
        tactics: this.getFactorTactics(factor.category),
        timeline: '2-4 weeks',
        expectedOutcome: `Mitigate ${factor.category}-based resistance`,
      });
    }

    return strategies;
  }

  private selectStrategy(hotspot: ResistanceHotspot): string {
    if (hotspot.severity === 'critical') {
      return 'Intensive engagement and negotiation';
    }
    if (hotspot.area.includes('group')) {
      return 'Group-level communication and involvement';
    }
    return 'Targeted stakeholder management';
  }

  private selectTactics(hotspot: ResistanceHotspot): string[] {
    const tactics: string[] = [];

    if (hotspot.severity === 'critical') {
      tactics.push('One-on-one meetings with senior leaders');
      tactics.push('Address specific concerns directly');
      tactics.push('Involve in decision-making process');
    }

    tactics.push('Regular communication updates');
    tactics.push('Provide clarity on impact and benefits');
    tactics.push('Create quick wins to build confidence');

    return tactics;
  }

  private getFactorStrategy(category: ResistanceFactor['category']): string {
    const strategies: Record<string, string> = {
      fear: 'Provide security and clarity',
      habit: 'Gradual transition with support',
      loss: 'Acknowledge loss and create new opportunities',
      misunderstanding: 'Clear communication and education',
      values: 'Connect change to shared values',
    };
    return strategies[category] || 'Address root causes';
  }

  private getFactorTactics(category: ResistanceFactor['category']): string[] {
    const tactics: Record<string, string[]> = {
      fear: [
        'Provide job security guarantees where possible',
        'Clarify future roles and expectations',
        'Offer retraining and development opportunities',
      ],
      habit: [
        'Allow time for transition',
        'Provide training and support',
        'Create parallel systems during transition',
      ],
      loss: [
        'Acknowledge what is being lost',
        'Create rituals for closure',
        'Highlight new opportunities',
      ],
      misunderstanding: [
        'Regular town halls and Q&A sessions',
        'Clear documentation and FAQs',
        'Multiple communication channels',
      ],
      values: [
        'Connect change to organizational values',
        'Involve employees in shaping implementation',
        'Demonstrate leadership commitment',
      ],
    };
    return tactics[category] || ['Address specific concerns'];
  }

  private generatePredictions(
    current: ResistanceAnalysis,
    interventions: Intervention[]
  ): ResistancePrediction[] {
    const predictions: ResistancePrediction[] = [];

    // Baseline prediction (no intervention)
    predictions.push({
      timeframe: '4 weeks',
      resistanceLevel: current.overallResistance * 0.95, // Slight natural decrease
      scenario: 'No intervention',
      probability: 0.2,
    });

    // With planned interventions
    const interventionImpact = interventions.reduce((acc, i) => acc + i.expectedImpact, 0);
    predictions.push({
      timeframe: '4 weeks',
      resistanceLevel: Math.max(0.1, current.overallResistance - interventionImpact * 0.3),
      scenario: 'Planned interventions',
      probability: 0.6,
    });

    // Optimistic scenario
    predictions.push({
      timeframe: '4 weeks',
      resistanceLevel: Math.max(0.05, current.overallResistance - interventionImpact * 0.5),
      scenario: 'Optimistic - interventions highly effective',
      probability: 0.15,
    });

    // Pessimistic scenario
    predictions.push({
      timeframe: '4 weeks',
      resistanceLevel: current.overallResistance * 0.9,
      scenario: 'Pessimistic - interventions less effective',
      probability: 0.05,
    });

    return predictions;
  }

  private modelScenarios(
    current: ResistanceAnalysis,
    _interventions: Intervention[]
  ): ResistanceScenario[] {
    return [
      {
        name: 'Best Case',
        description: 'All interventions succeed, key influencers become champions',
        endResistance: Math.max(0.1, current.overallResistance * 0.4),
        conditions: ['Strong leadership support', 'Clear quick wins', 'Effective communication'],
      },
      {
        name: 'Base Case',
        description: 'Interventions have expected impact, gradual attitude shift',
        endResistance: Math.max(0.2, current.overallResistance * 0.6),
        conditions: ['Consistent execution', 'Adequate resources', 'No major setbacks'],
      },
      {
        name: 'Worst Case',
        description: 'Interventions fail, resistance increases',
        endResistance: Math.min(1, current.overallResistance * 1.3),
        conditions: ['Poor execution', 'External shocks', 'Leadership wavering'],
      },
    ];
  }

  private estimateTimeline(predictions: ResistancePrediction[]): ResistanceTimeline {
    const baseCase = predictions.find((p) => p.scenario === 'Planned interventions');

    return {
      initialResistance: baseCase?.resistanceLevel || 0.5,
      projectedEndResistance: (baseCase?.resistanceLevel || 0.5) * 0.5,
      phases: [
        { phase: 'Awareness', duration: '2 weeks', expectedChange: -0.1 },
        { phase: 'Understanding', duration: '4 weeks', expectedChange: -0.15 },
        { phase: 'Acceptance', duration: '4 weeks', expectedChange: -0.15 },
        { phase: 'Commitment', duration: '4 weeks', expectedChange: -0.1 },
      ],
    };
  }

  private generateEvolutionRecommendations(predictions: ResistancePrediction[]): string[] {
    const recommendations: string[] = [];

    const pessimistic = predictions.find((p) => p.scenario.includes('Pessimistic'));
    if (pessimistic && pessimistic.probability > 0.1) {
      recommendations.push('Prepare contingency plans for intervention failure');
    }

    recommendations.push('Monitor leading indicators of resistance shift');
    recommendations.push('Adjust interventions based on observed response');
    recommendations.push('Celebrate and communicate progress');

    return recommendations;
  }

  private prioritizeInterventions(
    analysis: ResistanceAnalysis,
    constraints?: InterventionConstraints
  ): Intervention[] {
    const interventions: Intervention[] = [];

    // Convert strategies to interventions
    for (const strategy of analysis.strategies) {
      interventions.push({
        id: `intervention-${interventions.length + 1}`,
        name: `${strategy.target} Intervention`,
        type: this.determineInterventionType(strategy),
        target: strategy.target,
        description: strategy.strategy,
        tactics: strategy.tactics,
        expectedImpact: this.estimateImpact(strategy),
        resources: this.estimateInterventionResources(strategy),
        priority: this.calculatePriority(strategy, analysis),
      });
    }

    // Sort by priority
    interventions.sort((a, b) => b.priority - a.priority);

    // Apply constraints if provided
    if (constraints?.maxInterventions) {
      return interventions.slice(0, constraints.maxInterventions);
    }

    return interventions;
  }

  private determineInterventionType(
    strategy: ResistanceMitigation
  ): 'communication' | 'engagement' | 'structural' | 'incentive' {
    const target = strategy.target.toLowerCase();
    const strategyText = strategy.strategy.toLowerCase();

    if (strategyText.includes('communication') || target === 'misunderstanding') {
      return 'communication';
    }
    if (strategyText.includes('engagement') || strategyText.includes('involvement')) {
      return 'engagement';
    }
    if (target === 'fear' || strategyText.includes('security')) {
      return 'structural';
    }
    return 'incentive';
  }

  private estimateImpact(strategy: ResistanceMitigation): number {
    // Higher impact for targeted strategies on critical areas
    const timelineImpact = strategy.timeline.includes('1-2') ? 0.3 : 0.2;
    return Math.min(0.5, 0.2 + timelineImpact);
  }

  private estimateInterventionResources(
    _strategy: ResistanceMitigation
  ): InterventionResource[] {
    return [
      { type: 'time', amount: '20 hours', availability: 'available' },
      { type: 'budget', amount: '$5,000', availability: 'constrained' },
      { type: 'people', amount: '2 FTEs', availability: 'available' },
    ];
  }

  private calculatePriority(
    strategy: ResistanceMitigation,
    analysis: ResistanceAnalysis
  ): number {
    let priority = 0;

    // Critical hotspots get highest priority
    const relatedHotspot = analysis.hotspots.find(
      (h) => h.area === strategy.target || h.rootCauses.includes(strategy.target)
    );

    if (relatedHotspot?.severity === 'critical') {
      priority += 10;
    } else if (relatedHotspot?.severity === 'high') {
      priority += 7;
    }

    // Factor severity
    const relatedFactor = analysis.factors.find(
      (f) => f.category === strategy.target
    );
    if (relatedFactor) {
      priority += relatedFactor.intensity * 5;
    }

    return priority;
  }

  private phaseInterventions(interventions: Intervention[]): InterventionPhase[] {
    const phases: InterventionPhase[] = [];

    // Immediate phase (critical interventions)
    const immediate = interventions.filter((i) => i.priority >= 8);
    if (immediate.length > 0) {
      phases.push({
        name: 'Immediate',
        duration: '1-2 weeks',
        interventions: immediate.map((i) => i.id),
        focus: 'Address critical resistance points',
      });
    }

    // Short-term phase
    const shortTerm = interventions.filter((i) => i.priority >= 5 && i.priority < 8);
    if (shortTerm.length > 0) {
      phases.push({
        name: 'Short-term',
        duration: '2-4 weeks',
        interventions: shortTerm.map((i) => i.id),
        focus: 'Reduce overall resistance',
      });
    }

    // Ongoing phase
    const ongoing = interventions.filter((i) => i.priority < 5);
    phases.push({
      name: 'Ongoing',
      duration: 'Continuous',
      interventions: ongoing.map((i) => i.id),
      focus: 'Sustain engagement and address emerging resistance',
    });

    return phases;
  }

  private estimateResources(interventions: Intervention[]): ResourceSummary {
    let totalBudget = 0;
    let totalHours = 0;
    let totalFTEs = 0;

    for (const intervention of interventions) {
      for (const resource of intervention.resources) {
        const match = resource.amount.match(/\d+/);
        const value = match ? parseInt(match[1], 10) : 0;

        if (resource.type === 'budget') {
          totalBudget += value;
        } else if (resource.type === 'time') {
          totalHours += value;
        } else if (resource.type === 'people') {
          totalFTEs += value;
        }
      }
    }

    return {
      budget: `$${totalBudget.toLocaleString()}`,
      time: `${totalHours} hours`,
      people: `${totalFTEs} FTEs`,
      availability: totalFTEs > 5 ? 'constrained' : 'available',
    };
  }

  private assessInterventionRisks(interventions: Intervention[]): InterventionRisk[] {
    const risks: InterventionRisk[] = [];

    // Resource risk
    if (interventions.length > 5) {
      risks.push({
        risk: 'Resource overload',
        probability: 0.4,
        impact: 'high',
        mitigation: 'Prioritize and phase interventions',
      });
    }

    // Backfire risk
    risks.push({
      risk: 'Interventions perceived as manipulation',
      probability: 0.2,
      impact: 'high',
      mitigation: 'Ensure authenticity and transparency',
    });

    // Sustainability risk
    risks.push({
      risk: 'Gains not sustained after intervention',
      probability: 0.3,
      impact: 'medium',
      mitigation: 'Build ongoing engagement mechanisms',
    });

    return risks;
  }

  private projectOutcome(
    analysis: ResistanceAnalysis,
    interventions: Intervention[]
  ): string {
    const totalImpact = interventions.reduce((acc, i) => acc + i.expectedImpact, 0);
    const projectedResistance = Math.max(0.1, analysis.overallResistance - totalImpact);

    return `Expected resistance reduction from ${(analysis.overallResistance * 100).toFixed(0)}% to ${(projectedResistance * 100).toFixed(0)}%`;
  }

  private developContingencies(
    interventions: Intervention[],
    risks: InterventionRisk[]
  ): Contingency[] {
    const contingencies: Contingency[] = [];

    for (const risk of risks.filter((r) => r.impact === 'high')) {
      contingencies.push({
        trigger: risk.risk,
        response: risk.mitigation,
        owner: 'Change Management Lead',
      });
    }

    return contingencies;
  }

  private calculateCurrentResistance(indicators: ResistanceIndicator[]): number {
    if (indicators.length === 0) return 0.5;

    const weightedSum = indicators.reduce(
      (acc, i) => acc + i.value * i.weight,
      0
    );
    const totalWeight = indicators.reduce((acc, i) => acc + i.weight, 0);

    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  private analyzeTrend(
    baseline: number,
    current: number
  ): 'increasing' | 'stable' | 'decreasing' {
    const change = current - baseline;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private generateAlerts(
    indicators: ResistanceIndicator[],
    trend: string
  ): Alert[] {
    const alerts: Alert[] = [];

    if (trend === 'increasing') {
      alerts.push({
        level: 'warning',
        message: 'Resistance levels are increasing',
        action: 'Review and adjust intervention strategy',
      });
    }

    const highIndicators = indicators.filter((i) => i.value > 0.7);
    for (const indicator of highIndicators) {
      alerts.push({
        level: 'warning',
        message: `High resistance indicator: ${indicator.name}`,
        action: `Address ${indicator.name} specifically`,
      });
    }

    return alerts;
  }

  private identifyActionItems(alerts: Alert[]): ActionItem[] {
    return alerts.map((alert, index) => ({
      id: `action-${index + 1}`,
      description: alert.action,
      priority: alert.level === 'critical' ? 'high' : 'medium',
      dueDate: alert.level === 'critical' ? '1 week' : '2 weeks',
    }));
  }

  private calculateConfidence(assessments: StakeholderAssessment[]): number {
    let confidence = 0.5;

    if (assessments.length > 5) confidence += 0.15;
    if (assessments.every((a) => a.concerns.length > 0)) confidence += 0.1;
    if (assessments.every((a) => a.motivations.length > 0)) confidence += 0.1;

    return Math.min(0.9, confidence);
  }

  private generateRecommendations(
    analysis: ResistanceAnalysis,
    context: ChangeContext
  ): string[] {
    const recommendations: string[] = [];

    if (analysis.overallResistance > 0.6) {
      recommendations.push('High resistance detected - consider slowing change pace');
    }

    if (analysis.hotspots.some((h) => h.severity === 'critical')) {
      recommendations.push('Address critical hotspots before proceeding');
    }

    if (context.changeMagnitude === 'transformational') {
      recommendations.push('Plan for extended change journey due to transformation scope');
    }

    recommendations.push('Monitor resistance levels continuously');
    recommendations.push('Adjust approach based on stakeholder feedback');

    return recommendations;
  }
}

// Additional types for this engine
interface Intervention {
  id: string;
  name: string;
  type: 'communication' | 'engagement' | 'structural' | 'incentive';
  target: string;
  description: string;
  tactics: string[];
  expectedImpact: number;
  resources: InterventionResource[];
  priority: number;
}

interface InterventionResource {
  type: string;
  amount: string;
  availability: 'available' | 'constrained' | 'unavailable';
}

interface InterventionConstraints {
  maxInterventions?: number;
  budget?: number;
  timeline?: string;
}

interface InterventionPlan {
  interventions: Intervention[];
  phasing: InterventionPhase[];
  resources: ResourceSummary;
  risks: InterventionRisk[];
  expectedOutcome: string;
  contingencies: Contingency[];
}

interface InterventionPhase {
  name: string;
  duration: string;
  interventions: string[];
  focus: string;
}

interface ResourceSummary {
  budget: string;
  time: string;
  people: string;
  availability: 'available' | 'constrained';
}

interface InterventionRisk {
  risk: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface Contingency {
  trigger: string;
  response: string;
  owner: string;
}

interface ResistanceEvolution {
  currentState: number;
  predictions: ResistancePrediction[];
  scenarios: ResistanceScenario[];
  timeline: ResistanceTimeline;
  recommendations: string[];
}

interface ResistancePrediction {
  timeframe: string;
  resistanceLevel: number;
  scenario: string;
  probability: number;
}

interface ResistanceScenario {
  name: string;
  description: string;
  endResistance: number;
  conditions: string[];
}

interface ResistanceTimeline {
  initialResistance: number;
  projectedEndResistance: number;
  phases: Array<{ phase: string; duration: string; expectedChange: number }>;
}

interface ResistanceIndicator {
  name: string;
  value: number;
  weight: number;
}

interface ResistanceMonitoringReport {
  timestamp: Date;
  baseline: number;
  current: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  alerts: Alert[];
  actionItems: ActionItem[];
}

interface Alert {
  level: 'critical' | 'warning' | 'info';
  message: string;
  action: string;
}

interface ActionItem {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

export const resistanceAnalysisEngine = new ResistanceAnalysisEngine();
