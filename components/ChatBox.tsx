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
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 min-h-0">
        {chatMessages.length === 0 && (
          <div className="text-white/40 text-xs lg:text-sm text-center py-3">
            ยังไม่มีข้อความ
          </div>
        )}

        {chatMessages.map((msg, i) => {
          const isMe = msg.from === playerName;

          return (
            <div
              key={i}
              className={`px-3 py-2 rounded-xl text-xs lg:text-sm leading-relaxed
                ${
                  isMe
                    ? "bg-amber-700/40 text-amber-100 text-right"
                    : "bg-white/10 text-white/80"
                }`}
            >
              {!isMe && (
                <div className="text-[11px] lg:text-xs font-semibold text-white/50 mb-0.5">
                  {msg.from}
                </div>
              )}
              <div className="break-words">{msg.message}</div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="พิมพ์ข้อความ..."
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 
                     text-white text-sm focus:outline-none 
                     focus:border-amber-500 placeholder:text-white/40"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 
                     disabled:opacity-40 text-white rounded-xl 
                     text-sm font-semibold transition-all"
        >
          ส่ง
        </button>
      </div>
    </div>
  );
}
