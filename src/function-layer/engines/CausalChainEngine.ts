/**
 * Causal Chain Engine
 * 4.11 因果連鎖可視化エンジン
 */

import type {
  FunctionResult,
  CausalNode,
  CausalLink,
  CausalChain,
  CausalVisualization,
  CausalPath,
  CriticalFactor,
  InterventionPoint,
} from '../types';

export interface ChainInput {
  nodes: NodeInput[];
  links?: LinkInput[];
  context?: ChainContext;
}

export interface NodeInput {
  id?: string;
  name: string;
  type?: CausalNode['type'];
  value?: number;
  unit?: string;
}

export interface LinkInput {
  fromId: string;
  toId: string;
  strength?: number;
  lag?: number;
}

export interface ChainContext {
  domain: string;
  timeframe?: string;
  focusOutcome?: string;
}

export class CausalChainEngine {
  /**
   * Build causal chain from inputs
   */
  async build(input: ChainInput): Promise<FunctionResult<CausalChain>> {
    const startTime = Date.now();

    const nodes = this.buildNodes(input.nodes, input.context);
    const links = input.links
      ? this.buildLinks(input.links, nodes)
      : this.inferLinks(nodes, input.context);

    const rootCauses = this.identifyRootCauses(nodes, links);
    const ultimateOutcomes = this.identifyUltimateOutcomes(nodes, links);

    const chain: CausalChain = {
      nodes,
      links,
      rootCauses,
      ultimateOutcomes,
    };

    return {
      data: chain,
      confidence: this.calculateConfidence(chain),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateBuildRecommendations(chain),
    };
  }

  /**
   * Visualize causal chain
   */
  async visualize(chain: CausalChain): Promise<FunctionResult<CausalVisualization>> {
    const startTime = Date.now();

    const paths = this.tracePaths(chain);
    const criticalFactors = this.identifyCriticalFactors(chain, paths);
    const interventionPoints = this.identifyInterventionPoints(chain, criticalFactors);

    const visualization: CausalVisualization = {
      chain,
      paths,
      criticalFactors,
      interventionPoints,
    };

    return {
      data: visualization,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateVisualizationRecommendations(visualization),
    };
  }

  /**
   * Analyze impact propagation
   */
  async analyzeImpact(
    chain: CausalChain,
    sourceNodeId: string,
    changeAmount: number
  ): Promise<FunctionResult<ImpactAnalysis>> {
    const startTime = Date.now();

    const propagation = this.propagateImpact(chain, sourceNodeId, changeAmount);
    const affectedNodes = this.identifyAffectedNodes(chain, propagation);
    const timeline = this.estimateTimeline(chain, propagation);
    const cascadeRisks = this.assessCascadeRisks(propagation);

    const analysis: ImpactAnalysis = {
      source: sourceNodeId,
      change: changeAmount,
      propagation,
      affectedNodes,
      timeline,
      cascadeRisks,
      recommendations: this.generateImpactRecommendations(propagation, cascadeRisks),
    };

    return {
      data: analysis,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Find optimal intervention strategy
   */
  async findOptimalIntervention(
    chain: CausalChain,
    targetOutcome: string,
    constraints?: InterventionConstraints
  ): Promise<FunctionResult<OptimalIntervention>> {
    const startTime = Date.now();

    const targetNode = chain.nodes.find((n) => n.id === targetOutcome || n.name === targetOutcome);
    if (!targetNode) {
      throw new Error(`Target outcome ${targetOutcome} not found`);
    }

    const candidates = this.identifyInterventionCandidates(chain, targetNode);
    const evaluatedCandidates = this.evaluateCandidates(candidates, chain, targetNode, constraints);
    const optimalStrategy = this.selectOptimalStrategy(evaluatedCandidates);

    const intervention: OptimalIntervention = {
      targetOutcome,
      candidates: evaluatedCandidates,
      optimalStrategy,
      expectedImpact: this.estimateInterventionImpact(optimalStrategy, chain, targetNode),
      implementationPlan: this.createImplementationPlan(optimalStrategy),
    };

    return {
      data: intervention,
      confidence: 0.65,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: [
        'Validate causal assumptions before intervention',
        'Monitor leading indicators during implementation',
        'Be prepared to adjust strategy based on results',
      ],
    };
  }

  /**
   * Validate causal relationships
   */
  async validate(
    chain: CausalChain,
    observedData: ObservedData[]
  ): Promise<FunctionResult<ValidationResult>> {
    const startTime = Date.now();

    const linkValidations = this.validateLinks(chain.links, observedData);
    const consistencyChecks = this.checkConsistency(chain, observedData);
    const anomalies = this.detectAnomalies(chain, observedData);
    const overallValidity = this.calculateOverallValidity(linkValidations, consistencyChecks);

    const result: ValidationResult = {
      overallValidity,
      linkValidations,
      consistencyChecks,
      anomalies,
      recommendations: this.generateValidationRecommendations(overallValidity, anomalies),
    };

    return {
      data: result,
      confidence: 0.8,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  private buildNodes(inputs: NodeInput[], context?: ChainContext): CausalNode[] {
    return inputs.map((input, index) => ({
      id: input.id || `node-${index + 1}`,
      name: input.name,
      type: input.type || this.inferNodeType(input.name, index, inputs.length, context),
      value: input.value ?? 0,
      unit: input.unit || 'index',
    }));
  }

  private inferNodeType(
    name: string,
    index: number,
    total: number,
    context?: ChainContext
  ): CausalNode['type'] {
    const lowerName = name.toLowerCase();

    // Check for outcome indicators
    if (context?.focusOutcome &&
        lowerName.includes(context.focusOutcome.toLowerCase())) {
      return 'outcome';
    }

    // Check for common patterns
    if (lowerName.includes('result') || lowerName.includes('outcome') ||
        lowerName.includes('impact') || lowerName.includes('performance')) {
      return 'outcome';
    }

    if (lowerName.includes('constraint') || lowerName.includes('limit') ||
        lowerName.includes('barrier')) {
      return 'constraint';
    }

    if (lowerName.includes('enable') || lowerName.includes('support') ||
        lowerName.includes('capability')) {
      return 'enabler';
    }

    // Position-based inference
    if (index < total / 3) return 'driver';
    if (index > total * 2 / 3) return 'outcome';
    return 'enabler';
  }

  private buildLinks(inputs: LinkInput[], nodes: CausalNode[]): CausalLink[] {
    return inputs.map((input) => {
      const fromNode = nodes.find((n) => n.id === input.fromId);
      const toNode = nodes.find((n) => n.id === input.toId);

      return {
        fromId: input.fromId,
        toId: input.toId,
        strength: input.strength ?? this.estimateLinkStrength(fromNode, toNode),
        lag: input.lag ?? 1,
        confidence: 0.7,
      };
    });
  }

  private inferLinks(nodes: CausalNode[], _context?: ChainContext): CausalLink[] {
    const links: CausalLink[] = [];
    const drivers = nodes.filter((n) => n.type === 'driver');
    const enablers = nodes.filter((n) => n.type === 'enabler');
    const outcomes = nodes.filter((n) => n.type === 'outcome');
    const constraints = nodes.filter((n) => n.type === 'constraint');

    // Drivers → Enablers
    for (const driver of drivers) {
      for (const enabler of enablers) {
        links.push({
          fromId: driver.id,
          toId: enabler.id,
          strength: 0.6,
          lag: 1,
          confidence: 0.5,
        });
      }
    }

    // Enablers → Outcomes
    for (const enabler of enablers) {
      for (const outcome of outcomes) {
        links.push({
          fromId: enabler.id,
          toId: outcome.id,
          strength: 0.7,
          lag: 2,
          confidence: 0.5,
        });
      }
    }

    // Constraints → Outcomes (negative)
    for (const constraint of constraints) {
      for (const outcome of outcomes) {
        links.push({
          fromId: constraint.id,
          toId: outcome.id,
          strength: -0.5,
          lag: 1,
          confidence: 0.5,
        });
      }
    }

    return links;
  }

  private estimateLinkStrength(_from?: CausalNode, _to?: CausalNode): number {
    return 0.5; // Default moderate strength
  }

  private identifyRootCauses(nodes: CausalNode[], links: CausalLink[]): string[] {
    const targetNodes = new Set(links.map((l) => l.toId));
    return nodes
      .filter((n) => !targetNodes.has(n.id))
      .map((n) => n.id);
  }

  private identifyUltimateOutcomes(nodes: CausalNode[], links: CausalLink[]): string[] {
    const sourceNodes = new Set(links.map((l) => l.fromId));
    return nodes
      .filter((n) => !sourceNodes.has(n.id))
      .map((n) => n.id);
  }

  private tracePaths(chain: CausalChain): CausalPath[] {
    const paths: CausalPath[] = [];

    for (const rootId of chain.rootCauses) {
      for (const outcomeId of chain.ultimateOutcomes) {
        const foundPaths = this.findAllPaths(chain, rootId, outcomeId);
        paths.push(...foundPaths);
      }
    }

    return paths;
  }

  private findAllPaths(
    chain: CausalChain,
    startId: string,
    endId: string
  ): CausalPath[] {
    const paths: CausalPath[] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, currentPath: string[], totalStrength: number, totalLag: number) => {
      if (currentId === endId) {
        paths.push({
          nodeIds: [...currentPath, currentId],
          totalStrength,
          totalLag,
          description: this.describePath([...currentPath, currentId], chain),
        });
        return;
      }

      if (visited.has(currentId)) return;
      visited.add(currentId);

      const outgoingLinks = chain.links.filter((l) => l.fromId === currentId);
      for (const link of outgoingLinks) {
        dfs(
          link.toId,
          [...currentPath, currentId],
          totalStrength * link.strength,
          totalLag + link.lag
        );
      }

      visited.delete(currentId);
    };

    dfs(startId, [], 1, 0);
    return paths;
  }

  private describePath(nodeIds: string[], chain: CausalChain): string {
    const nodeNames = nodeIds.map((id) => {
      const node = chain.nodes.find((n) => n.id === id);
      return node?.name || id;
    });

    return nodeNames.join(' → ');
  }

  private identifyCriticalFactors(
    chain: CausalChain,
    paths: CausalPath[]
  ): CriticalFactor[] {
    const nodeCriticality = new Map<string, number>();

    // Count how many paths each node appears in
    for (const path of paths) {
      for (const nodeId of path.nodeIds) {
        const current = nodeCriticality.get(nodeId) || 0;
        nodeCriticality.set(nodeId, current + Math.abs(path.totalStrength));
      }
    }

    // Calculate centrality
    const maxCriticality = Math.max(...nodeCriticality.values());

    return chain.nodes
      .map((node) => {
        const criticality = (nodeCriticality.get(node.id) || 0) / maxCriticality;
        return {
          nodeId: node.id,
          criticality,
          rationale: this.explainCriticality(node, criticality, paths),
          monitoringPriority: (criticality > 0.7 ? 'high' : criticality > 0.4 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        };
      })
      .filter((f) => f.criticality > 0.3)
      .sort((a, b) => b.criticality - a.criticality);
  }

  private explainCriticality(
    node: CausalNode,
    criticality: number,
    paths: CausalPath[]
  ): string {
    const pathCount = paths.filter((p) => p.nodeIds.includes(node.id)).length;

    if (criticality > 0.7) {
      return `${node.name} is critical - appears in ${pathCount} causal path(s) and has high influence`;
    }
    if (criticality > 0.4) {
      return `${node.name} is moderately important - appears in ${pathCount} causal path(s)`;
    }
    return `${node.name} has limited influence`;
  }

  private identifyInterventionPoints(
    chain: CausalChain,
    criticalFactors: CriticalFactor[]
  ): InterventionPoint[] {
    return criticalFactors
      .filter((f) => f.monitoringPriority !== 'low')
      .map((factor) => {
        const node = chain.nodes.find((n) => n.id === factor.nodeId)!;
        const outgoingLinks = chain.links.filter((l) => l.fromId === factor.nodeId);
        const potentialImpact = outgoingLinks.reduce(
          (acc, l) => acc + Math.abs(l.strength),
          0
        );

        return {
          nodeId: factor.nodeId,
          potential: potentialImpact,
          difficulty: this.estimateInterventionDifficulty(node),
          recommendations: this.generateInterventionRecommendations(node, outgoingLinks),
        };
      })
      .sort((a, b) => b.potential / a.difficulty - a.potential / b.difficulty);
  }

  private estimateInterventionDifficulty(node: CausalNode): number {
    // Constraints are harder to change
    if (node.type === 'constraint') return 0.8;
    // Drivers at root are often external
    if (node.type === 'driver') return 0.6;
    // Enablers can often be developed
    if (node.type === 'enabler') return 0.4;
    return 0.5;
  }

  private generateInterventionRecommendations(
    node: CausalNode,
    outgoingLinks: CausalLink[]
  ): string[] {
    const recommendations: string[] = [];

    if (node.type === 'driver') {
      recommendations.push(`Influence ${node.name} through strategic initiatives`);
    } else if (node.type === 'enabler') {
      recommendations.push(`Strengthen ${node.name} capability`);
    } else if (node.type === 'constraint') {
      recommendations.push(`Work to reduce or eliminate ${node.name}`);
    }

    if (outgoingLinks.length > 2) {
      recommendations.push(`High leverage point - affects ${outgoingLinks.length} downstream factors`);
    }

    return recommendations;
  }

  private propagateImpact(
    chain: CausalChain,
    sourceNodeId: string,
    changeAmount: number
  ): ImpactPropagation[] {
    const propagations: ImpactPropagation[] = [];
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; impact: number; lag: number; path: string[] }> = [
      { nodeId: sourceNodeId, impact: changeAmount, lag: 0, path: [sourceNodeId] },
    ];

    while (queue.length > 0) {
      const { nodeId, impact, lag, path } = queue.shift()!;

      if (visited.has(nodeId) && nodeId !== sourceNodeId) continue;
      visited.add(nodeId);

      const outgoingLinks = chain.links.filter((l) => l.fromId === nodeId);

      for (const link of outgoingLinks) {
        const propagatedImpact = impact * link.strength;
        const newLag = lag + link.lag;

        if (Math.abs(propagatedImpact) > 0.01) {
          propagations.push({
            targetNodeId: link.toId,
            impact: propagatedImpact,
            lag: newLag,
            path: [...path, link.toId],
          });

          queue.push({
            nodeId: link.toId,
            impact: propagatedImpact,
            lag: newLag,
            path: [...path, link.toId],
          });
        }
      }
    }

    return propagations;
  }

  private identifyAffectedNodes(
    chain: CausalChain,
    propagation: ImpactPropagation[]
  ): AffectedNode[] {
    const impactByNode = new Map<string, number>();

    for (const prop of propagation) {
      const current = impactByNode.get(prop.targetNodeId) || 0;
      impactByNode.set(prop.targetNodeId, current + prop.impact);
    }

    return Array.from(impactByNode.entries()).map(([nodeId, totalImpact]) => {
      const node = chain.nodes.find((n) => n.id === nodeId)!;
      return {
        nodeId,
        nodeName: node.name,
        totalImpact,
        impactDirection: (totalImpact > 0 ? 'positive' : 'negative') as 'positive' | 'negative',
        significance: (Math.abs(totalImpact) > 0.3 ? 'high' : Math.abs(totalImpact) > 0.1 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
      };
    }).sort((a, b) => Math.abs(b.totalImpact) - Math.abs(a.totalImpact));
  }

  private estimateTimeline(
    chain: CausalChain,
    propagation: ImpactPropagation[]
  ): TimelineEstimate {
    const maxLag = Math.max(...propagation.map((p) => p.lag));
    const avgLag = propagation.reduce((acc, p) => acc + p.lag, 0) / propagation.length;

    return {
      immediateImpact: propagation.filter((p) => p.lag === 0).length > 0,
      fullPropagation: `${maxLag} periods`,
      averageLag: `${avgLag.toFixed(1)} periods`,
      phases: this.defineTimelinePhases(propagation, maxLag),
    };
  }

  private defineTimelinePhases(
    propagation: ImpactPropagation[],
    maxLag: number
  ): TimelinePhase[] {
    const phases: TimelinePhase[] = [];
    const phaseDuration = Math.ceil(maxLag / 3);

    for (let i = 0; i < 3; i++) {
      const phaseStart = i * phaseDuration;
      const phaseEnd = (i + 1) * phaseDuration;
      const phaseProps = propagation.filter(
        (p) => p.lag >= phaseStart && p.lag < phaseEnd
      );

      phases.push({
        name: i === 0 ? 'Immediate' : i === 1 ? 'Short-term' : 'Long-term',
        duration: `${phaseDuration} periods`,
        affectedNodes: [...new Set(phaseProps.map((p) => p.targetNodeId))].length,
        cumulativeImpact: phaseProps.reduce((acc, p) => acc + p.impact, 0),
      });
    }

    return phases;
  }

  private assessCascadeRisks(propagation: ImpactPropagation[]): CascadeRisk[] {
    const risks: CascadeRisk[] = [];

    // Large negative impacts
    const negativeProps = propagation.filter((p) => p.impact < -0.2);
    if (negativeProps.length > 0) {
      risks.push({
        risk: 'Negative cascade effect',
        probability: 0.4,
        impact: 'high',
        affectedNodes: negativeProps.map((p) => p.targetNodeId),
        mitigation: 'Monitor downstream nodes and prepare contingencies',
      });
    }

    // Long propagation paths
    const longPaths = propagation.filter((p) => p.path.length > 4);
    if (longPaths.length > 0) {
      risks.push({
        risk: 'Extended propagation uncertainty',
        probability: 0.3,
        impact: 'medium',
        affectedNodes: longPaths.map((p) => p.targetNodeId),
        mitigation: 'Validate assumptions at each step',
      });
    }

    return risks;
  }

  private generateImpactRecommendations(
    propagation: ImpactPropagation[],
    risks: CascadeRisk[]
  ): string[] {
    const recommendations: string[] = [];

    if (propagation.length > 5) {
      recommendations.push(`Monitor ${propagation.length} downstream effects`);
    }

    if (risks.length > 0) {
      recommendations.push(`Address ${risks.length} cascade risk(s)`);
    }

    const highImpact = propagation.filter((p) => Math.abs(p.impact) > 0.3);
    if (highImpact.length > 0) {
      recommendations.push(`Focus on ${highImpact.length} high-impact effects`);
    }

    return recommendations;
  }

  private identifyInterventionCandidates(
    chain: CausalChain,
    targetNode: CausalNode
  ): InterventionCandidate[] {
    const candidates: InterventionCandidate[] = [];

    // Find all nodes that have a path to the target
    const affectingNodes = chain.links
      .filter((l) => this.hasPathTo(chain, l.fromId, targetNode.id))
      .map((l) => l.fromId);

    const uniqueNodes = [...new Set(affectingNodes)];

    for (const nodeId of uniqueNodes) {
      const node = chain.nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      const pathStrength = this.calculatePathStrength(chain, nodeId, targetNode.id);
      const difficulty = this.estimateInterventionDifficulty(node);

      candidates.push({
        nodeId,
        nodeName: node.name,
        pathStrength,
        difficulty,
        leverageRatio: pathStrength / difficulty,
      });
    }

    return candidates.sort((a, b) => b.leverageRatio - a.leverageRatio);
  }

  private hasPathTo(chain: CausalChain, fromId: string, toId: string): boolean {
    const visited = new Set<string>();
    const queue = [fromId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === toId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const outgoing = chain.links
        .filter((l) => l.fromId === current)
        .map((l) => l.toId);
      queue.push(...outgoing);
    }

    return false;
  }

  private calculatePathStrength(
    chain: CausalChain,
    fromId: string,
    toId: string
  ): number {
    const paths = this.findAllPaths(chain, fromId, toId);
    if (paths.length === 0) return 0;

    // Return max path strength
    return Math.max(...paths.map((p) => Math.abs(p.totalStrength)));
  }

  private evaluateCandidates(
    candidates: InterventionCandidate[],
    chain: CausalChain,
    targetNode: CausalNode,
    constraints?: InterventionConstraints
  ): EvaluatedCandidate[] {
    return candidates.map((candidate) => {
      const expectedImpact = this.estimateExpectedImpact(chain, candidate, targetNode);
      const feasibility = this.assessFeasibility(candidate, constraints);
      const risks = this.assessCandidateRisks(chain, candidate);

      return {
        ...candidate,
        expectedImpact,
        feasibility,
        risks,
        overallScore: this.calculateCandidateScore(expectedImpact, feasibility, risks),
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }

  private estimateExpectedImpact(
    _chain: CausalChain,
    candidate: InterventionCandidate,
    _targetNode: CausalNode
  ): number {
    return candidate.pathStrength * 0.8; // Assume 80% effectiveness
  }

  private assessFeasibility(
    candidate: InterventionCandidate,
    constraints?: InterventionConstraints
  ): number {
    let feasibility = 1 - candidate.difficulty;

    if (constraints?.maxDifficulty && candidate.difficulty > constraints.maxDifficulty) {
      feasibility *= 0.5;
    }

    return feasibility;
  }

  private assessCandidateRisks(
    _chain: CausalChain,
    candidate: InterventionCandidate
  ): string[] {
    const risks: string[] = [];

    if (candidate.difficulty > 0.7) {
      risks.push('High implementation difficulty');
    }

    if (candidate.pathStrength < 0.3) {
      risks.push('Weak causal connection to outcome');
    }

    return risks;
  }

  private calculateCandidateScore(
    expectedImpact: number,
    feasibility: number,
    risks: string[]
  ): number {
    const riskPenalty = risks.length * 0.1;
    return expectedImpact * feasibility - riskPenalty;
  }

  private selectOptimalStrategy(candidates: EvaluatedCandidate[]): OptimalStrategy {
    const topCandidates = candidates.slice(0, 3);

    return {
      primaryIntervention: topCandidates[0],
      supportingInterventions: topCandidates.slice(1),
      combinedExpectedImpact: topCandidates.reduce(
        (acc, c) => acc + c.expectedImpact,
        0
      ) * 0.8, // Diminishing returns for multiple interventions
      rationale: this.explainStrategy(topCandidates),
    };
  }

  private explainStrategy(candidates: EvaluatedCandidate[]): string {
    if (candidates.length === 0) return 'No suitable interventions identified';

    const primary = candidates[0];
    return `Primary intervention on ${primary.nodeName} offers highest leverage (${(primary.overallScore * 100).toFixed(0)}% score) with ${(primary.expectedImpact * 100).toFixed(0)}% expected impact`;
  }

  private estimateInterventionImpact(
    strategy: OptimalStrategy,
    _chain: CausalChain,
    _targetNode: CausalNode
  ): string {
    const impact = strategy.combinedExpectedImpact * 100;
    return `Expected ${impact.toFixed(0)}% improvement in target outcome`;
  }

  private createImplementationPlan(strategy: OptimalStrategy): ImplementationStep[] {
    const steps: ImplementationStep[] = [];

    if (strategy.primaryIntervention) {
      steps.push({
        phase: 1,
        action: `Implement intervention on ${strategy.primaryIntervention.nodeName}`,
        duration: '4-8 weeks',
        expectedImpact: `${(strategy.primaryIntervention.expectedImpact * 100).toFixed(0)}% of total`,
      });
    }

    for (let i = 0; i < strategy.supportingInterventions.length; i++) {
      const intervention = strategy.supportingInterventions[i];
      steps.push({
        phase: i + 2,
        action: `Implement supporting intervention on ${intervention.nodeName}`,
        duration: '2-4 weeks',
        expectedImpact: `${(intervention.expectedImpact * 100).toFixed(0)}% additional`,
      });
    }

    return steps;
  }

  private validateLinks(
    links: CausalLink[],
    observedData: ObservedData[]
  ): LinkValidation[] {
    return links.map((link) => {
      const fromData = observedData.filter((d) => d.nodeId === link.fromId);
      const toData = observedData.filter((d) => d.nodeId === link.toId);

      if (fromData.length < 3 || toData.length < 3) {
        return {
          linkId: `${link.fromId}->${link.toId}`,
          isValid: null,
          observedStrength: null,
          reason: 'Insufficient data',
        };
      }

      const correlation = this.calculateCorrelation(
        fromData.map((d) => d.value),
        toData.map((d) => d.value)
      );

      const expectedSign = link.strength >= 0 ? 1 : -1;
      const observedSign = correlation >= 0 ? 1 : -1;

      return {
        linkId: `${link.fromId}->${link.toId}`,
        isValid: expectedSign === observedSign && Math.abs(correlation) > 0.3,
        observedStrength: correlation,
        reason: expectedSign !== observedSign
          ? 'Direction mismatch'
          : Math.abs(correlation) < 0.3
            ? 'Weak relationship'
            : 'Validated',
      };
    });
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denom = Math.sqrt(denomX * denomY);
    return denom === 0 ? 0 : num / denom;
  }

  private checkConsistency(
    chain: CausalChain,
    _observedData: ObservedData[]
  ): ConsistencyCheck[] {
    const checks: ConsistencyCheck[] = [];

    // Check for cycles
    const hasCycles = this.detectCycles(chain);
    checks.push({
      check: 'No cycles in causal graph',
      passed: !hasCycles,
      details: hasCycles ? 'Cycle detected in causal relationships' : 'No cycles found',
    });

    // Check for orphan nodes
    const orphans = chain.nodes.filter((n) =>
      !chain.links.some((l) => l.fromId === n.id || l.toId === n.id)
    );
    checks.push({
      check: 'All nodes connected',
      passed: orphans.length === 0,
      details: orphans.length > 0
        ? `${orphans.length} orphan node(s) found`
        : 'All nodes are connected',
    });

    return checks;
  }

  private detectCycles(chain: CausalChain): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoing = chain.links
        .filter((l) => l.fromId === nodeId)
        .map((l) => l.toId);

      for (const next of outgoing) {
        if (dfs(next)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of chain.nodes) {
      if (dfs(node.id)) return true;
    }

    return false;
  }

  private detectAnomalies(
    chain: CausalChain,
    observedData: ObservedData[]
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    for (const node of chain.nodes) {
      const nodeData = observedData.filter((d) => d.nodeId === node.id);
      if (nodeData.length < 4) continue;

      const values = nodeData.map((d) => d.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
      );

      for (let i = 0; i < values.length; i++) {
        if (Math.abs(values[i] - mean) > 2 * stdDev) {
          anomalies.push({
            nodeId: node.id,
            period: i,
            observedValue: values[i],
            expectedRange: `${(mean - 2 * stdDev).toFixed(2)} - ${(mean + 2 * stdDev).toFixed(2)}`,
            severity: Math.abs(values[i] - mean) > 3 * stdDev ? 'high' : 'medium',
          });
        }
      }
    }

    return anomalies;
  }

  private calculateOverallValidity(
    linkValidations: LinkValidation[],
    consistencyChecks: ConsistencyCheck[]
  ): number {
    const validLinks = linkValidations.filter((v) => v.isValid === true).length;
    const totalLinks = linkValidations.filter((v) => v.isValid !== null).length;
    const linkScore = totalLinks > 0 ? validLinks / totalLinks : 0.5;

    const passedChecks = consistencyChecks.filter((c) => c.passed).length;
    const totalChecks = consistencyChecks.length;
    const checkScore = totalChecks > 0 ? passedChecks / totalChecks : 0.5;

    return (linkScore + checkScore) / 2;
  }

  private generateValidationRecommendations(
    validity: number,
    anomalies: Anomaly[]
  ): string[] {
    const recommendations: string[] = [];

    if (validity < 0.6) {
      recommendations.push('Review and refine causal model based on validation results');
    }

    if (anomalies.length > 0) {
      recommendations.push(`Investigate ${anomalies.length} data anomaly(ies)`);
    }

    recommendations.push('Continue collecting data to improve validation');

    return recommendations;
  }

  private calculateConfidence(chain: CausalChain): number {
    let confidence = 0.5;

    if (chain.nodes.length > 5) confidence += 0.1;
    if (chain.links.length > chain.nodes.length) confidence += 0.1;
    if (chain.links.every((l) => l.confidence > 0.6)) confidence += 0.15;

    return Math.min(0.9, confidence);
  }

  private generateBuildRecommendations(chain: CausalChain): string[] {
    const recommendations: string[] = [];

    if (chain.rootCauses.length === 0) {
      recommendations.push('Identify root causes for the causal chain');
    }

    if (chain.ultimateOutcomes.length === 0) {
      recommendations.push('Define ultimate outcomes for the causal chain');
    }

    if (chain.links.length < chain.nodes.length - 1) {
      recommendations.push('Add more causal links to complete the chain');
    }

    recommendations.push('Validate causal assumptions with data');

    return recommendations;
  }

  private generateVisualizationRecommendations(viz: CausalVisualization): string[] {
    const recommendations: string[] = [];

    if (viz.criticalFactors.length > 0) {
      recommendations.push(`Monitor ${viz.criticalFactors.length} critical factor(s)`);
    }

    if (viz.interventionPoints.length > 0) {
      recommendations.push(`Consider interventions at ${viz.interventionPoints.length} leverage point(s)`);
    }

    return recommendations;
  }
}

// Additional types for this engine
interface ImpactAnalysis {
  source: string;
  change: number;
  propagation: ImpactPropagation[];
  affectedNodes: AffectedNode[];
  timeline: TimelineEstimate;
  cascadeRisks: CascadeRisk[];
  recommendations: string[];
}

interface ImpactPropagation {
  targetNodeId: string;
  impact: number;
  lag: number;
  path: string[];
}

interface AffectedNode {
  nodeId: string;
  nodeName: string;
  totalImpact: number;
  impactDirection: 'positive' | 'negative';
  significance: 'high' | 'medium' | 'low';
}

interface TimelineEstimate {
  immediateImpact: boolean;
  fullPropagation: string;
  averageLag: string;
  phases: TimelinePhase[];
}

interface TimelinePhase {
  name: string;
  duration: string;
  affectedNodes: number;
  cumulativeImpact: number;
}

interface CascadeRisk {
  risk: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  affectedNodes: string[];
  mitigation: string;
}

interface InterventionConstraints {
  maxDifficulty?: number;
  budget?: number;
  timeline?: string;
}

interface OptimalIntervention {
  targetOutcome: string;
  candidates: EvaluatedCandidate[];
  optimalStrategy: OptimalStrategy;
  expectedImpact: string;
  implementationPlan: ImplementationStep[];
}

interface InterventionCandidate {
  nodeId: string;
  nodeName: string;
  pathStrength: number;
  difficulty: number;
  leverageRatio: number;
}

interface EvaluatedCandidate extends InterventionCandidate {
  expectedImpact: number;
  feasibility: number;
  risks: string[];
  overallScore: number;
}

interface OptimalStrategy {
  primaryIntervention: EvaluatedCandidate;
  supportingInterventions: EvaluatedCandidate[];
  combinedExpectedImpact: number;
  rationale: string;
}

interface ImplementationStep {
  phase: number;
  action: string;
  duration: string;
  expectedImpact: string;
}

interface ObservedData {
  nodeId: string;
  period: number;
  value: number;
}

interface ValidationResult {
  overallValidity: number;
  linkValidations: LinkValidation[];
  consistencyChecks: ConsistencyCheck[];
  anomalies: Anomaly[];
  recommendations: string[];
}

interface LinkValidation {
  linkId: string;
  isValid: boolean | null;
  observedStrength: number | null;
  reason: string;
}

interface ConsistencyCheck {
  check: string;
  passed: boolean;
  details: string;
}

interface Anomaly {
  nodeId: string;
  period: number;
  observedValue: number;
  expectedRange: string;
  severity: 'high' | 'medium';
}

export const causalChainEngine = new CausalChainEngine();
