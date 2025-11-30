/**
 * Success Case DB Connector
 * 2.8 成功情報DB連携
 */

import { prisma } from '@/lib/prisma';
import type { IDataConnector, ISearchableConnector } from '../interfaces/IDataConnector';
import type {
  SuccessCaseData,
  PaginationParams,
  PaginatedResult,
  QueryFilter,
  DataQualityMetrics,
  DataValidationResult,
} from '../types';

type SuccessCaseCreateInput = Omit<SuccessCaseData, 'id'>;
type SuccessCaseUpdateInput = Partial<SuccessCaseCreateInput>;

export class SuccessCaseConnector
  implements
    IDataConnector<SuccessCaseData, SuccessCaseCreateInput, SuccessCaseUpdateInput>,
    ISearchableConnector<SuccessCaseData>
{
  async findById(id: string): Promise<SuccessCaseData | null> {
    const successCase = await prisma.successCase.findUnique({ where: { id } });
    return successCase ? this.mapToData(successCase) : null;
  }

  async findMany(params?: {
    filters?: QueryFilter[];
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<SuccessCaseData>> {
    const { filters = [], pagination = {} } = params || {};
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.successCase.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
      prisma.successCase.count({ where }),
    ]);

    return { data: data.map(this.mapToData), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByIndustry(industry: string): Promise<SuccessCaseData[]> {
    const cases = await prisma.successCase.findMany({
      where: { industry: { contains: industry, mode: 'insensitive' } },
    });
    return cases.map(this.mapToData);
  }

  async create(data: SuccessCaseCreateInput): Promise<SuccessCaseData> {
    const successCase = await prisma.successCase.create({
      data: {
        title: data.title,
        description: data.description,
        industry: data.industry,
        companySize: data.companySize,
        challenge: data.challenge,
        solution: data.solution,
        results: data.results,
        keyFactors: data.keyFactors,
        lessonsLearned: data.lessonsLearned,
        metrics: data.metrics as object | undefined,
      },
    });
    return this.mapToData(successCase);
  }

  async createMany(data: SuccessCaseCreateInput[]): Promise<SuccessCaseData[]> {
    return Promise.all(data.map((item) => this.create(item)));
  }

  async update(id: string, data: SuccessCaseUpdateInput): Promise<SuccessCaseData> {
    const successCase = await prisma.successCase.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.industry && { industry: data.industry }),
        ...(data.companySize && { companySize: data.companySize }),
        ...(data.challenge && { challenge: data.challenge }),
        ...(data.solution && { solution: data.solution }),
        ...(data.results && { results: data.results }),
        ...(data.keyFactors && { keyFactors: data.keyFactors }),
        ...(data.lessonsLearned && { lessonsLearned: data.lessonsLearned }),
        ...(data.metrics && { metrics: data.metrics as object }),
      },
    });
    return this.mapToData(successCase);
  }

  async delete(id: string): Promise<void> {
    await prisma.successCase.delete({ where: { id } });
  }

  async validate(data: SuccessCaseCreateInput | SuccessCaseUpdateInput): Promise<DataValidationResult> {
    const errors: DataValidationResult['errors'] = [];
    const warnings: DataValidationResult['warnings'] = [];

    if ('title' in data && data.title && data.title.length < 5) {
      errors.push({ field: 'title', message: 'Title must be at least 5 characters', code: 'MIN_LENGTH' });
    }

    if ('keyFactors' in data && data.keyFactors && data.keyFactors.length === 0) {
      warnings.push({ field: 'keyFactors', message: 'Consider adding key success factors' });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  async getQualityMetrics(): Promise<DataQualityMetrics> {
    const cases = await prisma.successCase.findMany();
    const count = cases.length || 1;
    let completenessScore = 0;

    for (const c of cases) {
      let filled = 0;
      if (c.title) filled++;
      if (c.description) filled++;
      if (c.challenge) filled++;
      if (c.solution) filled++;
      if (c.results) filled++;
      if (c.keyFactors.length > 0) filled++;
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

  async search(query: string, options?: { limit?: number }): Promise<SuccessCaseData[]> {
    const { limit = 10 } = options || {};
    const cases = await prisma.successCase.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });
    return cases.map(this.mapToData);
  }

  async findByKeywords(keywords: string[]): Promise<SuccessCaseData[]> {
    const cases = await prisma.successCase.findMany({
      where: {
        OR: keywords.map((k) => ({ keyFactors: { has: k } })),
      },
    });
    return cases.map(this.mapToData);
  }

  private mapToData(c: {
    id: string;
    title: string;
    description: string;
    industry: string;
    companySize: string;
    challenge: string;
    solution: string;
    results: string;
    keyFactors: string[];
    lessonsLearned: string[];
    metrics: unknown;
  }): SuccessCaseData {
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      industry: c.industry,
      companySize: c.companySize,
      challenge: c.challenge,
      solution: c.solution,
      results: c.results,
      keyFactors: c.keyFactors,
      lessonsLearned: c.lessonsLearned,
      metrics: c.metrics as Record<string, unknown> | undefined,
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

export const successCaseConnector = new SuccessCaseConnector();
