export type QuestionResponseType =
  | "yesNo"
  | "text"
  | "multipleChoice"
  | "rating";

export type EvaluationSubItem = {
  id: string;
  text: string;
  subItems?: string[];
};

export type EvaluationQuestion = {
  id: string;
  text: string;
  responseType: QuestionResponseType;
  description?: string;
  options?: string[];
  sectionTitle?: string;
  subItems?: EvaluationSubItem[];
};

export type EvaluationChapter = {
  id: string;
  number: number;
  title: string;
  description?: string;
  questions: EvaluationQuestion[];
};