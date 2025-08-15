import "./App.css";
import { Footer, Navbar, Body } from "./layout/components";
import { GlobalContextProvider } from "./provider";

function App() {
  return (
    <main className="flex flex-col h-screen justify-between items-center">
      <GlobalContextProvider>
        <div className="flex shrink-0 w-full">
          <Navbar />
        </div>
        <div className="container flex-1 overflow-y-auto">
          <Body />
        </div>
        <div className="container shrink-0">
          <Footer />
        </div>
      </GlobalContextProvider>
    </main>
  );
}

export default App;
