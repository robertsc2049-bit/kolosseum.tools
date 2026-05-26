import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import IronClock from "./pages/IronClock.jsx";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tools/ironclock" element={<IronClock />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
