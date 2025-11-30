/**
 * Integration Layer - Main Export
 * Phase 6: 統合・最適化 - システム統合・テスト・本番デプロイ
 */

// 型定義
export * from './types';

// 6.1 コパイロット連携
export {
  CopilotRegistry,
  CopilotMessageBroker,
  CopilotOrchestrator,
  copilotRegistry,
  copilotMessageBroker,
  copilotOrchestrator,
  createDefaultCopilotConfigs,
  createPresetWorkflows,
} from './copilots';
export type {
  Workflow,
  WorkflowStep,
  InputMapping,
  StepCondition,
  ErrorStrategy,
  WorkflowContext,
  WorkflowStatus,
  StepResult,
  WorkflowResult,
} from './copilots';

// 6.2 統合テスト
export {
  IntegrationTestRunner,
  integrationTestRunner,
  createIntegrationTestSuites,
} from './testing';

// 6.3 パフォーマンス最適化
export {
  PerformanceMonitor,
  PerformanceOptimizer,
  performanceMonitor,
  performanceOptimizer,
} from './optimization';
export type { OptimizationReport } from './optimization';

// 6.4 セキュリティ監査
export {
  SecurityScanner,
  ComplianceChecker,
  SecurityAuditor,
  securityScanner,
  complianceChecker,
  securityAuditor,
} from './security';

// 6.5 ドキュメント整備
export {
  DocumentationGenerator,
  documentationGenerator,
  generateExecutiveCopilotDocs,
} from './docs';
export type {
  APIDocumentation,
  EndpointDoc,
  ParameterDoc,
  RequestBodyDoc,
  ContentDoc,
  ResponseDoc,
  SchemaDoc,
  PropertyDoc,
  SchemaRef,
  AuthenticationDoc,
  OAuthFlowDoc,
  ErrorDoc,
  ChangelogEntry,
  ChangeItem,
  ExampleDoc,
} from './docs';

// 6.6 デプロイメント
export {
  DeploymentBuilder,
  DeploymentManager,
  deploymentManager,
  createVercelConfig,
  createRailwayConfig,
} from './deployment';

// 6.7 運用監視
export {
  MetricsCollector,
  AlertManager,
  HealthChecker,
  EventBus,
  MonitoringService,
  metricsCollector,
  alertManager,
  healthChecker,
  eventBus,
  monitoringService,
} from './monitoring';

// ファサードパターンによる統合エクスポート
import { copilotRegistry, copilotMessageBroker, copilotOrchestrator } from './copilots';
import { integrationTestRunner } from './testing';
import { performanceMonitor, performanceOptimizer } from './optimization';
import { securityScanner, complianceChecker, securityAuditor } from './security';
import { documentationGenerator } from './docs';
import { deploymentManager } from './deployment';
import { monitoringService, healthChecker, alertManager, eventBus } from './monitoring';

/**
 * 統合層ファサード
 *
 * Phase 6の7つの機能領域を統合して提供:
 * 1. コパイロット連携 (copilots)
 * 2. 統合テスト (testing)
 * 3. パフォーマンス最適化 (optimization)
 * 4. セキュリティ監査 (security)
 * 5. ドキュメント (docs)
 * 6. デプロイメント (deployment)
 * 7. 運用監視 (monitoring)
 */
export const integrationLayer = {
  // 6.1: コパイロット連携
  copilots: {
    registry: copilotRegistry,
    broker: copilotMessageBroker,
    orchestrator: copilotOrchestrator,
  },

  // 6.2: 統合テスト
  testing: {
    runner: integrationTestRunner,
  },

  // 6.3: パフォーマンス最適化
  optimization: {
    monitor: performanceMonitor,
    optimizer: performanceOptimizer,
  },

  // 6.4: セキュリティ監査
  security: {
    scanner: securityScanner,
    compliance: complianceChecker,
    auditor: securityAuditor,
  },

  // 6.5: ドキュメント整備
  docs: {
    generator: documentationGenerator,
  },

  // 6.6: デプロイメント
  deployment: {
    manager: deploymentManager,
  },

  // 6.7: 運用監視
  monitoring: {
    service: monitoringService,
    health: healthChecker,
    alerts: alertManager,
    events: eventBus,
  },
};

export default integrationLayer;
