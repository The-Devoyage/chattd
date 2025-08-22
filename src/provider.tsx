import { invoke } from "@tauri-apps/api/core";
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Message } from "./types";
import { listen } from "@tauri-apps/api/event";

interface GlobalContext {
  messages: Message[];
  handleSendMessage: (incoming: Omit<Message, "_id" | "_created_at">) => void;
  loading: boolean;
  favorites: boolean;
  setFavorites: Dispatch<SetStateAction<boolean>>;
  incomingMessage: string;
}

export const GlobalContext = createContext<GlobalContext>({
  messages: [],
  handleSendMessage: () => {},
  loading: false,
  favorites: false,
  setFavorites: () => {},
  incomingMessage: "",
});

export const GlobalContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [incomingMessage, setIncomingMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(false);

  const handleFetchMessages = useCallback(async () => {
    let query = {};
    if (favorites) query = { favorites: true };
    const saved: Message[] = await invoke("read_messages", query);
    setMessages(saved);
  }, [favorites]);

  const handleSendMessage = async (incoming: Omit<Message, "_id" | "_created_at">) => {
    setLoading(true);
    try {
      await invoke("save_message", { message: incoming });
    } catch (err) {
      // TODO: Show better error...
      console.error(err);
    }
  };

  useEffect(() => {
    const unlistenPromise = listen<Message>("message_created", (event) => {
      if (event.payload.role === "Bot") {
        setLoading(false);
      }
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
    const unlistenPromise = listen<string>("message_streaming", (event) => {
      setIncomingMessage((curr) => (curr += event.payload));
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  useEffect(() => {
    const unlistenPromose = listen<Message>("message_stream_finished", (event) => {
      setIncomingMessage("");
      setMessages((curr) => [...curr, event.payload]);
      setLoading(false);
    });

    return () => {
      unlistenPromose.then((unlisten) => unlisten());
    };
  }, []);

  useEffect(() => {
    handleFetchMessages();
  }, [favorites]);

  const value = useMemo(
    () => ({ messages, handleSendMessage, loading, favorites, setFavorites, incomingMessage }),
    [messages, loading, favorites, incomingMessage],
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};
