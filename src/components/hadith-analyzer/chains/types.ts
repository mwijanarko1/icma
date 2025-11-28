import type { Chain } from '@/types/hadith';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { useSensors } from '@dnd-kit/core';

import type { HadithAnalyzerState } from '@/types/hadithAnalyzerState';
import type { HadithAnalyzerAction } from '@/reducers/hadithAnalyzerActions';
import type { Dispatch } from 'react';

export interface DraggableChainProps {
  // Core chain data
  chain: Chain;
  chainIndex: number;

  // Drag and drop
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;

  // Actions (simplified interface)
  actions: {
    onToggleCollapse: (chainId: string) => void;
    onEdit: (chainId: string) => void;
    onRemove: (chainId: string) => void;
    onMatchNarrators: (chainId: string) => void;
  };

  // State (reduced to essentials)
  editingChainId: string | null;
  
  // Shared state and dispatch - pass from parent to avoid separate reducer instances
  state: HadithAnalyzerState;
  dispatch: Dispatch<HadithAnalyzerAction>;
  globalActions: typeof import('@/reducers/hadithAnalyzerActions').actions;
}

