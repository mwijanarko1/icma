import type { Chain } from "@/types/hadith";
import type { SelectedHadith, Step } from "@/types/analysis";
import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChainSession {
  id: string;
  userId: string;
  name: string;
  hadithText: string;
  chains: Chain[];
  mermaidCode: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AnalysisSession {
  id: string;
  userId: string;
  name: string;
  selectedHadiths: SelectedHadith[];
  activeStep: number;
  steps: Step[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
