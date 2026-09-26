import { AnswerResponse } from './answer-response.model';

export interface QuestionResponse {
  id: number;
  sessionId: number;
  content: string;
  orderNumber: number;
  answer: AnswerResponse;
}