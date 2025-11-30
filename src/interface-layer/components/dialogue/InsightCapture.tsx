/**
 * Insight Capture Component
 * 5.6 洞察キャプチャUI
 */

'use client';

import React, { useState, useCallback } from 'react';
import type {
  InsightCapture as InsightCaptureType,
  InsightSource,
  LinkedEntity,
  InsightCaptureForm,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface InsightCaptureProps {
  insights?: InsightCaptureType[];
  availableEntities?: LinkedEntity[];
  currentUser?: string;
  onSaveInsight?: (insight: InsightCaptureForm) => void;
  onUpdateInsight?: (id: string, updates: Partial<InsightCaptureType>) => void;
  onDeleteInsight?: (id: string) => void;
  onPublishInsight?: (id: string) => void;
  className?: string;
}

// ========================================
// Sub-Components
// ========================================

const InsightTypeSelector: React.FC<{
  value: InsightCaptureType['type'];
  onChange: (type: InsightCaptureType['type']) => void;
}> = ({ value, onChange }) => {
  const types: { value: InsightCaptureType['type']; label: string; icon: string; description: string }[] = [
    { value: 'observation', label: 'Observation', icon: '👁️', description: 'Something noticed or observed' },
    { value: 'hypothesis', label: 'Hypothesis', icon: '🔬', description: 'A proposed explanation to test' },
    { value: 'recommendation', label: 'Recommendation', icon: '💡', description: 'A suggested action or change' },
    { value: 'question', label: 'Question', icon: '❓', description: 'An open question to explore' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => onChange(type.value)}
          className={`p-3 rounded-lg border-2 text-left transition-all ${
            value === type.value
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 mb-1">
            <span>{type.icon}</span>
            <span className="font-medium text-gray-800">{type.label}</span>
          </div>
          <p className="text-xs text-gray-500">{type.description}</p>
        </button>
      ))}
    </div>
  );
};

const SourceSelector: React.FC<{
  value: InsightSource;
  onChange: (source: InsightSource) => void;
}> = ({ value, onChange }) => {
  const sourceTypes: InsightSource['type'][] = ['meeting', 'report', 'conversation', 'analysis', 'external'];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
        <select
          value={value.type}
          onChange={(e) => onChange({ ...value, type: e.target.value as InsightSource['type'] })}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {sourceTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reference (optional)</label>
        <input
          type="text"
          value={value.reference || ''}
          onChange={(e) => onChange({ ...value, reference: e.target.value })}
          placeholder="e.g., Meeting notes, Report name, URL"
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date (optional)</label>
        <input
          type="date"
          value={value.date ? new Date(value.date).toISOString().split('T')[0] : ''}
          onChange={(e) => onChange({ ...value, date: e.target.value ? new Date(e.target.value) : undefined })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
    </div>
  );
};

const EntityLinker: React.FC<{
  selectedIds: string[];
  availableEntities: LinkedEntity[];
  onChange: (ids: string[]) => void;
}> = ({ selectedIds, availableEntities, onChange }) => {
  const entityTypeIcons: Record<LinkedEntity['type'], string> = {
    objective: '🎯',
    kpi: '📊',
    initiative: '🚀',
    risk: '⚠️',
    opportunity: '✨',
  };

  const groupedEntities = availableEntities.reduce((acc, entity) => {
    if (!acc[entity.type]) acc[entity.type] = [];
    acc[entity.type].push(entity);
    return acc;
  }, {} as Record<string, LinkedEntity[]>);

  const toggleEntity = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(groupedEntities).map(([type, entities]) => (
        <div key={type}>
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase">{type}s</p>
          <div className="flex flex-wrap gap-2">
            {entities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                onClick={() => toggleEntity(entity.id)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center space-x-1 transition-colors ${
                  selectedIds.includes(entity.id)
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                <span>{entityTypeIcons[entity.type as LinkedEntity['type']]}</span>
                <span>{entity.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {availableEntities.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No entities available to link
        </p>
      )}
    </div>
  );
};

const InsightCard: React.FC<{
  insight: InsightCaptureType;
  onEdit: () => void;
  onDelete: () => void;
  onPublish?: () => void;
}> = ({ insight, onEdit, onDelete, onPublish }) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-yellow-100 text-yellow-600',
    reviewed: 'bg-blue-100 text-blue-600',
    published: 'bg-green-100 text-green-600',
  };

  const typeIcons = {
    observation: '👁️',
    hypothesis: '🔬',
    recommendation: '💡',
    question: '❓',
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{typeIcons[insight.type]}</span>
          <h4 className="font-medium text-gray-800">{insight.title}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[insight.status]}`}>
          {insight.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{insight.content}</p>

      {/* Tags */}
      {insight.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {insight.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Linked Entities */}
      {insight.linkedEntities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {insight.linkedEntities.map((entity) => (
            <span
              key={entity.id}
              className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
            >
              {entity.name}
            </span>
          ))}
        </div>
      )}

      {/* Source Info */}
      <div className="text-xs text-gray-400 mb-3">
        Source: {insight.source.type}
        {insight.source.reference && ` • ${insight.source.reference}`}
        {insight.source.date && ` • ${new Date(insight.source.date).toLocaleDateString()}`}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-3 border-t">
        <span className="text-xs text-gray-400">
          {insight.createdBy} • {new Date(insight.createdAt).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          {insight.status === 'draft' && onPublish && (
            <button
              onClick={onPublish}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Publish
            </button>
          )}
          <button
            onClick={onEdit}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const InsightForm: React.FC<{
  initialData?: Partial<InsightCaptureType>;
  availableEntities: LinkedEntity[];
  onSave: (data: InsightCaptureForm) => void;
  onCancel: () => void;
}> = ({ initialData, availableEntities, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [type, setType] = useState<InsightCaptureType['type']>(initialData?.type || 'observation');
  const [source, setSource] = useState<InsightSource>(initialData?.source || { type: 'meeting' });
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [linkedEntities, setLinkedEntities] = useState<string[]>(
    initialData?.linkedEntities?.map((e) => e.id) || []
  );
  const [step, setStep] = useState(1);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = () => {
    onSave({
      title,
      content,
      type,
      tags,
      linkedEntities,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!type;
      case 2:
        return !!title.trim() && !!content.trim();
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Progress Steps */}
      <div className="flex border-b">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 py-3 text-center text-sm ${
              step === s
                ? 'bg-blue-50 text-blue-600 font-medium border-b-2 border-blue-500'
                : step > s
                ? 'bg-green-50 text-green-600'
                : 'text-gray-400'
            }`}
          >
            {s === 1 ? 'Type' : s === 2 ? 'Content' : 'Links'}
          </div>
        ))}
      </div>

      <div className="p-6">
        {/* Step 1: Type Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">What type of insight is this?</h3>
            <InsightTypeSelector value={type} onChange={setType} />
          </div>
        )}

        {/* Step 2: Content */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Describe your insight</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title for your insight"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Describe your insight in detail..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border rounded-lg"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <SourceSelector value={source} onChange={setSource} />
          </div>
        )}

        {/* Step 3: Entity Linking */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Link to related items (optional)</h3>
            <EntityLinker
              selectedIds={linkedEntities}
              availableEntities={availableEntities}
              onChange={setLinkedEntities}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 border-t flex justify-between">
        <button
          onClick={step > 1 ? () => setStep(step - 1) : onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {step > 1 ? 'Back' : 'Cancel'}
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Insight
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================
// Main Component
// ========================================

export const InsightCapture: React.FC<InsightCaptureProps> = ({
  insights = [],
  availableEntities = [],
  currentUser,
  onSaveInsight,
  onUpdateInsight,
  onDeleteInsight,
  onPublishInsight,
  className = '',
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingInsight, setEditingInsight] = useState<InsightCaptureType | null>(null);
  const [filter, setFilter] = useState<InsightCaptureType['type'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<InsightCaptureType['status'] | 'all'>('all');

  const filteredInsights = insights.filter((insight) => {
    if (filter !== 'all' && insight.type !== filter) return false;
    if (statusFilter !== 'all' && insight.status !== statusFilter) return false;
    return true;
  });

  const handleSaveInsight = useCallback(
    (data: InsightCaptureForm) => {
      if (editingInsight) {
        // Convert InsightCaptureForm to Partial<InsightCaptureType>
        const updates: Partial<InsightCaptureType> = {
          title: data.title,
          content: data.content,
          type: data.type,
          tags: data.tags,
        };
        onUpdateInsight?.(editingInsight.id, updates);
      } else {
        onSaveInsight?.(data);
      }
      setShowForm(false);
      setEditingInsight(null);
    },
    [editingInsight, onSaveInsight, onUpdateInsight]
  );

  const handleEditInsight = useCallback((insight: InsightCaptureType) => {
    setEditingInsight(insight);
    setShowForm(true);
  }, []);

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Insight Capture</h1>
              <p className="text-sm text-gray-500">
                Capture and organize strategic insights
              </p>
            </div>

            {currentUser && (
              <button
                onClick={() => {
                  setEditingInsight(null);
                  setShowForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + New Insight
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex space-x-4 mt-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              <option value="observation">Observations</option>
              <option value="hypothesis">Hypotheses</option>
              <option value="recommendation">Recommendations</option>
              <option value="question">Questions</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="published">Published</option>
            </select>

            <div className="flex-1" />

            <span className="text-sm text-gray-500 self-center">
              {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {showForm ? (
          <InsightForm
            initialData={editingInsight || undefined}
            availableEntities={availableEntities}
            onSave={handleSaveInsight}
            onCancel={() => {
              setShowForm(false);
              setEditingInsight(null);
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredInsights.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl mb-4 block">📝</span>
                <p>No insights captured yet.</p>
                {currentUser && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Capture your first insight
                  </button>
                )}
              </div>
            ) : (
              filteredInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onEdit={() => handleEditInsight(insight)}
                  onDelete={() => onDeleteInsight?.(insight.id)}
                  onPublish={
                    insight.status === 'draft' && onPublishInsight
                      ? () => onPublishInsight(insight.id)
                      : undefined
                  }
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightCapture;
