import { useEffect, useState } from "react";
import dayjs from "dayjs";

export const Clock = () => {
  const [datetime, setDatetime] = useState(dayjs().format("hh:mm a"));

  useEffect(() => {
    const timeout = setInterval(() => {
      setDatetime(dayjs().format("hh:mm a"));
    }, 5000);

    return () => clearInterval(timeout);
  }, []);

  return <h2>{datetime}</h2>;
};
