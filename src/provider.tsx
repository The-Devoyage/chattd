import { invoke } from "@tauri-apps/api/core";
import { createContext, FC, ReactNode, useEffect, useMemo, useState } from "react";
import { Message } from "./types";

interface GlobalContext {
  messages: Message[];
  handleSendMessage: (incoming: Omit<Message, "_id">) => void;
}

export const GlobalContext = createContext<GlobalContext>({
  messages: [],
  handleSendMessage: () => {},
});

export const GlobalContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (incoming: Omit<Message, "_id">) => {
    try {
      const saved: Message = await invoke("save_message", { message: incoming });
      setMessages((curr) => [...curr, saved]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleFetchMessages = async () => {
      const saved: Message[] = await invoke("read_messages", {});
      setMessages(saved);
    };
    handleFetchMessages();
  }, []);

  const value = useMemo(() => ({ messages, handleSendMessage }), [messages]);

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};
