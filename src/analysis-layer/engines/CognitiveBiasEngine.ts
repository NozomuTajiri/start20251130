/**
 * Cognitive Bias Detection Engine
 * 3.7 認知バイアス検出エンジン
 */

import type {
  BiasType,
  BiasIndicator,
  DetectedBias,
  BiasAnalysis,
  AnalysisResult,
  ImpactLevel,
} from '../types';

export interface BiasDetectionOptions {
  sensitivityLevel?: 'low' | 'medium' | 'high';
  includeMitigations?: boolean;
  generateAlternatives?: boolean;
}

interface BiasDefinition {
  type: BiasType;
  name: string;
  description: string;
  indicators: Array<{
    pattern: RegExp;
    indicatorType: string;
    weight: number;
  }>;
  mitigation: string;
  severity: ImpactLevel;
}

export class CognitiveBiasEngine {
  private biasDefinitions: BiasDefinition[];

  constructor() {
    this.biasDefinitions = this.initializeBiasDefinitions();
  }

  /**
   * Initialize bias definitions with detection patterns
   */
  private initializeBiasDefinitions(): BiasDefinition[] {
    return [
      {
        type: 'CONFIRMATION_BIAS',
        name: 'Confirmation Bias',
        description: 'Tendency to search for, interpret, and recall information that confirms pre-existing beliefs',
        indicators: [
          { pattern: /やはり|as expected|予想通り|thought so/i, indicatorType: 'confirmation_language', weight: 0.7 },
          { pattern: /明らかに|obviously|clearly|当然/i, indicatorType: 'certainty_language', weight: 0.5 },
          { pattern: /必ず|always|never|絶対/i, indicatorType: 'absolute_language', weight: 0.6 },
          { pattern: /証明|proves|confirms|裏付け/i, indicatorType: 'selective_evidence', weight: 0.6 },
        ],
        mitigation: 'Actively seek disconfirming evidence. Ask "What would prove this wrong?"',
        severity: 'HIGH',
      },
      {
        type: 'ANCHORING_BIAS',
        name: 'Anchoring Bias',
        description: 'Over-reliance on the first piece of information encountered',
        indicators: [
          { pattern: /最初に|first|initially|元々/i, indicatorType: 'anchor_reference', weight: 0.6 },
          { pattern: /基準|benchmark|standard|ベースライン/i, indicatorType: 'baseline_reference', weight: 0.5 },
          { pattern: /当初|original|initial|初期/i, indicatorType: 'initial_value', weight: 0.5 },
          { pattern: /\d+%.*から|starting from \d+/i, indicatorType: 'numerical_anchor', weight: 0.7 },
        ],
        mitigation: 'Consider multiple starting points. Generate estimates independently before comparing.',
        severity: 'MEDIUM',
      },
      {
        type: 'AVAILABILITY_HEURISTIC',
        name: 'Availability Heuristic',
        description: 'Overweighting information that comes to mind easily',
        indicators: [
          { pattern: /最近|recently|lately|この前/i, indicatorType: 'recency', weight: 0.6 },
          { pattern: /よく聞く|often hear|frequently|頻繁に/i, indicatorType: 'frequency_illusion', weight: 0.6 },
          { pattern: /印象的|memorable|striking|衝撃的/i, indicatorType: 'vividness', weight: 0.5 },
          { pattern: /ニュースで|in the news|話題/i, indicatorType: 'media_influence', weight: 0.5 },
        ],
        mitigation: 'Look at base rates and statistical data instead of relying on examples that come to mind.',
        severity: 'MEDIUM',
      },
      {
        type: 'OVERCONFIDENCE',
        name: 'Overconfidence Bias',
        description: 'Excessive confidence in own answers, judgments, and abilities',
        indicators: [
          { pattern: /確実に|certainly|definitely|間違いなく/i, indicatorType: 'certainty_claim', weight: 0.7 },
          { pattern: /100%|絶対に|guaranteed|必ず成功/i, indicatorType: 'extreme_confidence', weight: 0.8 },
          { pattern: /簡単|easy|no problem|問題ない/i, indicatorType: 'underestimation', weight: 0.5 },
          { pattern: /分かっている|I know|理解している/i, indicatorType: 'knowledge_claim', weight: 0.4 },
        ],
        mitigation: 'Consider reasons why you might be wrong. Assign probability ranges instead of point estimates.',
        severity: 'HIGH',
      },
      {
        type: 'SUNK_COST_FALLACY',
        name: 'Sunk Cost Fallacy',
        description: 'Continuing a behavior because of previously invested resources',
        indicators: [
          { pattern: /もう.*投資|already invested|既に費やした/i, indicatorType: 'past_investment', weight: 0.8 },
          { pattern: /ここまで来た|come this far|せっかく/i, indicatorType: 'progress_attachment', weight: 0.7 },
          { pattern: /やめるのはもったいない|waste to stop|無駄になる/i, indicatorType: 'loss_language', weight: 0.8 },
          { pattern: /引き返せない|can't turn back|後戻りできない/i, indicatorType: 'commitment_trap', weight: 0.7 },
        ],
        mitigation: 'Focus on future costs and benefits only. Ask "If I started fresh today, would I make this choice?"',
        severity: 'HIGH',
      },
      {
        type: 'BANDWAGON_EFFECT',
        name: 'Bandwagon Effect',
        description: 'Tendency to do or believe things because many others do',
        indicators: [
          { pattern: /みんな|everyone|everybody|皆/i, indicatorType: 'group_reference', weight: 0.6 },
          { pattern: /人気|popular|trending|流行/i, indicatorType: 'popularity', weight: 0.5 },
          { pattern: /業界標準|industry standard|一般的/i, indicatorType: 'norm_reference', weight: 0.5 },
          { pattern: /多くの|many|most|大多数/i, indicatorType: 'majority_reference', weight: 0.5 },
        ],
        mitigation: 'Evaluate the idea on its own merits. Consider that popular views can be wrong.',
        severity: 'MEDIUM',
      },
      {
        type: 'HINDSIGHT_BIAS',
        name: 'Hindsight Bias',
        description: 'Tendency to see past events as having been predictable',
        indicators: [
          { pattern: /分かっていた|knew it|I told you|言った通り/i, indicatorType: 'retrospective_claim', weight: 0.8 },
          { pattern: /予測できた|predictable|could have seen|見えていた/i, indicatorType: 'predictability_claim', weight: 0.7 },
          { pattern: /当然の結果|obvious outcome|inevitable|必然的/i, indicatorType: 'inevitability', weight: 0.6 },
          { pattern: /振り返ると|in hindsight|looking back/i, indicatorType: 'retrospective_language', weight: 0.5 },
        ],
        mitigation: 'Record predictions before outcomes are known. Remember that events are easier to explain than predict.',
        severity: 'LOW',
      },
      {
        type: 'SELECTION_BIAS',
        name: 'Selection Bias',
        description: 'Sample is not representative of the population',
        indicators: [
          { pattern: /成功した.*だけ|only.*successful|成功例のみ/i, indicatorType: 'success_only', weight: 0.7 },
          { pattern: /うまくいった|cases that worked|成功したケース/i, indicatorType: 'positive_selection', weight: 0.6 },
          { pattern: /選んだ|selected|chosen|抽出した/i, indicatorType: 'selection_language', weight: 0.4 },
          { pattern: /サンプル|sample|例として/i, indicatorType: 'sample_mention', weight: 0.3 },
        ],
        mitigation: 'Consider the full population. Ask about failures and negative cases.',
        severity: 'HIGH',
      },
      {
        type: 'SURVIVORSHIP_BIAS',
        name: 'Survivorship Bias',
        description: 'Focusing on successes while overlooking failures',
        indicators: [
          { pattern: /成功者|successful people|winners|勝者/i, indicatorType: 'success_focus', weight: 0.7 },
          { pattern: /成功の秘訣|secret to success|成功法則/i, indicatorType: 'success_recipe', weight: 0.6 },
          { pattern: /生き残った|survived|still around|残っている/i, indicatorType: 'survival_language', weight: 0.5 },
          { pattern: /トップ|top|best|一流/i, indicatorType: 'elite_focus', weight: 0.4 },
        ],
        mitigation: 'Study failures as well as successes. Consider what happened to those who tried and failed.',
        severity: 'MEDIUM',
      },
      {
        type: 'GROUPTHINK',
        name: 'Groupthink',
        description: 'Desire for conformity leads to irrational decisions',
        indicators: [
          { pattern: /全員一致|unanimous|everyone agrees|皆同意/i, indicatorType: 'unanimity', weight: 0.7 },
          { pattern: /反対意見.*ない|no objections|異論なし/i, indicatorType: 'lack_of_dissent', weight: 0.7 },
          { pattern: /チームの総意|team consensus|合意/i, indicatorType: 'consensus_language', weight: 0.5 },
          { pattern: /空気を読む|read the room|雰囲気/i, indicatorType: 'conformity_pressure', weight: 0.6 },
        ],
        mitigation: 'Explicitly encourage dissenting views. Assign a devil\'s advocate role.',
        severity: 'CRITICAL',
      },
      {
        type: 'STATUS_QUO_BIAS',
        name: 'Status Quo Bias',
        description: 'Preference for the current state of affairs',
        indicators: [
          { pattern: /従来通り|as usual|traditional|今まで通り/i, indicatorType: 'tradition', weight: 0.6 },
          { pattern: /変える必要.*ない|no need to change|変更不要/i, indicatorType: 'change_resistance', weight: 0.7 },
          { pattern: /うまくいっている|working fine|問題ない/i, indicatorType: 'satisfaction', weight: 0.5 },
          { pattern: /リスクが高い.*変更|risky to change|変更はリスク/i, indicatorType: 'change_risk', weight: 0.6 },
        ],
        mitigation: 'Explicitly evaluate alternatives. Consider the cost of inaction.',
        severity: 'MEDIUM',
      },
      {
        type: 'FRAMING_EFFECT',
        name: 'Framing Effect',
        description: 'Drawing different conclusions based on how information is presented',
        indicators: [
          { pattern: /90%成功|90% success|9割成功/i, indicatorType: 'positive_frame', weight: 0.5 },
          { pattern: /10%失敗|10% failure|1割失敗/i, indicatorType: 'negative_frame', weight: 0.5 },
          { pattern: /損失|loss|失う|損する/i, indicatorType: 'loss_frame', weight: 0.5 },
          { pattern: /利益|gain|得る|得する/i, indicatorType: 'gain_frame', weight: 0.5 },
        ],
        mitigation: 'Reframe the problem in multiple ways. Consider both gains and losses explicitly.',
        severity: 'MEDIUM',
      },
    ];
  }

  /**
   * Analyze text for cognitive biases
   */
  async analyzeText(
    text: string,
    options?: BiasDetectionOptions
  ): Promise<AnalysisResult<BiasAnalysis>> {
    const startTime = Date.now();
    const opts = {
      sensitivityLevel: options?.sensitivityLevel || 'medium',
      includeMitigations: options?.includeMitigations ?? true,
      generateAlternatives: options?.generateAlternatives ?? true,
    };

    const sensitivityThreshold = this.getSensitivityThreshold(opts.sensitivityLevel);
    const detectedBiases: DetectedBias[] = [];

    for (const definition of this.biasDefinitions) {
      const detection = this.detectBias(text, definition, sensitivityThreshold);
      if (detection) {
        detectedBiases.push(detection);
      }
    }

    // Calculate overall bias score
    const overallBiasScore = this.calculateOverallBiasScore(detectedBiases);

    // Generate recommendations
    const recommendations = this.generateRecommendations(detectedBiases);

    // Generate debiased alternatives if requested
    const debiasedAlternatives = opts.generateAlternatives
      ? this.generateDebiasedAlternatives(text, detectedBiases)
      : undefined;

    const analysis: BiasAnalysis = {
      inputType: 'text',
      detectedBiases,
      overallBiasScore,
      recommendations,
      debiasedAlternatives,
    };

    return {
      data: analysis,
      confidence: this.calculateConfidence(detectedBiases),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Analyze a decision for biases
   */
  async analyzeDecision(
    decision: {
      context: string;
      options: string[];
      selectedOption: string;
      reasoning: string;
    },
    options?: BiasDetectionOptions
  ): Promise<AnalysisResult<BiasAnalysis>> {
    // Combine all decision text for analysis
    const combinedText = `
      Context: ${decision.context}
      Options considered: ${decision.options.join(', ')}
      Selected: ${decision.selectedOption}
      Reasoning: ${decision.reasoning}
    `;

    const result = await this.analyzeText(combinedText, options);

    // Additional decision-specific bias checks
    const decisionBiases = this.checkDecisionSpecificBiases(decision);
    result.data.detectedBiases.push(...decisionBiases);

    // Recalculate score with decision biases
    result.data.overallBiasScore = this.calculateOverallBiasScore(result.data.detectedBiases);

    return {
      ...result,
      data: {
        ...result.data,
        inputType: 'decision',
      },
    };
  }

  /**
   * Detect a specific bias in text
   */
  private detectBias(
    text: string,
    definition: BiasDefinition,
    threshold: number
  ): DetectedBias | null {
    const indicators: BiasIndicator[] = [];
    let totalWeight = 0;

    for (const indicator of definition.indicators) {
      const matches = text.match(new RegExp(indicator.pattern, 'gi'));
      if (matches) {
        for (const match of matches) {
          const startIndex = text.indexOf(match);
          indicators.push({
            text: match,
            startIndex,
            endIndex: startIndex + match.length,
            indicatorType: indicator.indicatorType,
          });
          totalWeight += indicator.weight;
        }
      }
    }

    // Calculate confidence based on weighted indicators
    const maxPossibleWeight = definition.indicators.reduce((sum, i) => sum + i.weight, 0);
    const confidence = Math.min(1, totalWeight / maxPossibleWeight);

    if (confidence >= threshold && indicators.length > 0) {
      return {
        type: definition.type,
        confidence,
        severity: definition.severity,
        description: definition.description,
        indicators,
        mitigation: definition.mitigation,
        examples: indicators.slice(0, 3).map((i) => i.text),
      };
    }

    return null;
  }

  /**
   * Check for decision-specific biases
   */
  private checkDecisionSpecificBiases(decision: {
    options: string[];
    selectedOption: string;
    reasoning: string;
  }): DetectedBias[] {
    const biases: DetectedBias[] = [];

    // Check if only one option was seriously considered
    if (decision.options.length <= 1) {
      biases.push({
        type: 'CONFIRMATION_BIAS',
        confidence: 0.7,
        severity: 'HIGH',
        description: 'Only one option considered, potentially confirming a predetermined decision',
        indicators: [{
          text: 'Single option consideration',
          startIndex: 0,
          endIndex: 0,
          indicatorType: 'limited_options',
        }],
        mitigation: 'Generate and seriously evaluate at least 3 alternatives',
      });
    }

    // Check if first option was selected (anchoring)
    if (decision.options.length > 0 && decision.selectedOption === decision.options[0]) {
      biases.push({
        type: 'ANCHORING_BIAS',
        confidence: 0.5,
        severity: 'MEDIUM',
        description: 'First option was selected, may indicate anchoring on initial alternative',
        indicators: [{
          text: 'Selected first option',
          startIndex: 0,
          endIndex: 0,
          indicatorType: 'first_option_selection',
        }],
        mitigation: 'Evaluate all options independently before comparing',
      });
    }

    return biases;
  }

  /**
   * Get sensitivity threshold based on level
   */
  private getSensitivityThreshold(level: string): number {
    switch (level) {
      case 'high': return 0.3;
      case 'medium': return 0.5;
      case 'low': return 0.7;
      default: return 0.5;
    }
  }

  /**
   * Calculate overall bias score
   */
  private calculateOverallBiasScore(biases: DetectedBias[]): number {
    if (biases.length === 0) return 0;

    const severityWeights: Record<ImpactLevel, number> = {
      LOW: 0.25,
      MEDIUM: 0.5,
      HIGH: 0.75,
      CRITICAL: 1.0,
    };

    let weightedSum = 0;
    for (const bias of biases) {
      weightedSum += bias.confidence * severityWeights[bias.severity];
    }

    // Normalize to 0-1 range
    return Math.min(1, weightedSum / 3);
  }

  /**
   * Generate recommendations based on detected biases
   */
  private generateRecommendations(
    biases: DetectedBias[]
  ): BiasAnalysis['recommendations'] {
    const recommendations: BiasAnalysis['recommendations'] = [];

    // Sort biases by severity and confidence
    const sortedBiases = [...biases].sort((a, b) => {
      const severityOrder: Record<ImpactLevel, number> = {
        CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1,
      };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });

    for (let i = 0; i < Math.min(sortedBiases.length, 5); i++) {
      const bias = sortedBiases[i];
      recommendations.push({
        priority: i + 1,
        action: bias.mitigation,
        targetBias: bias.type,
      });
    }

    return recommendations;
  }

  /**
   * Generate debiased alternative statements
   */
  private generateDebiasedAlternatives(
    text: string,
    biases: DetectedBias[]
  ): string[] {
    const alternatives: string[] = [];

    // Generate alternatives based on detected biases
    for (const bias of biases.slice(0, 3)) {
      let alternative = text;

      for (const indicator of bias.indicators) {
        // Replace biased language with more neutral alternatives
        const replacement = this.getNeutralReplacement(indicator.indicatorType);
        if (replacement) {
          alternative = alternative.replace(indicator.text, replacement);
        }
      }

      if (alternative !== text) {
        alternatives.push(alternative);
      }
    }

    // Add general debiasing suggestions
    if (biases.some((b) => b.type === 'CONFIRMATION_BIAS')) {
      alternatives.push('Consider: What evidence would change my mind about this?');
    }

    if (biases.some((b) => b.type === 'OVERCONFIDENCE')) {
      alternatives.push('Consider: What are the reasons this might not work?');
    }

    return alternatives;
  }

  /**
   * Get neutral replacement for biased language
   */
  private getNeutralReplacement(indicatorType: string): string | null {
    const replacements: Record<string, string> = {
      certainty_language: 'possibly',
      absolute_language: 'in some cases',
      extreme_confidence: 'with some likelihood',
      confirmation_language: 'it appears that',
      unanimity: 'many agree',
      retrospective_claim: 'in retrospect',
    };

    return replacements[indicatorType] || null;
  }

  /**
   * Calculate analysis confidence
   */
  private calculateConfidence(biases: DetectedBias[]): number {
    if (biases.length === 0) return 0.7; // Moderate confidence when no biases detected

    const avgConfidence =
      biases.reduce((sum, b) => sum + b.confidence, 0) / biases.length;

    return avgConfidence;
  }

  /**
   * Get bias type information
   */
  getBiasInfo(type: BiasType): BiasDefinition | undefined {
    return this.biasDefinitions.find((d) => d.type === type);
  }

  /**
   * Get all supported bias types
   */
  getSupportedBiasTypes(): BiasType[] {
    return this.biasDefinitions.map((d) => d.type);
  }

  /**
   * Quick check for a specific bias
   */
  quickCheck(text: string, biasType: BiasType): {
    detected: boolean;
    confidence: number;
    indicators: string[];
  } {
    const definition = this.biasDefinitions.find((d) => d.type === biasType);
    if (!definition) {
      return { detected: false, confidence: 0, indicators: [] };
    }

    const detection = this.detectBias(text, definition, 0.3);

    return {
      detected: detection !== null,
      confidence: detection?.confidence || 0,
      indicators: detection?.indicators.map((i) => i.text) || [],
    };
  }
}

export const cognitiveBiasEngine = new CognitiveBiasEngine();
