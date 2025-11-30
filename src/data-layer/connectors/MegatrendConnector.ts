/**
 * Megatrend DB Connector
 * 2.2 メガトレンドDB連携 (P0)
 */

import { prisma } from '@/lib/prisma';
import type {
  IDataConnector,
  ISearchableConnector,
  IAnalyzableConnector,
} from '../interfaces/IDataConnector';
import type {
  MegatrendData,
  MegatrendAnalysisResult,
  PaginationParams,
  PaginatedResult,
  QueryFilter,
  DataQualityMetrics,
  DataValidationResult,
  ImpactLevel,
} from '../types';

type MegatrendCreateInput = Omit<MegatrendData, 'id'>;
type MegatrendUpdateInput = Partial<MegatrendCreateInput>;

export class MegatrendConnector
  implements
    IDataConnector<MegatrendData, MegatrendCreateInput, MegatrendUpdateInput>,
    ISearchableConnector<MegatrendData>,
    IAnalyzableConnector<MegatrendData, MegatrendAnalysisResult>
{
  async findById(id: string): Promise<MegatrendData | null> {
    const megatrend = await prisma.megatrend.findUnique({
      where: { id },
    });
    return megatrend ? this.mapToData(megatrend) : null;
  }

  async findMany(params?: {
    filters?: QueryFilter[];
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<MegatrendData>> {
    const { filters = [], pagination = {} } = params || {};
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.megatrend.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.megatrend.count({ where }),
    ]);

    return {
      data: data.map(this.mapToData),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: MegatrendCreateInput): Promise<MegatrendData> {
    const megatrend = await prisma.megatrend.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        impact: data.impact,
        timeframe: data.timeframe,
        confidence: data.confidence,
        sources: data.sources,
        keywords: data.keywords,
      },
    });
    return this.mapToData(megatrend);
  }

  async createMany(data: MegatrendCreateInput[]): Promise<MegatrendData[]> {
    const results = await Promise.all(data.map((item) => this.create(item)));
    return results;
  }

  async update(id: string, data: MegatrendUpdateInput): Promise<MegatrendData> {
    const megatrend = await prisma.megatrend.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.impact && { impact: data.impact }),
        ...(data.timeframe && { timeframe: data.timeframe }),
        ...(data.confidence !== undefined && { confidence: data.confidence }),
        ...(data.sources && { sources: data.sources }),
        ...(data.keywords && { keywords: data.keywords }),
      },
    });
    return this.mapToData(megatrend);
  }

  async delete(id: string): Promise<void> {
    await prisma.megatrend.delete({ where: { id } });
  }

  async validate(data: MegatrendCreateInput | MegatrendUpdateInput): Promise<DataValidationResult> {
    const errors: DataValidationResult['errors'] = [];
    const warnings: DataValidationResult['warnings'] = [];

    if ('name' in data && data.name) {
      if (data.name.length < 3) {
        errors.push({ field: 'name', message: 'Name must be at least 3 characters', code: 'MIN_LENGTH' });
      }
    }

    if ('confidence' in data && data.confidence !== undefined) {
      if (data.confidence < 0 || data.confidence > 1) {
        errors.push({ field: 'confidence', message: 'Confidence must be between 0 and 1', code: 'OUT_OF_RANGE' });
      }
    }

    if ('sources' in data && data.sources) {
      if (data.sources.length === 0) {
        warnings.push({ field: 'sources', message: 'Consider adding sources for credibility', suggestion: 'Add at least one source' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async getQualityMetrics(): Promise<DataQualityMetrics> {
    const megatrends = await prisma.megatrend.findMany();
    const issues: string[] = [];

    let completenessScore = 0;
    let accuracyScore = 0;

    for (const m of megatrends) {
      // Completeness check
      let fieldsFilled = 0;
      const totalFields = 8;
      if (m.name) fieldsFilled++;
      if (m.description) fieldsFilled++;
      if (m.category) fieldsFilled++;
      if (m.impact) fieldsFilled++;
      if (m.timeframe) fieldsFilled++;
      if (m.confidence) fieldsFilled++;
      if (m.sources.length > 0) fieldsFilled++;
      if (m.keywords.length > 0) fieldsFilled++;
      completenessScore += fieldsFilled / totalFields;

      // Accuracy check (sources present)
      if (m.sources.length > 0) {
        accuracyScore += 1;
      } else {
        issues.push(`Megatrend "${m.name}" has no sources`);
      }
    }

    const count = megatrends.length || 1;
    const completeness = completenessScore / count;
    const accuracy = accuracyScore / count;
    const consistency = 1; // Assume consistent for now
    const timeliness = 1; // Assume timely for now

    return {
      completeness,
      accuracy,
      consistency,
      timeliness,
      overallScore: (completeness + accuracy + consistency + timeliness) / 4,
      issues,
    };
  }

  // ISearchableConnector implementation
  async search(query: string, options?: { fields?: string[]; limit?: number }): Promise<MegatrendData[]> {
    const { limit = 10 } = options || {};

    const megatrends = await prisma.megatrend.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query } },
        ],
      },
      take: limit,
    });

    return megatrends.map(this.mapToData);
  }

  async findByKeywords(keywords: string[]): Promise<MegatrendData[]> {
    const megatrends = await prisma.megatrend.findMany({
      where: {
        keywords: {
          hasSome: keywords,
        },
      },
    });

    return megatrends.map(this.mapToData);
  }

  // IAnalyzableConnector implementation
  async analyze(id: string): Promise<MegatrendAnalysisResult> {
    const megatrend = await prisma.megatrend.findUnique({
      where: { id },
      include: {
        relatedTrends: true,
      },
    });

    if (!megatrend) {
      throw new Error(`Megatrend not found: ${id}`);
    }

    // Calculate score based on impact, confidence, and related trends
    const impactScore = { LOW: 0.25, MEDIUM: 0.5, HIGH: 0.75, CRITICAL: 1 }[megatrend.impact];
    const score = (impactScore + megatrend.confidence) / 2;

    // Generate insights based on megatrend data
    const insights = `This ${megatrend.impact.toLowerCase()} impact megatrend in ${megatrend.category} ` +
      `has a confidence level of ${(megatrend.confidence * 100).toFixed(0)}%. ` +
      `It is expected to develop over the ${megatrend.timeframe} timeframe.`;

    // Identify opportunities and threats
    const opportunities: string[] = [];
    const threats: string[] = [];

    if (megatrend.impact === 'HIGH' || megatrend.impact === 'CRITICAL') {
      opportunities.push('Early adoption can provide competitive advantage');
      opportunities.push('Potential for market leadership in emerging space');
    }

    if (megatrend.confidence < 0.5) {
      threats.push('Uncertainty may lead to misallocated resources');
    }

    // Save analysis to database
    const analysis = await prisma.megatrendAnalysis.create({
      data: {
        megatrendId: id,
        score,
        insights,
        opportunities,
        threats,
      },
    });

    return {
      megatrendId: id,
      score: analysis.score,
      insights: analysis.insights,
      opportunities: analysis.opportunities,
      threats: analysis.threats,
      analysisDate: analysis.analysisDate,
    };
  }

  async analyzeMany(ids: string[]): Promise<MegatrendAnalysisResult[]> {
    return Promise.all(ids.map((id) => this.analyze(id)));
  }

  async getRelated(id: string, options?: { limit?: number; minRelevance?: number }): Promise<MegatrendData[]> {
    const { limit = 5 } = options || {};

    const megatrend = await prisma.megatrend.findUnique({
      where: { id },
    });

    if (!megatrend) {
      return [];
    }

    // Find related megatrends by category and keywords
    const related = await prisma.megatrend.findMany({
      where: {
        id: { not: id },
        OR: [
          { category: megatrend.category },
          { keywords: { hasSome: megatrend.keywords } },
        ],
      },
      take: limit,
    });

    return related.map(this.mapToData);
  }

  // Helper methods
  private mapToData(megatrend: {
    id: string;
    name: string;
    description: string;
    category: string;
    impact: string;
    timeframe: string;
    confidence: number;
    sources: string[];
    keywords: string[];
  }): MegatrendData {
    return {
      id: megatrend.id,
      name: megatrend.name,
      description: megatrend.description,
      category: megatrend.category,
      impact: megatrend.impact as ImpactLevel,
      timeframe: megatrend.timeframe,
      confidence: megatrend.confidence,
      sources: megatrend.sources,
      keywords: megatrend.keywords,
    };
  }

  private buildWhereClause(filters: QueryFilter[]): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    for (const filter of filters) {
      switch (filter.operator) {
        case 'eq':
          where[filter.field] = filter.value;
          break;
        case 'ne':
          where[filter.field] = { not: filter.value };
          break;
        case 'gt':
          where[filter.field] = { gt: filter.value };
          break;
        case 'gte':
          where[filter.field] = { gte: filter.value };
          break;
        case 'lt':
          where[filter.field] = { lt: filter.value };
          break;
        case 'lte':
          where[filter.field] = { lte: filter.value };
          break;
        case 'in':
          where[filter.field] = { in: filter.value };
          break;
        case 'contains':
          where[filter.field] = { contains: filter.value, mode: 'insensitive' };
          break;
      }
    }

    return where;
  }
}

export const megatrendConnector = new MegatrendConnector();
