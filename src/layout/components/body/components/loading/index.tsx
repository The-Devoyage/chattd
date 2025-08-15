import { FC } from "react";

export const Loading: FC<{ loading: boolean }> = ({ loading }) => {

  if (!loading) return null;

  return (
    <div className="flex w-full justify-center">
      <span className="loading loading-dots loading-lg"></span>
    </div>
  );
};
