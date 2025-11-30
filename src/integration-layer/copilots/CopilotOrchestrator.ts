/**
 * Copilot Orchestrator
 * 6.1 コパイロット間のワークフロー調整
 */

import type {
  CopilotMessage,
  CopilotResponse,
} from '../types';
import {
  copilotRegistry,
  copilotMessageBroker,
  CopilotRegistry,
  CopilotMessageBroker,
} from './CopilotRegistry';

/**
 * ワークフロー定義
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  onError: ErrorStrategy;
  timeout: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  copilotId: string;
  capabilityId: string;
  input: InputMapping;
  condition?: StepCondition;
  retries: number;
  timeout: number;
}

export interface InputMapping {
  type: 'static' | 'previous' | 'context';
  source?: string;
  value?: unknown;
  transform?: (data: unknown) => unknown;
}

export interface StepCondition {
  type: 'always' | 'success' | 'failure' | 'expression';
  expression?: string;
}

export type ErrorStrategy = 'fail' | 'skip' | 'retry' | 'compensate';

export interface WorkflowContext {
  workflowId: string;
  startTime: Date;
  status: WorkflowStatus;
  currentStep: number;
  results: Map<string, StepResult>;
  variables: Map<string, unknown>;
}

export type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface StepResult {
  stepId: string;
  status: 'success' | 'failed' | 'skipped';
  response?: CopilotResponse;
  error?: Error;
  duration: number;
}

export interface WorkflowResult {
  workflowId: string;
  status: WorkflowStatus;
  startTime: Date;
  endTime: Date;
  duration: number;
  steps: StepResult[];
  finalOutput?: unknown;
  error?: Error;
}

/**
 * コパイロットオーケストレーター
 * 複数コパイロットにまたがるワークフローを調整
 */
export class CopilotOrchestrator {
  private registry: CopilotRegistry;
  private broker: CopilotMessageBroker;
  private workflows: Map<string, Workflow> = new Map();
  private activeContexts: Map<string, WorkflowContext> = new Map();

  constructor(
    registry: CopilotRegistry = copilotRegistry,
    broker: CopilotMessageBroker = copilotMessageBroker
  ) {
    this.registry = registry;
    this.broker = broker;
  }

  /**
   * ワークフローを登録
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * ワークフローを実行
   */
  async executeWorkflow(
    workflowId: string,
    initialContext: Record<string, unknown> = {}
  ): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow '${workflowId}' not found`);
    }

    const context: WorkflowContext = {
      workflowId,
      startTime: new Date(),
      status: 'running',
      currentStep: 0,
      results: new Map(),
      variables: new Map(Object.entries(initialContext)),
    };

    this.activeContexts.set(workflowId, context);

    const stepResults: StepResult[] = [];
    let finalOutput: unknown;
    let workflowError: Error | undefined;

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        context.currentStep = i;

        // 条件チェック
        if (!this.shouldExecuteStep(step, context)) {
          stepResults.push({
            stepId: step.id,
            status: 'skipped',
            duration: 0,
          });
          continue;
        }

        const stepResult = await this.executeStep(step, context, workflow.onError);
        stepResults.push(stepResult);
        context.results.set(step.id, stepResult);

        if (stepResult.status === 'failed' && workflow.onError === 'fail') {
          throw stepResult.error || new Error(`Step '${step.id}' failed`);
        }

        // 最後のステップの結果を最終出力として保存
        if (i === workflow.steps.length - 1 && stepResult.response?.data) {
          finalOutput = stepResult.response.data;
        }
      }

      context.status = 'completed';
    } catch (error) {
      context.status = 'failed';
      workflowError = error instanceof Error ? error : new Error(String(error));
    } finally {
      this.activeContexts.delete(workflowId);
    }

    const endTime = new Date();
    return {
      workflowId,
      status: context.status,
      startTime: context.startTime,
      endTime,
      duration: endTime.getTime() - context.startTime.getTime(),
      steps: stepResults,
      finalOutput,
      error: workflowError,
    };
  }

  /**
   * ステップを実行
   */
  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext,
    errorStrategy: ErrorStrategy
  ): Promise<StepResult> {
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= step.retries; attempt++) {
      try {
        const input = this.resolveInput(step.input, context);
        const message: CopilotMessage = {
          id: `${context.workflowId}_${step.id}_${attempt}`,
          sourceId: 'orchestrator',
          targetId: step.copilotId,
          type: 'request',
          payload: {
            capability: step.capabilityId,
            input,
          },
          timestamp: new Date(),
          correlationId: context.workflowId,
        };

        const response = await this.broker.request(message, step.timeout);

        if (response.success) {
          return {
            stepId: step.id,
            status: 'success',
            response,
            duration: Date.now() - startTime,
          };
        } else {
          lastError = new Error(response.error?.message || 'Unknown error');
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    return {
      stepId: step.id,
      status: errorStrategy === 'skip' ? 'skipped' : 'failed',
      error: lastError,
      duration: Date.now() - startTime,
    };
  }

  /**
   * 入力値を解決
   */
  private resolveInput(mapping: InputMapping, context: WorkflowContext): unknown {
    switch (mapping.type) {
      case 'static':
        return mapping.value;

      case 'previous':
        if (mapping.source) {
          const previousResult = context.results.get(mapping.source);
          const data = previousResult?.response?.data;
          return mapping.transform ? mapping.transform(data) : data;
        }
        return undefined;

      case 'context':
        if (mapping.source) {
          const data = context.variables.get(mapping.source);
          return mapping.transform ? mapping.transform(data) : data;
        }
        return Object.fromEntries(context.variables);

      default:
        return undefined;
    }
  }

  /**
   * ステップ実行条件をチェック
   */
  private shouldExecuteStep(step: WorkflowStep, context: WorkflowContext): boolean {
    if (!step.condition) return true;

    switch (step.condition.type) {
      case 'always':
        return true;

      case 'success':
        // 前のステップが全て成功している場合のみ実行
        return Array.from(context.results.values()).every(
          (r) => r.status === 'success' || r.status === 'skipped'
        );

      case 'failure':
        // 前のステップで失敗がある場合のみ実行
        return Array.from(context.results.values()).some((r) => r.status === 'failed');

      case 'expression':
        // カスタム式評価（簡易実装）
        return this.evaluateExpression(step.condition.expression || '', context);

      default:
        return true;
    }
  }

  /**
   * 条件式を評価（簡易実装）
   */
  private evaluateExpression(_expression: string, _context: WorkflowContext): boolean {
    // TODO: 本格的な式評価エンジンを実装
    return true;
  }

  /**
   * アクティブなワークフローを取得
   */
  getActiveWorkflows(): string[] {
    return Array.from(this.activeContexts.keys());
  }

  /**
   * ワークフローをキャンセル
   */
  cancelWorkflow(workflowId: string): boolean {
    const context = this.activeContexts.get(workflowId);
    if (context) {
      context.status = 'cancelled';
      return true;
    }
    return false;
  }
}

/**
 * プリセットワークフローを作成
 */
export function createPresetWorkflows(): Workflow[] {
  return [
    {
      id: 'strategic-planning',
      name: '戦略立案ワークフロー',
      description: 'エグゼクティブ→マーケティング→セールスの連携戦略立案',
      steps: [
        {
          id: 'market-analysis',
          name: '市場分析',
          copilotId: 'marketing-copilot',
          capabilityId: 'market-analysis',
          input: { type: 'context', source: 'market' },
          retries: 2,
          timeout: 30000,
        },
        {
          id: 'strategic-analysis',
          name: '戦略分析',
          copilotId: 'executive-copilot',
          capabilityId: 'strategic-analysis',
          input: {
            type: 'previous',
            source: 'market-analysis',
            transform: (data) => ({ marketInsights: data }),
          },
          retries: 2,
          timeout: 60000,
        },
        {
          id: 'opportunity-mapping',
          name: '商談機会マッピング',
          copilotId: 'sales-copilot',
          capabilityId: 'opportunity-analysis',
          input: {
            type: 'previous',
            source: 'strategic-analysis',
            transform: (data) => ({ strategy: data }),
          },
          retries: 1,
          timeout: 30000,
        },
      ],
      onError: 'fail',
      timeout: 180000,
    },
    {
      id: 'supplier-optimization',
      name: 'サプライヤー最適化ワークフロー',
      description: '調達コスト最適化のための包括分析',
      steps: [
        {
          id: 'supplier-evaluation',
          name: 'サプライヤー評価',
          copilotId: 'procurement-copilot',
          capabilityId: 'supplier-evaluation',
          input: { type: 'context', source: 'suppliers' },
          retries: 2,
          timeout: 30000,
        },
        {
          id: 'cost-analysis',
          name: 'コスト分析',
          copilotId: 'procurement-copilot',
          capabilityId: 'cost-optimization',
          input: {
            type: 'previous',
            source: 'supplier-evaluation',
          },
          retries: 2,
          timeout: 30000,
        },
        {
          id: 'executive-review',
          name: 'エグゼクティブレビュー',
          copilotId: 'executive-copilot',
          capabilityId: 'value-assessment',
          input: {
            type: 'previous',
            source: 'cost-analysis',
            transform: (data) => ({ procurementData: data }),
          },
          retries: 1,
          timeout: 60000,
        },
      ],
      onError: 'skip',
      timeout: 150000,
    },
    {
      id: 'cross-functional-alignment',
      name: '部門横断アライメントワークフロー',
      description: '全コパイロット間のアライメント確認',
      steps: [
        {
          id: 'executive-strategy',
          name: '経営戦略確認',
          copilotId: 'executive-copilot',
          capabilityId: 'strategic-analysis',
          input: { type: 'context' },
          retries: 1,
          timeout: 60000,
        },
        {
          id: 'marketing-alignment',
          name: 'マーケティングアライメント',
          copilotId: 'marketing-copilot',
          capabilityId: 'campaign-optimization',
          input: {
            type: 'previous',
            source: 'executive-strategy',
          },
          retries: 1,
          timeout: 30000,
        },
        {
          id: 'sales-alignment',
          name: '営業アライメント',
          copilotId: 'sales-copilot',
          capabilityId: 'lead-scoring',
          input: {
            type: 'previous',
            source: 'executive-strategy',
          },
          retries: 1,
          timeout: 30000,
        },
        {
          id: 'procurement-alignment',
          name: '調達アライメント',
          copilotId: 'procurement-copilot',
          capabilityId: 'supplier-evaluation',
          input: {
            type: 'previous',
            source: 'executive-strategy',
          },
          retries: 1,
          timeout: 30000,
        },
      ],
      onError: 'skip',
      timeout: 180000,
    },
  ];
}

// シングルトンインスタンス
export const copilotOrchestrator = new CopilotOrchestrator();

// プリセットワークフローを登録
createPresetWorkflows().forEach((w) => copilotOrchestrator.registerWorkflow(w));
