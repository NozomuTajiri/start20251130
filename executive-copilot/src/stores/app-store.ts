import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ダッシュボードビューの状態
interface DashboardState {
  activeTab: string;
  sidebarOpen: boolean;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      activeTab: 'overview',
      sidebarOpen: true,
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);

// 対話セッションの状態
interface DialogueMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DialogueState {
  messages: DialogueMessage[];
  isLoading: boolean;
  currentContext: Record<string, unknown>;
  addMessage: (message: Omit<DialogueMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setContext: (context: Record<string, unknown>) => void;
  clearMessages: () => void;
}

export const useDialogueStore = create<DialogueState>()((set) => ({
  messages: [],
  isLoading: false,
  currentContext: {},
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setContext: (context) => set({ currentContext: context }),
  clearMessages: () => set({ messages: [] }),
}));

// 価値指標の状態
interface ValueMetricState {
  selectedDimension: string | null;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  setSelectedDimension: (dimension: string | null) => void;
  setTimeRange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

export const useValueMetricStore = create<ValueMetricState>()((set) => ({
  selectedDimension: null,
  timeRange: 'month',
  setSelectedDimension: (dimension) => set({ selectedDimension: dimension }),
  setTimeRange: (range) => set({ timeRange: range }),
}));

// 戦略マップの状態
interface StrategyMapState {
  selectedNode: string | null;
  zoomLevel: number;
  viewMode: 'causal' | 'timeline' | 'hierarchy';
  setSelectedNode: (nodeId: string | null) => void;
  setZoomLevel: (level: number) => void;
  setViewMode: (mode: 'causal' | 'timeline' | 'hierarchy') => void;
}

export const useStrategyMapStore = create<StrategyMapState>()((set) => ({
  selectedNode: null,
  zoomLevel: 1,
  viewMode: 'causal',
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
