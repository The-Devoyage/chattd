import { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../../../provider";

export const Footer = () => {
  const { handleSendMessage } = useContext(GlobalContext);
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage({ text: e.currentTarget.value, role: "User" });
      setValue("");
    }
  };

  useEffect(() => {
    if (ref.current) ref.current.focus();
    const handleFocus = () => {
      if (ref.current) ref.current.focus();
    };

    document.addEventListener("blur", handleFocus);
    document.addEventListener("focus", handleFocus);

    () => {
      document.removeEventListener("blur", handleFocus);
      document.removeEventListener("focus", handleFocus);
    };
  }, [ref.current]);

  return (
    <div className="navbar bg-base-100 shadow-sm sticky bottom-0">
      <textarea
        ref={ref}
        value={value}
        className="textarea w-full"
        placeholder="Say something..."
        onChange={(e) => setValue(e.target.value)}
        onKeyUp={handleKeyUp}
      />
    </div>
  );
};
