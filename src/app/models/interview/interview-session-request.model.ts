import { Difficulty } from "./difficulty.enum";
import { InterviewTopic } from './interview-topic.enum';

export interface InterviewSessionRequest {
  topic: InterviewTopic;
  difficulty: Difficulty;
  questionCount: number;
}