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
import SelectCategoryPage from "./Pages/SelectCategoryPage.jsx";
import SignUp from "./Pages/SignUp.jsx";
import StepOverview from "./Pages/StepOverview.jsx";
import StartStep from "./Pages/Start.jsx";
import AddAuctionPage from "./Pages/AddAuctionPage.jsx";
import AuctionsPage from "./Pages/AuctionsPage.jsx";
//to show schema
import AllDataComponent from "./UsserSchema.jsx";
import { UserProvider } from "../src/context/UserContext.jsx";

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
            <Route path="/payment/:auctionId/:type" element={<Payment />} /> {/**غيرت البارامز لان انا بباصي التايب في اللينك*/}
            <Route path="/auction/:auctionId" element={<TheauctionPage />} />

            <Route path="/selectCategory" element={<SelectCategoryPage />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/stepOverview" element={<StepOverview />} />
            <Route path="/start" element={<StartStep />} />
            <Route path="/addAuction" element={<AddAuctionPage />} />
            <Route path="/auctions" element={<AuctionsPage />} />
          </Routes>
          <Footer />
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;