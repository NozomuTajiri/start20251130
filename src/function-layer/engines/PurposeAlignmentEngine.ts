/**
 * Purpose Alignment Engine
 * 4.4 パーパス具現化エンジン
 */

import type {
  FunctionResult,
  Purpose,
  CoreValue,
  PurposeAlignment,
  AlignedInitiative,
  Misalignment,
} from '../types';

export interface PurposeInput {
  statement: string;
  values?: ValueInput[];
  vision?: string;
  mission?: string;
}

export interface ValueInput {
  name: string;
  description?: string;
  behaviors?: string[];
}

export interface InitiativeInput {
  name: string;
  description: string;
  objectives?: string[];
  activities?: string[];
}

export class PurposeAlignmentEngine {
  /**
   * Define organizational purpose
   */
  async definePurpose(input: PurposeInput): Promise<FunctionResult<Purpose>> {
    const startTime = Date.now();

    const values: CoreValue[] = (input.values || []).map((v) =>
      this.buildCoreValue(v)
    );

    const purpose: Purpose = {
      statement: input.statement,
      values: values.length > 0 ? values : this.suggestDefaultValues(input.statement),
      vision: input.vision || this.generateVision(input.statement),
      mission: input.mission || this.generateMission(input.statement),
    };

    return {
      data: purpose,
      confidence: this.calculatePurposeConfidence(purpose),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: this.generatePurposeRecommendations(purpose),
    };
  }

  /**
   * Assess purpose alignment
   */
  async assessAlignment(
    purpose: Purpose,
    initiatives: InitiativeInput[]
  ): Promise<FunctionResult<PurposeAlignment>> {
    const startTime = Date.now();

    const alignedInitiatives: AlignedInitiative[] = [];
    const misalignments: Misalignment[] = [];

    for (const initiative of initiatives) {
      const alignment = this.analyzeInitiativeAlignment(initiative, purpose);
      alignedInitiatives.push(alignment.initiative);

      if (alignment.misalignment) {
        misalignments.push(alignment.misalignment);
      }
    }

    const alignmentScore = this.calculateOverallAlignment(alignedInitiatives);

    const result: PurposeAlignment = {
      purpose,
      alignmentScore,
      alignedInitiatives,
      misalignments,
      recommendations: this.generateAlignmentRecommendations(
        alignmentScore,
        misalignments
      ),
    };

    return {
      data: result,
      confidence: 0.75,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      warnings: misalignments
        .filter((m) => m.severity === 'critical')
        .map((m) => m.description),
    };
  }

  /**
   * Cascade purpose through organization
   */
  async cascadePurpose(
    purpose: Purpose,
    organizationLevels: OrganizationLevel[]
  ): Promise<FunctionResult<PurposeCascade>> {
    const startTime = Date.now();

    const cascadedLevels: CascadedLevel[] = [];

    for (const level of organizationLevels) {
      const cascaded = this.cascadeToLevel(purpose, level);
      cascadedLevels.push(cascaded);
    }

    const cascade: PurposeCascade = {
      purpose,
      levels: cascadedLevels,
      alignmentMap: this.createAlignmentMap(cascadedLevels),
      gaps: this.identifyAlignmentGaps(cascadedLevels),
    };

    return {
      data: cascade,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
      recommendations: [
        'Ensure consistent messaging across all levels',
        'Provide level-specific examples and applications',
        'Create feedback loops to validate understanding',
      ],
    };
  }

  /**
   * Measure purpose activation
   */
  async measureActivation(
    purpose: Purpose,
    metrics: ActivationMetric[]
  ): Promise<FunctionResult<ActivationAssessment>> {
    const startTime = Date.now();

    const dimensions: ActivationDimension[] = [
      this.assessAwareness(metrics),
      this.assessUnderstanding(metrics),
      this.assessBelief(metrics),
      this.assessBehavior(metrics),
    ];

    const overallActivation = dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length;

    const assessment: ActivationAssessment = {
      purpose,
      overallActivation,
      dimensions,
      trends: this.analyzeTrends(metrics),
      recommendations: this.generateActivationRecommendations(dimensions),
    };

    return {
      data: assessment,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Generate purpose narratives
   */
  async generateNarratives(
    purpose: Purpose,
    audiences: Audience[]
  ): Promise<FunctionResult<PurposeNarratives>> {
    const startTime = Date.now();

    const narratives: AudienceNarrative[] = audiences.map((audience) =>
      this.createNarrativeForAudience(purpose, audience)
    );

    const result: PurposeNarratives = {
      purpose,
      narratives,
      coreMessage: this.extractCoreMessage(purpose),
      proofPoints: this.generateProofPoints(purpose),
    };

    return {
      data: result,
      confidence: 0.7,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  private buildCoreValue(input: ValueInput): CoreValue {
    return {
      name: input.name,
      description: input.description || `Commitment to ${input.name.toLowerCase()}`,
      behaviors: input.behaviors || this.suggestBehaviors(input.name),
      metrics: this.suggestValueMetrics(input.name),
    };
  }

  private suggestBehaviors(valueName: string): string[] {
    const behaviorMap: Record<string, string[]> = {
      integrity: [
        'Act honestly in all interactions',
        'Keep commitments',
        'Speak up about concerns',
      ],
      innovation: [
        'Challenge assumptions',
        'Experiment with new approaches',
        'Learn from failures',
      ],
      excellence: [
        'Set high standards',
        'Continuously improve',
        'Deliver quality work',
      ],
      collaboration: [
        'Share knowledge openly',
        'Support team members',
        'Seek diverse perspectives',
      ],
      customer: [
        'Understand customer needs',
        'Prioritize customer experience',
        'Act on customer feedback',
      ],
    };

    const lowerName = valueName.toLowerCase();
    for (const [key, behaviors] of Object.entries(behaviorMap)) {
      if (lowerName.includes(key)) {
        return behaviors;
      }
    }

    return [
      `Demonstrate ${valueName} in daily work`,
      `Champion ${valueName} in decisions`,
      `Hold others accountable for ${valueName}`,
    ];
  }

  private suggestValueMetrics(valueName: string): string[] {
    return [
      `${valueName} perception survey score`,
      `${valueName} behavior observations`,
      `${valueName} impact assessments`,
    ];
  }

  private suggestDefaultValues(_purposeStatement: string): CoreValue[] {
    const defaultValues = ['Integrity', 'Excellence', 'Innovation', 'Collaboration'];

    return defaultValues.map((name) => ({
      name,
      description: `Core commitment to ${name.toLowerCase()}`,
      behaviors: this.suggestBehaviors(name),
      metrics: this.suggestValueMetrics(name),
    }));
  }

  private generateVision(purposeStatement: string): string {
    return `To be recognized as the leading organization that ${purposeStatement.toLowerCase()}`;
  }

  private generateMission(purposeStatement: string): string {
    return `We deliver value by ${purposeStatement.toLowerCase()}, creating lasting impact for stakeholders`;
  }

  private analyzeInitiativeAlignment(
    initiative: InitiativeInput,
    purpose: Purpose
  ): { initiative: AlignedInitiative; misalignment?: Misalignment } {
    const connectedValues = this.findConnectedValues(initiative, purpose.values);
    const alignmentScore = this.calculateInitiativeAlignment(initiative, purpose);

    const alignedInitiative: AlignedInitiative = {
      name: initiative.name,
      alignmentScore,
      connectedValues: connectedValues.map((v) => v.name),
      contribution: this.describeContribution(initiative, purpose),
    };

    let misalignment: Misalignment | undefined;

    if (alignmentScore < 0.3) {
      misalignment = {
        area: initiative.name,
        description: `Initiative "${initiative.name}" shows low alignment with organizational purpose`,
        severity: alignmentScore < 0.1 ? 'critical' : 'significant',
        suggestedAction: 'Review initiative objectives and realign with purpose',
      };
    } else if (alignmentScore < 0.5) {
      misalignment = {
        area: initiative.name,
        description: `Initiative "${initiative.name}" has partial alignment gaps`,
        severity: 'minor',
        suggestedAction: 'Strengthen purpose connection in initiative activities',
      };
    }

    return { initiative: alignedInitiative, misalignment };
  }

  private findConnectedValues(
    initiative: InitiativeInput,
    values: CoreValue[]
  ): CoreValue[] {
    const initiativeText = `${initiative.name} ${initiative.description} ${(initiative.objectives || []).join(' ')}`.toLowerCase();

    return values.filter((value) => {
      const valueKeywords = [
        value.name.toLowerCase(),
        ...value.behaviors.map((b) => b.toLowerCase()),
      ];

      return valueKeywords.some((keyword) => initiativeText.includes(keyword));
    });
  }

  private calculateInitiativeAlignment(
    initiative: InitiativeInput,
    purpose: Purpose
  ): number {
    let score = 0;
    const initiativeText = `${initiative.name} ${initiative.description}`.toLowerCase();

    // Check alignment with purpose statement
    const purposeKeywords = purpose.statement.toLowerCase().split(' ').filter((w) => w.length > 4);
    const purposeMatch = purposeKeywords.filter((k) => initiativeText.includes(k)).length;
    score += Math.min(0.4, (purposeMatch / purposeKeywords.length) * 0.4);

    // Check alignment with values
    const connectedValues = this.findConnectedValues(initiative, purpose.values);
    score += (connectedValues.length / purpose.values.length) * 0.4;

    // Check alignment with vision/mission
    const visionKeywords = purpose.vision.toLowerCase().split(' ').filter((w) => w.length > 4);
    const visionMatch = visionKeywords.filter((k) => initiativeText.includes(k)).length;
    score += Math.min(0.2, (visionMatch / visionKeywords.length) * 0.2);

    return Math.min(1, score);
  }

  private describeContribution(initiative: InitiativeInput, purpose: Purpose): string {
    const connectedValues = this.findConnectedValues(initiative, purpose.values);

    if (connectedValues.length > 0) {
      return `Supports ${connectedValues.map((v) => v.name).join(', ')} through ${initiative.description.toLowerCase()}`;
    }

    return `Contributes to organizational objectives through ${initiative.description.toLowerCase()}`;
  }

  private calculateOverallAlignment(initiatives: AlignedInitiative[]): number {
    if (initiatives.length === 0) return 0;

    const totalScore = initiatives.reduce((acc, i) => acc + i.alignmentScore, 0);
    return totalScore / initiatives.length;
  }

  private generateAlignmentRecommendations(
    score: number,
    misalignments: Misalignment[]
  ): string[] {
    const recommendations: string[] = [];

    if (score < 0.5) {
      recommendations.push('Conduct comprehensive purpose alignment review');
      recommendations.push('Prioritize initiatives that directly support purpose');
    }

    const criticalMisalignments = misalignments.filter((m) => m.severity === 'critical');
    if (criticalMisalignments.length > 0) {
      recommendations.push(`Address ${criticalMisalignments.length} critical misalignments immediately`);
    }

    if (score >= 0.7) {
      recommendations.push('Maintain current alignment practices');
      recommendations.push('Share best practices across initiatives');
    }

    return recommendations;
  }

  private cascadeToLevel(purpose: Purpose, level: OrganizationLevel): CascadedLevel {
    return {
      level: level.name,
      localizedPurpose: this.localizePurpose(purpose, level),
      relevantValues: purpose.values.map((v) => ({
        value: v.name,
        localApplication: this.localizeValue(v, level),
      })),
      keyObjectives: this.generateLevelObjectives(purpose, level),
      successIndicators: this.defineLevelIndicators(level),
    };
  }

  private localizePurpose(purpose: Purpose, level: OrganizationLevel): string {
    return `As ${level.name}, we contribute to "${purpose.statement}" by ${level.contribution || 'executing our responsibilities with excellence'}`;
  }

  private localizeValue(value: CoreValue, level: OrganizationLevel): string {
    return `In ${level.name}, we demonstrate ${value.name} by ${value.behaviors[0]?.toLowerCase() || 'living our values daily'}`;
  }

  private generateLevelObjectives(purpose: Purpose, level: OrganizationLevel): string[] {
    return [
      `Understand and communicate ${purpose.statement}`,
      `Align ${level.name} activities with organizational purpose`,
      `Measure and improve purpose activation in ${level.name}`,
    ];
  }

  private defineLevelIndicators(level: OrganizationLevel): string[] {
    return [
      `${level.name} purpose awareness score`,
      `${level.name} values behavior index`,
      `${level.name} contribution to organizational objectives`,
    ];
  }

  private createAlignmentMap(levels: CascadedLevel[]): AlignmentMapItem[] {
    return levels.map((level, index) => ({
      level: level.level,
      alignmentScore: 0.8 - index * 0.05, // Assume slight decrease at lower levels
      gaps: [],
    }));
  }

  private identifyAlignmentGaps(levels: CascadedLevel[]): AlignmentGap[] {
    const gaps: AlignmentGap[] = [];

    for (let i = 0; i < levels.length - 1; i++) {
      // Check for potential gaps between levels
      if (levels[i + 1].keyObjectives.length < levels[i].keyObjectives.length) {
        gaps.push({
          fromLevel: levels[i].level,
          toLevel: levels[i + 1].level,
          description: 'Potential loss of purpose clarity at lower level',
          recommendation: 'Strengthen communication and training',
        });
      }
    }

    return gaps;
  }

  private assessAwareness(metrics: ActivationMetric[]): ActivationDimension {
    const awarenessMetrics = metrics.filter((m) => m.dimension === 'awareness');
    const score = this.calculateDimensionScore(awarenessMetrics);

    return {
      name: 'Awareness',
      description: 'Do people know the purpose?',
      score,
      indicators: awarenessMetrics.map((m) => ({
        name: m.name,
        value: m.value,
        target: m.target,
      })),
    };
  }

  private assessUnderstanding(metrics: ActivationMetric[]): ActivationDimension {
    const understandingMetrics = metrics.filter((m) => m.dimension === 'understanding');
    const score = this.calculateDimensionScore(understandingMetrics);

    return {
      name: 'Understanding',
      description: 'Do people understand what the purpose means?',
      score,
      indicators: understandingMetrics.map((m) => ({
        name: m.name,
        value: m.value,
        target: m.target,
      })),
    };
  }

  private assessBelief(metrics: ActivationMetric[]): ActivationDimension {
    const beliefMetrics = metrics.filter((m) => m.dimension === 'belief');
    const score = this.calculateDimensionScore(beliefMetrics);

    return {
      name: 'Belief',
      description: 'Do people believe in the purpose?',
      score,
      indicators: beliefMetrics.map((m) => ({
        name: m.name,
        value: m.value,
        target: m.target,
      })),
    };
  }

  private assessBehavior(metrics: ActivationMetric[]): ActivationDimension {
    const behaviorMetrics = metrics.filter((m) => m.dimension === 'behavior');
    const score = this.calculateDimensionScore(behaviorMetrics);

    return {
      name: 'Behavior',
      description: 'Do people act according to the purpose?',
      score,
      indicators: behaviorMetrics.map((m) => ({
        name: m.name,
        value: m.value,
        target: m.target,
      })),
    };
  }

  private calculateDimensionScore(metrics: ActivationMetric[]): number {
    if (metrics.length === 0) return 0.5;

    const scores = metrics.map((m) => (m.target > 0 ? m.value / m.target : 0.5));
    return Math.min(1, scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  private analyzeTrends(metrics: ActivationMetric[]): ActivationTrend[] {
    const dimensions = ['awareness', 'understanding', 'belief', 'behavior'];

    return dimensions.map((dim) => {
      const dimMetrics = metrics.filter((m) => m.dimension === dim);
      return {
        dimension: dim,
        trend: dimMetrics.length > 0 ? 'stable' : 'unknown',
        momentum: 0,
      };
    });
  }

  private generateActivationRecommendations(dimensions: ActivationDimension[]): string[] {
    const recommendations: string[] = [];

    for (const dim of dimensions) {
      if (dim.score < 0.5) {
        recommendations.push(`Focus on improving ${dim.name.toLowerCase()}: ${dim.description}`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain current activation efforts');
      recommendations.push('Consider expanding purpose activation to new areas');
    }

    return recommendations;
  }

  private createNarrativeForAudience(purpose: Purpose, audience: Audience): AudienceNarrative {
    return {
      audience: audience.name,
      headline: this.generateHeadline(purpose, audience),
      narrative: this.generateNarrative(purpose, audience),
      keyMessages: this.generateKeyMessages(purpose, audience),
      callToAction: this.generateCallToAction(audience),
    };
  }

  private generateHeadline(purpose: Purpose, audience: Audience): string {
    switch (audience.type) {
      case 'employee':
        return `Join us in ${purpose.statement}`;
      case 'customer':
        return `Experience the difference of ${purpose.statement}`;
      case 'investor':
        return `Invest in sustainable value: ${purpose.statement}`;
      case 'community':
        return `Together we can ${purpose.statement}`;
      default:
        return purpose.statement;
    }
  }

  private generateNarrative(purpose: Purpose, audience: Audience): string {
    const intro = `We exist to ${purpose.statement.toLowerCase()}.`;
    const values = `Our values of ${purpose.values.map((v) => v.name).join(', ')} guide everything we do.`;

    switch (audience.type) {
      case 'employee':
        return `${intro} ${values} As part of our team, you play a crucial role in bringing this purpose to life every day.`;
      case 'customer':
        return `${intro} ${values} This commitment shapes every interaction we have with you and every product we create.`;
      case 'investor':
        return `${intro} ${values} This purpose drives sustainable value creation and long-term growth.`;
      default:
        return `${intro} ${values}`;
    }
  }

  private generateKeyMessages(purpose: Purpose, _audience: Audience): string[] {
    return [
      `Our purpose: ${purpose.statement}`,
      `Our vision: ${purpose.vision}`,
      `Our values: ${purpose.values.map((v) => v.name).join(', ')}`,
    ];
  }

  private generateCallToAction(audience: Audience): string {
    switch (audience.type) {
      case 'employee':
        return 'Join us in living our purpose every day';
      case 'customer':
        return 'Experience our commitment to you';
      case 'investor':
        return 'Partner with us for sustainable growth';
      case 'community':
        return 'Let us make a difference together';
      default:
        return 'Learn more about our purpose';
    }
  }

  private extractCoreMessage(purpose: Purpose): string {
    return purpose.statement;
  }

  private generateProofPoints(purpose: Purpose): string[] {
    return [
      `Values-driven decision making based on ${purpose.values[0]?.name || 'our core values'}`,
      `Commitment to ${purpose.vision.toLowerCase()}`,
      `Daily actions aligned with ${purpose.mission.toLowerCase()}`,
    ];
  }

  private calculatePurposeConfidence(purpose: Purpose): number {
    let confidence = 0.5;

    if (purpose.statement.length > 20) confidence += 0.1;
    if (purpose.values.length >= 3) confidence += 0.15;
    if (purpose.vision) confidence += 0.1;
    if (purpose.mission) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  private generatePurposeRecommendations(purpose: Purpose): string[] {
    const recommendations: string[] = [];

    if (purpose.statement.length < 50) {
      recommendations.push('Consider making purpose statement more descriptive');
    }

    if (purpose.values.length < 4) {
      recommendations.push('Consider adding more core values for comprehensive guidance');
    }

    recommendations.push('Validate purpose with key stakeholders');
    recommendations.push('Create communication plan for purpose rollout');

    return recommendations;
  }
}

// Additional types for this engine
interface OrganizationLevel {
  name: string;
  contribution?: string;
}

interface PurposeCascade {
  purpose: Purpose;
  levels: CascadedLevel[];
  alignmentMap: AlignmentMapItem[];
  gaps: AlignmentGap[];
}

interface CascadedLevel {
  level: string;
  localizedPurpose: string;
  relevantValues: Array<{ value: string; localApplication: string }>;
  keyObjectives: string[];
  successIndicators: string[];
}

interface AlignmentMapItem {
  level: string;
  alignmentScore: number;
  gaps: string[];
}

interface AlignmentGap {
  fromLevel: string;
  toLevel: string;
  description: string;
  recommendation: string;
}

interface ActivationMetric {
  name: string;
  dimension: 'awareness' | 'understanding' | 'belief' | 'behavior';
  value: number;
  target: number;
}

interface ActivationAssessment {
  purpose: Purpose;
  overallActivation: number;
  dimensions: ActivationDimension[];
  trends: ActivationTrend[];
  recommendations: string[];
}

interface ActivationDimension {
  name: string;
  description: string;
  score: number;
  indicators: Array<{ name: string; value: number; target: number }>;
}

interface ActivationTrend {
  dimension: string;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  momentum: number;
}

interface Audience {
  name: string;
  type: 'employee' | 'customer' | 'investor' | 'community' | 'other';
}

interface PurposeNarratives {
  purpose: Purpose;
  narratives: AudienceNarrative[];
  coreMessage: string;
  proofPoints: string[];
}

interface AudienceNarrative {
  audience: string;
  headline: string;
  narrative: string;
  keyMessages: string[];
  callToAction: string;
}

export const purposeAlignmentEngine = new PurposeAlignmentEngine();
