/**
 * Analysis Layer Types
 * Phase 3: 分析処理層の型定義
 */

// ============================================
// 共通型
// ============================================

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TimeHorizon = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';

export interface AnalysisResult<T> {
  data: T;
  confidence: number;
  timestamp: Date;
  processingTime: number;
  metadata?: Record<string, unknown>;
}

export interface AnalysisError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================
// 3.1 多次元データ解析エンジン
// ============================================

export interface DimensionWeight {
  dimension: string;
  weight: number;
  description?: string;
}

export interface MultiDimensionalPoint {
  id: string;
  dimensions: Record<string, number>;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface ClusterResult {
  clusterId: string;
  centroid: Record<string, number>;
  points: MultiDimensionalPoint[];
  cohesion: number;
  separation: number;
}

export interface CorrelationMatrix {
  dimensions: string[];
  values: number[][];
  significantPairs: Array<{
    dim1: string;
    dim2: string;
    correlation: number;
    pValue: number;
  }>;
}

export interface DimensionReduction {
  originalDimensions: number;
  reducedDimensions: number;
  explainedVariance: number;
  components: Array<{
    name: string;
    loadings: Record<string, number>;
    variance: number;
  }>;
}

export interface MultiDimensionalAnalysis {
  clusters: ClusterResult[];
  correlations: CorrelationMatrix;
  dimensionReduction?: DimensionReduction;
  outliers: MultiDimensionalPoint[];
  summary: {
    totalPoints: number;
    dimensions: number;
    optimalClusters: number;
  };
}

// ============================================
// 3.2 自然言語処理エンジン (Claude API連携)
// ============================================

export interface NLPRequest {
  text: string;
  context?: string;
  language?: string;
  options?: NLPOptions;
}

export interface NLPOptions {
  maxTokens?: number;
  temperature?: number;
  extractEntities?: boolean;
  extractSentiment?: boolean;
  extractKeywords?: boolean;
  summarize?: boolean;
}

export interface Entity {
  text: string;
  type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'DATE' | 'PRODUCT' | 'CONCEPT' | 'OTHER';
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface Sentiment {
  overall: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
  score: number; // -1 to 1
  aspects: Array<{
    aspect: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    score: number;
  }>;
}

export interface NLPResult {
  originalText: string;
  processedText?: string;
  entities?: Entity[];
  sentiment?: Sentiment;
  keywords?: Array<{ word: string; relevance: number }>;
  summary?: string;
  topics?: Array<{ topic: string; confidence: number }>;
  language: string;
}

// ============================================
// 3.3 予測・シミュレーションエンジン
// ============================================

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface PredictionInput {
  historicalData: TimeSeriesPoint[];
  horizon: number;
  variables?: Record<string, number[]>;
  seasonality?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
}

export interface PredictionResult {
  predictions: Array<{
    timestamp: Date;
    value: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }>;
  model: string;
  accuracy: {
    mae: number;
    rmse: number;
    mape: number;
  };
  trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'VOLATILE';
}

export interface ScenarioVariable {
  name: string;
  baseValue: number;
  minValue: number;
  maxValue: number;
  distribution?: 'normal' | 'uniform' | 'triangular';
}

export interface ScenarioInput {
  variables: ScenarioVariable[];
  iterations: number;
  outputMetrics: string[];
  correlations?: Record<string, Record<string, number>>;
}

export interface ScenarioResult {
  scenarios: Array<{
    id: string;
    inputs: Record<string, number>;
    outputs: Record<string, number>;
    probability: number;
  }>;
  statistics: {
    mean: Record<string, number>;
    stdDev: Record<string, number>;
    percentiles: Record<string, { p10: number; p50: number; p90: number }>;
  };
  riskMetrics: {
    valueAtRisk: number;
    conditionalVaR: number;
    maxDrawdown: number;
  };
}

// ============================================
// 3.4 因果推論エンジン
// ============================================

export interface CausalVariable {
  id: string;
  name: string;
  type: 'continuous' | 'categorical' | 'binary';
  values?: number[] | string[];
}

export interface CausalRelationship {
  from: string;
  to: string;
  strength: number; // -1 to 1
  confidence: number;
  mechanism?: string;
  isConfounded?: boolean;
  confounders?: string[];
}

export interface CausalGraph {
  variables: CausalVariable[];
  relationships: CausalRelationship[];
  rootCauses: string[];
  terminalEffects: string[];
}

export interface InterventionAnalysis {
  intervention: {
    variable: string;
    value: number | string;
  };
  effects: Array<{
    variable: string;
    beforeIntervention: number;
    afterIntervention: number;
    changePercent: number;
    confidence: number;
  }>;
  sideEffects: Array<{
    variable: string;
    effect: number;
    isPositive: boolean;
  }>;
}

export interface CounterfactualAnalysis {
  actualOutcome: Record<string, number>;
  counterfactualScenario: Record<string, number | string>;
  counterfactualOutcome: Record<string, number>;
  difference: Record<string, number>;
  explanation: string;
}

// ============================================
// 3.5 戦略的対話エンジン
// ============================================

export interface DialogueContext {
  sessionId: string;
  userId: string;
  history: DialogueMessage[];
  currentTopic?: string;
  goals?: string[];
  preferences?: Record<string, unknown>;
}

export interface DialogueMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    entities?: Entity[];
    confidence?: number;
  };
}

export interface DialogueIntent {
  name: string;
  confidence: number;
  parameters: Record<string, unknown>;
  requiredActions?: string[];
}

export interface StrategicInsight {
  type: 'OPPORTUNITY' | 'THREAT' | 'RECOMMENDATION' | 'WARNING' | 'QUESTION';
  content: string;
  priority: ImpactLevel;
  actionable: boolean;
  suggestedActions?: string[];
  relatedData?: Record<string, unknown>;
}

export interface DialogueResponse {
  message: string;
  insights: StrategicInsight[];
  followUpQuestions?: string[];
  suggestedTopics?: string[];
  confidence: number;
}

// ============================================
// 3.6 暗黙知抽出エンジン
// ============================================

export interface TacitKnowledgeSource {
  type: 'interview' | 'observation' | 'document' | 'behavior';
  content: string;
  source: string;
  timestamp: Date;
  reliability: number;
}

export interface TacitKnowledge {
  id: string;
  category: 'skill' | 'intuition' | 'experience' | 'relationship' | 'context';
  description: string;
  explicitForm: string;
  confidence: number;
  sources: string[];
  validatedBy?: string[];
  applicableContexts: string[];
}

export interface KnowledgePattern {
  id: string;
  name: string;
  description: string;
  occurrences: number;
  examples: string[];
  conditions: string[];
  outcomes: string[];
}

export interface TacitKnowledgeExtraction {
  extractedKnowledge: TacitKnowledge[];
  patterns: KnowledgePattern[];
  gaps: Array<{
    area: string;
    description: string;
    importance: ImpactLevel;
  }>;
  recommendations: string[];
}

// ============================================
// 3.7 認知バイアス検出エンジン
// ============================================

export type BiasType =
  | 'CONFIRMATION_BIAS'
  | 'ANCHORING_BIAS'
  | 'AVAILABILITY_HEURISTIC'
  | 'OVERCONFIDENCE'
  | 'SUNK_COST_FALLACY'
  | 'BANDWAGON_EFFECT'
  | 'HINDSIGHT_BIAS'
  | 'SELECTION_BIAS'
  | 'SURVIVORSHIP_BIAS'
  | 'GROUPTHINK'
  | 'STATUS_QUO_BIAS'
  | 'FRAMING_EFFECT';

export interface BiasIndicator {
  text: string;
  startIndex: number;
  endIndex: number;
  indicatorType: string;
}

export interface DetectedBias {
  type: BiasType;
  confidence: number;
  severity: ImpactLevel;
  description: string;
  indicators: BiasIndicator[];
  mitigation: string;
  examples?: string[];
}

export interface BiasAnalysis {
  inputType: 'text' | 'decision' | 'data';
  detectedBiases: DetectedBias[];
  overallBiasScore: number; // 0 to 1, higher = more biased
  recommendations: Array<{
    priority: number;
    action: string;
    targetBias: BiasType;
  }>;
  debiasedAlternatives?: string[];
}

// ============================================
// 3.8 集合知形成エンジン
// ============================================

export interface ContributorProfile {
  id: string;
  expertise: string[];
  reliabilityScore: number;
  contributionCount: number;
  agreementRate: number;
}

export interface Opinion {
  contributorId: string;
  content: string;
  confidence: number;
  reasoning?: string;
  supportingEvidence?: string[];
  timestamp: Date;
}

export interface ConsensusPoint {
  topic: string;
  position: string;
  agreementLevel: number; // 0 to 1
  supporters: string[];
  dissenters: string[];
  keyArguments: string[];
}

export interface Disagreement {
  topic: string;
  positions: Array<{
    position: string;
    supporters: string[];
    arguments: string[];
  }>;
  bridgingPossibilities?: string[];
}

export interface CollectiveIntelligence {
  topic: string;
  participants: ContributorProfile[];
  opinions: Opinion[];
  consensusPoints: ConsensusPoint[];
  disagreements: Disagreement[];
  synthesizedInsight: string;
  confidenceScore: number;
  diversityIndex: number;
}

// ============================================
// 3.9 組織学習促進エンジン
// ============================================

export interface LearningEvent {
  id: string;
  type: 'success' | 'failure' | 'experiment' | 'discovery' | 'feedback';
  description: string;
  context: string;
  timestamp: Date;
  participants: string[];
  outcomes: string[];
  lessonsLearned: string[];
}

export interface KnowledgeAsset {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdFrom: string[]; // LearningEvent IDs
  usageCount: number;
  effectivenessScore: number;
  lastUpdated: Date;
}

export interface LearningGap {
  area: string;
  currentCapability: number; // 0 to 1
  targetCapability: number;
  priority: ImpactLevel;
  suggestedActions: string[];
  resources?: string[];
}

export interface OrganizationalLearning {
  learningEvents: LearningEvent[];
  knowledgeAssets: KnowledgeAsset[];
  learningGaps: LearningGap[];
  learningVelocity: number; // events per time period
  knowledgeRetention: number; // 0 to 1
  recommendations: Array<{
    type: 'process' | 'culture' | 'tool' | 'training';
    description: string;
    expectedImpact: ImpactLevel;
  }>;
}

// ============================================
// キャッシュシステム
// ============================================

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
  tags?: string[];
}

export interface CacheStatistics {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  avgResponseTime: number;
  memoryUsage: number;
}
