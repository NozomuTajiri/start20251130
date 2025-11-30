/**
 * Leadership Program View Component
 * 5.11 リーダーシップ開発プログラム
 */

'use client';

import React, { useState, useMemo } from 'react';
import type {
  LeadershipProgram,
  LeadershipCompetency,
  ProgramModule,
  Participant,
  LeadershipAssessment,
  ProgramMetric,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface LeadershipProgramViewProps {
  program?: LeadershipProgram;
  onParticipantClick?: (participantId: string) => void;
  onModuleClick?: (moduleId: string) => void;
  onStartAssessment?: (assessmentId: string, participantId: string) => void;
  onExportReport?: (type: 'individual' | 'program') => void;
  className?: string;
}

type ViewTab = 'overview' | 'modules' | 'participants' | 'competencies' | 'assessments';

// ========================================
// Sub-Components
// ========================================

const ProgramMetricCard: React.FC<{
  metric: ProgramMetric;
}> = ({ metric }) => {
  const progress = (metric.value / metric.target) * 100;
  const isOnTrack = progress >= 90;

  const lastTrend = metric.trend.length >= 2
    ? metric.trend[metric.trend.length - 1] - metric.trend[metric.trend.length - 2]
    : 0;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-gray-500">{metric.name}</p>
        <span className={`text-xs ${lastTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {lastTrend >= 0 ? '↑' : '↓'} {Math.abs(lastTrend).toFixed(1)}
        </span>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className={`text-2xl font-bold ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
          {metric.value.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400">/ {metric.target}</span>
      </div>

      <div className="mt-2 h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${isOnTrack ? 'bg-green-500' : 'bg-orange-500'}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Mini trend chart */}
      {metric.trend.length > 0 && (
        <div className="mt-3 flex items-end space-x-0.5 h-8">
          {metric.trend.slice(-10).map((value, idx) => {
            const maxValue = Math.max(...metric.trend);
            const height = (value / maxValue) * 100;
            return (
              <div
                key={idx}
                className="flex-1 bg-blue-200 rounded-t"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const CompetencyCard: React.FC<{
  competency: LeadershipCompetency;
  onClick?: () => void;
}> = ({ competency, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <h4 className="font-medium text-gray-800 mb-2">{competency.name}</h4>
        <p className="text-sm text-gray-600 mb-3">{competency.description}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          {isExpanded ? 'Hide levels' : `View ${competency.levels.length} levels`}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            {competency.levels.map((level) => (
              <div key={level.level} className="p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {level.level}
                  </span>
                  <span className="font-medium text-gray-700">{level.name}</span>
                </div>
                <p className="text-xs text-gray-500 ml-8">{level.description}</p>
              </div>
            ))}
          </div>
        )}

        {competency.behaviors.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 mb-1">Key Behaviors:</p>
            <div className="flex flex-wrap gap-1">
              {competency.behaviors.slice(0, 3).map((behavior, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded"
                >
                  {behavior}
                </span>
              ))}
              {competency.behaviors.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{competency.behaviors.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{
  module: ProgramModule;
  onClick?: () => void;
}> = ({ module, onClick }) => {
  const formatIcons: Record<string, string> = {
    workshop: '🏫',
    coaching: '🎯',
    online: '💻',
    project: '📊',
    assessment: '📝',
  };

  return (
    <div
      className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{formatIcons[module.format]}</span>
            <h4 className="font-medium text-gray-800">{module.name}</h4>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {module.duration}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3">{module.description}</p>

        {/* Competencies covered */}
        <div className="flex flex-wrap gap-1 mb-3">
          {module.competencies.map((comp) => (
            <span
              key={comp}
              className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded"
            >
              {comp}
            </span>
          ))}
        </div>

        {/* Materials and Activities count */}
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>📚 {module.materials.length} materials</span>
          <span>🎯 {module.activities.length} activities</span>
        </div>
      </div>
    </div>
  );
};

const ParticipantCard: React.FC<{
  participant: Participant;
  onClick?: () => void;
}> = ({ participant, onClick }) => {
  const completedCount = participant.progress.completedModules.length;
  const latestAssessment = participant.assessmentResults[participant.assessmentResults.length - 1];

  return (
    <div
      className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium text-gray-800">{participant.name}</h4>
            <p className="text-sm text-gray-500">{participant.role}</p>
            <p className="text-xs text-gray-400">{participant.department}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {participant.progress.overallProgress}%
            </div>
            <span className="text-xs text-gray-400">progress</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${participant.progress.overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completedCount} modules completed
            {participant.progress.currentModule && (
              <span> • Current: {participant.progress.currentModule}</span>
            )}
          </p>
        </div>

        {/* Latest Assessment */}
        {latestAssessment && (
          <div className="p-2 bg-gray-50 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Latest Assessment</span>
              <span className="text-sm font-bold text-gray-800">
                {latestAssessment.overallScore.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {latestAssessment.strengths.slice(0, 2).map((s, idx) => (
                <span key={idx} className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Next Milestone */}
        {participant.progress.nextMilestone && (
          <p className="text-xs text-gray-400 mt-2">
            Next: {participant.progress.nextMilestone}
          </p>
        )}
      </div>
    </div>
  );
};

const AssessmentCard: React.FC<{
  assessment: LeadershipAssessment;
  onStart?: () => void;
}> = ({ assessment, onStart }) => {
  const typeLabels: Record<string, string> = {
    '360-feedback': '360° Feedback',
    'self-assessment': 'Self Assessment',
    simulation: 'Simulation',
    observation: 'Observation',
  };

  const typeColors: Record<string, string> = {
    '360-feedback': 'bg-purple-100 text-purple-700',
    'self-assessment': 'bg-blue-100 text-blue-700',
    simulation: 'bg-green-100 text-green-700',
    observation: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">{assessment.name}</h4>
        <span className={`px-2 py-0.5 rounded text-xs ${typeColors[assessment.type]}`}>
          {typeLabels[assessment.type]}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Competencies Assessed:</p>
        <div className="flex flex-wrap gap-1">
          {assessment.competencies.map((comp) => (
            <span
              key={comp}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {comp}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{assessment.questions.length} questions</span>
        {onStart && (
          <button
            onClick={onStart}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Start Assessment
          </button>
        )}
      </div>
    </div>
  );
};

const ParticipantDetailPanel: React.FC<{
  participant: Participant;
  competencies: LeadershipCompetency[];
  onClose: () => void;
}> = ({ participant, competencies, onClose }) => {
  const latestResults = participant.assessmentResults[participant.assessmentResults.length - 1];

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-40 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Participant Profile</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          ✕
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-800">{participant.name}</h3>
          <p className="text-gray-600">{participant.role}</p>
          <p className="text-sm text-gray-500">{participant.department}</p>
          <p className="text-xs text-gray-400 mt-1">
            Enrolled: {new Date(participant.enrolledDate).toLocaleDateString()}
          </p>
        </div>

        {/* Progress */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Progress</h4>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <span className="text-lg font-bold text-blue-600">
                {participant.progress.overallProgress}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${participant.progress.overallProgress}%` }}
              />
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="text-green-600 font-medium">
                  {participant.progress.completedModules.length}
                </span>{' '}
                modules completed
              </p>
              {participant.progress.currentModule && (
                <p className="text-sm text-gray-600">
                  Currently in: <span className="font-medium">{participant.progress.currentModule}</span>
                </p>
              )}
              {participant.progress.nextMilestone && (
                <p className="text-sm text-gray-600">
                  Next milestone: <span className="font-medium">{participant.progress.nextMilestone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Latest Assessment Results */}
        {latestResults && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Latest Assessment</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">
                  {new Date(latestResults.date).toLocaleDateString()}
                </span>
                <span className="text-2xl font-bold text-gray-800">
                  {latestResults.overallScore.toFixed(1)}
                </span>
              </div>

              {/* Competency Scores */}
              <div className="space-y-2 mb-4">
                {Object.entries(latestResults.scores).map(([compId, score]) => {
                  const comp = competencies.find((c) => c.id === compId);
                  return (
                    <div key={compId} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 flex-1">
                        {comp?.name || compId}
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-8">
                        {score.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Strengths */}
              {latestResults.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Strengths:</p>
                  <div className="flex flex-wrap gap-1">
                    {latestResults.strengths.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Development Areas */}
              {latestResults.developmentAreas.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Development Areas:</p>
                  <div className="flex flex-wrap gap-1">
                    {latestResults.developmentAreas.map((d, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {latestResults.feedback && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-xs text-gray-500 mb-1">Feedback:</p>
                  <p className="text-sm text-gray-600">{latestResults.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessment History */}
        {participant.assessmentResults.length > 1 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Assessment History</h4>
            <div className="space-y-2">
              {participant.assessmentResults.slice(0, -1).reverse().map((result, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    {new Date(result.date).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-gray-800">{result.overallScore.toFixed(1)}</span>
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

export const LeadershipProgramView: React.FC<LeadershipProgramViewProps> = ({
  program,
  onParticipantClick,
  onModuleClick,
  onStartAssessment,
  onExportReport,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const selectedParticipant = useMemo(
    () => program?.participants.find((p) => p.id === selectedParticipantId),
    [program, selectedParticipantId]
  );

  if (!program) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <p>Loading leadership program...</p>
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
              <h1 className="text-2xl font-bold text-gray-800">{program.name}</h1>
              <p className="text-gray-600 mt-1">{program.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>👥 {program.participants.length} participants</span>
                <span>📚 {program.modules.length} modules</span>
                <span>🎯 {program.competencies.length} competencies</span>
              </div>
            </div>

            {onExportReport && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onExportReport('program')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Program Report
                </button>
                <button
                  onClick={() => onExportReport('individual')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Individual Reports
                </button>
              </div>
            )}
          </div>

          {/* Target Audience */}
          <div className="flex flex-wrap gap-1 mt-3">
            {program.targetAudience.map((audience) => (
              <span
                key={audience}
                className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded"
              >
                {audience}
              </span>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {(['overview', 'modules', 'participants', 'competencies', 'assessments'] as ViewTab[]).map((tab) => (
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
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {program.metrics.map((metric, idx) => (
                <ProgramMetricCard key={idx} metric={metric} />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-800 mb-3">Completion Rate</h4>
                <div className="text-center">
                  <span className="text-4xl font-bold text-green-600">
                    {(
                      (program.participants.filter((p) => p.progress.overallProgress === 100).length /
                        program.participants.length) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {program.participants.filter((p) => p.progress.overallProgress === 100).length} /{' '}
                    {program.participants.length} completed
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-800 mb-3">Average Progress</h4>
                <div className="text-center">
                  <span className="text-4xl font-bold text-blue-600">
                    {(
                      program.participants.reduce((sum, p) => sum + p.progress.overallProgress, 0) /
                      program.participants.length
                    ).toFixed(0)}
                    %
                  </span>
                  <p className="text-sm text-gray-500 mt-1">across all participants</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-800 mb-3">Average Score</h4>
                <div className="text-center">
                  <span className="text-4xl font-bold text-purple-600">
                    {(
                      program.participants
                        .filter((p) => p.assessmentResults.length > 0)
                        .reduce(
                          (sum, p) =>
                            sum + p.assessmentResults[p.assessmentResults.length - 1].overallScore,
                          0
                        ) /
                      program.participants.filter((p) => p.assessmentResults.length > 0).length
                    ).toFixed(1)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">latest assessment average</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {program.modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onClick={() => onModuleClick?.(module.id)}
              />
            ))}
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {program.participants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onClick={() => {
                  setSelectedParticipantId(participant.id);
                  onParticipantClick?.(participant.id);
                }}
              />
            ))}
          </div>
        )}

        {/* Competencies Tab */}
        {activeTab === 'competencies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.competencies.map((competency) => (
              <CompetencyCard key={competency.id} competency={competency} />
            ))}
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.assessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onStart={
                  onStartAssessment
                    ? () => onStartAssessment(assessment.id, program.participants[0]?.id || '')
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Participant Detail Panel */}
      {selectedParticipant && (
        <ParticipantDetailPanel
          participant={selectedParticipant}
          competencies={program.competencies}
          onClose={() => setSelectedParticipantId(null)}
        />
      )}
    </div>
  );
};

export default LeadershipProgramView;
