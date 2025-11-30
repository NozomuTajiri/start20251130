/**
 * Interface Layer Export
 * Phase 5: UIダッシュボード・対話システム構築
 */

// 型定義のエクスポート（コンポーネントと名前が衝突するものは別名でエクスポート）
export type {
  TimeRange,
  FilterOptions,
  ChartData,
  Dataset,
  TableColumn,
  PaginationState,
  ValuePulseData,
  ValueDimension,
  SubDimension,
  PulseAlert,
  PulseBoardConfig,
  StrategyMap,
  StrategyPerspective,
  StrategicObjective,
  ObjectiveKPI,
  StrategyConnection,
  NavigatorState,
  SimulatorState,
  ScenarioConfig,
  ScenarioParameter,
  Assumption,
  SimulationResult,
  SimulationOutcome,
  TimelinePoint,
  ScenarioComparison,
  MetricDifference,
  CollectiveIntelligence,
  CollectiveInsight,
  Discussion,
  DiscussionMessage,
  Reaction,
  Comment,
  Vote,
  VoteOption,
  ConsensusMetric,
  DialogueSession,
  DialogueMessage,
  DialogueContext,
  UserPreferences,
  MessageMetadata,
  InsightCapture as InsightCaptureType,
  InsightSource,
  LinkedEntity,
  InsightCaptureForm,
  DecisionSupport as DecisionSupportType,
  Decision,
  DecisionOption,
  DecisionCriteria,
  RiskAssessment,
  DecisionAnalysis,
  SWOTAnalysis,
  CostBenefitAnalysis,
  CostItem,
  BenefitItem,
  SensitivityAnalysis,
  SensitivityVariable,
  SensitivityScenario,
  Recommendation,
  Stakeholder,
  ValueStrategyMap,
  MapLayer,
  MapNode,
  MapEdge,
  MapAnnotation,
  MapMetadata,
  NodeMetric,
  NodeStyle,
  EdgeStyle,
  OrganizationBlueprint,
  BlueprintStructure,
  BlueprintRole,
  BlueprintProcess,
  OrganizationalUnit,
  ReportingLine,
  CollaborationLink,
  RoleRelationship,
  ProcessStep,
  GovernanceModel,
  DecisionFramework,
  DecisionLevel,
  Committee,
  Policy,
  CultureDefinition,
  CultureValue,
  DesiredBehavior,
  CultureNorm,
  ResourcePortfolio,
  ResourceAllocation,
  AllocationBreakdown,
  Initiative,
  InitiativeTimeline,
  InitiativeMilestone,
  InitiativeResource,
  ResourceConstraint,
  OptimizationResult,
  RecommendedAllocation,
  Tradeoff,
  LeadershipProgram,
  LeadershipCompetency,
  CompetencyLevel,
  ProgramModule,
  ModuleMaterial,
  ModuleActivity,
  LeadershipAssessment,
  AssessmentQuestion,
  Participant,
  ParticipantProgress,
  AssessmentResult,
  ProgramMetric,
} from './types';

// 5.1-5.4: ダッシュボードコンポーネント
export {
  ValuePulseBoard,
  StrategyNavigator,
  ScenarioSimulator,
  CollectiveIntelligencePlatform,
} from './components/dashboard';
export type {
  ValuePulseBoardProps,
  StrategyNavigatorProps,
  ScenarioSimulatorProps,
  CollectiveIntelligencePlatformProps,
} from './components/dashboard';

// 5.5-5.7: 対話システムUI
export {
  StrategyDialogue,
  InsightCapture,
  DecisionSupport,
} from './components/dialogue';
export type {
  StrategyDialogueProps,
  InsightCaptureProps,
  DecisionSupportProps,
} from './components/dialogue';

// 5.8-5.11: 出力コンポーネント
export {
  ValueStrategyMapView,
  OrganizationBlueprintView,
  ResourcePortfolioView,
  LeadershipProgramView,
} from './components/output';
export type {
  ValueStrategyMapViewProps,
  OrganizationBlueprintViewProps,
  ResourcePortfolioViewProps,
  LeadershipProgramViewProps,
} from './components/output';

// ファサードパターンによる統合エクスポート
import {
  ValuePulseBoard,
  StrategyNavigator,
  ScenarioSimulator,
  CollectiveIntelligencePlatform,
} from './components/dashboard';

import {
  StrategyDialogue,
  InsightCapture,
  DecisionSupport,
} from './components/dialogue';

import {
  ValueStrategyMapView,
  OrganizationBlueprintView,
  ResourcePortfolioView,
  LeadershipProgramView,
} from './components/output';

/**
 * インターフェース層ファサード
 *
 * 3つの機能領域を統合して提供:
 * 1. ダッシュボード (dashboard)
 * 2. 対話システム (dialogue)
 * 3. 出力コンポーネント (output)
 */
export const interfaceLayer = {
  // 5.1-5.4: ダッシュボードコンポーネント
  dashboard: {
    ValuePulseBoard,
    StrategyNavigator,
    ScenarioSimulator,
    CollectiveIntelligencePlatform,
  },

  // 5.5-5.7: 対話システムUI
  dialogue: {
    StrategyDialogue,
    InsightCapture,
    DecisionSupport,
  },

  // 5.8-5.11: 出力コンポーネント
  output: {
    ValueStrategyMapView,
    OrganizationBlueprintView,
    ResourcePortfolioView,
    LeadershipProgramView,
  },

  // 全コンポーネントへの直接アクセス
  components: {
    // Dashboard
    ValuePulseBoard,
    StrategyNavigator,
    ScenarioSimulator,
    CollectiveIntelligencePlatform,
    // Dialogue
    StrategyDialogue,
    InsightCapture,
    DecisionSupport,
    // Output
    ValueStrategyMapView,
    OrganizationBlueprintView,
    ResourcePortfolioView,
    LeadershipProgramView,
  },
};

export default interfaceLayer;
