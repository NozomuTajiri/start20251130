/**
 * Partner DB Connector
 * 2.10 パートナーDB連携
 */

import { prisma } from '@/lib/prisma';
import type { IDataConnector, ISearchableConnector } from '../interfaces/IDataConnector';
import type {
  PartnerData,
  PartnerType,
  RelationshipStatus,
  PaginationParams,
  PaginatedResult,
  QueryFilter,
  DataQualityMetrics,
  DataValidationResult,
} from '../types';

type PartnerCreateInput = Omit<PartnerData, 'id'>;
type PartnerUpdateInput = Partial<PartnerCreateInput>;

export class PartnerConnector
  implements
    IDataConnector<PartnerData, PartnerCreateInput, PartnerUpdateInput>,
    ISearchableConnector<PartnerData>
{
  async findById(id: string): Promise<PartnerData | null> {
    const partner = await prisma.partner.findUnique({ where: { id } });
    return partner ? this.mapToData(partner) : null;
  }

  async findMany(params?: {
    filters?: QueryFilter[];
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<PartnerData>> {
    const { filters = [], pagination = {} } = params || {};
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.partner.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
      prisma.partner.count({ where }),
    ]);

    return { data: data.map(this.mapToData), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByType(type: PartnerType): Promise<PartnerData[]> {
    const partners = await prisma.partner.findMany({ where: { type } });
    return partners.map(this.mapToData);
  }

  async findByStatus(status: RelationshipStatus): Promise<PartnerData[]> {
    const partners = await prisma.partner.findMany({ where: { relationshipStatus: status } });
    return partners.map(this.mapToData);
  }

  async findActivePartners(): Promise<PartnerData[]> {
    const partners = await prisma.partner.findMany({ where: { relationshipStatus: 'ACTIVE' } });
    return partners.map(this.mapToData);
  }

  async create(data: PartnerCreateInput): Promise<PartnerData> {
    const partner = await prisma.partner.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        industry: data.industry,
        capabilities: data.capabilities,
        relationshipStatus: data.relationshipStatus,
      },
    });
    return this.mapToData(partner);
  }

  async createMany(data: PartnerCreateInput[]): Promise<PartnerData[]> {
    return Promise.all(data.map((item) => this.create(item)));
  }

  async update(id: string, data: PartnerUpdateInput): Promise<PartnerData> {
    const partner = await prisma.partner.update({ where: { id }, data });
    return this.mapToData(partner);
  }

  async delete(id: string): Promise<void> {
    await prisma.partner.delete({ where: { id } });
  }

  async validate(data: PartnerCreateInput | PartnerUpdateInput): Promise<DataValidationResult> {
    const errors: DataValidationResult['errors'] = [];
    const warnings: DataValidationResult['warnings'] = [];

    if ('name' in data && data.name && data.name.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters', code: 'MIN_LENGTH' });
    }

    if ('capabilities' in data && data.capabilities && data.capabilities.length === 0) {
      warnings.push({ field: 'capabilities', message: 'Consider adding partner capabilities' });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  async getQualityMetrics(): Promise<DataQualityMetrics> {
    const partners = await prisma.partner.findMany();
    const count = partners.length || 1;
    let completenessScore = 0;

    for (const p of partners) {
      let filled = 0;
      if (p.name) filled++;
      if (p.description) filled++;
      if (p.type) filled++;
      if (p.industry.length > 0) filled++;
      if (p.capabilities.length > 0) filled++;
      completenessScore += filled / 5;
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

  async search(query: string, options?: { limit?: number }): Promise<PartnerData[]> {
    const { limit = 10 } = options || {};
    const partners = await prisma.partner.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
    });
    return partners.map(this.mapToData);
  }

  async findByKeywords(keywords: string[]): Promise<PartnerData[]> {
    const partners = await prisma.partner.findMany({
      where: {
        OR: keywords.map((k) => ({
          OR: [
            { name: { contains: k, mode: 'insensitive' } },
            { capabilities: { has: k } },
            { industry: { has: k } },
          ],
        })),
      },
    });
    return partners.map(this.mapToData);
  }

  private mapToData(p: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    industry: string[];
    capabilities: string[];
    relationshipStatus: string;
  }): PartnerData {
    return {
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      type: p.type as PartnerType,
      industry: p.industry,
      capabilities: p.capabilities,
      relationshipStatus: p.relationshipStatus as RelationshipStatus,
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

export const partnerConnector = new PartnerConnector();
