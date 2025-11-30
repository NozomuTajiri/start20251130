/**
 * Function Layer Types
 * 4. 機能提供層の型定義
 */

// ============================================
// 共通型
// ============================================

export interface FunctionResult<T> {
  data: T;
  confidence: number;
  timestamp: Date;
  processingTime: number;
  recommendations?: string[];
  warnings?: string[];
}

// ============================================
// 4.1-4.3 価値創造基盤設計機能
// ============================================

// 4.1 組織能力分析
export interface OrganizationalCapability {
  id: string;
  name: string;
  category: 'core' | 'supporting' | 'dynamic';
  currentLevel: number; // 1-5
  targetLevel: number;
  gap: number;
  components: CapabilityComponent[];
  dependencies: string[];
}

export interface CapabilityComponent {
  name: string;
  type: 'people' | 'process' | 'technology' | 'culture';
  maturityLevel: number;
  description: string;
}

export interface CapabilityAssessment {
  capabilities: OrganizationalCapability[];
  overallMaturity: number;
  strengths: string[];
  weaknesses: string[];
  strategicGaps: StrategicGap[];
  developmentPriorities: DevelopmentPriority[];
}

export interface StrategicGap {
  capability: string;
  currentState: string;
  desiredState: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  closingStrategies: string[];
}

export interface DevelopmentPriority {
  capability: string;
  priority: number;
  rationale: string;
  requiredInvestment: string;
  expectedTimeframe: string;
}

// 4.2 組織構造最適化
export interface OrganizationalUnit {
  id: string;
  name: string;
  type: 'division' | 'department' | 'team' | 'role';
  parentId?: string;
  responsibilities: string[];
  headcount: number;
  budget?: number;
}

export interface OrganizationalStructure {
  units: OrganizationalUnit[];
  relationships: UnitRelationship[];
  hierarchyDepth: number;
  spanOfControl: number;
  centralization: number;
}

export interface UnitRelationship {
  fromId: string;
  toId: string;
  type: 'reports-to' | 'collaborates-with' | 'supports' | 'depends-on';
  strength: number;
}

export interface StructureOptimization {
  currentStructure: OrganizationalStructure;
  recommendedStructure: OrganizationalStructure;
  changes: StructureChange[];
  benefits: string[];
  risks: string[];
  implementationPlan: ImplementationStep[];
}

export interface StructureChange {
  type: 'create' | 'merge' | 'split' | 'relocate' | 'eliminate';
  targetUnit: string;
  description: string;
  rationale: string;
  impact: ImpactAssessment;
}

export interface ImpactAssessment {
  scope: 'organization' | 'division' | 'department' | 'team';
  affectedPeople: number;
  costImpact: string;
  timelineImpact: string;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface ImplementationStep {
  phase: number;
  name: string;
  description: string;
  duration: string;
  dependencies: number[];
  milestones: string[];
}

// 4.3 エコシステム設計
export interface EcosystemParticipant {
  id: string;
  name: string;
  type: 'core' | 'complementor' | 'supplier' | 'customer' | 'competitor' | 'regulator';
  role: string;
  influence: number;
  dependence: number;
}

export interface EcosystemRelationship {
  fromId: string;
  toId: string;
  type: 'value-exchange' | 'partnership' | 'competition' | 'regulation';
  valueFlow: string;
  strength: number;
}

export interface Ecosystem {
  participants: EcosystemParticipant[];
  relationships: EcosystemRelationship[];
  valuePropositions: ValueProposition[];
  platformStrategy?: PlatformStrategy;
}

export interface ValueProposition {
  targetSegment: string;
  offering: string;
  uniqueValue: string;
  competitiveAdvantage: string[];
}

export interface PlatformStrategy {
  platformType: 'transaction' | 'innovation' | 'integrated';
  networkEffects: NetworkEffect[];
  monetizationModel: string;
  governanceRules: string[];
}

export interface NetworkEffect {
  type: 'same-side' | 'cross-side';
  description: string;
  strength: number;
}

export interface EcosystemDesign {
  currentEcosystem: Ecosystem;
  targetEcosystem: Ecosystem;
  strategies: EcosystemStrategy[];
  risks: EcosystemRisk[];
  metrics: EcosystemMetric[];
}

export interface EcosystemStrategy {
  name: string;
  objective: string;
  tactics: string[];
  timeline: string;
  expectedOutcome: string;
}

export interface EcosystemRisk {
  description: string;
  probability: number;
  impact: number;
  mitigationStrategy: string;
}

export interface EcosystemMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
}

// ============================================
// 4.4-4.6 価値整合戦略立案機能
// ============================================

// 4.4 パーパス具現化
export interface Purpose {
  statement: string;
  values: CoreValue[];
  vision: string;
  mission: string;
}

export interface CoreValue {
  name: string;
  description: string;
  behaviors: string[];
  metrics: string[];
}

export interface PurposeAlignment {
  purpose: Purpose;
  alignmentScore: number;
  alignedInitiatives: AlignedInitiative[];
  misalignments: Misalignment[];
  recommendations: string[];
}

export interface AlignedInitiative {
  name: string;
  alignmentScore: number;
  connectedValues: string[];
  contribution: string;
}

export interface Misalignment {
  area: string;
  description: string;
  severity: 'critical' | 'significant' | 'minor';
  suggestedAction: string;
}

// 4.5 戦略整合性分析
export interface Strategy {
  id: string;
  name: string;
  level: 'corporate' | 'business' | 'functional';
  objectives: StrategicObjective[];
  initiatives: StrategicInitiative[];
  timeHorizon: string;
}

export interface StrategicObjective {
  id: string;
  description: string;
  metrics: string[];
  targets: Record<string, number>;
  owner: string;
}

export interface StrategicInitiative {
  id: string;
  name: string;
  objectiveIds: string[];
  resources: ResourceRequirement[];
  timeline: Timeline;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
}

export interface ResourceRequirement {
  type: 'budget' | 'headcount' | 'technology' | 'capability';
  amount: string;
  availability: 'available' | 'constrained' | 'unavailable';
}

export interface Timeline {
  start: Date;
  end: Date;
  milestones: Milestone[];
}

export interface Milestone {
  name: string;
  date: Date;
  deliverables: string[];
}

export interface StrategyAlignment {
  strategies: Strategy[];
  alignmentMatrix: AlignmentScore[][];
  conflicts: StrategyConflict[];
  synergies: StrategySynergy[];
  recommendations: string[];
}

export interface AlignmentScore {
  strategyId1: string;
  strategyId2: string;
  score: number;
  factors: string[];
}

export interface StrategyConflict {
  strategies: string[];
  description: string;
  severity: 'blocking' | 'significant' | 'minor';
  resolution: string;
}

export interface StrategySynergy {
  strategies: string[];
  description: string;
  potential: 'high' | 'medium' | 'low';
  exploitation: string;
}

// 4.6 多次元シナリオ生成
export interface ScenarioDriver {
  name: string;
  uncertainty: 'high' | 'medium' | 'low';
  impact: 'transformative' | 'significant' | 'moderate';
  possibleStates: string[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  drivers: Record<string, string>;
  probability: number;
  impact: ScenarioImpact;
  timeline: string;
}

export interface ScenarioImpact {
  revenue: number;
  market: number;
  operations: number;
  reputation: number;
  overall: number;
}

export interface ScenarioAnalysis {
  drivers: ScenarioDriver[];
  scenarios: Scenario[];
  recommendations: ScenarioRecommendation[];
  robustStrategies: string[];
  earlyWarnings: EarlyWarning[];
}

export interface ScenarioRecommendation {
  scenario: string;
  actions: string[];
  priority: 'immediate' | 'short-term' | 'long-term';
  contingencies: string[];
}

export interface EarlyWarning {
  indicator: string;
  threshold: string;
  relatedScenarios: string[];
  responseAction: string;
}

// ============================================
// 4.7-4.9 価値主義組織変革機能
// ============================================

// 4.7 変革ロードマップ設計
export interface TransformationGoal {
  id: string;
  description: string;
  category: 'capability' | 'culture' | 'process' | 'technology';
  currentState: string;
  targetState: string;
  priority: number;
}

export interface TransformationPhase {
  id: string;
  name: string;
  objectives: string[];
  initiatives: TransformationInitiative[];
  duration: string;
  dependencies: string[];
  successCriteria: string[];
}

export interface TransformationInitiative {
  id: string;
  name: string;
  description: string;
  owner: string;
  resources: ResourceRequirement[];
  risks: string[];
  benefits: string[];
}

export interface TransformationRoadmap {
  vision: string;
  goals: TransformationGoal[];
  phases: TransformationPhase[];
  timeline: RoadmapTimeline;
  governance: GovernanceStructure;
  metrics: TransformationMetric[];
}

export interface RoadmapTimeline {
  totalDuration: string;
  phases: PhaseTimeline[];
  criticalPath: string[];
}

export interface PhaseTimeline {
  phaseId: string;
  start: Date;
  end: Date;
  milestones: Milestone[];
}

export interface GovernanceStructure {
  steeringCommittee: string[];
  workingGroups: WorkingGroup[];
  decisionRights: DecisionRight[];
  escalationPath: string[];
}

export interface WorkingGroup {
  name: string;
  focus: string;
  members: string[];
  meetingCadence: string;
}

export interface DecisionRight {
  decision: string;
  authority: string;
  consultedParties: string[];
}

export interface TransformationMetric {
  name: string;
  baseline: number;
  target: number;
  current: number;
  trend: 'improving' | 'stable' | 'declining';
}

// 4.8 変革抵抗分析
export interface StakeholderGroup {
  id: string;
  name: string;
  size: number;
  influence: number;
  impact: number;
}

export interface ResistanceFactor {
  category: 'fear' | 'habit' | 'loss' | 'misunderstanding' | 'values';
  description: string;
  intensity: number;
  affectedGroups: string[];
}

export interface ResistanceAnalysis {
  stakeholders: StakeholderAssessment[];
  factors: ResistanceFactor[];
  overallResistance: number;
  hotspots: ResistanceHotspot[];
  strategies: ResistanceMitigation[];
}

export interface StakeholderAssessment {
  group: StakeholderGroup;
  currentAttitude: 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'opponent';
  targetAttitude: 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'opponent';
  concerns: string[];
  motivations: string[];
}

export interface ResistanceHotspot {
  area: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  rootCauses: string[];
}

export interface ResistanceMitigation {
  target: string;
  strategy: string;
  tactics: string[];
  timeline: string;
  expectedOutcome: string;
}

// 4.9 組織文化変容支援
export interface CultureDimension {
  name: string;
  currentPosition: number;
  targetPosition: number;
  gap: number;
  importance: number;
}

export interface CultureAssessment {
  dimensions: CultureDimension[];
  artifacts: CultureArtifact[];
  values: CultureValue[];
  assumptions: CultureAssumption[];
  overallAlignment: number;
}

export interface CultureArtifact {
  type: 'symbol' | 'ritual' | 'language' | 'story' | 'practice';
  description: string;
  alignment: 'reinforcing' | 'neutral' | 'conflicting';
  recommendation: string;
}

export interface CultureValue {
  stated: string;
  practiced: string;
  gapAnalysis: string;
  bridgingActions: string[];
}

export interface CultureAssumption {
  assumption: string;
  implication: string;
  needsChange: boolean;
  changeStrategy?: string;
}

export interface CultureTransformation {
  assessment: CultureAssessment;
  interventions: CultureIntervention[];
  timeline: string;
  successIndicators: string[];
}

export interface CultureIntervention {
  name: string;
  targetDimension: string;
  type: 'structural' | 'behavioral' | 'symbolic' | 'systems';
  description: string;
  expectedImpact: string;
  timeline: string;
}

// ============================================
// 4.10-4.12 価値創造パフォーマンス管理機能
// ============================================

// 4.10 多次元価値評価
export interface ValueDimension {
  id: string;
  name: string;
  category: 'financial' | 'customer' | 'operational' | 'employee' | 'social' | 'environmental';
  weight: number;
  metrics: ValueMetric[];
}

export interface ValueMetric {
  id: string;
  name: string;
  unit: string;
  current: number;
  target: number;
  trend: number[];
  benchmark?: number;
}

export interface ValueAssessment {
  dimensions: ValueDimension[];
  overallScore: number;
  dimensionScores: DimensionScore[];
  insights: ValueInsight[];
  recommendations: string[];
}

export interface DimensionScore {
  dimensionId: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  drivers: string[];
}

export interface ValueInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  description: string;
  dimension: string;
  actionable: boolean;
  suggestedAction?: string;
}

// 4.11 因果連鎖可視化
export interface CausalNode {
  id: string;
  name: string;
  type: 'driver' | 'enabler' | 'outcome' | 'constraint';
  value: number;
  unit: string;
}

export interface CausalLink {
  fromId: string;
  toId: string;
  strength: number;
  lag: number;
  confidence: number;
}

export interface CausalChain {
  nodes: CausalNode[];
  links: CausalLink[];
  rootCauses: string[];
  ultimateOutcomes: string[];
}

export interface CausalVisualization {
  chain: CausalChain;
  paths: CausalPath[];
  criticalFactors: CriticalFactor[];
  interventionPoints: InterventionPoint[];
}

export interface CausalPath {
  nodeIds: string[];
  totalStrength: number;
  totalLag: number;
  description: string;
}

export interface CriticalFactor {
  nodeId: string;
  criticality: number;
  rationale: string;
  monitoringPriority: 'high' | 'medium' | 'low';
}

export interface InterventionPoint {
  nodeId: string;
  potential: number;
  difficulty: number;
  recommendations: string[];
}

// 4.12 動的目標管理
export interface Goal {
  id: string;
  name: string;
  description: string;
  category: string;
  owner: string;
  dueDate: Date;
  status: 'not-started' | 'on-track' | 'at-risk' | 'behind' | 'completed';
}

export interface GoalMetric {
  goalId: string;
  metricId: string;
  baseline: number;
  target: number;
  current: number;
  forecast: number;
}

export interface GoalHierarchy {
  goals: Goal[];
  relationships: GoalRelationship[];
  alignmentScore: number;
}

export interface GoalRelationship {
  parentId: string;
  childId: string;
  contributionWeight: number;
}

export interface DynamicGoalManagement {
  hierarchy: GoalHierarchy;
  progress: GoalProgress[];
  adjustments: GoalAdjustment[];
  alerts: GoalAlert[];
  forecasts: GoalForecast[];
}

export interface GoalProgress {
  goalId: string;
  progressPercent: number;
  milestones: MilestoneStatus[];
  blockers: string[];
}

export interface MilestoneStatus {
  name: string;
  dueDate: Date;
  status: 'completed' | 'on-track' | 'at-risk' | 'missed';
}

export interface GoalAdjustment {
  goalId: string;
  type: 'target' | 'timeline' | 'scope' | 'priority';
  previousValue: string;
  newValue: string;
  rationale: string;
  approvedBy: string;
  date: Date;
}

export interface GoalAlert {
  goalId: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestedAction: string;
}

export interface GoalForecast {
  goalId: string;
  forecastDate: Date;
  predictedValue: number;
  confidence: number;
  assumptions: string[];
}
