export type TileValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' |
  '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' |
  '+' | '-' | '×' | '÷' | '=' | 'BLANK';

export type CellType =
  | 'NORMAL'
  | 'TRIPLE_EQ'    // Triple Equation (red)
  | 'DOUBLE_EQ'    // Double Equation (yellow)
  | 'TRIPLE_NUM'   // Triple Number (blue)
  | 'DOUBLE_NUM'   // Double Number (orange)
  | 'STAR';        // Center star

export interface Tile {
  id: string;
  value: TileValue;
  displayValue: string;
  points: number;
  isBlank?: boolean;
  blankValue?: TileValue;
}

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  tile: Tile | null;
  isNew?: boolean; // placed this turn
}

export interface Player {
  id: number;
  name: string;
  score: number;
  rack: Tile[];
  isAI?: boolean;
}

export interface PlacedTile {
  tile: Tile;
  row: number;
  col: number;
}

export interface MoveRecord {
  playerName: string;
  playerId: number;
  type: 'place' | 'pass' | 'exchange';
  score: number;
  equations: string[];
  turnNumber: number;
  bingo?: boolean;
}

export interface GameState {
  board: Cell[][];
  players: Player[];
  currentPlayerIndex: number;
  tileBag: Tile[];
  placedThisTurn: PlacedTile[];
  gamePhase: 'setup' | 'playing' | 'ended';
  selectedTile: Tile | null;
  selectedRackIndex: number | null;
  message: string;
  passCount: number;
  winner: Player | null;
  consecutivePasses: number;
  moveHistory: MoveRecord[];
  turnNumber: number;
  lastScore: number | null;
  isAIThinking: boolean;
}
