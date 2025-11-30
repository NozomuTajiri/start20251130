/**
 * Copilots Module Export
 * 6.1 他コパイロット連携
 */

export {
  CopilotRegistry,
  CopilotMessageBroker,
  copilotRegistry,
  copilotMessageBroker,
  createDefaultCopilotConfigs,
} from './CopilotRegistry';

export {
  CopilotOrchestrator,
  copilotOrchestrator,
  createPresetWorkflows,
} from './CopilotOrchestrator';

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
} from './CopilotOrchestrator';
