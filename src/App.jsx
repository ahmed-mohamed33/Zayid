import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Footer from "./components/common/Footer";
import Forget from "./pages/forgetpass";

// Components
import Navbar from "./components/common/Nav";


// Pages

import Login from "./pages/Login";
// import HomePage from "./pages/HomePage";
import Products from "./pages/products";



function App() {
  return (
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
  );
}

export default App;
