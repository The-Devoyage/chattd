import { useContext, useState } from "react";
import { GlobalContext } from "../../../provider";

export const Footer = () => {
  const { handleSendMessage } = useContext(GlobalContext);
  const [value, setValue] = useState("");

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage({ text: e.currentTarget.value, role: "User" });
      setValue("");
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <textarea
        value={value}
        className="textarea w-full"
        placeholder="Say something..."
        onChange={(e) => setValue(e.target.value)}
        onKeyUp={handleKeyUp}
      />
    </div>
  );
};
