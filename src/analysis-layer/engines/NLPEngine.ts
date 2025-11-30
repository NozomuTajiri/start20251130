/**
 * Natural Language Processing Engine
 * 3.2 自然言語処理エンジン (Claude API連携)
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  NLPRequest,
  NLPResult,
  NLPOptions,
  Entity,
  Sentiment,
  AnalysisResult,
} from '../types';

export interface ClaudeConfig {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

export class NLPEngine {
  private client: Anthropic | null = null;
  private model: string;
  private maxRetries: number;

  constructor(config?: ClaudeConfig) {
    this.model = config?.model || 'claude-sonnet-4-20250514';
    this.maxRetries = config?.maxRetries || 3;

    // Initialize Anthropic client if API key is available
    const apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  /**
   * Check if Claude API is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Process text with NLP analysis
   */
  async process(request: NLPRequest): Promise<AnalysisResult<NLPResult>> {
    const startTime = Date.now();
    const options = request.options || {};

    const result: NLPResult = {
      originalText: request.text,
      language: request.language || 'ja',
    };

    // If Claude API is available, use it for advanced analysis
    if (this.client) {
      try {
        const claudeResult = await this.processWithClaude(request, options);
        Object.assign(result, claudeResult);
      } catch (error) {
        console.error('Claude API error, falling back to local processing:', error);
        this.processLocally(request, options, result);
      }
    } else {
      // Fallback to local processing
      this.processLocally(request, options, result);
    }

    return {
      data: result,
      confidence: this.calculateConfidence(result),
      timestamp: new Date(),
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Process text using Claude API
   */
  private async processWithClaude(
    request: NLPRequest,
    options: NLPOptions
  ): Promise<Partial<NLPResult>> {
    if (!this.client) {
      throw new Error('Claude API client not initialized');
    }

    const tasks: string[] = [];
    if (options.extractEntities) tasks.push('entity extraction');
    if (options.extractSentiment) tasks.push('sentiment analysis');
    if (options.extractKeywords) tasks.push('keyword extraction');
    if (options.summarize) tasks.push('summarization');

    const prompt = this.buildPrompt(request, tasks);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens || 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return this.parseClaudeResponse(content.text, options);
  }

  /**
   * Build prompt for Claude API
   */
  private buildPrompt(request: NLPRequest, tasks: string[]): string {
    const prompt = `Analyze the following text and perform these tasks: ${tasks.join(', ')}.

Text to analyze:
"""
${request.text}
"""

${request.context ? `Context: ${request.context}` : ''}

Respond in JSON format with the following structure:
{
  "entities": [{"text": "entity text", "type": "PERSON|ORGANIZATION|LOCATION|DATE|PRODUCT|CONCEPT|OTHER", "confidence": 0.0-1.0}],
  "sentiment": {"overall": "POSITIVE|NEGATIVE|NEUTRAL|MIXED", "score": -1.0 to 1.0, "aspects": [{"aspect": "aspect name", "sentiment": "POSITIVE|NEGATIVE|NEUTRAL", "score": -1.0 to 1.0}]},
  "keywords": [{"word": "keyword", "relevance": 0.0-1.0}],
  "summary": "concise summary",
  "topics": [{"topic": "topic name", "confidence": 0.0-1.0}]
}

Only include fields for the requested tasks. Ensure all text is in the same language as the input.`;

    return prompt;
  }

  /**
   * Parse Claude API response
   */
  private parseClaudeResponse(
    responseText: string,
    options: NLPOptions
  ): Partial<NLPResult> {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const result: Partial<NLPResult> = {};

      if (options.extractEntities && parsed.entities) {
        result.entities = parsed.entities.map((e: { text: string; type: string; confidence: number }) => ({
          text: e.text,
          type: e.type as Entity['type'],
          confidence: e.confidence,
          startIndex: 0, // Would need text search to find actual indices
          endIndex: e.text.length,
        }));
      }

      if (options.extractSentiment && parsed.sentiment) {
        result.sentiment = {
          overall: parsed.sentiment.overall,
          score: parsed.sentiment.score,
          aspects: parsed.sentiment.aspects || [],
        };
      }

      if (options.extractKeywords && parsed.keywords) {
        result.keywords = parsed.keywords;
      }

      if (options.summarize && parsed.summary) {
        result.summary = parsed.summary;
      }

      if (parsed.topics) {
        result.topics = parsed.topics;
      }

      return result;
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      return {};
    }
  }

  /**
   * Process text locally without Claude API
   */
  private processLocally(
    request: NLPRequest,
    options: NLPOptions,
    result: NLPResult
  ): void {
    if (options.extractKeywords) {
      result.keywords = this.extractKeywordsLocally(request.text);
    }

    if (options.extractSentiment) {
      result.sentiment = this.analyzeSentimentLocally(request.text);
    }

    if (options.extractEntities) {
      result.entities = this.extractEntitiesLocally(request.text);
    }

    if (options.summarize) {
      result.summary = this.summarizeLocally(request.text);
    }
  }

  /**
   * Extract keywords locally using TF-IDF-like approach
   */
  private extractKeywordsLocally(text: string): Array<{ word: string; relevance: number }> {
    // Simple word frequency analysis
    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const frequency: Record<string, number> = {};
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }

    // Filter stop words (simplified)
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'and', 'or', 'but', 'if', 'then',
      'の', 'は', 'が', 'を', 'に', 'で', 'と', 'も', 'や', 'から', 'まで',
      'です', 'ます', 'した', 'して', 'する', 'こと', 'これ', 'それ', 'あれ',
    ]);

    const maxFreq = Math.max(...Object.values(frequency));

    return Object.entries(frequency)
      .filter(([word]) => !stopWords.has(word))
      .map(([word, freq]) => ({
        word,
        relevance: freq / maxFreq,
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20);
  }

  /**
   * Analyze sentiment locally using lexicon-based approach
   */
  private analyzeSentimentLocally(text: string): Sentiment {
    // Simplified sentiment lexicon
    const positiveLexicon = [
      'good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic',
      'happy', 'love', 'best', 'success', 'positive', 'improve', 'growth',
      '良い', '素晴らしい', '優れた', '成功', '幸せ', '嬉しい', '最高',
      '成長', '向上', 'ポジティブ', '改善', '達成', '効果的',
    ];

    const negativeLexicon = [
      'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'fail',
      'sad', 'hate', 'problem', 'negative', 'decline', 'loss', 'risk',
      '悪い', 'ひどい', '失敗', '問題', '悲しい', '最悪', '低下',
      'リスク', '損失', 'ネガティブ', '困難', '障害',
    ];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveLexicon) {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    }

    for (const word of negativeLexicon) {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeCount += matches.length;
    }

    const total = positiveCount + negativeCount || 1;
    const score = (positiveCount - negativeCount) / total;

    let overall: Sentiment['overall'];
    if (score > 0.2) overall = 'POSITIVE';
    else if (score < -0.2) overall = 'NEGATIVE';
    else if (positiveCount > 0 && negativeCount > 0) overall = 'MIXED';
    else overall = 'NEUTRAL';

    return {
      overall,
      score,
      aspects: [],
    };
  }

  /**
   * Extract entities locally using pattern matching
   */
  private extractEntitiesLocally(text: string): Entity[] {
    const entities: Entity[] = [];

    // Date patterns
    const datePattern = /\d{4}[年/-]\d{1,2}[月/-]\d{1,2}[日]?|\d{1,2}[月/]\d{1,2}[日]?/g;
    let match;
    while ((match = datePattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'DATE',
        confidence: 0.9,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    // Organization patterns (simplified: words ending with 株式会社, Inc, Corp, etc.)
    const orgPattern = /[A-Z\u4E00-\u9FAF][^\s,。、]*(?:株式会社|有限会社|Inc\.?|Corp\.?|Co\.?|Ltd\.?|LLC)/g;
    while ((match = orgPattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'ORGANIZATION',
        confidence: 0.7,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    // Percentage and numbers
    const numberPattern = /\d+(?:\.\d+)?(?:%|パーセント|億|万|千)/g;
    while ((match = numberPattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'OTHER',
        confidence: 0.8,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    return entities;
  }

  /**
   * Summarize text locally using extractive summarization
   */
  private summarizeLocally(text: string): string {
    // Split into sentences
    const sentences = text.split(/[。！？.!?]+/).filter((s) => s.trim().length > 10);

    if (sentences.length <= 3) {
      return text;
    }

    // Score sentences by keyword density
    const keywords = this.extractKeywordsLocally(text);
    const keywordSet = new Set(keywords.slice(0, 10).map((k) => k.word));

    const scoredSentences = sentences.map((sentence) => {
      const words = sentence.toLowerCase().split(/\s+/);
      const keywordCount = words.filter((w) => keywordSet.has(w)).length;
      return {
        sentence: sentence.trim(),
        score: keywordCount / words.length,
      };
    });

    // Select top sentences maintaining order
    const topSentences = scoredSentences
      .map((s, i) => ({ ...s, index: i }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .sort((a, b) => a.index - b.index)
      .map((s) => s.sentence);

    return topSentences.join('。') + '。';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(result: NLPResult): number {
    let score = 0.5; // Base score

    if (result.entities && result.entities.length > 0) {
      score += 0.1;
    }

    if (result.sentiment) {
      score += 0.1;
    }

    if (result.keywords && result.keywords.length > 5) {
      score += 0.1;
    }

    if (result.summary) {
      score += 0.1;
    }

    if (result.topics && result.topics.length > 0) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  /**
   * Generate text using Claude API
   */
  async generate(
    prompt: string,
    options?: { maxTokens?: number; temperature?: number; systemPrompt?: string }
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Claude API not available');
    }

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: prompt },
    ];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens || 2048,
      system: options?.systemPrompt,
      messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return content.text;
  }

  /**
   * Analyze text similarity
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    // Use Jaccard similarity for local comparison
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Classify text into categories
   */
  async classify(
    text: string,
    categories: string[]
  ): Promise<Array<{ category: string; confidence: number }>> {
    if (this.client) {
      const prompt = `Classify the following text into one or more of these categories: ${categories.join(', ')}.

Text: "${text}"

Respond with JSON array: [{"category": "category_name", "confidence": 0.0-1.0}]
Only include categories with confidence > 0.3.`;

      try {
        const response = await this.generate(prompt);
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Classification error:', error);
      }
    }

    // Fallback: simple keyword matching
    return categories.map((category) => ({
      category,
      confidence: text.toLowerCase().includes(category.toLowerCase()) ? 0.6 : 0.1,
    })).filter((c) => c.confidence > 0.3);
  }
}

export const nlpEngine = new NLPEngine();
