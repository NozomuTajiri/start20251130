/**
 * Collective Intelligence Platform Component
 * 5.4 集合知形成プラットフォーム
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type {
  CollectiveIntelligence,
  CollectiveInsight,
  Discussion,
  Vote,
  ConsensusMetric,
  DiscussionMessage,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface CollectiveIntelligencePlatformProps {
  data?: CollectiveIntelligence;
  currentUser?: string;
  onSubmitInsight?: (insight: Omit<CollectiveInsight, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'comments'>) => void;
  onVoteInsight?: (insightId: string, vote: 'up' | 'down') => void;
  onCommentInsight?: (insightId: string, comment: string) => void;
  onCreateDiscussion?: (title: string, topic: string) => void;
  onSendMessage?: (discussionId: string, content: string) => void;
  onCastVote?: (voteId: string, optionId: string) => void;
  className?: string;
}

type TabType = 'insights' | 'discussions' | 'votes' | 'consensus';

// ========================================
// Sub-Components
// ========================================

const TabNavigation: React.FC<{
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: Record<TabType, number>;
}> = ({ activeTab, onTabChange, counts }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'discussions', label: 'Discussions', icon: '💬' },
    { id: 'votes', label: 'Votes', icon: '🗳️' },
    { id: 'consensus', label: 'Consensus', icon: '🤝' },
  ];

  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center px-6 py-3 border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="mr-2">{tab.icon}</span>
          <span>{tab.label}</span>
          {counts[tab.id] > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
              {counts[tab.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

const InsightCard: React.FC<{
  insight: CollectiveInsight;
  currentUser?: string;
  onVote: (vote: 'up' | 'down') => void;
  onComment: (comment: string) => void;
}> = ({ insight, currentUser, onVote, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const statusColors = {
    pending: 'bg-gray-100 text-gray-600',
    validated: 'bg-green-100 text-green-600',
    implemented: 'bg-blue-100 text-blue-600',
    rejected: 'bg-red-100 text-red-600',
  };

  const typeIcons: Record<CollectiveInsight['type'], string> = {
    observation: '👁️',
    hypothesis: '🔬',
    recommendation: '💡',
    question: '❓',
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <span>{typeIcons[insight.type]}</span>
          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[insight.status]}`}>
            {insight.status}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(insight.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-gray-800 mb-3">{insight.content}</p>

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

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center space-x-4">
          {/* Vote buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onVote('up')}
              className="p-1 hover:bg-green-50 rounded transition-colors"
              title="Upvote"
            >
              👍
            </button>
            <span className="text-sm font-medium text-gray-600">{insight.upvotes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onVote('down')}
              className="p-1 hover:bg-red-50 rounded transition-colors"
              title="Downvote"
            >
              👎
            </button>
            <span className="text-sm font-medium text-gray-600">{insight.downvotes}</span>
          </div>

          {/* Comment button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
          >
            <span>💬</span>
            <span className="text-sm">{insight.comments.length}</span>
          </button>
        </div>

        <span className="text-xs text-gray-400">by {insight.author}</span>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {insight.comments.map((comment) => (
            <div key={comment.id} className="p-2 bg-gray-50 rounded">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{comment.author}</span>
                <span>{new Date(comment.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          ))}

          {currentUser && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DiscussionCard: React.FC<{
  discussion: Discussion;
  currentUser?: string;
  onSendMessage: (content: string) => void;
}> = ({ discussion, currentUser, onSendMessage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const statusColors = {
    open: 'bg-green-100 text-green-600',
    resolved: 'bg-blue-100 text-blue-600',
    archived: 'bg-gray-100 text-gray-600',
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-gray-800">{discussion.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{discussion.topic}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[discussion.status]}`}>
            {discussion.status}
          </span>
        </div>
        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
          <span>👥 {discussion.participants.length} participants</span>
          <span>💬 {discussion.messages.length} messages</span>
          <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t">
          {/* Messages */}
          <div className="p-4 max-h-80 overflow-y-auto space-y-3">
            {discussion.messages.map((message: DiscussionMessage) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.author === currentUser
                    ? 'bg-blue-50 ml-8'
                    : 'bg-gray-50 mr-8'
                }`}
              >
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium">{message.author}</span>
                  <span>{new Date(message.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700">{message.content}</p>
                {message.reactions.length > 0 && (
                  <div className="flex space-x-1 mt-2">
                    {message.reactions.map((reaction, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white rounded-full text-xs"
                      >
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* New message input */}
          {currentUser && discussion.status === 'open' && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const VoteCard: React.FC<{
  vote: Vote;
  currentUser?: string;
  onCastVote: (optionId: string) => void;
}> = ({ vote, currentUser, onCastVote }) => {
  const isActive = vote.status === 'active';
  const timeLeft = new Date(vote.deadline).getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-800">{vote.topic}</h4>
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isActive ? `${daysLeft}d left` : 'Closed'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {vote.options.map((option) => (
          <div key={option.id} className="relative">
            <div
              className="absolute inset-0 bg-blue-100 rounded"
              style={{ width: `${option.percentage}%` }}
            />
            <div className="relative flex items-center justify-between p-3">
              <span className="font-medium text-gray-700">{option.label}</span>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {option.votes} ({option.percentage.toFixed(1)}%)
                </span>
                {isActive && currentUser && (
                  <button
                    onClick={() => onCastVote(option.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Vote
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400">
        Total votes: {vote.totalVotes}
      </div>
    </div>
  );
};

const ConsensusCard: React.FC<{
  metric: ConsensusMetric;
}> = ({ metric }) => {
  const getConsensusColor = (level: number): string => {
    if (level >= 0.8) return 'text-green-600 bg-green-100';
    if (level >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h4 className="font-medium text-gray-800 mb-3">{metric.topic}</h4>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Consensus Level</p>
          <div className="flex items-center space-x-2">
            <span
              className={`text-2xl font-bold ${
                metric.consensusLevel >= 0.6 ? 'text-green-600' : 'text-orange-600'
              }`}
            >
              {(metric.consensusLevel * 100).toFixed(0)}%
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${getConsensusColor(metric.consensusLevel)}`}
            >
              {metric.consensusLevel >= 0.8
                ? 'Strong'
                : metric.consensusLevel >= 0.6
                ? 'Moderate'
                : 'Weak'}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Participation</p>
          <p className="text-2xl font-bold text-gray-800">
            {(metric.participationRate * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {metric.divergentViews.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Divergent Views</p>
          <div className="space-y-1">
            {metric.divergentViews.map((view, idx) => (
              <div key={idx} className="p-2 bg-orange-50 rounded text-sm text-orange-700">
                {view}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const InsightForm: React.FC<{
  onSubmit: (data: { content: string; type: CollectiveInsight['type']; category: string; tags: string[] }) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<CollectiveInsight['type']>('observation');
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({ content: content.trim(), type, category, tags });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CollectiveInsight['type'])}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="observation">Observation</option>
          <option value="hypothesis">Hypothesis</option>
          <option value="recommendation">Recommendation</option>
          <option value="question">Question</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Share your insight..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="e.g., Strategy, Operations, Customer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
            placeholder="Add a tag"
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

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Submit Insight
        </button>
      </div>
    </form>
  );
};

// ========================================
// Main Component
// ========================================

export const CollectiveIntelligencePlatform: React.FC<CollectiveIntelligencePlatformProps> = ({
  data,
  currentUser,
  onSubmitInsight,
  onVoteInsight,
  onCommentInsight,
  onCreateDiscussion,
  onSendMessage,
  onCastVote,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('insights');
  const [showInsightForm, setShowInsightForm] = useState(false);
  const [_showDiscussionForm, setShowDiscussionForm] = useState(false);

  const tabCounts = useMemo(
    () => ({
      insights: data?.insights.length || 0,
      discussions: data?.discussions.filter((d) => d.status === 'open').length || 0,
      votes: data?.votes.filter((v) => v.status === 'active').length || 0,
      consensus: data?.consensus.length || 0,
    }),
    [data]
  );

  const handleSubmitInsight = useCallback(
    (insightData: { content: string; type: CollectiveInsight['type']; category: string; tags: string[] }) => {
      onSubmitInsight?.({
        content: insightData.content,
        author: currentUser || 'Anonymous',
        category: insightData.category,
        type: insightData.type,
        tags: insightData.tags,
        status: 'pending',
      });
      setShowInsightForm(false);
    },
    [currentUser, onSubmitInsight]
  );

  const handleCreateDiscussion = useCallback(
    (title: string, topic: string) => {
      onCreateDiscussion?.(title, topic);
      setShowDiscussionForm(false);
    },
    [onCreateDiscussion]
  );

  if (!data) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <p>Loading collective intelligence data...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <h1 className="text-2xl font-bold">Collective Intelligence Platform</h1>
        <p className="text-purple-100 mt-1">
          Share insights, discuss ideas, and build consensus
        </p>
      </div>

      {/* Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={tabCounts}
      />

      {/* Content */}
      <div className="p-6">
        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {currentUser && !showInsightForm && (
              <button
                onClick={() => setShowInsightForm(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                + Share an Insight
              </button>
            )}

            {showInsightForm && (
              <InsightForm
                onSubmit={handleSubmitInsight}
                onCancel={() => setShowInsightForm(false)}
              />
            )}

            {data.insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                currentUser={currentUser}
                onVote={(vote) => onVoteInsight?.(insight.id, vote)}
                onComment={(comment) => onCommentInsight?.(insight.id, comment)}
              />
            ))}

            {data.insights.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No insights shared yet. Be the first!
              </p>
            )}
          </div>
        )}

        {/* Discussions Tab */}
        {activeTab === 'discussions' && (
          <div className="space-y-4">
            {currentUser && (
              <button
                onClick={() => {
                  const title = prompt('Discussion title:');
                  const topic = prompt('Topic:');
                  if (title && topic) {
                    handleCreateDiscussion(title, topic);
                  }
                }}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                + Start a Discussion
              </button>
            )}

            {data.discussions.map((discussion) => (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                currentUser={currentUser}
                onSendMessage={(content) => onSendMessage?.(discussion.id, content)}
              />
            ))}

            {data.discussions.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No discussions yet. Start one!
              </p>
            )}
          </div>
        )}

        {/* Votes Tab */}
        {activeTab === 'votes' && (
          <div className="space-y-4">
            {data.votes.map((vote) => (
              <VoteCard
                key={vote.id}
                vote={vote}
                currentUser={currentUser}
                onCastVote={(optionId) => onCastVote?.(vote.id, optionId)}
              />
            ))}

            {data.votes.length === 0 && (
              <p className="text-center text-gray-500 py-8">No active votes</p>
            )}
          </div>
        )}

        {/* Consensus Tab */}
        {activeTab === 'consensus' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.consensus.map((metric, idx) => (
              <ConsensusCard key={idx} metric={metric} />
            ))}

            {data.consensus.length === 0 && (
              <p className="col-span-2 text-center text-gray-500 py-8">
                No consensus metrics available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectiveIntelligencePlatform;
