import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/common/Nav";
import Footer from "./components/common/Footer.jsx";

// Pages .
import HomePage from "./Pages/HomePage";

import RegisterPage from "./Pages/RegisterPage";
import Payment from "./Pages/Payment.jsx";

import AuctionPage from "./Pages/Auctionpage.jsx";
import AuctionsFireBaseTest from "./Pages/AuctionsFireBaseTest.jsx";
import LoginPageFireBaseTest from "./Pages/LoginPageFireBaseTest.jsx";
import SelectCategoryPage from "./Pages/SelectCategoryPage.jsx";
import SignUp from "./Pages/SignUp.jsx";
import StepOverview from "./Pages/StepOverview.jsx";
import StartStep from "./Pages/Start.jsx";

function App() {
  return (
    <div dir="rtl">
      <Router>
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
         
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/auction" element={<AuctionPage />} />
          <Route path="/auctionsFireBaseTest" element={<AuctionsFireBaseTest />} />
          <Route path="/loginFireBaseTest" element={<LoginPageFireBaseTest />} />
          <Route path="/selectCategory" element={<SelectCategoryPage />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/stepOverview" element={<StepOverview />} />
          <Route path="/start" element={<StartStep />} />
        </Routes>

        <Footer />
      </Router>
    </div>
  );
}

export default App;
