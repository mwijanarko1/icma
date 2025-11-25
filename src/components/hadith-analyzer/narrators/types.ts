import type { Narrator } from '@/types/hadith';
import type { ReputationGrade } from '@/lib/grading/constants';

export interface ReputationSelectorProps {
  selectedReputations: ReputationGrade[];
  onReputationChange: (reputations: ReputationGrade[]) => void;
  isDarkMode: boolean;
}

export interface DraggableNarratorRowProps {
  narrator: Narrator;
  index: number;
  isEditing: boolean;
  onUpdateNarrator: (index: number, field: 'arabicName' | 'englishName', value: string) => void;
  onUpdateReputation: (index: number, reputation: ReputationGrade[]) => void;
  onRemoveNarrator?: (index: number) => void;
  onViewNarratorDetails?: (narratorId: string) => void;
  onUnmatchNarrator?: (index: number) => void;
  onSearchNarrator?: (narratorIndex: number) => void;
  isDarkMode: boolean;
}

