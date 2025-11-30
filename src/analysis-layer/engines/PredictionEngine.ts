/**
 * Prediction & Simulation Engine
 * 3.3 予測・シミュレーションエンジン
 */

import type {
  TimeSeriesPoint,
  PredictionInput,
  PredictionResult,
  ScenarioInput,
  ScenarioResult,
  ScenarioVariable,
  AnalysisResult,
} from '../types';

export interface PredictionOptions {
  method?: 'moving_average' | 'exponential_smoothing' | 'linear_regression' | 'auto';
  confidenceLevel?: number;
  includeSeasonality?: boolean;
}

export class PredictionEngine {
  /**
   * Generate time series predictions
   */
  async predict(
    input: PredictionInput,
    options?: PredictionOptions
  ): Promise<AnalysisResult<PredictionResult>> {
    const startTime = Date.now();
    const opts = {
      method: options?.method || 'auto',
      confidenceLevel: options?.confidenceLevel || 0.95,
      includeSeasonality: options?.includeSeasonality ?? true,
    };

    if (input.historicalData.length < 3) {
      throw new Error('At least 3 data points required for prediction');
    }

    // Determine best method if auto
    const method = opts.method === 'auto'
      ? this.selectBestMethod(input.historicalData)
      : opts.method;

    // Generate predictions based on method
    let predictions: PredictionResult['predictions'];
    switch (method) {
      case 'moving_average':
        predictions = this.movingAverageForecast(input, opts.confidenceLevel);
        break;
      case 'exponential_smoothing':
        predictions = this.exponentialSmoothingForecast(input, opts.confidenceLevel);
        break;
      case 'linear_regression':
        predictions = this.linearRegressionForecast(input, opts.confidenceLevel);
        break;
      default:
        predictions = this.exponentialSmoothingForecast(input, opts.confidenceLevel);
    }

    // Apply seasonality adjustment if requested
    if (opts.includeSeasonality && input.seasonality && input.seasonality !== 'none') {
      predictions = this.applySeasonality(predictions, input.historicalData, input.seasonality);
    }

    // Calculate accuracy metrics using backtesting
    const accuracy = this.calculateAccuracy(input.historicalData);

    // Determine trend
    const trend = this.determineTrend(input.historicalData);

    const result: PredictionResult = {
      predictions,
      model: method,
      accuracy,
      trend,
    };

    return {
      data: result,
      confidence: this.calculateConfidence(result),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Run Monte Carlo simulation for scenario analysis
   */
  async simulate(input: ScenarioInput): Promise<AnalysisResult<ScenarioResult>> {
    const startTime = Date.now();

    const scenarios: ScenarioResult['scenarios'] = [];

    for (let i = 0; i < input.iterations; i++) {
      // Generate random inputs based on distributions
      const inputs = this.generateRandomInputs(input.variables, input.correlations);

      // Calculate outputs (simplified: linear combination)
      const outputs = this.calculateScenarioOutputs(inputs, input.outputMetrics);

      scenarios.push({
        id: `scenario-${i}`,
        inputs,
        outputs,
        probability: 1 / input.iterations,
      });
    }

    // Calculate statistics
    const statistics = this.calculateScenarioStatistics(scenarios, input.outputMetrics);

    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(scenarios, input.outputMetrics);

    const result: ScenarioResult = {
      scenarios,
      statistics,
      riskMetrics,
    };

    return {
      data: result,
      confidence: 0.85, // Confidence based on number of iterations
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Select best prediction method based on data characteristics
   */
  private selectBestMethod(data: TimeSeriesPoint[]): 'moving_average' | 'exponential_smoothing' | 'linear_regression' {
    // Calculate variance
    const values = data.map((d) => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of variation

    // Calculate trend strength
    const trendStrength = this.calculateTrendStrength(values);

    // High trend strength -> linear regression
    if (trendStrength > 0.7) {
      return 'linear_regression';
    }

    // High variance -> exponential smoothing
    if (cv > 0.3) {
      return 'exponential_smoothing';
    }

    // Stable data -> moving average
    return 'moving_average';
  }

  /**
   * Moving average forecast
   */
  private movingAverageForecast(
    input: PredictionInput,
    confidenceLevel: number
  ): PredictionResult['predictions'] {
    const data = input.historicalData;
    const windowSize = Math.min(5, Math.floor(data.length / 2));
    const predictions: PredictionResult['predictions'] = [];

    // Calculate moving average
    const recentValues = data.slice(-windowSize).map((d) => d.value);
    const avgValue = recentValues.reduce((a, b) => a + b, 0) / windowSize;

    // Calculate standard deviation for confidence intervals
    const stdDev = Math.sqrt(
      recentValues.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / windowSize
    );

    const zScore = this.getZScore(confidenceLevel);
    const lastDate = new Date(data[data.length - 1].timestamp);

    for (let i = 1; i <= input.horizon; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);

      // Confidence interval widens with forecast horizon
      const intervalMultiplier = Math.sqrt(i);

      predictions.push({
        timestamp: futureDate,
        value: avgValue,
        lowerBound: avgValue - zScore * stdDev * intervalMultiplier,
        upperBound: avgValue + zScore * stdDev * intervalMultiplier,
        confidence: Math.max(0.5, confidenceLevel - 0.05 * (i - 1)),
      });
    }

    return predictions;
  }

  /**
   * Exponential smoothing forecast (Holt's method)
   */
  private exponentialSmoothingForecast(
    input: PredictionInput,
    confidenceLevel: number
  ): PredictionResult['predictions'] {
    const data = input.historicalData;
    const alpha = 0.3; // Level smoothing
    const beta = 0.1; // Trend smoothing

    // Initialize
    let level = data[0].value;
    let trend = (data[data.length - 1].value - data[0].value) / data.length;

    // Apply exponential smoothing
    const errors: number[] = [];
    for (const point of data) {
      const forecast = level + trend;
      errors.push(point.value - forecast);

      const newLevel = alpha * point.value + (1 - alpha) * (level + trend);
      trend = beta * (newLevel - level) + (1 - beta) * trend;
      level = newLevel;
    }

    // Calculate forecast error standard deviation
    const mse = errors.reduce((sum, e) => sum + e * e, 0) / errors.length;
    const stdError = Math.sqrt(mse);

    const zScore = this.getZScore(confidenceLevel);
    const lastDate = new Date(data[data.length - 1].timestamp);
    const predictions: PredictionResult['predictions'] = [];

    for (let i = 1; i <= input.horizon; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);

      const forecastValue = level + i * trend;
      const intervalMultiplier = Math.sqrt(1 + (i - 1) * 0.2);

      predictions.push({
        timestamp: futureDate,
        value: forecastValue,
        lowerBound: forecastValue - zScore * stdError * intervalMultiplier,
        upperBound: forecastValue + zScore * stdError * intervalMultiplier,
        confidence: Math.max(0.5, confidenceLevel - 0.03 * (i - 1)),
      });
    }

    return predictions;
  }

  /**
   * Linear regression forecast
   */
  private linearRegressionForecast(
    input: PredictionInput,
    confidenceLevel: number
  ): PredictionResult['predictions'] {
    const data = input.historicalData;
    const n = data.length;

    // Calculate regression coefficients
    const xMean = (n - 1) / 2;
    const yMean = data.reduce((sum, d) => sum + d.value, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (data[i].value - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Calculate residual standard error
    const residuals = data.map((d, i) => d.value - (intercept + slope * i));
    const rse = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2));

    const zScore = this.getZScore(confidenceLevel);
    const lastDate = new Date(data[data.length - 1].timestamp);
    const predictions: PredictionResult['predictions'] = [];

    for (let i = 1; i <= input.horizon; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);

      const x = n - 1 + i;
      const forecastValue = intercept + slope * x;

      // Prediction interval widens with distance from mean
      const sePredict = rse * Math.sqrt(1 + 1 / n + Math.pow(x - xMean, 2) / denominator);

      predictions.push({
        timestamp: futureDate,
        value: forecastValue,
        lowerBound: forecastValue - zScore * sePredict,
        upperBound: forecastValue + zScore * sePredict,
        confidence: Math.max(0.5, confidenceLevel - 0.02 * (i - 1)),
      });
    }

    return predictions;
  }

  /**
   * Apply seasonality adjustment
   */
  private applySeasonality(
    predictions: PredictionResult['predictions'],
    historicalData: TimeSeriesPoint[],
    seasonality: NonNullable<PredictionInput['seasonality']>
  ): PredictionResult['predictions'] {
    // Calculate seasonal factors
    const period = this.getSeasonalPeriod(seasonality);
    if (historicalData.length < period * 2) {
      return predictions; // Not enough data for seasonal adjustment
    }

    // Calculate average for each seasonal position
    const seasonalFactors: number[] = new Array(period).fill(0);
    const counts: number[] = new Array(period).fill(0);

    const overallMean = historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;

    historicalData.forEach((point, i) => {
      const position = i % period;
      seasonalFactors[position] += point.value / overallMean;
      counts[position]++;
    });

    for (let i = 0; i < period; i++) {
      seasonalFactors[i] = counts[i] > 0 ? seasonalFactors[i] / counts[i] : 1;
    }

    // Apply seasonal factors to predictions
    const startPosition = historicalData.length % period;

    return predictions.map((pred, i) => {
      const position = (startPosition + i) % period;
      const factor = seasonalFactors[position];

      return {
        ...pred,
        value: pred.value * factor,
        lowerBound: pred.lowerBound * factor,
        upperBound: pred.upperBound * factor,
      };
    });
  }

  /**
   * Get seasonal period in days
   */
  private getSeasonalPeriod(seasonality: NonNullable<PredictionInput['seasonality']>): number {
    switch (seasonality) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'yearly': return 365;
      default: return 1;
    }
  }

  /**
   * Calculate accuracy metrics using backtesting
   */
  private calculateAccuracy(data: TimeSeriesPoint[]): PredictionResult['accuracy'] {
    if (data.length < 5) {
      return { mae: 0, rmse: 0, mape: 0 };
    }

    // Use last 20% of data for validation
    const splitPoint = Math.floor(data.length * 0.8);
    const trainData = data.slice(0, splitPoint);
    const testData = data.slice(splitPoint);

    // Simple prediction: use last training value
    const lastTrain = trainData[trainData.length - 1].value;

    let sumAbsError = 0;
    let sumSquaredError = 0;
    let sumAbsPercentError = 0;

    for (const point of testData) {
      const error = Math.abs(point.value - lastTrain);
      sumAbsError += error;
      sumSquaredError += error * error;
      sumAbsPercentError += point.value !== 0 ? error / Math.abs(point.value) : 0;
    }

    const n = testData.length;

    return {
      mae: sumAbsError / n,
      rmse: Math.sqrt(sumSquaredError / n),
      mape: (sumAbsPercentError / n) * 100,
    };
  }

  /**
   * Determine trend direction
   */
  private determineTrend(data: TimeSeriesPoint[]): PredictionResult['trend'] {
    if (data.length < 3) return 'STABLE';

    const values = data.map((d) => d.value);
    // Calculate trend strength (used for future enhancements)
    this.calculateTrendStrength(values);

    // Calculate volatility
    const returns = values.slice(1).map((v, i) => (v - values[i]) / values[i]);
    const volatility = Math.sqrt(
      returns.reduce((sum, r) => sum + r * r, 0) / returns.length
    );

    if (volatility > 0.3) {
      return 'VOLATILE';
    }

    const slope = (values[values.length - 1] - values[0]) / values.length;

    if (Math.abs(slope) < 0.01 * values[0]) {
      return 'STABLE';
    }

    return slope > 0 ? 'INCREASING' : 'DECREASING';
  }

  /**
   * Calculate trend strength (R-squared)
   */
  private calculateTrendStrength(values: number[]): number {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let ssReg = 0;
    let ssTot = 0;

    for (let i = 0; i < n; i++) {
      const yHat = yMean + ((i - xMean) * (values[n - 1] - values[0])) / (n - 1);
      ssReg += Math.pow(yHat - yMean, 2);
      ssTot += Math.pow(values[i] - yMean, 2);
    }

    return ssTot === 0 ? 0 : ssReg / ssTot;
  }

  /**
   * Get z-score for confidence level
   */
  private getZScore(confidenceLevel: number): number {
    // Approximate z-scores for common confidence levels
    if (confidenceLevel >= 0.99) return 2.576;
    if (confidenceLevel >= 0.95) return 1.96;
    if (confidenceLevel >= 0.90) return 1.645;
    if (confidenceLevel >= 0.80) return 1.28;
    return 1.0;
  }

  /**
   * Generate random inputs for Monte Carlo simulation
   */
  private generateRandomInputs(
    variables: ScenarioVariable[],
    correlations?: Record<string, Record<string, number>>
  ): Record<string, number> {
    const inputs: Record<string, number> = {};

    for (const variable of variables) {
      let value: number;

      switch (variable.distribution) {
        case 'normal':
          value = this.randomNormal(
            variable.baseValue,
            (variable.maxValue - variable.minValue) / 4
          );
          break;
        case 'triangular':
          value = this.randomTriangular(
            variable.minValue,
            variable.baseValue,
            variable.maxValue
          );
          break;
        case 'uniform':
        default:
          value = this.randomUniform(variable.minValue, variable.maxValue);
      }

      // Clamp to bounds
      inputs[variable.name] = Math.max(
        variable.minValue,
        Math.min(variable.maxValue, value)
      );
    }

    // Apply correlations (simplified: adjust correlated variables)
    if (correlations) {
      for (const [var1, corrs] of Object.entries(correlations)) {
        for (const [var2, correlation] of Object.entries(corrs)) {
          if (var1 in inputs && var2 in inputs) {
            const adjustment = correlation * (inputs[var1] - variables.find((v) => v.name === var1)!.baseValue);
            inputs[var2] += adjustment * 0.1;
          }
        }
      }
    }

    return inputs;
  }

  /**
   * Random number from normal distribution
   */
  private randomNormal(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z;
  }

  /**
   * Random number from uniform distribution
   */
  private randomUniform(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  /**
   * Random number from triangular distribution
   */
  private randomTriangular(min: number, mode: number, max: number): number {
    const u = Math.random();
    const fc = (mode - min) / (max - min);

    if (u < fc) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  /**
   * Calculate scenario outputs (simplified model)
   */
  private calculateScenarioOutputs(
    inputs: Record<string, number>,
    outputMetrics: string[]
  ): Record<string, number> {
    const outputs: Record<string, number> = {};

    for (const metric of outputMetrics) {
      // Simplified: output is weighted sum of inputs with some noise
      let value = 0;
      const inputValues = Object.values(inputs);
      for (const input of inputValues) {
        value += input * (0.5 + Math.random() * 0.5);
      }
      value /= inputValues.length;

      // Add noise
      value *= 0.9 + Math.random() * 0.2;

      outputs[metric] = value;
    }

    return outputs;
  }

  /**
   * Calculate scenario statistics
   */
  private calculateScenarioStatistics(
    scenarios: ScenarioResult['scenarios'],
    metrics: string[]
  ): ScenarioResult['statistics'] {
    const mean: Record<string, number> = {};
    const stdDev: Record<string, number> = {};
    const percentiles: Record<string, { p10: number; p50: number; p90: number }> = {};

    for (const metric of metrics) {
      const values = scenarios.map((s) => s.outputs[metric]).sort((a, b) => a - b);
      const n = values.length;

      mean[metric] = values.reduce((a, b) => a + b, 0) / n;
      stdDev[metric] = Math.sqrt(
        values.reduce((sum, v) => sum + Math.pow(v - mean[metric], 2), 0) / n
      );
      percentiles[metric] = {
        p10: values[Math.floor(n * 0.1)],
        p50: values[Math.floor(n * 0.5)],
        p90: values[Math.floor(n * 0.9)],
      };
    }

    return { mean, stdDev, percentiles };
  }

  /**
   * Calculate risk metrics
   */
  private calculateRiskMetrics(
    scenarios: ScenarioResult['scenarios'],
    metrics: string[]
  ): ScenarioResult['riskMetrics'] {
    // Use first metric for risk calculations
    const primaryMetric = metrics[0];
    const values = scenarios.map((s) => s.outputs[primaryMetric]).sort((a, b) => a - b);
    const n = values.length;

    // Value at Risk (5th percentile)
    const varIndex = Math.floor(n * 0.05);
    const valueAtRisk = values[varIndex];

    // Conditional VaR (average of values below VaR)
    const belowVar = values.slice(0, varIndex);
    const conditionalVaR = belowVar.length > 0
      ? belowVar.reduce((a, b) => a + b, 0) / belowVar.length
      : valueAtRisk;

    // Max drawdown
    let maxDrawdown = 0;
    let peak = values[0];
    for (const value of values) {
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return {
      valueAtRisk,
      conditionalVaR,
      maxDrawdown,
    };
  }

  /**
   * Calculate overall confidence
   */
  private calculateConfidence(result: PredictionResult): number {
    // Higher confidence for lower MAPE
    const mapeScore = Math.max(0, 1 - result.accuracy.mape / 100);

    // Higher confidence for clear trends
    const trendScore = result.trend === 'VOLATILE' ? 0.5 : 0.8;

    return mapeScore * 0.6 + trendScore * 0.4;
  }
}

export const predictionEngine = new PredictionEngine();
