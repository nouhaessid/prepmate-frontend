import { InterviewTopic } from './interview-topic.enum';
import { Difficulty } from './difficulty.enum';
import { SessionStatus } from './session-status.enum';

export const TOPIC_LABELS: Record<InterviewTopic, string> = {
  [InterviewTopic.JAVA]: 'Java',
  [InterviewTopic.SPRING_BOOT]: 'Spring Boot',
  [InterviewTopic.ANGULAR]: 'Angular',
  [InterviewTopic.SQL]: 'SQL',
  [InterviewTopic.REST_API]: 'REST APIs',
  [InterviewTopic.DOCKER]: 'Docker',
  [InterviewTopic.KUBERNETES]: 'Kubernetes',
  [InterviewTopic.GENERAL_SOFTWARE_ENGINEERING]: 'Software engineering',
  [InterviewTopic.BEHAVIORAL]: 'Behavioral',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.BEGINNER]: 'Beginner',
  [Difficulty.INTERMEDIATE]: 'Intermediate',
  [Difficulty.ADVANCED]: 'Advanced',
};

export const STATUS_LABELS: Record<SessionStatus, string> = {
  [SessionStatus.IN_PROGRESS]: 'In progress',
  [SessionStatus.COMPLETED]: 'Completed'
};