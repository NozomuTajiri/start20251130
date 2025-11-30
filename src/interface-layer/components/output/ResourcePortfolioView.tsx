/**
 * Resource Portfolio View Component
 * 5.10 資源配分ポートフォリオ
 */

'use client';

import React, { useState, useMemo } from 'react';
import type {
  ResourcePortfolio,
  ResourceAllocation,
  Initiative,
  ResourceConstraint,
  OptimizationResult,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface ResourcePortfolioViewProps {
  portfolio?: ResourcePortfolio;
  onInitiativeClick?: (initiativeId: string) => void;
  onOptimize?: () => void;
  onApplyRecommendation?: (recommendationId: string) => void;
  onExport?: () => void;
  className?: string;
}

type ViewTab = 'overview' | 'allocations' | 'initiatives' | 'optimization';

// ========================================
// Sub-Components
// ========================================

const BudgetSummary: React.FC<{
  totalBudget: number;
  allocations: ResourceAllocation[];
}> = ({ totalBudget, allocations }) => {
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0);
  const totalUtilized = allocations.reduce((sum, a) => sum + a.utilized, 0);
  const remainingBudget = totalBudget - totalAllocated;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <p className="text-sm text-gray-500">Total Budget</p>
        <p className="text-2xl font-bold text-gray-800">
          ${totalBudget.toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <p className="text-sm text-gray-500">Allocated</p>
        <p className="text-2xl font-bold text-blue-600">
          ${totalAllocated.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">
          {((totalAllocated / totalBudget) * 100).toFixed(1)}% of budget
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <p className="text-sm text-gray-500">Utilized</p>
        <p className="text-2xl font-bold text-green-600">
          ${totalUtilized.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">
          {((totalUtilized / totalAllocated) * 100).toFixed(1)}% utilization
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <p className="text-sm text-gray-500">Remaining</p>
        <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
          ${Math.abs(remainingBudget).toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">
          {remainingBudget >= 0 ? 'available' : 'over budget'}
        </p>
      </div>
    </div>
  );
};

const AllocationChart: React.FC<{
  allocations: ResourceAllocation[];
}> = ({ allocations }) => {
  const total = allocations.reduce((sum, a) => sum + a.allocated, 0);

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-yellow-500',
    'bg-red-500',
  ];

  return (
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-medium text-gray-800 mb-4">Allocation Distribution</h4>

      {/* Bar Chart */}
      <div className="h-8 flex rounded-lg overflow-hidden mb-4">
        {allocations.map((allocation, idx) => {
          const percentage = (allocation.allocated / total) * 100;
          return (
            <div
              key={allocation.id}
              className={`${colors[idx % colors.length]} relative group`}
              style={{ width: `${percentage}%` }}
              title={`${allocation.category}: $${allocation.allocated.toLocaleString()}`}
            >
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                {allocation.category}: {percentage.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {allocations.map((allocation, idx) => (
          <div key={allocation.id} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded ${colors[idx % colors.length]}`} />
            <span className="text-sm text-gray-600">{allocation.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AllocationCard: React.FC<{
  allocation: ResourceAllocation;
}> = ({ allocation }) => {
  const utilizationRate = (allocation.utilized / allocation.allocated) * 100;
  const variancePercent = (allocation.variance / allocation.allocated) * 100;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-800">{allocation.category}</h4>
        <span
          className={`text-sm font-medium ${
            variancePercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {variancePercent >= 0 ? '+' : ''}{variancePercent.toFixed(1)}%
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Allocated</span>
            <span className="text-gray-800">${allocation.allocated.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Utilized</span>
            <span className="text-gray-800">${allocation.utilized.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Planned</span>
            <span className="text-gray-800">${allocation.planned.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Utilization</span>
            <span>{utilizationRate.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={`h-full rounded-full ${
                utilizationRate >= 90
                  ? 'bg-green-500'
                  : utilizationRate >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, utilizationRate)}%` }}
            />
          </div>
        </div>

        {/* Breakdown */}
        {allocation.breakdown.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500 mb-2">Breakdown</p>
            <div className="space-y-1">
              {allocation.breakdown.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-gray-600">{item.item}</span>
                  <span className="text-gray-500">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InitiativeCard: React.FC<{
  initiative: Initiative;
  onClick: () => void;
}> = ({ initiative, onClick }) => {
  const budgetProgress = (initiative.spent / initiative.budget) * 100;
  const roi = initiative.actualReturn
    ? ((initiative.actualReturn - initiative.spent) / initiative.spent) * 100
    : null;

  const statusColors = {
    proposed: 'bg-gray-100 text-gray-600',
    approved: 'bg-blue-100 text-blue-600',
    active: 'bg-green-100 text-green-600',
    completed: 'bg-purple-100 text-purple-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div
      className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-800">{initiative.name}</h4>
            <span className="text-xs text-gray-400">P{initiative.priority}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[initiative.status]}`}>
            {initiative.status}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{initiative.description}</p>

        {/* Budget Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Budget</span>
            <span className="text-gray-700">
              ${initiative.spent.toLocaleString()} / ${initiative.budget.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={`h-full rounded-full ${
                budgetProgress > 100
                  ? 'bg-red-500'
                  : budgetProgress >= 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, budgetProgress)}%` }}
            />
          </div>
        </div>

        {/* ROI and Timeline */}
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="text-gray-500">Expected ROI: </span>
            <span className="font-medium text-gray-700">
              {((initiative.expectedReturn / initiative.budget - 1) * 100).toFixed(0)}%
            </span>
            {roi !== null && (
              <span className={`ml-2 ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                (Actual: {roi.toFixed(0)}%)
              </span>
            )}
          </div>
          <span className="text-gray-400">
            {new Date(initiative.timeline.startDate).toLocaleDateString()} -{' '}
            {new Date(initiative.timeline.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Milestones */}
      {initiative.timeline.milestones.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t flex items-center space-x-4 overflow-x-auto">
          {initiative.timeline.milestones.map((milestone, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-1 text-xs whitespace-nowrap ${
                milestone.status === 'completed'
                  ? 'text-green-600'
                  : milestone.status === 'delayed'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              <span>
                {milestone.status === 'completed'
                  ? '✓'
                  : milestone.status === 'delayed'
                  ? '⚠'
                  : '○'}
              </span>
              <span>{milestone.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ConstraintCard: React.FC<{
  constraint: ResourceConstraint;
}> = ({ constraint }) => {
  const utilization = (constraint.current / constraint.limit) * 100;
  const isNearLimit = utilization >= 80;
  const isOverLimit = utilization > 100;

  return (
    <div
      className={`p-3 rounded-lg border ${
        isOverLimit
          ? 'border-red-300 bg-red-50'
          : isNearLimit
          ? 'border-yellow-300 bg-yellow-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-800">{constraint.type}</p>
          <p className="text-xs text-gray-500">{constraint.description}</p>
        </div>
        <span
          className={`text-sm font-bold ${
            isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
          }`}
        >
          {utilization.toFixed(0)}%
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${
            isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(100, utilization)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{constraint.current.toLocaleString()}</span>
        <span>{constraint.limit.toLocaleString()}</span>
      </div>
    </div>
  );
};

const OptimizationPanel: React.FC<{
  optimization: OptimizationResult;
  onApply?: (recommendationId: string) => void;
}> = ({ optimization, onApply }) => {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-sm text-gray-500">Potential Savings</p>
          <p className="text-2xl font-bold text-green-600">
            ${optimization.potentialSavings.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-sm text-gray-500">Efficiency Gain</p>
          <p className="text-2xl font-bold text-blue-600">
            {optimization.efficiencyGain.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-sm text-gray-500">Recommendations</p>
          <p className="text-2xl font-bold text-gray-800">
            {optimization.recommendedAllocations.length}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">Recommended Reallocations</h4>
        <div className="space-y-3">
          {optimization.recommendedAllocations.map((rec, idx) => {
            const change = rec.recommendedAmount - rec.currentAmount;
            const changePercent = (change / rec.currentAmount) * 100;

            return (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-700">{rec.category}</h5>
                  <span
                    className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm mb-2">
                  <span className="text-gray-500">
                    Current: ${rec.currentAmount.toLocaleString()}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-800 font-medium">
                    Recommended: ${rec.recommendedAmount.toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{rec.rationale}</p>

                {onApply && (
                  <button
                    onClick={() => onApply(`rec-${idx}`)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Apply Recommendation
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trade-offs */}
      {optimization.tradeoffs.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium text-gray-800 mb-4">Trade-offs to Consider</h4>
          <div className="space-y-2">
            {optimization.tradeoffs.map((tradeoff, idx) => (
              <div key={idx} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="font-medium text-yellow-800">{tradeoff.option}</p>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-green-600">✓ Benefit: </span>
                    <span className="text-gray-600">{tradeoff.benefit}</span>
                  </div>
                  <div>
                    <span className="text-red-600">✗ Cost: </span>
                    <span className="text-gray-600">{tradeoff.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// Main Component
// ========================================

export const ResourcePortfolioView: React.FC<ResourcePortfolioViewProps> = ({
  portfolio,
  onInitiativeClick,
  onOptimize,
  onApplyRecommendation,
  onExport,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [initiativeFilter, setInitiativeFilter] = useState<Initiative['status'] | 'all'>('all');

  const filteredInitiatives = useMemo(() => {
    if (!portfolio) return [];
    if (initiativeFilter === 'all') return portfolio.initiatives;
    return portfolio.initiatives.filter((i) => i.status === initiativeFilter);
  }, [portfolio, initiativeFilter]);

  if (!portfolio) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <p>Loading resource portfolio...</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{portfolio.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(portfolio.period.start).toLocaleDateString()} -{' '}
                {new Date(portfolio.period.end).toLocaleDateString()}
              </p>
            </div>

            <div className="flex space-x-2">
              {onOptimize && (
                <button
                  onClick={onOptimize}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Run Optimization
                </button>
              )}
              {onExport && (
                <button
                  onClick={onExport}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Export
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {(['overview', 'allocations', 'initiatives', 'optimization'] as ViewTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === tab
                    ? 'bg-gray-50 text-blue-600 border-t border-x border-gray-200'
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <BudgetSummary
              totalBudget={portfolio.totalBudget}
              allocations={portfolio.allocations}
            />
            <AllocationChart allocations={portfolio.allocations} />

            {/* Constraints */}
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-medium text-gray-800 mb-4">Resource Constraints</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolio.constraints.map((constraint, idx) => (
                  <ConstraintCard key={idx} constraint={constraint} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Allocations Tab */}
        {activeTab === 'allocations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.allocations.map((allocation) => (
              <AllocationCard key={allocation.id} allocation={allocation} />
            ))}
          </div>
        )}

        {/* Initiatives Tab */}
        {activeTab === 'initiatives' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex justify-between items-center">
              <select
                value={initiativeFilter}
                onChange={(e) => setInitiativeFilter(e.target.value as typeof initiativeFilter)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="proposed">Proposed</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="text-sm text-gray-500">
                {filteredInitiatives.length} initiative{filteredInitiatives.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Initiative List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInitiatives.map((initiative) => (
                <InitiativeCard
                  key={initiative.id}
                  initiative={initiative}
                  onClick={() => onInitiativeClick?.(initiative.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <OptimizationPanel
            optimization={portfolio.optimization}
            onApply={onApplyRecommendation}
          />
        )}
      </div>
    </div>
  );
};

export default ResourcePortfolioView;
