/**
 * Data Layer Connectors Index
 * 全15種類のDB連携をエクスポート
 */

// P0 Priority Connectors
export { MegatrendConnector, megatrendConnector } from './MegatrendConnector';
export { ValueTemplateConnector, valueTemplateConnector } from './ValueTemplateConnector';
export { HiddenNeedConnector, hiddenNeedConnector } from './HiddenNeedConnector';

// Standard Connectors (2.8-2.12)
export { SuccessCaseConnector, successCaseConnector } from './SuccessCaseConnector';
export { SeedConnector, seedConnector } from './SeedConnector';
export { PartnerConnector, partnerConnector } from './PartnerConnector';
export { ShortTermTrendConnector, shortTermTrendConnector } from './ShortTermTrendConnector';
export { CompetitorConnector, competitorConnector } from './CompetitorConnector';
