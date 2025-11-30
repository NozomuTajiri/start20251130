'use client';

import { useState, useCallback } from 'react';
import {
  ValuePulseBoard,
  StrategyNavigator,
  ScenarioSimulator,
  CollectiveIntelligencePlatform,
} from '@/interface-layer/components/dashboard';
import {
  StrategyDialogue,
  InsightCapture,
  DecisionSupport,
} from '@/interface-layer/components/dialogue';
import type { ValuePulseData, ValueDimension, PulseAlert } from '@/interface-layer/types';

type TabType = 'pulse' | 'strategy' | 'scenario' | 'collective' | 'dialogue' | 'insight' | 'decision';

// サンプルデータ（実データ接続前のデモ）
const createSamplePulseData = (): ValuePulseData => {
  const dimensions: ValueDimension[] = [
    {
      id: 'financial',
      name: '財務価値',
      score: 0.78,
      weight: 0.25,
      trend: 'up',
      subDimensions: [
        { id: 'revenue', name: '売上成長率', score: 0.82, target: 1.0, status: 'on-track' },
        { id: 'profit', name: '営業利益率', score: 0.71, target: 1.0, status: 'at-risk' },
        { id: 'cash', name: 'キャッシュフロー', score: 0.85, target: 1.0, status: 'on-track' },
        { id: 'roi', name: '投資収益率', score: 0.68, target: 1.0, status: 'at-risk' },
      ],
    },
    {
      id: 'customer',
      name: '顧客価値',
      score: 0.85,
      weight: 0.20,
      trend: 'up',
      subDimensions: [
        { id: 'nps', name: 'NPS', score: 0.88, target: 1.0, status: 'on-track' },
        { id: 'retention', name: '顧客維持率', score: 0.92, target: 1.0, status: 'on-track' },
        { id: 'ltv', name: '顧客生涯価値', score: 0.75, target: 1.0, status: 'at-risk' },
      ],
    },
    {
      id: 'operational',
      name: '業務効率',
      score: 0.72,
      weight: 0.15,
      trend: 'stable',
      subDimensions: [
        { id: 'efficiency', name: '生産性', score: 0.69, target: 1.0, status: 'at-risk' },
        { id: 'quality', name: '品質スコア', score: 0.81, target: 1.0, status: 'on-track' },
        { id: 'automation', name: '自動化率', score: 0.65, target: 1.0, status: 'off-track' },
      ],
    },
    {
      id: 'innovation',
      name: 'イノベーション',
      score: 0.68,
      weight: 0.15,
      trend: 'up',
      subDimensions: [
        { id: 'pipeline', name: '新製品パイプライン', score: 0.72, target: 1.0, status: 'at-risk' },
        { id: 'rd-roi', name: 'R&D ROI', score: 0.58, target: 1.0, status: 'off-track' },
        { id: 'patents', name: '特許出願', score: 0.75, target: 1.0, status: 'at-risk' },
      ],
    },
    {
      id: 'talent',
      name: '人材価値',
      score: 0.81,
      weight: 0.15,
      trend: 'up',
      subDimensions: [
        { id: 'engagement', name: '従業員エンゲージメント', score: 0.79, target: 1.0, status: 'at-risk' },
        { id: 'skill', name: 'スキル充足率', score: 0.85, target: 1.0, status: 'on-track' },
        { id: 'retention-emp', name: '定着率', score: 0.78, target: 1.0, status: 'at-risk' },
      ],
    },
    {
      id: 'sustainability',
      name: 'サステナビリティ',
      score: 0.74,
      weight: 0.10,
      trend: 'up',
      subDimensions: [
        { id: 'carbon', name: 'カーボンフットプリント削減', score: 0.71, target: 1.0, status: 'at-risk' },
        { id: 'esg', name: 'ESGスコア', score: 0.82, target: 1.0, status: 'on-track' },
        { id: 'social', name: '社会貢献', score: 0.68, target: 1.0, status: 'at-risk' },
      ],
    },
  ];

  const alerts: PulseAlert[] = [
    {
      id: 'alert-1',
      type: 'warning',
      title: '自動化率が目標未達',
      message: '業務自動化率が65%と目標の80%を大きく下回っています。DX推進施策の見直しを推奨。',
      dimension: 'operational',
      timestamp: new Date(),
      acknowledged: false,
    },
    {
      id: 'alert-2',
      type: 'critical',
      title: 'R&D ROI低下',
      message: 'R&D投資収益率が58%に低下。新製品の市場投入遅延が主要因と分析されています。',
      dimension: 'innovation',
      timestamp: new Date(Date.now() - 3600000),
      acknowledged: false,
    },
    {
      id: 'alert-3',
      type: 'info',
      title: '顧客NPS改善',
      message: 'NPSが前四半期比+5ポイント改善。カスタマーサクセス施策が奏功しています。',
      dimension: 'customer',
      timestamp: new Date(Date.now() - 7200000),
      acknowledged: true,
    },
  ];

  const overallScore = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length;

  return {
    dimensions,
    alerts,
    overallScore,
    trend: 'up',
    trendPercentage: 3.2,
    lastUpdated: new Date(),
  };
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('pulse');
  const [pulseData, setPulseData] = useState<ValuePulseData>(createSamplePulseData);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'pulse', label: 'Value Pulse', icon: '📊' },
    { id: 'strategy', label: 'Strategy', icon: '🗺️' },
    { id: 'scenario', label: 'Simulator', icon: '🎯' },
    { id: 'collective', label: 'Collective', icon: '🧠' },
    { id: 'dialogue', label: 'Dialogue', icon: '💬' },
    { id: 'insight', label: 'Insights', icon: '💡' },
    { id: 'decision', label: 'Decisions', icon: '⚖️' },
  ];

  // アラート確認ハンドラー
  const handleAlertAcknowledge = useCallback((alertId: string) => {
    setPulseData((prev) => ({
      ...prev,
      alerts: prev.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
    }));
  }, []);

  // データ更新ハンドラー
  const handleRefresh = useCallback(() => {
    // 実際のAPIコールをシミュレート
    setPulseData(createSamplePulseData());
  }, []);

  // Dimensionクリックハンドラー
  const handleDimensionClick = useCallback((dimensionId: string) => {
    console.log('Dimension clicked:', dimensionId);
    // 詳細画面への遷移やモーダル表示などを実装
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'pulse':
        return (
          <ValuePulseBoard
            data={pulseData}
            onAlertAcknowledge={handleAlertAcknowledge}
            onRefresh={handleRefresh}
            onDimensionClick={handleDimensionClick}
            config={{
              showAlerts: true,
              showTrends: true,
              dimensionLayout: 'grid',
            }}
          />
        );
      case 'strategy':
        return <StrategyNavigator />;
      case 'scenario':
        return <ScenarioSimulator />;
      case 'collective':
        return <CollectiveIntelligencePlatform />;
      case 'dialogue':
        return <StrategyDialogue />;
      case 'insight':
        return <InsightCapture />;
      case 'decision':
        return <DecisionSupport />;
      default:
        return (
          <ValuePulseBoard
            data={pulseData}
            onAlertAcknowledge={handleAlertAcknowledge}
            onRefresh={handleRefresh}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Executive Copilot
          </h1>
          <p className="text-sm text-gray-500">
            AI-powered executive decision support system
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </main>
  );
}
