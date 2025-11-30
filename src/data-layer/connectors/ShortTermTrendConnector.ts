/**
 * Short Term Trend DB Connector
 * 2.11 短期トレンドDB連携
 */

import { prisma } from '@/lib/prisma';
import type { IDataConnector, ISearchableConnector } from '../interfaces/IDataConnector';
import type {
  ShortTermTrendData,
  TrendPhase,
  PaginationParams,
  PaginatedResult,
  QueryFilter,
  DataQualityMetrics,
  DataValidationResult,
} from '../types';

type TrendCreateInput = Omit<ShortTermTrendData, 'id'>;
type TrendUpdateInput = Partial<TrendCreateInput>;

export class ShortTermTrendConnector
  implements
    IDataConnector<ShortTermTrendData, TrendCreateInput, TrendUpdateInput>,
    ISearchableConnector<ShortTermTrendData>
{
  async findById(id: string): Promise<ShortTermTrendData | null> {
    const trend = await prisma.shortTermTrend.findUnique({ where: { id } });
    return trend ? this.mapToData(trend) : null;
  }

  async findMany(params?: {
    filters?: QueryFilter[];
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<ShortTermTrendData>> {
    const { filters = [], pagination = {} } = params || {};
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.shortTermTrend.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
      prisma.shortTermTrend.count({ where }),
    ]);

    return { data: data.map(this.mapToData), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByPhase(phase: TrendPhase): Promise<ShortTermTrendData[]> {
    const trends = await prisma.shortTermTrend.findMany({ where: { currentPhase: phase } });
    return trends.map(this.mapToData);
  }

  async findEmergingTrends(): Promise<ShortTermTrendData[]> {
    const trends = await prisma.shortTermTrend.findMany({
      where: { currentPhase: { in: ['EMERGING', 'GROWING'] } },
      orderBy: { relevance: 'desc' },
    });
    return trends.map(this.mapToData);
  }

  async findByMegatrend(megatrendId: string): Promise<ShortTermTrendData[]> {
    const trends = await prisma.shortTermTrend.findMany({ where: { megatrendId } });
    return trends.map(this.mapToData);
  }

  async create(data: TrendCreateInput): Promise<ShortTermTrendData> {
    const trend = await prisma.shortTermTrend.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        currentPhase: data.currentPhase,
        relevance: data.relevance,
        megatrendId: data.megatrendId,
        sources: data.sources,
      },
    });
    return this.mapToData(trend);
  }

  async createMany(data: TrendCreateInput[]): Promise<ShortTermTrendData[]> {
    return Promise.all(data.map((item) => this.create(item)));
  }

  async update(id: string, data: TrendUpdateInput): Promise<ShortTermTrendData> {
    const trend = await prisma.shortTermTrend.update({ where: { id }, data });
    return this.mapToData(trend);
  }

  async delete(id: string): Promise<void> {
    await prisma.shortTermTrend.delete({ where: { id } });
  }

  async validate(data: TrendCreateInput | TrendUpdateInput): Promise<DataValidationResult> {
    const errors: DataValidationResult['errors'] = [];
    const warnings: DataValidationResult['warnings'] = [];

    if ('name' in data && data.name && data.name.length < 3) {
      errors.push({ field: 'name', message: 'Name must be at least 3 characters', code: 'MIN_LENGTH' });
    }

    if ('relevance' in data && data.relevance !== undefined) {
      if (data.relevance < 0 || data.relevance > 1) {
        errors.push({ field: 'relevance', message: 'Relevance must be between 0 and 1', code: 'OUT_OF_RANGE' });
      }
    }

    if ('sources' in data && data.sources && data.sources.length === 0) {
      warnings.push({ field: 'sources', message: 'Consider adding trend sources' });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  async getQualityMetrics(): Promise<DataQualityMetrics> {
    const trends = await prisma.shortTermTrend.findMany();
    const count = trends.length || 1;
    let completenessScore = 0;
    const issues: string[] = [];

    for (const t of trends) {
      let filled = 0;
      if (t.name) filled++;
      if (t.description) filled++;
      if (t.category) filled++;
      if (t.currentPhase) filled++;
      if (t.sources.length > 0) filled++;
      completenessScore += filled / 5;

      if (t.sources.length === 0) {
        issues.push(`Trend "${t.name}" has no sources`);
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

  async search(query: string, options?: { limit?: number }): Promise<ShortTermTrendData[]> {
    const { limit = 10 } = options || {};
    const trends = await prisma.shortTermTrend.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });
    return trends.map(this.mapToData);
  }

  async findByKeywords(keywords: string[]): Promise<ShortTermTrendData[]> {
    const trends = await prisma.shortTermTrend.findMany({
      where: {
        OR: keywords.map((k) => ({
          OR: [
            { name: { contains: k, mode: 'insensitive' } },
            { description: { contains: k, mode: 'insensitive' } },
          ],
        })),
      },
    });
    return trends.map(this.mapToData);
  }

  private mapToData(t: {
    id: string;
    name: string;
    description: string;
    category: string;
    currentPhase: string;
    relevance: number;
    megatrendId: string | null;
    sources: string[];
  }): ShortTermTrendData {
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      currentPhase: t.currentPhase as TrendPhase,
      relevance: t.relevance,
      megatrendId: t.megatrendId || undefined,
      sources: t.sources,
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

export const shortTermTrendConnector = new ShortTermTrendConnector();
