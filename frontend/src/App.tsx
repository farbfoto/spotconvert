import { BrowserRouter, Route, Routes } from "react-router-dom";
import Convert from "./pages/Convert";
import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import Result from "./pages/Result";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/convert" element={<Convert />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}
