
export interface Participant {
  id: string;
  name: string;
  email?: string;
  department?: string;
}

export enum AppTab {
  LIST = 'list',
  LUCKY_DRAW = 'draw',
  GROUPING = 'grouping',
  IMAGE_STUDIO = 'studio'
}

export interface GroupResult {
  groupName: string;
  members: Participant[];
}

export interface HistoryItem {
  id: string;
  winner: Participant;
  prize: string;
  timestamp: number;
}
