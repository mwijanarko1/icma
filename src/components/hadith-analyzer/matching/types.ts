import type { PendingMatch } from '@/types/hadithAnalyzerState';

export interface MatchConfirmationModalProps {
  showMatchConfirmationModal: boolean;
  pendingMatches: PendingMatch[];
  currentMatchIndex: number;
  acceptedMatchesCount: number;
  onClose: () => void;
  onAcceptMatch: () => void;
  onRejectMatch: () => void;
  onAcceptAllMatches: () => void;
  onRejectAllMatches: () => void;
  onSelectMatch: (matchIndex: number, selectedIndex: number) => void;
}

