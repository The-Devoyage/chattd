import { Copy, Save, SaveOff } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Message } from "../../../../../../../types";
import { invoke } from "@tauri-apps/api/core";

export const ActionBar: FC<{ message: Message }> = ({ message }) => {
  const [copyMessage, setCopyMessage] = useState(false);

  useEffect(() => {
    if (copyMessage) {
      const timeout = setTimeout(() => setCopyMessage(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [copyMessage]);

  const handleToggleSave = async () => {
    try {
      await invoke("update_message", { messageId: message._id, favorite: !message.favorite });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    setCopyMessage(true);
    navigator.clipboard.writeText(message.text);
  };

  return (
    <div className="flex w-full justify-end space-x-3">
      <label className="swap">
        <input type="checkbox" checked={message.favorite} onChange={() => handleToggleSave()} />
        <div className="swap-on">
          <Save />
        </div>
        <div className="swap-off">
          <SaveOff className="text-slate-600" />
        </div>
      </label>
      <div className="tooltip" data-tip={copyMessage ? "copied!" : "copy"}>
        <Copy
          onClick={handleCopy}
          role="button"
          className="text-slate-600 hover:text-slate-200 transition-all cursor-pointer"
        />
      </div>
    </div>
  );
};
