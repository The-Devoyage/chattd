import { useContext } from "react";
import { GlobalContext } from "../../../../../provider";
import { MessageBubble } from "../message-bubble";
import dayjs from "dayjs";

export const Loading = () => {
  const { incomingMessage, loading } = useContext(GlobalContext);

  return (
    <>
      {incomingMessage && (
        <MessageBubble
          message={{
            text: incomingMessage,
            _id: "incoming",
            role: "Bot",
            _created_at: dayjs().toDate(),
          }}
        />
      )}
      {loading && (
        <div className="flex w-full justify-center">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      )}
    </>
  );
};
