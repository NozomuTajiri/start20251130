/**
 * Copilot Registry
 * 6.1 他コパイロット連携管理
 */

import type {
  CopilotConfig,
  CopilotType,
  CopilotMessage,
  CopilotResponse,
  CopilotCapability,
  MessageType,
} from '../types';

/**
 * コパイロットレジストリ
 * 全コパイロットの登録・管理・ディスカバリを担当
 */
export class CopilotRegistry {
  private copilots: Map<string, CopilotConfig> = new Map();
  private typeIndex: Map<CopilotType, Set<string>> = new Map();

  /**
   * コパイロットを登録
   */
  register(config: CopilotConfig): void {
    if (this.copilots.has(config.id)) {
      throw new Error(`Copilot with id '${config.id}' is already registered`);
    }

    this.copilots.set(config.id, config);

    // タイプインデックスを更新
    if (!this.typeIndex.has(config.type)) {
      this.typeIndex.set(config.type, new Set());
    }
    this.typeIndex.get(config.type)!.add(config.id);
  }

  /**
   * コパイロットの登録解除
   */
  unregister(copilotId: string): void {
    const config = this.copilots.get(copilotId);
    if (config) {
      this.typeIndex.get(config.type)?.delete(copilotId);
      this.copilots.delete(copilotId);
    }
  }

  /**
   * IDでコパイロットを取得
   */
  get(copilotId: string): CopilotConfig | undefined {
    return this.copilots.get(copilotId);
  }

  /**
   * タイプでコパイロットを検索
   */
  getByType(type: CopilotType): CopilotConfig[] {
    const ids = this.typeIndex.get(type);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.copilots.get(id))
      .filter((c): c is CopilotConfig => c !== undefined);
  }

  /**
   * 有効なコパイロットのみを取得
   */
  getEnabled(): CopilotConfig[] {
    return Array.from(this.copilots.values()).filter((c) => c.enabled);
  }

  /**
   * 全コパイロットを取得
   */
  getAll(): CopilotConfig[] {
    return Array.from(this.copilots.values());
  }

  /**
   * コパイロットの有効/無効を切り替え
   */
  setEnabled(copilotId: string, enabled: boolean): void {
    const config = this.copilots.get(copilotId);
    if (config) {
      config.enabled = enabled;
    }
  }

  /**
   * 特定のケイパビリティを持つコパイロットを検索
   */
  findByCapability(capabilityId: string): CopilotConfig[] {
    return Array.from(this.copilots.values()).filter((c) =>
      c.capabilities.some((cap) => cap.id === capabilityId)
    );
  }

  /**
   * コパイロット数を取得
   */
  count(): number {
    return this.copilots.size;
  }

  /**
   * レジストリをクリア
   */
  clear(): void {
    this.copilots.clear();
    this.typeIndex.clear();
  }
}

/**
 * コパイロットメッセージブローカー
 * コパイロット間のメッセージングを仲介
 */
export class CopilotMessageBroker {
  private registry: CopilotRegistry;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private pendingResponses: Map<string, PendingResponse> = new Map();

  constructor(registry: CopilotRegistry) {
    this.registry = registry;
  }

  /**
   * メッセージハンドラを登録
   */
  subscribe(copilotId: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(copilotId)) {
      this.handlers.set(copilotId, []);
    }
    this.handlers.get(copilotId)!.push(handler);

    // Unsubscribe function
    return () => {
      const handlers = this.handlers.get(copilotId);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * メッセージを送信（非同期、レスポンス待機なし）
   */
  async send(message: CopilotMessage): Promise<void> {
    const targetConfig = this.registry.get(message.targetId);
    if (!targetConfig) {
      throw new Error(`Target copilot '${message.targetId}' not found`);
    }

    if (!targetConfig.enabled) {
      throw new Error(`Target copilot '${message.targetId}' is disabled`);
    }

    const handlers = this.handlers.get(message.targetId);
    if (handlers) {
      await Promise.all(handlers.map((h) => h(message)));
    }
  }

  /**
   * リクエストを送信してレスポンスを待機
   */
  async request(message: CopilotMessage, timeout: number = 30000): Promise<CopilotResponse> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingResponses.delete(message.id);
        reject(new Error(`Request timeout for message ${message.id}`));
      }, timeout);

      this.pendingResponses.set(message.id, {
        resolve: (response) => {
          clearTimeout(timeoutId);
          this.pendingResponses.delete(message.id);
          resolve(response);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          this.pendingResponses.delete(message.id);
          reject(error);
        },
      });

      this.send(message).catch(reject);
    });
  }

  /**
   * レスポンスを返信
   */
  respond(originalMessageId: string, response: CopilotResponse): void {
    const pending = this.pendingResponses.get(originalMessageId);
    if (pending) {
      pending.resolve(response);
    }
  }

  /**
   * ブロードキャストメッセージを送信
   */
  async broadcast(
    sourceId: string,
    type: MessageType,
    payload: unknown,
    filter?: (config: CopilotConfig) => boolean
  ): Promise<void> {
    let targets = this.registry.getEnabled().filter((c) => c.id !== sourceId);

    if (filter) {
      targets = targets.filter(filter);
    }

    const messages: CopilotMessage[] = targets.map((target) => ({
      id: generateMessageId(),
      sourceId,
      targetId: target.id,
      type,
      payload,
      timestamp: new Date(),
    }));

    await Promise.all(messages.map((m) => this.send(m)));
  }
}

type MessageHandler = (message: CopilotMessage) => Promise<void>;

interface PendingResponse {
  resolve: (response: CopilotResponse) => void;
  reject: (error: Error) => void;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * デフォルトコパイロット設定を作成
 */
export function createDefaultCopilotConfigs(): CopilotConfig[] {
  return [
    {
      id: 'executive-copilot',
      type: 'executive',
      name: 'Executive Copilot',
      description: '価値創造エグゼクティブ・コパイロット',
      version: '1.0.0',
      enabled: true,
      capabilities: createExecutiveCapabilities(),
      permissions: [
        { resource: 'data-layer', actions: ['read', 'write'] },
        { resource: 'analysis-layer', actions: ['read', 'execute'] },
        { resource: 'function-layer', actions: ['read', 'execute'] },
        { resource: 'interface-layer', actions: ['read', 'write'] },
      ],
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        maxConcurrent: 10,
      },
    },
    {
      id: 'marketing-copilot',
      type: 'marketing',
      name: 'Marketing Copilot',
      description: 'マーケティング戦略最適化コパイロット',
      version: '1.0.0',
      enabled: true,
      capabilities: createMarketingCapabilities(),
      permissions: [
        { resource: 'data-layer/megatrends', actions: ['read'] },
        { resource: 'data-layer/competitors', actions: ['read'] },
        { resource: 'analysis-layer/nlp', actions: ['execute'] },
      ],
      rateLimit: {
        requestsPerMinute: 30,
        requestsPerHour: 500,
        maxConcurrent: 5,
      },
    },
    {
      id: 'sales-copilot',
      type: 'sales',
      name: 'Sales Copilot',
      description: '営業活動支援コパイロット',
      version: '1.0.0',
      enabled: true,
      capabilities: createSalesCapabilities(),
      permissions: [
        { resource: 'data-layer/successCases', actions: ['read', 'write'] },
        { resource: 'data-layer/partners', actions: ['read'] },
        { resource: 'function-layer/purposeAlignment', actions: ['execute'] },
      ],
      rateLimit: {
        requestsPerMinute: 30,
        requestsPerHour: 500,
        maxConcurrent: 5,
      },
    },
    {
      id: 'procurement-copilot',
      type: 'procurement',
      name: 'Procurement Copilot',
      description: '調達・購買最適化コパイロット',
      version: '1.0.0',
      enabled: true,
      capabilities: createProcurementCapabilities(),
      permissions: [
        { resource: 'data-layer/partners', actions: ['read', 'write'] },
        { resource: 'function-layer/ecosystemDesign', actions: ['execute'] },
      ],
      rateLimit: {
        requestsPerMinute: 20,
        requestsPerHour: 300,
        maxConcurrent: 3,
      },
    },
  ];
}

function createExecutiveCapabilities(): CopilotCapability[] {
  return [
    {
      id: 'strategic-analysis',
      name: '戦略分析',
      description: '多次元戦略分析を実行',
      inputSchema: { type: 'object', properties: { context: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { analysis: { type: 'object' } } },
    },
    {
      id: 'value-assessment',
      name: '価値評価',
      description: '組織価値の評価を実行',
      inputSchema: { type: 'object', properties: { metrics: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { assessment: { type: 'object' } } },
    },
    {
      id: 'scenario-simulation',
      name: 'シナリオシミュレーション',
      description: '戦略シナリオをシミュレーション',
      inputSchema: { type: 'object', properties: { scenarios: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { results: { type: 'array' } } },
    },
  ];
}

function createMarketingCapabilities(): CopilotCapability[] {
  return [
    {
      id: 'market-analysis',
      name: '市場分析',
      description: '市場トレンドと競合分析を実行',
      inputSchema: { type: 'object', properties: { market: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { insights: { type: 'array' } } },
    },
    {
      id: 'campaign-optimization',
      name: 'キャンペーン最適化',
      description: 'マーケティングキャンペーンを最適化',
      inputSchema: { type: 'object', properties: { campaign: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { recommendations: { type: 'array' } } },
    },
  ];
}

function createSalesCapabilities(): CopilotCapability[] {
  return [
    {
      id: 'lead-scoring',
      name: 'リードスコアリング',
      description: '見込み客のスコアリングを実行',
      inputSchema: { type: 'object', properties: { leads: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { scores: { type: 'array' } } },
    },
    {
      id: 'opportunity-analysis',
      name: '商談分析',
      description: '商談の成約確度を分析',
      inputSchema: { type: 'object', properties: { opportunity: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { analysis: { type: 'object' } } },
    },
  ];
}

function createProcurementCapabilities(): CopilotCapability[] {
  return [
    {
      id: 'supplier-evaluation',
      name: 'サプライヤー評価',
      description: 'サプライヤーの総合評価を実行',
      inputSchema: { type: 'object', properties: { suppliers: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { evaluations: { type: 'array' } } },
    },
    {
      id: 'cost-optimization',
      name: 'コスト最適化',
      description: '調達コストの最適化提案',
      inputSchema: { type: 'object', properties: { categories: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { savings: { type: 'object' } } },
    },
  ];
}

// シングルトンインスタンス
export const copilotRegistry = new CopilotRegistry();
export const copilotMessageBroker = new CopilotMessageBroker(copilotRegistry);

// デフォルト設定を登録
createDefaultCopilotConfigs().forEach((config) => copilotRegistry.register(config));
