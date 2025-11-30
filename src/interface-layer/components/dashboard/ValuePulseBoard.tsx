/**
 * Value Pulse Board Component
 * 5.1 価値創造パルスボード
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type {
  ValuePulseData,
  ValueDimension,
  PulseAlert,
  PulseBoardConfig,
} from '../../types';

// ========================================
// Props & State Types
// ========================================

export interface ValuePulseBoardProps {
  data?: ValuePulseData;
  config?: Partial<PulseBoardConfig>;
  onAlertAcknowledge?: (alertId: string) => void;
  onDimensionClick?: (dimensionId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface PulseBoardState {
  selectedDimension: string | null;
  showAlertPanel: boolean;
  isRefreshing: boolean;
}

// ========================================
// Default Configuration
// ========================================

const defaultConfig: PulseBoardConfig = {
  refreshInterval: 30000,
  showAlerts: true,
  showTrends: true,
  dimensionLayout: 'grid',
};

// ========================================
// Sub-Components
// ========================================

const ScoreIndicator: React.FC<{
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}> = ({ score, size = 'md', showLabel = true }) => {
  const getScoreColor = (s: number): string => {
    if (s >= 0.8) return 'text-green-600 bg-green-100';
    if (s >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (s >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${sizeClasses[size]} ${getScoreColor(score)} rounded-full flex items-center justify-center font-bold`}
      >
        {Math.round(score * 100)}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 mt-1">Score</span>
      )}
    </div>
  );
};

const TrendIndicator: React.FC<{
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}> = ({ trend, percentage }) => {
  const trendConfig = {
    up: { icon: '↑', color: 'text-green-600', bg: 'bg-green-50' },
    down: { icon: '↓', color: 'text-red-600', bg: 'bg-red-50' },
    stable: { icon: '→', color: 'text-gray-600', bg: 'bg-gray-50' },
  };

  const config = trendConfig[trend];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded ${config.bg} ${config.color} text-sm`}>
      <span className="mr-1">{config.icon}</span>
      {Math.abs(percentage).toFixed(1)}%
    </span>
  );
};

const DimensionCard: React.FC<{
  dimension: ValueDimension;
  onClick?: () => void;
  showTrends: boolean;
}> = ({ dimension, onClick, showTrends }) => {
  const statusColors = {
    'on-track': 'border-green-200 bg-green-50',
    'at-risk': 'border-yellow-200 bg-yellow-50',
    'off-track': 'border-red-200 bg-red-50',
  };

  const getOverallStatus = (): 'on-track' | 'at-risk' | 'off-track' => {
    const avgProgress = dimension.subDimensions.reduce(
      (acc, sub) => acc + (sub.score / sub.target),
      0
    ) / dimension.subDimensions.length;

    if (avgProgress >= 0.9) return 'on-track';
    if (avgProgress >= 0.7) return 'at-risk';
    return 'off-track';
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${statusColors[getOverallStatus()]} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800">{dimension.name}</h3>
        <ScoreIndicator score={dimension.score} size="sm" showLabel={false} />
      </div>

      {showTrends && (
        <div className="mb-3">
          <TrendIndicator
            trend={dimension.trend}
            percentage={dimension.score * 10}
          />
        </div>
      )}

      <div className="space-y-2">
        {dimension.subDimensions.slice(0, 3).map((sub) => (
          <div key={sub.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-600 truncate mr-2">{sub.name}</span>
            <div className="flex items-center">
              <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                <div
                  className={`h-full rounded-full ${
                    sub.status === 'on-track'
                      ? 'bg-green-500'
                      : sub.status === 'at-risk'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${(sub.score / sub.target) * 100}%` }}
                />
              </div>
              <span className="text-gray-500 w-8 text-right">
                {Math.round((sub.score / sub.target) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {dimension.subDimensions.length > 3 && (
        <p className="text-xs text-gray-400 mt-2">
          +{dimension.subDimensions.length - 3} more
        </p>
      )}
    </div>
  );
};

const AlertPanel: React.FC<{
  alerts: PulseAlert[];
  onAcknowledge: (alertId: string) => void;
  onClose: () => void;
}> = ({ alerts, onAcknowledge, onClose }) => {
  const alertStyles = {
    critical: 'border-red-500 bg-red-50',
    warning: 'border-yellow-500 bg-yellow-50',
    info: 'border-blue-500 bg-blue-50',
  };

  const alertIcons = {
    critical: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Alerts ({alerts.length})</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close alerts"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3">
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No alerts</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border-l-4 ${alertStyles[alert.type]}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <span className="mr-2">{alertIcons[alert.type]}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {alert.dimension} • {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ========================================
// Main Component
// ========================================

export const ValuePulseBoard: React.FC<ValuePulseBoardProps> = ({
  data,
  config: userConfig,
  onAlertAcknowledge,
  onDimensionClick,
  onRefresh,
  className = '',
}) => {
  const config = { ...defaultConfig, ...userConfig };

  const [state, setState] = useState<PulseBoardState>({
    selectedDimension: null,
    showAlertPanel: false,
    isRefreshing: false,
  });

  // Auto-refresh
  useEffect(() => {
    if (config.refreshInterval > 0 && onRefresh) {
      const interval = setInterval(() => {
        setState((prev) => ({ ...prev, isRefreshing: true }));
        onRefresh();
        setTimeout(() => {
          setState((prev) => ({ ...prev, isRefreshing: false }));
        }, 1000);
      }, config.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, onRefresh]);

  const handleAlertAcknowledge = useCallback(
    (alertId: string) => {
      onAlertAcknowledge?.(alertId);
    },
    [onAlertAcknowledge]
  );

  const handleDimensionClick = useCallback(
    (dimensionId: string) => {
      setState((prev) => ({ ...prev, selectedDimension: dimensionId }));
      onDimensionClick?.(dimensionId);
    },
    [onDimensionClick]
  );

  const unacknowledgedAlerts = data?.alerts.filter((a) => !a.acknowledged) || [];
  const criticalAlerts = unacknowledgedAlerts.filter((a) => a.type === 'critical');

  if (!data) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <p>Loading pulse data...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Value Creation Pulse</h1>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
              {state.isRefreshing && <span className="ml-2">Refreshing...</span>}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Overall Score */}
            <div className="flex items-center space-x-3">
              <ScoreIndicator score={data.overallScore} size="lg" />
              {config.showTrends && (
                <TrendIndicator trend={data.trend} percentage={data.trendPercentage} />
              )}
            </div>

            {/* Alert Badge */}
            {config.showAlerts && unacknowledgedAlerts.length > 0 && (
              <button
                onClick={() => setState((prev) => ({ ...prev, showAlertPanel: true }))}
                className={`relative p-2 rounded-full ${
                  criticalAlerts.length > 0
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}
              >
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unacknowledgedAlerts.length}
                </span>
              </button>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={state.isRefreshing}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                aria-label="Refresh data"
              >
                <span className={state.isRefreshing ? 'animate-spin' : ''}>🔄</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dimensions Grid */}
      <div className="p-6">
        <div
          className={
            config.dimensionLayout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : config.dimensionLayout === 'list'
              ? 'space-y-4'
              : 'flex flex-wrap justify-center gap-4'
          }
        >
          {data.dimensions.map((dimension) => (
            <DimensionCard
              key={dimension.id}
              dimension={dimension}
              onClick={() => handleDimensionClick(dimension.id)}
              showTrends={config.showTrends}
            />
          ))}
        </div>
      </div>

      {/* Alert Panel */}
      {state.showAlertPanel && (
        <AlertPanel
          alerts={data.alerts}
          onAcknowledge={handleAlertAcknowledge}
          onClose={() => setState((prev) => ({ ...prev, showAlertPanel: false }))}
        />
      )}
    </div>
  );
};

export default ValuePulseBoard;
