/**
 * Organization Blueprint View Component
 * 5.9 組織設計ブループリント
 */

'use client';

import React, { useState, useMemo } from 'react';
import type {
  OrganizationBlueprint,
  BlueprintRole,
  BlueprintProcess,
  OrganizationalUnit,
  GovernanceModel,
  CultureDefinition,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface OrganizationBlueprintViewProps {
  blueprint?: OrganizationBlueprint;
  onUnitClick?: (unitId: string) => void;
  onRoleClick?: (roleId: string) => void;
  onProcessClick?: (processId: string) => void;
  onExport?: (format: 'pdf' | 'pptx') => void;
  className?: string;
}

type ViewTab = 'structure' | 'roles' | 'processes' | 'governance' | 'culture';

// ========================================
// Sub-Components
// ========================================

const UnitCard: React.FC<{
  unit: OrganizationalUnit;
  level: number;
  childUnits: OrganizationalUnit[];
  onClick: () => void;
  onChildClick: (unitId: string) => void;
}> = ({ unit, level, childUnits, onClick, onChildClick }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const typeColors: Record<string, string> = {
    division: 'border-l-purple-500 bg-purple-50',
    department: 'border-l-blue-500 bg-blue-50',
    team: 'border-l-green-500 bg-green-50',
    squad: 'border-l-orange-500 bg-orange-50',
    guild: 'border-l-pink-500 bg-pink-50',
  };

  return (
    <div className={`border-l-4 rounded-lg ${typeColors[unit.type] || 'border-l-gray-500 bg-gray-50'}`}>
      <button
        onClick={() => {
          onClick();
          if (childUnits.length > 0) {
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full p-4 text-left"
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-800">{unit.name}</h4>
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-white rounded">
                {unit.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{unit.purpose}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {unit.headcount.current}/{unit.headcount.planned}
            </div>
            <span className="text-xs text-gray-400">headcount</span>
          </div>
        </div>

        {unit.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {unit.capabilities.slice(0, 4).map((cap) => (
              <span
                key={cap}
                className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded"
              >
                {cap}
              </span>
            ))}
            {unit.capabilities.length > 4 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">
                +{unit.capabilities.length - 4} more
              </span>
            )}
          </div>
        )}

        {childUnits.length > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            {isExpanded ? '▼' : '▶'} {childUnits.length} sub-units
          </div>
        )}
      </button>

      {isExpanded && childUnits.length > 0 && (
        <div className="pl-4 pb-4 space-y-2">
          {childUnits.map((child) => (
            <UnitCard
              key={child.id}
              unit={child}
              level={level + 1}
              childUnits={[]}
              onClick={() => onChildClick(child.id)}
              onChildClick={onChildClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RoleCard: React.FC<{
  role: BlueprintRole;
  unitName?: string;
  onClick: () => void;
}> = ({ role, unitName, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-800">{role.title}</h4>
          {unitName && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {unitName}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          {isExpanded ? 'Hide details' : 'Show details'}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            {/* Responsibilities */}
            {role.responsibilities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Responsibilities</p>
                <ul className="text-sm text-gray-600 space-y-0.5">
                  {role.responsibilities.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Authorities */}
            {role.authorities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Authorities</p>
                <ul className="text-sm text-gray-600 space-y-0.5">
                  {role.authorities.map((a, i) => (
                    <li key={i}>✓ {a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Competencies */}
            {role.competencies.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Required Competencies</p>
                <div className="flex flex-wrap gap-1">
                  {role.competencies.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ProcessCard: React.FC<{
  process: BlueprintProcess;
  onClick: () => void;
}> = ({ process, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-800">{process.name}</h4>
          <span className="text-xs text-gray-500">Owner: {process.owner}</span>
        </div>

        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
          <span>📥 {process.inputs.length} inputs</span>
          <span>📤 {process.outputs.length} outputs</span>
          <span>📊 {process.metrics.length} metrics</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          {isExpanded ? 'Hide steps' : `Show ${process.steps.length} steps`}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            {process.steps.map((step, idx) => (
              <div key={step.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-700">{step.name}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                    <span>👤 {step.responsible}</span>
                    <span>⏱️ {step.duration}</span>
                  </div>
                  {step.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {step.tools.map((tool) => (
                        <span key={tool} className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const GovernanceView: React.FC<{
  governance: GovernanceModel;
}> = ({ governance }) => {
  return (
    <div className="space-y-6">
      {/* Decision Framework */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">Decision Framework</h4>
        <div className="space-y-3">
          {governance.decisionFramework.levels.map((level, idx) => (
            <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-700">{level.name}</p>
                <p className="text-sm text-gray-500">{level.scope}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{level.authority}</p>
                <span className={`text-xs ${level.approvalRequired ? 'text-orange-600' : 'text-green-600'}`}>
                  {level.approvalRequired ? 'Approval required' : 'Autonomous'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Escalation Path:</p>
          <div className="flex items-center space-x-2 flex-wrap">
            {governance.decisionFramework.escalationPath.map((step, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                  {step}
                </span>
                {idx < governance.decisionFramework.escalationPath.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Committees */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">Committees</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {governance.committees.map((committee, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded">
              <h5 className="font-medium text-gray-700">{committee.name}</h5>
              <p className="text-sm text-gray-500 mt-1">{committee.purpose}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>👥 {committee.members.length} members</span>
                <span>🗓️ {committee.meetingFrequency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policies */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">Key Policies</h4>
        <div className="space-y-2">
          {governance.policies.map((policy, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-700">{policy.name}</h5>
                  <p className="text-sm text-gray-500 mt-1">{policy.description}</p>
                </div>
                <span className="text-xs text-gray-400">{policy.owner}</span>
              </div>
              <span className="text-xs text-gray-400 mt-2 block">Scope: {policy.scope}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CultureView: React.FC<{
  culture: CultureDefinition;
}> = ({ culture }) => {
  return (
    <div className="space-y-6">
      {/* Values */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">Core Values</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {culture.values.map((value, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <h5 className="font-bold text-gray-800">{value.name}</h5>
              <p className="text-sm text-gray-600 mt-1">{value.description}</p>
              {value.manifestations.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">How we live this value:</p>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {value.manifestations.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Behaviors */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">Expected Behaviors</h4>
        <div className="space-y-3">
          {culture.behaviors.map((behavior, idx) => (
            <div key={idx} className="p-3 bg-green-50 rounded">
              <p className="font-medium text-green-800">{behavior.behavior}</p>
              <p className="text-sm text-gray-600 mt-1">Context: {behavior.context}</p>
              {behavior.examples.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {behavior.examples.map((ex, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white text-green-700 text-xs rounded">
                      {ex}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Norms */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-800 mb-4">Cultural Norms</h4>
        <div className="space-y-2">
          {culture.norms.map((norm, idx) => (
            <div key={idx} className="p-3 bg-blue-50 rounded">
              <p className="font-medium text-blue-800">{norm.norm}</p>
              <p className="text-sm text-gray-600 mt-1">{norm.rationale}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================
// Main Component
// ========================================

export const OrganizationBlueprintView: React.FC<OrganizationBlueprintViewProps> = ({
  blueprint,
  onUnitClick,
  onRoleClick,
  onProcessClick,
  onExport,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('structure');

  const unitMap = useMemo(() => {
    if (!blueprint) return new Map<string, OrganizationalUnit>();
    return new Map(blueprint.structure.units.map((u) => [u.id, u]));
  }, [blueprint]);

  const rootUnits = useMemo(() => {
    if (!blueprint) return [];
    return blueprint.structure.units.filter((u) => !u.parentId);
  }, [blueprint]);

  const getChildUnits = (parentId: string): OrganizationalUnit[] => {
    if (!blueprint) return [];
    return blueprint.structure.units.filter((u) => u.parentId === parentId);
  };

  if (!blueprint) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <p>Loading organization blueprint...</p>
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
              <h1 className="text-2xl font-bold text-gray-800">{blueprint.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Version {blueprint.version} • {blueprint.structure.type} structure
              </p>
            </div>

            {onExport && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onExport('pdf')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => onExport('pptx')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Export PPTX
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {(['structure', 'roles', 'processes', 'governance', 'culture'] as ViewTab[]).map((tab) => (
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
        {/* Structure Tab */}
        {activeTab === 'structure' && (
          <div className="space-y-4">
            {rootUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                level={0}
                childUnits={getChildUnits(unit.id)}
                onClick={() => onUnitClick?.(unit.id)}
                onChildClick={(unitId) => onUnitClick?.(unitId)}
              />
            ))}
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blueprint.roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                unitName={unitMap.get(role.unitId)?.name}
                onClick={() => onRoleClick?.(role.id)}
              />
            ))}
          </div>
        )}

        {/* Processes Tab */}
        {activeTab === 'processes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blueprint.processes.map((process) => (
              <ProcessCard
                key={process.id}
                process={process}
                onClick={() => onProcessClick?.(process.id)}
              />
            ))}
          </div>
        )}

        {/* Governance Tab */}
        {activeTab === 'governance' && (
          <GovernanceView governance={blueprint.governance} />
        )}

        {/* Culture Tab */}
        {activeTab === 'culture' && (
          <CultureView culture={blueprint.culture} />
        )}
      </div>
    </div>
  );
};

export default OrganizationBlueprintView;
