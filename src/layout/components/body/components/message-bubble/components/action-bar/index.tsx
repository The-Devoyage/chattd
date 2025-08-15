import { Copy, Save, SaveOff } from "lucide-react";
import { FC } from "react";
import { Message } from "../../../../../../../types";
import { invoke } from "@tauri-apps/api/core";

export const ActionBar: FC<{ message: Message }> = ({ message }) => {
  const handleToggleSave = async () => {
    try {
      await invoke("update_message", { messageId: message._id, favorite: !message.favorite });
    } catch (err) {
      console.error(err);
    }
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
      <Copy />
    </div>
  );
};
