/**
 * Data Layer - Main Export
 * 15種類のDB連携基盤
 */

// Types
export * from './types';

// Interfaces
export type {
  IDataConnector,
  ISearchableConnector,
  IAnalyzableConnector,
  ISyncableConnector,
  SyncResult,
  SyncError,
} from './interfaces/IDataConnector';
// Re-export SyncStatus from types only (avoid duplicate)
export type { SyncStatus } from './types';

// Connectors
export * from './connectors';

// Services
export { DataQualityService, dataQualityService } from './services/DataQualityService';
export { MetadataService, metadataService } from './services/MetadataService';

// Convenience re-exports
import { megatrendConnector } from './connectors/MegatrendConnector';
import { valueTemplateConnector } from './connectors/ValueTemplateConnector';
import { hiddenNeedConnector } from './connectors/HiddenNeedConnector';
import { successCaseConnector } from './connectors/SuccessCaseConnector';
import { seedConnector } from './connectors/SeedConnector';
import { partnerConnector } from './connectors/PartnerConnector';
import { shortTermTrendConnector } from './connectors/ShortTermTrendConnector';
import { competitorConnector } from './connectors/CompetitorConnector';
import { dataQualityService } from './services/DataQualityService';
import { metadataService } from './services/MetadataService';

/**
 * Data Layer facade for easy access to all connectors and services
 */
export const dataLayer = {
  // P0 Priority DBs
  megatrends: megatrendConnector,
  valueTemplates: valueTemplateConnector,
  hiddenNeeds: hiddenNeedConnector,

  // Standard DBs
  successCases: successCaseConnector,
  seeds: seedConnector,
  partners: partnerConnector,
  shortTermTrends: shortTermTrendConnector,
  competitors: competitorConnector,

  // Services
  quality: dataQualityService,
  metadata: metadataService,
};

export default dataLayer;
