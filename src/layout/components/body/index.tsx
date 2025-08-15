import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../../../provider";
import clsx from "clsx";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChattdIcon from "../../../assets/chattd-icon.png";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";

export const Body = () => {
  const { messages, loading } = useContext(GlobalContext);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex justify-center items-end">
      <div className="space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={clsx("chat", m.role === "User" ? "chat-end" : "chat-start")}>
            {m.role === "Bot" && (
              <>
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img alt="Chattd Icon" src={ChattdIcon} />
                  </div>
                </div>
                <div className="chat-header">
                  Chattd
                  <time className="text-xs opacity-50">
                    {new Date(m._created_at).toLocaleDateString()} at{" "}
                    {new Date(m._created_at).toLocaleTimeString()}
                  </time>
                </div>
              </>
            )}
            <div className={clsx("chat-bubble", m.role === "Bot" && "bg-gray-800")}>
              <div className="prose lg:prose-xl">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: (props) => {
                      const { children, className, node, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter
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
                  {m.text}
                </Markdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex w-full justify-center">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
