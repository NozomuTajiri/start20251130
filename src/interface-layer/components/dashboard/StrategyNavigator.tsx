/**
 * Strategy Navigator Component
 * 5.2 戦略ナビゲーター
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type {
  StrategyMap,
  StrategyPerspective,
  StrategicObjective,
  StrategyConnection,
  NavigatorState,
  FilterOptions,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface StrategyNavigatorProps {
  strategyMap?: StrategyMap;
  onObjectiveSelect?: (objectiveId: string) => void;
  onObjectiveUpdate?: (objective: StrategicObjective) => void;
  onConnectionCreate?: (connection: Omit<StrategyConnection, 'strength'>) => void;
  className?: string;
}

// ========================================
// Sub-Components
// ========================================

const StatusBadge: React.FC<{ status: StrategicObjective['status'] }> = ({ status }) => {
  const statusConfig = {
    'not-started': { label: 'Not Started', color: 'bg-gray-100 text-gray-600' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-600' },
    'completed': { label: 'Completed', color: 'bg-green-100 text-green-600' },
    'blocked': { label: 'Blocked', color: 'bg-red-100 text-red-600' },
  };

  const config = statusConfig[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const ProgressBar: React.FC<{ progress: number; size?: 'sm' | 'md' }> = ({
  progress,
  size = 'md',
}) => {
  const height = size === 'sm' ? 'h-1' : 'h-2';
  const getColor = (p: number): string => {
    if (p >= 80) return 'bg-green-500';
    if (p >= 50) return 'bg-blue-500';
    if (p >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full ${height}`}>
      <div
        className={`${height} rounded-full ${getColor(progress)} transition-all duration-300`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};

const KPICard: React.FC<{ kpi: StrategicObjective['kpis'][0] }> = ({ kpi }) => {
  const progress = (kpi.current / kpi.target) * 100;
  const isOnTrack = progress >= 90;

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-gray-700">{kpi.name}</span>
        <span className={`text-xs ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
          {progress.toFixed(0)}%
        </span>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-lg font-bold">
          {kpi.current.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500">/ {kpi.target.toLocaleString()} {kpi.unit}</span>
      </div>
      <ProgressBar progress={progress} size="sm" />
      {kpi.trend.length > 0 && (
        <div className="mt-2 flex space-x-1">
          {kpi.trend.slice(-5).map((value, idx) => (
            <div
              key={idx}
              className="w-2 bg-blue-200 rounded-t"
              style={{ height: `${Math.max(4, (value / Math.max(...kpi.trend)) * 20)}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ObjectiveCard: React.FC<{
  objective: StrategicObjective;
  isSelected: boolean;
  onClick: () => void;
  connections: StrategyConnection[];
}> = ({ objective, isSelected, onClick, connections }) => {
  const incomingCount = connections.filter((c) => c.targetId === objective.id).length;
  const outgoingCount = connections.filter((c) => c.sourceId === objective.id).length;

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800 flex-1">{objective.name}</h4>
        <StatusBadge status={objective.status} />
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{objective.description}</p>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{objective.progress}%</span>
        </div>
        <ProgressBar progress={objective.progress} />
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span title="Incoming connections">← {incomingCount}</span>
          <span title="Outgoing connections">→ {outgoingCount}</span>
        </div>
        {objective.owner && <span>Owner: {objective.owner}</span>}
      </div>

      {objective.dueDate && (
        <div className="mt-2 text-xs text-gray-400">
          Due: {new Date(objective.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

const PerspectiveSection: React.FC<{
  perspective: StrategyPerspective;
  selectedObjective: string | null;
  onObjectiveSelect: (id: string) => void;
  connections: StrategyConnection[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({
  perspective,
  selectedObjective,
  onObjectiveSelect,
  connections,
  isExpanded,
  onToggleExpand,
}) => {
  const perspectiveColors: Record<string, string> = {
    financial: 'border-l-green-500 bg-green-50',
    customer: 'border-l-blue-500 bg-blue-50',
    process: 'border-l-purple-500 bg-purple-50',
    learning: 'border-l-orange-500 bg-orange-50',
  };

  const colorClass = perspectiveColors[perspective.name.toLowerCase()] || 'border-l-gray-500 bg-gray-50';

  return (
    <div className={`border-l-4 ${colorClass} rounded-lg mb-4`}>
      <button
        className="w-full p-4 flex justify-between items-center text-left"
        onClick={onToggleExpand}
      >
        <div>
          <h3 className="font-semibold text-gray-800">{perspective.name}</h3>
          <p className="text-sm text-gray-500">{perspective.objectives.length} objectives</p>
        </div>
        <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {perspective.objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              isSelected={selectedObjective === objective.id}
              onClick={() => onObjectiveSelect(objective.id)}
              connections={connections}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ObjectiveDetailPanel: React.FC<{
  objective: StrategicObjective;
  connections: StrategyConnection[];
  allObjectives: StrategicObjective[];
  onClose: () => void;
  onUpdate?: (objective: StrategicObjective) => void;
}> = ({ objective, connections, allObjectives, onClose, onUpdate }) => {
  const relatedObjectives = useMemo(() => {
    const relatedIds = [
      ...connections.filter((c) => c.sourceId === objective.id).map((c) => c.targetId),
      ...connections.filter((c) => c.targetId === objective.id).map((c) => c.sourceId),
    ];
    return allObjectives.filter((o) => relatedIds.includes(o.id));
  }, [connections, objective.id, allObjectives]);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-40 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Objective Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800">{objective.name}</h3>
            <StatusBadge status={objective.status} />
          </div>
          <p className="text-gray-600">{objective.description}</p>
        </div>

        {/* Progress */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Progress</h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <ProgressBar progress={objective.progress} />
            </div>
            <span className="text-lg font-bold text-gray-800">{objective.progress}%</span>
          </div>
        </div>

        {/* KPIs */}
        {objective.kpis.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Key Performance Indicators</h4>
            <div className="space-y-3">
              {objective.kpis.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>
        )}

        {/* Related Objectives */}
        {relatedObjectives.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Related Objectives</h4>
            <div className="space-y-2">
              {relatedObjectives.map((related) => {
                const connection = connections.find(
                  (c) =>
                    (c.sourceId === objective.id && c.targetId === related.id) ||
                    (c.targetId === objective.id && c.sourceId === related.id)
                );
                const isSource = connection?.sourceId === objective.id;

                return (
                  <div
                    key={related.id}
                    className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{related.name}</p>
                      <p className="text-xs text-gray-500">
                        {isSource ? 'Drives' : 'Driven by'} • {connection?.type}
                      </p>
                    </div>
                    <StatusBadge status={related.status} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Meta Info */}
        <div className="border-t pt-4 space-y-2 text-sm text-gray-500">
          {objective.owner && (
            <p>
              <span className="font-medium">Owner:</span> {objective.owner}
            </p>
          )}
          {objective.dueDate && (
            <p>
              <span className="font-medium">Due Date:</span>{' '}
              {new Date(objective.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions */}
        {onUpdate && (
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const newStatus =
                  objective.status === 'not-started'
                    ? 'in-progress'
                    : objective.status === 'in-progress'
                    ? 'completed'
                    : objective.status;
                onUpdate({ ...objective, status: newStatus });
              }}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Status
            </button>
            <button
              onClick={() =>
                onUpdate({ ...objective, progress: Math.min(100, objective.progress + 10) })
              }
              className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              +10% Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ViewModeToggle: React.FC<{
  mode: NavigatorState['viewMode'];
  onChange: (mode: NavigatorState['viewMode']) => void;
}> = ({ mode, onChange }) => {
  const modes: { value: NavigatorState['viewMode']; label: string; icon: string }[] = [
    { value: 'map', label: 'Map', icon: '🗺️' },
    { value: 'list', label: 'List', icon: '📋' },
    { value: 'timeline', label: 'Timeline', icon: '📅' },
  ];

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {modes.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            mode === value
              ? 'bg-white shadow text-gray-800'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="mr-1">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
};

// ========================================
// Main Component
// ========================================

export const StrategyNavigator: React.FC<StrategyNavigatorProps> = ({
  strategyMap,
  onObjectiveSelect,
  onObjectiveUpdate,
  onConnectionCreate: _onConnectionCreate,
  className = '',
}) => {
  const [state, setState] = useState<NavigatorState>({
    selectedPerspective: undefined,
    selectedObjective: undefined,
    viewMode: 'map',
    filters: {},
  });

  const [expandedPerspectives, setExpandedPerspectives] = useState<Set<string>>(
    new Set(strategyMap?.perspectives.map((p) => p.id) || [])
  );

  const allObjectives = useMemo(
    () => strategyMap?.perspectives.flatMap((p) => p.objectives) || [],
    [strategyMap]
  );

  const selectedObjectiveData = useMemo(
    () => allObjectives.find((o) => o.id === state.selectedObjective),
    [allObjectives, state.selectedObjective]
  );

  const handleObjectiveSelect = useCallback(
    (objectiveId: string) => {
      setState((prev) => ({ ...prev, selectedObjective: objectiveId }));
      onObjectiveSelect?.(objectiveId);
    },
    [onObjectiveSelect]
  );

  const handleTogglePerspective = useCallback((perspectiveId: string) => {
    setExpandedPerspectives((prev) => {
      const next = new Set(prev);
      if (next.has(perspectiveId)) {
        next.delete(perspectiveId);
      } else {
        next.add(perspectiveId);
      }
      return next;
    });
  }, []);

  const handleFilterChange = useCallback((filters: FilterOptions) => {
    setState((prev) => ({ ...prev, filters }));
  }, []);

  if (!strategyMap) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <p>Loading strategy map...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{strategyMap.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {strategyMap.perspectives.length} perspectives •{' '}
              {allObjectives.length} objectives •{' '}
              {strategyMap.connections.length} connections
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <ViewModeToggle
              mode={state.viewMode}
              onChange={(viewMode) => setState((prev) => ({ ...prev, viewMode }))}
            />

            <button
              onClick={() => handleFilterChange({})}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Filter"
            >
              🔍
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {state.viewMode === 'map' && (
          <div className="space-y-4">
            {strategyMap.perspectives
              .sort((a, b) => a.order - b.order)
              .map((perspective) => (
                <PerspectiveSection
                  key={perspective.id}
                  perspective={perspective}
                  selectedObjective={state.selectedObjective || null}
                  onObjectiveSelect={handleObjectiveSelect}
                  connections={strategyMap.connections}
                  isExpanded={expandedPerspectives.has(perspective.id)}
                  onToggleExpand={() => handleTogglePerspective(perspective.id)}
                />
              ))}
          </div>
        )}

        {state.viewMode === 'list' && (
          <div className="space-y-3">
            {allObjectives.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                isSelected={state.selectedObjective === objective.id}
                onClick={() => handleObjectiveSelect(objective.id)}
                connections={strategyMap.connections}
              />
            ))}
          </div>
        )}

        {state.viewMode === 'timeline' && (
          <div className="text-center text-gray-500 py-12">
            Timeline view - Coming soon
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedObjectiveData && (
        <ObjectiveDetailPanel
          objective={selectedObjectiveData}
          connections={strategyMap.connections}
          allObjectives={allObjectives}
          onClose={() => setState((prev) => ({ ...prev, selectedObjective: undefined }))}
          onUpdate={onObjectiveUpdate}
        />
      )}
    </div>
  );
};

export default StrategyNavigator;
