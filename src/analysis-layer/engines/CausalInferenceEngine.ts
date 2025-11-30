/**
 * Causal Inference Engine
 * 3.4 因果推論エンジン
 */

import type {
  CausalVariable,
  CausalRelationship,
  CausalGraph,
  InterventionAnalysis,
  CounterfactualAnalysis,
  AnalysisResult,
} from '../types';

export interface CausalData {
  variables: Record<string, number[]>;
  sampleSize: number;
}

export interface CausalOptions {
  significanceLevel?: number;
  maxLag?: number;
  includeConfounders?: boolean;
}

export class CausalInferenceEngine {
  /**
   * Discover causal relationships from data
   */
  async discoverCausalGraph(
    data: CausalData,
    options?: CausalOptions
  ): Promise<AnalysisResult<CausalGraph>> {
    const startTime = Date.now();
    const opts = {
      significanceLevel: options?.significanceLevel || 0.05,
      maxLag: options?.maxLag || 3,
      includeConfounders: options?.includeConfounders ?? true,
    };

    // Extract variable information
    const variables: CausalVariable[] = Object.keys(data.variables).map((name) => ({
      id: name,
      name,
      type: this.inferVariableType(data.variables[name]),
      values: data.variables[name],
    }));

    // Discover relationships using correlation and Granger causality
    const relationships: CausalRelationship[] = [];
    const variableNames = Object.keys(data.variables);

    for (let i = 0; i < variableNames.length; i++) {
      for (let j = 0; j < variableNames.length; j++) {
        if (i === j) continue;

        const from = variableNames[i];
        const to = variableNames[j];

        // Check for causal relationship
        const relationship = this.testCausality(
          data.variables[from],
          data.variables[to],
          opts
        );

        if (relationship.strength > 0.3 && relationship.pValue < opts.significanceLevel) {
          // Check for confounders
          const confounders = opts.includeConfounders
            ? this.findConfounders(from, to, data.variables, variableNames)
            : [];

          relationships.push({
            from,
            to,
            strength: relationship.strength,
            confidence: 1 - relationship.pValue,
            mechanism: this.inferMechanism(from, to, relationship.strength),
            isConfounded: confounders.length > 0,
            confounders,
          });
        }
      }
    }

    // Identify root causes and terminal effects
    const fromNodes = new Set(relationships.map((r) => r.from));
    const toNodes = new Set(relationships.map((r) => r.to));

    const rootCauses = [...fromNodes].filter((n) => !toNodes.has(n));
    const terminalEffects = [...toNodes].filter((n) => !fromNodes.has(n));

    const graph: CausalGraph = {
      variables,
      relationships,
      rootCauses,
      terminalEffects,
    };

    return {
      data: graph,
      confidence: this.calculateGraphConfidence(relationships),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Analyze the effect of an intervention
   */
  async analyzeIntervention(
    graph: CausalGraph,
    intervention: { variable: string; value: number | string },
    data: CausalData
  ): Promise<AnalysisResult<InterventionAnalysis>> {
    const startTime = Date.now();

    // Find all downstream effects
    const affectedVariables = this.findDownstreamVariables(
      intervention.variable,
      graph.relationships
    );

    const effects: InterventionAnalysis['effects'] = [];
    const sideEffects: InterventionAnalysis['sideEffects'] = [];

    for (const varName of affectedVariables) {
      const originalValues = data.variables[varName];
      if (!originalValues) continue;

      const beforeIntervention = this.calculateMean(originalValues);

      // Estimate effect using causal path strength
      const pathStrength = this.calculatePathStrength(
        intervention.variable,
        varName,
        graph.relationships
      );

      const interventionValue = typeof intervention.value === 'number'
        ? intervention.value
        : 0;

      const originalInterventionMean = this.calculateMean(
        data.variables[intervention.variable] || []
      );

      const changeRatio = originalInterventionMean !== 0
        ? (interventionValue - originalInterventionMean) / originalInterventionMean
        : 0;

      const afterIntervention = beforeIntervention * (1 + pathStrength * changeRatio);
      const changePercent = beforeIntervention !== 0
        ? ((afterIntervention - beforeIntervention) / beforeIntervention) * 100
        : 0;

      // Direct effects
      const directRelation = graph.relationships.find(
        (r) => r.from === intervention.variable && r.to === varName
      );

      if (directRelation) {
        effects.push({
          variable: varName,
          beforeIntervention,
          afterIntervention,
          changePercent,
          confidence: directRelation.confidence,
        });
      } else {
        // Indirect effects (side effects)
        sideEffects.push({
          variable: varName,
          effect: changePercent,
          isPositive: changePercent > 0,
        });
      }
    }

    const result: InterventionAnalysis = {
      intervention,
      effects,
      sideEffects,
    };

    return {
      data: result,
      confidence: effects.length > 0
        ? effects.reduce((sum, e) => sum + e.confidence, 0) / effects.length
        : 0.5,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Perform counterfactual analysis
   */
  async analyzeCounterfactual(
    graph: CausalGraph,
    actualOutcome: Record<string, number>,
    counterfactualScenario: Record<string, number | string>
  ): Promise<AnalysisResult<CounterfactualAnalysis>> {
    const startTime = Date.now();

    const counterfactualOutcome: Record<string, number> = { ...actualOutcome };
    const difference: Record<string, number> = {};

    // For each variable in the counterfactual scenario
    for (const [varName, newValue] of Object.entries(counterfactualScenario)) {
      const numValue = typeof newValue === 'number' ? newValue : 0;

      // Find all affected variables
      const affected = this.findDownstreamVariables(varName, graph.relationships);

      for (const affectedVar of affected) {
        if (affectedVar === varName) continue;

        const pathStrength = this.calculatePathStrength(
          varName,
          affectedVar,
          graph.relationships
        );

        const oldValue = actualOutcome[varName] || 0;
        const changeRatio = oldValue !== 0 ? (numValue - oldValue) / oldValue : 0;

        const currentValue = counterfactualOutcome[affectedVar] || 0;
        counterfactualOutcome[affectedVar] = currentValue * (1 + pathStrength * changeRatio);
      }

      counterfactualOutcome[varName] = numValue;
    }

    // Calculate differences
    for (const key of Object.keys(actualOutcome)) {
      difference[key] = (counterfactualOutcome[key] || 0) - (actualOutcome[key] || 0);
    }

    // Generate explanation
    const explanation = this.generateCounterfactualExplanation(
      counterfactualScenario,
      difference,
      graph.relationships
    );

    const result: CounterfactualAnalysis = {
      actualOutcome,
      counterfactualScenario,
      counterfactualOutcome,
      difference,
      explanation,
    };

    return {
      data: result,
      confidence: 0.7, // Counterfactual analysis has inherent uncertainty
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Identify root causes for an observed effect
   */
  async identifyRootCauses(
    graph: CausalGraph,
    targetVariable: string,
    _data: CausalData
  ): Promise<Array<{
    variable: string;
    contribution: number;
    confidence: number;
    mechanism: string;
  }>> {
    const causes: Array<{
      variable: string;
      contribution: number;
      confidence: number;
      mechanism: string;
    }> = [];

    // Find all upstream variables
    const upstreamVars = this.findUpstreamVariables(targetVariable, graph.relationships);

    for (const varName of upstreamVars) {
      const pathStrength = this.calculatePathStrength(
        varName,
        targetVariable,
        graph.relationships
      );

      const relationship = graph.relationships.find(
        (r) => r.from === varName && r.to === targetVariable
      );

      causes.push({
        variable: varName,
        contribution: pathStrength,
        confidence: relationship?.confidence || 0.5,
        mechanism: relationship?.mechanism || 'Unknown mechanism',
      });
    }

    // Sort by contribution
    return causes.sort((a, b) => b.contribution - a.contribution);
  }

  /**
   * Infer variable type from data
   */
  private inferVariableType(values: number[]): 'continuous' | 'categorical' | 'binary' {
    const uniqueValues = new Set(values);

    if (uniqueValues.size === 2) {
      return 'binary';
    }

    if (uniqueValues.size <= 10 && values.every((v) => Number.isInteger(v))) {
      return 'categorical';
    }

    return 'continuous';
  }

  /**
   * Test for causal relationship using Granger causality
   */
  private testCausality(
    cause: number[],
    effect: number[],
    options: { significanceLevel: number; maxLag: number }
  ): { strength: number; pValue: number } {
    const n = Math.min(cause.length, effect.length);

    if (n < options.maxLag + 2) {
      return { strength: 0, pValue: 1 };
    }

    // Calculate cross-correlation at different lags
    let maxCorr = 0;
    let bestLag = 0;

    for (let lag = 1; lag <= options.maxLag; lag++) {
      const corr = this.calculateCorrelation(
        cause.slice(0, n - lag),
        effect.slice(lag, n)
      );

      if (Math.abs(corr) > Math.abs(maxCorr)) {
        maxCorr = corr;
        bestLag = lag;
      }
    }

    // Calculate p-value (simplified t-test approximation)
    const t = maxCorr * Math.sqrt((n - bestLag - 2) / (1 - maxCorr * maxCorr));
    const pValue = 2 * (1 - this.tCDF(Math.abs(t), n - bestLag - 2));

    return {
      strength: maxCorr,
      pValue,
    };
  }

  /**
   * Calculate Pearson correlation
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denom = Math.sqrt(denomX * denomY);
    return denom === 0 ? 0 : numerator / denom;
  }

  /**
   * Find potential confounding variables
   */
  private findConfounders(
    from: string,
    to: string,
    data: Record<string, number[]>,
    allVariables: string[]
  ): string[] {
    const confounders: string[] = [];

    for (const candidate of allVariables) {
      if (candidate === from || candidate === to) continue;

      // Check if candidate correlates with both from and to
      const corrWithFrom = this.calculateCorrelation(
        data[candidate] || [],
        data[from] || []
      );
      const corrWithTo = this.calculateCorrelation(
        data[candidate] || [],
        data[to] || []
      );

      // If strongly correlated with both, it might be a confounder
      if (Math.abs(corrWithFrom) > 0.3 && Math.abs(corrWithTo) > 0.3) {
        confounders.push(candidate);
      }
    }

    return confounders;
  }

  /**
   * Infer causal mechanism description
   */
  private inferMechanism(from: string, to: string, strength: number): string {
    const direction = strength > 0 ? 'positively' : 'negatively';
    const magnitude = Math.abs(strength) > 0.7 ? 'strongly' :
      Math.abs(strength) > 0.4 ? 'moderately' : 'weakly';

    return `${from} ${magnitude} ${direction} influences ${to}`;
  }

  /**
   * Find all downstream variables affected by a source
   */
  private findDownstreamVariables(
    source: string,
    relationships: CausalRelationship[]
  ): string[] {
    const downstream = new Set<string>();
    const queue = [source];

    while (queue.length > 0) {
      const current = queue.shift()!;
      downstream.add(current);

      for (const rel of relationships) {
        if (rel.from === current && !downstream.has(rel.to)) {
          queue.push(rel.to);
        }
      }
    }

    return Array.from(downstream);
  }

  /**
   * Find all upstream variables that influence a target
   */
  private findUpstreamVariables(
    target: string,
    relationships: CausalRelationship[]
  ): string[] {
    const upstream = new Set<string>();
    const queue = [target];

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const rel of relationships) {
        if (rel.to === current && !upstream.has(rel.from)) {
          upstream.add(rel.from);
          queue.push(rel.from);
        }
      }
    }

    return Array.from(upstream);
  }

  /**
   * Calculate total path strength from source to target
   */
  private calculatePathStrength(
    source: string,
    target: string,
    relationships: CausalRelationship[]
  ): number {
    // BFS to find all paths and calculate combined strength
    const visited = new Set<string>();
    const queue: Array<{ node: string; strength: number }> = [{ node: source, strength: 1 }];
    let totalStrength = 0;

    while (queue.length > 0) {
      const { node, strength } = queue.shift()!;

      if (node === target) {
        totalStrength = Math.max(totalStrength, Math.abs(strength));
        continue;
      }

      if (visited.has(node)) continue;
      visited.add(node);

      for (const rel of relationships) {
        if (rel.from === node) {
          queue.push({
            node: rel.to,
            strength: strength * rel.strength,
          });
        }
      }
    }

    return totalStrength;
  }

  /**
   * Calculate mean of an array
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Generate explanation for counterfactual analysis
   */
  private generateCounterfactualExplanation(
    scenario: Record<string, number | string>,
    difference: Record<string, number>,
    _relationships: CausalRelationship[]
  ): string {
    const changes = Object.entries(scenario)
      .map(([k, v]) => `${k} = ${v}`)
      .join(', ');

    const significantEffects = Object.entries(difference)
      .filter(([_, v]) => Math.abs(v) > 0.01)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3)
      .map(([k, v]) => `${k} would change by ${v > 0 ? '+' : ''}${v.toFixed(2)}`)
      .join(', ');

    return `If ${changes}, then ${significantEffects || 'no significant changes would occur'}.`;
  }

  /**
   * Calculate overall graph confidence
   */
  private calculateGraphConfidence(relationships: CausalRelationship[]): number {
    if (relationships.length === 0) return 0.5;

    const avgConfidence =
      relationships.reduce((sum, r) => sum + r.confidence, 0) / relationships.length;

    const confoundedPenalty =
      relationships.filter((r) => r.isConfounded).length / relationships.length * 0.2;

    return Math.max(0.3, avgConfidence - confoundedPenalty);
  }

  /**
   * Approximate t-distribution CDF
   */
  private tCDF(t: number, df: number): number {
    const x = df / (df + t * t);
    return 1 - 0.5 * Math.pow(x, df / 2);
  }
}

export const causalInferenceEngine = new CausalInferenceEngine();
