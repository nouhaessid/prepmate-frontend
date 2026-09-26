import { QuestionResponse } from './question-response.model';
import { Difficulty } from './difficulty.enum';
import { InterviewTopic } from './interview-topic.enum';
import { SessionStatus } from './session-status.enum';

export interface InterviewSessionResponse {
  id: number;
  topic: InterviewTopic;
  questionCount: number;
  difficulty: Difficulty;
  status: SessionStatus;
  startedAt: string;
  completedAt: string;
  finalScore: number;
  questions: QuestionResponse[];
}
