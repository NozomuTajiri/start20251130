/**
 * Hidden Need DB Connector
 * 2.4 ニーズの裏のニーズDB連携 (P0)
 */

import { prisma } from '@/lib/prisma';
import type { IDataConnector, ISearchableConnector, IAnalyzableConnector } from '../interfaces/IDataConnector';
import type {
  HiddenNeedData,
  PaginationParams,
  PaginatedResult,
  QueryFilter,
  DataQualityMetrics,
  DataValidationResult,
  ValidationLevel,
} from '../types';

type HiddenNeedCreateInput = Omit<HiddenNeedData, 'id'>;
type HiddenNeedUpdateInput = Partial<HiddenNeedCreateInput>;

interface NeedInsightResult {
  id: string;
  hiddenNeedId: string;
  insight: string;
  actionable: boolean;
  priority: number;
}

export class HiddenNeedConnector
  implements
    IDataConnector<HiddenNeedData, HiddenNeedCreateInput, HiddenNeedUpdateInput>,
    ISearchableConnector<HiddenNeedData>,
    IAnalyzableConnector<HiddenNeedData, NeedInsightResult[]>
{
  async findById(id: string): Promise<HiddenNeedData | null> {
    const need = await prisma.hiddenNeed.findUnique({
      where: { id },
    });
    return need ? this.mapToData(need) : null;
  }

  async findMany(params?: {
    filters?: QueryFilter[];
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<HiddenNeedData>> {
    const { filters = [], pagination = {} } = params || {};
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.hiddenNeed.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.hiddenNeed.count({ where }),
    ]);

    return {
      data: data.map(this.mapToData),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySegment(segment: string): Promise<HiddenNeedData[]> {
    const needs = await prisma.hiddenNeed.findMany({
      where: {
        customerSegment: { contains: segment, mode: 'insensitive' },
      },
    });
    return needs.map(this.mapToData);
  }

  async findByValidationLevel(level: ValidationLevel): Promise<HiddenNeedData[]> {
    const needs = await prisma.hiddenNeed.findMany({
      where: { validationLevel: level },
    });
    return needs.map(this.mapToData);
  }

  async create(data: HiddenNeedCreateInput): Promise<HiddenNeedData> {
    const need = await prisma.hiddenNeed.create({
      data: {
        surfaceNeed: data.surfaceNeed,
        hiddenNeed: data.hiddenNeed,
        rootCause: data.rootCause,
        customerSegment: data.customerSegment,
        emotionalDriver: data.emotionalDriver,
        functionalDriver: data.functionalDriver,
        socialDriver: data.socialDriver,
        validationLevel: data.validationLevel,
        evidence: data.evidence,
      },
    });
    return this.mapToData(need);
  }

  async createMany(data: HiddenNeedCreateInput[]): Promise<HiddenNeedData[]> {
    const results = await Promise.all(data.map((item) => this.create(item)));
    return results;
  }

  async update(id: string, data: HiddenNeedUpdateInput): Promise<HiddenNeedData> {
    const need = await prisma.hiddenNeed.update({
      where: { id },
      data: {
        ...(data.surfaceNeed && { surfaceNeed: data.surfaceNeed }),
        ...(data.hiddenNeed && { hiddenNeed: data.hiddenNeed }),
        ...(data.rootCause && { rootCause: data.rootCause }),
        ...(data.customerSegment && { customerSegment: data.customerSegment }),
        ...(data.emotionalDriver !== undefined && { emotionalDriver: data.emotionalDriver }),
        ...(data.functionalDriver !== undefined && { functionalDriver: data.functionalDriver }),
        ...(data.socialDriver !== undefined && { socialDriver: data.socialDriver }),
        ...(data.validationLevel && { validationLevel: data.validationLevel }),
        ...(data.evidence && { evidence: data.evidence }),
      },
    });
    return this.mapToData(need);
  }

  async delete(id: string): Promise<void> {
    await prisma.hiddenNeed.delete({ where: { id } });
  }

  async validate(data: HiddenNeedCreateInput | HiddenNeedUpdateInput): Promise<DataValidationResult> {
    const errors: DataValidationResult['errors'] = [];
    const warnings: DataValidationResult['warnings'] = [];

    if ('surfaceNeed' in data && data.surfaceNeed) {
      if (data.surfaceNeed.length < 10) {
        errors.push({ field: 'surfaceNeed', message: 'Surface need description is too short', code: 'MIN_LENGTH' });
      }
    }

    if ('hiddenNeed' in data && data.hiddenNeed) {
      if (data.hiddenNeed.length < 20) {
        warnings.push({
          field: 'hiddenNeed',
          message: 'Hidden need description seems brief',
          suggestion: 'Provide more detail to capture the underlying motivation',
        });
      }
    }

    if ('evidence' in data && data.evidence) {
      if (data.evidence.length === 0) {
        warnings.push({
          field: 'evidence',
          message: 'No evidence provided',
          suggestion: 'Add evidence to support the hidden need hypothesis',
        });
      }
    }

    // Check that at least one driver is specified
    if ('emotionalDriver' in data || 'functionalDriver' in data || 'socialDriver' in data) {
      const hasDriver = data.emotionalDriver || data.functionalDriver || data.socialDriver;
      if (!hasDriver) {
        warnings.push({
          field: 'drivers',
          message: 'No drivers specified',
          suggestion: 'Identify at least one emotional, functional, or social driver',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async getQualityMetrics(): Promise<DataQualityMetrics> {
    const needs = await prisma.hiddenNeed.findMany();
    const issues: string[] = [];

    let completenessScore = 0;
    let accuracyScore = 0;

    for (const n of needs) {
      // Completeness check
      let fieldsFilled = 0;
      const totalFields = 9;
      if (n.surfaceNeed) fieldsFilled++;
      if (n.hiddenNeed) fieldsFilled++;
      if (n.rootCause) fieldsFilled++;
      if (n.customerSegment) fieldsFilled++;
      if (n.emotionalDriver) fieldsFilled++;
      if (n.functionalDriver) fieldsFilled++;
      if (n.socialDriver) fieldsFilled++;
      if (n.validationLevel) fieldsFilled++;
      if (n.evidence.length > 0) fieldsFilled++;
      completenessScore += fieldsFilled / totalFields;

      // Accuracy check (validation level and evidence)
      if (n.validationLevel !== 'HYPOTHESIS' && n.evidence.length > 0) {
        accuracyScore += 1;
      } else {
        if (n.validationLevel === 'HYPOTHESIS') {
          issues.push(`Need "${n.surfaceNeed.substring(0, 30)}..." is still a hypothesis`);
        }
      }
    }

    const count = needs.length || 1;
    const completeness = completenessScore / count;
    const accuracy = accuracyScore / count;
    const consistency = 1;
    const timeliness = 1;

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
  async search(query: string, options?: { fields?: string[]; limit?: number }): Promise<HiddenNeedData[]> {
    const { limit = 10 } = options || {};

    const needs = await prisma.hiddenNeed.findMany({
      where: {
        OR: [
          { surfaceNeed: { contains: query, mode: 'insensitive' } },
          { hiddenNeed: { contains: query, mode: 'insensitive' } },
          { rootCause: { contains: query, mode: 'insensitive' } },
          { customerSegment: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });

    return needs.map(this.mapToData);
  }

  async findByKeywords(keywords: string[]): Promise<HiddenNeedData[]> {
    const needs = await prisma.hiddenNeed.findMany({
      where: {
        OR: keywords.flatMap((keyword) => [
          { surfaceNeed: { contains: keyword, mode: 'insensitive' } },
          { hiddenNeed: { contains: keyword, mode: 'insensitive' } },
        ]),
      },
    });

    return needs.map(this.mapToData);
  }

  // IAnalyzableConnector implementation
  async analyze(id: string): Promise<NeedInsightResult[]> {
    const need = await prisma.hiddenNeed.findUnique({
      where: { id },
      include: { insights: true },
    });

    if (!need) {
      throw new Error(`Hidden need not found: ${id}`);
    }

    // Generate insights based on the need data
    const newInsights: { insight: string; actionable: boolean; priority: number }[] = [];

    // Emotional insight
    if (need.emotionalDriver) {
      newInsights.push({
        insight: `Address emotional need: ${need.emotionalDriver}`,
        actionable: true,
        priority: 1,
      });
    }

    // Functional insight
    if (need.functionalDriver) {
      newInsights.push({
        insight: `Solve functional requirement: ${need.functionalDriver}`,
        actionable: true,
        priority: 2,
      });
    }

    // Social insight
    if (need.socialDriver) {
      newInsights.push({
        insight: `Consider social context: ${need.socialDriver}`,
        actionable: true,
        priority: 3,
      });
    }

    // Root cause insight
    newInsights.push({
      insight: `Root cause to address: ${need.rootCause}`,
      actionable: true,
      priority: 0,
    });

    // Save new insights
    const savedInsights = await Promise.all(
      newInsights.map((insight) =>
        prisma.needInsight.create({
          data: {
            hiddenNeedId: id,
            ...insight,
          },
        })
      )
    );

    return savedInsights.map((i) => ({
      id: i.id,
      hiddenNeedId: i.hiddenNeedId,
      insight: i.insight,
      actionable: i.actionable,
      priority: i.priority,
    }));
  }

  async analyzeMany(ids: string[]): Promise<NeedInsightResult[][]> {
    return Promise.all(ids.map((id) => this.analyze(id)));
  }

  async getRelated(id: string, options?: { limit?: number }): Promise<HiddenNeedData[]> {
    const { limit = 5 } = options || {};

    const need = await prisma.hiddenNeed.findUnique({
      where: { id },
    });

    if (!need) {
      return [];
    }

    // Find related needs by segment
    const related = await prisma.hiddenNeed.findMany({
      where: {
        id: { not: id },
        customerSegment: { contains: need.customerSegment, mode: 'insensitive' },
      },
      take: limit,
    });

    return related.map(this.mapToData);
  }

  // Get existing insights for a need
  async getInsights(id: string): Promise<NeedInsightResult[]> {
    const insights = await prisma.needInsight.findMany({
      where: { hiddenNeedId: id },
      orderBy: { priority: 'asc' },
    });

    return insights.map((i) => ({
      id: i.id,
      hiddenNeedId: i.hiddenNeedId,
      insight: i.insight,
      actionable: i.actionable,
      priority: i.priority,
    }));
  }

  // Update validation level with evidence
  async updateValidation(
    id: string,
    validationLevel: ValidationLevel,
    evidence: string[]
  ): Promise<HiddenNeedData> {
    const need = await prisma.hiddenNeed.update({
      where: { id },
      data: {
        validationLevel,
        evidence: { push: evidence },
      },
    });
    return this.mapToData(need);
  }

  // Helper methods
  private mapToData(need: {
    id: string;
    surfaceNeed: string;
    hiddenNeed: string;
    rootCause: string;
    customerSegment: string;
    emotionalDriver: string | null;
    functionalDriver: string | null;
    socialDriver: string | null;
    validationLevel: string;
    evidence: string[];
  }): HiddenNeedData {
    return {
      id: need.id,
      surfaceNeed: need.surfaceNeed,
      hiddenNeed: need.hiddenNeed,
      rootCause: need.rootCause,
      customerSegment: need.customerSegment,
      emotionalDriver: need.emotionalDriver || undefined,
      functionalDriver: need.functionalDriver || undefined,
      socialDriver: need.socialDriver || undefined,
      validationLevel: need.validationLevel as ValidationLevel,
      evidence: need.evidence,
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
        case 'contains':
          where[filter.field] = { contains: filter.value, mode: 'insensitive' };
          break;
        case 'in':
          where[filter.field] = { in: filter.value };
          break;
      }
    }

    return where;
  }
}

export const hiddenNeedConnector = new HiddenNeedConnector();
