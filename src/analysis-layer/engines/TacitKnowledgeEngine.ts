/**
 * Tacit Knowledge Extraction Engine
 * 3.6 暗黙知抽出エンジン
 */

import type {
  TacitKnowledgeSource,
  TacitKnowledge,
  KnowledgePattern,
  TacitKnowledgeExtraction,
  AnalysisResult,
  ImpactLevel,
} from '../types';
import { NLPEngine } from './NLPEngine';

export interface ExtractionOptions {
  minConfidence?: number;
  includePatternAnalysis?: boolean;
  detectGaps?: boolean;
}

export class TacitKnowledgeEngine {
  private nlpEngine: NLPEngine;
  private knowledgeBase: Map<string, TacitKnowledge> = new Map();
  private patterns: Map<string, KnowledgePattern> = new Map();

  constructor(nlpEngine?: NLPEngine) {
    this.nlpEngine = nlpEngine || new NLPEngine();
  }

  /**
   * Extract tacit knowledge from sources
   */
  async extract(
    sources: TacitKnowledgeSource[],
    options?: ExtractionOptions
  ): Promise<AnalysisResult<TacitKnowledgeExtraction>> {
    const startTime = Date.now();
    const opts = {
      minConfidence: options?.minConfidence || 0.5,
      includePatternAnalysis: options?.includePatternAnalysis ?? true,
      detectGaps: options?.detectGaps ?? true,
    };

    const extractedKnowledge: TacitKnowledge[] = [];
    const allPatterns: KnowledgePattern[] = [];

    // Process each source
    for (const source of sources) {
      const knowledge = await this.processSource(source, opts.minConfidence);
      extractedKnowledge.push(...knowledge);
    }

    // Pattern analysis
    if (opts.includePatternAnalysis) {
      const patterns = this.analyzePatterns(extractedKnowledge);
      allPatterns.push(...patterns);
    }

    // Gap detection
    const gaps = opts.detectGaps
      ? this.detectKnowledgeGaps(extractedKnowledge)
      : [];

    // Generate recommendations
    const recommendations = this.generateRecommendations(extractedKnowledge, gaps);

    // Store in knowledge base
    for (const knowledge of extractedKnowledge) {
      this.knowledgeBase.set(knowledge.id, knowledge);
    }

    const result: TacitKnowledgeExtraction = {
      extractedKnowledge,
      patterns: allPatterns,
      gaps,
      recommendations,
    };

    return {
      data: result,
      confidence: this.calculateExtractionConfidence(extractedKnowledge),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Process a single source for tacit knowledge
   */
  private async processSource(
    source: TacitKnowledgeSource,
    minConfidence: number
  ): Promise<TacitKnowledge[]> {
    const knowledge: TacitKnowledge[] = [];

    switch (source.type) {
      case 'interview':
        knowledge.push(...await this.extractFromInterview(source));
        break;
      case 'observation':
        knowledge.push(...await this.extractFromObservation(source));
        break;
      case 'document':
        knowledge.push(...await this.extractFromDocument(source));
        break;
      case 'behavior':
        knowledge.push(...await this.extractFromBehavior(source));
        break;
    }

    // Filter by confidence
    return knowledge.filter((k) => k.confidence >= minConfidence);
  }

  /**
   * Extract knowledge from interview content
   */
  private async extractFromInterview(
    source: TacitKnowledgeSource
  ): Promise<TacitKnowledge[]> {
    const knowledge: TacitKnowledge[] = [];
    const content = source.content;

    // Look for experience-based statements
    const experiencePatterns = [
      /長年の経験から|from years of experience|経験上/gi,
      /コツは|the trick is|ポイントは/gi,
      /なんとなく|somehow|感覚的に/gi,
      /いつも|always|必ず/gi,
      /うまくいく|works well|効果的/gi,
    ];

    for (const pattern of experiencePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Extract context around the match
        const sentences = this.extractSentencesWithPattern(content, pattern);
        for (const sentence of sentences) {
          const k = this.createKnowledge(sentence, 'experience', source);
          if (k) knowledge.push(k);
        }
      }
    }

    // Look for intuition-based statements
    const intuitionPatterns = [
      /直感的に|intuitively|感じる/gi,
      /なぜか分からないが|不思議と|somehow/gi,
      /雰囲気|atmosphere|空気を読む/gi,
    ];

    for (const pattern of intuitionPatterns) {
      const sentences = this.extractSentencesWithPattern(content, pattern);
      for (const sentence of sentences) {
        const k = this.createKnowledge(sentence, 'intuition', source);
        if (k) knowledge.push(k);
      }
    }

    // Look for skill-based statements
    const skillPatterns = [
      /技術|technique|skill|スキル/gi,
      /やり方|方法|how to|how I/gi,
      /手順|process|step/gi,
    ];

    for (const pattern of skillPatterns) {
      const sentences = this.extractSentencesWithPattern(content, pattern);
      for (const sentence of sentences) {
        const k = this.createKnowledge(sentence, 'skill', source);
        if (k) knowledge.push(k);
      }
    }

    return knowledge;
  }

  /**
   * Extract knowledge from observation data
   */
  private async extractFromObservation(
    source: TacitKnowledgeSource
  ): Promise<TacitKnowledge[]> {
    const knowledge: TacitKnowledge[] = [];
    const content = source.content;

    // Look for behavioral patterns
    const behaviorPatterns = [
      /常に確認|always checks|必ず見る/gi,
      /順番|order|sequence|手順/gi,
      /習慣|habit|routine|ルーティン/gi,
      /反応|response|reaction|対応/gi,
    ];

    for (const pattern of behaviorPatterns) {
      const sentences = this.extractSentencesWithPattern(content, pattern);
      for (const sentence of sentences) {
        const k = this.createKnowledge(sentence, 'skill', source);
        if (k) {
          k.category = 'skill';
          knowledge.push(k);
        }
      }
    }

    return knowledge;
  }

  /**
   * Extract knowledge from documents
   */
  private async extractFromDocument(
    source: TacitKnowledgeSource
  ): Promise<TacitKnowledge[]> {
    const knowledge: TacitKnowledge[] = [];
    const content = source.content;

    // Look for implicit knowledge in documentation
    const docPatterns = [
      /注意点|caution|note|ポイント/gi,
      /ベストプラクティス|best practice|推奨/gi,
      /経験則|rule of thumb|一般的に/gi,
      /暗黙の|implicit|assumed|前提として/gi,
    ];

    for (const pattern of docPatterns) {
      const sentences = this.extractSentencesWithPattern(content, pattern);
      for (const sentence of sentences) {
        const k = this.createKnowledge(sentence, 'context', source);
        if (k) knowledge.push(k);
      }
    }

    return knowledge;
  }

  /**
   * Extract knowledge from behavior patterns
   */
  private async extractFromBehavior(
    source: TacitKnowledgeSource
  ): Promise<TacitKnowledge[]> {
    const knowledge: TacitKnowledge[] = [];
    const content = source.content;

    // Behavioral patterns often represent tacit skills
    const k = this.createKnowledge(content, 'skill', source);
    if (k) {
      k.applicableContexts = ['workflow', 'process', 'decision-making'];
      knowledge.push(k);
    }

    return knowledge;
  }

  /**
   * Extract sentences containing a pattern
   */
  private extractSentencesWithPattern(content: string, pattern: RegExp): string[] {
    const sentences: string[] = [];
    const allSentences = content.split(/[。！？.!?]+/);

    for (const sentence of allSentences) {
      if (pattern.test(sentence) && sentence.trim().length > 10) {
        sentences.push(sentence.trim());
      }
    }

    return sentences;
  }

  /**
   * Create a TacitKnowledge object
   */
  private createKnowledge(
    content: string,
    category: TacitKnowledge['category'],
    source: TacitKnowledgeSource
  ): TacitKnowledge | null {
    if (content.length < 10) return null;

    const id = `tk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate explicit form
    const explicitForm = this.makeExplicit(content, category);

    return {
      id,
      category,
      description: content,
      explicitForm,
      confidence: source.reliability * 0.8 + 0.1, // Base confidence on source reliability
      sources: [source.source],
      applicableContexts: this.inferContexts(content),
    };
  }

  /**
   * Convert tacit knowledge to explicit form
   */
  private makeExplicit(content: string, category: TacitKnowledge['category']): string {
    const prefixes: Record<TacitKnowledge['category'], string> = {
      skill: '手順として: ',
      intuition: '判断基準として: ',
      experience: '経験則として: ',
      relationship: '関係性として: ',
      context: '背景知識として: ',
    };

    return prefixes[category] + content;
  }

  /**
   * Infer applicable contexts
   */
  private inferContexts(content: string): string[] {
    const contexts: string[] = [];
    const lowerContent = content.toLowerCase();

    const contextPatterns: Array<{ pattern: RegExp; context: string }> = [
      { pattern: /顧客|customer|client|お客/i, context: 'customer-interaction' },
      { pattern: /チーム|team|グループ|member/i, context: 'team-collaboration' },
      { pattern: /判断|decision|decide|選択/i, context: 'decision-making' },
      { pattern: /問題|problem|issue|トラブル/i, context: 'problem-solving' },
      { pattern: /計画|plan|strategy|戦略/i, context: 'planning' },
      { pattern: /品質|quality|改善|improve/i, context: 'quality-management' },
      { pattern: /リスク|risk|危険|注意/i, context: 'risk-management' },
      { pattern: /コミュニケーション|communication|伝える|説明/i, context: 'communication' },
    ];

    for (const { pattern, context } of contextPatterns) {
      if (pattern.test(lowerContent)) {
        contexts.push(context);
      }
    }

    if (contexts.length === 0) {
      contexts.push('general');
    }

    return contexts;
  }

  /**
   * Analyze patterns across extracted knowledge
   */
  private analyzePatterns(knowledge: TacitKnowledge[]): KnowledgePattern[] {
    const patterns: KnowledgePattern[] = [];
    const categoryGroups: Record<string, TacitKnowledge[]> = {};

    // Group by category
    for (const k of knowledge) {
      if (!categoryGroups[k.category]) {
        categoryGroups[k.category] = [];
      }
      categoryGroups[k.category].push(k);
    }

    // Find patterns within each category
    for (const [category, items] of Object.entries(categoryGroups)) {
      if (items.length >= 2) {
        // Look for common themes
        const commonContexts = this.findCommonElements(
          items.map((i) => i.applicableContexts)
        );

        if (commonContexts.length > 0) {
          patterns.push({
            id: `pattern-${category}-${Date.now()}`,
            name: `${category} Pattern`,
            description: `Recurring pattern in ${category} knowledge`,
            occurrences: items.length,
            examples: items.slice(0, 3).map((i) => i.description),
            conditions: commonContexts,
            outcomes: ['Improved performance', 'Better decision-making'],
          });
        }
      }
    }

    // Find cross-category patterns
    const contextGroups: Record<string, TacitKnowledge[]> = {};
    for (const k of knowledge) {
      for (const context of k.applicableContexts) {
        if (!contextGroups[context]) {
          contextGroups[context] = [];
        }
        contextGroups[context].push(k);
      }
    }

    for (const [context, items] of Object.entries(contextGroups)) {
      if (items.length >= 3) {
        patterns.push({
          id: `pattern-context-${context}-${Date.now()}`,
          name: `${context} Knowledge Cluster`,
          description: `Multiple knowledge items applicable to ${context}`,
          occurrences: items.length,
          examples: items.slice(0, 3).map((i) => i.description),
          conditions: [context],
          outcomes: [`Enhanced ${context} capabilities`],
        });
      }
    }

    return patterns;
  }

  /**
   * Find common elements across arrays
   */
  private findCommonElements(arrays: string[][]): string[] {
    if (arrays.length === 0) return [];

    const counts: Record<string, number> = {};
    for (const arr of arrays) {
      const unique = new Set(arr);
      for (const item of unique) {
        counts[item] = (counts[item] || 0) + 1;
      }
    }

    // Return elements that appear in more than half of arrays
    const threshold = arrays.length / 2;
    return Object.entries(counts)
      .filter(([_, count]) => count > threshold)
      .map(([item]) => item);
  }

  /**
   * Detect gaps in knowledge coverage
   */
  private detectKnowledgeGaps(knowledge: TacitKnowledge[]): TacitKnowledgeExtraction['gaps'] {
    const gaps: TacitKnowledgeExtraction['gaps'] = [];

    // Expected knowledge areas
    const expectedAreas = [
      { area: 'customer-interaction', importance: 'HIGH' as ImpactLevel },
      { area: 'decision-making', importance: 'CRITICAL' as ImpactLevel },
      { area: 'problem-solving', importance: 'HIGH' as ImpactLevel },
      { area: 'team-collaboration', importance: 'MEDIUM' as ImpactLevel },
      { area: 'risk-management', importance: 'HIGH' as ImpactLevel },
      { area: 'quality-management', importance: 'MEDIUM' as ImpactLevel },
    ];

    const coveredAreas = new Set<string>();
    for (const k of knowledge) {
      for (const context of k.applicableContexts) {
        coveredAreas.add(context);
      }
    }

    for (const expected of expectedAreas) {
      if (!coveredAreas.has(expected.area)) {
        gaps.push({
          area: expected.area,
          description: `No tacit knowledge captured for ${expected.area}`,
          importance: expected.importance,
        });
      }
    }

    // Check for category gaps
    const categoryCount: Record<string, number> = {};
    for (const k of knowledge) {
      categoryCount[k.category] = (categoryCount[k.category] || 0) + 1;
    }

    const categories: TacitKnowledge['category'][] = [
      'skill', 'intuition', 'experience', 'relationship', 'context'
    ];

    for (const category of categories) {
      if (!categoryCount[category]) {
        gaps.push({
          area: category,
          description: `No ${category}-based knowledge captured`,
          importance: category === 'experience' ? 'HIGH' : 'MEDIUM',
        });
      }
    }

    return gaps;
  }

  /**
   * Generate recommendations based on extraction results
   */
  private generateRecommendations(
    knowledge: TacitKnowledge[],
    gaps: TacitKnowledgeExtraction['gaps']
  ): string[] {
    const recommendations: string[] = [];

    // Gap-based recommendations
    for (const gap of gaps.slice(0, 3)) {
      recommendations.push(
        `Consider conducting interviews focused on ${gap.area} to capture tacit knowledge in this area.`
      );
    }

    // Knowledge validation recommendations
    const lowConfidence = knowledge.filter((k) => k.confidence < 0.6);
    if (lowConfidence.length > 0) {
      recommendations.push(
        `${lowConfidence.length} knowledge items have low confidence. Consider validating with additional sources.`
      );
    }

    // Pattern-based recommendations
    if (knowledge.length > 10) {
      recommendations.push(
        'Consider creating a knowledge repository to systematically store and retrieve tacit knowledge.'
      );
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        'Continue regular knowledge capture sessions to maintain organizational memory.',
        'Consider cross-training programs to share tacit knowledge across team members.'
      );
    }

    return recommendations;
  }

  /**
   * Calculate extraction confidence
   */
  private calculateExtractionConfidence(knowledge: TacitKnowledge[]): number {
    if (knowledge.length === 0) return 0.3;

    const avgConfidence =
      knowledge.reduce((sum, k) => sum + k.confidence, 0) / knowledge.length;

    const diversityScore = new Set(knowledge.map((k) => k.category)).size / 5;

    return avgConfidence * 0.7 + diversityScore * 0.3;
  }

  /**
   * Query knowledge base
   */
  queryKnowledge(query: {
    category?: TacitKnowledge['category'];
    context?: string;
    minConfidence?: number;
  }): TacitKnowledge[] {
    let results = Array.from(this.knowledgeBase.values());

    if (query.category) {
      results = results.filter((k) => k.category === query.category);
    }

    if (query.context) {
      results = results.filter((k) =>
        k.applicableContexts.includes(query.context!)
      );
    }

    if (query.minConfidence) {
      results = results.filter((k) => k.confidence >= query.minConfidence!);
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Validate knowledge with additional source
   */
  validateKnowledge(knowledgeId: string, validator: string): boolean {
    const knowledge = this.knowledgeBase.get(knowledgeId);
    if (!knowledge) return false;

    if (!knowledge.validatedBy) {
      knowledge.validatedBy = [];
    }

    knowledge.validatedBy.push(validator);
    knowledge.confidence = Math.min(1, knowledge.confidence + 0.1);

    this.knowledgeBase.set(knowledgeId, knowledge);
    return true;
  }

  /**
   * Get knowledge statistics
   */
  getStatistics(): {
    totalKnowledge: number;
    byCategory: Record<string, number>;
    avgConfidence: number;
    validatedCount: number;
  } {
    const knowledge = Array.from(this.knowledgeBase.values());

    const byCategory: Record<string, number> = {};
    let totalConfidence = 0;
    let validatedCount = 0;

    for (const k of knowledge) {
      byCategory[k.category] = (byCategory[k.category] || 0) + 1;
      totalConfidence += k.confidence;
      if (k.validatedBy && k.validatedBy.length > 0) {
        validatedCount++;
      }
    }

    return {
      totalKnowledge: knowledge.length,
      byCategory,
      avgConfidence: knowledge.length > 0 ? totalConfidence / knowledge.length : 0,
      validatedCount,
    };
  }
}

export const tacitKnowledgeEngine = new TacitKnowledgeEngine();
