import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/common/Nav";
import Footer from "./components/common/Footer.jsx";

// Pages .
import HomePage from "./Pages/HomePage";

import RegisterPage from "./Pages/RegisterPage";
import Payment from "./Pages/Payment.jsx";
import Login from "./Pages/Login.jsx";
import Products from "./Pages/products.jsx";
import Forgetpass from "./Pages/forgetpass.jsx";
// انا غيرت اسم الصفحه دي علشان المشكله تتحل
import TheauctionPage from "./Pages/TheauctionPage.jsx";

import SignUp from "./Pages/SignUp.jsx";
import OnboardingPage from "./Pages/OnboardingPage.jsx";
import AddAuctionPage from "./Pages/AddAuctionPage.jsx";
import AuctionsPage from "./Pages/AuctionsPage.jsx";
//to show schema
import AllDataComponent from "./UsserSchema.jsx";
import { UserProvider } from "../src/context/UserContext.jsx";
// import Dashboard from "./Pages/Dashboard.jsx";
import TermsAndConditions from "./Pages/TermsAndConditions.jsx";
import ContactUs from "./Pages/ContactUs.jsx";

function App() {
  return (
    <div dir="rtl">
      <UserProvider>
        <Router>
          <Navbar />
          <AllDataComponent />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<Products />} />
            <Route path="/forgetpass" element={<Forgetpass />} />
            <Route
              path="/payment/:auctionId/:type"
              element={<Payment />}
            />{" "}
            {/**غيرت البارامز لان انا بباصي التايب في اللينك*/}
            <Route path="/auction/:auctionId" element={<TheauctionPage />} />
            <Route path="/selectCategory" element={<OnboardingPage />} />
            <Route path="/signUp" element={<SignUp />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/addAuction" element={<AddAuctionPage />} />
            <Route path="/auctions" element={<AuctionsPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/contact-us" element={<ContactUs />} />
            
          </Routes>
          <Footer />
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;
