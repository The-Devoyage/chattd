// import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Footer, Navbar, Body } from "./layout/components";
import { GlobalContextProvider } from "./provider";

function App() {
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  return (
    <main className="flex flex-col h-screen justify-between items-center">
      <GlobalContextProvider>
        <Navbar />
        <div className="container">
          <Body />
          <div>
            <Footer />
          </div>
        </div>
      </GlobalContextProvider>
    </main>
  );
}

export default App;
