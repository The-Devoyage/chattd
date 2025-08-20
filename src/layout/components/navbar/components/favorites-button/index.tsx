import { SaveAll } from "lucide-react";
import { useContext } from "react";
import { GlobalContext } from "../../../../../provider";

export const FavoritesButton = () => {
  const { favorites, setFavorites } = useContext(GlobalContext);

  return (
    <label className="swap ">
      <input type="checkbox" checked={favorites} onChange={() => setFavorites((curr) => !curr)} />
      <div className="swap-on">
        <SaveAll className="h-4 text-slate-200" />
      </div>
      <div className="swap-off">
        <SaveAll className="h-4 text-slate-600" />
      </div>
    </label>
  );
};
