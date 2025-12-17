
export type NodeStatus = 'locked' | 'available' | 'in-progress' | 'mastered';
export type NodeType = 'signal' | 'noise';

export interface DeepContent {
  executiveSummary: string;
  technicalMechanics: string[];
  minuteDetails: string[];
  expertMentalModel: string;
  commonPitfalls: string[];
  eli7: string;
}

export interface LearningNode {
  id: string;
  parentId: string | null;
  title: string;
  description: string;
  type: NodeType;
  status: NodeStatus;
  depth: number;
  difficultyLevel: number; // Level 0 to 100
  learningOutcome: string; // Specific capability
  searchQueries: string[]; // High-precision search strings
  resources: string[]; // Curated resource types
  deepContent?: DeepContent; // High-fidelity structured content
  pomodorosSpent: number;
  childrenIds: string[];
  createdAt: number;
}

export type TimerStatus = 'idle' | 'working' | 'break';

export interface TimerState {
  status: TimerStatus;
  timeLeft: number;
  activeNodeId: string | null;
  duration: number;
  totalSessions: number;
}

export interface UserStats {
  dailyStreak: number;
  totalNodesMastered: number;
  totalFocusHours: number;
  masteryHistory: { date: string; count: number }[];
}
