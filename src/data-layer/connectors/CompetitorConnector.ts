/**
 * Competitor DB Connector
 * 2.12 競合情報DB連携
 */

import { prisma } from '@/lib/prisma';
import type { IDataConnector, ISearchableConnector, IAnalyzableConnector } from '../interfaces/IDataConnector';
import type {
  CompetitorData,
  CompetitorMoveData,
  MoveType,
  ImpactLevel,
  PaginationParams,
  PaginatedResult,
  QueryFilter,
  DataQualityMetrics,
  DataValidationResult,
} from '../types';

type CompetitorCreateInput = Omit<CompetitorData, 'id'>;
type CompetitorUpdateInput = Partial<CompetitorCreateInput>;

interface CompetitorAnalysis {
  competitorId: string;
  competitorName: string;
  strengthScore: number;
  threatLevel: ImpactLevel;
  recentActivity: CompetitorMoveData[];
  recommendations: string[];
}

export class CompetitorConnector
  implements
    IDataConnector<CompetitorData, CompetitorCreateInput, CompetitorUpdateInput>,
    ISearchableConnector<CompetitorData>,
    IAnalyzableConnector<CompetitorData, CompetitorAnalysis>
{
  async findById(id: string): Promise<CompetitorData | null> {
    const competitor = await prisma.competitor.findUnique({ where: { id } });
    return competitor ? this.mapToData(competitor) : null;
  }

  async findMany(params?: {
    filters?: QueryFilter[];
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<CompetitorData>> {
    const { filters = [], pagination = {} } = params || {};
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.competitor.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
      prisma.competitor.count({ where }),
    ]);

    return { data: data.map(this.mapToData), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByIndustry(industry: string): Promise<CompetitorData[]> {
    const competitors = await prisma.competitor.findMany({
      where: { industry: { has: industry } },
    });
    return competitors.map(this.mapToData);
  }

  async create(data: CompetitorCreateInput): Promise<CompetitorData> {
    const competitor = await prisma.competitor.create({
      data: {
        name: data.name,
        description: data.description,
        industry: data.industry,
        marketPosition: data.marketPosition,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        products: data.products,
      },
    });
    return this.mapToData(competitor);
  }

  async createMany(data: CompetitorCreateInput[]): Promise<CompetitorData[]> {
    return Promise.all(data.map((item) => this.create(item)));
  }

  async update(id: string, data: CompetitorUpdateInput): Promise<CompetitorData> {
    const competitor = await prisma.competitor.update({ where: { id }, data });
    return this.mapToData(competitor);
  }

  async delete(id: string): Promise<void> {
    await prisma.competitor.delete({ where: { id } });
  }

  async validate(data: CompetitorCreateInput | CompetitorUpdateInput): Promise<DataValidationResult> {
    const errors: DataValidationResult['errors'] = [];
    const warnings: DataValidationResult['warnings'] = [];

    if ('name' in data && data.name && data.name.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters', code: 'MIN_LENGTH' });
    }

    if ('strengths' in data && data.strengths && data.strengths.length === 0) {
      warnings.push({ field: 'strengths', message: 'Consider identifying competitor strengths' });
    }

    if ('weaknesses' in data && data.weaknesses && data.weaknesses.length === 0) {
      warnings.push({ field: 'weaknesses', message: 'Consider identifying competitor weaknesses' });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  async getQualityMetrics(): Promise<DataQualityMetrics> {
    const competitors = await prisma.competitor.findMany();
    const count = competitors.length || 1;
    let completenessScore = 0;
    const issues: string[] = [];

    for (const c of competitors) {
      let filled = 0;
      if (c.name) filled++;
      if (c.description) filled++;
      if (c.industry.length > 0) filled++;
      if (c.strengths.length > 0) filled++;
      if (c.weaknesses.length > 0) filled++;
      if (c.products.length > 0) filled++;
      completenessScore += filled / 6;

      if (c.strengths.length === 0 || c.weaknesses.length === 0) {
        issues.push(`Competitor "${c.name}" missing SWOT data`);
      }
    }

    return {
      completeness: completenessScore / count,
      accuracy: 1,
      consistency: 1,
      timeliness: 1,
      overallScore: completenessScore / count,
      issues,
    };
  }

  async search(query: string, options?: { limit?: number }): Promise<CompetitorData[]> {
    const { limit = 10 } = options || {};
    const competitors = await prisma.competitor.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });
    return competitors.map(this.mapToData);
  }

  async findByKeywords(keywords: string[]): Promise<CompetitorData[]> {
    const competitors = await prisma.competitor.findMany({
      where: {
        OR: keywords.map((k) => ({
          OR: [
            { name: { contains: k, mode: 'insensitive' } },
            { products: { has: k } },
            { industry: { has: k } },
          ],
        })),
      },
    });
    return competitors.map(this.mapToData);
  }

  // Competitor moves
  async addMove(
    competitorId: string,
    move: Omit<CompetitorMoveData, 'id' | 'competitorId'>
  ): Promise<CompetitorMoveData> {
    const created = await prisma.competitorMove.create({
      data: {
        competitorId,
        type: move.type,
        description: move.description,
        date: move.date,
        impact: move.impact,
        response: move.response,
      },
    });
    return this.mapMoveToData(created);
  }

  async getMoves(competitorId: string, limit = 10): Promise<CompetitorMoveData[]> {
    const moves = await prisma.competitorMove.findMany({
      where: { competitorId },
      orderBy: { date: 'desc' },
      take: limit,
    });
    return moves.map(this.mapMoveToData);
  }

  async getRecentMoves(days = 30): Promise<CompetitorMoveData[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const moves = await prisma.competitorMove.findMany({
      where: { date: { gte: since } },
      orderBy: { date: 'desc' },
    });
    return moves.map(this.mapMoveToData);
  }

  // Analysis
  async analyze(id: string): Promise<CompetitorAnalysis> {
    const competitor = await prisma.competitor.findUnique({
      where: { id },
      include: { recentMoves: { orderBy: { date: 'desc' }, take: 5 } },
    });

    if (!competitor) {
      throw new Error(`Competitor not found: ${id}`);
    }

    // Calculate strength score
    const strengthScore = Math.min(
      1,
      (competitor.strengths.length * 0.15) +
      (competitor.products.length * 0.1) +
      (competitor.recentMoves.length * 0.1)
    );

    // Determine threat level
    let threatLevel: ImpactLevel = 'LOW';
    if (strengthScore > 0.7) threatLevel = 'CRITICAL';
    else if (strengthScore > 0.5) threatLevel = 'HIGH';
    else if (strengthScore > 0.3) threatLevel = 'MEDIUM';

    // Generate recommendations
    const recommendations: string[] = [];
    if (competitor.strengths.length > competitor.weaknesses.length) {
      recommendations.push('Focus on areas where competitor is weak');
    }
    if (competitor.recentMoves.length > 3) {
      recommendations.push('Monitor frequent activity closely');
    }
    for (const weakness of competitor.weaknesses.slice(0, 2)) {
      recommendations.push(`Exploit weakness: ${weakness}`);
    }

    return {
      competitorId: id,
      competitorName: competitor.name,
      strengthScore,
      threatLevel,
      recentActivity: competitor.recentMoves.map(this.mapMoveToData),
      recommendations,
    };
  }

  async analyzeMany(ids: string[]): Promise<CompetitorAnalysis[]> {
    return Promise.all(ids.map((id) => this.analyze(id)));
  }

  async getRelated(id: string, options?: { limit?: number }): Promise<CompetitorData[]> {
    const { limit = 5 } = options || {};
    const competitor = await prisma.competitor.findUnique({ where: { id } });

    if (!competitor) return [];

    const related = await prisma.competitor.findMany({
      where: {
        id: { not: id },
        industry: { hasSome: competitor.industry },
      },
      take: limit,
    });

    return related.map(this.mapToData);
  }

  private mapToData(c: {
    id: string;
    name: string;
    description: string | null;
    industry: string[];
    marketPosition: string | null;
    strengths: string[];
    weaknesses: string[];
    products: string[];
  }): CompetitorData {
    return {
      id: c.id,
      name: c.name,
      description: c.description || undefined,
      industry: c.industry,
      marketPosition: c.marketPosition || undefined,
      strengths: c.strengths,
      weaknesses: c.weaknesses,
      products: c.products,
    };
  }

  private mapMoveToData(m: {
    id: string;
    competitorId: string;
    type: string;
    description: string;
    date: Date;
    impact: string;
    response: string | null;
  }): CompetitorMoveData {
    return {
      id: m.id,
      competitorId: m.competitorId,
      type: m.type as MoveType,
      description: m.description,
      date: m.date,
      impact: m.impact as ImpactLevel,
      response: m.response || undefined,
    };
  }

  private buildWhereClause(filters: QueryFilter[]): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    for (const f of filters) {
      if (f.operator === 'eq') where[f.field] = f.value;
      else if (f.operator === 'contains') where[f.field] = { contains: f.value, mode: 'insensitive' };
    }
    return where;
  }
}

export const competitorConnector = new CompetitorConnector();
