import { Tile, TileValue, Cell, PlacedTile } from "./types";
import { TILE_DISTRIBUTION, BOARD_LAYOUT } from "./constants";

let tileCounter = 0;

export function createTileBag(): Tile[] {
  const bag: Tile[] = [];
  for (const [value, [count, points]] of Object.entries(TILE_DISTRIBUTION)) {
    for (let i = 0; i < count; i++) {
      bag.push({
        id: `tile-${tileCounter++}`,
        value: value as TileValue,
        displayValue: value === "BLANK" ? "" : value,
        points,
        isBlank: value === "BLANK",
      });
    }
  }
  return shuffle(bag);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawTiles(bag: Tile[], count: number): [Tile[], Tile[]] {
  const drawn = bag.slice(0, count);
  const remaining = bag.slice(count);
  return [drawn, remaining];
}

// -------- Equation Validation --------

type NumVal = number;

function getEffectiveValue(tile: Tile): string {
  if (tile.isBlank) return tile.blankValue || "";
  return tile.value;
}

// Combine adjacent single-digit tiles into multi-digit numbers
// Multi-digit tiles (e.g. "15") are pushed as-is
function tilesToTokens(tiles: Tile[]): string[] {
  const tokens: string[] = [];
  let numBuffer = "";

  for (const tile of tiles) {
    const val = getEffectiveValue(tile);

    if (/^\d+$/.test(val)) {
      if (val.length > 1) {
        // multi-digit tile → flush buffer first, then push directly
        if (numBuffer) {
          tokens.push(numBuffer);
          numBuffer = "";
        }
        tokens.push(val);
      } else {
        // single-digit tile → accumulate in buffer
        numBuffer += val;
      }
    } else {
      // operator or = → flush buffer first
      if (numBuffer) {
        tokens.push(numBuffer);
        numBuffer = "";
      }
      if (val !== "") tokens.push(val); // skip empty (unset blank)
    }
  }

  if (numBuffer) tokens.push(numBuffer);
  return tokens;
}

function evaluateTokens(tokens: string[]): number | null {
  if (tokens.length === 0) return null;
  try {
    const result = parseExpression(tokens, 0);
    if (result.pos !== tokens.length) return null;
    return result.value;
  } catch {
    return null;
  }
}

function evaluateExpression(tiles: Tile[]): NumVal | null {
  if (tiles.length === 0) return null;
  const tokens = tilesToTokens(tiles);
  return evaluateTokens(tokens);
}

export function validateEquation(tiles: Tile[]): boolean {
  if (tiles.length < 3) return false;

  // Tokenize first so multi-digit numbers are combined correctly
  const tokens = tilesToTokens(tiles);

  // console.log("ALL tokens:", tokens);

  // Find = positions in tokens
  const equalPositions: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === "=") equalPositions.push(i);
  }

  if (equalPositions.length === 0) return false;

  // Split tokens by =
  const parts: string[][] = [];
  let lastPos = 0;
  for (const eqPos of equalPositions) {
    const part = tokens.slice(lastPos, eqPos);
    if (part.length === 0) return false;
    parts.push(part);
    lastPos = eqPos + 1;
  }
  const finalPart = tokens.slice(lastPos);
  if (finalPart.length === 0) return false;
  parts.push(finalPart);

  // Evaluate each part
  const values: number[] = [];
  for (const part of parts) {
    const val = evaluateTokens(part);
    if (val === null) return false;
    values.push(val);
  }

  // All parts must be equal
  const firstVal = values[0];
  return values.every((val) => Math.abs(val - firstVal) < 0.0001);
}

interface ParseResult {
  value: number;
  pos: number;
}

function parseExpression(tokens: string[], pos: number): ParseResult {
  const result = parseTerm(tokens, pos);
  let value = result.value;
  pos = result.pos;

  while (pos < tokens.length && (tokens[pos] === "+" || tokens[pos] === "-")) {
    const op = tokens[pos];
    pos++;
    const right = parseTerm(tokens, pos);
    if (op === "+") value += right.value;
    else value -= right.value;
    pos = right.pos;
  }

  return { value, pos };
}

function parseTerm(tokens: string[], pos: number): ParseResult {
  const result = parseNumber(tokens, pos);
  let value = result.value;
  pos = result.pos;

  while (pos < tokens.length && (tokens[pos] === "×" || tokens[pos] === "÷")) {
    const op = tokens[pos];
    pos++;
    const right = parseNumber(tokens, pos);
    if (op === "×") value *= right.value;
    else {
      if (right.value === 0) throw new Error("Division by zero");
      value /= right.value;
    }
    pos = right.pos;
  }

  return { value, pos };
}

function parseNumber(tokens: string[], pos: number): ParseResult {
  // Handle unary minus
  if (pos < tokens.length && tokens[pos] === "-") {
    const right = parseNumber(tokens, pos + 1);
    return { value: -right.value, pos: right.pos };
  }

  if (pos >= tokens.length) throw new Error("Unexpected end");
  const tok = tokens[pos];
  const num = Number(tok);
  if (isNaN(num)) throw new Error(`Not a number: ${tok}`);
  return { value: num, pos: pos + 1 };
}

// -------- Board validation --------

export function getWordFromBoard(
  board: Cell[][],
  positions: { row: number; col: number }[],
  direction: "H" | "V",
): Tile[] {
  if (positions.length === 0) return [];

  const sorted = [...positions].sort((a, b) =>
    direction === "H" ? a.col - b.col : a.row - b.row,
  );

  const startRow = sorted[0].row;
  const startCol = sorted[0].col;

  let r = startRow;
  let c = startCol;

  // Walk backward
  while (r >= 0 && c >= 0 && board[r][c].tile) {
    if (direction === "H") c--;
    else r--;
  }
  if (direction === "H") c++;
  else r++;

  // Walk forward collecting tiles
  const tiles: Tile[] = [];
  while (r < 15 && c < 15 && board[r][c].tile) {
    tiles.push(board[r][c].tile!);
    if (direction === "H") c++;
    else r++;
  }

  return tiles;
}

export function validatePlacement(
  board: Cell[][],
  placed: PlacedTile[],
  isFirstMove: boolean,
): { valid: boolean; error?: string; equations: Tile[][] } {
  if (placed.length === 0)
    return { valid: false, error: "ยังไม่ได้วางเบี้ย", equations: [] };

  const rows = placed.map((p) => p.row);
  const cols = placed.map((p) => p.col);
  const uniqueRows = [...new Set(rows)];
  const uniqueCols = [...new Set(cols)];

  if (uniqueRows.length > 1 && uniqueCols.length > 1) {
    return {
      valid: false,
      error: "ต้องวางในแนวเดียวกัน (แนวนอนหรือแนวตั้ง)",
      equations: [],
    };
  }

  if (isFirstMove) {
    const center = placed.some((p) => p.row === 7 && p.col === 7);
    if (!center) {
      return {
        valid: false,
        error: "การวางครั้งแรกต้องผ่านช่องดาวกลาง",
        equations: [],
      };
    }
  } else {
    const connects = placed.some((p) => {
      const adj = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      return adj.some(([dr, dc]) => {
        const nr = p.row + dr;
        const nc = p.col + dc;
        return (
          nr >= 0 &&
          nr < 15 &&
          nc >= 0 &&
          nc < 15 &&
          board[nr][nc].tile &&
          !placed.some((pp) => pp.row === nr && pp.col === nc)
        );
      });
    });
    if (!connects) {
      return {
        valid: false,
        error: "ต้องเชื่อมต่อกับเบี้ยที่อยู่บนกระดาน",
        equations: [],
      };
    }
  }

  const direction: "H" | "V" = uniqueRows.length === 1 ? "H" : "V";

  const sortedPlaced = [...placed].sort((a, b) =>
    direction === "H" ? a.col - b.col : a.row - b.row,
  );

  for (let i = 0; i < sortedPlaced.length - 1; i++) {
    const current = sortedPlaced[i];
    const next = sortedPlaced[i + 1];
    const distance =
      direction === "H" ? next.col - current.col : next.row - current.row;

    if (distance > 1) {
      let hasExistingTile = false;
      for (let j = 1; j < distance; j++) {
        const checkRow = direction === "H" ? current.row : current.row + j;
        const checkCol = direction === "H" ? current.col + j : current.col;
        if (board[checkRow][checkCol].tile) {
          hasExistingTile = true;
          break;
        }
      }
      if (!hasExistingTile) {
        return {
          valid: false,
          error: "เบี้ยที่วางต้องติดต่อกันโดยไม่มีช่องว่าง",
          equations: [],
        };
      }
    }
  }

  const tempBoard: Cell[][] = board.map((row) =>
    row.map((cell) => ({ ...cell })),
  );
  for (const p of placed) {
    tempBoard[p.row][p.col] = { ...tempBoard[p.row][p.col], tile: p.tile };
  }

  const equations: Tile[][] = [];

  const mainEq = getWordFromBoard(
    tempBoard,
    sortedPlaced.map((p) => ({ row: p.row, col: p.col })),
    direction,
  );
  if (mainEq.length >= 3) equations.push(mainEq);

  for (const p of placed) {
    const crossEq = getWordFromBoard(
      tempBoard,
      [{ row: p.row, col: p.col }],
      direction === "H" ? "V" : "H",
    );
    if (crossEq.length >= 3) equations.push(crossEq);
  }

  if (equations.length === 0) {
    return {
      valid: false,
      error: "ไม่เกิดสมการที่มีความยาวเพียงพอ",
      equations: [],
    };
  }

  //console.log("equations found:", equations.length);
  // for (const eq of equations) {
  //   console.log(
  //     "eq:",
  //     eq.map((t) => getEffectiveValue(t)),
  //     "valid:",
  //     validateEquation(eq),
  //   );
  // }

  for (const eq of equations) {
    if (!validateEquation(eq)) {
      return {
        valid: false,
        error: `สมการ "${eq.map((t) => getEffectiveValue(t)).join(" ")}" ไม่ถูกต้องทางคณิตศาสตร์`,
        equations: [],
      };
    }
  }

  for (const eq of equations) {
    const isValid = validateEquation(eq);
    // console.log(
    //   "checking eq:",
    //   eq.map((t) => getEffectiveValue(t)),
    //   "→",
    //   isValid,
    // );
    if (!isValid) {
      return {
        valid: false,
        error: `สมการ "${eq.map((t) => getEffectiveValue(t)).join(" ")}" ไม่ถูกต้องทางคณิตศาสตร์`,
        equations: [],
      };
    }
  }

  return { valid: true, equations };
}

export function calculateScore(
  board: Cell[][],
  placed: PlacedTile[],
  equations: Tile[][],
): number {
  let totalScore = 0;

  const tempBoard: Cell[][] = board.map((row) =>
    row.map((cell) => ({ ...cell })),
  );
  for (const p of placed) {
    tempBoard[p.row][p.col] = { ...tempBoard[p.row][p.col], tile: p.tile };
  }

  const placedSet = new Set(placed.map((p) => `${p.row},${p.col}`));

  for (const eq of equations) {
    let eqScore = 0;
    let eqMultiplier = 1;

    const eqPositions = findEquationPositions(tempBoard, eq, placed);

    for (const pos of eqPositions) {
      const cell = tempBoard[pos.row][pos.col];
      const tile = cell.tile!;
      const isNewlyPlaced = placedSet.has(`${pos.row},${pos.col}`);

      let tileScore = tile.isBlank ? 0 : tile.points;

      if (isNewlyPlaced) {
        if (cell.type === "TRIPLE_NUM") tileScore *= 3;
        else if (cell.type === "DOUBLE_NUM") tileScore *= 2;
        else if (cell.type === "STAR") tileScore *= 2;

        if (cell.type === "TRIPLE_EQ") eqMultiplier = Math.max(eqMultiplier, 3);
        else if (cell.type === "DOUBLE_EQ")
          eqMultiplier = Math.max(eqMultiplier, 2);
      }

      eqScore += tileScore;
    }

    totalScore += eqScore * eqMultiplier;
  }

  if (placed.length === 8) totalScore += 40;

  return totalScore;
}

function findEquationPositions(
  board: Cell[][],
  tiles: Tile[],
  placed: PlacedTile[],
): { row: number; col: number }[] {
  const rows = placed.map((p) => p.row);
  const uniqueRows = [...new Set(rows)];
  const direction: "H" | "V" = uniqueRows.length === 1 ? "H" : "V";

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const positions: { row: number; col: number }[] = [];
      let match = true;
      for (let i = 0; i < tiles.length; i++) {
        const nr = direction === "H" ? r : r + i;
        const nc = direction === "H" ? c + i : c;
        if (nr >= 15 || nc >= 15) {
          match = false;
          break;
        }
        if (!board[nr][nc].tile) {
          match = false;
          break;
        }
        positions.push({ row: nr, col: nc });
      }
      if (match && positions.length === tiles.length) {
        const tileIds = positions.map((p) => board[p.row][p.col].tile!.id);
        const eqIds = tiles.map((t) => t.id);
        if (tileIds.every((id, i) => id === eqIds[i])) return positions;
      }
    }
  }

  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const positions: { row: number; col: number }[] = [];
      let match = true;
      for (let i = 0; i < tiles.length; i++) {
        const nr = r + i;
        const nc = c;
        if (nr >= 15) {
          match = false;
          break;
        }
        if (!board[nr][nc].tile) {
          match = false;
          break;
        }
        positions.push({ row: nr, col: nc });
      }
      if (match && positions.length === tiles.length) {
        const tileIds = positions.map((p) => board[p.row][p.col].tile!.id);
        const eqIds = tiles.map((t) => t.id);
        if (tileIds.every((id, i) => id === eqIds[i])) return positions;
      }
    }
  }

  return [];
}

export function calculateScorePreview(
  board: Cell[][],
  placedTiles: PlacedTile[],
): number {
  let totalScore = 0;
  if (!placedTiles || placedTiles.length === 0) return 0;

  const validPlacements = placedTiles.filter((placement) => {
    const isValid =
      placement &&
      typeof placement.row === "number" &&
      typeof placement.col === "number" &&
      placement.row >= 0 &&
      placement.row < 15 &&
      placement.col >= 0 &&
      placement.col < 15 &&
      placement.tile;
    if (!isValid) console.warn("Filtering out invalid placement:", placement);
    return isValid;
  });
  if (validPlacements.length === 0) return 0;

  const tempBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  for (const placement of validPlacements) {
    tempBoard[placement.row][placement.col] = {
      ...tempBoard[placement.row][placement.col],
      tile: placement.tile,
      isNew: true,
    };
  }

  const mainDirection =
    new Set(validPlacements.map((p) => p.row)).size === 1 ? "H" : "V";
  const sortedPlaced = [...validPlacements].sort((a, b) =>
    mainDirection === "H" ? a.col - b.col : a.row - b.row,
  );

  const equations: Tile[][] = [];
  const mainSeq = getWordFromBoard(
    tempBoard,
    sortedPlaced.map((p) => ({ row: p.row, col: p.col })),
    mainDirection,
  );
  if (mainSeq.length >= 3) equations.push(mainSeq);

  for (const placement of validPlacements) {
    const crossSeq = getWordFromBoard(
      tempBoard,
      [{ row: placement.row, col: placement.col }],
      mainDirection === "H" ? "V" : "H",
    );
    if (crossSeq.length >= 3) equations.push(crossSeq);
  }

  const placedSet = new Set(validPlacements.map((p) => `${p.row},${p.col}`));

  for (const eq of equations) {
    let eqScore = 0;
    let eqMultiplier = 1;
    const positions = findEquationPositions(tempBoard, eq, validPlacements);
    for (const pos of positions) {
      const cell = tempBoard[pos.row][pos.col];
      const tile = cell.tile!;
      const isNew = placedSet.has(`${pos.row},${pos.col}`);
      let tileScore = tile.isBlank ? 0 : tile.points;
      if (isNew) {
        if (cell.type === "TRIPLE_NUM") tileScore *= 3;
        else if (cell.type === "DOUBLE_NUM" || cell.type === "STAR")
          tileScore *= 2;
        if (cell.type === "TRIPLE_EQ") eqMultiplier = Math.max(eqMultiplier, 3);
        else if (cell.type === "DOUBLE_EQ")
          eqMultiplier = Math.max(eqMultiplier, 2);
      }
      eqScore += tileScore;
    }
    totalScore += eqScore * eqMultiplier;
  }

  if (validPlacements.length === 8) totalScore += 40;
  return totalScore;
}
