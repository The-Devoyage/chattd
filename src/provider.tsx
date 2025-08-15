import { invoke } from "@tauri-apps/api/core";
import { createContext, FC, ReactNode, useEffect, useMemo, useState } from "react";
import { Message } from "./types";
import { listen } from "@tauri-apps/api/event";

interface GlobalContext {
  messages: Message[];
  handleSendMessage: (incoming: Omit<Message, "_id">) => void;
  loading: boolean;
}

export const GlobalContext = createContext<GlobalContext>({
  messages: [],
  handleSendMessage: () => {},
  loading: false,
});

export const GlobalContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (incoming: Omit<Message, "_id">) => {
    setLoading(true);
    try {
      await invoke("save_message", { message: incoming });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const unlistenPromise = listen<Message>("message_created", (event) => {
      if (event.payload.role === "Bot") setLoading(false);
      setMessages((prev) => [...prev, event.payload]);
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  useEffect(() => {
    const unlistenPromise = listen<Message>("message_updated", (event) => {
      setMessages((prev) => {
        return prev.map((m) => {
          if (m._id === event.payload._id) {
            return event.payload;
          }
          return m;
        });
      });
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  useEffect(() => {
    const handleFetchMessages = async () => {
      const saved: Message[] = await invoke("read_messages", {});
      setMessages(saved);
    };
    handleFetchMessages();
  }, []);

  useEffect(() => {
    if (messages[messages.length - 1]?.role === "Bot") setLoading(false);
  }, [messages]);

  const value = useMemo(() => ({ messages, handleSendMessage, loading }), [messages, loading]);

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};
