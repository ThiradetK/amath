import { create } from "zustand";
import { Cell, Tile, TileValue } from "./types";
import {
  validatePlacement,
  validateEquation,
  getWordFromBoard,
} from "./gameLogic";

export interface PlayerInfo {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  rackCount: number;
  rack?: Tile[];
  finalRack?: Tile[]; // revealed after game ends
  rackPenalty?: number; // points deducted for remaining tiles
  emptyHandBonus?: number; // bonus awarded for emptying hand
}

export interface MoveRecord {
  playerName: string;
  type: "place" | "pass" | "exchange";
  score: number;
  equations: string[];
  bingo?: boolean;
  turnNumber: number;
}

export interface ServerState {
  roomId: string;
  gamePhase: "waiting" | "playing" | "ended";
  board: Cell[][];
  currentPlayerIndex: number;
  consecutivePasses: number;
  turnNumber: number;
  tileBagCount: number;
  winner: { id: string; name: string; score: number } | null;
  winners: { id: string; name: string; score: number }[];
  gameEndReason:
    | "EMPTY_HAND"
    | "ALL_PASS"
    | "TIMEOUT_STALL"
    | "DISCONNECT"
    | null;
  moveHistory: MoveRecord[];
  players: PlayerInfo[];
}

export interface RoomInfo {
  id: string;
  playerCount: number;
  maxPlayers: number;
  createdAt: number;
}

interface ChatMessage {
  from: string;
  message: string;
  at: number;
}

interface GameStore {
  connected: boolean;
  setConnected: (v: boolean) => void;
  screen: "connect" | "lobby" | "room" | "game";
  playerName: string;
  setPlayerName: (n: string) => void;
  roomList: RoomInfo[];
  myPlayerId: string | null;
  isHost: boolean;
  serverState: ServerState | null;
  selectedTile: Tile | null;
  selectedRackIndex: number | null;
  selectedPlacedIndex: number | null;
  placedThisTurn: { tile: Tile; row: number; col: number }[];
  localBoard: Cell[][];
  message: string;
  exchangeMode: boolean;
  exchangeSelected: number[];
  chatMessages: ChatMessage[];
  sendFn: ((type: string, payload?: Record<string, unknown>) => void) | null;
  setSendFn: (
    fn: (type: string, payload?: Record<string, unknown>) => void,
  ) => void;
  invalidCells: Set<string>; // เก็บ invalid cells เป็น "row,col"
  setInvalidCells: (cells: Set<string>) => void;
  turnTimeLeft: number; // seconds remaining in turn
  setTurnTimeLeft: (t: number | ((prev: number) => number)) => void;
  handleServerMessage: (
    msg: Record<string, unknown>,
    send: (type: string, payload?: Record<string, unknown>) => void,
  ) => void;
  selectTile: (tile: Tile, idx: number) => void;
  selectPlacedTile: (row: number, col: number) => void;
  placeOnBoard: (row: number, col: number) => void;
  recallFromBoard: (row: number, col: number) => void;
  recallAll: () => void;
  commitMove: () => void;
  passMove: () => void;
  startExchange: () => void;
  toggleExchangeTile: (idx: number) => void;
  confirmExchange: () => void;
  cancelExchange: () => void;
  sendChat: (message: string) => void;
  setBlankValue: (tileId: string, value: TileValue) => void;
  setMessage: (m: string) => void;
  goToLobby: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  // ✅ Helper: ตรวจสอบ placement และสร้าง invalidCells
  const validateAndSetInvalid = (
    placedThisTurn: { tile: Tile; row: number; col: number }[],
    localBoard: Cell[][],
  ) => {
    if (!localBoard || placedThisTurn.length === 0) {
      return new Set<string>();
    }

    const isFirstMove = localBoard.every((row) =>
      row.every(
        (cell) =>
          !cell.tile ||
          placedThisTurn.some((p) => p.row === cell.row && p.col === cell.col),
      ),
    );

    // Use full validation to catch ALL errors
    const { valid } = validatePlacement(
      localBoard,
      placedThisTurn,
      isFirstMove,
    );

    // If valid, no invalid cells
    if (valid) {
      return new Set<string>();
    }

    // If invalid, highlight tiles that cause equation errors
    const invalidSet = new Set<string>();

    const direction =
      placedThisTurn.length > 1 &&
      [...new Set(placedThisTurn.map((p) => p.row))].length === 1
        ? "H"
        : "V";

    const mainEq = getWordFromBoard(
      localBoard,
      placedThisTurn.map((p) => ({ row: p.row, col: p.col })),
      direction,
    );

    if (mainEq.length > 0 && !validateEquation(mainEq)) {
      placedThisTurn.forEach((p) => {
        const onLine =
          direction === "H"
            ? p.row === placedThisTurn[0].row
            : p.col === placedThisTurn[0].col;
        if (onLine) invalidSet.add(`${p.row},${p.col}`);
      });
    }

    for (const p of placedThisTurn) {
      const crossEq = getWordFromBoard(
        localBoard,
        [{ row: p.row, col: p.col }],
        direction === "H" ? "V" : "H",
      );
      if (crossEq.length > 0 && !validateEquation(crossEq)) {
        invalidSet.add(`${p.row},${p.col}`);
      }
    }

    return invalidSet;
  };

  return {
    connected: false,
    setConnected: (v) => set({ connected: v }),
    screen: "connect",
    playerName: "",
    setPlayerName: (n) => set({ playerName: n }),
    roomList: [],
    myPlayerId: null,
    isHost: false,
    serverState: null,
    selectedTile: null,
    selectedRackIndex: null,
    selectedPlacedIndex: null,
    placedThisTurn: [],
    localBoard: [],
    message: "",
    exchangeMode: false,
    exchangeSelected: [],
    chatMessages: [],
    sendFn: null,
    invalidCells: new Set(),
    setInvalidCells: (cells) => set({ invalidCells: cells }),
    turnTimeLeft: 180, // 3 minutes in seconds
    setTurnTimeLeft: (t) =>
      set((s) => ({
        turnTimeLeft: typeof t === "function" ? t(s.turnTimeLeft) : t,
      })),
    setSendFn: (fn) => set({ sendFn: fn }),

    handleServerMessage: (msg, send) => {
      const type = msg.type as string;
      switch (type) {
        case "ROOM_LIST":
          set({
            roomList: msg.rooms as RoomInfo[],
            screen: get().screen === "connect" ? "connect" : "lobby",
          });
          break;
        case "ROOM_JOINED": {
          const state = msg.state as ServerState;
          set({
            myPlayerId: msg.playerId as string,
            isHost: msg.isHost as boolean,
            serverState: state,
            localBoard: state.board
              ? state.board.map((r) => r.map((c) => ({ ...c })))
              : [],
            screen: state.gamePhase === "playing" ? "game" : "room",
            placedThisTurn: [],
            selectedTile: null,
            message: "",
            chatMessages: [],
          });
          break;
        }

        case "STATE_UPDATE": {
          const state = msg.state as ServerState;
          const {
            placedThisTurn,
            myPlayerId: me,
            serverState: oldState,
          } = get();

          // 🔥 บังคับให้มี board เท่านั้น
          if (!state.board) {
            console.error("STATE_UPDATE without board");
            return;
          }

          const localBoard: Cell[][] = state.board.map((r) =>
            r.map((c) => ({ ...c })),
          );

          const myPlayer = state.players.find((p) => p.id === me);
          const isMyTurn = state.players[state.currentPlayerIndex]?.id === me;

          const turnChanged =
            oldState?.currentPlayerIndex !== state.currentPlayerIndex;

          const newPlaced = isMyTurn ? placedThisTurn : [];

          // ✅ ตอนนี้ TS มั่นใจว่า localBoard ไม่ null แล้ว
          for (const p of newPlaced) {
            localBoard[p.row][p.col] = {
              ...localBoard[p.row][p.col],
              tile: p.tile,
              isNew: true,
            };
          }

          set({
            serverState: state,
            localBoard,
            placedThisTurn: newPlaced,
            invalidCells: new Set(),
            turnTimeLeft: turnChanged && isMyTurn ? 180 : get().turnTimeLeft,
            screen:
              state.gamePhase === "ended"
                ? "game"
                : state.gamePhase === "playing"
                  ? "game"
                  : "room",
            message:
              state.moveHistory.length >
              (get().serverState?.moveHistory.length || 0)
                ? (() => {
                    const last =
                      state.moveHistory[state.moveHistory.length - 1];
                    if (!last) return "";
                    if (last.type === "place")
                      return `${last.playerName} ได้ +${last.score} คะแนน${last.bingo ? " 🎉 บิงโก!" : ""}`;
                    if (last.type === "pass")
                      return `${last.playerName} ผ่านตา`;
                    if (last.type === "exchange")
                      return `${last.playerName} เปลี่ยนเบี้ย`;
                    return "";
                  })()
                : get().message,
          });
          break;
        }
        case "PLAYER_JOINED":
          set({ message: `${msg.name} เข้าร่วมห้อง` });
          break;
        case "PLAYER_LEFT":
          set({ message: `${msg.name} ออกจากห้อง` });
          break;
        case "CHAT":
          set((s) => ({
            chatMessages: [
              ...s.chatMessages,
              {
                from: msg.from as string,
                message: msg.message as string,
                at: Date.now(),
              },
            ].slice(-100),
          }));
          break;
        case "ERROR":
          set({ message: msg.message as string });
          break;
      }
    },

    selectTile: (tile, idx) => {
      const { selectedTile } = get();
      if (selectedTile?.id === tile.id)
        set({
          selectedTile: null,
          selectedRackIndex: null,
          selectedPlacedIndex: null,
        });
      else
        set({
          selectedTile: tile,
          selectedRackIndex: idx,
          selectedPlacedIndex: null,
        });
    },

    selectPlacedTile: (row, col) => {
      const { placedThisTurn, localBoard } = get();
      const placed = placedThisTurn.find((p) => p.row === row && p.col === col);
      if (placed && localBoard) {
        set({
          selectedTile: placed.tile,
          selectedRackIndex: null,
          selectedPlacedIndex: placedThisTurn.indexOf(placed),
        });
      }
    },

    placeOnBoard: (row, col) => {
      const {
        selectedTile,
        selectedPlacedIndex,
        placedThisTurn,
        localBoard,
        serverState,
        myPlayerId,
      } = get();
      if (!selectedTile || !localBoard || !serverState) return;
      if (localBoard[row][col].tile) {
        set({ message: "ช่องนี้มีเบี้ยอยู่แล้ว" });
        return;
      }

      const newBoard = localBoard.map((r) => r.map((c) => ({ ...c })));
      newBoard[row][col] = {
        ...newBoard[row][col],
        tile: selectedTile,
        isNew: true,
      };

      let newPlaced = [...placedThisTurn];
      let newRack =
        serverState.players.find((p) => p.id === myPlayerId)?.rack || [];

      if (selectedPlacedIndex !== null && placedThisTurn[selectedPlacedIndex]) {
        // Moving an already placed tile
        const oldPlaced = placedThisTurn[selectedPlacedIndex];
        newBoard[oldPlaced.row][oldPlaced.col] = {
          ...newBoard[oldPlaced.row][oldPlaced.col],
          tile: null,
          isNew: false,
        };
        newPlaced[selectedPlacedIndex] = { tile: selectedTile, row, col };
      } else {
        // Placing a tile from rack
        newRack = newRack.filter((t) => t.id !== selectedTile.id);
        newPlaced = [...placedThisTurn, { tile: selectedTile, row, col }];
      }

      set({
        localBoard: newBoard,
        placedThisTurn: newPlaced,
        serverState: {
          ...serverState,
          players: serverState.players.map((p) =>
            p.id === myPlayerId ? { ...p, rack: newRack } : p,
          ),
        },
        selectedTile: null,
        selectedRackIndex: null,
        selectedPlacedIndex: null,
        message: "",
        invalidCells: validateAndSetInvalid(newPlaced, newBoard),
      });
    },

    recallFromBoard: (row, col) => {
      const { placedThisTurn, localBoard, serverState, myPlayerId } = get();
      const placed = placedThisTurn.find((p) => p.row === row && p.col === col);
      if (!placed || !localBoard || !serverState) return;
      const newBoard = localBoard.map((r) => r.map((c) => ({ ...c })));
      newBoard[row][col] = { ...newBoard[row][col], tile: null, isNew: false };
      const myPlayer = serverState.players.find((p) => p.id === myPlayerId);
      // Reset blank tile to original blank state when recalling
      // Always assign a new id to avoid duplicate keys in React
      const recalledTile = placed.tile.isBlank
        ? {
            ...placed.tile,
            value: "BLANK" as const,
            displayValue: "?",
            blankValue: undefined,
            id: placed.tile.id + "-r" + Math.random().toString(36).slice(2, 7),
          }
        : {
            ...placed.tile,
            id: placed.tile.id + "-r" + Math.random().toString(36).slice(2, 7),
          };
      const newRack = [...(myPlayer?.rack || []), recalledTile];
      const newPlaced = placedThisTurn.filter(
        (p) => !(p.row === row && p.col === col),
      );
      set({
        localBoard: newBoard,
        placedThisTurn: newPlaced,
        serverState: {
          ...serverState,
          players: serverState.players.map((p) =>
            p.id === myPlayerId ? { ...p, rack: newRack } : p,
          ),
        },
        selectedTile: null,
        selectedRackIndex: null,
        selectedPlacedIndex: null,
        message: "",
        invalidCells: validateAndSetInvalid(newPlaced, newBoard),
      });
    },

    recallAll: () => {
      const { placedThisTurn, serverState, myPlayerId } = get();
      if (!placedThisTurn.length || !serverState) return;
      const myPlayer = serverState.players.find((p) => p.id === myPlayerId);
      // Reset blank tiles to original blank state when recalling all
      // Always assign a new id to avoid duplicate keys in React
      const resetTiles = placedThisTurn.map((p) =>
        p.tile.isBlank
          ? {
              ...p.tile,
              value: "BLANK" as const,
              displayValue: "?",
              blankValue: undefined,
              id: p.tile.id + "-r" + Math.random().toString(36).slice(2, 7),
            }
          : {
              ...p.tile,
              id: p.tile.id + "-r" + Math.random().toString(36).slice(2, 7),
            },
      );
      const newRack = [...(myPlayer?.rack || []), ...resetTiles];
      const newBoard = serverState.board.map((r) => r.map((c) => ({ ...c })));
      set({
        localBoard: newBoard,
        placedThisTurn: [],
        serverState: {
          ...serverState,
          players: serverState.players.map((p) =>
            p.id === myPlayerId ? { ...p, rack: newRack } : p,
          ),
        },
        selectedTile: null,
        selectedRackIndex: null,
        selectedPlacedIndex: null,
        message: "",
        invalidCells: new Set(),
      });
    },

    commitMove: () => {
      const { placedThisTurn, localBoard, sendFn } = get();
      if (!placedThisTurn.length) {
        set({ message: "ยังไม่ได้วางเบี้ย" });
        return;
      }

      if (!localBoard) return;

      // ✅ Full validation before sending
      const isFirstMove = localBoard.every((row) =>
        row.every(
          (cell) =>
            !cell.tile ||
            placedThisTurn.some(
              (p) => p.row === cell.row && p.col === cell.col,
            ),
        ),
      );

      const { valid, error } = validatePlacement(
        localBoard,
        placedThisTurn,
        isFirstMove,
      );

      if (!valid) {
        set({ message: error || "การวางเบี้ยไม่ถูกต้อง" });
        return;
      }

      // ✅ Valid: send to server
      sendFn?.("COMMIT_MOVE", { placed: placedThisTurn });
    },

    passMove: () => {
      const { sendFn } = get();
      get().recallAll();
      sendFn?.("PASS_MOVE");
    },

    startExchange: () => set({ exchangeMode: true, exchangeSelected: [] }),
    toggleExchangeTile: (idx) =>
      set((s) => ({
        exchangeSelected: s.exchangeSelected.includes(idx)
          ? s.exchangeSelected.filter((i) => i !== idx)
          : [...s.exchangeSelected, idx],
      })),
    confirmExchange: () => {
      const { exchangeSelected, serverState, myPlayerId, sendFn } = get();
      if (!exchangeSelected.length) return;
      const myPlayer = serverState?.players.find((p) => p.id === myPlayerId);
      const tileIds = exchangeSelected
        .map((i) => myPlayer?.rack?.[i]?.id)
        .filter(Boolean) as string[];
      sendFn?.("EXCHANGE_TILES", { tileIds });
      set({ exchangeMode: false, exchangeSelected: [] });
    },
    cancelExchange: () => set({ exchangeMode: false, exchangeSelected: [] }),

    sendChat: (message) => get().sendFn?.("CHAT", { message }),

    setBlankValue: (tileId, value) => {
      const { placedThisTurn, localBoard, serverState, myPlayerId } = get();
      const upd = (t: Tile) =>
        t.id === tileId
          ? { ...t, blankValue: value, displayValue: String(value) }
          : t;
      const newPlaced = placedThisTurn.map((p) =>
        p.tile.id === tileId ? { ...p, tile: upd(p.tile) } : p,
      );
      const newBoard =
        localBoard?.map((row) =>
          row.map((cell) =>
            cell.tile?.id === tileId ? { ...cell, tile: upd(cell.tile) } : cell,
          ),
        ) || null;
      set({
        placedThisTurn: newPlaced,
        localBoard: newBoard,
        serverState: serverState
          ? {
              ...serverState,
              players: serverState.players.map((p) =>
                p.id === myPlayerId ? { ...p, rack: p.rack?.map(upd) } : p,
              ),
            }
          : null,
        invalidCells: validateAndSetInvalid(newPlaced, newBoard),
      });
    },

    setMessage: (m) => set({ message: m }),

    goToLobby: () => {
      get().sendFn?.("LEAVE_ROOM");
      set({
        screen: "lobby",
        serverState: null,
        myPlayerId: null,
        placedThisTurn: [],
        localBoard: [],
        chatMessages: [],
        message: "",
      });
    },
  };
});
