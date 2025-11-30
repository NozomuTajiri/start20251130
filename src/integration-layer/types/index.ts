/**
 * Integration Layer Type Definitions
 * Phase 6: 統合・最適化 - システム統合・テスト・本番デプロイ
 */

// ============================================
// 6.1 コパイロット連携型定義
// ============================================

export type CopilotType =
  | 'executive'
  | 'marketing'
  | 'sales'
  | 'procurement'
  | 'finance'
  | 'hr'
  | 'operations';

export interface CopilotConfig {
  id: string;
  type: CopilotType;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  apiEndpoint?: string;
  capabilities: CopilotCapability[];
  permissions: CopilotPermission[];
  rateLimit: RateLimitConfig;
}

export interface CopilotCapability {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export interface CopilotPermission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'execute')[];
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  maxConcurrent: number;
}

export interface CopilotMessage {
  id: string;
  sourceId: string;
  targetId: string;
  type: MessageType;
  payload: unknown;
  timestamp: Date;
  correlationId?: string;
  replyTo?: string;
  ttl?: number;
}

export type MessageType =
  | 'request'
  | 'response'
  | 'event'
  | 'command'
  | 'query'
  | 'notification';

export interface CopilotResponse {
  success: boolean;
  data?: unknown;
  error?: CopilotError;
  metadata: ResponseMetadata;
}

export interface CopilotError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
}

export interface ResponseMetadata {
  processingTime: number;
  copilotId: string;
  version: string;
  timestamp: Date;
}

// ============================================
// 6.2 統合テスト型定義
// ============================================

export type TestType = 'unit' | 'integration' | 'e2e' | 'performance' | 'security';

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  type: TestType;
  tests: TestCase[];
  setup?: TestHook;
  teardown?: TestHook;
  config: TestConfig;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  status: TestStatus;
  duration?: number;
  assertions: TestAssertion[];
  error?: TestError;
  retries: number;
  tags: string[];
}

export interface TestAssertion {
  id: string;
  type: AssertionType;
  expected: unknown;
  actual?: unknown;
  passed: boolean;
  message?: string;
}

export type AssertionType =
  | 'equal'
  | 'notEqual'
  | 'deepEqual'
  | 'truthy'
  | 'falsy'
  | 'contains'
  | 'matches'
  | 'throws'
  | 'resolves'
  | 'rejects';

export interface TestHook {
  name: string;
  execute: () => Promise<void>;
}

export interface TestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  coverage: boolean;
  bail: boolean;
}

export interface TestError {
  message: string;
  stack?: string;
  code?: string;
}

export interface TestResult {
  suiteId: string;
  timestamp: Date;
  duration: number;
  status: TestStatus;
  passed: number;
  failed: number;
  skipped: number;
  coverage?: CoverageReport;
  failures: TestFailure[];
}

export interface TestFailure {
  testId: string;
  testName: string;
  error: TestError;
  assertions: TestAssertion[];
}

export interface CoverageReport {
  lines: CoverageMetric;
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  files: FileCoverage[];
}

export interface CoverageMetric {
  total: number;
  covered: number;
  percentage: number;
}

export interface FileCoverage {
  path: string;
  lines: CoverageMetric;
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  uncoveredLines: number[];
}

// ============================================
// 6.3 パフォーマンス最適化型定義
// ============================================

export interface PerformanceMetrics {
  timestamp: Date;
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
  database: DatabaseMetrics;
  cache: CacheMetrics;
}

export interface CPUMetrics {
  usage: number;
  loadAverage: [number, number, number];
  cores: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  percentage: number;
}

export interface NetworkMetrics {
  requestsPerSecond: number;
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  bytesIn: number;
  bytesOut: number;
}

export interface DatabaseMetrics {
  connectionPoolSize: number;
  activeConnections: number;
  queryCount: number;
  averageQueryTime: number;
  slowQueries: number;
  errors: number;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  size: number;
  maxSize: number;
  evictions: number;
}

export interface OptimizationTarget {
  metric: string;
  current: number;
  target: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface OptimizationResult {
  id: string;
  target: OptimizationTarget;
  applied: Date;
  before: number;
  after: number;
  improvement: number;
  success: boolean;
  rollbackAvailable: boolean;
}

// ============================================
// 6.4 セキュリティ監査型定義
// ============================================

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type VulnerabilityCategory =
  | 'injection'
  | 'authentication'
  | 'authorization'
  | 'cryptography'
  | 'configuration'
  | 'dataExposure'
  | 'xss'
  | 'csrf'
  | 'dependencies';

export interface SecurityAudit {
  id: string;
  timestamp: Date;
  duration: number;
  status: AuditStatus;
  score: number;
  vulnerabilities: Vulnerability[];
  recommendations: SecurityRecommendation[];
  compliance: ComplianceReport;
}

export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  category: VulnerabilityCategory;
  severity: SeverityLevel;
  cvss?: number;
  cve?: string;
  affected: AffectedResource[];
  remediation: string;
  references: string[];
  discovered: Date;
  status: VulnerabilityStatus;
}

export type VulnerabilityStatus = 'open' | 'acknowledged' | 'inProgress' | 'resolved' | 'falsePositive';

export interface AffectedResource {
  type: 'file' | 'package' | 'endpoint' | 'configuration';
  path: string;
  line?: number;
  version?: string;
}

export interface SecurityRecommendation {
  id: string;
  priority: SeverityLevel;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  category: string;
}

export interface ComplianceReport {
  frameworks: ComplianceFramework[];
  overallScore: number;
  compliant: boolean;
}

export interface ComplianceFramework {
  name: string;
  version: string;
  score: number;
  controls: ComplianceControl[];
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'nonCompliant' | 'partial' | 'notApplicable';
  evidence: string[];
}

// ============================================
// 6.6 デプロイメント型定義
// ============================================

export type DeploymentEnvironment = 'development' | 'staging' | 'production';

export type DeploymentStatus =
  | 'pending'
  | 'building'
  | 'deploying'
  | 'verifying'
  | 'success'
  | 'failed'
  | 'rolledBack';

export interface DeploymentConfig {
  environment: DeploymentEnvironment;
  version: string;
  commitHash: string;
  branch: string;
  platform: DeploymentPlatform;
  regions: string[];
  features: FeatureFlags;
  scaling: ScalingConfig;
  healthCheck: HealthCheckConfig;
}

export interface DeploymentPlatform {
  name: 'vercel' | 'railway' | 'aws' | 'gcp' | 'azure';
  projectId: string;
  configuration: Record<string, unknown>;
}

export interface FeatureFlags {
  [key: string]: boolean | string | number;
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  targetCPU: number;
  targetMemory: number;
  cooldownPeriod: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  endpoint: string;
  interval: number;
  timeout: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
}

export interface Deployment {
  id: string;
  config: DeploymentConfig;
  status: DeploymentStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  logs: DeploymentLog[];
  metrics: DeploymentMetrics;
  rollbackId?: string;
}

export interface DeploymentLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface DeploymentMetrics {
  buildTime: number;
  deployTime: number;
  verificationTime: number;
  size: number;
  functions: number;
  routes: number;
}

// ============================================
// 6.7 運用監視型定義
// ============================================

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed';

export interface MonitoringConfig {
  enabled: boolean;
  metrics: MetricConfig[];
  alerts: AlertConfig[];
  dashboards: DashboardConfig[];
  retention: RetentionConfig;
}

export interface MetricConfig {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels: string[];
  description: string;
  aggregation: AggregationType;
}

export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'p50' | 'p95' | 'p99';

export interface AlertConfig {
  id: string;
  name: string;
  metric: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  channels: NotificationChannel[];
  cooldown: number;
  annotations: Record<string, string>;
}

export interface AlertCondition {
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  duration: number;
  aggregation: AggregationType;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'pagerduty' | 'webhook';
  config: Record<string, unknown>;
}

export interface DashboardConfig {
  id: string;
  name: string;
  layout: DashboardLayout;
  panels: DashboardPanel[];
  refreshInterval: number;
  timeRange: TimeRange;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
}

export interface DashboardPanel {
  id: string;
  title: string;
  type: 'chart' | 'stat' | 'table' | 'log' | 'alert';
  position: { x: number; y: number; width: number; height: number };
  queries: MetricQuery[];
  options: Record<string, unknown>;
}

export interface MetricQuery {
  metric: string;
  filters: Record<string, string>;
  aggregation: AggregationType;
  groupBy?: string[];
}

export interface TimeRange {
  from: string;
  to: string;
}

export interface RetentionConfig {
  rawMetrics: number; // days
  aggregatedMetrics: number; // days
  logs: number; // days
  alerts: number; // days
}

export interface Alert {
  id: string;
  config: AlertConfig;
  status: AlertStatus;
  firedAt: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  value: number;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: ComponentHealth[];
  uptime: number;
  lastCheck: Date;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  lastCheck: Date;
  details?: Record<string, unknown>;
}

// ============================================
// イベントバス型定義
// ============================================

export type EventType =
  | 'system.startup'
  | 'system.shutdown'
  | 'copilot.message'
  | 'copilot.error'
  | 'test.started'
  | 'test.completed'
  | 'deployment.started'
  | 'deployment.completed'
  | 'alert.fired'
  | 'alert.resolved'
  | 'metric.recorded';

export interface SystemEvent {
  id: string;
  type: EventType;
  source: string;
  timestamp: Date;
  payload: unknown;
  metadata: EventMetadata;
}

export interface EventMetadata {
  correlationId?: string;
  traceId?: string;
  userId?: string;
  environment: DeploymentEnvironment;
}

export interface EventSubscription {
  id: string;
  eventTypes: EventType[];
  handler: (event: SystemEvent) => Promise<void>;
  filter?: (event: SystemEvent) => boolean;
}
