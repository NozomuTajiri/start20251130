/**
 * Organizational Structure Engine
 * 4.2 組織構造最適化エンジン
 */

import type {
  FunctionResult,
  OrganizationalUnit,
  OrganizationalStructure,
  UnitRelationship,
  StructureOptimization,
  StructureChange,
  ImpactAssessment,
  ImplementationStep,
} from '../types';

export interface StructureInput {
  units: UnitData[];
  relationships?: RelationshipData[];
  context?: StructureContext;
}

export interface UnitData {
  id?: string;
  name: string;
  type?: 'division' | 'department' | 'team' | 'role';
  parentId?: string;
  responsibilities?: string[];
  headcount?: number;
  budget?: number;
}

export interface RelationshipData {
  fromId: string;
  toId: string;
  type?: 'reports-to' | 'collaborates-with' | 'supports' | 'depends-on';
}

export interface StructureContext {
  strategy: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  targetModel?: 'functional' | 'divisional' | 'matrix' | 'network' | 'agile';
}

export class OrganizationalStructureEngine {
  /**
   * Analyze current organizational structure
   */
  async analyze(input: StructureInput): Promise<FunctionResult<StructureAnalysis>> {
    const startTime = Date.now();

    const structure = this.buildStructure(input);
    const metrics = this.calculateMetrics(structure);
    const issues = this.identifyStructuralIssues(structure, metrics);
    const strengths = this.identifyStrengths(structure, metrics);

    const analysis: StructureAnalysis = {
      structure,
      metrics,
      issues,
      strengths,
      structureType: this.classifyStructure(structure),
    };

    return {
      data: analysis,
      confidence: this.calculateConfidence(structure),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generateRecommendations(analysis),
    };
  }

  /**
   * Optimize organizational structure
   */
  async optimize(
    currentStructure: OrganizationalStructure,
    context?: StructureContext
  ): Promise<FunctionResult<StructureOptimization>> {
    const startTime = Date.now();

    const targetModel = context?.targetModel || this.recommendModel(currentStructure, context);
    const recommendedStructure = this.generateOptimalStructure(
      currentStructure,
      targetModel,
      context
    );
    const changes = this.identifyChanges(currentStructure, recommendedStructure);
    const benefits = this.projectBenefits(changes, targetModel);
    const risks = this.assessRisks(changes);
    const implementationPlan = this.createImplementationPlan(changes);

    const optimization: StructureOptimization = {
      currentStructure,
      recommendedStructure,
      changes,
      benefits,
      risks,
      implementationPlan,
    };

    return {
      data: optimization,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: [
        `Transition to ${targetModel} structure`,
        'Implement changes in phases to minimize disruption',
        'Communicate changes clearly to all stakeholders',
      ],
      warnings: risks.filter((r) => r.includes('high')),
    };
  }

  /**
   * Simulate structure changes
   */
  async simulate(
    structure: OrganizationalStructure,
    changes: StructureChange[]
  ): Promise<FunctionResult<SimulationResult>> {
    const startTime = Date.now();

    const modifiedStructure = this.applyChanges(structure, changes);
    const beforeMetrics = this.calculateMetrics(structure);
    const afterMetrics = this.calculateMetrics(modifiedStructure);

    const impacts = this.calculateImpacts(beforeMetrics, afterMetrics);
    const feasibility = this.assessFeasibility(changes);

    const result: SimulationResult = {
      originalStructure: structure,
      modifiedStructure,
      beforeMetrics,
      afterMetrics,
      impacts,
      feasibility,
      recommendation: feasibility.score >= 0.6 ? 'proceed' : 'reconsider',
    };

    return {
      data: result,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Design team structure
   */
  async designTeams(
    requirements: TeamRequirements
  ): Promise<FunctionResult<TeamDesign>> {
    const startTime = Date.now();

    const teams = this.generateTeamStructure(requirements);
    const relationships = this.designTeamRelationships(teams, requirements);
    const roles = this.defineRoles(teams, requirements);

    const design: TeamDesign = {
      teams,
      relationships,
      roles,
      rationale: this.explainDesign(teams, requirements),
      scalabilityPlan: this.createScalabilityPlan(teams),
    };

    return {
      data: design,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: [
        'Start with minimum viable team sizes',
        'Establish clear interfaces between teams',
        'Build in flexibility for growth',
      ],
    };
  }

  private buildStructure(input: StructureInput): OrganizationalStructure {
    const units: OrganizationalUnit[] = input.units.map((u, i) => ({
      id: u.id || `unit-${i + 1}`,
      name: u.name,
      type: u.type || this.inferType(u),
      parentId: u.parentId,
      responsibilities: u.responsibilities || [],
      headcount: u.headcount || 0,
      budget: u.budget,
    }));

    const relationships: UnitRelationship[] = [];

    // Add hierarchical relationships from parentId
    for (const unit of units) {
      if (unit.parentId) {
        relationships.push({
          fromId: unit.id,
          toId: unit.parentId,
          type: 'reports-to',
          strength: 1,
        });
      }
    }

    // Add explicit relationships
    if (input.relationships) {
      for (const rel of input.relationships) {
        relationships.push({
          fromId: rel.fromId,
          toId: rel.toId,
          type: rel.type || 'collaborates-with',
          strength: 0.5,
        });
      }
    }

    return {
      units,
      relationships,
      hierarchyDepth: this.calculateHierarchyDepth(units),
      spanOfControl: this.calculateSpanOfControl(units),
      centralization: this.calculateCentralization(units, relationships),
    };
  }

  private inferType(unit: UnitData): 'division' | 'department' | 'team' | 'role' {
    if (unit.headcount && unit.headcount > 50) return 'division';
    if (unit.headcount && unit.headcount > 10) return 'department';
    if (unit.headcount && unit.headcount > 1) return 'team';
    return 'role';
  }

  private calculateHierarchyDepth(units: OrganizationalUnit[]): number {
    let maxDepth = 0;

    for (const unit of units) {
      let depth = 0;
      let current = unit;

      while (current.parentId) {
        depth++;
        current = units.find((u) => u.id === current.parentId) || current;
        if (!units.find((u) => u.id === current.parentId)) break;
      }

      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth + 1;
  }

  private calculateSpanOfControl(units: OrganizationalUnit[]): number {
    const childCounts = new Map<string, number>();

    for (const unit of units) {
      if (unit.parentId) {
        childCounts.set(unit.parentId, (childCounts.get(unit.parentId) || 0) + 1);
      }
    }

    if (childCounts.size === 0) return 0;

    const totalChildren = Array.from(childCounts.values()).reduce((a, b) => a + b, 0);
    return totalChildren / childCounts.size;
  }

  private calculateCentralization(
    units: OrganizationalUnit[],
    relationships: UnitRelationship[]
  ): number {
    const topLevelUnits = units.filter((u) => !u.parentId);
    const totalUnits = units.length;

    if (totalUnits <= 1) return 1;

    // More top-level units = more decentralized
    const hierarchyFactor = topLevelUnits.length / totalUnits;

    // More cross-unit relationships = more decentralized
    const collaborationCount = relationships.filter(
      (r) => r.type === 'collaborates-with'
    ).length;
    const relationshipFactor = Math.min(1, collaborationCount / totalUnits);

    return 1 - (hierarchyFactor + relationshipFactor) / 2;
  }

  private calculateMetrics(structure: OrganizationalStructure): StructureMetrics {
    const totalHeadcount = structure.units.reduce((acc, u) => acc + u.headcount, 0);
    const teamCount = structure.units.filter((u) => u.type === 'team').length;

    return {
      hierarchyDepth: structure.hierarchyDepth,
      spanOfControl: structure.spanOfControl,
      centralization: structure.centralization,
      totalHeadcount,
      teamCount,
      managerRatio: this.calculateManagerRatio(structure),
      communicationComplexity: this.calculateCommunicationComplexity(structure),
      decisionSpeed: this.estimateDecisionSpeed(structure),
    };
  }

  private calculateManagerRatio(structure: OrganizationalStructure): number {
    const managers = structure.units.filter(
      (u) => structure.units.some((child) => child.parentId === u.id)
    ).length;
    const total = structure.units.length;

    return total > 0 ? managers / total : 0;
  }

  private calculateCommunicationComplexity(structure: OrganizationalStructure): number {
    // Based on relationship count and hierarchy depth
    const n = structure.units.length;
    const r = structure.relationships.length;

    // Communication paths grow exponentially
    return Math.min(1, (r + n * structure.hierarchyDepth) / (n * n));
  }

  private estimateDecisionSpeed(structure: OrganizationalStructure): number {
    // Lower hierarchy and centralization = faster decisions
    const hierarchyPenalty = structure.hierarchyDepth / 10;
    const centralizationBonus = structure.centralization * 0.3;

    return Math.max(0.1, 1 - hierarchyPenalty + centralizationBonus);
  }

  private identifyStructuralIssues(
    structure: OrganizationalStructure,
    metrics: StructureMetrics
  ): StructuralIssue[] {
    const issues: StructuralIssue[] = [];

    if (metrics.hierarchyDepth > 5) {
      issues.push({
        type: 'deep-hierarchy',
        description: 'Organization has too many management layers',
        severity: 'high',
        affectedUnits: [],
        suggestion: 'Consider flattening the organization',
      });
    }

    if (metrics.spanOfControl > 10) {
      issues.push({
        type: 'wide-span',
        description: 'Managers have too many direct reports',
        severity: 'medium',
        affectedUnits: this.findWideSpanManagers(structure),
        suggestion: 'Add middle management or create sub-teams',
      });
    }

    if (metrics.spanOfControl < 3) {
      issues.push({
        type: 'narrow-span',
        description: 'Managers have too few direct reports',
        severity: 'medium',
        affectedUnits: this.findNarrowSpanManagers(structure),
        suggestion: 'Consider consolidating management roles',
      });
    }

    if (metrics.communicationComplexity > 0.7) {
      issues.push({
        type: 'communication-complexity',
        description: 'High communication overhead between units',
        severity: 'medium',
        affectedUnits: [],
        suggestion: 'Simplify reporting relationships',
      });
    }

    return issues;
  }

  private findWideSpanManagers(structure: OrganizationalStructure): string[] {
    const childCounts = new Map<string, number>();

    for (const unit of structure.units) {
      if (unit.parentId) {
        childCounts.set(unit.parentId, (childCounts.get(unit.parentId) || 0) + 1);
      }
    }

    return Array.from(childCounts.entries())
      .filter(([_, count]) => count > 10)
      .map(([id]) => id);
  }

  private findNarrowSpanManagers(structure: OrganizationalStructure): string[] {
    const childCounts = new Map<string, number>();

    for (const unit of structure.units) {
      if (unit.parentId) {
        childCounts.set(unit.parentId, (childCounts.get(unit.parentId) || 0) + 1);
      }
    }

    return Array.from(childCounts.entries())
      .filter(([_, count]) => count < 3)
      .map(([id]) => id);
  }

  private identifyStrengths(
    structure: OrganizationalStructure,
    metrics: StructureMetrics
  ): string[] {
    const strengths: string[] = [];

    if (metrics.hierarchyDepth <= 4) {
      strengths.push('Flat organizational structure enables fast decision making');
    }

    if (metrics.spanOfControl >= 4 && metrics.spanOfControl <= 8) {
      strengths.push('Optimal span of control for effective management');
    }

    if (structure.relationships.filter((r) => r.type === 'collaborates-with').length > 0) {
      strengths.push('Cross-functional collaboration relationships exist');
    }

    return strengths;
  }

  private classifyStructure(
    structure: OrganizationalStructure
  ): 'functional' | 'divisional' | 'matrix' | 'network' | 'flat' {
    const crossRelationships = structure.relationships.filter(
      (r) => r.type === 'collaborates-with'
    ).length;

    if (structure.hierarchyDepth <= 2) return 'flat';
    if (crossRelationships > structure.units.length / 2) return 'matrix';

    const divisions = structure.units.filter((u) => u.type === 'division');
    if (divisions.length > 2) return 'divisional';

    return 'functional';
  }

  private recommendModel(
    structure: OrganizationalStructure,
    context?: StructureContext
  ): 'functional' | 'divisional' | 'matrix' | 'network' | 'agile' {
    if (context?.targetModel) return context.targetModel;

    const size = context?.size || 'medium';

    if (size === 'small') return 'functional';
    if (size === 'enterprise') return 'divisional';

    if (structure.relationships.filter((r) => r.type === 'collaborates-with').length > 5) {
      return 'matrix';
    }

    return 'functional';
  }

  private generateOptimalStructure(
    current: OrganizationalStructure,
    targetModel: string,
    _context?: StructureContext
  ): OrganizationalStructure {
    const units = [...current.units];
    const relationships = [...current.relationships];

    switch (targetModel) {
      case 'flat':
        // Remove middle management
        return this.flattenStructure(units, relationships);

      case 'matrix':
        // Add cross-functional relationships
        return this.addMatrixRelationships(units, relationships);

      case 'agile':
        // Create squads and tribes
        return this.createAgileStructure(units, relationships);

      default:
        return current;
    }
  }

  private flattenStructure(
    units: OrganizationalUnit[],
    relationships: UnitRelationship[]
  ): OrganizationalStructure {
    // Remove units with single child
    const childCounts = new Map<string, number>();
    for (const unit of units) {
      if (unit.parentId) {
        childCounts.set(unit.parentId, (childCounts.get(unit.parentId) || 0) + 1);
      }
    }

    const singleChildParents = Array.from(childCounts.entries())
      .filter(([_, count]) => count === 1)
      .map(([id]) => id);

    const filteredUnits = units.filter((u) => !singleChildParents.includes(u.id));
    const filteredRelationships = relationships.filter(
      (r) =>
        !singleChildParents.includes(r.fromId) &&
        !singleChildParents.includes(r.toId)
    );

    return {
      units: filteredUnits,
      relationships: filteredRelationships,
      hierarchyDepth: this.calculateHierarchyDepth(filteredUnits),
      spanOfControl: this.calculateSpanOfControl(filteredUnits),
      centralization: this.calculateCentralization(filteredUnits, filteredRelationships),
    };
  }

  private addMatrixRelationships(
    units: OrganizationalUnit[],
    relationships: UnitRelationship[]
  ): OrganizationalStructure {
    const newRelationships = [...relationships];
    const departments = units.filter((u) => u.type === 'department');

    // Add collaboration relationships between departments
    for (let i = 0; i < departments.length; i++) {
      for (let j = i + 1; j < departments.length; j++) {
        newRelationships.push({
          fromId: departments[i].id,
          toId: departments[j].id,
          type: 'collaborates-with',
          strength: 0.5,
        });
      }
    }

    return {
      units,
      relationships: newRelationships,
      hierarchyDepth: this.calculateHierarchyDepth(units),
      spanOfControl: this.calculateSpanOfControl(units),
      centralization: this.calculateCentralization(units, newRelationships),
    };
  }

  private createAgileStructure(
    units: OrganizationalUnit[],
    relationships: UnitRelationship[]
  ): OrganizationalStructure {
    // Convert teams to squads with cross-functional composition
    const modifiedUnits = units.map((u) => {
      if (u.type === 'team') {
        return { ...u, name: `Squad: ${u.name}` };
      }
      if (u.type === 'department') {
        return { ...u, name: `Tribe: ${u.name}` };
      }
      return u;
    });

    return {
      units: modifiedUnits,
      relationships,
      hierarchyDepth: this.calculateHierarchyDepth(modifiedUnits),
      spanOfControl: this.calculateSpanOfControl(modifiedUnits),
      centralization: this.calculateCentralization(modifiedUnits, relationships),
    };
  }

  private identifyChanges(
    current: OrganizationalStructure,
    recommended: OrganizationalStructure
  ): StructureChange[] {
    const changes: StructureChange[] = [];

    // Find removed units
    for (const unit of current.units) {
      if (!recommended.units.find((u) => u.id === unit.id)) {
        changes.push({
          type: 'eliminate',
          targetUnit: unit.name,
          description: `Remove ${unit.name}`,
          rationale: 'Simplify organizational structure',
          impact: this.assessChangeImpact(unit),
        });
      }
    }

    // Find new units
    for (const unit of recommended.units) {
      if (!current.units.find((u) => u.id === unit.id)) {
        changes.push({
          type: 'create',
          targetUnit: unit.name,
          description: `Create ${unit.name}`,
          rationale: 'Support new organizational model',
          impact: this.assessChangeImpact(unit),
        });
      }
    }

    // Find new relationships
    for (const rel of recommended.relationships) {
      const exists = current.relationships.find(
        (r) => r.fromId === rel.fromId && r.toId === rel.toId
      );
      if (!exists) {
        changes.push({
          type: 'create',
          targetUnit: `${rel.fromId}-${rel.toId}`,
          description: `Create ${rel.type} relationship`,
          rationale: 'Improve collaboration',
          impact: {
            scope: 'department',
            affectedPeople: 0,
            costImpact: 'Minimal',
            timelineImpact: 'None',
            riskLevel: 'low',
          },
        });
      }
    }

    return changes;
  }

  private assessChangeImpact(unit: OrganizationalUnit): ImpactAssessment {
    return {
      scope: unit.type === 'division' ? 'organization' : unit.type === 'department' ? 'division' : 'department',
      affectedPeople: unit.headcount,
      costImpact: unit.headcount > 20 ? 'Significant' : 'Moderate',
      timelineImpact: unit.headcount > 20 ? '6+ months' : '3-6 months',
      riskLevel: unit.headcount > 50 ? 'high' : unit.headcount > 10 ? 'medium' : 'low',
    };
  }

  private projectBenefits(changes: StructureChange[], model: string): string[] {
    const benefits: string[] = [];

    if (changes.some((c) => c.type === 'eliminate')) {
      benefits.push('Reduced organizational complexity');
      benefits.push('Faster decision making');
    }

    if (model === 'matrix') {
      benefits.push('Improved cross-functional collaboration');
      benefits.push('Better resource utilization');
    }

    if (model === 'agile') {
      benefits.push('Increased autonomy and ownership');
      benefits.push('Faster delivery cycles');
    }

    benefits.push('Improved alignment with strategic objectives');

    return benefits;
  }

  private assessRisks(changes: StructureChange[]): string[] {
    const risks: string[] = [];

    const highImpactChanges = changes.filter((c) => c.impact.riskLevel === 'high');
    if (highImpactChanges.length > 0) {
      risks.push(`${highImpactChanges.length} high-risk changes requiring careful management`);
    }

    const totalAffected = changes.reduce((acc, c) => acc + c.impact.affectedPeople, 0);
    if (totalAffected > 100) {
      risks.push('Large number of affected employees may cause disruption');
    }

    risks.push('Potential resistance to organizational changes');
    risks.push('Temporary productivity decrease during transition');

    return risks;
  }

  private createImplementationPlan(changes: StructureChange[]): ImplementationStep[] {
    const steps: ImplementationStep[] = [];

    steps.push({
      phase: 1,
      name: 'Communication',
      description: 'Announce and explain organizational changes',
      duration: '2 weeks',
      dependencies: [],
      milestones: ['All employees informed', 'FAQ published'],
    });

    steps.push({
      phase: 2,
      name: 'Preparation',
      description: 'Prepare systems, processes, and documentation',
      duration: '4 weeks',
      dependencies: [1],
      milestones: ['Systems updated', 'New processes documented'],
    });

    const eliminationChanges = changes.filter((c) => c.type === 'eliminate');
    if (eliminationChanges.length > 0) {
      steps.push({
        phase: 3,
        name: 'Restructuring',
        description: 'Execute structural changes',
        duration: '8 weeks',
        dependencies: [2],
        milestones: eliminationChanges.map((c) => `${c.targetUnit} restructured`),
      });
    }

    steps.push({
      phase: steps.length + 1,
      name: 'Stabilization',
      description: 'Monitor and adjust new structure',
      duration: '12 weeks',
      dependencies: [steps.length],
      milestones: ['Performance metrics stable', 'Issues resolved'],
    });

    return steps;
  }

  private applyChanges(
    structure: OrganizationalStructure,
    changes: StructureChange[]
  ): OrganizationalStructure {
    let units = [...structure.units];
    const relationships = [...structure.relationships];

    for (const change of changes) {
      switch (change.type) {
        case 'eliminate':
          units = units.filter((u) => u.name !== change.targetUnit);
          break;
        case 'create':
          if (!change.targetUnit.includes('-')) {
            units.push({
              id: `new-${units.length + 1}`,
              name: change.targetUnit,
              type: 'team',
              responsibilities: [],
              headcount: 0,
            });
          }
          break;
      }
    }

    return {
      units,
      relationships,
      hierarchyDepth: this.calculateHierarchyDepth(units),
      spanOfControl: this.calculateSpanOfControl(units),
      centralization: this.calculateCentralization(units, relationships),
    };
  }

  private calculateImpacts(
    before: StructureMetrics,
    after: StructureMetrics
  ): SimulationImpact[] {
    const impacts: SimulationImpact[] = [];

    if (after.hierarchyDepth !== before.hierarchyDepth) {
      impacts.push({
        metric: 'Hierarchy Depth',
        before: before.hierarchyDepth,
        after: after.hierarchyDepth,
        change: after.hierarchyDepth - before.hierarchyDepth,
        interpretation:
          after.hierarchyDepth < before.hierarchyDepth
            ? 'Flatter organization'
            : 'Deeper hierarchy',
      });
    }

    if (Math.abs(after.decisionSpeed - before.decisionSpeed) > 0.05) {
      impacts.push({
        metric: 'Decision Speed',
        before: before.decisionSpeed,
        after: after.decisionSpeed,
        change: after.decisionSpeed - before.decisionSpeed,
        interpretation:
          after.decisionSpeed > before.decisionSpeed ? 'Faster decisions' : 'Slower decisions',
      });
    }

    return impacts;
  }

  private assessFeasibility(changes: StructureChange[]): FeasibilityAssessment {
    const highRiskCount = changes.filter((c) => c.impact.riskLevel === 'high').length;
    const totalChanges = changes.length;

    let score = 1;
    score -= highRiskCount * 0.2;
    score -= totalChanges * 0.05;

    return {
      score: Math.max(0.1, score),
      factors: [
        `${highRiskCount} high-risk changes`,
        `${totalChanges} total changes required`,
      ],
      recommendations:
        score < 0.6
          ? ['Consider phasing changes', 'Address high-risk items first']
          : ['Proceed with implementation'],
    };
  }

  private generateTeamStructure(requirements: TeamRequirements): Team[] {
    const teams: Team[] = [];
    const teamSize = requirements.preferredTeamSize || 7;

    for (const capability of requirements.capabilities) {
      teams.push({
        id: `team-${teams.length + 1}`,
        name: `${capability} Team`,
        purpose: `Deliver ${capability} capabilities`,
        size: teamSize,
        skills: requirements.requiredSkills?.filter((s) =>
          s.toLowerCase().includes(capability.toLowerCase())
        ) || [],
      });
    }

    return teams;
  }

  private designTeamRelationships(teams: Team[], _requirements: TeamRequirements): TeamRelationship[] {
    const relationships: TeamRelationship[] = [];

    // Create collaboration relationships between all teams
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        relationships.push({
          fromTeam: teams[i].id,
          toTeam: teams[j].id,
          type: 'collaborates',
          frequency: 'weekly',
        });
      }
    }

    return relationships;
  }

  private defineRoles(teams: Team[], requirements: TeamRequirements): TeamRole[] {
    const roles: TeamRole[] = [];

    for (const team of teams) {
      roles.push({
        teamId: team.id,
        name: 'Team Lead',
        responsibilities: ['Team coordination', 'Stakeholder communication', 'Delivery'],
        count: 1,
      });

      if (requirements.requiredSkills) {
        for (const skill of team.skills) {
          roles.push({
            teamId: team.id,
            name: `${skill} Specialist`,
            responsibilities: [`${skill} expertise`, 'Knowledge sharing'],
            count: Math.ceil(team.size / 3),
          });
        }
      }
    }

    return roles;
  }

  private explainDesign(teams: Team[], requirements: TeamRequirements): string {
    return `Designed ${teams.length} teams to deliver ${requirements.capabilities.join(', ')} capabilities. Each team follows the ${requirements.teamModel || 'cross-functional'} model with ${requirements.preferredTeamSize || 7} members.`;
  }

  private createScalabilityPlan(teams: Team[]): ScalabilityPlan {
    return {
      triggerPoints: [
        { teamSize: 10, action: 'Split into two teams' },
        { teamSize: 15, action: 'Create sub-teams with leads' },
      ],
      growthStrategy: 'Maintain team size of 5-9, add new teams for new capabilities',
      currentCapacity: teams.length * 9,
      maxCapacity: teams.length * 15,
    };
  }

  private calculateConfidence(structure: OrganizationalStructure): number {
    let confidence = 0.5;

    if (structure.units.length > 5) confidence += 0.1;
    if (structure.units.every((u) => u.responsibilities.length > 0)) confidence += 0.15;
    if (structure.units.every((u) => u.headcount > 0)) confidence += 0.15;

    return Math.min(0.95, confidence);
  }

  private generateRecommendations(analysis: StructureAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.issues.length > 0) {
      recommendations.push(`Address ${analysis.issues.length} structural issues`);
    }

    if (analysis.metrics.hierarchyDepth > 4) {
      recommendations.push('Consider flattening the organization');
    }

    if (analysis.metrics.managerRatio > 0.3) {
      recommendations.push('Review management overhead');
    }

    return recommendations;
  }
}

// Additional types for this engine
interface StructureAnalysis {
  structure: OrganizationalStructure;
  metrics: StructureMetrics;
  issues: StructuralIssue[];
  strengths: string[];
  structureType: 'functional' | 'divisional' | 'matrix' | 'network' | 'flat';
}

interface StructureMetrics {
  hierarchyDepth: number;
  spanOfControl: number;
  centralization: number;
  totalHeadcount: number;
  teamCount: number;
  managerRatio: number;
  communicationComplexity: number;
  decisionSpeed: number;
}

interface StructuralIssue {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  affectedUnits: string[];
  suggestion: string;
}

interface SimulationResult {
  originalStructure: OrganizationalStructure;
  modifiedStructure: OrganizationalStructure;
  beforeMetrics: StructureMetrics;
  afterMetrics: StructureMetrics;
  impacts: SimulationImpact[];
  feasibility: FeasibilityAssessment;
  recommendation: 'proceed' | 'reconsider';
}

interface SimulationImpact {
  metric: string;
  before: number;
  after: number;
  change: number;
  interpretation: string;
}

interface FeasibilityAssessment {
  score: number;
  factors: string[];
  recommendations: string[];
}

interface TeamRequirements {
  capabilities: string[];
  requiredSkills?: string[];
  teamModel?: 'cross-functional' | 'specialized' | 'hybrid';
  preferredTeamSize?: number;
}

interface TeamDesign {
  teams: Team[];
  relationships: TeamRelationship[];
  roles: TeamRole[];
  rationale: string;
  scalabilityPlan: ScalabilityPlan;
}

interface Team {
  id: string;
  name: string;
  purpose: string;
  size: number;
  skills: string[];
}

interface TeamRelationship {
  fromTeam: string;
  toTeam: string;
  type: 'collaborates' | 'depends-on' | 'supports';
  frequency: string;
}

interface TeamRole {
  teamId: string;
  name: string;
  responsibilities: string[];
  count: number;
}

interface ScalabilityPlan {
  triggerPoints: Array<{ teamSize: number; action: string }>;
  growthStrategy: string;
  currentCapacity: number;
  maxCapacity: number;
}

export const organizationalStructureEngine = new OrganizationalStructureEngine();
