import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "./store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { handleServerMessage } = useGameStore();

  const send = useCallback(
    (type: string, payload: Record<string, unknown> = {}) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, ...payload }));
      }
    },
    [],
  );

  useEffect(() => {
    if (!WS_URL) {
      console.error("NEXT_PUBLIC_WS_URL is not defined");
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      useGameStore.getState().setConnected(true);
      send("GET_ROOMS");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleServerMessage(msg, send);
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    ws.onclose = () => {
      useGameStore.getState().setConnected(false);
    };

    ws.onerror = () => {
      useGameStore.getState().setConnected(false);
    };

    return () => ws.close();
  }, [handleServerMessage, send]);

  return { send };
}
