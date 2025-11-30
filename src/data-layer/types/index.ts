/**
 * Data Layer Types
 * 15種類のDB連携基盤の共通型定義
 */

// ========================================
// 共通型
// ========================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}

// ========================================
// データ品質関連
// ========================================

export interface DataQualityMetrics {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  consistency: number; // 0-1
  timeliness: number; // 0-1
  overallScore: number; // 0-1
  issues: string[];
}

export interface DataValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ========================================
// メタデータ関連
// ========================================

export interface DataSourceMetadata {
  id: string;
  name: string;
  type: DataSourceType;
  lastSyncAt: Date | null;
  syncStatus: SyncStatus;
  schema: Record<string, unknown>;
}

export type DataSourceType = 'DATABASE' | 'API' | 'FILE' | 'MANUAL' | 'EXTERNAL_SERVICE';
export type SyncStatus = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'FAILED';

// ========================================
// メガトレンド関連
// ========================================

export interface MegatrendData {
  id: string;
  name: string;
  description: string;
  category: string;
  impact: ImpactLevel;
  timeframe: string;
  confidence: number;
  sources: string[];
  keywords: string[];
}

export interface MegatrendAnalysisResult {
  megatrendId: string;
  score: number;
  insights: string;
  opportunities: string[];
  threats: string[];
  analysisDate: Date;
}

export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ========================================
// バリューテンプレート関連
// ========================================

export interface ValueTemplateData {
  id: string;
  name: string;
  description: string;
  category: ValueCategory;
  targetSegment: string;
  valueProposition: string;
  keyBenefits: string[];
  useCases: string[];
  successMetrics: string[];
}

export type ValueCategory =
  | 'COST_REDUCTION'
  | 'REVENUE_GROWTH'
  | 'EFFICIENCY'
  | 'INNOVATION'
  | 'CUSTOMER_EXPERIENCE'
  | 'SUSTAINABILITY';

// ========================================
// ニーズの裏のニーズ関連
// ========================================

export interface HiddenNeedData {
  id: string;
  surfaceNeed: string;
  hiddenNeed: string;
  rootCause: string;
  customerSegment: string;
  emotionalDriver?: string;
  functionalDriver?: string;
  socialDriver?: string;
  validationLevel: ValidationLevel;
  evidence: string[];
}

export type ValidationLevel = 'HYPOTHESIS' | 'OBSERVED' | 'VALIDATED' | 'PROVEN';

// ========================================
// 競合情報関連
// ========================================

export interface CompetitorData {
  id: string;
  name: string;
  description?: string;
  industry: string[];
  marketPosition?: string;
  strengths: string[];
  weaknesses: string[];
  products: string[];
}

export interface CompetitorMoveData {
  id: string;
  competitorId: string;
  type: MoveType;
  description: string;
  date: Date;
  impact: ImpactLevel;
  response?: string;
}

export type MoveType =
  | 'PRODUCT_LAUNCH'
  | 'ACQUISITION'
  | 'PARTNERSHIP'
  | 'MARKET_ENTRY'
  | 'PRICE_CHANGE'
  | 'STRATEGY_SHIFT'
  | 'LEADERSHIP_CHANGE';

// ========================================
// パートナー関連
// ========================================

export interface PartnerData {
  id: string;
  name: string;
  description?: string;
  type: PartnerType;
  industry: string[];
  capabilities: string[];
  relationshipStatus: RelationshipStatus;
}

export type PartnerType =
  | 'TECHNOLOGY'
  | 'CONSULTING'
  | 'SUPPLIER'
  | 'DISTRIBUTOR'
  | 'RESEARCH'
  | 'STRATEGIC';

export type RelationshipStatus = 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'FORMER';

// ========================================
// シーズ関連
// ========================================

export interface SeedData {
  id: string;
  name: string;
  description: string;
  type: SeedType;
  maturityLevel: MaturityLevel;
  potentialMarkets: string[];
  requiredResources: string[];
  risks: string[];
  timeToMarket?: string;
  estimatedInvestment?: string;
}

export type SeedType = 'TECHNOLOGY' | 'BUSINESS_MODEL' | 'PRODUCT' | 'SERVICE' | 'PROCESS';
export type MaturityLevel = 'CONCEPT' | 'PROTOTYPE' | 'PILOT' | 'SCALING' | 'MATURE';

// ========================================
// トレンド関連
// ========================================

export interface ShortTermTrendData {
  id: string;
  name: string;
  description: string;
  category: string;
  currentPhase: TrendPhase;
  relevance: number;
  megatrendId?: string;
  sources: string[];
}

export type TrendPhase = 'EMERGING' | 'GROWING' | 'PEAKING' | 'DECLINING' | 'FADING';

// ========================================
// 成功事例関連
// ========================================

export interface SuccessCaseData {
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
  metrics?: Record<string, unknown>;
}
