import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/common/Nav";
import Footer from "./components/common/Footer.jsx";

// Pages .
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AddAuctionPage from './Pages/AddAuctionPage.jsx';
import AuctionsPage from './Pages/AuctionsPage.jsx';

function App() {
  return (
     <div dir="rtl">
    <Router>
      <Navbar /> 

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/addAuction" element={<AddAuctionPage />} />
        <Route path="/auctions" element={<AuctionsPage />} />

      </Routes>

      <Footer /> 
    </Router>
    </div>
  );
}

export default App;
