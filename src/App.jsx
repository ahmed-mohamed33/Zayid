import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/common/Nav";
import Footer from "./components/common/Footer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute";

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
import TermsAndConditions from "./Pages/TermsAndConditions.jsx";
import ContactUs from "./Pages/ContactUs.jsx";
import Profile from "./Pages/Profile.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import FAq from "./Pages/FAq.jsx";
import ErrorPage from "./components/common/errorPage.jsx";

function App() {
  return (
    <div dir="rtl">
      <UserProvider>
        <Router>
          <Navbar />
          <AllDataComponent />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<Login />} />

            <Route path="/forgetpass" element={<Forgetpass />} />

            <Route path="/selectCategory" element={<OnboardingPage />} />
            <Route path="/signUp" element={<SignUp />} />

            <Route path="/auctions" element={<AuctionsPage />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/faq" element={<FAq />} />

            
            <Route element={<ProtectedRoute requireActive={true} />}>
              <Route path="/addAuction" element={<AddAuctionPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment/:auctionId/:type" element={<Payment />} />
              <Route path="/auction/:auctionId" element={<TheauctionPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>

            
            <Route
              element={
                <ProtectedRoute requireActive={true} requireAdmin={true} />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route
              path="*"
              element={
                <ErrorPage
                  message="عذرًا، الصفحة التي تبحث عنها غير موجودة أو ليس لديك صلاحية الوصول إليها."
                  redirectTo="/"
                />
              }
            />
          </Routes>
          <Footer />
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;
