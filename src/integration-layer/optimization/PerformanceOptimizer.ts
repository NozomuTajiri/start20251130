/**
 * Performance Optimizer
 * 6.3 パフォーマンス最適化（メモリ92%最大活用）
 */

import type {
  PerformanceMetrics,
  CPUMetrics,
  MemoryMetrics,
  NetworkMetrics,
  DatabaseMetrics,
  CacheMetrics,
  OptimizationTarget,
  OptimizationResult,
} from '../types';

/**
 * パフォーマンスモニター
 */
export class PerformanceMonitor {
  private metricsHistory: PerformanceMetrics[] = [];
  private readonly maxHistorySize = 1000;

  /**
   * 現在のメトリクスを収集
   */
  collectMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      cpu: this.collectCPUMetrics(),
      memory: this.collectMemoryMetrics(),
      network: this.collectNetworkMetrics(),
      database: this.collectDatabaseMetrics(),
      cache: this.collectCacheMetrics(),
    };

    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    return metrics;
  }

  private collectCPUMetrics(): CPUMetrics {
    // Node.js環境でのCPUメトリクス収集（シミュレーション）
    const cores = 4;

    return {
      usage: Math.random() * 60 + 20, // シミュレーション: 20-80%
      loadAverage: [1.2, 1.5, 1.8] as [number, number, number],
      cores,
    };
  }

  private collectMemoryMetrics(): MemoryMetrics {
    // Node.js環境でのメモリメトリクス
    const memoryUsage = typeof process !== 'undefined' ? process.memoryUsage?.() : undefined;
    const total = 16 * 1024 * 1024 * 1024; // 16GB仮定
    const heapTotal = memoryUsage?.heapTotal || 512 * 1024 * 1024;
    const heapUsed = memoryUsage?.heapUsed || 256 * 1024 * 1024;
    const external = memoryUsage?.external || 10 * 1024 * 1024;

    // 目標: メモリ92%最大活用
    const targetUsage = total * 0.92;
    const used = Math.min(heapUsed + external + 1024 * 1024 * 100, targetUsage);

    return {
      total,
      used,
      free: total - used,
      heapTotal,
      heapUsed,
      external,
      percentage: (used / total) * 100,
    };
  }

  private collectNetworkMetrics(): NetworkMetrics {
    return {
      requestsPerSecond: Math.random() * 1000 + 100,
      averageLatency: Math.random() * 50 + 10,
      p50Latency: Math.random() * 30 + 5,
      p95Latency: Math.random() * 100 + 30,
      p99Latency: Math.random() * 200 + 50,
      errorRate: Math.random() * 0.5,
      bytesIn: Math.random() * 1024 * 1024 * 10,
      bytesOut: Math.random() * 1024 * 1024 * 50,
    };
  }

  private collectDatabaseMetrics(): DatabaseMetrics {
    return {
      connectionPoolSize: 20,
      activeConnections: Math.floor(Math.random() * 15) + 1,
      queryCount: Math.floor(Math.random() * 10000) + 1000,
      averageQueryTime: Math.random() * 50 + 5,
      slowQueries: Math.floor(Math.random() * 10),
      errors: Math.floor(Math.random() * 5),
    };
  }

  private collectCacheMetrics(): CacheMetrics {
    const maxSize = 1024 * 1024 * 512; // 512MB
    const size = Math.random() * maxSize * 0.9;

    return {
      hitRate: 85 + Math.random() * 10,
      missRate: 5 + Math.random() * 5,
      size,
      maxSize,
      evictions: Math.floor(Math.random() * 100),
    };
  }

  /**
   * メトリクス履歴を取得
   */
  getHistory(count?: number): PerformanceMetrics[] {
    if (count) {
      return this.metricsHistory.slice(-count);
    }
    return [...this.metricsHistory];
  }

  /**
   * 平均メトリクスを計算
   */
  getAverageMetrics(duration: number = 60000): Partial<PerformanceMetrics> {
    const cutoff = Date.now() - duration;
    const recent = this.metricsHistory.filter((m) => m.timestamp.getTime() > cutoff);

    if (recent.length === 0) return {};

    const avgCPU = recent.reduce((sum, m) => sum + m.cpu.usage, 0) / recent.length;
    const avgMemory = recent.reduce((sum, m) => sum + m.memory.percentage, 0) / recent.length;
    const avgLatency = recent.reduce((sum, m) => sum + m.network.averageLatency, 0) / recent.length;

    return {
      cpu: { usage: avgCPU, loadAverage: [0, 0, 0], cores: recent[0].cpu.cores },
      memory: { ...recent[recent.length - 1].memory, percentage: avgMemory },
      network: { ...recent[recent.length - 1].network, averageLatency: avgLatency },
    };
  }
}

/**
 * パフォーマンスオプティマイザー
 */
export class PerformanceOptimizer {
  private monitor: PerformanceMonitor;
  private optimizations: Map<string, OptimizationResult> = new Map();
  private targets: OptimizationTarget[] = [];

  constructor(monitor?: PerformanceMonitor) {
    this.monitor = monitor || new PerformanceMonitor();
    this.initializeDefaultTargets();
  }

  private initializeDefaultTargets(): void {
    this.targets = [
      {
        metric: 'memory.percentage',
        current: 0,
        target: 92, // メモリ92%最大活用
        priority: 'high',
      },
      {
        metric: 'network.p99Latency',
        current: 0,
        target: 100, // 100ms以下
        priority: 'critical',
      },
      {
        metric: 'cache.hitRate',
        current: 0,
        target: 95, // 95%以上
        priority: 'high',
      },
      {
        metric: 'database.averageQueryTime',
        current: 0,
        target: 20, // 20ms以下
        priority: 'medium',
      },
      {
        metric: 'cpu.usage',
        current: 0,
        target: 70, // 70%以下
        priority: 'medium',
      },
    ];
  }

  /**
   * 最適化対象を追加
   */
  addTarget(target: OptimizationTarget): void {
    this.targets.push(target);
  }

  /**
   * 最適化を実行
   */
  async optimize(): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    const metrics = this.monitor.collectMetrics();

    for (const target of this.targets) {
      const current = this.extractMetricValue(metrics, target.metric);
      target.current = current;

      if (this.needsOptimization(target, current)) {
        const result = await this.applyOptimization(target, current);
        results.push(result);
        this.optimizations.set(result.id, result);
      }
    }

    return results;
  }

  private extractMetricValue(metrics: PerformanceMetrics, path: string): number {
    const parts = path.split('.');
    let value: unknown = metrics;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return 0;
      }
    }

    return typeof value === 'number' ? value : 0;
  }

  private needsOptimization(target: OptimizationTarget, current: number): boolean {
    // メトリクスによって最適化方向が異なる
    const lowerIsBetter = [
      'network.p99Latency',
      'network.averageLatency',
      'database.averageQueryTime',
      'cpu.usage',
    ];

    if (lowerIsBetter.includes(target.metric)) {
      return current > target.target;
    }
    return current < target.target;
  }

  private async applyOptimization(
    target: OptimizationTarget,
    current: number
  ): Promise<OptimizationResult> {
    const id = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const applied = new Date();

    // シミュレーション: 最適化適用
    const improvement = this.calculateImprovement(target, current);
    const after = this.calculateAfterValue(target, current, improvement);

    return {
      id,
      target,
      applied,
      before: current,
      after,
      improvement,
      success: true,
      rollbackAvailable: true,
    };
  }

  private calculateImprovement(target: OptimizationTarget, current: number): number {
    const difference = Math.abs(target.target - current);
    // 改善率: 10-30%
    return difference * (0.1 + Math.random() * 0.2);
  }

  private calculateAfterValue(
    target: OptimizationTarget,
    current: number,
    improvement: number
  ): number {
    const lowerIsBetter = [
      'network.p99Latency',
      'network.averageLatency',
      'database.averageQueryTime',
      'cpu.usage',
    ];

    if (lowerIsBetter.includes(target.metric)) {
      return current - improvement;
    }
    return current + improvement;
  }

  /**
   * 最適化をロールバック
   */
  async rollback(optimizationId: string): Promise<boolean> {
    const optimization = this.optimizations.get(optimizationId);
    if (!optimization || !optimization.rollbackAvailable) {
      return false;
    }

    // シミュレーション: ロールバック実行
    optimization.rollbackAvailable = false;
    return true;
  }

  /**
   * 最適化レポートを生成
   */
  generateReport(): OptimizationReport {
    const metrics = this.monitor.collectMetrics();
    const history = this.monitor.getHistory(100);
    const avgMetrics = this.monitor.getAverageMetrics(300000); // 5分平均

    return {
      timestamp: new Date(),
      currentMetrics: metrics,
      averageMetrics: avgMetrics,
      targets: this.targets.map((t) => ({
        ...t,
        current: this.extractMetricValue(metrics, t.metric),
        status: this.getTargetStatus(t, this.extractMetricValue(metrics, t.metric)),
      })),
      recentOptimizations: Array.from(this.optimizations.values()).slice(-10),
      recommendations: this.generateRecommendations(metrics),
      healthScore: this.calculateHealthScore(metrics),
      trend: this.calculateTrend(history),
    };
  }

  private getTargetStatus(
    target: OptimizationTarget,
    current: number
  ): 'achieved' | 'in_progress' | 'needs_attention' {
    if (!this.needsOptimization(target, current)) {
      return 'achieved';
    }
    const difference = Math.abs(target.target - current);
    const threshold = Math.abs(target.target) * 0.1; // 10%以内なら進行中
    return difference <= threshold ? 'in_progress' : 'needs_attention';
  }

  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.memory.percentage > 92) {
      recommendations.push('メモリ使用量が目標(92%)を超えています。不要なキャッシュの解放を検討してください。');
    }

    if (metrics.network.p99Latency > 100) {
      recommendations.push('P99レイテンシが100msを超えています。クエリの最適化を検討してください。');
    }

    if (metrics.cache.hitRate < 90) {
      recommendations.push('キャッシュヒット率が90%未満です。キャッシュ戦略の見直しを検討してください。');
    }

    if (metrics.database.slowQueries > 5) {
      recommendations.push('スロークエリが検出されています。インデックスの追加を検討してください。');
    }

    if (metrics.cpu.usage > 70) {
      recommendations.push('CPU使用率が70%を超えています。水平スケーリングを検討してください。');
    }

    return recommendations;
  }

  private calculateHealthScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // CPU: 70%以下が理想
    if (metrics.cpu.usage > 70) {
      score -= (metrics.cpu.usage - 70) * 0.5;
    }

    // メモリ: 92%が目標
    const memoryDiff = Math.abs(metrics.memory.percentage - 92);
    score -= memoryDiff * 0.3;

    // P99レイテンシ: 100ms以下
    if (metrics.network.p99Latency > 100) {
      score -= (metrics.network.p99Latency - 100) * 0.1;
    }

    // キャッシュヒット率: 95%以上
    if (metrics.cache.hitRate < 95) {
      score -= (95 - metrics.cache.hitRate) * 0.5;
    }

    // エラー率
    score -= metrics.network.errorRate * 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateTrend(
    history: PerformanceMetrics[]
  ): 'improving' | 'stable' | 'degrading' {
    if (history.length < 10) return 'stable';

    const recent = history.slice(-10);
    const older = history.slice(-20, -10);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, m) => sum + m.network.averageLatency, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.network.averageLatency, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change < -5) return 'improving';
    if (change > 5) return 'degrading';
    return 'stable';
  }
}

export interface OptimizationReport {
  timestamp: Date;
  currentMetrics: PerformanceMetrics;
  averageMetrics: Partial<PerformanceMetrics>;
  targets: (OptimizationTarget & {
    status: 'achieved' | 'in_progress' | 'needs_attention';
  })[];
  recentOptimizations: OptimizationResult[];
  recommendations: string[];
  healthScore: number;
  trend: 'improving' | 'stable' | 'degrading';
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor();
export const performanceOptimizer = new PerformanceOptimizer(performanceMonitor);
