import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../../../provider";
import { MessageBubble, Loading } from "./components";

export const Body = () => {
  const { messages, loading } = useContext(GlobalContext);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex justify-center items-end">
      <div className="w-full space-y-8">
        {messages.map((m) => (
          <MessageBubble message={m} key={m._id} />
        ))}
        <Loading loading={loading} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
