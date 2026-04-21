import { Tile, Cell, PlacedTile } from './types';
import { validatePlacement, calculateScore, getWordFromBoard } from './gameLogic';
import { buildBoard } from './constants';

interface AIMove {
  placements: PlacedTile[];
  score: number;
}

// Generate all possible numbers from tiles (single or multi-digit)
function* numberCombinations(tiles: Tile[]): Generator<{ tiles: Tile[]; value: number }> {
  const nums = tiles.filter(t => !isNaN(Number(t.value)) || t.isBlank);

  for (const t of nums) {
    const val = t.isBlank ? 0 : Number(t.value);
    yield { tiles: [t], value: val };
  }
}

// Simple AI: tries to place valid equations on the board
export function findBestAIMove(
  board: Cell[][],
  rack: Tile[],
  isFirstMove: boolean
): PlacedTile[] | null {
  // Try to form simple equations like: A op B = C or A = B op C
  const numbers = rack.filter(t => !isNaN(Number(t.value)) && !t.isBlank);
  const ops = rack.filter(t => ['+', '-', '×', '÷'].includes(t.value));
  const equals = rack.filter(t => t.value === '=');

  if (equals.length === 0) return null;

  const eqTile = equals[0];

  // Try all combinations of: num op num = result
  for (const a of numbers) {
    for (const op of ops) {
      for (const b of numbers) {
        if (a.id === b.id) continue;

        const aVal = Number(a.value);
        const bVal = Number(b.value);
        let result: number;

        if (op.value === '+') result = aVal + bVal;
        else if (op.value === '-') result = aVal - bVal;
        else if (op.value === '×') result = aVal * bVal;
        else if (op.value === '÷') {
          if (bVal === 0) continue;
          result = aVal / bVal;
          if (!Number.isInteger(result)) continue;
        } else continue;

        if (result < 0 || result > 20) continue;

        // Find result tile in rack
        const resultTile = rack.find(t =>
          t.id !== a.id && t.id !== op.id && t.id !== b.id && t.id !== eqTile.id &&
          Number(t.value) === result
        );
        if (!resultTile) continue;

        // Try to place: a op b = result horizontally
        const sequence = [a, op, b, eqTile, resultTile];
        const placement = tryPlaceSequence(board, sequence, isFirstMove);
        if (placement) return placement;

        // Also try: result = a op b
        const sequence2 = [resultTile, eqTile, a, op, b];
        const placement2 = tryPlaceSequence(board, sequence2, isFirstMove);
        if (placement2) return placement2;
      }
    }
  }

  // Try simpler: a = b (if both in rack... unlikely but possible with blanks)
  // Try extending existing equations
  if (!isFirstMove) {
    const extMove = tryExtendExisting(board, rack);
    if (extMove) return extMove;
  }

  return null;
}

function tryPlaceSequence(
  board: Cell[][],
  sequence: Tile[],
  isFirstMove: boolean
): PlacedTile[] | null {
  const len = sequence.length;

  // Try every horizontal position
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c <= 15 - len; c++) {
      // Check all cells are empty
      const allEmpty = sequence.every((_, i) => !board[r][c + i].tile);
      if (!allEmpty) continue;

      const placements: PlacedTile[] = sequence.map((tile, i) => ({
        tile, row: r, col: c + i
      }));

      const { valid } = validatePlacement(board, placements, isFirstMove);
      if (valid) return placements;
    }
  }

  // Try vertical
  for (let r = 0; r <= 15 - len; r++) {
    for (let c = 0; c < 15; c++) {
      const allEmpty = sequence.every((_, i) => !board[r + i][c].tile);
      if (!allEmpty) continue;

      const placements: PlacedTile[] = sequence.map((tile, i) => ({
        tile, row: r + i, col: c
      }));

      const { valid } = validatePlacement(board, placements, isFirstMove);
      if (valid) return placements;
    }
  }

  return null;
}

function tryExtendExisting(board: Cell[][], rack: Tile[]): PlacedTile[] | null {
  // Find cells adjacent to existing tiles and try to build equations there
  const adjacentCells: { row: number; col: number }[] = [];

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (!board[r][c].tile) {
        const hasAdj = [[0,1],[0,-1],[1,0],[-1,0]].some(([dr,dc]) => {
          const nr = r+dr, nc = c+dc;
          return nr>=0 && nr<15 && nc>=0 && nc<15 && board[nr][nc].tile;
        });
        if (hasAdj) adjacentCells.push({ row: r, col: c });
      }
    }
  }

  // Try placing single tiles that complete equations
  const numbers = rack.filter(t => !isNaN(Number(t.value)));
  const equals = rack.filter(t => t.value === '=');
  const ops = rack.filter(t => ['+','-','×','÷'].includes(t.value));

  // Check if placing an equals sign somewhere creates a valid equation
  for (const cell of adjacentCells.slice(0, 20)) {
    for (const tile of [...numbers, ...equals, ...ops].slice(0, 10)) {
      const placement: PlacedTile[] = [{ tile, row: cell.row, col: cell.col }];
      const { valid } = validatePlacement(board, placement, false);
      if (valid) return placement;
    }
  }

  return null;
}
