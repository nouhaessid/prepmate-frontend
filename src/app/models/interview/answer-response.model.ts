export interface AnswerResponse {
  id: number;
  questionId: number;
  content: string;
  score: number;
  feedback: string;
  suggestedAnswer: string;
  strengths: string[];
  weaknesses: string[];
}