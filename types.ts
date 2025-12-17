
export type NodeStatus = 'locked' | 'available' | 'in-progress' | 'mastered';
export type NodeType = 'signal' | 'noise';
export type PlaygroundType = 'code' | 'spreadsheet' | 'canvas' | 'none';

export interface DeepContent {
  executiveSummary: string;
  technicalMechanics: string[];
  minuteDetails: string[];
  expertMentalModel: string;
  commonPitfalls: string[];
  eli7: string;
  detoxProtocol: string[];
  playground: {
    type: PlaygroundType;
    initialData: string;
    prompt: string;
    scaffolding?: {
      correctSignal: string;
      noiseDistractions: string[];
      expertHints: string[];
    };
  };
}

export interface LearningNode {
  id: string;
  parentId: string | null;
  title: string;
  description: string;
  type: NodeType;
  status: NodeStatus;
  depth: number;
  difficultyLevel: number;
  learningOutcome: string;
  searchQueries: string[];
  resources: string[];
  deepContent?: DeepContent;
  pomodorosSpent: number;
  childrenIds: string[];
  createdAt: number;
}

export type TimerStatus = 'idle' | 'working' | 'break' | 'completed';

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
