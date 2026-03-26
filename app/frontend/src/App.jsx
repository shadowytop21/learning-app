import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RoadmapPage from "./pages/RoadmapPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/roadmap/:id" element={<RoadmapPage />} />
      </Routes>
    </BrowserRouter>
  );
}
