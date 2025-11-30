/**
 * Interface Layer Types
 * Phase 5: UIダッシュボード・対話システム型定義
 */

// ========================================
// 共通型
// ========================================

export interface TimeRange {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface FilterOptions {
  dimensions?: string[];
  metrics?: string[];
  segments?: string[];
  timeRange?: TimeRange;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
}

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// ========================================
// 5.1 価値創造パルスボード
// ========================================

export interface ValuePulseData {
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  dimensions: ValueDimension[];
  alerts: PulseAlert[];
  lastUpdated: Date;
}

export interface ValueDimension {
  id: string;
  name: string;
  score: number;
  weight: number;
  trend: 'up' | 'down' | 'stable';
  subDimensions: SubDimension[];
}

export interface SubDimension {
  id: string;
  name: string;
  score: number;
  target: number;
  status: 'on-track' | 'at-risk' | 'off-track';
}

export interface PulseAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  dimension: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface PulseBoardConfig {
  refreshInterval: number;
  showAlerts: boolean;
  showTrends: boolean;
  dimensionLayout: 'grid' | 'list' | 'radar';
}

// ========================================
// 5.2 戦略ナビゲーター
// ========================================

export interface StrategyMap {
  id: string;
  name: string;
  perspectives: StrategyPerspective[];
  connections: StrategyConnection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyPerspective {
  id: string;
  name: string;
  order: number;
  objectives: StrategicObjective[];
}

export interface StrategicObjective {
  id: string;
  name: string;
  description: string;
  perspectiveId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  kpis: ObjectiveKPI[];
  owner?: string;
  dueDate?: Date;
}

export interface ObjectiveKPI {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: number[];
}

export interface StrategyConnection {
  sourceId: string;
  targetId: string;
  type: 'supports' | 'enables' | 'drives';
  strength: number;
}

export interface NavigatorState {
  selectedPerspective?: string;
  selectedObjective?: string;
  viewMode: 'map' | 'list' | 'timeline';
  filters: FilterOptions;
}

// ========================================
// 5.3 シナリオシミュレーター
// ========================================

export interface SimulatorState {
  scenarios: ScenarioConfig[];
  activeScenario?: string;
  simulationResults?: SimulationResult;
  isRunning: boolean;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  parameters: ScenarioParameter[];
  assumptions: Assumption[];
  createdAt: Date;
}

export interface ScenarioParameter {
  id: string;
  name: string;
  type: 'number' | 'percentage' | 'boolean' | 'select';
  value: number | boolean | string;
  min?: number;
  max?: number;
  options?: string[];
  unit?: string;
}

export interface Assumption {
  id: string;
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface SimulationResult {
  scenarioId: string;
  timestamp: Date;
  outcomes: SimulationOutcome[];
  comparisons: ScenarioComparison[];
  recommendations: string[];
}

export interface SimulationOutcome {
  metric: string;
  baseline: number;
  projected: number;
  confidence: number;
  timeline: TimelinePoint[];
}

export interface TimelinePoint {
  date: Date;
  value: number;
  confidence: [number, number];
}

export interface ScenarioComparison {
  scenarioA: string;
  scenarioB: string;
  differences: MetricDifference[];
}

export interface MetricDifference {
  metric: string;
  valueA: number;
  valueB: number;
  percentageDiff: number;
}

// ========================================
// 5.4 集合知形成プラットフォーム
// ========================================

export interface CollectiveIntelligence {
  insights: CollectiveInsight[];
  discussions: Discussion[];
  votes: Vote[];
  consensus: ConsensusMetric[];
}

export interface CollectiveInsight {
  id: string;
  content: string;
  author: string;
  category: string;
  type: 'observation' | 'hypothesis' | 'recommendation' | 'question';
  tags: string[];
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  createdAt: Date;
  status: 'pending' | 'validated' | 'implemented' | 'rejected';
}

export interface Discussion {
  id: string;
  title: string;
  topic: string;
  participants: string[];
  messages: DiscussionMessage[];
  status: 'open' | 'resolved' | 'archived';
  createdAt: Date;
}

export interface DiscussionMessage {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  reactions: Reaction[];
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  replies: Comment[];
}

export interface Vote {
  id: string;
  topic: string;
  options: VoteOption[];
  deadline: Date;
  status: 'active' | 'closed';
  totalVotes: number;
}

export interface VoteOption {
  id: string;
  label: string;
  votes: number;
  percentage: number;
}

export interface ConsensusMetric {
  topic: string;
  consensusLevel: number;
  participationRate: number;
  divergentViews: string[];
}

// ========================================
// 5.5 戦略対話UI
// ========================================

export interface DialogueSession {
  id: string;
  type: 'strategy' | 'insight' | 'decision';
  messages: DialogueMessage[];
  context: DialogueContext;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface DialogueMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  sources?: string[];
  confidence?: number;
  relatedInsights?: string[];
  suggestedActions?: string[];
}

export interface DialogueContext {
  currentTopic?: string;
  relatedObjectives?: string[];
  dataContext?: Record<string, unknown>;
  userPreferences?: UserPreferences;
}

export interface UserPreferences {
  responseLength: 'brief' | 'detailed' | 'comprehensive';
  visualizationPreference: 'charts' | 'tables' | 'mixed';
  notificationLevel: 'all' | 'important' | 'critical';
}

// ========================================
// 5.6 洞察キャプチャUI
// ========================================

export interface InsightCapture {
  id: string;
  title: string;
  content: string;
  type: 'observation' | 'hypothesis' | 'recommendation' | 'question';
  source: InsightSource;
  tags: string[];
  linkedEntities: LinkedEntity[];
  status: 'draft' | 'submitted' | 'reviewed' | 'published';
  createdBy: string;
  createdAt: Date;
}

export interface InsightSource {
  type: 'meeting' | 'report' | 'conversation' | 'analysis' | 'external';
  reference?: string;
  date?: Date;
}

export interface LinkedEntity {
  type: 'objective' | 'kpi' | 'initiative' | 'risk' | 'opportunity';
  id: string;
  name: string;
}

export interface InsightCaptureForm {
  title: string;
  content: string;
  type: InsightCapture['type'];
  tags: string[];
  linkedEntities: string[];
}

// ========================================
// 5.7 意思決定支援UI
// ========================================

export interface DecisionSupport {
  decision: Decision;
  analysis: DecisionAnalysis;
  recommendations: Recommendation[];
  stakeholders: Stakeholder[];
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  impact: 'high' | 'medium' | 'low';
  options: DecisionOption[];
  criteria: DecisionCriteria[];
  status: 'pending' | 'in-review' | 'decided' | 'implemented';
  deadline?: Date;
}

export interface DecisionOption {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  scores: Record<string, number>;
  totalScore: number;
  risk: RiskAssessment;
}

export interface DecisionCriteria {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export interface RiskAssessment {
  level: 'high' | 'medium' | 'low';
  factors: string[];
  mitigations: string[];
}

export interface DecisionAnalysis {
  swotAnalysis?: SWOTAnalysis;
  costBenefitAnalysis?: CostBenefitAnalysis;
  sensitivityAnalysis?: SensitivityAnalysis;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CostBenefitAnalysis {
  costs: CostItem[];
  benefits: BenefitItem[];
  netBenefit: number;
  paybackPeriod: string;
  roi: number;
}

export interface CostItem {
  description: string;
  amount: number;
  category: string;
  timing: 'upfront' | 'ongoing';
}

export interface BenefitItem {
  description: string;
  amount: number;
  category: string;
  probability: number;
}

export interface SensitivityAnalysis {
  variables: SensitivityVariable[];
  scenarios: SensitivityScenario[];
}

export interface SensitivityVariable {
  name: string;
  baseValue: number;
  range: [number, number];
  impact: number;
}

export interface SensitivityScenario {
  name: string;
  changes: Record<string, number>;
  outcome: number;
}

export interface Recommendation {
  id: string;
  optionId: string;
  rationale: string;
  confidence: number;
  conditions: string[];
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: 'high' | 'medium' | 'low';
  interest: 'high' | 'medium' | 'low';
  position?: 'supportive' | 'neutral' | 'resistant';
}

// ========================================
// 5.8 価値創造戦略マップ
// ========================================

export interface ValueStrategyMap {
  id: string;
  name: string;
  version: string;
  layers: MapLayer[];
  nodes: MapNode[];
  edges: MapEdge[];
  annotations: MapAnnotation[];
  metadata: MapMetadata;
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'financial' | 'customer' | 'process' | 'learning' | 'custom';
  order: number;
  color: string;
  visible: boolean;
}

export interface MapNode {
  id: string;
  layerId: string;
  label: string;
  description: string;
  x: number;
  y: number;
  status: 'active' | 'planned' | 'completed' | 'at-risk';
  metrics: NodeMetric[];
  style?: NodeStyle;
}

export interface NodeMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
}

export interface NodeStyle {
  shape: 'rectangle' | 'circle' | 'diamond' | 'hexagon';
  size: 'small' | 'medium' | 'large';
  color?: string;
  icon?: string;
}

export interface MapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: 'causal' | 'supports' | 'enables' | 'blocks';
  strength: number;
  style?: EdgeStyle;
}

export interface EdgeStyle {
  lineType: 'solid' | 'dashed' | 'dotted';
  color?: string;
  animated?: boolean;
}

export interface MapAnnotation {
  id: string;
  type: 'note' | 'highlight' | 'callout';
  content: string;
  position: { x: number; y: number };
  targetNodes?: string[];
}

export interface MapMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  status: 'draft' | 'review' | 'approved' | 'archived';
}

// ========================================
// 5.9 組織設計ブループリント
// ========================================

export interface OrganizationBlueprint {
  id: string;
  name: string;
  version: string;
  structure: BlueprintStructure;
  roles: BlueprintRole[];
  processes: BlueprintProcess[];
  governance: GovernanceModel;
  culture: CultureDefinition;
}

export interface BlueprintStructure {
  type: 'hierarchical' | 'matrix' | 'flat' | 'network' | 'hybrid';
  units: OrganizationalUnit[];
  reportingLines: ReportingLine[];
  collaborationLinks: CollaborationLink[];
}

export interface OrganizationalUnit {
  id: string;
  name: string;
  type: 'division' | 'department' | 'team' | 'squad' | 'guild';
  parentId?: string;
  purpose: string;
  headcount: { current: number; planned: number };
  capabilities: string[];
}

export interface ReportingLine {
  from: string;
  to: string;
  type: 'solid' | 'dotted';
}

export interface CollaborationLink {
  unitA: string;
  unitB: string;
  type: string;
  frequency: string;
}

export interface BlueprintRole {
  id: string;
  title: string;
  unitId: string;
  responsibilities: string[];
  authorities: string[];
  competencies: string[];
  relationships: RoleRelationship[];
}

export interface RoleRelationship {
  roleId: string;
  type: 'reports-to' | 'collaborates-with' | 'delegates-to';
}

export interface BlueprintProcess {
  id: string;
  name: string;
  owner: string;
  steps: ProcessStep[];
  inputs: string[];
  outputs: string[];
  metrics: string[];
}

export interface ProcessStep {
  id: string;
  name: string;
  responsible: string;
  duration: string;
  tools: string[];
}

export interface GovernanceModel {
  decisionFramework: DecisionFramework;
  committees: Committee[];
  policies: Policy[];
}

export interface DecisionFramework {
  levels: DecisionLevel[];
  escalationPath: string[];
}

export interface DecisionLevel {
  name: string;
  authority: string;
  scope: string;
  approvalRequired: boolean;
}

export interface Committee {
  name: string;
  purpose: string;
  members: string[];
  meetingFrequency: string;
  decisions: string[];
}

export interface Policy {
  name: string;
  description: string;
  scope: string;
  owner: string;
}

export interface CultureDefinition {
  values: CultureValue[];
  behaviors: DesiredBehavior[];
  norms: CultureNorm[];
}

export interface CultureValue {
  name: string;
  description: string;
  manifestations: string[];
}

export interface DesiredBehavior {
  behavior: string;
  context: string;
  examples: string[];
}

export interface CultureNorm {
  norm: string;
  rationale: string;
}

// ========================================
// 5.10 資源配分ポートフォリオ
// ========================================

export interface ResourcePortfolio {
  id: string;
  name: string;
  period: TimeRange;
  totalBudget: number;
  allocations: ResourceAllocation[];
  initiatives: Initiative[];
  constraints: ResourceConstraint[];
  optimization: OptimizationResult;
}

export interface ResourceAllocation {
  id: string;
  category: string;
  allocated: number;
  utilized: number;
  planned: number;
  variance: number;
  breakdown: AllocationBreakdown[];
}

export interface AllocationBreakdown {
  item: string;
  amount: number;
  percentage: number;
}

export interface Initiative {
  id: string;
  name: string;
  description: string;
  priority: number;
  budget: number;
  spent: number;
  status: 'proposed' | 'approved' | 'active' | 'completed' | 'cancelled';
  expectedReturn: number;
  actualReturn?: number;
  timeline: InitiativeTimeline;
  resources: InitiativeResource[];
}

export interface InitiativeTimeline {
  startDate: Date;
  endDate: Date;
  milestones: InitiativeMilestone[];
}

export interface InitiativeMilestone {
  name: string;
  date: Date;
  status: 'pending' | 'completed' | 'delayed';
}

export interface InitiativeResource {
  type: 'budget' | 'headcount' | 'technology' | 'other';
  name: string;
  quantity: number;
  unit: string;
}

export interface ResourceConstraint {
  type: string;
  description: string;
  limit: number;
  current: number;
}

export interface OptimizationResult {
  recommendedAllocations: RecommendedAllocation[];
  potentialSavings: number;
  efficiencyGain: number;
  tradeoffs: Tradeoff[];
}

export interface RecommendedAllocation {
  category: string;
  currentAmount: number;
  recommendedAmount: number;
  rationale: string;
}

export interface Tradeoff {
  option: string;
  benefit: string;
  cost: string;
}

// ========================================
// 5.11 リーダーシップ開発プログラム
// ========================================

export interface LeadershipProgram {
  id: string;
  name: string;
  description: string;
  targetAudience: string[];
  competencies: LeadershipCompetency[];
  modules: ProgramModule[];
  assessments: LeadershipAssessment[];
  participants: Participant[];
  metrics: ProgramMetric[];
}

export interface LeadershipCompetency {
  id: string;
  name: string;
  description: string;
  levels: CompetencyLevel[];
  behaviors: string[];
}

export interface CompetencyLevel {
  level: number;
  name: string;
  description: string;
  indicators: string[];
}

export interface ProgramModule {
  id: string;
  name: string;
  description: string;
  duration: string;
  format: 'workshop' | 'coaching' | 'online' | 'project' | 'assessment';
  competencies: string[];
  materials: ModuleMaterial[];
  activities: ModuleActivity[];
}

export interface ModuleMaterial {
  type: 'video' | 'document' | 'exercise' | 'case-study';
  title: string;
  url?: string;
  duration?: string;
}

export interface ModuleActivity {
  name: string;
  type: 'individual' | 'group' | 'peer';
  description: string;
  deliverable?: string;
}

export interface LeadershipAssessment {
  id: string;
  type: '360-feedback' | 'self-assessment' | 'simulation' | 'observation';
  name: string;
  competencies: string[];
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'rating' | 'multiple-choice' | 'open-ended';
  competencyId: string;
  options?: string[];
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  department: string;
  enrolledDate: Date;
  progress: ParticipantProgress;
  assessmentResults: AssessmentResult[];
}

export interface ParticipantProgress {
  completedModules: string[];
  currentModule?: string;
  overallProgress: number;
  nextMilestone?: string;
}

export interface AssessmentResult {
  assessmentId: string;
  date: Date;
  scores: Record<string, number>;
  overallScore: number;
  strengths: string[];
  developmentAreas: string[];
  feedback?: string;
}

export interface ProgramMetric {
  name: string;
  value: number;
  target: number;
  trend: number[];
}
