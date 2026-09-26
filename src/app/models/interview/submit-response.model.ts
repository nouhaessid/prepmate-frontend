import { AnswerResponse } from './answer-response.model'; 
import { QuestionResponse } from './question-response.model';

export interface SubmitResponse {
  evaluation: AnswerResponse;
  nextQuestion: QuestionResponse;
  interviewCompleted: boolean;
}