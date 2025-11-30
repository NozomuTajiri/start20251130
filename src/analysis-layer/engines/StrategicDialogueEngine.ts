/**
 * Strategic Dialogue Engine
 * 3.5 戦略的対話エンジン
 */

import type {
  DialogueContext,
  DialogueMessage,
  DialogueIntent,
  StrategicInsight,
  DialogueResponse,
  AnalysisResult,
  ImpactLevel,
} from '../types';
import { NLPEngine } from './NLPEngine';

export interface DialogueOptions {
  maxHistoryLength?: number;
  insightThreshold?: number;
  generateFollowUp?: boolean;
}

export class StrategicDialogueEngine {
  private nlpEngine: NLPEngine;
  private sessions: Map<string, DialogueContext> = new Map();

  constructor(nlpEngine?: NLPEngine) {
    this.nlpEngine = nlpEngine || new NLPEngine();
  }

  /**
   * Process a user message and generate strategic response
   */
  async processMessage(
    sessionId: string,
    userMessage: string,
    options?: DialogueOptions
  ): Promise<AnalysisResult<DialogueResponse>> {
    const startTime = Date.now();
    const opts = {
      maxHistoryLength: options?.maxHistoryLength || 20,
      insightThreshold: options?.insightThreshold || 0.5,
      generateFollowUp: options?.generateFollowUp ?? true,
    };

    // Get or create session
    let context = this.sessions.get(sessionId);
    if (!context) {
      context = this.createSession(sessionId);
    }

    // Add user message to history
    const userMsg: DialogueMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    // Analyze user message intent
    const intent = await this.analyzeIntent(userMessage, context);
    userMsg.metadata = {
      intent: intent.name,
      confidence: intent.confidence,
    };

    context.history.push(userMsg);

    // Trim history if too long
    if (context.history.length > opts.maxHistoryLength) {
      context.history = context.history.slice(-opts.maxHistoryLength);
    }

    // Update current topic
    context.currentTopic = this.extractTopic(userMessage, intent);

    // Generate strategic insights
    const insights = await this.generateInsights(userMessage, context, opts.insightThreshold);

    // Generate response
    const responseMessage = await this.generateResponse(userMessage, context, insights, intent);

    // Generate follow-up questions if enabled
    const followUpQuestions = opts.generateFollowUp
      ? await this.generateFollowUpQuestions(context, insights)
      : undefined;

    // Suggest related topics
    const suggestedTopics = this.suggestTopics(context, insights);

    // Add assistant response to history
    const assistantMsg: DialogueMessage = {
      role: 'assistant',
      content: responseMessage,
      timestamp: new Date(),
    };
    context.history.push(assistantMsg);

    // Update session
    this.sessions.set(sessionId, context);

    const response: DialogueResponse = {
      message: responseMessage,
      insights,
      followUpQuestions,
      suggestedTopics,
      confidence: this.calculateResponseConfidence(intent, insights),
    };

    return {
      data: response,
      confidence: response.confidence,
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Create a new dialogue session
   */
  createSession(sessionId: string, userId?: string): DialogueContext {
    const context: DialogueContext = {
      sessionId,
      userId: userId || 'anonymous',
      history: [],
      goals: [],
      preferences: {},
    };

    this.sessions.set(sessionId, context);
    return context;
  }

  /**
   * Get session context
   */
  getSession(sessionId: string): DialogueContext | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Set session goals
   */
  setGoals(sessionId: string, goals: string[]): void {
    const context = this.sessions.get(sessionId);
    if (context) {
      context.goals = goals;
      this.sessions.set(sessionId, context);
    }
  }

  /**
   * Analyze user intent
   */
  private async analyzeIntent(
    message: string,
    context: DialogueContext
  ): Promise<DialogueIntent> {
    // Define intent patterns
    const intentPatterns: Array<{
      name: string;
      patterns: RegExp[];
      parameters?: Record<string, unknown>;
    }> = [
      {
        name: 'strategic_question',
        patterns: [
          /戦略|strategy|方針|direction|ビジョン|vision/i,
          /どうすれば|how (should|can)|what should/i,
        ],
      },
      {
        name: 'analysis_request',
        patterns: [
          /分析|analyze|調査|investigate|確認|check/i,
          /なぜ|why|原因|cause|理由|reason/i,
        ],
      },
      {
        name: 'recommendation_request',
        patterns: [
          /提案|suggest|recommend|アドバイス|advice/i,
          /おすすめ|best|optimal|最適/i,
        ],
      },
      {
        name: 'risk_assessment',
        patterns: [
          /リスク|risk|危険|danger|問題|problem/i,
          /懸念|concern|心配|worry/i,
        ],
      },
      {
        name: 'opportunity_exploration',
        patterns: [
          /機会|opportunity|チャンス|chance/i,
          /可能性|possibility|potential/i,
        ],
      },
      {
        name: 'clarification',
        patterns: [
          /意味|mean|説明|explain|詳しく|detail/i,
          /具体的|specific|例えば|example/i,
        ],
      },
      {
        name: 'comparison',
        patterns: [
          /比較|compare|違い|difference|versus|vs/i,
          /どちら|which|選ぶ|choose/i,
        ],
      },
      {
        name: 'greeting',
        patterns: [
          /こんにちは|hello|hi|おはよう|こんばんは/i,
          /はじめまして|nice to meet/i,
        ],
      },
    ];

    // Check for matching patterns
    let bestMatch: { name: string; confidence: number } = {
      name: 'general_inquiry',
      confidence: 0.5,
    };

    for (const intent of intentPatterns) {
      for (const pattern of intent.patterns) {
        if (pattern.test(message)) {
          const confidence = 0.7 + Math.random() * 0.2; // Base confidence with variation
          if (confidence > bestMatch.confidence) {
            bestMatch = { name: intent.name, confidence };
          }
        }
      }
    }

    // Boost confidence based on context
    if (context.currentTopic && message.includes(context.currentTopic)) {
      bestMatch.confidence = Math.min(1, bestMatch.confidence + 0.1);
    }

    return {
      name: bestMatch.name,
      confidence: bestMatch.confidence,
      parameters: {},
      requiredActions: this.getRequiredActions(bestMatch.name),
    };
  }

  /**
   * Get required actions for an intent
   */
  private getRequiredActions(intentName: string): string[] {
    const actionMap: Record<string, string[]> = {
      strategic_question: ['analyze_context', 'generate_options', 'evaluate_tradeoffs'],
      analysis_request: ['gather_data', 'identify_patterns', 'synthesize_findings'],
      recommendation_request: ['assess_situation', 'generate_alternatives', 'rank_options'],
      risk_assessment: ['identify_risks', 'assess_impact', 'suggest_mitigations'],
      opportunity_exploration: ['scan_environment', 'identify_opportunities', 'assess_feasibility'],
      clarification: ['provide_context', 'give_examples', 'simplify_explanation'],
      comparison: ['identify_criteria', 'evaluate_options', 'highlight_tradeoffs'],
      greeting: ['acknowledge', 'introduce_capabilities'],
    };

    return actionMap[intentName] || ['understand_request', 'provide_response'];
  }

  /**
   * Extract topic from message
   */
  private extractTopic(message: string, intent: DialogueIntent): string {
    // Extract key nouns as potential topics
    const topicPatterns = [
      /について|に関して|regarding|about/,
      /「([^」]+)」/,
      /"([^"]+)"/,
    ];

    for (const pattern of topicPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Fall back to intent name as topic
    return intent.name.replace(/_/g, ' ');
  }

  /**
   * Generate strategic insights from the conversation
   */
  private async generateInsights(
    message: string,
    context: DialogueContext,
    threshold: number
  ): Promise<StrategicInsight[]> {
    const insights: StrategicInsight[] = [];

    // Analyze message for strategic patterns
    const strategicPatterns: Array<{
      pattern: RegExp;
      type: StrategicInsight['type'];
      priority: ImpactLevel;
    }> = [
      { pattern: /機会|チャンス|可能性|opportunity/i, type: 'OPPORTUNITY', priority: 'MEDIUM' },
      { pattern: /リスク|危険|脅威|threat|risk/i, type: 'THREAT', priority: 'HIGH' },
      { pattern: /検討|consider|評価|evaluate/i, type: 'RECOMMENDATION', priority: 'MEDIUM' },
      { pattern: /注意|警告|warning|caution/i, type: 'WARNING', priority: 'HIGH' },
      { pattern: /\?|？|質問|question/i, type: 'QUESTION', priority: 'LOW' },
    ];

    for (const { pattern, type, priority } of strategicPatterns) {
      if (pattern.test(message)) {
        const insight = await this.generateInsightContent(message, type, context);
        if (insight && insight.confidence >= threshold) {
          insights.push({
            type,
            content: insight.content,
            priority,
            actionable: insight.actionable,
            suggestedActions: insight.suggestedActions,
          });
        }
      }
    }

    // Check context goals for relevant insights
    if (context.goals && context.goals.length > 0) {
      for (const goal of context.goals) {
        if (message.toLowerCase().includes(goal.toLowerCase())) {
          insights.push({
            type: 'RECOMMENDATION',
            content: `This relates to your goal: ${goal}`,
            priority: 'MEDIUM',
            actionable: true,
            suggestedActions: ['Review progress toward this goal', 'Identify next steps'],
          });
        }
      }
    }

    return insights;
  }

  /**
   * Generate insight content
   */
  private async generateInsightContent(
    _message: string,
    type: StrategicInsight['type'],
    _context: DialogueContext
  ): Promise<{
    content: string;
    actionable: boolean;
    suggestedActions: string[];
    confidence: number;
  } | null> {
    const templates: Record<StrategicInsight['type'], {
      template: string;
      actions: string[];
    }> = {
      OPPORTUNITY: {
        template: 'Potential opportunity identified in the discussed area.',
        actions: ['Evaluate feasibility', 'Assess resource requirements', 'Define success metrics'],
      },
      THREAT: {
        template: 'Risk factor detected that may require attention.',
        actions: ['Assess likelihood and impact', 'Develop mitigation plan', 'Monitor indicators'],
      },
      RECOMMENDATION: {
        template: 'Based on the discussion, consider the following approach.',
        actions: ['Review options', 'Validate assumptions', 'Plan implementation'],
      },
      WARNING: {
        template: 'Important consideration that should not be overlooked.',
        actions: ['Investigate further', 'Consult stakeholders', 'Document findings'],
      },
      QUESTION: {
        template: 'This topic may require further clarification.',
        actions: ['Gather more information', 'Consult experts', 'Research alternatives'],
      },
    };

    const config = templates[type];
    if (!config) return null;

    return {
      content: config.template,
      actionable: type !== 'QUESTION',
      suggestedActions: config.actions,
      confidence: 0.6 + Math.random() * 0.3,
    };
  }

  /**
   * Generate response message
   */
  private async generateResponse(
    userMessage: string,
    context: DialogueContext,
    insights: StrategicInsight[],
    intent: DialogueIntent
  ): Promise<string> {
    // Check if NLP engine can generate response
    if (this.nlpEngine.isAvailable()) {
      try {
        const systemPrompt = `You are a strategic advisor helping with business decisions.
Current topic: ${context.currentTopic || 'General discussion'}
User goals: ${context.goals?.join(', ') || 'Not specified'}
Detected intent: ${intent.name}

Provide a thoughtful, strategic response that:
1. Addresses the user's question directly
2. Offers actionable insights
3. Considers multiple perspectives
4. Is concise but comprehensive

Respond in the same language as the user's message.`;

        const response = await this.nlpEngine.generate(userMessage, {
          systemPrompt,
          maxTokens: 500,
        });

        return response;
      } catch (error) {
        console.error('NLP generation failed, using template:', error);
      }
    }

    // Fallback to template-based response
    return this.generateTemplateResponse(intent, insights);
  }

  /**
   * Generate template-based response
   */
  private generateTemplateResponse(
    intent: DialogueIntent,
    insights: StrategicInsight[]
  ): string {
    const templates: Record<string, string[]> = {
      strategic_question: [
        'この戦略的な質問について、いくつかの観点から考えてみましょう。',
        'Let me help you think through this strategic question.',
      ],
      analysis_request: [
        '分析の観点から、以下の点を考慮することが重要です。',
        'From an analytical perspective, consider the following factors.',
      ],
      recommendation_request: [
        '状況を踏まえて、以下のアプローチをお勧めします。',
        'Based on the situation, I would recommend the following approach.',
      ],
      risk_assessment: [
        'リスク評価の観点から、以下の点に注意が必要です。',
        'From a risk assessment perspective, pay attention to the following.',
      ],
      opportunity_exploration: [
        '機会を最大限に活かすため、以下のポイントを検討してください。',
        'To maximize this opportunity, consider the following points.',
      ],
      greeting: [
        'こんにちは！戦略的な意思決定をサポートします。',
        'Hello! I am here to support your strategic decision-making.',
      ],
      general_inquiry: [
        'ご質問について、詳しくお答えします。',
        'Let me address your question in detail.',
      ],
    };

    const template = templates[intent.name] || templates.general_inquiry;
    let response = template[Math.floor(Math.random() * template.length)];

    // Add insights if available
    if (insights.length > 0) {
      const insightSummary = insights
        .slice(0, 2)
        .map((i) => `- ${i.content}`)
        .join('\n');
      response += `\n\n重要なポイント:\n${insightSummary}`;
    }

    return response;
  }

  /**
   * Generate follow-up questions
   */
  private async generateFollowUpQuestions(
    context: DialogueContext,
    insights: StrategicInsight[]
  ): Promise<string[]> {
    const questions: string[] = [];

    // Based on current topic
    if (context.currentTopic) {
      questions.push(`${context.currentTopic}についてさらに詳しく知りたい点はありますか？`);
    }

    // Based on insights
    for (const insight of insights.slice(0, 2)) {
      if (insight.type === 'OPPORTUNITY') {
        questions.push('この機会を活かすために必要なリソースは何ですか？');
      } else if (insight.type === 'THREAT') {
        questions.push('このリスクに対して現在どのような対策を講じていますか？');
      }
    }

    // Default follow-up
    if (questions.length === 0) {
      questions.push('他に検討したいことはありますか？');
    }

    return questions.slice(0, 3);
  }

  /**
   * Suggest related topics
   */
  private suggestTopics(
    context: DialogueContext,
    insights: StrategicInsight[]
  ): string[] {
    const topics = new Set<string>();

    // Topics based on history
    for (const msg of context.history.slice(-5)) {
      if (msg.metadata?.intent) {
        const topic = msg.metadata.intent.replace(/_/g, ' ');
        topics.add(topic);
      }
    }

    // Topics based on insights
    for (const insight of insights) {
      if (insight.type === 'OPPORTUNITY') topics.add('Growth Strategy');
      if (insight.type === 'THREAT') topics.add('Risk Management');
      if (insight.type === 'RECOMMENDATION') topics.add('Action Planning');
    }

    // Related business topics
    const relatedTopics = [
      'Market Analysis',
      'Competitive Positioning',
      'Resource Allocation',
      'Performance Metrics',
    ];

    for (const topic of relatedTopics) {
      if (topics.size < 5) topics.add(topic);
    }

    return Array.from(topics).slice(0, 5);
  }

  /**
   * Calculate response confidence
   */
  private calculateResponseConfidence(
    intent: DialogueIntent,
    insights: StrategicInsight[]
  ): number {
    let confidence = intent.confidence;

    // Boost confidence if we have relevant insights
    if (insights.length > 0) {
      confidence += 0.1 * Math.min(insights.length, 3);
    }

    return Math.min(1, confidence);
  }

  /**
   * Clear session
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }
}

export const strategicDialogueEngine = new StrategicDialogueEngine();
