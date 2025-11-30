/**
 * Collective Intelligence Formation Engine
 * 3.8 集合知形成エンジン
 */

import type {
  ContributorProfile,
  Opinion,
  ConsensusPoint,
  Disagreement,
  CollectiveIntelligence,
  AnalysisResult,
} from '../types';
import { NLPEngine } from './NLPEngine';

export interface AggregationOptions {
  weightByExpertise?: boolean;
  weightByReliability?: boolean;
  consensusThreshold?: number;
  diversityBonus?: boolean;
}

export class CollectiveIntelligenceEngine {
  private nlpEngine: NLPEngine;
  private contributors: Map<string, ContributorProfile> = new Map();

  constructor(nlpEngine?: NLPEngine) {
    this.nlpEngine = nlpEngine || new NLPEngine();
  }

  /**
   * Aggregate opinions to form collective intelligence
   */
  async aggregate(
    topic: string,
    opinions: Opinion[],
    contributors: ContributorProfile[],
    options?: AggregationOptions
  ): Promise<AnalysisResult<CollectiveIntelligence>> {
    const startTime = Date.now();
    const opts = {
      weightByExpertise: options?.weightByExpertise ?? true,
      weightByReliability: options?.weightByReliability ?? true,
      consensusThreshold: options?.consensusThreshold || 0.6,
      diversityBonus: options?.diversityBonus ?? true,
    };

    // Register contributors
    for (const contributor of contributors) {
      this.contributors.set(contributor.id, contributor);
    }

    // Calculate weights for each opinion
    const weightedOpinions = this.calculateOpinionWeights(opinions, contributors, opts);

    // Identify consensus points
    const consensusPoints = await this.findConsensusPoints(
      weightedOpinions,
      opts.consensusThreshold
    );

    // Identify disagreements
    const disagreements = this.findDisagreements(weightedOpinions, consensusPoints);

    // Synthesize collective insight
    const synthesizedInsight = await this.synthesizeInsight(
      topic,
      consensusPoints,
      disagreements
    );

    // Calculate confidence and diversity
    const confidenceScore = this.calculateConfidenceScore(
      weightedOpinions,
      consensusPoints
    );
    const diversityIndex = this.calculateDiversityIndex(contributors, opinions);

    const result: CollectiveIntelligence = {
      topic,
      participants: contributors,
      opinions,
      consensusPoints,
      disagreements,
      synthesizedInsight,
      confidenceScore,
      diversityIndex,
    };

    return {
      data: result,
      confidence: confidenceScore,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Calculate weights for opinions based on contributor profiles
   */
  private calculateOpinionWeights(
    opinions: Opinion[],
    contributors: ContributorProfile[],
    options: {
      weightByExpertise: boolean;
      weightByReliability: boolean;
    }
  ): Array<Opinion & { weight: number }> {
    const contributorMap = new Map(contributors.map((c) => [c.id, c]));

    return opinions.map((opinion) => {
      let weight = 1.0;
      const contributor = contributorMap.get(opinion.contributorId);

      if (contributor) {
        if (options.weightByReliability) {
          weight *= contributor.reliabilityScore;
        }

        if (options.weightByExpertise) {
          // Boost weight if contributor has relevant expertise
          // (simplified: use contribution count as proxy)
          const expertiseBoost = Math.min(2, 1 + contributor.contributionCount / 100);
          weight *= expertiseBoost;
        }
      }

      // Factor in the opinion's own confidence
      weight *= opinion.confidence;

      return { ...opinion, weight };
    });
  }

  /**
   * Find points of consensus among opinions
   */
  private async findConsensusPoints(
    opinions: Array<Opinion & { weight: number }>,
    threshold: number
  ): Promise<ConsensusPoint[]> {
    const consensusPoints: ConsensusPoint[] = [];

    // Group opinions by similarity
    const clusters = await this.clusterOpinions(opinions);

    for (const cluster of clusters) {
      if (cluster.length < 2) continue;

      // Calculate agreement level
      const totalWeight = opinions.reduce((sum, o) => sum + o.weight, 0);
      const clusterWeight = cluster.reduce((sum, o) => sum + o.weight, 0);
      const agreementLevel = clusterWeight / totalWeight;

      if (agreementLevel >= threshold) {
        const supporters = cluster.map((o) => o.contributorId);
        const dissenters = opinions
          .filter((o) => !supporters.includes(o.contributorId))
          .map((o) => o.contributorId);

        // Extract key arguments from the cluster
        const keyArguments = this.extractKeyArguments(cluster);

        // Synthesize the consensus position
        const position = this.synthesizePosition(cluster);

        consensusPoints.push({
          topic: 'Shared viewpoint',
          position,
          agreementLevel,
          supporters,
          dissenters,
          keyArguments,
        });
      }
    }

    return consensusPoints;
  }

  /**
   * Cluster similar opinions together
   */
  private async clusterOpinions(
    opinions: Array<Opinion & { weight: number }>
  ): Promise<Array<Array<Opinion & { weight: number }>>> {
    const clusters: Array<Array<Opinion & { weight: number }>> = [];
    const assigned = new Set<number>();

    for (let i = 0; i < opinions.length; i++) {
      if (assigned.has(i)) continue;

      const cluster: Array<Opinion & { weight: number }> = [opinions[i]];
      assigned.add(i);

      for (let j = i + 1; j < opinions.length; j++) {
        if (assigned.has(j)) continue;

        const similarity = await this.nlpEngine.calculateSimilarity(
          opinions[i].content,
          opinions[j].content
        );

        if (similarity > 0.5) {
          cluster.push(opinions[j]);
          assigned.add(j);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * Extract key arguments from a cluster of opinions
   */
  private extractKeyArguments(
    opinions: Array<Opinion & { weight: number }>
  ): string[] {
    const arguments_: string[] = [];

    // Sort by weight and extract reasoning
    const sorted = [...opinions].sort((a, b) => b.weight - a.weight);

    for (const opinion of sorted.slice(0, 3)) {
      if (opinion.reasoning) {
        arguments_.push(opinion.reasoning);
      } else {
        // Extract key phrases from content
        const sentences = opinion.content.split(/[。！？.!?]+/);
        if (sentences.length > 0) {
          arguments_.push(sentences[0].trim());
        }
      }
    }

    return arguments_;
  }

  /**
   * Synthesize a position from clustered opinions
   */
  private synthesizePosition(
    opinions: Array<Opinion & { weight: number }>
  ): string {
    // Use the highest-weighted opinion as the base
    const sorted = [...opinions].sort((a, b) => b.weight - a.weight);
    const primary = sorted[0];

    // Enhance with supporting details from other opinions
    const keywords = new Set<string>();
    for (const opinion of sorted.slice(1, 3)) {
      const words = opinion.content.split(/\s+/).filter((w) => w.length > 3);
      words.forEach((w) => keywords.add(w));
    }

    return primary.content;
  }

  /**
   * Find areas of disagreement
   */
  private findDisagreements(
    opinions: Array<Opinion & { weight: number }>,
    consensusPoints: ConsensusPoint[]
  ): Disagreement[] {
    const disagreements: Disagreement[] = [];

    // Find opinions not in any consensus
    const consensusSupporters = new Set<string>();
    for (const point of consensusPoints) {
      point.supporters.forEach((s) => consensusSupporters.add(s));
    }

    const dissenting = opinions.filter(
      (o) => !consensusSupporters.has(o.contributorId)
    );

    if (dissenting.length > 0) {
      // Group dissenting opinions
      const positionGroups: Map<string, Array<Opinion & { weight: number }>> = new Map();

      for (const opinion of dissenting) {
        // Use first 50 chars as position key (simplified)
        const key = opinion.content.substring(0, 50);
        const existing = positionGroups.get(key) || [];
        existing.push(opinion);
        positionGroups.set(key, existing);
      }

      if (positionGroups.size > 1) {
        const positions = Array.from(positionGroups.entries()).map(
          ([_key, ops]) => ({
            position: ops[0].content,
            supporters: ops.map((o) => o.contributorId),
            arguments: ops
              .filter((o) => o.reasoning)
              .map((o) => o.reasoning!)
              .slice(0, 2),
          })
        );

        disagreements.push({
          topic: 'Point of contention',
          positions,
          bridgingPossibilities: this.suggestBridges(positions),
        });
      }
    }

    return disagreements;
  }

  /**
   * Suggest ways to bridge disagreements
   */
  private suggestBridges(
    positions: Array<{
      position: string;
      supporters: string[];
      arguments: string[];
    }>
  ): string[] {
    const bridges: string[] = [];

    // Generic bridging suggestions
    bridges.push('Consider what common ground exists between the positions');
    bridges.push('Explore whether positions can be integrated rather than chosen between');

    // Look for partial overlaps
    if (positions.length >= 2) {
      bridges.push('Identify aspects where there might be agreement');
    }

    return bridges;
  }

  /**
   * Synthesize a collective insight from consensus and disagreements
   */
  private async synthesizeInsight(
    topic: string,
    consensusPoints: ConsensusPoint[],
    disagreements: Disagreement[]
  ): Promise<string> {
    let insight = `On the topic of "${topic}", `;

    if (consensusPoints.length > 0) {
      insight += `there is consensus that: ${consensusPoints[0].position}. `;

      if (consensusPoints.length > 1) {
        insight += `Additionally, ${consensusPoints.length - 1} other points of agreement were identified. `;
      }
    } else {
      insight += 'no clear consensus has emerged. ';
    }

    if (disagreements.length > 0) {
      insight += `However, there are ${disagreements.length} areas of disagreement that require further discussion.`;
    } else {
      insight += 'There are no significant areas of disagreement.';
    }

    return insight;
  }

  /**
   * Calculate confidence score for the collective intelligence
   */
  private calculateConfidenceScore(
    opinions: Array<Opinion & { weight: number }>,
    consensusPoints: ConsensusPoint[]
  ): number {
    if (opinions.length === 0) return 0;

    // Factor 1: Agreement level
    const avgAgreement = consensusPoints.length > 0
      ? consensusPoints.reduce((sum, c) => sum + c.agreementLevel, 0) / consensusPoints.length
      : 0;

    // Factor 2: Opinion confidence
    const avgOpinionConfidence =
      opinions.reduce((sum, o) => sum + o.confidence, 0) / opinions.length;

    // Factor 3: Participation rate (normalized)
    const uniqueContributors = new Set(opinions.map((o) => o.contributorId)).size;
    const participationScore = Math.min(1, uniqueContributors / 10);

    return (avgAgreement * 0.4 + avgOpinionConfidence * 0.4 + participationScore * 0.2);
  }

  /**
   * Calculate diversity index of contributors
   */
  private calculateDiversityIndex(
    contributors: ContributorProfile[],
    opinions: Opinion[]
  ): number {
    if (contributors.length === 0) return 0;

    // Factor 1: Expertise diversity
    const allExpertise = new Set<string>();
    for (const contributor of contributors) {
      contributor.expertise.forEach((e) => allExpertise.add(e));
    }
    const expertiseDiversity = Math.min(1, allExpertise.size / 10);

    // Factor 2: Opinion diversity (based on content similarity)
    let totalSimilarity = 0;
    let comparisons = 0;
    for (let i = 0; i < opinions.length; i++) {
      for (let j = i + 1; j < opinions.length; j++) {
        // Simplified similarity check
        const words1 = new Set(opinions[i].content.toLowerCase().split(/\s+/));
        const words2 = new Set(opinions[j].content.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter((w) => words2.has(w)));
        const union = new Set([...words1, ...words2]);
        totalSimilarity += intersection.size / union.size;
        comparisons++;
      }
    }
    const avgSimilarity = comparisons > 0 ? totalSimilarity / comparisons : 0;
    const opinionDiversity = 1 - avgSimilarity;

    // Factor 3: Reliability distribution
    const reliabilities = contributors.map((c) => c.reliabilityScore);
    const reliabilityVariance = this.calculateVariance(reliabilities);
    const reliabilityDiversity = Math.min(1, reliabilityVariance * 4);

    return (expertiseDiversity * 0.4 + opinionDiversity * 0.4 + reliabilityDiversity * 0.2);
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  /**
   * Add a new opinion to an existing topic
   */
  async addOpinion(
    existingIntelligence: CollectiveIntelligence,
    newOpinion: Opinion,
    contributor: ContributorProfile,
    options?: AggregationOptions
  ): Promise<AnalysisResult<CollectiveIntelligence>> {
    const updatedContributors = [...existingIntelligence.participants];
    if (!updatedContributors.find((c) => c.id === contributor.id)) {
      updatedContributors.push(contributor);
    }

    const updatedOpinions = [...existingIntelligence.opinions, newOpinion];

    return this.aggregate(
      existingIntelligence.topic,
      updatedOpinions,
      updatedContributors,
      options
    );
  }

  /**
   * Get contributor profile
   */
  getContributor(id: string): ContributorProfile | undefined {
    return this.contributors.get(id);
  }

  /**
   * Update contributor reliability based on accuracy
   */
  updateContributorReliability(
    contributorId: string,
    wasAccurate: boolean,
    weight: number = 0.1
  ): void {
    const contributor = this.contributors.get(contributorId);
    if (!contributor) return;

    const adjustment = wasAccurate ? weight : -weight;
    contributor.reliabilityScore = Math.max(
      0,
      Math.min(1, contributor.reliabilityScore + adjustment)
    );

    if (wasAccurate) {
      contributor.agreementRate =
        (contributor.agreementRate * contributor.contributionCount + 1) /
        (contributor.contributionCount + 1);
    }

    contributor.contributionCount++;
    this.contributors.set(contributorId, contributor);
  }

  /**
   * Create a new contributor profile
   */
  createContributor(
    id: string,
    expertise: string[] = [],
    initialReliability: number = 0.5
  ): ContributorProfile {
    const profile: ContributorProfile = {
      id,
      expertise,
      reliabilityScore: initialReliability,
      contributionCount: 0,
      agreementRate: 0.5,
    };

    this.contributors.set(id, profile);
    return profile;
  }

  /**
   * Get top contributors by reliability
   */
  getTopContributors(limit: number = 10): ContributorProfile[] {
    return Array.from(this.contributors.values())
      .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
      .slice(0, limit);
  }
}

export const collectiveIntelligenceEngine = new CollectiveIntelligenceEngine();
