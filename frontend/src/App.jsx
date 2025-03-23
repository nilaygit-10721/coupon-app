import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClaimCoupon from "./pages/ClaimCoupon";
import Admin from "./pages/Admin";
import Login from "./pages/login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClaimCoupon />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
