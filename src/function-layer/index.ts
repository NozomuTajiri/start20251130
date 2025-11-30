/**
 * 機能提供層 (Function Layer)
 *
 * 価値創造エグゼクティブ・コパイロットの機能エンジン群を提供
 * Issue #6: 機能提供層 - 4つのコア機能エンジン実装
 */

// 型定義のエクスポート
export * from './types';

// 4.1-4.3: 価値創造基盤設計機能
export { organizationalCapabilityEngine } from './engines/OrganizationalCapabilityEngine';
export { organizationalStructureEngine } from './engines/OrganizationalStructureEngine';
export { ecosystemDesignEngine } from './engines/EcosystemDesignEngine';

// 4.4-4.6: 価値整合戦略立案機能
export { purposeAlignmentEngine } from './engines/PurposeAlignmentEngine';
export { strategyAlignmentEngine } from './engines/StrategyAlignmentEngine';
export { scenarioGenerationEngine } from './engines/ScenarioGenerationEngine';

// 4.7-4.9: 価値主義組織変革機能
export { transformationRoadmapEngine } from './engines/TransformationRoadmapEngine';
export { resistanceAnalysisEngine } from './engines/ResistanceAnalysisEngine';
export { cultureTransformationEngine } from './engines/CultureTransformationEngine';

// 4.10-4.12: 価値創造パフォーマンス管理機能
export { valueAssessmentEngine } from './engines/ValueAssessmentEngine';
export { causalChainEngine } from './engines/CausalChainEngine';
export { dynamicGoalEngine } from './engines/DynamicGoalEngine';

// ファサードパターンによる統合エクスポート
import { organizationalCapabilityEngine } from './engines/OrganizationalCapabilityEngine';
import { organizationalStructureEngine } from './engines/OrganizationalStructureEngine';
import { ecosystemDesignEngine } from './engines/EcosystemDesignEngine';
import { purposeAlignmentEngine } from './engines/PurposeAlignmentEngine';
import { strategyAlignmentEngine } from './engines/StrategyAlignmentEngine';
import { scenarioGenerationEngine } from './engines/ScenarioGenerationEngine';
import { transformationRoadmapEngine } from './engines/TransformationRoadmapEngine';
import { resistanceAnalysisEngine } from './engines/ResistanceAnalysisEngine';
import { cultureTransformationEngine } from './engines/CultureTransformationEngine';
import { valueAssessmentEngine } from './engines/ValueAssessmentEngine';
import { causalChainEngine } from './engines/CausalChainEngine';
import { dynamicGoalEngine } from './engines/DynamicGoalEngine';

/**
 * 機能提供層ファサード
 *
 * 4つのコア機能領域を統合して提供:
 * 1. 価値創造基盤設計機能 (valueCreationFoundation)
 * 2. 価値整合戦略立案機能 (valueAlignmentStrategy)
 * 3. 価値主義組織変革機能 (valueBasedTransformation)
 * 4. 価値創造パフォーマンス管理機能 (valueCreationPerformance)
 */
export const functionLayer = {
  // 4.1-4.3: 価値創造基盤設計機能
  valueCreationFoundation: {
    organizationalCapability: organizationalCapabilityEngine,
    organizationalStructure: organizationalStructureEngine,
    ecosystemDesign: ecosystemDesignEngine,
  },

  // 4.4-4.6: 価値整合戦略立案機能
  valueAlignmentStrategy: {
    purposeAlignment: purposeAlignmentEngine,
    strategyAlignment: strategyAlignmentEngine,
    scenarioGeneration: scenarioGenerationEngine,
  },

  // 4.7-4.9: 価値主義組織変革機能
  valueBasedTransformation: {
    transformationRoadmap: transformationRoadmapEngine,
    resistanceAnalysis: resistanceAnalysisEngine,
    cultureTransformation: cultureTransformationEngine,
  },

  // 4.10-4.12: 価値創造パフォーマンス管理機能
  valueCreationPerformance: {
    valueAssessment: valueAssessmentEngine,
    causalChain: causalChainEngine,
    dynamicGoal: dynamicGoalEngine,
  },

  // 個別エンジンへの直接アクセス
  engines: {
    organizationalCapability: organizationalCapabilityEngine,
    organizationalStructure: organizationalStructureEngine,
    ecosystemDesign: ecosystemDesignEngine,
    purposeAlignment: purposeAlignmentEngine,
    strategyAlignment: strategyAlignmentEngine,
    scenarioGeneration: scenarioGenerationEngine,
    transformationRoadmap: transformationRoadmapEngine,
    resistanceAnalysis: resistanceAnalysisEngine,
    cultureTransformation: cultureTransformationEngine,
    valueAssessment: valueAssessmentEngine,
    causalChain: causalChainEngine,
    dynamicGoal: dynamicGoalEngine,
  },
};

export default functionLayer;
