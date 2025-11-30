/**
 * Metadata Management Service
 * 2.7 メタデータ管理システム
 */

import { prisma } from '@/lib/prisma';
import type { DataSourceMetadata, DataSourceType, SyncStatus } from '../types';

export interface DataSourceConfig {
  name: string;
  type: DataSourceType;
  connectionInfo?: Record<string, unknown>;
  syncFrequency?: string;
}

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface DataLineage {
  sourceId: string;
  sourceName: string;
  transformations: string[];
  targetId?: string;
  targetName?: string;
}

export class MetadataService {
  /**
   * Register a new data source
   */
  async registerDataSource(config: DataSourceConfig): Promise<DataSourceMetadata> {
    const source = await prisma.dataSource.create({
      data: {
        name: config.name,
        type: config.type,
        connectionInfo: (config.connectionInfo || {}) as object,
        syncFrequency: config.syncFrequency,
        syncStatus: 'IDLE',
      },
    });

    return this.mapToMetadata(source);
  }

  /**
   * Get all registered data sources
   */
  async getDataSources(): Promise<DataSourceMetadata[]> {
    const sources = await prisma.dataSource.findMany({
      orderBy: { name: 'asc' },
    });

    return sources.map(this.mapToMetadata);
  }

  /**
   * Get a specific data source by ID
   */
  async getDataSource(id: string): Promise<DataSourceMetadata | null> {
    const source = await prisma.dataSource.findUnique({
      where: { id },
    });

    return source ? this.mapToMetadata(source) : null;
  }

  /**
   * Update data source configuration
   */
  async updateDataSource(
    id: string,
    config: Partial<DataSourceConfig>
  ): Promise<DataSourceMetadata> {
    const source = await prisma.dataSource.update({
      where: { id },
      data: {
        ...(config.name && { name: config.name }),
        ...(config.type && { type: config.type }),
        ...(config.connectionInfo && { connectionInfo: config.connectionInfo as object }),
        ...(config.syncFrequency && { syncFrequency: config.syncFrequency }),
      },
    });

    return this.mapToMetadata(source);
  }

  /**
   * Delete a data source
   */
  async deleteDataSource(id: string): Promise<void> {
    await prisma.dataSource.delete({ where: { id } });
  }

  /**
   * Update sync status
   */
  async updateSyncStatus(
    id: string,
    status: SyncStatus,
    syncedAt?: Date
  ): Promise<void> {
    await prisma.dataSource.update({
      where: { id },
      data: {
        syncStatus: status,
        ...(syncedAt && { lastSyncAt: syncedAt }),
      },
    });
  }

  /**
   * Get data source schema
   */
  async getSchema(id: string): Promise<Record<string, SchemaField[]>> {
    const source = await prisma.dataSource.findUnique({
      where: { id },
    });

    if (!source) {
      throw new Error(`Data source not found: ${id}`);
    }

    // Return predefined schemas based on data source type
    return this.getPredefinedSchema(source.type as DataSourceType);
  }

  /**
   * Get predefined schema for each entity type
   */
  private getPredefinedSchema(type: DataSourceType): Record<string, SchemaField[]> {
    const schemas: Record<string, Record<string, SchemaField[]>> = {
      DATABASE: {
        megatrends: [
          { name: 'id', type: 'string', required: true, description: 'Unique identifier' },
          { name: 'name', type: 'string', required: true, description: 'Megatrend name' },
          { name: 'description', type: 'string', required: true, description: 'Detailed description' },
          { name: 'category', type: 'string', required: true, description: 'Category classification' },
          { name: 'impact', type: 'enum', required: true, description: 'Impact level (LOW/MEDIUM/HIGH/CRITICAL)' },
          { name: 'timeframe', type: 'string', required: true, description: 'Expected timeframe' },
          { name: 'confidence', type: 'number', required: true, description: 'Confidence score (0-1)' },
          { name: 'sources', type: 'array', required: false, description: 'Source references' },
          { name: 'keywords', type: 'array', required: false, description: 'Related keywords' },
        ],
        valueTemplates: [
          { name: 'id', type: 'string', required: true, description: 'Unique identifier' },
          { name: 'name', type: 'string', required: true, description: 'Template name' },
          { name: 'description', type: 'string', required: true, description: 'Template description' },
          { name: 'category', type: 'enum', required: true, description: 'Value category' },
          { name: 'targetSegment', type: 'string', required: true, description: 'Target customer segment' },
          { name: 'valueProposition', type: 'string', required: true, description: 'Value proposition statement' },
          { name: 'keyBenefits', type: 'array', required: true, description: 'Key benefits list' },
          { name: 'useCases', type: 'array', required: false, description: 'Use cases' },
          { name: 'successMetrics', type: 'array', required: false, description: 'Success metrics' },
        ],
        hiddenNeeds: [
          { name: 'id', type: 'string', required: true, description: 'Unique identifier' },
          { name: 'surfaceNeed', type: 'string', required: true, description: 'Surface-level need' },
          { name: 'hiddenNeed', type: 'string', required: true, description: 'Underlying hidden need' },
          { name: 'rootCause', type: 'string', required: true, description: 'Root cause analysis' },
          { name: 'customerSegment', type: 'string', required: true, description: 'Customer segment' },
          { name: 'emotionalDriver', type: 'string', required: false, description: 'Emotional driver' },
          { name: 'functionalDriver', type: 'string', required: false, description: 'Functional driver' },
          { name: 'socialDriver', type: 'string', required: false, description: 'Social driver' },
          { name: 'validationLevel', type: 'enum', required: true, description: 'Validation level' },
          { name: 'evidence', type: 'array', required: false, description: 'Supporting evidence' },
        ],
      },
      API: {
        externalData: [
          { name: 'endpoint', type: 'string', required: true, description: 'API endpoint' },
          { name: 'method', type: 'string', required: true, description: 'HTTP method' },
          { name: 'headers', type: 'object', required: false, description: 'Request headers' },
          { name: 'responseFormat', type: 'string', required: true, description: 'Response format' },
        ],
      },
      FILE: {
        fileData: [
          { name: 'path', type: 'string', required: true, description: 'File path' },
          { name: 'format', type: 'string', required: true, description: 'File format' },
          { name: 'encoding', type: 'string', required: false, description: 'File encoding' },
        ],
      },
      MANUAL: {
        manualEntry: [
          { name: 'enteredBy', type: 'string', required: true, description: 'User who entered data' },
          { name: 'enteredAt', type: 'date', required: true, description: 'Entry timestamp' },
          { name: 'verified', type: 'boolean', required: false, description: 'Verification status' },
        ],
      },
      EXTERNAL_SERVICE: {
        serviceData: [
          { name: 'serviceId', type: 'string', required: true, description: 'External service ID' },
          { name: 'credentials', type: 'object', required: true, description: 'Service credentials' },
          { name: 'syncInterval', type: 'string', required: false, description: 'Sync interval' },
        ],
      },
    };

    return schemas[type] || {};
  }

  /**
   * Get data lineage information
   */
  async getDataLineage(entityType: string): Promise<DataLineage[]> {
    // This would typically trace data from source to destination
    // For now, return predefined lineage based on entity type
    const lineages: Record<string, DataLineage[]> = {
      megatrend: [
        {
          sourceId: 'external-research',
          sourceName: 'External Research Sources',
          transformations: ['Extract', 'Validate', 'Enrich with AI analysis'],
          targetId: 'megatrend-db',
          targetName: 'Megatrend Database',
        },
      ],
      valueTemplate: [
        {
          sourceId: 'success-cases',
          sourceName: 'Success Cases Database',
          transformations: ['Analyze patterns', 'Extract value propositions', 'Template generation'],
          targetId: 'value-template-db',
          targetName: 'Value Template Database',
        },
      ],
      hiddenNeed: [
        {
          sourceId: 'customer-research',
          sourceName: 'Customer Research Data',
          transformations: ['Interview analysis', 'Need extraction', 'Root cause analysis'],
          targetId: 'hidden-need-db',
          targetName: 'Hidden Needs Database',
        },
      ],
    };

    return lineages[entityType] || [];
  }

  /**
   * Get data source statistics
   */
  async getStatistics(): Promise<{
    totalSources: number;
    byType: Record<DataSourceType, number>;
    byStatus: Record<SyncStatus, number>;
    lastSyncOverview: {
      synced24h: number;
      synced7d: number;
      neverSynced: number;
    };
  }> {
    const sources = await prisma.dataSource.findMany();

    const byType: Record<DataSourceType, number> = {
      DATABASE: 0,
      API: 0,
      FILE: 0,
      MANUAL: 0,
      EXTERNAL_SERVICE: 0,
    };

    const byStatus: Record<SyncStatus, number> = {
      IDLE: 0,
      SYNCING: 0,
      SUCCESS: 0,
      FAILED: 0,
    };

    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    let synced24h = 0;
    let synced7d = 0;
    let neverSynced = 0;

    for (const source of sources) {
      byType[source.type as DataSourceType]++;
      byStatus[source.syncStatus as SyncStatus]++;

      if (!source.lastSyncAt) {
        neverSynced++;
      } else {
        const diff = now.getTime() - source.lastSyncAt.getTime();
        if (diff < day) synced24h++;
        else if (diff < day * 7) synced7d++;
      }
    }

    return {
      totalSources: sources.length,
      byType,
      byStatus,
      lastSyncOverview: {
        synced24h,
        synced7d,
        neverSynced,
      },
    };
  }

  /**
   * Search data sources
   */
  async searchDataSources(query: string): Promise<DataSourceMetadata[]> {
    const sources = await prisma.dataSource.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
    });

    return sources.map(this.mapToMetadata);
  }

  // Helper methods
  private mapToMetadata(source: {
    id: string;
    name: string;
    type: string;
    connectionInfo: unknown;
    lastSyncAt: Date | null;
    syncStatus: string;
  }): DataSourceMetadata {
    return {
      id: source.id,
      name: source.name,
      type: source.type as DataSourceType,
      lastSyncAt: source.lastSyncAt,
      syncStatus: source.syncStatus as SyncStatus,
      schema: (source.connectionInfo as Record<string, unknown>) || {},
    };
  }
}

export const metadataService = new MetadataService();
