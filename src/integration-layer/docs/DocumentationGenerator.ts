/**
 * Documentation Generator
 * 6.5 ドキュメント整備
 */

/**
 * APIドキュメント型定義
 */
export interface APIDocumentation {
  version: string;
  title: string;
  description: string;
  baseUrl: string;
  endpoints: EndpointDoc[];
  schemas: SchemaDoc[];
  authentication: AuthenticationDoc;
  errors: ErrorDoc[];
  changelog: ChangelogEntry[];
  generatedAt: Date;
}

export interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  tags: string[];
  parameters: ParameterDoc[];
  requestBody?: RequestBodyDoc;
  responses: ResponseDoc[];
  security: string[];
  deprecated?: boolean;
  examples: ExampleDoc[];
}

export interface ParameterDoc {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description: string;
  required: boolean;
  schema: SchemaRef;
  example?: unknown;
}

export interface RequestBodyDoc {
  description: string;
  required: boolean;
  content: ContentDoc[];
}

export interface ContentDoc {
  mediaType: string;
  schema: SchemaRef;
  example?: unknown;
}

export interface ResponseDoc {
  statusCode: number;
  description: string;
  content?: ContentDoc[];
  headers?: Record<string, ParameterDoc>;
}

export interface SchemaDoc {
  name: string;
  description: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  properties?: Record<string, PropertyDoc>;
  required?: string[];
  items?: SchemaRef;
  enum?: unknown[];
  example?: unknown;
}

export interface PropertyDoc {
  type: string;
  description: string;
  format?: string;
  nullable?: boolean;
  default?: unknown;
  example?: unknown;
}

export interface SchemaRef {
  $ref?: string;
  type?: string;
  format?: string;
  items?: SchemaRef;
}

export interface AuthenticationDoc {
  type: 'apiKey' | 'oauth2' | 'bearer' | 'basic';
  description: string;
  flows?: Record<string, OAuthFlowDoc>;
  bearerFormat?: string;
  in?: 'header' | 'query' | 'cookie';
  name?: string;
}

export interface OAuthFlowDoc {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface ErrorDoc {
  code: string;
  status: number;
  message: string;
  description: string;
  resolution?: string;
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  changes: ChangeItem[];
}

export interface ChangeItem {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
  breaking?: boolean;
}

export interface ExampleDoc {
  name: string;
  description: string;
  request?: unknown;
  response?: unknown;
}

/**
 * ドキュメントジェネレーター
 */
export class DocumentationGenerator {
  private documentation: Partial<APIDocumentation> = {};

  /**
   * 基本情報を設定
   */
  setBasicInfo(info: {
    version: string;
    title: string;
    description: string;
    baseUrl: string;
  }): this {
    this.documentation = {
      ...this.documentation,
      ...info,
    };
    return this;
  }

  /**
   * 認証情報を設定
   */
  setAuthentication(auth: AuthenticationDoc): this {
    this.documentation.authentication = auth;
    return this;
  }

  /**
   * エンドポイントを追加
   */
  addEndpoint(endpoint: EndpointDoc): this {
    if (!this.documentation.endpoints) {
      this.documentation.endpoints = [];
    }
    this.documentation.endpoints.push(endpoint);
    return this;
  }

  /**
   * スキーマを追加
   */
  addSchema(schema: SchemaDoc): this {
    if (!this.documentation.schemas) {
      this.documentation.schemas = [];
    }
    this.documentation.schemas.push(schema);
    return this;
  }

  /**
   * エラーを追加
   */
  addError(error: ErrorDoc): this {
    if (!this.documentation.errors) {
      this.documentation.errors = [];
    }
    this.documentation.errors.push(error);
    return this;
  }

  /**
   * 変更履歴を追加
   */
  addChangelog(entry: ChangelogEntry): this {
    if (!this.documentation.changelog) {
      this.documentation.changelog = [];
    }
    this.documentation.changelog.push(entry);
    return this;
  }

  /**
   * ドキュメントを生成
   */
  generate(): APIDocumentation {
    return {
      version: this.documentation.version || '1.0.0',
      title: this.documentation.title || 'API Documentation',
      description: this.documentation.description || '',
      baseUrl: this.documentation.baseUrl || 'http://localhost:3000',
      endpoints: this.documentation.endpoints || [],
      schemas: this.documentation.schemas || [],
      authentication: this.documentation.authentication || {
        type: 'bearer',
        description: 'JWT Bearer Token',
      },
      errors: this.documentation.errors || [],
      changelog: this.documentation.changelog || [],
      generatedAt: new Date(),
    };
  }

  /**
   * OpenAPI形式でエクスポート
   */
  toOpenAPI(): Record<string, unknown> {
    const doc = this.generate();

    return {
      openapi: '3.0.3',
      info: {
        title: doc.title,
        description: doc.description,
        version: doc.version,
      },
      servers: [{ url: doc.baseUrl }],
      paths: this.convertEndpointsToOpenAPI(doc.endpoints),
      components: {
        schemas: this.convertSchemasToOpenAPI(doc.schemas),
        securitySchemes: this.convertAuthToOpenAPI(doc.authentication),
      },
      tags: this.extractTags(doc.endpoints),
    };
  }

  private convertEndpointsToOpenAPI(
    endpoints: EndpointDoc[]
  ): Record<string, Record<string, unknown>> {
    const paths: Record<string, Record<string, unknown>> = {};

    endpoints.forEach((endpoint) => {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }

      const operation: Record<string, unknown> = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters.map((p) => ({
          name: p.name,
          in: p.in,
          description: p.description,
          required: p.required,
          schema: p.schema,
          example: p.example,
        })),
        responses: {},
      };

      if (endpoint.requestBody) {
        operation.requestBody = {
          description: endpoint.requestBody.description,
          required: endpoint.requestBody.required,
          content: endpoint.requestBody.content.reduce(
            (acc, c) => {
              acc[c.mediaType] = { schema: c.schema, example: c.example };
              return acc;
            },
            {} as Record<string, unknown>
          ),
        };
      }

      endpoint.responses.forEach((response) => {
        (operation.responses as Record<string, unknown>)[response.statusCode.toString()] = {
          description: response.description,
          content: response.content?.reduce(
            (acc, c) => {
              acc[c.mediaType] = { schema: c.schema, example: c.example };
              return acc;
            },
            {} as Record<string, unknown>
          ),
        };
      });

      if (endpoint.security.length > 0) {
        operation.security = endpoint.security.map((s) => ({ [s]: [] }));
      }

      if (endpoint.deprecated) {
        operation.deprecated = true;
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = operation;
    });

    return paths;
  }

  private convertSchemasToOpenAPI(
    schemas: SchemaDoc[]
  ): Record<string, Record<string, unknown>> {
    return schemas.reduce(
      (acc, schema) => {
        acc[schema.name] = {
          type: schema.type,
          description: schema.description,
          properties: schema.properties,
          required: schema.required,
          items: schema.items,
          enum: schema.enum,
          example: schema.example,
        };
        return acc;
      },
      {} as Record<string, Record<string, unknown>>
    );
  }

  private convertAuthToOpenAPI(
    auth: AuthenticationDoc
  ): Record<string, Record<string, unknown>> {
    const scheme: Record<string, unknown> = {
      type: auth.type === 'bearer' ? 'http' : auth.type,
      description: auth.description,
    };

    if (auth.type === 'bearer') {
      scheme.scheme = 'bearer';
      if (auth.bearerFormat) {
        scheme.bearerFormat = auth.bearerFormat;
      }
    }

    if (auth.type === 'apiKey') {
      scheme.in = auth.in;
      scheme.name = auth.name;
    }

    if (auth.type === 'oauth2' && auth.flows) {
      scheme.flows = auth.flows;
    }

    return { default: scheme };
  }

  private extractTags(endpoints: EndpointDoc[]): { name: string; description: string }[] {
    const tagSet = new Set<string>();
    endpoints.forEach((e) => e.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).map((tag) => ({ name: tag, description: '' }));
  }

  /**
   * Markdown形式でエクスポート
   */
  toMarkdown(): string {
    const doc = this.generate();
    let md = '';

    // ヘッダー
    md += `# ${doc.title}\n\n`;
    md += `> Version: ${doc.version}\n\n`;
    md += `${doc.description}\n\n`;
    md += `**Base URL:** \`${doc.baseUrl}\`\n\n`;

    // 認証
    md += `## Authentication\n\n`;
    md += `Type: ${doc.authentication.type}\n\n`;
    md += `${doc.authentication.description}\n\n`;

    // エンドポイント
    md += `## Endpoints\n\n`;
    const tagGroups = this.groupEndpointsByTag(doc.endpoints);
    tagGroups.forEach((endpoints, tag) => {
      md += `### ${tag}\n\n`;
      endpoints.forEach((endpoint) => {
        md += `#### ${endpoint.method} ${endpoint.path}\n\n`;
        md += `${endpoint.summary}\n\n`;
        md += `${endpoint.description}\n\n`;

        if (endpoint.parameters.length > 0) {
          md += `**Parameters:**\n\n`;
          md += `| Name | In | Type | Required | Description |\n`;
          md += `|------|----|----|----------|-------------|\n`;
          endpoint.parameters.forEach((p) => {
            md += `| ${p.name} | ${p.in} | ${p.schema.type || p.schema.$ref || '-'} | ${p.required ? 'Yes' : 'No'} | ${p.description} |\n`;
          });
          md += '\n';
        }

        md += `**Responses:**\n\n`;
        endpoint.responses.forEach((r) => {
          md += `- \`${r.statusCode}\`: ${r.description}\n`;
        });
        md += '\n---\n\n';
      });
    });

    // スキーマ
    if (doc.schemas.length > 0) {
      md += `## Schemas\n\n`;
      doc.schemas.forEach((schema) => {
        md += `### ${schema.name}\n\n`;
        md += `${schema.description}\n\n`;
        if (schema.properties) {
          md += `| Property | Type | Description |\n`;
          md += `|----------|------|-------------|\n`;
          Object.entries(schema.properties).forEach(([name, prop]) => {
            md += `| ${name} | ${prop.type} | ${prop.description} |\n`;
          });
          md += '\n';
        }
      });
    }

    // エラー
    if (doc.errors.length > 0) {
      md += `## Errors\n\n`;
      md += `| Code | Status | Message | Description |\n`;
      md += `|------|--------|---------|-------------|\n`;
      doc.errors.forEach((e) => {
        md += `| ${e.code} | ${e.status} | ${e.message} | ${e.description} |\n`;
      });
      md += '\n';
    }

    // 変更履歴
    if (doc.changelog.length > 0) {
      md += `## Changelog\n\n`;
      doc.changelog.forEach((entry) => {
        md += `### ${entry.version} (${entry.date.toISOString().split('T')[0]})\n\n`;
        entry.changes.forEach((c) => {
          const icon = this.getChangeIcon(c.type);
          const breaking = c.breaking ? ' **BREAKING**' : '';
          md += `- ${icon} ${c.description}${breaking}\n`;
        });
        md += '\n';
      });
    }

    md += `---\n\n*Generated at: ${doc.generatedAt.toISOString()}*\n`;

    return md;
  }

  private groupEndpointsByTag(endpoints: EndpointDoc[]): Map<string, EndpointDoc[]> {
    const groups = new Map<string, EndpointDoc[]>();
    endpoints.forEach((endpoint) => {
      const tag = endpoint.tags[0] || 'Other';
      if (!groups.has(tag)) {
        groups.set(tag, []);
      }
      groups.get(tag)!.push(endpoint);
    });
    return groups;
  }

  private getChangeIcon(type: ChangeItem['type']): string {
    switch (type) {
      case 'added':
        return '+';
      case 'changed':
        return '*';
      case 'deprecated':
        return '!';
      case 'removed':
        return '-';
      case 'fixed':
        return '#';
      case 'security':
        return '!';
      default:
        return '*';
    }
  }
}

/**
 * Executive Copilot APIドキュメントを生成
 */
export function generateExecutiveCopilotDocs(): APIDocumentation {
  const generator = new DocumentationGenerator();

  return generator
    .setBasicInfo({
      version: '1.0.0',
      title: 'Executive Copilot API',
      description: '価値創造エグゼクティブ・コパイロットのAPI仕様',
      baseUrl: 'https://api.executive-copilot.io/v1',
    })
    .setAuthentication({
      type: 'bearer',
      description: 'JWT Bearer Token形式で認証を行います',
      bearerFormat: 'JWT',
    })
    // Data Layer Endpoints
    .addEndpoint({
      method: 'GET',
      path: '/data/megatrends',
      summary: 'メガトレンドデータを取得',
      description: 'フィルタリング可能なメガトレンドデータの一覧を取得します',
      tags: ['Data Layer'],
      parameters: [
        {
          name: 'category',
          in: 'query',
          description: 'カテゴリでフィルタ',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'limit',
          in: 'query',
          description: '取得件数',
          required: false,
          schema: { type: 'number' },
          example: 10,
        },
      ],
      responses: [
        { statusCode: 200, description: '成功' },
        { statusCode: 401, description: '認証エラー' },
      ],
      security: ['bearer'],
      examples: [],
    })
    // Analysis Layer Endpoints
    .addEndpoint({
      method: 'POST',
      path: '/analysis/nlp/analyze',
      summary: 'NLP分析を実行',
      description: 'テキストのNLP分析を実行します',
      tags: ['Analysis Layer'],
      parameters: [],
      requestBody: {
        description: '分析対象テキスト',
        required: true,
        content: [
          {
            mediaType: 'application/json',
            schema: { $ref: '#/components/schemas/NLPRequest' },
          },
        ],
      },
      responses: [
        { statusCode: 200, description: '分析成功' },
        { statusCode: 400, description: 'リクエストエラー' },
      ],
      security: ['bearer'],
      examples: [],
    })
    // Function Layer Endpoints
    .addEndpoint({
      method: 'POST',
      path: '/function/scenario/simulate',
      summary: 'シナリオシミュレーション',
      description: '戦略シナリオをシミュレートします',
      tags: ['Function Layer'],
      parameters: [],
      requestBody: {
        description: 'シナリオ設定',
        required: true,
        content: [
          {
            mediaType: 'application/json',
            schema: { $ref: '#/components/schemas/ScenarioRequest' },
          },
        ],
      },
      responses: [
        { statusCode: 200, description: 'シミュレーション成功' },
        { statusCode: 400, description: 'パラメータエラー' },
      ],
      security: ['bearer'],
      examples: [],
    })
    // Schemas
    .addSchema({
      name: 'NLPRequest',
      description: 'NLP分析リクエスト',
      type: 'object',
      properties: {
        text: { type: 'string', description: '分析対象テキスト' },
        language: { type: 'string', description: '言語コード', default: 'ja' },
        features: { type: 'array', description: '分析機能' },
      },
      required: ['text'],
    })
    .addSchema({
      name: 'ScenarioRequest',
      description: 'シナリオシミュレーションリクエスト',
      type: 'object',
      properties: {
        name: { type: 'string', description: 'シナリオ名' },
        parameters: { type: 'object', description: 'パラメータ' },
        timeframe: { type: 'number', description: '期間（月）' },
      },
      required: ['name', 'parameters'],
    })
    // Errors
    .addError({
      code: 'AUTH_REQUIRED',
      status: 401,
      message: 'Authentication required',
      description: '認証トークンが必要です',
      resolution: 'Authorization ヘッダーにBearer トークンを設定してください',
    })
    .addError({
      code: 'INVALID_REQUEST',
      status: 400,
      message: 'Invalid request',
      description: 'リクエストパラメータが不正です',
      resolution: 'リクエストボディを確認してください',
    })
    .addError({
      code: 'RATE_LIMITED',
      status: 429,
      message: 'Rate limit exceeded',
      description: 'レート制限を超過しました',
      resolution: '時間をおいて再試行してください',
    })
    // Changelog
    .addChangelog({
      version: '1.0.0',
      date: new Date(),
      changes: [
        { type: 'added', description: '初期リリース' },
        { type: 'added', description: 'Data Layer API' },
        { type: 'added', description: 'Analysis Layer API' },
        { type: 'added', description: 'Function Layer API' },
      ],
    })
    .generate();
}

// シングルトンインスタンス
export const documentationGenerator = new DocumentationGenerator();
