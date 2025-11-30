/**
 * Scenario Simulator Component
 * 5.3 シナリオシミュレーター
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type {
  SimulatorState,
  ScenarioConfig,
  ScenarioParameter,
  SimulationResult,
  SimulationOutcome,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface ScenarioSimulatorProps {
  scenarios?: ScenarioConfig[];
  onRunSimulation?: (scenarioId: string, parameters: ScenarioParameter[]) => Promise<SimulationResult>;
  onSaveScenario?: (scenario: ScenarioConfig) => void;
  onCompareScenarios?: (scenarioIds: string[]) => void;
  className?: string;
}

// ========================================
// Sub-Components
// ========================================

const ParameterInput: React.FC<{
  parameter: ScenarioParameter;
  onChange: (value: ScenarioParameter['value']) => void;
}> = ({ parameter, onChange }) => {
  const renderInput = () => {
    switch (parameter.type) {
      case 'number':
        return (
          <input
            type="number"
            value={parameter.value as number}
            min={parameter.min}
            max={parameter.max}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'percentage':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              value={parameter.value as number}
              min={parameter.min || 0}
              max={parameter.max || 100}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right font-medium">
              {parameter.value as number}%
            </span>
          </div>
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={parameter.value as boolean}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {parameter.value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            value={parameter.value as string}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {parameter.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {parameter.name}
        {parameter.unit && (
          <span className="text-gray-400 font-normal"> ({parameter.unit})</span>
        )}
      </label>
      {renderInput()}
    </div>
  );
};

const ScenarioCard: React.FC<{
  scenario: ScenarioConfig;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onActivate: () => void;
}> = ({ scenario, isActive, isSelected, onSelect, onActivate }) => {
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isActive
          ? 'border-blue-500 bg-blue-50'
          : isSelected
          ? 'border-gray-400 bg-gray-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-800">{scenario.name}</h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {scenario.description}
          </p>
        </div>
        {isActive && (
          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>{scenario.parameters.length} parameters</span>
        <span>{new Date(scenario.createdAt).toLocaleDateString()}</span>
      </div>

      {!isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onActivate();
          }}
          className="mt-3 w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Activate Scenario
        </button>
      )}
    </div>
  );
};

const OutcomeChart: React.FC<{
  outcome: SimulationOutcome;
}> = ({ outcome }) => {
  const change = outcome.projected - outcome.baseline;
  const changePercent = (change / outcome.baseline) * 100;
  const isPositive = change >= 0;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-800">{outcome.metric}</h4>
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
        </span>
      </div>

      <div className="flex items-end space-x-4 mb-3">
        <div>
          <p className="text-xs text-gray-500">Baseline</p>
          <p className="text-lg font-bold text-gray-600">{outcome.baseline.toLocaleString()}</p>
        </div>
        <span className="text-gray-400 pb-1">→</span>
        <div>
          <p className="text-xs text-gray-500">Projected</p>
          <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {outcome.projected.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Confidence indicator */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500">Confidence:</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${outcome.confidence * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600">
          {(outcome.confidence * 100).toFixed(0)}%
        </span>
      </div>

      {/* Mini timeline chart */}
      {outcome.timeline.length > 0 && (
        <div className="mt-3 flex items-end space-x-1 h-12">
          {outcome.timeline.map((point, idx) => {
            const maxValue = Math.max(...outcome.timeline.map((p) => p.value));
            const height = (point.value / maxValue) * 100;

            return (
              <div
                key={idx}
                className="flex-1 bg-blue-300 rounded-t hover:bg-blue-400 transition-colors"
                style={{ height: `${height}%` }}
                title={`${new Date(point.date).toLocaleDateString()}: ${point.value.toLocaleString()}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const ResultsPanel: React.FC<{
  result: SimulationResult;
  onClose: () => void;
}> = ({ result, onClose }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Simulation Results</h3>
            <p className="text-sm text-blue-100">
              {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            aria-label="Close results"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Outcomes */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Projected Outcomes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.outcomes.map((outcome, idx) => (
              <OutcomeChart key={idx} outcome={outcome} />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-gray-600">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comparisons */}
        {result.comparisons.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Scenario Comparisons</h4>
            <div className="space-y-3">
              {result.comparisons.map((comparison, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {comparison.scenarioA} vs {comparison.scenarioB}
                  </p>
                  <div className="space-y-1">
                    {comparison.differences.slice(0, 3).map((diff, diffIdx) => (
                      <div
                        key={diffIdx}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">{diff.metric}</span>
                        <span
                          className={
                            diff.percentageDiff >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {diff.percentageDiff >= 0 ? '+' : ''}
                          {diff.percentageDiff.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// Main Component
// ========================================

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  scenarios = [],
  onRunSimulation,
  onSaveScenario,
  onCompareScenarios,
  className = '',
}) => {
  const [state, setState] = useState<SimulatorState>({
    scenarios,
    activeScenario: undefined,
    simulationResults: undefined,
    isRunning: false,
  });

  const [selectedScenarios, setSelectedScenarios] = useState<Set<string>>(new Set());
  const [editingParameters, setEditingParameters] = useState<ScenarioParameter[]>([]);

  const activeScenarioData = useMemo(
    () => state.scenarios.find((s) => s.id === state.activeScenario),
    [state.scenarios, state.activeScenario]
  );

  const handleActivateScenario = useCallback((scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setState((prev) => ({ ...prev, activeScenario: scenarioId }));
      setEditingParameters([...scenario.parameters]);
    }
  }, [scenarios]);

  const handleToggleScenarioSelection = useCallback((scenarioId: string) => {
    setSelectedScenarios((prev) => {
      const next = new Set(prev);
      if (next.has(scenarioId)) {
        next.delete(scenarioId);
      } else {
        next.add(scenarioId);
      }
      return next;
    });
  }, []);

  const handleParameterChange = useCallback(
    (parameterId: string, value: ScenarioParameter['value']) => {
      setEditingParameters((prev) =>
        prev.map((p) => (p.id === parameterId ? { ...p, value } : p))
      );
    },
    []
  );

  const handleRunSimulation = useCallback(async () => {
    if (!state.activeScenario || !onRunSimulation) return;

    setState((prev) => ({ ...prev, isRunning: true }));

    try {
      const result = await onRunSimulation(state.activeScenario, editingParameters);
      setState((prev) => ({
        ...prev,
        isRunning: false,
        simulationResults: result,
      }));
    } catch (error) {
      console.error('Simulation failed:', error);
      setState((prev) => ({ ...prev, isRunning: false }));
    }
  }, [state.activeScenario, editingParameters, onRunSimulation]);

  const handleSaveScenario = useCallback(() => {
    if (!activeScenarioData || !onSaveScenario) return;

    onSaveScenario({
      ...activeScenarioData,
      parameters: editingParameters,
    });
  }, [activeScenarioData, editingParameters, onSaveScenario]);

  const handleCompareScenarios = useCallback(() => {
    if (selectedScenarios.size < 2 || !onCompareScenarios) return;
    onCompareScenarios(Array.from(selectedScenarios));
  }, [selectedScenarios, onCompareScenarios]);

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Scenario Simulator</h1>
            <p className="text-sm text-gray-500 mt-1">
              Model different scenarios and analyze potential outcomes
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {selectedScenarios.size >= 2 && (
              <button
                onClick={handleCompareScenarios}
                className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                Compare ({selectedScenarios.size})
              </button>
            )}

            <button
              onClick={() => {
                const newScenario: ScenarioConfig = {
                  id: `scenario-${Date.now()}`,
                  name: 'New Scenario',
                  description: 'Describe your scenario',
                  parameters: [],
                  assumptions: [],
                  createdAt: new Date(),
                };
                setState((prev) => ({
                  ...prev,
                  scenarios: [...prev.scenarios, newScenario],
                  activeScenario: newScenario.id,
                }));
                setEditingParameters([]);
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + New Scenario
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Scenario List */}
        <div className="w-80 border-r p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <h3 className="font-medium text-gray-700 mb-3">Scenarios</h3>
          {state.scenarios.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No scenarios yet. Create one to get started.
            </p>
          ) : (
            state.scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isActive={state.activeScenario === scenario.id}
                isSelected={selectedScenarios.has(scenario.id)}
                onSelect={() => handleToggleScenarioSelection(scenario.id)}
                onActivate={() => handleActivateScenario(scenario.id)}
              />
            ))
          )}
        </div>

        {/* Configuration Panel */}
        <div className="flex-1 p-6">
          {activeScenarioData ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {activeScenarioData.name}
                </h3>
                <p className="text-gray-600 mt-1">{activeScenarioData.description}</p>
              </div>

              {/* Parameters */}
              {editingParameters.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-4">Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editingParameters.map((param) => (
                      <ParameterInput
                        key={param.id}
                        parameter={param}
                        onChange={(value) => handleParameterChange(param.id, value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Assumptions */}
              {activeScenarioData.assumptions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Assumptions</h4>
                  <div className="space-y-2">
                    {activeScenarioData.assumptions.map((assumption) => (
                      <div
                        key={assumption.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          assumption.impact === 'high'
                            ? 'border-l-red-500 bg-red-50'
                            : assumption.impact === 'medium'
                            ? 'border-l-yellow-500 bg-yellow-50'
                            : 'border-l-blue-500 bg-blue-50'
                        }`}
                      >
                        <p className="text-xs text-gray-500 mb-1">{assumption.category}</p>
                        <p className="text-sm text-gray-700">{assumption.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={handleRunSimulation}
                  disabled={state.isRunning}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    state.isRunning
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {state.isRunning ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⏳</span>
                      Running Simulation...
                    </span>
                  ) : (
                    'Run Simulation'
                  )}
                </button>

                {onSaveScenario && (
                  <button
                    onClick={handleSaveScenario}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
              <span className="text-4xl mb-4">📊</span>
              <p>Select or create a scenario to configure</p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {state.simulationResults && (
        <div className="p-6 border-t">
          <ResultsPanel
            result={state.simulationResults}
            onClose={() => setState((prev) => ({ ...prev, simulationResults: undefined }))}
          />
        </div>
      )}
    </div>
  );
};

export default ScenarioSimulator;
