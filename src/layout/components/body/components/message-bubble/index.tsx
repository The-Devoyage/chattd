import { FC } from "react";
import { Message } from "../../../../../types";
import clsx from "clsx";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChattdIcon from "../../../../../assets/chattd-icon.png";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ActionBar } from "./components";

export const MessageBubble: FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={clsx("w-full chat", message.role === "User" ? "chat-end" : "chat-start")}>
      {message.role === "Bot" && (
        <>
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <img alt="Chattd Icon" src={ChattdIcon} />
            </div>
          </div>
          <div className="chat-header">
            Chattd
            <time className="text-xs opacity-50">
              {new Date(message._created_at).toLocaleDateString()} at{" "}
              {new Date(message._created_at).toLocaleTimeString()}
            </time>
          </div>
        </>
      )}
      <div className={clsx("w-full chat-bubble", message.role === "Bot" && "bg-gray-800")}>
        <div className="prose overflow-hidden mb-3">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: (props) => {
                const { children, className, node, ...rest } = props;
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <SyntaxHighlighter
                    // {...rest}
                    // PreTag="div"
                    children={String(children).replace(/\n$/, "")}
                    language={match[1]}
                    style={nord}
                  />
                ) : (
                  <code {...rest} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.text}
          </Markdown>
        </div>
        <ActionBar message={message} />
      </div>
    </div>
  );
};
