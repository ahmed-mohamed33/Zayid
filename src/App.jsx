<<<<<<< Updated upstream
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Footer from "./components/common/Footer";
import Forget from "./pages/forgetpass";
=======
import { Routes, Route, useLocation } from "react-router-dom";
>>>>>>> Stashed changes

// Components
import Navbar from "./components/common/Nav";


<<<<<<< Updated upstream
// Pages

import Login from "./pages/Login";
// import HomePage from "./pages/HomePage";
import Products from "./pages/products";


=======

import Payment from "./Pages/Payment.jsx";
import Login from "./Pages/Login.jsx";
import Products from "./Pages/products.jsx";
import Forgetpass from "./Pages/forgetpass.jsx";
import AuctionPage from "./Pages/AuctionPage.jsx";
import SelectCategoryPage from "./Pages/SelectCategoryPage.jsx";
import SignUp from "./Pages/SignUp.jsx";
import StepOverview from "./Pages/StepOverview.jsx";
import StartStep from "./Pages/Start.jsx";
import AddAuctionPage from "./Pages/AddAuctionPage.jsx";
import Dashboard from "./Pages/Dashboard.jsx";

//to show schema
import AllDataComponent from "./UsserSchema.jsx";
import { UserProvider } from "../src/context/UserContext.jsx";
>>>>>>> Stashed changes

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard" ;
  const isLogin = location.pathname === "/login"
  const isRegister = location.pathname === "/signup";

  return (
<<<<<<< Updated upstream
    <Router>
      {/* <Navbar />  */}

      <Routes>
        {/* <Route path="/login" element={<Login />} />
        

        <Route path="/forgetpass" element={<Forget />} />
        <Route path="*" element={<Navigate to="/login" />} /> */}

        <Route path="/" element={<Products />} />

       
      </Routes>

      {/* <Footer /> */}
    </Router>
=======
    <div dir="rtl">
      <UserProvider>
        {!isDashboard && !isLogin && !isRegister && <Navbar />}
        <AllDataComponent />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/forgetpass" element={<Forgetpass />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/auction/:auctionId" element={<AuctionPage />} />

          <Route path="/selectCategory" element={<SelectCategoryPage />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/stepOverview" element={<StepOverview />} />
          <Route path="/start" element={<StartStep />} />
          <Route path="/addAuction" element={<AddAuctionPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        {!isDashboard && !isLogin && !isRegister && <Footer />}
      </UserProvider>
    </div>
>>>>>>> Stashed changes
  );
}

export default App;
