/**
 * Value Template DB Connector
 * 2.3 バリューテンプレートDB連携 (P0)
 */

import { prisma } from '@/lib/prisma';
import type { IDataConnector, ISearchableConnector } from '../interfaces/IDataConnector';
import type {
  ValueTemplateData,
  PaginationParams,
  PaginatedResult,
  QueryFilter,
  DataQualityMetrics,
  DataValidationResult,
  ValueCategory,
} from '../types';

type ValueTemplateCreateInput = Omit<ValueTemplateData, 'id'>;
type ValueTemplateUpdateInput = Partial<ValueTemplateCreateInput>;

export class ValueTemplateConnector
  implements
    IDataConnector<ValueTemplateData, ValueTemplateCreateInput, ValueTemplateUpdateInput>,
    ISearchableConnector<ValueTemplateData>
{
  async findById(id: string): Promise<ValueTemplateData | null> {
    const template = await prisma.valueTemplate.findUnique({
      where: { id },
    });
    return template ? this.mapToData(template) : null;
  }

  async findMany(params?: {
    filters?: QueryFilter[];
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<ValueTemplateData>> {
    const { filters = [], pagination = {} } = params || {};
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.valueTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.valueTemplate.count({ where }),
    ]);

    return {
      data: data.map(this.mapToData),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCategory(category: ValueCategory): Promise<ValueTemplateData[]> {
    const templates = await prisma.valueTemplate.findMany({
      where: { category },
    });
    return templates.map(this.mapToData);
  }

  async findByTargetSegment(segment: string): Promise<ValueTemplateData[]> {
    const templates = await prisma.valueTemplate.findMany({
      where: {
        targetSegment: { contains: segment, mode: 'insensitive' },
      },
    });
    return templates.map(this.mapToData);
  }

  async create(data: ValueTemplateCreateInput): Promise<ValueTemplateData> {
    const template = await prisma.valueTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        targetSegment: data.targetSegment,
        valueProposition: data.valueProposition,
        keyBenefits: data.keyBenefits,
        useCases: data.useCases,
        successMetrics: data.successMetrics,
      },
    });
    return this.mapToData(template);
  }

  async createMany(data: ValueTemplateCreateInput[]): Promise<ValueTemplateData[]> {
    const results = await Promise.all(data.map((item) => this.create(item)));
    return results;
  }

  async update(id: string, data: ValueTemplateUpdateInput): Promise<ValueTemplateData> {
    const template = await prisma.valueTemplate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.targetSegment && { targetSegment: data.targetSegment }),
        ...(data.valueProposition && { valueProposition: data.valueProposition }),
        ...(data.keyBenefits && { keyBenefits: data.keyBenefits }),
        ...(data.useCases && { useCases: data.useCases }),
        ...(data.successMetrics && { successMetrics: data.successMetrics }),
      },
    });
    return this.mapToData(template);
  }

  async delete(id: string): Promise<void> {
    await prisma.valueTemplate.delete({ where: { id } });
  }

  async validate(data: ValueTemplateCreateInput | ValueTemplateUpdateInput): Promise<DataValidationResult> {
    const errors: DataValidationResult['errors'] = [];
    const warnings: DataValidationResult['warnings'] = [];

    if ('name' in data && data.name) {
      if (data.name.length < 3) {
        errors.push({ field: 'name', message: 'Name must be at least 3 characters', code: 'MIN_LENGTH' });
      }
    }

    if ('valueProposition' in data && data.valueProposition) {
      if (data.valueProposition.length < 20) {
        warnings.push({
          field: 'valueProposition',
          message: 'Value proposition seems short',
          suggestion: 'Consider adding more detail to clearly communicate the value',
        });
      }
    }

    if ('keyBenefits' in data && data.keyBenefits) {
      if (data.keyBenefits.length < 2) {
        warnings.push({
          field: 'keyBenefits',
          message: 'Consider adding more key benefits',
          suggestion: 'Templates with 3-5 key benefits tend to be more effective',
        });
      }
    }

    if ('successMetrics' in data && data.successMetrics) {
      if (data.successMetrics.length === 0) {
        warnings.push({
          field: 'successMetrics',
          message: 'No success metrics defined',
          suggestion: 'Define measurable success metrics to track value delivery',
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
    const templates = await prisma.valueTemplate.findMany();
    const issues: string[] = [];

    let completenessScore = 0;
    let accuracyScore = 0;

    for (const t of templates) {
      // Completeness check
      let fieldsFilled = 0;
      const totalFields = 8;
      if (t.name) fieldsFilled++;
      if (t.description) fieldsFilled++;
      if (t.category) fieldsFilled++;
      if (t.targetSegment) fieldsFilled++;
      if (t.valueProposition) fieldsFilled++;
      if (t.keyBenefits.length > 0) fieldsFilled++;
      if (t.useCases.length > 0) fieldsFilled++;
      if (t.successMetrics.length > 0) fieldsFilled++;
      completenessScore += fieldsFilled / totalFields;

      // Accuracy check (has metrics and use cases)
      if (t.successMetrics.length > 0 && t.useCases.length > 0) {
        accuracyScore += 1;
      } else {
        if (t.successMetrics.length === 0) {
          issues.push(`Template "${t.name}" has no success metrics`);
        }
        if (t.useCases.length === 0) {
          issues.push(`Template "${t.name}" has no use cases`);
        }
      }
    }

    const count = templates.length || 1;
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
  async search(query: string, options?: { fields?: string[]; limit?: number }): Promise<ValueTemplateData[]> {
    const { limit = 10 } = options || {};

    const templates = await prisma.valueTemplate.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { valueProposition: { contains: query, mode: 'insensitive' } },
          { targetSegment: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });

    return templates.map(this.mapToData);
  }

  async findByKeywords(keywords: string[]): Promise<ValueTemplateData[]> {
    const templates = await prisma.valueTemplate.findMany({
      where: {
        OR: keywords.map((keyword) => ({
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
            { keyBenefits: { has: keyword } },
          ],
        })),
      },
    });

    return templates.map(this.mapToData);
  }

  // Apply template to a specific context
  async applyTemplate(
    templateId: string,
    context: string,
    customization: string
  ): Promise<{ applicationId: string; template: ValueTemplateData }> {
    const template = await this.findById(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const application = await prisma.valueApplication.create({
      data: {
        templateId,
        context,
        customization,
      },
    });

    return {
      applicationId: application.id,
      template,
    };
  }

  // Get applications of a template
  async getApplications(templateId: string): Promise<{
    id: string;
    context: string;
    customization: string;
    results: string | null;
    appliedAt: Date;
  }[]> {
    const applications = await prisma.valueApplication.findMany({
      where: { templateId },
      orderBy: { appliedAt: 'desc' },
    });

    return applications;
  }

  // Helper methods
  private mapToData(template: {
    id: string;
    name: string;
    description: string;
    category: string;
    targetSegment: string;
    valueProposition: string;
    keyBenefits: string[];
    useCases: string[];
    successMetrics: string[];
  }): ValueTemplateData {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category as ValueCategory,
      targetSegment: template.targetSegment,
      valueProposition: template.valueProposition,
      keyBenefits: template.keyBenefits,
      useCases: template.useCases,
      successMetrics: template.successMetrics,
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

export const valueTemplateConnector = new ValueTemplateConnector();
