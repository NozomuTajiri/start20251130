/**
 * Organizational Learning Promotion Engine
 * 3.9 組織学習促進エンジン
 */

import type {
  LearningEvent,
  KnowledgeAsset,
  LearningGap,
  OrganizationalLearning,
  AnalysisResult,
  ImpactLevel,
} from '../types';

export interface LearningOptions {
  retentionWindow?: number; // days
  gapAnalysisEnabled?: boolean;
  recommendationCount?: number;
}

export class OrganizationalLearningEngine {
  private learningEvents: Map<string, LearningEvent> = new Map();
  private knowledgeAssets: Map<string, KnowledgeAsset> = new Map();

  /**
   * Analyze organizational learning patterns
   */
  async analyze(options?: LearningOptions): Promise<AnalysisResult<OrganizationalLearning>> {
    const startTime = Date.now();
    const opts = {
      retentionWindow: options?.retentionWindow || 90,
      gapAnalysisEnabled: options?.gapAnalysisEnabled ?? true,
      recommendationCount: options?.recommendationCount || 5,
    };

    const events = Array.from(this.learningEvents.values());
    const assets = Array.from(this.knowledgeAssets.values());

    // Calculate learning velocity
    const learningVelocity = this.calculateLearningVelocity(events, opts.retentionWindow);

    // Calculate knowledge retention
    const knowledgeRetention = this.calculateKnowledgeRetention(assets);

    // Identify learning gaps if enabled
    const learningGaps = opts.gapAnalysisEnabled
      ? this.identifyLearningGaps(events, assets)
      : [];

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      events,
      assets,
      learningGaps,
      opts.recommendationCount
    );

    const result: OrganizationalLearning = {
      learningEvents: events,
      knowledgeAssets: assets,
      learningGaps,
      learningVelocity,
      knowledgeRetention,
      recommendations,
    };

    return {
      data: result,
      confidence: this.calculateConfidence(result),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Record a learning event
   */
  recordEvent(event: Omit<LearningEvent, 'id'>): LearningEvent {
    const id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullEvent: LearningEvent = { id, ...event };

    this.learningEvents.set(id, fullEvent);

    // Auto-generate knowledge assets from lessons learned
    if (event.lessonsLearned.length > 0) {
      this.createKnowledgeAssetFromEvent(fullEvent);
    }

    return fullEvent;
  }

  /**
   * Create knowledge asset from a learning event
   */
  private createKnowledgeAssetFromEvent(event: LearningEvent): KnowledgeAsset {
    const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const asset: KnowledgeAsset = {
      id,
      title: `Lessons from: ${event.description.substring(0, 50)}`,
      content: event.lessonsLearned.join('\n'),
      category: this.categorizeEvent(event),
      tags: this.extractTags(event),
      createdFrom: [event.id],
      usageCount: 0,
      effectivenessScore: 0.5, // Initial score
      lastUpdated: new Date(),
    };

    this.knowledgeAssets.set(id, asset);
    return asset;
  }

  /**
   * Categorize a learning event
   */
  private categorizeEvent(event: LearningEvent): string {
    const categoryMap: Record<LearningEvent['type'], string> = {
      success: 'Best Practices',
      failure: 'Lessons Learned',
      experiment: 'Innovation',
      discovery: 'Knowledge Discovery',
      feedback: 'Customer Insights',
    };

    return categoryMap[event.type] || 'General';
  }

  /**
   * Extract tags from a learning event
   */
  private extractTags(event: LearningEvent): string[] {
    const tags = new Set<string>();

    // Add type as tag
    tags.add(event.type);

    // Extract keywords from description
    const keywords = event.description
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    keywords.slice(0, 5).forEach((k) => tags.add(k));

    // Add outcomes as tags
    event.outcomes.slice(0, 3).forEach((o) => {
      const words = o.split(/\s+/).slice(0, 2).join('_');
      tags.add(words);
    });

    return Array.from(tags);
  }

  /**
   * Create or update a knowledge asset
   */
  createAsset(asset: Omit<KnowledgeAsset, 'id' | 'usageCount' | 'effectivenessScore' | 'lastUpdated'>): KnowledgeAsset {
    const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullAsset: KnowledgeAsset = {
      id,
      ...asset,
      usageCount: 0,
      effectivenessScore: 0.5,
      lastUpdated: new Date(),
    };

    this.knowledgeAssets.set(id, fullAsset);
    return fullAsset;
  }

  /**
   * Record usage of a knowledge asset
   */
  recordAssetUsage(assetId: string, wasEffective: boolean): void {
    const asset = this.knowledgeAssets.get(assetId);
    if (!asset) return;

    asset.usageCount++;
    asset.lastUpdated = new Date();

    // Update effectiveness score using moving average
    const weight = 1 / (asset.usageCount + 1);
    asset.effectivenessScore =
      asset.effectivenessScore * (1 - weight) + (wasEffective ? 1 : 0) * weight;

    this.knowledgeAssets.set(assetId, asset);
  }

  /**
   * Calculate learning velocity (events per day)
   */
  private calculateLearningVelocity(events: LearningEvent[], days: number): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentEvents = events.filter((e) => e.timestamp >= cutoff);
    return recentEvents.length / days;
  }

  /**
   * Calculate knowledge retention score
   */
  private calculateKnowledgeRetention(assets: KnowledgeAsset[]): number {
    if (assets.length === 0) return 0;

    // Factors:
    // 1. Average effectiveness score
    const avgEffectiveness =
      assets.reduce((sum, a) => sum + a.effectivenessScore, 0) / assets.length;

    // 2. Usage rate (assets with usage > 0)
    const usedAssets = assets.filter((a) => a.usageCount > 0).length;
    const usageRate = usedAssets / assets.length;

    // 3. Recency (assets updated recently)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentAssets = assets.filter((a) => a.lastUpdated >= thirtyDaysAgo).length;
    const recencyRate = recentAssets / assets.length;

    return avgEffectiveness * 0.4 + usageRate * 0.3 + recencyRate * 0.3;
  }

  /**
   * Identify learning gaps
   */
  private identifyLearningGaps(
    events: LearningEvent[],
    assets: KnowledgeAsset[]
  ): LearningGap[] {
    const gaps: LearningGap[] = [];

    // Expected capability areas
    const expectedAreas = [
      { area: 'Customer Understanding', priority: 'CRITICAL' as ImpactLevel },
      { area: 'Market Analysis', priority: 'HIGH' as ImpactLevel },
      { area: 'Product Development', priority: 'HIGH' as ImpactLevel },
      { area: 'Process Improvement', priority: 'MEDIUM' as ImpactLevel },
      { area: 'Team Collaboration', priority: 'MEDIUM' as ImpactLevel },
      { area: 'Innovation', priority: 'HIGH' as ImpactLevel },
      { area: 'Risk Management', priority: 'HIGH' as ImpactLevel },
    ];

    // Assess current capability in each area
    for (const expected of expectedAreas) {
      const relatedAssets = assets.filter((a) =>
        a.category.toLowerCase().includes(expected.area.toLowerCase()) ||
        a.tags.some((t) => expected.area.toLowerCase().includes(t.toLowerCase()))
      );

      const relatedEvents = events.filter((e) =>
        e.description.toLowerCase().includes(expected.area.toLowerCase()) ||
        e.context.toLowerCase().includes(expected.area.toLowerCase())
      );

      // Calculate current capability
      const assetScore = Math.min(1, relatedAssets.length / 5);
      const eventScore = Math.min(1, relatedEvents.length / 10);
      const effectivenessScore = relatedAssets.length > 0
        ? relatedAssets.reduce((sum, a) => sum + a.effectivenessScore, 0) / relatedAssets.length
        : 0;

      const currentCapability = (assetScore + eventScore + effectivenessScore) / 3;
      const targetCapability = 0.7; // Target capability level

      if (currentCapability < targetCapability) {
        gaps.push({
          area: expected.area,
          currentCapability,
          targetCapability,
          priority: expected.priority,
          suggestedActions: this.suggestGapClosingActions(expected.area, currentCapability),
        });
      }
    }

    // Sort by priority and gap size
    return gaps.sort((a, b) => {
      const priorityOrder: Record<ImpactLevel, number> = {
        CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1,
      };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return (b.targetCapability - b.currentCapability) - (a.targetCapability - a.currentCapability);
    });
  }

  /**
   * Suggest actions to close a learning gap
   */
  private suggestGapClosingActions(area: string, currentCapability: number): string[] {
    const actions: string[] = [];

    if (currentCapability < 0.3) {
      actions.push(`Establish foundational training in ${area}`);
      actions.push(`Recruit expertise or hire consultants for ${area}`);
    } else if (currentCapability < 0.5) {
      actions.push(`Conduct workshops and knowledge sharing sessions on ${area}`);
      actions.push(`Document best practices for ${area}`);
    } else {
      actions.push(`Implement advanced training programs for ${area}`);
      actions.push(`Establish mentorship programs in ${area}`);
    }

    actions.push(`Create feedback loops to capture learnings about ${area}`);

    return actions;
  }

  /**
   * Generate learning recommendations
   */
  private generateRecommendations(
    events: LearningEvent[],
    assets: KnowledgeAsset[],
    gaps: LearningGap[],
    count: number
  ): OrganizationalLearning['recommendations'] {
    const recommendations: OrganizationalLearning['recommendations'] = [];

    // Gap-based recommendations
    for (const gap of gaps.slice(0, 2)) {
      recommendations.push({
        type: 'training' as const,
        description: `Address ${gap.area} capability gap with targeted learning initiatives`,
        expectedImpact: gap.priority,
      });
    }

    // Process-based recommendations
    const failureEvents = events.filter((e) => e.type === 'failure');
    if (failureEvents.length > 3) {
      recommendations.push({
        type: 'process' as const,
        description: 'Implement a systematic failure analysis and learning process',
        expectedImpact: 'HIGH' as ImpactLevel,
      });
    }

    // Culture-based recommendations
    const uniqueParticipants = new Set<string>();
    for (const event of events) {
      event.participants.forEach((p) => uniqueParticipants.add(p));
    }

    if (uniqueParticipants.size < 5) {
      recommendations.push({
        type: 'culture' as const,
        description: 'Encourage broader participation in learning activities',
        expectedImpact: 'MEDIUM' as ImpactLevel,
      });
    }

    // Tool-based recommendations
    const lowUsageAssets = assets.filter((a) => a.usageCount < 2);
    if (lowUsageAssets.length > assets.length * 0.5) {
      recommendations.push({
        type: 'tool' as const,
        description: 'Improve knowledge asset discoverability and accessibility',
        expectedImpact: 'MEDIUM' as ImpactLevel,
      });
    }

    // Default recommendations
    if (recommendations.length < count) {
      recommendations.push({
        type: 'process' as const,
        description: 'Establish regular retrospectives and learning reviews',
        expectedImpact: 'MEDIUM' as ImpactLevel,
      });
    }

    return recommendations.slice(0, count);
  }

  /**
   * Calculate analysis confidence
   */
  private calculateConfidence(result: OrganizationalLearning): number {
    const eventCount = result.learningEvents.length;
    const assetCount = result.knowledgeAssets.length;

    // More data = higher confidence
    const dataScore = Math.min(1, (eventCount + assetCount) / 50);

    // Higher retention = higher confidence
    const retentionScore = result.knowledgeRetention;

    return dataScore * 0.6 + retentionScore * 0.4;
  }

  /**
   * Search knowledge assets
   */
  searchAssets(query: string, limit: number = 10): KnowledgeAsset[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.knowledgeAssets.values())
      .filter((asset) =>
        asset.title.toLowerCase().includes(lowerQuery) ||
        asset.content.toLowerCase().includes(lowerQuery) ||
        asset.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
        asset.category.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
      .slice(0, limit);
  }

  /**
   * Get related assets
   */
  getRelatedAssets(assetId: string, limit: number = 5): KnowledgeAsset[] {
    const asset = this.knowledgeAssets.get(assetId);
    if (!asset) return [];

    return Array.from(this.knowledgeAssets.values())
      .filter((a) =>
        a.id !== assetId &&
        (a.category === asset.category ||
          a.tags.some((t) => asset.tags.includes(t)))
      )
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
      .slice(0, limit);
  }

  /**
   * Get learning events by type
   */
  getEventsByType(type: LearningEvent['type']): LearningEvent[] {
    return Array.from(this.learningEvents.values())
      .filter((e) => e.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get most effective knowledge assets
   */
  getTopAssets(limit: number = 10): KnowledgeAsset[] {
    return Array.from(this.knowledgeAssets.values())
      .filter((a) => a.usageCount > 0)
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
      .slice(0, limit);
  }

  /**
   * Get learning statistics
   */
  getStatistics(): {
    totalEvents: number;
    totalAssets: number;
    eventsByType: Record<string, number>;
    assetsByCategory: Record<string, number>;
    avgEffectiveness: number;
    totalUsage: number;
  } {
    const events = Array.from(this.learningEvents.values());
    const assets = Array.from(this.knowledgeAssets.values());

    const eventsByType: Record<string, number> = {};
    for (const event of events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }

    const assetsByCategory: Record<string, number> = {};
    for (const asset of assets) {
      assetsByCategory[asset.category] = (assetsByCategory[asset.category] || 0) + 1;
    }

    const avgEffectiveness = assets.length > 0
      ? assets.reduce((sum, a) => sum + a.effectivenessScore, 0) / assets.length
      : 0;

    const totalUsage = assets.reduce((sum, a) => sum + a.usageCount, 0);

    return {
      totalEvents: events.length,
      totalAssets: assets.length,
      eventsByType,
      assetsByCategory,
      avgEffectiveness,
      totalUsage,
    };
  }

  /**
   * Export learning data
   */
  exportData(): {
    events: LearningEvent[];
    assets: KnowledgeAsset[];
  } {
    return {
      events: Array.from(this.learningEvents.values()),
      assets: Array.from(this.knowledgeAssets.values()),
    };
  }

  /**
   * Import learning data
   */
  importData(data: {
    events?: LearningEvent[];
    assets?: KnowledgeAsset[];
  }): void {
    if (data.events) {
      for (const event of data.events) {
        this.learningEvents.set(event.id, event);
      }
    }

    if (data.assets) {
      for (const asset of data.assets) {
        this.knowledgeAssets.set(asset.id, asset);
      }
    }
  }
}

export const organizationalLearningEngine = new OrganizationalLearningEngine();
