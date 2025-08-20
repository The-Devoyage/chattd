import { Clock, FavoritesButton, FullscreenButton } from "./components";
import ChattdLogo from "../../../assets/chattd-icon.png";

export const Navbar = () => (
  <div className="navbar bg-base-200 shadow-sm sticky top-0 z-50 flex justify-between">
    <div className="flex items-center">
      <img alt="Chattd Logo" src={ChattdLogo} className="h-8 mx-2" />
      <h1 className="text-xl">Chattd</h1>
    </div>
    <div className="mr-4 flex space-x-2">
      <FavoritesButton />
      <FullscreenButton />
      <Clock />
    </div>
  </div>
);
