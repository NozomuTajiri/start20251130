/**
 * Decision Support Component
 * 5.7 意思決定支援UI
 */

'use client';

import React, { useState, useMemo } from 'react';
import type {
  DecisionSupport as DecisionSupportType,
  Decision,
  DecisionOption,
  DecisionCriteria,
  DecisionAnalysis,
  Recommendation,
  Stakeholder,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface DecisionSupportProps {
  decision?: DecisionSupportType;
  onUpdateDecision?: (updates: Partial<Decision>) => void;
  onScoreOption?: (optionId: string, criteriaId: string, score: number) => void;
  onAddOption?: (option: Omit<DecisionOption, 'id' | 'scores' | 'totalScore'>) => void;
  onSelectOption?: (optionId: string) => void;
  onRequestAnalysis?: (analysisType: keyof DecisionAnalysis) => void;
  className?: string;
}

type ViewTab = 'overview' | 'options' | 'analysis' | 'stakeholders';

// ========================================
// Sub-Components
// ========================================

const UrgencyBadge: React.FC<{ urgency: Decision['urgency'] }> = ({ urgency }) => {
  const config = {
    immediate: { label: 'Immediate', color: 'bg-red-100 text-red-700' },
    'short-term': { label: 'Short-term', color: 'bg-orange-100 text-orange-700' },
    'medium-term': { label: 'Medium-term', color: 'bg-yellow-100 text-yellow-700' },
    'long-term': { label: 'Long-term', color: 'bg-green-100 text-green-700' },
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config[urgency].color}`}>
      {config[urgency].label}
    </span>
  );
};

const ImpactBadge: React.FC<{ impact: Decision['impact'] }> = ({ impact }) => {
  const config = {
    high: { label: 'High Impact', color: 'bg-purple-100 text-purple-700' },
    medium: { label: 'Medium Impact', color: 'bg-blue-100 text-blue-700' },
    low: { label: 'Low Impact', color: 'bg-gray-100 text-gray-700' },
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config[impact].color}`}>
      {config[impact].label}
    </span>
  );
};

const RiskIndicator: React.FC<{ risk: DecisionOption['risk'] }> = ({ risk }) => {
  const colors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Risk Level</span>
        <span className={`font-bold ${colors[risk.level]}`}>{risk.level.toUpperCase()}</span>
      </div>

      {risk.factors.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">Risk Factors:</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {risk.factors.map((factor, idx) => (
              <li key={idx}>• {factor}</li>
            ))}
          </ul>
        </div>
      )}

      {risk.mitigations.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Mitigations:</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {risk.mitigations.map((mitigation, idx) => (
              <li key={idx}>✓ {mitigation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const OptionCard: React.FC<{
  option: DecisionOption;
  criteria: DecisionCriteria[];
  isRecommended: boolean;
  onScore?: (criteriaId: string, score: number) => void;
  onSelect?: () => void;
}> = ({ option, criteria, isRecommended, onScore, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const maxPossibleScore = criteria.reduce((sum, c) => sum + c.weight * 5, 0);
  const scorePercentage = (option.totalScore / maxPossibleScore) * 100;

  return (
    <div
      className={`bg-white rounded-lg border-2 overflow-hidden ${
        isRecommended ? 'border-green-500' : 'border-gray-200'
      }`}
    >
      {isRecommended && (
        <div className="bg-green-500 text-white text-xs text-center py-1">
          ⭐ Recommended Option
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800">{option.name}</h4>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">
              {scorePercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">{option.description}</p>

        {/* Pros and Cons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-green-600 mb-1">Pros</p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              {option.pros.slice(0, 3).map((pro, idx) => (
                <li key={idx}>✓ {pro}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-red-600 mb-1">Cons</p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              {option.cons.slice(0, 3).map((con, idx) => (
                <li key={idx}>✗ {con}</li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:underline mb-3"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Scoring Grid */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Criteria Scores</h5>
              <div className="space-y-2">
                {criteria.map((criterion) => {
                  const score = option.scores[criterion.id] || 0;
                  return (
                    <div key={criterion.id} className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 w-32 truncate" title={criterion.name}>
                        {criterion.name}
                      </span>
                      <div className="flex-1 flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() => onScore?.(criterion.id, value)}
                            className={`w-6 h-6 rounded ${
                              value <= score
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">x{criterion.weight}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Assessment */}
            <RiskIndicator risk={option.risk} />
          </div>
        )}

        {onSelect && (
          <button
            onClick={onSelect}
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Select This Option
          </button>
        )}
      </div>
    </div>
  );
};

const CriteriaManager: React.FC<{
  criteria: DecisionCriteria[];
  onUpdateWeight?: (criteriaId: string, weight: number) => void;
}> = ({ criteria, onUpdateWeight }) => {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-medium text-gray-800 mb-3">Decision Criteria</h4>
      <div className="space-y-3">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="flex items-center space-x-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{criterion.name}</p>
              <p className="text-xs text-gray-500">{criterion.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="5"
                value={criterion.weight}
                onChange={(e) => onUpdateWeight?.(criterion.id, Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm font-medium text-gray-600 w-8">
                {((criterion.weight / totalWeight) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StakeholderMatrix: React.FC<{
  stakeholders: Stakeholder[];
}> = ({ stakeholders }) => {
  // Group by influence/interest quadrants
  const quadrants = {
    'high-high': stakeholders.filter((s) => s.influence === 'high' && s.interest === 'high'),
    'high-low': stakeholders.filter((s) => s.influence === 'high' && s.interest === 'low'),
    'low-high': stakeholders.filter((s) => s.influence === 'low' && s.interest === 'high'),
    'low-low': stakeholders.filter((s) => s.influence === 'low' && s.interest === 'low'),
  };

  const positionColors = {
    supportive: 'bg-green-100 border-green-300',
    neutral: 'bg-gray-100 border-gray-300',
    resistant: 'bg-red-100 border-red-300',
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-medium text-gray-800 mb-4">Stakeholder Matrix</h4>
      <div className="grid grid-cols-2 gap-4">
        {/* High Influence / High Interest */}
        <div className="border rounded-lg p-3 bg-purple-50">
          <p className="text-xs font-medium text-purple-700 mb-2">
            Manage Closely (High Influence / High Interest)
          </p>
          <div className="space-y-1">
            {quadrants['high-high'].map((s) => (
              <div
                key={s.id}
                className={`px-2 py-1 rounded text-xs border ${
                  positionColors[s.position || 'neutral']
                }`}
              >
                {s.name} - {s.role}
              </div>
            ))}
          </div>
        </div>

        {/* High Influence / Low Interest */}
        <div className="border rounded-lg p-3 bg-blue-50">
          <p className="text-xs font-medium text-blue-700 mb-2">
            Keep Satisfied (High Influence / Low Interest)
          </p>
          <div className="space-y-1">
            {quadrants['high-low'].map((s) => (
              <div
                key={s.id}
                className={`px-2 py-1 rounded text-xs border ${
                  positionColors[s.position || 'neutral']
                }`}
              >
                {s.name} - {s.role}
              </div>
            ))}
          </div>
        </div>

        {/* Low Influence / High Interest */}
        <div className="border rounded-lg p-3 bg-yellow-50">
          <p className="text-xs font-medium text-yellow-700 mb-2">
            Keep Informed (Low Influence / High Interest)
          </p>
          <div className="space-y-1">
            {quadrants['low-high'].map((s) => (
              <div
                key={s.id}
                className={`px-2 py-1 rounded text-xs border ${
                  positionColors[s.position || 'neutral']
                }`}
              >
                {s.name} - {s.role}
              </div>
            ))}
          </div>
        </div>

        {/* Low Influence / Low Interest */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Monitor (Low Influence / Low Interest)
          </p>
          <div className="space-y-1">
            {quadrants['low-low'].map((s) => (
              <div
                key={s.id}
                className={`px-2 py-1 rounded text-xs border ${
                  positionColors[s.position || 'neutral']
                }`}
              >
                {s.name} - {s.role}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisPanel: React.FC<{
  analysis: DecisionAnalysis;
  onRequestAnalysis?: (type: keyof DecisionAnalysis) => void;
}> = ({ analysis, onRequestAnalysis }) => {
  return (
    <div className="space-y-4">
      {/* SWOT Analysis */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800">SWOT Analysis</h4>
          {!analysis.swotAnalysis && onRequestAnalysis && (
            <button
              onClick={() => onRequestAnalysis('swotAnalysis')}
              className="text-sm text-blue-600 hover:underline"
            >
              Generate
            </button>
          )}
        </div>

        {analysis.swotAnalysis ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded">
              <p className="text-xs font-medium text-green-700 mb-1">Strengths</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {analysis.swotAnalysis.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <p className="text-xs font-medium text-red-700 mb-1">Weaknesses</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {analysis.swotAnalysis.weaknesses.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-xs font-medium text-blue-700 mb-1">Opportunities</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {analysis.swotAnalysis.opportunities.map((o, i) => (
                  <li key={i}>• {o}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-yellow-50 rounded">
              <p className="text-xs font-medium text-yellow-700 mb-1">Threats</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {analysis.swotAnalysis.threats.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No SWOT analysis available
          </p>
        )}
      </div>

      {/* Cost-Benefit Analysis */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800">Cost-Benefit Analysis</h4>
          {!analysis.costBenefitAnalysis && onRequestAnalysis && (
            <button
              onClick={() => onRequestAnalysis('costBenefitAnalysis')}
              className="text-sm text-blue-600 hover:underline"
            >
              Generate
            </button>
          )}
        </div>

        {analysis.costBenefitAnalysis ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Net Benefit</p>
                <p className={`text-lg font-bold ${
                  analysis.costBenefitAnalysis.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${analysis.costBenefitAnalysis.netBenefit.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">ROI</p>
                <p className="text-lg font-bold text-blue-600">
                  {analysis.costBenefitAnalysis.roi.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Payback</p>
                <p className="text-lg font-bold text-gray-800">
                  {analysis.costBenefitAnalysis.paybackPeriod}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No cost-benefit analysis available
          </p>
        )}
      </div>
    </div>
  );
};

const RecommendationPanel: React.FC<{
  recommendations: Recommendation[];
  options: DecisionOption[];
}> = ({ recommendations, options }) => {
  if (recommendations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
        <p>No recommendations generated yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const option = options.find((o) => o.id === rec.optionId);
        return (
          <div
            key={rec.id}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-green-800">
                  Recommend: {option?.name || 'Unknown Option'}
                </h4>
                <p className="text-sm text-green-600">
                  Confidence: {(rec.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">{rec.rationale}</p>

            {rec.conditions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Conditions:</p>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {rec.conditions.map((condition, idx) => (
                    <li key={idx}>• {condition}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ========================================
// Main Component
// ========================================

export const DecisionSupport: React.FC<DecisionSupportProps> = ({
  decision,
  onUpdateDecision,
  onScoreOption,
  onAddOption: _onAddOption,
  onSelectOption,
  onRequestAnalysis,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');

  const sortedOptions = useMemo(() => {
    if (!decision?.decision.options) return [];
    return [...decision.decision.options].sort((a, b) => b.totalScore - a.totalScore);
  }, [decision?.decision.options]);

  const recommendedOptionId = useMemo(() => {
    return decision?.recommendations[0]?.optionId;
  }, [decision?.recommendations]);

  if (!decision) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <p>Loading decision support data...</p>
      </div>
    );
  }

  const { decision: decisionData, analysis, recommendations, stakeholders } = decision;

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{decisionData.title}</h1>
              <p className="text-gray-600 mt-1">{decisionData.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <UrgencyBadge urgency={decisionData.urgency} />
              <ImpactBadge impact={decisionData.impact} />
            </div>
          </div>

          {decisionData.deadline && (
            <p className="text-sm text-gray-500">
              Deadline: {new Date(decisionData.deadline).toLocaleDateString()}
            </p>
          )}

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {(['overview', 'options', 'analysis', 'stakeholders'] as ViewTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 border-t border-x border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recommendation Summary */}
            <RecommendationPanel
              recommendations={recommendations}
              options={decisionData.options}
            />

            {/* Top Options Summary */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium text-gray-800 mb-3">Top Options</h3>
              <div className="space-y-2">
                {sortedOptions.slice(0, 3).map((option, idx) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                        idx === 1 ? 'bg-gray-300 text-gray-700' :
                        'bg-orange-300 text-orange-900'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-800">{option.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Score: {option.totalScore.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Criteria Overview */}
            <CriteriaManager
              criteria={decisionData.criteria}
              onUpdateWeight={(criteriaId, weight) => {
                const updatedCriteria = decisionData.criteria.map((c) =>
                  c.id === criteriaId ? { ...c, weight } : c
                );
                onUpdateDecision?.({ criteria: updatedCriteria });
              }}
            />
          </div>
        )}

        {/* Options Tab */}
        {activeTab === 'options' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedOptions.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                criteria={decisionData.criteria}
                isRecommended={option.id === recommendedOptionId}
                onScore={(criteriaId, score) => onScoreOption?.(option.id, criteriaId, score)}
                onSelect={() => onSelectOption?.(option.id)}
              />
            ))}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <AnalysisPanel
            analysis={analysis}
            onRequestAnalysis={onRequestAnalysis}
          />
        )}

        {/* Stakeholders Tab */}
        {activeTab === 'stakeholders' && (
          <StakeholderMatrix stakeholders={stakeholders} />
        )}
      </div>
    </div>
  );
};

export default DecisionSupport;
