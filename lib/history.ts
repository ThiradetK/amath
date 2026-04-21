export interface MoveRecord {
  playerName: string;
  playerId: number;
  type: 'place' | 'pass' | 'exchange';
  score: number;
  equations: string[];
  turnNumber: number;
  bingo?: boolean;
}
