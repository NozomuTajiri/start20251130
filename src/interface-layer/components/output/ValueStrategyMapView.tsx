/**
 * Value Strategy Map View Component
 * 5.8 価値創造戦略マップ
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type {
  ValueStrategyMap,
  MapLayer,
  MapNode,
  MapEdge,
  MapAnnotation,
} from '../../types';

// ========================================
// Props Types
// ========================================

export interface ValueStrategyMapViewProps {
  strategyMap?: ValueStrategyMap;
  onNodeClick?: (nodeId: string) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<MapNode>) => void;
  onEdgeClick?: (edgeId: string) => void;
  onAddNode?: (node: Omit<MapNode, 'id'>) => void;
  onAddEdge?: (edge: Omit<MapEdge, 'id'>) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  className?: string;
}

// ========================================
// Sub-Components
// ========================================

const LayerHeader: React.FC<{
  layer: MapLayer;
  nodeCount: number;
  isVisible: boolean;
  onToggleVisibility: () => void;
}> = ({ layer, nodeCount, isVisible, onToggleVisibility }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isVisible ? 'opacity-100' : 'opacity-50'
      }`}
      style={{ backgroundColor: `${layer.color}20`, borderLeft: `4px solid ${layer.color}` }}
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleVisibility}
          className="w-5 h-5 rounded border flex items-center justify-center"
          style={{ borderColor: layer.color }}
        >
          {isVisible && <span style={{ color: layer.color }}>✓</span>}
        </button>
        <span className="font-medium text-gray-800">{layer.name}</span>
        <span className="text-sm text-gray-500">({nodeCount} items)</span>
      </div>
    </div>
  );
};

const NodeCard: React.FC<{
  node: MapNode;
  isSelected: boolean;
  onClick: () => void;
  connections: { incoming: number; outgoing: number };
}> = ({ node, isSelected, onClick, connections }) => {
  const statusColors = {
    active: 'border-green-500 bg-green-50',
    planned: 'border-blue-500 bg-blue-50',
    completed: 'border-gray-500 bg-gray-50',
    'at-risk': 'border-red-500 bg-red-50',
  };

  const statusIcons = {
    active: '●',
    planned: '○',
    completed: '✓',
    'at-risk': '⚠',
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        statusColors[node.status]
      } ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">{node.label}</h4>
        <span className="text-lg" title={node.status}>
          {statusIcons[node.status]}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{node.description}</p>

      {/* Metrics Preview */}
      {node.metrics.length > 0 && (
        <div className="space-y-1 mb-3">
          {node.metrics.slice(0, 2).map((metric, idx) => {
            const progress = (metric.value / metric.target) * 100;
            return (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500 truncate flex-1">{metric.name}</span>
                <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <span className="text-gray-600 w-8 text-right">{progress.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Connection Info */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>← {connections.incoming}</span>
        <span>{connections.outgoing} →</span>
      </div>
    </div>
  );
};

const NodeDetailPanel: React.FC<{
  node: MapNode;
  edges: MapEdge[];
  allNodes: MapNode[];
  onClose: () => void;
  onUpdate?: (updates: Partial<MapNode>) => void;
}> = ({ node, edges, allNodes, onClose, onUpdate }) => {
  const connectedNodes = useMemo(() => {
    const incoming = edges
      .filter((e) => e.target === node.id)
      .map((e) => ({ edge: e, node: allNodes.find((n) => n.id === e.source) }))
      .filter((item) => item.node);

    const outgoing = edges
      .filter((e) => e.source === node.id)
      .map((e) => ({ edge: e, node: allNodes.find((n) => n.id === e.target) }))
      .filter((item) => item.node);

    return { incoming, outgoing };
  }, [node.id, edges, allNodes]);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-40 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Node Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          ✕
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-800">{node.label}</h3>
          <p className="text-gray-600 mt-1">{node.description}</p>

          {onUpdate && (
            <div className="mt-3 flex space-x-2">
              {(['active', 'planned', 'completed', 'at-risk'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => onUpdate({ status })}
                  className={`px-3 py-1 text-xs rounded-full ${
                    node.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Metrics */}
        {node.metrics.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Key Metrics</h4>
            <div className="space-y-3">
              {node.metrics.map((metric, idx) => {
                const progress = (metric.value / metric.target) * 100;
                return (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{metric.name}</span>
                      <span className={`font-bold ${
                        progress >= 80 ? 'text-green-600' : progress >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">
                        {metric.value.toLocaleString()} / {metric.target.toLocaleString()} {metric.unit}
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Connections */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Connections</h4>

          {connectedNodes.incoming.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Driven by:</p>
              <div className="space-y-2">
                {connectedNodes.incoming.map(({ edge, node: connNode }) => (
                  <div
                    key={edge.id}
                    className="p-2 bg-blue-50 rounded flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">{connNode?.label}</span>
                    <span className="text-xs text-blue-600">{edge.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {connectedNodes.outgoing.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Drives:</p>
              <div className="space-y-2">
                {connectedNodes.outgoing.map(({ edge, node: connNode }) => (
                  <div
                    key={edge.id}
                    className="p-2 bg-green-50 rounded flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">{connNode?.label}</span>
                    <span className="text-xs text-green-600">{edge.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {connectedNodes.incoming.length === 0 && connectedNodes.outgoing.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No connections</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AnnotationBadge: React.FC<{
  annotation: MapAnnotation;
  onClick: () => void;
}> = ({ annotation, onClick }) => {
  const typeStyles = {
    note: 'bg-yellow-100 text-yellow-700',
    highlight: 'bg-blue-100 text-blue-700',
    callout: 'bg-red-100 text-red-700',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium ${typeStyles[annotation.type]}`}
      title={annotation.content}
    >
      {annotation.type === 'note' && '📝'}
      {annotation.type === 'highlight' && '⭐'}
      {annotation.type === 'callout' && '❗'}
      <span className="ml-1">{annotation.content.slice(0, 20)}...</span>
    </button>
  );
};

// ========================================
// Main Component
// ========================================

export const ValueStrategyMapView: React.FC<ValueStrategyMapViewProps> = ({
  strategyMap,
  onNodeClick,
  onNodeUpdate,
  onEdgeClick: _onEdgeClick,
  onAddNode: _onAddNode,
  onAddEdge: _onAddEdge,
  onExport,
  className = '',
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(
    new Set(strategyMap?.layers.map((l) => l.id) || [])
  );
  const [viewMode, setViewMode] = useState<'layers' | 'flat'>('layers');

  const nodesByLayer = useMemo(() => {
    if (!strategyMap) return new Map<string, MapNode[]>();

    const map = new Map<string, MapNode[]>();
    strategyMap.layers.forEach((layer) => {
      map.set(
        layer.id,
        strategyMap.nodes.filter((n) => n.layerId === layer.id)
      );
    });
    return map;
  }, [strategyMap]);

  const connectionCounts = useMemo(() => {
    if (!strategyMap) return new Map<string, { incoming: number; outgoing: number }>();

    const counts = new Map<string, { incoming: number; outgoing: number }>();
    strategyMap.nodes.forEach((node) => {
      counts.set(node.id, {
        incoming: strategyMap.edges.filter((e) => e.target === node.id).length,
        outgoing: strategyMap.edges.filter((e) => e.source === node.id).length,
      });
    });
    return counts;
  }, [strategyMap]);

  const selectedNode = useMemo(
    () => strategyMap?.nodes.find((n) => n.id === selectedNodeId),
    [strategyMap, selectedNodeId]
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      onNodeClick?.(nodeId);
    },
    [onNodeClick]
  );

  const handleToggleLayer = useCallback((layerId: string) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  }, []);

  if (!strategyMap) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <p>Loading strategy map...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{strategyMap.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Version {strategyMap.version} •{' '}
              {strategyMap.metadata.status} •{' '}
              Last updated {new Date(strategyMap.metadata.updatedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('layers')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'layers' ? 'bg-white shadow' : ''
                }`}
              >
                Layers
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'flat' ? 'bg-white shadow' : ''
                }`}
              >
                Flat
              </button>
            </div>

            {/* Export Button */}
            {onExport && (
              <div className="relative group">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                  {(['png', 'svg', 'pdf'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => onExport(format)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Annotations */}
        {strategyMap.annotations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {strategyMap.annotations.map((annotation) => (
              <AnnotationBadge
                key={annotation.id}
                annotation={annotation}
                onClick={() => {
                  if (annotation.targetNodes?.length) {
                    setSelectedNodeId(annotation.targetNodes[0]);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Tags */}
        {strategyMap.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {strategyMap.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'layers' ? (
          <div className="space-y-6">
            {strategyMap.layers
              .sort((a, b) => a.order - b.order)
              .map((layer) => {
                const layerNodes = nodesByLayer.get(layer.id) || [];
                const isVisible = visibleLayers.has(layer.id);

                return (
                  <div key={layer.id}>
                    <LayerHeader
                      layer={layer}
                      nodeCount={layerNodes.length}
                      isVisible={isVisible}
                      onToggleVisibility={() => handleToggleLayer(layer.id)}
                    />

                    {isVisible && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {layerNodes.map((node) => (
                          <NodeCard
                            key={node.id}
                            node={node}
                            isSelected={selectedNodeId === node.id}
                            onClick={() => handleNodeClick(node.id)}
                            connections={connectionCounts.get(node.id) || { incoming: 0, outgoing: 0 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategyMap.nodes
              .filter((node) => visibleLayers.has(node.layerId))
              .map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onClick={() => handleNodeClick(node.id)}
                  connections={connectionCounts.get(node.id) || { incoming: 0, outgoing: 0 }}
                />
              ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          edges={strategyMap.edges}
          allNodes={strategyMap.nodes}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={onNodeUpdate ? (updates) => onNodeUpdate(selectedNode.id, updates) : undefined}
        />
      )}
    </div>
  );
};

export default ValueStrategyMapView;
