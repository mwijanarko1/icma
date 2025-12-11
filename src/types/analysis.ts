export type SelectedHadith = {
  hadith_number: number;
  sub_version?: string;
  reference: string;
  english_narrator?: string;
  english_translation: string;
  arabic_text: string;
  in_book_reference?: string;
  collection: string;
};

export type StepStatus = "pending" | "in-progress" | "completed" | "locked";

export interface Step {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
}