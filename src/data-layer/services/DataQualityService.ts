/**
 * Data Quality Management Service
 * 2.5 データ標準化エンジン + 2.6 データ品質管理システム
 */

import { prisma } from '@/lib/prisma';
import type { DataQualityMetrics, DataValidationResult } from '../types';

export interface QualityCheckResult {
  dataSourceId: string;
  dataSourceName: string;
  metrics: DataQualityMetrics;
  recommendations: string[];
  timestamp: Date;
}

export interface StandardizationRule {
  field: string;
  type: 'trim' | 'lowercase' | 'uppercase' | 'normalize' | 'custom';
  options?: Record<string, unknown>;
}

export class DataQualityService {
  /**
   * Run quality check on all data sources
   */
  async runQualityCheck(): Promise<QualityCheckResult[]> {
    const dataSources = await prisma.dataSource.findMany();
    const results: QualityCheckResult[] = [];

    for (const source of dataSources) {
      const metrics = await this.calculateMetrics(source.id);
      const recommendations = this.generateRecommendations(metrics);

      // Save quality metrics
      await prisma.dataQuality.create({
        data: {
          dataSourceId: source.id,
          completeness: metrics.completeness,
          accuracy: metrics.accuracy,
          consistency: metrics.consistency,
          timeliness: metrics.timeliness,
          overallScore: metrics.overallScore,
          issues: metrics.issues,
        },
      });

      results.push({
        dataSourceId: source.id,
        dataSourceName: source.name,
        metrics,
        recommendations,
        timestamp: new Date(),
      });
    }

    return results;
  }

  /**
   * Calculate quality metrics for a specific data source
   */
  async calculateMetrics(dataSourceId: string): Promise<DataQualityMetrics> {
    const source = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
      include: { qualityMetrics: { orderBy: { checkedAt: 'desc' }, take: 1 } },
    });

    if (!source) {
      throw new Error(`Data source not found: ${dataSourceId}`);
    }

    // Get the latest metrics or calculate new ones
    const latestMetrics = source.qualityMetrics[0];

    if (latestMetrics) {
      return {
        completeness: latestMetrics.completeness,
        accuracy: latestMetrics.accuracy,
        consistency: latestMetrics.consistency,
        timeliness: latestMetrics.timeliness,
        overallScore: latestMetrics.overallScore,
        issues: latestMetrics.issues,
      };
    }

    // Default metrics for new data sources
    return {
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      timeliness: 0,
      overallScore: 0,
      issues: ['No quality data available yet'],
    };
  }

  /**
   * Generate recommendations based on quality metrics
   */
  generateRecommendations(metrics: DataQualityMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.completeness < 0.8) {
      recommendations.push('Improve data completeness by filling in missing required fields');
    }

    if (metrics.accuracy < 0.8) {
      recommendations.push('Validate data against source of truth to improve accuracy');
    }

    if (metrics.consistency < 0.8) {
      recommendations.push('Standardize data formats and enforce validation rules');
    }

    if (metrics.timeliness < 0.8) {
      recommendations.push('Increase sync frequency or implement real-time updates');
    }

    if (metrics.overallScore < 0.7) {
      recommendations.push('Consider a comprehensive data quality improvement initiative');
    }

    if (metrics.issues.length > 5) {
      recommendations.push('Address the top issues to significantly improve data quality');
    }

    return recommendations;
  }

  /**
   * Standardize data using rules
   */
  standardize<T extends Record<string, unknown>>(
    data: T,
    rules: StandardizationRule[]
  ): T {
    const result: Record<string, unknown> = { ...data };

    for (const rule of rules) {
      const value = result[rule.field];
      if (typeof value !== 'string') continue;

      switch (rule.type) {
        case 'trim':
          result[rule.field] = value.trim();
          break;
        case 'lowercase':
          result[rule.field] = value.toLowerCase();
          break;
        case 'uppercase':
          result[rule.field] = value.toUpperCase();
          break;
        case 'normalize':
          result[rule.field] = this.normalizeString(value);
          break;
        case 'custom':
          if (rule.options?.transformer && typeof rule.options.transformer === 'function') {
            result[rule.field] = rule.options.transformer(value);
          }
          break;
      }
    }

    return result as T;
  }

  /**
   * Validate data against schema
   */
  validateData<T extends Record<string, unknown>>(
    data: T,
    requiredFields: string[],
    fieldTypes?: Record<string, string>
  ): DataValidationResult {
    const errors: DataValidationResult['errors'] = [];
    const warnings: DataValidationResult['warnings'] = [];

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in data) || data[field] === null || data[field] === undefined || data[field] === '') {
        errors.push({
          field,
          message: `Required field "${field}" is missing or empty`,
          code: 'REQUIRED_FIELD',
        });
      }
    }

    // Check field types
    if (fieldTypes) {
      for (const [field, expectedType] of Object.entries(fieldTypes)) {
        if (field in data && data[field] !== null && data[field] !== undefined) {
          const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
          if (actualType !== expectedType) {
            errors.push({
              field,
              message: `Field "${field}" expected ${expectedType} but got ${actualType}`,
              code: 'TYPE_MISMATCH',
            });
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Detect duplicates in a dataset
   */
  detectDuplicates<T extends Record<string, unknown>>(
    data: T[],
    keyFields: string[]
  ): { duplicates: T[][]; uniqueRecords: T[] } {
    const seen = new Map<string, T[]>();
    const uniqueRecords: T[] = [];

    for (const record of data) {
      const key = keyFields.map((f) => String(record[f])).join('|');

      if (seen.has(key)) {
        seen.get(key)!.push(record);
      } else {
        seen.set(key, [record]);
        uniqueRecords.push(record);
      }
    }

    const duplicates = Array.from(seen.values()).filter((group) => group.length > 1);

    return { duplicates, uniqueRecords };
  }

  /**
   * Calculate completeness score
   */
  calculateCompleteness(
    record: Record<string, unknown>,
    requiredFields: string[]
  ): number {
    let filledCount = 0;

    for (const field of requiredFields) {
      const value = record[field];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          filledCount++;
        } else if (!Array.isArray(value)) {
          filledCount++;
        }
      }
    }

    return filledCount / requiredFields.length;
  }

  /**
   * Get quality history for a data source
   */
  async getQualityHistory(
    dataSourceId: string,
    days: number = 30
  ): Promise<{
    date: Date;
    overallScore: number;
  }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const metrics = await prisma.dataQuality.findMany({
      where: {
        dataSourceId,
        checkedAt: { gte: since },
      },
      orderBy: { checkedAt: 'asc' },
      select: {
        checkedAt: true,
        overallScore: true,
      },
    });

    return metrics.map((m) => ({
      date: m.checkedAt,
      overallScore: m.overallScore,
    }));
  }

  /**
   * Get aggregated quality dashboard data
   */
  async getQualityDashboard(): Promise<{
    overallScore: number;
    byDataSource: {
      id: string;
      name: string;
      score: number;
      issues: number;
    }[];
    recentIssues: string[];
    trend: 'improving' | 'declining' | 'stable';
  }> {
    const dataSources = await prisma.dataSource.findMany({
      include: {
        qualityMetrics: { orderBy: { checkedAt: 'desc' }, take: 2 },
      },
    });

    let totalScore = 0;
    let scoreCount = 0;
    const recentIssues: string[] = [];
    const byDataSource: {
      id: string;
      name: string;
      score: number;
      issues: number;
    }[] = [];

    let improvingCount = 0;
    let decliningCount = 0;

    for (const source of dataSources) {
      const latest = source.qualityMetrics[0];
      const previous = source.qualityMetrics[1];

      if (latest) {
        totalScore += latest.overallScore;
        scoreCount++;
        recentIssues.push(...latest.issues.slice(0, 3));

        byDataSource.push({
          id: source.id,
          name: source.name,
          score: latest.overallScore,
          issues: latest.issues.length,
        });

        if (previous) {
          if (latest.overallScore > previous.overallScore) {
            improvingCount++;
          } else if (latest.overallScore < previous.overallScore) {
            decliningCount++;
          }
        }
      }
    }

    const overallScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (improvingCount > decliningCount) trend = 'improving';
    else if (decliningCount > improvingCount) trend = 'declining';

    return {
      overallScore,
      byDataSource,
      recentIssues: recentIssues.slice(0, 10),
      trend,
    };
  }

  // Helper methods
  private normalizeString(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFKC')
      .replace(/\s+/g, ' ');
  }
}

export const dataQualityService = new DataQualityService();
