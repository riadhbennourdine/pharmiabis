
export interface Flashcard {
  question: string;
  answer: string;
}

export enum QuizQuestionType {
    MCQ = 'mcq',
    TRUE_FALSE = 'truefalse'
}

export interface QuizQuestion {
  question: string;
  type: QuizQuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface ExternalResource {
  type: 'video' | 'podcast' | 'quiz' | 'article';
  title: string;
  url: string;
}

export interface Section {
  id: string;
  title:string;
  content: string;
  children?: Section[];
}

export interface Theme {
  id: string;
  Nom: string;
  description?: string;
}

export interface SystemeOrgane {
  id: string;
  Nom: string;
  description?: string;
}

export interface MemoFiche {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  flashSummary: string;
  memoContent: Section[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  glossaryTerms: GlossaryTerm[];
  theme: Theme;
  systeme_organe: SystemeOrgane;
  level: string; 
  createdAt: string;
  externalResources: ExternalResource[];
}

export interface PharmIaData {
    themes: Theme[];
    systemesOrganes: SystemeOrgane[];
    memofiches: MemoFiche[];
}