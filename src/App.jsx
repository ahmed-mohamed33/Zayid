import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// Components
import Navbar from "./components/common/Nav";
import Footer from "./components/common/Footer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NotificationPermissionBanner from "./components/common/NotificationPermissionBanner";

// Pages .
import HomePage from "./Pages/HomePage";
import Payment from "./Pages/Payment.jsx";
import Login from "./Pages/Login.jsx";
import Forgetpass from "./Pages/forgetpass.jsx";
import TheauctionPage from "./Pages/TheauctionPage.jsx";
import SignUp from "./Pages/SignUp.jsx";
import OnboardingPage from "./Pages/OnboardingPage.jsx";
import AddAuctionPage from "./Pages/AddAuctionPage.jsx";
import AuctionsPage from "./Pages/AuctionsPage.jsx";

import AllDataComponent from "./UsserSchema.jsx";
import { UserProvider } from "../src/context/UserContext.jsx";
import TermsAndConditions from "./Pages/TermsAndConditions.jsx";
import ContactUs from "./Pages/ContactUs.jsx";
import Profile from "./Pages/Profile.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import FAq from "./Pages/FAq.jsx";
import ErrorPage from "./components/common/errorPage.jsx";
import TitleUpdater from "./components/common/TitleUpdater.jsx";
import ChatbotWidget from "./components/common/ChatbotWidget.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./components/ScrollToTop.js";

// Import notification utilities
import {
  initializeNotifications,
  saveFCMToken,
} from "./utils/notificationService";

function App() {
  useEffect(() => {
    const initializeServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          // Wait for the page to load completely
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", async () => {
              await registerServiceWorker();
            });
          } else {
            await registerServiceWorker();
          }
        } catch (error) {
          console.error("Service Worker initialization failed:", error);
        }
      }
    };

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        console.log("Service Worker is ready");

        // Initialize notifications after service worker is ready
        await initializeWebNotifications();
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    const initializeWebNotifications = async () => {
      try {
        // Check if notifications are supported
        if (!("Notification" in window)) {
          console.log("Notifications not supported");
          return;
        }

        // Check if permission is already granted
        if (Notification.permission === "granted") {
          console.log("Notification permission already granted");
          // Initialize notifications for web
          const result = await initializeNotifications();
          if (result.success && result.token) {
            console.log("Web FCM token obtained:", result.token);
            // Save the web token to database (this will be done in the context)
          }
        } else if (Notification.permission === "default") {
          console.log("Notification permission not yet requested");
        } else {
          console.log("Notification permission denied");
        }
      } catch (error) {
        console.error("Error initializing web notifications:", error);
      }
    };

    initializeServiceWorker();
  }, []);

  return (
    <div dir="rtl">
      <UserProvider>
        <Router>
          <ScrollToTop />
          <Navbar />
          <AllDataComponent />
          <TitleUpdater />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<Login />} />

            <Route path="/forgetpass" element={<Forgetpass />} />

            <Route path="/selectCategory" element={<OnboardingPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auctions" element={<AuctionsPage />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/faq" element={<FAq />} />

            <Route element={<ProtectedRoute requireActive={true} />}>
              <Route path="/addAuction" element={<AddAuctionPage />} />

              <Route path="/payment/:auctionId/:type" element={<Payment />} />
              <Route path="/auction/:auctionId" element={<TheauctionPage />} />
            </Route>

            <Route path="/signUp" element={<SignUp />} />
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
          <NotificationPermissionBanner />

          <Footer />
          <ChatbotWidget />
          <ToastContainer position="top-center" autoClose={3000} />
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;
