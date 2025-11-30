/**
 * Scenario Generation Engine
 * 4.6 多次元シナリオ生成エンジン
 */

import type {
  FunctionResult,
  ScenarioDriver,
  Scenario,
  ScenarioImpact,
  ScenarioAnalysis,
  ScenarioRecommendation,
  EarlyWarning,
} from '../types';

export interface DriverInput {
  name: string;
  uncertainty?: 'high' | 'medium' | 'low';
  impact?: 'transformative' | 'significant' | 'moderate';
  possibleStates?: string[];
}

export interface ScenarioContext {
  timeHorizon: string;
  industry: string;
  organizationContext?: string;
  focusAreas?: string[];
}

export class ScenarioGenerationEngine {
  /**
   * Identify scenario drivers
   */
  async identifyDrivers(
    context: ScenarioContext,
    existingDrivers?: DriverInput[]
  ): Promise<FunctionResult<ScenarioDriver[]>> {
    const startTime = Date.now();

    const drivers: ScenarioDriver[] = [];

    // Start with provided drivers
    if (existingDrivers) {
      for (const input of existingDrivers) {
        drivers.push(this.buildDriver(input));
      }
    }

    // Add standard drivers if not provided
    const standardDrivers = this.getStandardDrivers(context);
    for (const std of standardDrivers) {
      if (!drivers.find((d) => d.name.toLowerCase() === std.name.toLowerCase())) {
        drivers.push(std);
      }
    }

    // Prioritize drivers
    const prioritizedDrivers = this.prioritizeDrivers(drivers);

    return {
      data: prioritizedDrivers,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: [
        'Validate drivers with subject matter experts',
        'Consider cross-driver interactions',
        'Review driver relevance annually',
      ],
    };
  }

  /**
   * Generate scenarios
   */
  async generateScenarios(
    drivers: ScenarioDriver[],
    context: ScenarioContext
  ): Promise<FunctionResult<ScenarioAnalysis>> {
    const startTime = Date.now();

    // Select key drivers (top 2-3 most impactful)
    const keyDrivers = this.selectKeyDrivers(drivers);

    // Generate scenario combinations
    const scenarios = this.generateScenarioCombinations(keyDrivers, context);

    // Assess each scenario
    const assessedScenarios = scenarios.map((s) => this.assessScenario(s, context));

    // Generate recommendations
    const recommendations = this.generateRecommendations(assessedScenarios);

    // Identify robust strategies
    const robustStrategies = this.identifyRobustStrategies(assessedScenarios);

    // Define early warnings
    const earlyWarnings = this.defineEarlyWarnings(keyDrivers, assessedScenarios);

    const analysis: ScenarioAnalysis = {
      drivers: keyDrivers,
      scenarios: assessedScenarios,
      recommendations,
      robustStrategies,
      earlyWarnings,
    };

    return {
      data: analysis,
      confidence: 0.65,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Simulate scenario impacts
   */
  async simulateImpacts(
    scenario: Scenario,
    organization: OrganizationProfile
  ): Promise<FunctionResult<DetailedImpactAnalysis>> {
    const startTime = Date.now();

    const impacts = this.calculateDetailedImpacts(scenario, organization);
    const adaptations = this.identifyRequiredAdaptations(scenario, organization);
    const opportunities = this.findOpportunities(scenario, organization);
    const vulnerabilities = this.assessVulnerabilities(scenario, organization);

    const analysis: DetailedImpactAnalysis = {
      scenario,
      impacts,
      adaptations,
      opportunities,
      vulnerabilities,
      netAssessment: this.calculateNetAssessment(impacts, opportunities, vulnerabilities),
    };

    return {
      data: analysis,
      confidence: 0.65,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Develop response strategies
   */
  async developStrategies(
    scenarios: Scenario[],
    organization: OrganizationProfile
  ): Promise<FunctionResult<StrategicResponses>> {
    const startTime = Date.now();

    const scenarioStrategies = scenarios.map((s) =>
      this.developScenarioStrategy(s, organization)
    );

    const coreStrategies = this.identifyCoreStrategies(scenarioStrategies);
    const contingencies = this.developContingencies(scenarios, scenarioStrategies);
    const optionValues = this.assessRealOptions(scenarios, coreStrategies);

    const responses: StrategicResponses = {
      scenarios: scenarioStrategies,
      coreStrategies,
      contingencies,
      optionValues,
      recommendations: this.generateStrategyRecommendations(coreStrategies, contingencies),
    };

    return {
      data: responses,
      confidence: 0.6,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Monitor scenario evolution
   */
  async monitor(
    scenarios: Scenario[],
    indicators: IndicatorData[]
  ): Promise<FunctionResult<MonitoringReport>> {
    const startTime = Date.now();

    const scenarioSignals = scenarios.map((s) =>
      this.assessScenarioSignals(s, indicators)
    );

    const leadingScenario = this.identifyLeadingScenario(scenarioSignals);
    const alerts = this.generateAlerts(scenarioSignals);
    const trendAnalysis = this.analyzeTrends(indicators);

    const report: MonitoringReport = {
      timestamp: new Date(),
      scenarios: scenarioSignals,
      leadingScenario,
      alerts,
      trendAnalysis,
      recommendations: this.generateMonitoringRecommendations(alerts, leadingScenario),
    };

    return {
      data: report,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  private buildDriver(input: DriverInput): ScenarioDriver {
    return {
      name: input.name,
      uncertainty: input.uncertainty || 'medium',
      impact: input.impact || 'significant',
      possibleStates: input.possibleStates || this.generateDefaultStates(input.name),
    };
  }

  private generateDefaultStates(driverName: string): string[] {
    const lowerName = driverName.toLowerCase();

    if (lowerName.includes('technology')) {
      return ['Rapid advancement', 'Moderate progress', 'Stagnation'];
    }
    if (lowerName.includes('economy') || lowerName.includes('economic')) {
      return ['Strong growth', 'Moderate growth', 'Recession'];
    }
    if (lowerName.includes('regulation')) {
      return ['Strict regulation', 'Moderate regulation', 'Deregulation'];
    }
    if (lowerName.includes('competition')) {
      return ['Intensified competition', 'Stable competition', 'Consolidation'];
    }

    return ['High', 'Medium', 'Low'];
  }

  private getStandardDrivers(context: ScenarioContext): ScenarioDriver[] {
    const drivers: ScenarioDriver[] = [
      {
        name: 'Technology Disruption',
        uncertainty: 'high',
        impact: 'transformative',
        possibleStates: ['Rapid disruption', 'Gradual change', 'Status quo'],
      },
      {
        name: 'Economic Conditions',
        uncertainty: 'high',
        impact: 'significant',
        possibleStates: ['Growth', 'Stability', 'Downturn'],
      },
      {
        name: 'Regulatory Environment',
        uncertainty: 'medium',
        impact: 'significant',
        possibleStates: ['Favorable', 'Neutral', 'Restrictive'],
      },
      {
        name: 'Competitive Landscape',
        uncertainty: 'medium',
        impact: 'significant',
        possibleStates: ['New entrants', 'Stable', 'Consolidation'],
      },
    ];

    // Add industry-specific drivers
    if (context.industry) {
      drivers.push(
        ...this.getIndustryDrivers(context.industry)
      );
    }

    return drivers;
  }

  private getIndustryDrivers(industry: string): ScenarioDriver[] {
    const industryDrivers: Record<string, ScenarioDriver[]> = {
      technology: [
        {
          name: 'AI Advancement',
          uncertainty: 'high',
          impact: 'transformative',
          possibleStates: ['Breakthrough', 'Steady progress', 'Winter'],
        },
      ],
      finance: [
        {
          name: 'Interest Rates',
          uncertainty: 'high',
          impact: 'significant',
          possibleStates: ['Rising', 'Stable', 'Falling'],
        },
      ],
      healthcare: [
        {
          name: 'Healthcare Policy',
          uncertainty: 'high',
          impact: 'transformative',
          possibleStates: ['Universal coverage', 'Mixed system', 'Market-driven'],
        },
      ],
    };

    return industryDrivers[industry.toLowerCase()] || [];
  }

  private prioritizeDrivers(drivers: ScenarioDriver[]): ScenarioDriver[] {
    const impactScore: Record<string, number> = {
      transformative: 3,
      significant: 2,
      moderate: 1,
    };

    const uncertaintyScore: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...drivers].sort((a, b) => {
      const scoreA = impactScore[a.impact] * uncertaintyScore[a.uncertainty];
      const scoreB = impactScore[b.impact] * uncertaintyScore[b.uncertainty];
      return scoreB - scoreA;
    });
  }

  private selectKeyDrivers(drivers: ScenarioDriver[]): ScenarioDriver[] {
    // Select top 2-3 drivers with high uncertainty and impact
    return drivers
      .filter((d) => d.uncertainty !== 'low' && d.impact !== 'moderate')
      .slice(0, 3);
  }

  private generateScenarioCombinations(
    drivers: ScenarioDriver[],
    context: ScenarioContext
  ): Scenario[] {
    const scenarios: Scenario[] = [];

    if (drivers.length === 0) {
      return scenarios;
    }

    if (drivers.length === 1) {
      // Simple scenarios for single driver
      for (const state of drivers[0].possibleStates) {
        scenarios.push(this.createScenario(
          { [drivers[0].name]: state },
          context,
          scenarios.length
        ));
      }
    } else if (drivers.length === 2) {
      // 2x2 matrix
      const d1States = this.getExtremeStates(drivers[0]);
      const d2States = this.getExtremeStates(drivers[1]);

      for (const s1 of d1States) {
        for (const s2 of d2States) {
          scenarios.push(this.createScenario(
            { [drivers[0].name]: s1, [drivers[1].name]: s2 },
            context,
            scenarios.length
          ));
        }
      }
    } else {
      // For 3+ drivers, create archetypal scenarios
      scenarios.push(
        this.createArchetypeScenario('Optimistic', drivers, context),
        this.createArchetypeScenario('Pessimistic', drivers, context),
        this.createArchetypeScenario('Disruptive', drivers, context),
        this.createArchetypeScenario('Baseline', drivers, context)
      );
    }

    return scenarios;
  }

  private getExtremeStates(driver: ScenarioDriver): string[] {
    const states = driver.possibleStates;
    if (states.length <= 2) return states;
    return [states[0], states[states.length - 1]];
  }

  private createScenario(
    driverStates: Record<string, string>,
    context: ScenarioContext,
    index: number
  ): Scenario {
    const name = this.generateScenarioName(driverStates);
    const description = this.generateScenarioDescription(driverStates, context);

    return {
      id: `scenario-${index + 1}`,
      name,
      description,
      drivers: driverStates,
      probability: 0.25, // Default equal probability
      impact: this.estimateImpact(driverStates),
      timeline: context.timeHorizon,
    };
  }

  private createArchetypeScenario(
    archetype: string,
    drivers: ScenarioDriver[],
    context: ScenarioContext
  ): Scenario {
    const driverStates: Record<string, string> = {};

    for (const driver of drivers) {
      const states = driver.possibleStates;
      switch (archetype) {
        case 'Optimistic':
          driverStates[driver.name] = states[0]; // First state typically positive
          break;
        case 'Pessimistic':
          driverStates[driver.name] = states[states.length - 1]; // Last typically negative
          break;
        case 'Disruptive':
          driverStates[driver.name] = driver.uncertainty === 'high' ? states[0] : states[1];
          break;
        default: // Baseline
          driverStates[driver.name] = states[Math.floor(states.length / 2)];
      }
    }

    return {
      id: `scenario-${archetype.toLowerCase()}`,
      name: `${archetype} Scenario`,
      description: this.generateScenarioDescription(driverStates, context),
      drivers: driverStates,
      probability: archetype === 'Baseline' ? 0.4 : 0.2,
      impact: this.estimateImpact(driverStates),
      timeline: context.timeHorizon,
    };
  }

  private generateScenarioName(driverStates: Record<string, string>): string {
    const values = Object.values(driverStates);
    if (values.length === 1) return values[0];
    return `${values[0]} + ${values[1]}`;
  }

  private generateScenarioDescription(
    driverStates: Record<string, string>,
    context: ScenarioContext
  ): string {
    const conditions = Object.entries(driverStates)
      .map(([driver, state]) => `${driver}: ${state}`)
      .join('; ');

    return `In this scenario for ${context.industry || 'the organization'} over ${context.timeHorizon}, we see: ${conditions}. This creates a fundamentally different operating environment.`;
  }

  private estimateImpact(driverStates: Record<string, string>): ScenarioImpact {
    // Simplified impact estimation based on driver states
    let revenue = 0;
    let market = 0;
    let operations = 0;
    const reputation = 0;

    for (const state of Object.values(driverStates)) {
      const lowerState = state.toLowerCase();

      if (lowerState.includes('growth') || lowerState.includes('favorable') ||
          lowerState.includes('rapid') || lowerState.includes('strong')) {
        revenue += 0.2;
        market += 0.2;
      } else if (lowerState.includes('downturn') || lowerState.includes('restrictive') ||
                 lowerState.includes('recession') || lowerState.includes('stagnation')) {
        revenue -= 0.2;
        operations -= 0.1;
      }

      if (lowerState.includes('disruption') || lowerState.includes('breakthrough')) {
        market += 0.3;
        operations -= 0.1;
      }
    }

    const overall = (revenue + market + operations + reputation) / 4;

    return {
      revenue: Math.max(-1, Math.min(1, revenue)),
      market: Math.max(-1, Math.min(1, market)),
      operations: Math.max(-1, Math.min(1, operations)),
      reputation: Math.max(-1, Math.min(1, reputation)),
      overall: Math.max(-1, Math.min(1, overall)),
    };
  }

  private assessScenario(scenario: Scenario, _context: ScenarioContext): Scenario {
    // Adjust probability based on current signals (simplified)
    const adjustedProbability = Math.max(0.1, Math.min(0.5, scenario.probability));

    return {
      ...scenario,
      probability: adjustedProbability,
    };
  }

  private generateRecommendations(scenarios: Scenario[]): ScenarioRecommendation[] {
    return scenarios.map((s) => ({
      scenario: s.name,
      actions: this.suggestActionsForScenario(s),
      priority: s.impact.overall > 0 ? 'long-term' : 'immediate',
      contingencies: this.suggestContingencies(s),
    }));
  }

  private suggestActionsForScenario(scenario: Scenario): string[] {
    const actions: string[] = [];

    if (scenario.impact.revenue > 0) {
      actions.push('Position for growth opportunities');
      actions.push('Invest in capacity expansion');
    } else if (scenario.impact.revenue < 0) {
      actions.push('Build resilience and flexibility');
      actions.push('Diversify revenue streams');
    }

    if (scenario.impact.market > 0.2) {
      actions.push('Accelerate innovation initiatives');
    }

    if (scenario.impact.operations < -0.1) {
      actions.push('Enhance operational efficiency');
    }

    return actions;
  }

  private suggestContingencies(scenario: Scenario): string[] {
    const contingencies: string[] = [];

    if (scenario.impact.overall < 0) {
      contingencies.push('Develop cost reduction playbook');
      contingencies.push('Identify non-core assets for divestiture');
    }

    if (scenario.impact.market !== 0) {
      contingencies.push('Prepare market repositioning options');
    }

    return contingencies;
  }

  private identifyRobustStrategies(scenarios: Scenario[]): string[] {
    // Strategies that work across multiple scenarios
    const strategies: string[] = [];

    // Check if most scenarios benefit from certain actions
    const positiveScenarios = scenarios.filter((s) => s.impact.overall > 0);
    const negativeScenarios = scenarios.filter((s) => s.impact.overall < 0);

    if (positiveScenarios.length > 0 && negativeScenarios.length > 0) {
      strategies.push('Build organizational agility to pivot quickly');
    }

    strategies.push('Invest in capabilities that are valuable across scenarios');
    strategies.push('Maintain strategic options without premature commitment');
    strategies.push('Develop scenario monitoring and response protocols');

    return strategies;
  }

  private defineEarlyWarnings(
    drivers: ScenarioDriver[],
    scenarios: Scenario[]
  ): EarlyWarning[] {
    const warnings: EarlyWarning[] = [];

    for (const driver of drivers) {
      const relatedScenarios = scenarios.filter((s) =>
        Object.keys(s.drivers).includes(driver.name)
      );

      warnings.push({
        indicator: `${driver.name} trend indicator`,
        threshold: driver.possibleStates[0],
        relatedScenarios: relatedScenarios.map((s) => s.name),
        responseAction: `Review and activate ${driver.name}-related contingencies`,
      });
    }

    return warnings;
  }

  private calculateDetailedImpacts(
    scenario: Scenario,
    organization: OrganizationProfile
  ): DetailedImpacts {
    const baseImpact = scenario.impact;

    return {
      financial: {
        revenue: this.adjustForOrganization(baseImpact.revenue, organization),
        cost: baseImpact.operations * -1, // Operations impact affects costs
        margin: baseImpact.revenue + baseImpact.operations,
      },
      operational: {
        efficiency: baseImpact.operations,
        capacity: baseImpact.market * 0.5,
        quality: baseImpact.operations * 0.3,
      },
      strategic: {
        marketPosition: baseImpact.market,
        competitiveAdvantage: baseImpact.overall,
        innovation: baseImpact.market * 0.7,
      },
      organizational: {
        talent: baseImpact.reputation * 0.5,
        culture: baseImpact.operations * 0.3,
        capabilities: baseImpact.overall * 0.5,
      },
    };
  }

  private adjustForOrganization(impact: number, organization: OrganizationProfile): number {
    // Adjust based on organization resilience
    const resilienceFactor = organization.resilience || 0.5;
    return impact * (impact > 0 ? 1 + resilienceFactor * 0.2 : 1 - resilienceFactor * 0.2);
  }

  private identifyRequiredAdaptations(
    scenario: Scenario,
    _organization: OrganizationProfile
  ): Adaptation[] {
    const adaptations: Adaptation[] = [];

    if (scenario.impact.market > 0.2) {
      adaptations.push({
        area: 'Strategy',
        change: 'Accelerate market expansion',
        urgency: 'high',
        investment: 'significant',
      });
    }

    if (scenario.impact.operations < -0.1) {
      adaptations.push({
        area: 'Operations',
        change: 'Implement efficiency improvements',
        urgency: 'medium',
        investment: 'moderate',
      });
    }

    if (Math.abs(scenario.impact.overall) > 0.3) {
      adaptations.push({
        area: 'Organization',
        change: 'Build adaptive capabilities',
        urgency: 'medium',
        investment: 'moderate',
      });
    }

    return adaptations;
  }

  private findOpportunities(
    scenario: Scenario,
    _organization: OrganizationProfile
  ): ScenarioOpportunity[] {
    const opportunities: ScenarioOpportunity[] = [];

    if (scenario.impact.market > 0) {
      opportunities.push({
        opportunity: 'Market expansion',
        potential: scenario.impact.market,
        timing: 'early',
        requirements: ['Investment capacity', 'Market intelligence'],
      });
    }

    if (scenario.impact.overall !== 0) {
      opportunities.push({
        opportunity: 'Competitive repositioning',
        potential: Math.abs(scenario.impact.overall) * 0.5,
        timing: 'opportunistic',
        requirements: ['Strategic flexibility', 'Market insight'],
      });
    }

    return opportunities;
  }

  private assessVulnerabilities(
    scenario: Scenario,
    _organization: OrganizationProfile
  ): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];

    if (scenario.impact.revenue < 0) {
      vulnerabilities.push({
        area: 'Financial',
        exposure: Math.abs(scenario.impact.revenue),
        mitigation: 'Diversify revenue streams',
      });
    }

    if (scenario.impact.operations < 0) {
      vulnerabilities.push({
        area: 'Operational',
        exposure: Math.abs(scenario.impact.operations),
        mitigation: 'Build operational resilience',
      });
    }

    return vulnerabilities;
  }

  private calculateNetAssessment(
    impacts: DetailedImpacts,
    opportunities: ScenarioOpportunity[],
    vulnerabilities: Vulnerability[]
  ): NetAssessment {
    const opportunityValue = opportunities.reduce((acc, o) => acc + o.potential, 0);
    const vulnerabilityRisk = vulnerabilities.reduce((acc, v) => acc + v.exposure, 0);

    const netPosition = impacts.strategic.competitiveAdvantage + opportunityValue - vulnerabilityRisk;

    return {
      netPosition,
      opportunityValue,
      vulnerabilityRisk,
      recommendation: netPosition > 0
        ? 'Position aggressively to capture opportunity'
        : 'Focus on risk mitigation and resilience',
    };
  }

  private developScenarioStrategy(
    scenario: Scenario,
    _organization: OrganizationProfile
  ): ScenarioStrategy {
    return {
      scenario: scenario.name,
      primaryStrategy: this.determineStrategy(scenario),
      keyActions: this.suggestActionsForScenario(scenario),
      resourceRequirements: this.estimateResources(scenario),
      timeline: scenario.timeline,
    };
  }

  private determineStrategy(scenario: Scenario): string {
    if (scenario.impact.overall > 0.3) {
      return 'Aggressive growth';
    } else if (scenario.impact.overall < -0.3) {
      return 'Defensive positioning';
    } else if (scenario.impact.market > 0.2) {
      return 'Market opportunity capture';
    }
    return 'Balanced adaptation';
  }

  private estimateResources(scenario: Scenario): ResourceEstimate[] {
    const resources: ResourceEstimate[] = [];

    if (scenario.impact.overall > 0) {
      resources.push({
        type: 'Investment',
        amount: 'High',
        purpose: 'Growth initiatives',
      });
    }

    resources.push({
      type: 'Talent',
      amount: Math.abs(scenario.impact.overall) > 0.3 ? 'High' : 'Medium',
      purpose: 'Capability building',
    });

    return resources;
  }

  private identifyCoreStrategies(scenarioStrategies: ScenarioStrategy[]): CoreStrategy[] {
    // Find strategies that appear across multiple scenarios
    const actionCounts = new Map<string, number>();

    for (const ss of scenarioStrategies) {
      for (const action of ss.keyActions) {
        actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
      }
    }

    const coreStrategies: CoreStrategy[] = [];

    for (const [action, count] of actionCounts) {
      if (count >= scenarioStrategies.length / 2) {
        coreStrategies.push({
          strategy: action,
          applicability: count / scenarioStrategies.length,
          priority: count === scenarioStrategies.length ? 'critical' : 'high',
        });
      }
    }

    return coreStrategies;
  }

  private developContingencies(
    scenarios: Scenario[],
    _strategies: ScenarioStrategy[]
  ): Contingency[] {
    return scenarios.map((s) => ({
      trigger: `${s.name} scenario materializes`,
      response: s.impact.overall > 0
        ? 'Accelerate growth investments'
        : 'Activate defensive measures',
      resources: s.impact.overall > 0 ? 'Additional budget' : 'Cost reduction',
      timeline: 'Within 3 months of trigger',
    }));
  }

  private assessRealOptions(
    scenarios: Scenario[],
    _strategies: CoreStrategy[]
  ): RealOption[] {
    return [
      {
        option: 'Flexibility to scale up/down',
        value: Math.max(...scenarios.map((s) => Math.abs(s.impact.overall))) * 100,
        preservationCost: 'Moderate ongoing investment',
        exerciseCondition: 'Scenario clarity emerges',
      },
      {
        option: 'Market entry timing flexibility',
        value: Math.max(...scenarios.map((s) => s.impact.market)) * 80,
        preservationCost: 'Market intelligence investment',
        exerciseCondition: 'Market opportunity confirmed',
      },
    ];
  }

  private generateStrategyRecommendations(
    coreStrategies: CoreStrategy[],
    contingencies: Contingency[]
  ): string[] {
    const recommendations: string[] = [];

    if (coreStrategies.length > 0) {
      recommendations.push(`Implement ${coreStrategies.length} core strategies immediately`);
    }

    if (contingencies.length > 0) {
      recommendations.push(`Prepare ${contingencies.length} contingency plans`);
    }

    recommendations.push('Maintain strategic flexibility through real options');
    recommendations.push('Regular scenario monitoring and strategy adjustment');

    return recommendations;
  }

  private assessScenarioSignals(
    scenario: Scenario,
    indicators: IndicatorData[]
  ): ScenarioSignal {
    let signalStrength = 0;
    const matchingIndicators: string[] = [];

    for (const indicator of indicators) {
      const driverMatch = Object.keys(scenario.drivers).some((d) =>
        indicator.name.toLowerCase().includes(d.toLowerCase())
      );

      if (driverMatch) {
        signalStrength += indicator.trend === 'increasing' ? 0.2 : -0.1;
        matchingIndicators.push(indicator.name);
      }
    }

    return {
      scenario: scenario.name,
      probability: Math.max(0.1, Math.min(0.9, scenario.probability + signalStrength)),
      signals: matchingIndicators,
      trend: signalStrength > 0 ? 'strengthening' : signalStrength < 0 ? 'weakening' : 'stable',
    };
  }

  private identifyLeadingScenario(signals: ScenarioSignal[]): string {
    const sorted = [...signals].sort((a, b) => b.probability - a.probability);
    return sorted[0]?.scenario || 'Baseline';
  }

  private generateAlerts(signals: ScenarioSignal[]): Alert[] {
    const alerts: Alert[] = [];

    for (const signal of signals) {
      if (signal.probability > 0.6 && signal.trend === 'strengthening') {
        alerts.push({
          level: 'warning',
          message: `${signal.scenario} probability increasing`,
          action: 'Review contingency plans',
        });
      }
    }

    return alerts;
  }

  private analyzeTrends(indicators: IndicatorData[]): TrendAnalysis[] {
    return indicators.map((i) => ({
      indicator: i.name,
      currentValue: i.value,
      trend: i.trend,
      implication: this.interpretTrend(i),
    }));
  }

  private interpretTrend(indicator: IndicatorData): string {
    if (indicator.trend === 'increasing') {
      return `${indicator.name} is rising, watch for acceleration`;
    } else if (indicator.trend === 'decreasing') {
      return `${indicator.name} is declining, monitor for stabilization`;
    }
    return `${indicator.name} is stable`;
  }

  private generateMonitoringRecommendations(
    alerts: Alert[],
    leadingScenario: string
  ): string[] {
    const recommendations: string[] = [];

    if (alerts.length > 0) {
      recommendations.push(`Address ${alerts.length} active alerts`);
    }

    recommendations.push(`Focus preparation on ${leadingScenario} scenario`);
    recommendations.push('Continue monitoring all scenario indicators');

    return recommendations;
  }
}

// Additional types for this engine
interface OrganizationProfile {
  name: string;
  industry: string;
  size: 'small' | 'medium' | 'large';
  resilience?: number;
}

interface DetailedImpactAnalysis {
  scenario: Scenario;
  impacts: DetailedImpacts;
  adaptations: Adaptation[];
  opportunities: ScenarioOpportunity[];
  vulnerabilities: Vulnerability[];
  netAssessment: NetAssessment;
}

interface DetailedImpacts {
  financial: {
    revenue: number;
    cost: number;
    margin: number;
  };
  operational: {
    efficiency: number;
    capacity: number;
    quality: number;
  };
  strategic: {
    marketPosition: number;
    competitiveAdvantage: number;
    innovation: number;
  };
  organizational: {
    talent: number;
    culture: number;
    capabilities: number;
  };
}

interface Adaptation {
  area: string;
  change: string;
  urgency: 'high' | 'medium' | 'low';
  investment: string;
}

interface ScenarioOpportunity {
  opportunity: string;
  potential: number;
  timing: string;
  requirements: string[];
}

interface Vulnerability {
  area: string;
  exposure: number;
  mitigation: string;
}

interface NetAssessment {
  netPosition: number;
  opportunityValue: number;
  vulnerabilityRisk: number;
  recommendation: string;
}

interface StrategicResponses {
  scenarios: ScenarioStrategy[];
  coreStrategies: CoreStrategy[];
  contingencies: Contingency[];
  optionValues: RealOption[];
  recommendations: string[];
}

interface ScenarioStrategy {
  scenario: string;
  primaryStrategy: string;
  keyActions: string[];
  resourceRequirements: ResourceEstimate[];
  timeline: string;
}

interface ResourceEstimate {
  type: string;
  amount: string;
  purpose: string;
}

interface CoreStrategy {
  strategy: string;
  applicability: number;
  priority: 'critical' | 'high' | 'medium';
}

interface Contingency {
  trigger: string;
  response: string;
  resources: string;
  timeline: string;
}

interface RealOption {
  option: string;
  value: number;
  preservationCost: string;
  exerciseCondition: string;
}

interface IndicatorData {
  name: string;
  value: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface MonitoringReport {
  timestamp: Date;
  scenarios: ScenarioSignal[];
  leadingScenario: string;
  alerts: Alert[];
  trendAnalysis: TrendAnalysis[];
  recommendations: string[];
}

interface ScenarioSignal {
  scenario: string;
  probability: number;
  signals: string[];
  trend: 'strengthening' | 'stable' | 'weakening';
}

interface Alert {
  level: 'critical' | 'warning' | 'info';
  message: string;
  action: string;
}

interface TrendAnalysis {
  indicator: string;
  currentValue: number;
  trend: string;
  implication: string;
}

export const scenarioGenerationEngine = new ScenarioGenerationEngine();
