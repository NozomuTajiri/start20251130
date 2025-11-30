/**
 * Data Connector Interface
 * 全データソースに共通のインターフェース定義
 */

import type {
  PaginationParams,
  PaginatedResult,
  QueryFilter,
  DataQualityMetrics,
  DataValidationResult,
} from '../types';

/**
 * 基本的なCRUD操作を定義するインターフェース
 */
export interface IDataConnector<T, CreateInput, UpdateInput> {
  /**
   * IDで単一のレコードを取得
   */
  findById(id: string): Promise<T | null>;

  /**
   * 条件に一致する全レコードを取得
   */
  findMany(params?: {
    filters?: QueryFilter[];
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<T>>;

  /**
   * 新しいレコードを作成
   */
  create(data: CreateInput): Promise<T>;

  /**
   * 複数のレコードを一括作成
   */
  createMany(data: CreateInput[]): Promise<T[]>;

  /**
   * 既存のレコードを更新
   */
  update(id: string, data: UpdateInput): Promise<T>;

  /**
   * レコードを削除
   */
  delete(id: string): Promise<void>;

  /**
   * 入力データを検証
   */
  validate(data: CreateInput | UpdateInput): Promise<DataValidationResult>;

  /**
   * データソースの品質メトリクスを取得
   */
  getQualityMetrics(): Promise<DataQualityMetrics>;
}

/**
 * 検索機能を持つコネクタのインターフェース
 */
export interface ISearchableConnector<T> {
  /**
   * テキスト検索
   */
  search(query: string, options?: {
    fields?: string[];
    limit?: number;
  }): Promise<T[]>;

  /**
   * キーワードで検索
   */
  findByKeywords(keywords: string[]): Promise<T[]>;
}

/**
 * 分析機能を持つコネクタのインターフェース
 */
export interface IAnalyzableConnector<T, AnalysisResult> {
  /**
   * データを分析
   */
  analyze(id: string): Promise<AnalysisResult>;

  /**
   * 複数のデータを一括分析
   */
  analyzeMany(ids: string[]): Promise<AnalysisResult[]>;

  /**
   * 関連データを取得
   */
  getRelated(id: string, options?: {
    limit?: number;
    minRelevance?: number;
  }): Promise<T[]>;
}

/**
 * 同期機能を持つコネクタのインターフェース
 */
export interface ISyncableConnector {
  /**
   * 外部データソースと同期
   */
  sync(): Promise<SyncResult>;

  /**
   * 最終同期日時を取得
   */
  getLastSyncAt(): Promise<Date | null>;

  /**
   * 同期ステータスを取得
   */
  getSyncStatus(): Promise<SyncStatus>;
}

export interface SyncResult {
  success: boolean;
  syncedAt: Date;
  created: number;
  updated: number;
  deleted: number;
  errors: SyncError[];
}

export interface SyncError {
  recordId?: string;
  message: string;
  code: string;
}

export type SyncStatus = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'FAILED';
