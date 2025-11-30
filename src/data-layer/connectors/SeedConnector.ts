/**
 * Seed DB Connector
 * 2.9 シーズDB連携
 */

import { prisma } from '@/lib/prisma';
import type { IDataConnector, ISearchableConnector } from '../interfaces/IDataConnector';
import type {
  SeedData,
  SeedType,
  MaturityLevel,
  PaginationParams,
  PaginatedResult,
  QueryFilter,
  DataQualityMetrics,
  DataValidationResult,
} from '../types';

type SeedCreateInput = Omit<SeedData, 'id'>;
type SeedUpdateInput = Partial<SeedCreateInput>;

export class SeedConnector
  implements
    IDataConnector<SeedData, SeedCreateInput, SeedUpdateInput>,
    ISearchableConnector<SeedData>
{
  async findById(id: string): Promise<SeedData | null> {
    const seed = await prisma.seed.findUnique({ where: { id } });
    return seed ? this.mapToData(seed) : null;
  }

  async findMany(params?: {
    filters?: QueryFilter[];
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<SeedData>> {
    const { filters = [], pagination = {} } = params || {};
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.seed.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
      prisma.seed.count({ where }),
    ]);

    return { data: data.map(this.mapToData), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByType(type: SeedType): Promise<SeedData[]> {
    const seeds = await prisma.seed.findMany({ where: { type } });
    return seeds.map(this.mapToData);
  }

  async findByMaturity(level: MaturityLevel): Promise<SeedData[]> {
    const seeds = await prisma.seed.findMany({ where: { maturityLevel: level } });
    return seeds.map(this.mapToData);
  }

  async create(data: SeedCreateInput): Promise<SeedData> {
    const seed = await prisma.seed.create({ data });
    return this.mapToData(seed);
  }

  async createMany(data: SeedCreateInput[]): Promise<SeedData[]> {
    return Promise.all(data.map((item) => this.create(item)));
  }

  async update(id: string, data: SeedUpdateInput): Promise<SeedData> {
    const seed = await prisma.seed.update({ where: { id }, data });
    return this.mapToData(seed);
  }

  async delete(id: string): Promise<void> {
    await prisma.seed.delete({ where: { id } });
  }

  async validate(data: SeedCreateInput | SeedUpdateInput): Promise<DataValidationResult> {
    const errors: DataValidationResult['errors'] = [];
    const warnings: DataValidationResult['warnings'] = [];

    if ('name' in data && data.name && data.name.length < 3) {
      errors.push({ field: 'name', message: 'Name must be at least 3 characters', code: 'MIN_LENGTH' });
    }

    if ('potentialMarkets' in data && data.potentialMarkets && data.potentialMarkets.length === 0) {
      warnings.push({ field: 'potentialMarkets', message: 'Consider identifying potential markets' });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  async getQualityMetrics(): Promise<DataQualityMetrics> {
    const seeds = await prisma.seed.findMany();
    const count = seeds.length || 1;
    let completenessScore = 0;

    for (const s of seeds) {
      let filled = 0;
      if (s.name) filled++;
      if (s.description) filled++;
      if (s.type) filled++;
      if (s.maturityLevel) filled++;
      if (s.potentialMarkets.length > 0) filled++;
      if (s.risks.length > 0) filled++;
      completenessScore += filled / 6;
    }

    return {
      completeness: completenessScore / count,
      accuracy: 1,
      consistency: 1,
      timeliness: 1,
      overallScore: completenessScore / count,
      issues: [],
    };
  }

  async search(query: string, options?: { limit?: number }): Promise<SeedData[]> {
    const { limit = 10 } = options || {};
    const seeds = await prisma.seed.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });
    return seeds.map(this.mapToData);
  }

  async findByKeywords(keywords: string[]): Promise<SeedData[]> {
    const seeds = await prisma.seed.findMany({
      where: {
        OR: keywords.map((k) => ({
          OR: [
            { name: { contains: k, mode: 'insensitive' } },
            { potentialMarkets: { has: k } },
          ],
        })),
      },
    });
    return seeds.map(this.mapToData);
  }

  private mapToData(s: {
    id: string;
    name: string;
    description: string;
    type: string;
    maturityLevel: string;
    potentialMarkets: string[];
    requiredResources: string[];
    risks: string[];
    timeToMarket: string | null;
    estimatedInvestment: string | null;
  }): SeedData {
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      type: s.type as SeedType,
      maturityLevel: s.maturityLevel as MaturityLevel,
      potentialMarkets: s.potentialMarkets,
      requiredResources: s.requiredResources,
      risks: s.risks,
      timeToMarket: s.timeToMarket || undefined,
      estimatedInvestment: s.estimatedInvestment || undefined,
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

export const seedConnector = new SeedConnector();
