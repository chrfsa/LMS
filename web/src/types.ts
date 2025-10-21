export interface User {
  id: number;
  email: string;
}

export interface Progress {
  moduleId: number;
  status: 'in_progress' | 'done';
  validated: boolean;
  quizScore: number | null;
  unlocked: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
}

export interface QuizSubmitResult {
  score: number;
  validated: boolean;
  total: number;
}
