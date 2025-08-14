import { useContext } from "react";
import { GlobalContext } from "../../../provider";
import clsx from "clsx";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Body = () => {
  const { messages } = useContext(GlobalContext);

  return (
    <div className="flex justify-center items-end">
      <div className="container">
        {messages.map((m) => (
          <div className={clsx("chat", m.role === "user" ? "chat-end" : "chat-start")}>
            <div className="chat-bubble">
              <div className="prose">
                <Markdown remarkPlugins={[remarkGfm]}>{m.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
