import type { Chain } from '@/types/hadith';

export interface MermaidGraphProps {
  chains: Chain[];
  showVisualization: boolean;
  onHide?: () => void;
  onEdgeClick?: (chainIndices: number[]) => void;
  onEdgeHover?: (chainIndices: number[]) => void;
  highlightedChainIds?: string[];
}

