/**
 * Multi-Dimensional Data Analysis Engine
 * 3.1 多次元データ解析エンジン
 */

import type {
  MultiDimensionalPoint,
  ClusterResult,
  CorrelationMatrix,
  DimensionReduction,
  MultiDimensionalAnalysis,
  DimensionWeight,
  AnalysisResult,
} from '../types';

export interface ClusteringOptions {
  method: 'kmeans' | 'hierarchical' | 'dbscan';
  numClusters?: number;
  minClusterSize?: number;
  distanceMetric?: 'euclidean' | 'manhattan' | 'cosine';
}

export interface AnalysisOptions {
  clustering?: ClusteringOptions;
  dimensionReduction?: {
    method: 'pca' | 'tsne' | 'umap';
    targetDimensions?: number;
  };
  outlierDetection?: {
    method: 'zscore' | 'iqr' | 'isolation_forest';
    threshold?: number;
  };
  weights?: DimensionWeight[];
}

export class MultiDimensionalAnalysisEngine {
  private defaultOptions: AnalysisOptions = {
    clustering: {
      method: 'kmeans',
      numClusters: 3,
      distanceMetric: 'euclidean',
    },
    outlierDetection: {
      method: 'zscore',
      threshold: 3,
    },
  };

  /**
   * Perform comprehensive multi-dimensional analysis
   */
  async analyze(
    points: MultiDimensionalPoint[],
    options?: AnalysisOptions
  ): Promise<AnalysisResult<MultiDimensionalAnalysis>> {
    const startTime = Date.now();
    const opts = { ...this.defaultOptions, ...options };

    if (points.length === 0) {
      throw new Error('No data points provided for analysis');
    }

    const dimensions = this.extractDimensions(points);

    // Apply weights if provided
    const weightedPoints = opts.weights
      ? this.applyWeights(points, opts.weights)
      : points;

    // Perform clustering
    const clusters = await this.performClustering(
      weightedPoints,
      opts.clustering!
    );

    // Calculate correlations
    const correlations = this.calculateCorrelations(points, dimensions);

    // Detect outliers
    const outliers = this.detectOutliers(
      points,
      opts.outlierDetection!
    );

    // Dimension reduction (optional)
    let dimensionReduction: DimensionReduction | undefined;
    if (opts.dimensionReduction) {
      dimensionReduction = await this.reduceDimensions(
        points,
        dimensions,
        opts.dimensionReduction
      );
    }

    const analysis: MultiDimensionalAnalysis = {
      clusters,
      correlations,
      dimensionReduction,
      outliers,
      summary: {
        totalPoints: points.length,
        dimensions: dimensions.length,
        optimalClusters: this.estimateOptimalClusters(points),
      },
    };

    return {
      data: analysis,
      confidence: this.calculateConfidence(analysis),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Extract dimension names from points
   */
  private extractDimensions(points: MultiDimensionalPoint[]): string[] {
    const dimensionSet = new Set<string>();
    for (const point of points) {
      Object.keys(point.dimensions).forEach((d) => dimensionSet.add(d));
    }
    return Array.from(dimensionSet);
  }

  /**
   * Apply dimension weights
   */
  private applyWeights(
    points: MultiDimensionalPoint[],
    weights: DimensionWeight[]
  ): MultiDimensionalPoint[] {
    const weightMap = new Map(weights.map((w) => [w.dimension, w.weight]));

    return points.map((point) => ({
      ...point,
      dimensions: Object.fromEntries(
        Object.entries(point.dimensions).map(([dim, val]) => [
          dim,
          val * (weightMap.get(dim) || 1),
        ])
      ),
    }));
  }

  /**
   * Perform clustering using k-means algorithm
   */
  private async performClustering(
    points: MultiDimensionalPoint[],
    options: ClusteringOptions
  ): Promise<ClusterResult[]> {
    const { numClusters = 3 } = options;
    const dimensions = this.extractDimensions(points);

    // Initialize centroids using k-means++ initialization
    const centroids = this.initializeCentroids(points, numClusters, dimensions);

    // Run k-means iterations
    const maxIterations = 100;
    let assignments = new Array(points.length).fill(0);
    let converged = false;

    for (let iter = 0; iter < maxIterations && !converged; iter++) {
      // Assign points to nearest centroid
      const newAssignments = points.map((point) =>
        this.findNearestCentroid(point, centroids, dimensions)
      );

      // Check for convergence
      converged = newAssignments.every((a, i) => a === assignments[i]);
      assignments = newAssignments;

      // Update centroids
      if (!converged) {
        this.updateCentroids(centroids, points, assignments, dimensions);
      }
    }

    // Build cluster results
    return this.buildClusterResults(
      points,
      assignments,
      centroids,
      numClusters,
      dimensions
    );
  }

  /**
   * Initialize centroids using k-means++ algorithm
   */
  private initializeCentroids(
    points: MultiDimensionalPoint[],
    k: number,
    dimensions: string[]
  ): Record<string, number>[] {
    const centroids: Record<string, number>[] = [];

    // Choose first centroid randomly
    const firstIdx = Math.floor(Math.random() * points.length);
    centroids.push({ ...points[firstIdx].dimensions });

    // Choose remaining centroids with probability proportional to distance
    for (let i = 1; i < k; i++) {
      const distances = points.map((point) => {
        const minDist = Math.min(
          ...centroids.map((c) => this.euclideanDistance(point.dimensions, c, dimensions))
        );
        return minDist * minDist;
      });

      const totalDist = distances.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalDist;

      for (let j = 0; j < points.length; j++) {
        random -= distances[j];
        if (random <= 0) {
          centroids.push({ ...points[j].dimensions });
          break;
        }
      }

      if (centroids.length === i) {
        // Fallback: add random point
        centroids.push({ ...points[Math.floor(Math.random() * points.length)].dimensions });
      }
    }

    return centroids;
  }

  /**
   * Find nearest centroid for a point
   */
  private findNearestCentroid(
    point: MultiDimensionalPoint,
    centroids: Record<string, number>[],
    dimensions: string[]
  ): number {
    let minDist = Infinity;
    let nearest = 0;

    for (let i = 0; i < centroids.length; i++) {
      const dist = this.euclideanDistance(point.dimensions, centroids[i], dimensions);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    }

    return nearest;
  }

  /**
   * Update centroids based on assigned points
   */
  private updateCentroids(
    centroids: Record<string, number>[],
    points: MultiDimensionalPoint[],
    assignments: number[],
    dimensions: string[]
  ): void {
    for (let i = 0; i < centroids.length; i++) {
      const clusterPoints = points.filter((_, idx) => assignments[idx] === i);
      if (clusterPoints.length === 0) continue;

      for (const dim of dimensions) {
        centroids[i][dim] =
          clusterPoints.reduce((sum, p) => sum + (p.dimensions[dim] || 0), 0) /
          clusterPoints.length;
      }
    }
  }

  /**
   * Build cluster results with metrics
   */
  private buildClusterResults(
    points: MultiDimensionalPoint[],
    assignments: number[],
    centroids: Record<string, number>[],
    numClusters: number,
    dimensions: string[]
  ): ClusterResult[] {
    const results: ClusterResult[] = [];

    for (let i = 0; i < numClusters; i++) {
      const clusterPoints = points.filter((_, idx) => assignments[idx] === i);

      if (clusterPoints.length === 0) continue;

      // Calculate cohesion (average distance to centroid)
      const cohesion =
        clusterPoints.reduce(
          (sum, p) => sum + this.euclideanDistance(p.dimensions, centroids[i], dimensions),
          0
        ) / clusterPoints.length;

      // Calculate separation (distance to nearest other centroid)
      const separation = Math.min(
        ...centroids
          .filter((_, idx) => idx !== i)
          .map((c) => this.euclideanDistance(centroids[i], c, dimensions))
      );

      results.push({
        clusterId: `cluster-${i}`,
        centroid: centroids[i],
        points: clusterPoints,
        cohesion: 1 / (1 + cohesion), // Normalize to 0-1
        separation: separation,
      });
    }

    return results;
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private euclideanDistance(
    a: Record<string, number>,
    b: Record<string, number>,
    dimensions: string[]
  ): number {
    let sum = 0;
    for (const dim of dimensions) {
      const diff = (a[dim] || 0) - (b[dim] || 0);
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * Calculate correlation matrix
   */
  private calculateCorrelations(
    points: MultiDimensionalPoint[],
    dimensions: string[]
  ): CorrelationMatrix {
    const n = points.length;
    const numDims = dimensions.length;
    const values: number[][] = Array(numDims)
      .fill(null)
      .map(() => Array(numDims).fill(0));

    const significantPairs: CorrelationMatrix['significantPairs'] = [];

    // Calculate means
    const means: Record<string, number> = {};
    for (const dim of dimensions) {
      means[dim] = points.reduce((sum, p) => sum + (p.dimensions[dim] || 0), 0) / n;
    }

    // Calculate standard deviations
    const stdDevs: Record<string, number> = {};
    for (const dim of dimensions) {
      const variance =
        points.reduce((sum, p) => sum + Math.pow((p.dimensions[dim] || 0) - means[dim], 2), 0) / n;
      stdDevs[dim] = Math.sqrt(variance);
    }

    // Calculate correlations
    for (let i = 0; i < numDims; i++) {
      for (let j = 0; j < numDims; j++) {
        if (i === j) {
          values[i][j] = 1;
          continue;
        }

        const dim1 = dimensions[i];
        const dim2 = dimensions[j];

        if (stdDevs[dim1] === 0 || stdDevs[dim2] === 0) {
          values[i][j] = 0;
          continue;
        }

        let covariance = 0;
        for (const point of points) {
          covariance +=
            ((point.dimensions[dim1] || 0) - means[dim1]) *
            ((point.dimensions[dim2] || 0) - means[dim2]);
        }
        covariance /= n;

        const correlation = covariance / (stdDevs[dim1] * stdDevs[dim2]);
        values[i][j] = correlation;

        // Track significant correlations
        if (Math.abs(correlation) > 0.5 && i < j) {
          // Approximate p-value using t-distribution
          const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
          const pValue = 2 * (1 - this.tCDF(Math.abs(t), n - 2));

          significantPairs.push({
            dim1,
            dim2,
            correlation,
            pValue,
          });
        }
      }
    }

    return {
      dimensions,
      values,
      significantPairs: significantPairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)),
    };
  }

  /**
   * Approximate t-distribution CDF
   */
  private tCDF(t: number, df: number): number {
    // Simplified approximation
    const x = df / (df + t * t);
    return 1 - 0.5 * Math.pow(x, df / 2);
  }

  /**
   * Detect outliers using z-score method
   */
  private detectOutliers(
    points: MultiDimensionalPoint[],
    options: NonNullable<AnalysisOptions['outlierDetection']>
  ): MultiDimensionalPoint[] {
    const { threshold = 3 } = options;
    const dimensions = this.extractDimensions(points);

    // Calculate means and std devs
    const stats: Record<string, { mean: number; std: number }> = {};
    for (const dim of dimensions) {
      const values = points.map((p) => p.dimensions[dim] || 0);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      stats[dim] = { mean, std: Math.sqrt(variance) };
    }

    // Find outliers
    return points.filter((point) => {
      for (const dim of dimensions) {
        if (stats[dim].std === 0) continue;
        const zScore = Math.abs((point.dimensions[dim] || 0) - stats[dim].mean) / stats[dim].std;
        if (zScore > threshold) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Reduce dimensions using PCA-like approach
   */
  private async reduceDimensions(
    points: MultiDimensionalPoint[],
    dimensions: string[],
    options: NonNullable<AnalysisOptions['dimensionReduction']>
  ): Promise<DimensionReduction> {
    const { targetDimensions = 2 } = options;

    // Simplified PCA-like dimension reduction
    // In production, use a proper linear algebra library

    // Calculate covariance matrix
    const n = points.length;
    const means: Record<string, number> = {};
    for (const dim of dimensions) {
      means[dim] = points.reduce((sum, p) => sum + (p.dimensions[dim] || 0), 0) / n;
    }

    // Center the data
    const centered = points.map((p) => ({
      ...p,
      dimensions: Object.fromEntries(
        Object.entries(p.dimensions).map(([k, v]) => [k, v - (means[k] || 0)])
      ),
    }));

    // Calculate variance for each dimension
    const variances = dimensions.map((dim) => {
      const variance =
        centered.reduce((sum, p) => sum + Math.pow(p.dimensions[dim] || 0, 2), 0) / n;
      return { dim, variance };
    });

    // Sort by variance (principal components have highest variance)
    variances.sort((a, b) => b.variance - a.variance);

    const totalVariance = variances.reduce((sum, v) => sum + v.variance, 0);
    const components = variances.slice(0, targetDimensions).map((v, i) => ({
      name: `PC${i + 1}`,
      loadings: { [v.dim]: 1 }, // Simplified: one loading per component
      variance: v.variance / totalVariance,
    }));

    const explainedVariance = components.reduce((sum, c) => sum + c.variance, 0);

    return {
      originalDimensions: dimensions.length,
      reducedDimensions: targetDimensions,
      explainedVariance,
      components,
    };
  }

  /**
   * Estimate optimal number of clusters using elbow method
   */
  private estimateOptimalClusters(points: MultiDimensionalPoint[]): number {
    const maxK = Math.min(10, Math.floor(points.length / 2));
    const dimensions = this.extractDimensions(points);

    if (points.length < 3) return 1;

    const inertias: number[] = [];

    for (let k = 1; k <= maxK; k++) {
      // Simplified: estimate inertia for each k
      const centroids = this.initializeCentroids(points, k, dimensions);
      let inertia = 0;

      for (const point of points) {
        const minDist = Math.min(
          ...centroids.map((c) => this.euclideanDistance(point.dimensions, c, dimensions))
        );
        inertia += minDist * minDist;
      }

      inertias.push(inertia);
    }

    // Find elbow using maximum curvature
    let optimalK = 2;
    let maxCurvature = 0;

    for (let i = 1; i < inertias.length - 1; i++) {
      const curvature =
        Math.abs(inertias[i - 1] - 2 * inertias[i] + inertias[i + 1]);
      if (curvature > maxCurvature) {
        maxCurvature = curvature;
        optimalK = i + 1;
      }
    }

    return optimalK;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(analysis: MultiDimensionalAnalysis): number {
    const clusterQuality =
      analysis.clusters.reduce((sum, c) => sum + c.cohesion, 0) / analysis.clusters.length;

    const significantCorrelations =
      analysis.correlations.significantPairs.filter((p) => p.pValue < 0.05).length /
      Math.max(1, analysis.correlations.significantPairs.length);

    const outlierRatio = analysis.outliers.length / analysis.summary.totalPoints;
    const outlierPenalty = Math.max(0, 1 - outlierRatio * 2);

    return (clusterQuality * 0.4 + significantCorrelations * 0.3 + outlierPenalty * 0.3);
  }

  /**
   * Calculate similarity between two points
   */
  calculateSimilarity(
    point1: MultiDimensionalPoint,
    point2: MultiDimensionalPoint
  ): number {
    const dimensions = new Set([
      ...Object.keys(point1.dimensions),
      ...Object.keys(point2.dimensions),
    ]);

    const dist = this.euclideanDistance(
      point1.dimensions,
      point2.dimensions,
      Array.from(dimensions)
    );

    // Convert distance to similarity (0-1 range)
    return 1 / (1 + dist);
  }

  /**
   * Find similar points
   */
  findSimilar(
    target: MultiDimensionalPoint,
    candidates: MultiDimensionalPoint[],
    topK: number = 5
  ): Array<{ point: MultiDimensionalPoint; similarity: number }> {
    const withSimilarity = candidates
      .filter((c) => c.id !== target.id)
      .map((point) => ({
        point,
        similarity: this.calculateSimilarity(target, point),
      }));

    return withSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}

export const multiDimensionalAnalysisEngine = new MultiDimensionalAnalysisEngine();
