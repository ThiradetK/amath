"use client";
import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/lib/store";

export default function ChatBox() {
  const { chatMessages, sendChat, playerName } = useGameStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendChat(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-1 mb-2 min-h-0">
        {chatMessages.length === 0 && (
          <div className="text-white/20 text-[10px] lg:text-sm text-center py-3">
            ยังไม่มีข้อความ
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`text-[10px] font-semibold lg:text-sm px-2 py-1.5 rounded-lg ${msg.from === playerName ? "bg-amber-900/30 text-amber-500 text-right" : "bg-white/5 text-white/20"}`}
          >
            {msg.from !== playerName && (
              <span className="font-bold text-white/20 block">{msg.from}</span>
            )}
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="พิมพ์ข้อความ..."
          className="flex-1 bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5 text-white text-[10px] lg:text-sm focus:outline-none focus:border-amber-600 placeholder:text-white/20"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-2.5 py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-30 text-white rounded-lg text-[10px] lg:text-sm font-bold transition-all"
        >
          ส่ง
        </button>
      </div>
    </div>
  );
}
