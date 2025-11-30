/**
 * Analysis Layer - Main Export
 * Phase 3: 分析処理層 - 9つのAIエンジン
 */

// Types
export * from './types';

// Engines
export {
  MultiDimensionalAnalysisEngine,
  multiDimensionalAnalysisEngine,
} from './engines/MultiDimensionalAnalysisEngine';

export {
  NLPEngine,
  nlpEngine,
} from './engines/NLPEngine';

export {
  PredictionEngine,
  predictionEngine,
} from './engines/PredictionEngine';

export {
  CausalInferenceEngine,
  causalInferenceEngine,
} from './engines/CausalInferenceEngine';

export {
  StrategicDialogueEngine,
  strategicDialogueEngine,
} from './engines/StrategicDialogueEngine';

export {
  TacitKnowledgeEngine,
  tacitKnowledgeEngine,
} from './engines/TacitKnowledgeEngine';

export {
  CognitiveBiasEngine,
  cognitiveBiasEngine,
} from './engines/CognitiveBiasEngine';

export {
  CollectiveIntelligenceEngine,
  collectiveIntelligenceEngine,
} from './engines/CollectiveIntelligenceEngine';

export {
  OrganizationalLearningEngine,
  organizationalLearningEngine,
} from './engines/OrganizationalLearningEngine';

// Convenience re-exports
import { multiDimensionalAnalysisEngine } from './engines/MultiDimensionalAnalysisEngine';
import { nlpEngine } from './engines/NLPEngine';
import { predictionEngine } from './engines/PredictionEngine';
import { causalInferenceEngine } from './engines/CausalInferenceEngine';
import { strategicDialogueEngine } from './engines/StrategicDialogueEngine';
import { tacitKnowledgeEngine } from './engines/TacitKnowledgeEngine';
import { cognitiveBiasEngine } from './engines/CognitiveBiasEngine';
import { collectiveIntelligenceEngine } from './engines/CollectiveIntelligenceEngine';
import { organizationalLearningEngine } from './engines/OrganizationalLearningEngine';

/**
 * Analysis Layer facade for easy access to all engines
 */
export const analysisLayer = {
  // Core Analysis Engines
  multiDimensional: multiDimensionalAnalysisEngine,
  nlp: nlpEngine,
  prediction: predictionEngine,
  causalInference: causalInferenceEngine,

  // Strategic Engines
  dialogue: strategicDialogueEngine,
  tacitKnowledge: tacitKnowledgeEngine,
  cognitiveBias: cognitiveBiasEngine,

  // Collective Intelligence Engines
  collectiveIntelligence: collectiveIntelligenceEngine,
  organizationalLearning: organizationalLearningEngine,
};

export default analysisLayer;
