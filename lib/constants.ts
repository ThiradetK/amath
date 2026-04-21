import { CellType, TileValue } from "./types";

// 15x15 board layout
// R=Triple Equation (red), Y=Double Equation (yellow), B=Triple Number (blue), O=Double Number (orange), S=Star, .=Normal
export const BOARD_LAYOUT = [
  ["R", ".", ".", "O", ".", ".", ".", ".", ".", ".", ".", "O", ".", ".", "R"],
  [".", "Y", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "Y", "."],
  [".", ".", "Y", ".", ".", ".", ".", "B", ".", ".", ".", ".", "Y", ".", "."],
  ["O", ".", ".", "Y", ".", ".", ".", ".", ".", ".", ".", "Y", ".", ".", "O"],
  [".", ".", ".", ".", "Y", ".", ".", ".", ".", ".", "Y", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", "B", ".", ".", ".", "B", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", "O", ".", "O", ".", ".", ".", ".", ".", "."],
  [".", ".", "B", ".", ".", ".", ".", "S", ".", ".", ".", "B", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", "O", ".", "O", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", "B", ".", ".", ".", "B", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", "Y", ".", ".", ".", ".", ".", "Y", ".", ".", ".", "."],
  ["O", ".", ".", "Y", ".", ".", ".", ".", ".", ".", ".", "Y", ".", ".", "O"],
  [".", ".", "Y", ".", ".", ".", ".", "B", ".", ".", ".", ".", "Y", ".", "."],
  [".", "Y", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "Y", "."],
  ["R", ".", ".", "O", ".", ".", ".", ".", ".", ".", ".", "O", ".", ".", "R"],
];

export function buildBoard() {
  const typeMap: Record<string, CellType> = {
    R: "TRIPLE_EQ",
    Y: "DOUBLE_EQ",
    B: "TRIPLE_NUM",
    O: "DOUBLE_NUM",
    S: "STAR",
    ".": "NORMAL",
  };
  return BOARD_LAYOUT.map((row, r) =>
    row.map((code, c) => ({
      row: r,
      col: c,
      type: typeMap[code] as CellType,
      tile: null,
      isNew: false,
    })),
  );
}

// Tile distribution: value -> [count, points]
export const TILE_DISTRIBUTION: Record<TileValue, [number, number]> = {
  "0": [4, 2],
  "1": [6, 1],
  "2": [6, 1],
  "3": [6, 2],
  "4": [6, 2],
  "5": [6, 2],
  "6": [5, 3],
  "7": [5, 3],
  "8": [4, 3],
  "9": [4, 3],
  "10": [4, 4],
  "11": [3, 4],
  "12": [3, 4],
  "13": [3, 5],
  "14": [3, 5],
  "15": [3, 5],
  "16": [3, 6],
  "17": [2, 6],
  "18": [2, 6],
  "19": [2, 7],
  "20": [2, 7],
  "+": [6, 2],
  "-": [6, 2],
  "×": [5, 3],
  "÷": [4, 4],
  "=": [8, 1],
  BLANK: [2, 0],
};

export const BINGO_BONUS = 40;

export function calculateRemainingTiles(board: any[][], players: any[]) {
  const remaining: Record<string, number> = {};

  // Initialize with full distribution
  for (const [value, [count]] of Object.entries(TILE_DISTRIBUTION)) {
    remaining[value] = count;
  }

  // Subtract tiles on board
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const tile = board[r][c]?.tile;
      if (tile) {
        const value = tile.blankValue || tile.value;
        if (remaining[value] !== undefined) {
          remaining[value]--;
        }
      }
    }
  }

  // Subtract tiles in player racks
  for (const player of players) {
    if (player.rack) {
      for (const tile of player.rack) {
        const value = tile.blankValue || tile.value;
        if (remaining[value] !== undefined) {
          remaining[value]--;
        }
      }
    }
  }

  return remaining;
}
