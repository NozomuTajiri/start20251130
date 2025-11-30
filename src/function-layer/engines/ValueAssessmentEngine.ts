/**
 * Value Assessment Engine
 * 4.10 多次元価値評価エンジン
 */

import type {
  FunctionResult,
  ValueDimension,
  ValueMetric,
  ValueAssessment,
  DimensionScore,
  ValueInsight,
} from '../types';

export interface ValueInput {
  dimensions?: DimensionInput[];
  context?: ValueContext;
}

export interface DimensionInput {
  name: string;
  category: ValueDimension['category'];
  weight?: number;
  metrics?: MetricInput[];
}

export interface MetricInput {
  name: string;
  current: number;
  target?: number;
  unit?: string;
  benchmark?: number;
  trend?: number[];
}

export interface ValueContext {
  industry: string;
  organizationSize: 'small' | 'medium' | 'large';
  stakeholderPriorities?: string[];
  timeframe?: string;
}

export class ValueAssessmentEngine {
  private standardDimensions: StandardDimension[] = [
    {
      name: 'Financial Value',
      category: 'financial',
      defaultWeight: 0.25,
      standardMetrics: ['Revenue Growth', 'Profit Margin', 'ROI', 'Cash Flow'],
    },
    {
      name: 'Customer Value',
      category: 'customer',
      defaultWeight: 0.2,
      standardMetrics: ['Customer Satisfaction', 'NPS', 'Customer Retention', 'Market Share'],
    },
    {
      name: 'Operational Value',
      category: 'operational',
      defaultWeight: 0.15,
      standardMetrics: ['Efficiency', 'Quality', 'Cycle Time', 'Capacity Utilization'],
    },
    {
      name: 'Employee Value',
      category: 'employee',
      defaultWeight: 0.15,
      standardMetrics: ['Engagement', 'Retention', 'Productivity', 'Development'],
    },
    {
      name: 'Social Value',
      category: 'social',
      defaultWeight: 0.125,
      standardMetrics: ['Community Impact', 'Diversity', 'Ethics Compliance'],
    },
    {
      name: 'Environmental Value',
      category: 'environmental',
      defaultWeight: 0.125,
      standardMetrics: ['Carbon Footprint', 'Resource Efficiency', 'Waste Reduction'],
    },
  ];

  /**
   * Assess multi-dimensional value
   */
  async assess(input: ValueInput): Promise<FunctionResult<ValueAssessment>> {
    const startTime = Date.now();

    const dimensions = this.buildDimensions(input.dimensions, input.context);
    const overallScore = this.calculateOverallScore(dimensions);
    const dimensionScores = this.calculateDimensionScores(dimensions);
    const insights = this.generateInsights(dimensions, dimensionScores);

    const assessment: ValueAssessment = {
      dimensions,
      overallScore,
      dimensionScores,
      insights,
      recommendations: this.generateRecommendations(dimensionScores, insights),
    };

    return {
      data: assessment,
      confidence: this.calculateConfidence(dimensions),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Calculate value index
   */
  async calculateIndex(
    dimensions: ValueDimension[],
    weightingScheme?: WeightingScheme
  ): Promise<FunctionResult<ValueIndex>> {
    const startTime = Date.now();

    const weights = this.applyWeightingScheme(dimensions, weightingScheme);
    const normalizedScores = this.normalizeScores(dimensions);
    const indexValue = this.computeIndex(normalizedScores, weights);
    const components = this.decomposeIndex(dimensions, weights, indexValue);

    const index: ValueIndex = {
      value: indexValue,
      components,
      trend: this.calculateTrend(dimensions),
      benchmark: this.getBenchmark(weightingScheme),
      interpretation: this.interpretIndex(indexValue),
    };

    return {
      data: index,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Benchmark against standards
   */
  async benchmark(
    assessment: ValueAssessment,
    benchmarkType: 'industry' | 'best-in-class' | 'historical'
  ): Promise<FunctionResult<BenchmarkAnalysis>> {
    const startTime = Date.now();

    const benchmarks = this.getBenchmarks(assessment.dimensions, benchmarkType);
    const comparisons = this.compareToBenchmarks(assessment, benchmarks);
    const gaps = this.identifyGaps(comparisons);
    const opportunities = this.identifyOpportunities(comparisons);

    const analysis: BenchmarkAnalysis = {
      benchmarkType,
      comparisons,
      gaps,
      opportunities,
      overallPosition: this.calculateOverallPosition(comparisons),
      recommendations: this.generateBenchmarkRecommendations(gaps, opportunities),
    };

    return {
      data: analysis,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Forecast value creation
   */
  async forecast(
    assessment: ValueAssessment,
    horizon: string,
    assumptions?: ForecastAssumptions
  ): Promise<FunctionResult<ValueForecast>> {
    const startTime = Date.now();

    const horizonMonths = this.parseHorizon(horizon);
    const projections = this.projectDimensions(assessment.dimensions, horizonMonths, assumptions);
    const scenarios = this.generateScenarios(assessment, horizonMonths, assumptions);
    const risks = this.assessForecastRisks(projections, assumptions);

    const forecast: ValueForecast = {
      horizon,
      baseline: assessment.overallScore,
      projections,
      scenarios,
      risks,
      confidence: this.calculateForecastConfidence(horizonMonths),
      recommendations: this.generateForecastRecommendations(projections, scenarios),
    };

    return {
      data: forecast,
      confidence: forecast.confidence,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Track value over time
   */
  async track(
    historicalAssessments: ValueAssessment[]
  ): Promise<FunctionResult<ValueTrackingReport>> {
    const startTime = Date.now();

    const timeSeries = this.buildTimeSeries(historicalAssessments);
    const trends = this.analyzeTrends(timeSeries);
    const volatility = this.calculateVolatility(timeSeries);
    const anomalies = this.detectAnomalies(timeSeries);

    const report: ValueTrackingReport = {
      timeSeries,
      trends,
      volatility,
      anomalies,
      insights: this.generateTrackingInsights(trends, anomalies),
      recommendations: this.generateTrackingRecommendations(trends),
    };

    return {
      data: report,
      confidence: 0.8,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  private buildDimensions(inputs?: DimensionInput[], context?: ValueContext): ValueDimension[] {
    if (inputs && inputs.length > 0) {
      return inputs.map((input, index) => this.buildDimension(input, index, context));
    }

    // Use standard dimensions
    return this.standardDimensions.map((std, index) => ({
      id: `dim-${index + 1}`,
      name: std.name,
      category: std.category,
      weight: this.adjustWeight(std.defaultWeight, std.category, context),
      metrics: std.standardMetrics.map((m, i) => this.createDefaultMetric(m, i, std.category)),
    }));
  }

  private buildDimension(input: DimensionInput, index: number, context?: ValueContext): ValueDimension {
    const metrics: ValueMetric[] = (input.metrics || []).map((m, i) => ({
      id: `metric-${index}-${i}`,
      name: m.name,
      unit: m.unit || 'index',
      current: m.current,
      target: m.target ?? m.current * 1.1,
      trend: m.trend || [],
      benchmark: m.benchmark,
    }));

    return {
      id: `dim-${index + 1}`,
      name: input.name,
      category: input.category,
      weight: input.weight ?? this.getDefaultWeight(input.category, context),
      metrics,
    };
  }

  private createDefaultMetric(name: string, index: number, category: string): ValueMetric {
    const defaultValues: Record<string, number> = {
      financial: 0.5,
      customer: 0.6,
      operational: 0.55,
      employee: 0.6,
      social: 0.5,
      environmental: 0.4,
    };

    return {
      id: `metric-${category}-${index}`,
      name,
      unit: 'index (0-1)',
      current: defaultValues[category] || 0.5,
      target: (defaultValues[category] || 0.5) + 0.1,
      trend: [],
    };
  }

  private getDefaultWeight(category: ValueDimension['category'], _context?: ValueContext): number {
    const std = this.standardDimensions.find((d) => d.category === category);
    return std?.defaultWeight || 0.15;
  }

  private adjustWeight(
    defaultWeight: number,
    category: ValueDimension['category'],
    context?: ValueContext
  ): number {
    if (!context?.stakeholderPriorities) return defaultWeight;

    const priorityBoost = context.stakeholderPriorities.some((p) =>
      p.toLowerCase().includes(category)
    ) ? 0.05 : 0;

    return Math.min(0.4, defaultWeight + priorityBoost);
  }

  private calculateOverallScore(dimensions: ValueDimension[]): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const dim of dimensions) {
      const dimScore = this.calculateDimensionScore(dim);
      weightedSum += dimScore * dim.weight;
      totalWeight += dim.weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private calculateDimensionScore(dimension: ValueDimension): number {
    if (dimension.metrics.length === 0) return 0;

    const metricScores = dimension.metrics.map((m) => {
      const target = m.target || m.current * 1.1;
      return target > 0 ? Math.min(1, m.current / target) : 0;
    });

    return metricScores.reduce((a, b) => a + b, 0) / metricScores.length;
  }

  private calculateDimensionScores(dimensions: ValueDimension[]): DimensionScore[] {
    return dimensions.map((dim) => {
      const score = this.calculateDimensionScore(dim);
      const trend = this.determineTrend(dim);
      const drivers = this.identifyDrivers(dim);

      return {
        dimensionId: dim.id,
        score,
        trend,
        drivers,
      };
    });
  }

  private determineTrend(dimension: ValueDimension): 'improving' | 'stable' | 'declining' {
    const trendsWithData = dimension.metrics.filter((m) => m.trend.length >= 3);

    if (trendsWithData.length === 0) return 'stable';

    const avgTrend = trendsWithData.reduce((acc, m) => {
      const recent = m.trend.slice(-3);
      const trendDirection = recent[recent.length - 1] - recent[0];
      return acc + trendDirection;
    }, 0) / trendsWithData.length;

    if (avgTrend > 0.05) return 'improving';
    if (avgTrend < -0.05) return 'declining';
    return 'stable';
  }

  private identifyDrivers(dimension: ValueDimension): string[] {
    const drivers: string[] = [];

    for (const metric of dimension.metrics) {
      const target = metric.target || metric.current * 1.1;
      const achievement = target > 0 ? metric.current / target : 0;

      if (achievement >= 0.9) {
        drivers.push(`Strong ${metric.name}`);
      } else if (achievement < 0.7) {
        drivers.push(`${metric.name} needs improvement`);
      }
    }

    return drivers;
  }

  private generateInsights(
    dimensions: ValueDimension[],
    scores: DimensionScore[]
  ): ValueInsight[] {
    const insights: ValueInsight[] = [];

    // Identify strengths
    const highScores = scores.filter((s) => s.score > 0.8);
    for (const score of highScores) {
      const dim = dimensions.find((d) => d.id === score.dimensionId);
      if (dim) {
        insights.push({
          type: 'strength',
          description: `${dim.name} is performing well above target`,
          dimension: dim.name,
          actionable: false,
        });
      }
    }

    // Identify weaknesses
    const lowScores = scores.filter((s) => s.score < 0.6);
    for (const score of lowScores) {
      const dim = dimensions.find((d) => d.id === score.dimensionId);
      if (dim) {
        insights.push({
          type: 'weakness',
          description: `${dim.name} is underperforming and requires attention`,
          dimension: dim.name,
          actionable: true,
          suggestedAction: `Develop improvement plan for ${dim.name}`,
        });
      }
    }

    // Identify opportunities
    const improvingLow = scores.filter((s) => s.score < 0.7 && s.trend === 'improving');
    for (const score of improvingLow) {
      const dim = dimensions.find((d) => d.id === score.dimensionId);
      if (dim) {
        insights.push({
          type: 'opportunity',
          description: `${dim.name} is improving - potential to accelerate`,
          dimension: dim.name,
          actionable: true,
          suggestedAction: `Invest in ${dim.name} to maintain momentum`,
        });
      }
    }

    // Identify threats
    const decliningHigh = scores.filter((s) => s.score > 0.6 && s.trend === 'declining');
    for (const score of decliningHigh) {
      const dim = dimensions.find((d) => d.id === score.dimensionId);
      if (dim) {
        insights.push({
          type: 'threat',
          description: `${dim.name} is declining - risk of value erosion`,
          dimension: dim.name,
          actionable: true,
          suggestedAction: `Investigate and address ${dim.name} decline`,
        });
      }
    }

    return insights;
  }

  private generateRecommendations(scores: DimensionScore[], insights: ValueInsight[]): string[] {
    const recommendations: string[] = [];

    const actionableInsights = insights.filter((i) => i.actionable);
    if (actionableInsights.length > 0) {
      recommendations.push(`Address ${actionableInsights.length} actionable insights`);
    }

    const declining = scores.filter((s) => s.trend === 'declining');
    if (declining.length > 0) {
      recommendations.push(`Investigate declining trends in ${declining.length} dimension(s)`);
    }

    const lowScores = scores.filter((s) => s.score < 0.6);
    if (lowScores.length > 0) {
      recommendations.push(`Prioritize improvement in underperforming dimensions`);
    }

    recommendations.push('Regular monitoring of all value dimensions');
    recommendations.push('Align initiatives with value creation priorities');

    return recommendations;
  }

  private applyWeightingScheme(
    dimensions: ValueDimension[],
    scheme?: WeightingScheme
  ): number[] {
    if (!scheme) {
      return dimensions.map((d) => d.weight);
    }

    switch (scheme.type) {
      case 'equal':
        return dimensions.map(() => 1 / dimensions.length);
      case 'stakeholder':
        return this.calculateStakeholderWeights(dimensions, scheme.priorities || []);
      case 'risk-adjusted':
        return this.calculateRiskAdjustedWeights(dimensions);
      default:
        return dimensions.map((d) => d.weight);
    }
  }

  private calculateStakeholderWeights(
    dimensions: ValueDimension[],
    priorities: string[]
  ): number[] {
    const weights = dimensions.map((d) => {
      const isPriority = priorities.some((p) =>
        d.name.toLowerCase().includes(p.toLowerCase()) ||
        d.category.includes(p.toLowerCase())
      );
      return isPriority ? d.weight * 1.5 : d.weight;
    });

    const total = weights.reduce((a, b) => a + b, 0);
    return weights.map((w) => w / total);
  }

  private calculateRiskAdjustedWeights(dimensions: ValueDimension[]): number[] {
    // Higher weights for dimensions with more volatility
    const weights = dimensions.map((d) => {
      const volatility = this.calculateDimensionVolatility(d);
      return d.weight * (1 + volatility);
    });

    const total = weights.reduce((a, b) => a + b, 0);
    return weights.map((w) => w / total);
  }

  private calculateDimensionVolatility(dimension: ValueDimension): number {
    const trendsWithData = dimension.metrics.filter((m) => m.trend.length >= 3);
    if (trendsWithData.length === 0) return 0;

    const volatilities = trendsWithData.map((m) => {
      const mean = m.trend.reduce((a, b) => a + b, 0) / m.trend.length;
      const variance = m.trend.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / m.trend.length;
      return Math.sqrt(variance);
    });

    return volatilities.reduce((a, b) => a + b, 0) / volatilities.length;
  }

  private normalizeScores(dimensions: ValueDimension[]): number[] {
    return dimensions.map((d) => this.calculateDimensionScore(d));
  }

  private computeIndex(scores: number[], weights: number[]): number {
    let sum = 0;
    for (let i = 0; i < scores.length; i++) {
      sum += scores[i] * weights[i];
    }
    return sum * 100; // Scale to 0-100
  }

  private decomposeIndex(
    dimensions: ValueDimension[],
    weights: number[],
    totalIndex: number
  ): IndexComponent[] {
    return dimensions.map((dim, i) => {
      const score = this.calculateDimensionScore(dim);
      const contribution = (score * weights[i] * 100) / totalIndex * 100;

      return {
        dimension: dim.name,
        score: score * 100,
        weight: weights[i] * 100,
        contribution,
      };
    });
  }

  private calculateTrend(dimensions: ValueDimension[]): 'improving' | 'stable' | 'declining' {
    const trends = dimensions.map((d) => this.determineTrend(d));
    const improvingCount = trends.filter((t) => t === 'improving').length;
    const decliningCount = trends.filter((t) => t === 'declining').length;

    if (improvingCount > decliningCount + 1) return 'improving';
    if (decliningCount > improvingCount + 1) return 'declining';
    return 'stable';
  }

  private getBenchmark(_scheme?: WeightingScheme): number {
    return 75; // Default benchmark index value
  }

  private interpretIndex(value: number): string {
    if (value >= 90) return 'Excellent - top-tier value creation';
    if (value >= 75) return 'Good - above average value creation';
    if (value >= 60) return 'Moderate - average value creation';
    if (value >= 45) return 'Below average - improvement needed';
    return 'Poor - significant value creation gaps';
  }

  private getBenchmarks(
    dimensions: ValueDimension[],
    type: string
  ): Map<string, number> {
    const benchmarks = new Map<string, number>();

    const benchmarkValues: Record<string, Record<string, number>> = {
      industry: {
        financial: 0.7,
        customer: 0.75,
        operational: 0.65,
        employee: 0.7,
        social: 0.5,
        environmental: 0.45,
      },
      'best-in-class': {
        financial: 0.85,
        customer: 0.9,
        operational: 0.8,
        employee: 0.85,
        social: 0.7,
        environmental: 0.65,
      },
      historical: {
        financial: 0.6,
        customer: 0.65,
        operational: 0.6,
        employee: 0.6,
        social: 0.4,
        environmental: 0.35,
      },
    };

    for (const dim of dimensions) {
      const value = benchmarkValues[type]?.[dim.category] || 0.6;
      benchmarks.set(dim.id, value);
    }

    return benchmarks;
  }

  private compareToBenchmarks(
    assessment: ValueAssessment,
    benchmarks: Map<string, number>
  ): BenchmarkComparison[] {
    return assessment.dimensions.map((dim) => {
      const score = this.calculateDimensionScore(dim);
      const benchmark = benchmarks.get(dim.id) || 0.6;
      const gap = score - benchmark;

      return {
        dimension: dim.name,
        score,
        benchmark,
        gap,
        position: gap >= 0.1 ? 'above' : gap <= -0.1 ? 'below' : 'at',
      };
    });
  }

  private identifyGaps(comparisons: BenchmarkComparison[]): BenchmarkGap[] {
    return comparisons
      .filter((c) => c.position === 'below')
      .map((c) => ({
        dimension: c.dimension,
        gap: Math.abs(c.gap),
        priority: Math.abs(c.gap) > 0.2 ? 'high' : 'medium',
        closingStrategy: `Improve ${c.dimension.toLowerCase()} through targeted initiatives`,
      }));
  }

  private identifyOpportunities(comparisons: BenchmarkComparison[]): BenchmarkOpportunity[] {
    return comparisons
      .filter((c) => c.position === 'above')
      .map((c) => ({
        dimension: c.dimension,
        advantage: c.gap,
        potential: c.gap > 0.2 ? 'high' : 'medium',
        exploitationStrategy: `Leverage ${c.dimension.toLowerCase()} advantage`,
      }));
  }

  private calculateOverallPosition(comparisons: BenchmarkComparison[]): string {
    const aboveCount = comparisons.filter((c) => c.position === 'above').length;
    const belowCount = comparisons.filter((c) => c.position === 'below').length;

    if (aboveCount > belowCount * 2) return 'Leader';
    if (aboveCount > belowCount) return 'Above Average';
    if (belowCount > aboveCount) return 'Below Average';
    return 'Average';
  }

  private generateBenchmarkRecommendations(
    gaps: BenchmarkGap[],
    opportunities: BenchmarkOpportunity[]
  ): string[] {
    const recommendations: string[] = [];

    if (gaps.length > 0) {
      recommendations.push(`Close gaps in ${gaps.length} dimension(s)`);
      const highPriority = gaps.filter((g) => g.priority === 'high');
      if (highPriority.length > 0) {
        recommendations.push(`Priority: ${highPriority.map((g) => g.dimension).join(', ')}`);
      }
    }

    if (opportunities.length > 0) {
      recommendations.push(`Leverage advantages in ${opportunities.length} dimension(s)`);
    }

    return recommendations;
  }

  private parseHorizon(horizon: string): number {
    const match = horizon.match(/(\d+)/);
    if (match) {
      if (horizon.includes('year')) {
        return parseInt(match[1], 10) * 12;
      }
      return parseInt(match[1], 10);
    }
    return 12; // Default to 12 months
  }

  private projectDimensions(
    dimensions: ValueDimension[],
    months: number,
    assumptions?: ForecastAssumptions
  ): DimensionProjection[] {
    return dimensions.map((dim) => {
      const currentScore = this.calculateDimensionScore(dim);
      const trend = this.determineTrend(dim);

      let growthRate = 0;
      if (trend === 'improving') growthRate = 0.02;
      else if (trend === 'declining') growthRate = -0.01;

      if (assumptions?.growthRates?.[dim.category]) {
        growthRate = assumptions.growthRates[dim.category];
      }

      const projectedScore = Math.min(1, Math.max(0, currentScore * Math.pow(1 + growthRate, months / 12)));

      return {
        dimension: dim.name,
        current: currentScore,
        projected: projectedScore,
        change: projectedScore - currentScore,
        assumptions: [`Growth rate: ${(growthRate * 100).toFixed(1)}% annual`],
      };
    });
  }

  private generateScenarios(
    assessment: ValueAssessment,
    months: number,
    _assumptions?: ForecastAssumptions
  ): ForecastScenario[] {
    return [
      {
        name: 'Optimistic',
        probability: 0.25,
        projectedScore: Math.min(100, assessment.overallScore * 100 * Math.pow(1.08, months / 12)),
        assumptions: ['Strong market conditions', 'Successful initiatives', 'No major disruptions'],
      },
      {
        name: 'Base',
        probability: 0.5,
        projectedScore: assessment.overallScore * 100 * Math.pow(1.03, months / 12),
        assumptions: ['Normal market conditions', 'Planned initiatives executed'],
      },
      {
        name: 'Pessimistic',
        probability: 0.25,
        projectedScore: assessment.overallScore * 100 * Math.pow(0.98, months / 12),
        assumptions: ['Challenging market conditions', 'Initiative delays', 'External disruptions'],
      },
    ];
  }

  private assessForecastRisks(
    projections: DimensionProjection[],
    _assumptions?: ForecastAssumptions
  ): ForecastRisk[] {
    const risks: ForecastRisk[] = [];

    const decliningDims = projections.filter((p) => p.change < 0);
    if (decliningDims.length > 0) {
      risks.push({
        risk: 'Value erosion in declining dimensions',
        probability: 0.4,
        impact: 'medium',
        mitigation: 'Implement improvement initiatives',
      });
    }

    risks.push({
      risk: 'External factors may impact projections',
      probability: 0.3,
      impact: 'medium',
      mitigation: 'Regular monitoring and scenario planning',
    });

    return risks;
  }

  private calculateForecastConfidence(horizonMonths: number): number {
    // Confidence decreases with longer horizons
    return Math.max(0.4, 0.85 - horizonMonths * 0.02);
  }

  private generateForecastRecommendations(
    projections: DimensionProjection[],
    scenarios: ForecastScenario[]
  ): string[] {
    const recommendations: string[] = [];

    const negativeDims = projections.filter((p) => p.change < 0);
    if (negativeDims.length > 0) {
      recommendations.push(`Address projected decline in: ${negativeDims.map((d) => d.dimension).join(', ')}`);
    }

    const baseScenario = scenarios.find((s) => s.name === 'Base');
    if (baseScenario && baseScenario.projectedScore < 70) {
      recommendations.push('Projected value below target - enhance initiatives');
    }

    recommendations.push('Monitor early indicators and adjust plans');

    return recommendations;
  }

  private buildTimeSeries(assessments: ValueAssessment[]): TimeSeriesData[] {
    return assessments.map((a, index) => ({
      period: index,
      overallScore: a.overallScore,
      dimensionScores: a.dimensionScores,
    }));
  }

  private analyzeTrends(timeSeries: TimeSeriesData[]): TrendAnalysis[] {
    if (timeSeries.length < 2) return [];

    const trends: TrendAnalysis[] = [];

    // Overall trend
    const overallChange = timeSeries[timeSeries.length - 1].overallScore - timeSeries[0].overallScore;
    trends.push({
      metric: 'Overall Score',
      direction: overallChange > 0.05 ? 'up' : overallChange < -0.05 ? 'down' : 'stable',
      magnitude: Math.abs(overallChange),
      significance: Math.abs(overallChange) > 0.1 ? 'significant' : 'moderate',
    });

    return trends;
  }

  private calculateVolatility(timeSeries: TimeSeriesData[]): number {
    if (timeSeries.length < 3) return 0;

    const scores = timeSeries.map((t) => t.overallScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / scores.length;

    return Math.sqrt(variance);
  }

  private detectAnomalies(timeSeries: TimeSeriesData[]): Anomaly[] {
    if (timeSeries.length < 4) return [];

    const anomalies: Anomaly[] = [];
    const scores = timeSeries.map((t) => t.overallScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(
      scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / scores.length
    );

    scores.forEach((score, index) => {
      if (Math.abs(score - mean) > 2 * stdDev) {
        anomalies.push({
          period: index,
          value: score,
          type: score > mean ? 'spike' : 'drop',
          severity: 'significant',
        });
      }
    });

    return anomalies;
  }

  private generateTrackingInsights(trends: TrendAnalysis[], anomalies: Anomaly[]): string[] {
    const insights: string[] = [];

    for (const trend of trends) {
      insights.push(`${trend.metric}: ${trend.direction} trend (${trend.significance})`);
    }

    if (anomalies.length > 0) {
      insights.push(`${anomalies.length} anomaly(ies) detected in historical data`);
    }

    return insights;
  }

  private generateTrackingRecommendations(trends: TrendAnalysis[]): string[] {
    const recommendations: string[] = [];

    const downTrends = trends.filter((t) => t.direction === 'down' && t.significance === 'significant');
    if (downTrends.length > 0) {
      recommendations.push('Investigate significant downward trends');
    }

    recommendations.push('Continue regular value monitoring');
    recommendations.push('Use insights to inform strategic planning');

    return recommendations;
  }

  private calculateConfidence(dimensions: ValueDimension[]): number {
    let confidence = 0.5;

    if (dimensions.length > 3) confidence += 0.1;
    if (dimensions.every((d) => d.metrics.length > 0)) confidence += 0.15;
    if (dimensions.some((d) => d.metrics.some((m) => m.trend.length > 0))) confidence += 0.1;

    return Math.min(0.9, confidence);
  }
}

// Additional types for this engine
interface StandardDimension {
  name: string;
  category: ValueDimension['category'];
  defaultWeight: number;
  standardMetrics: string[];
}

interface ValueIndex {
  value: number;
  components: IndexComponent[];
  trend: 'improving' | 'stable' | 'declining';
  benchmark: number;
  interpretation: string;
}

interface IndexComponent {
  dimension: string;
  score: number;
  weight: number;
  contribution: number;
}

interface WeightingScheme {
  type: 'equal' | 'stakeholder' | 'risk-adjusted';
  priorities?: string[];
}

interface BenchmarkAnalysis {
  benchmarkType: string;
  comparisons: BenchmarkComparison[];
  gaps: BenchmarkGap[];
  opportunities: BenchmarkOpportunity[];
  overallPosition: string;
  recommendations: string[];
}

interface BenchmarkComparison {
  dimension: string;
  score: number;
  benchmark: number;
  gap: number;
  position: 'above' | 'at' | 'below';
}

interface BenchmarkGap {
  dimension: string;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  closingStrategy: string;
}

interface BenchmarkOpportunity {
  dimension: string;
  advantage: number;
  potential: 'high' | 'medium' | 'low';
  exploitationStrategy: string;
}

interface ForecastAssumptions {
  growthRates?: Record<string, number>;
  externalFactors?: string[];
}

interface ValueForecast {
  horizon: string;
  baseline: number;
  projections: DimensionProjection[];
  scenarios: ForecastScenario[];
  risks: ForecastRisk[];
  confidence: number;
  recommendations: string[];
}

interface DimensionProjection {
  dimension: string;
  current: number;
  projected: number;
  change: number;
  assumptions: string[];
}

interface ForecastScenario {
  name: string;
  probability: number;
  projectedScore: number;
  assumptions: string[];
}

interface ForecastRisk {
  risk: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface ValueTrackingReport {
  timeSeries: TimeSeriesData[];
  trends: TrendAnalysis[];
  volatility: number;
  anomalies: Anomaly[];
  insights: string[];
  recommendations: string[];
}

interface TimeSeriesData {
  period: number;
  overallScore: number;
  dimensionScores: DimensionScore[];
}

interface TrendAnalysis {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  significance: 'significant' | 'moderate' | 'minor';
}

interface Anomaly {
  period: number;
  value: number;
  type: 'spike' | 'drop';
  severity: 'significant' | 'moderate';
}

export const valueAssessmentEngine = new ValueAssessmentEngine();
