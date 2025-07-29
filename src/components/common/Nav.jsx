import React, { useContext, useState } from "react";
import LogoImg from "../../assets/images/Logo.webp";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
// icone
// import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import NotificationIcon from "../../assets/icons/notification.svg";
import { FaUser, FaCog } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { HiMenu, HiX } from "react-icons/hi";

const ulStyle =
  "link link-hover mx-2.5 text-gray-700 hover:text-[#FA6300] transition-colors duration-200";

const mobileUlStyle =
  "block py-3 px-4 text-gray-700 hover:text-[#FA6300] hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100";

function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, isAuthenticated, logout } = useContext(UserContext);
  const hideOnRoutes = ["/login", "/signup", "/forgetpass"];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  //to hide navbar
  if (hideOnRoutes.includes(location.pathname)) return null;

  // Function Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="Navbar flex items-center py-3 px-4 md:px-[56px] bg-[#fff] justify-between shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-50 sticky top-0 w-full">
      <div className="rightSide flex items-center">
        <div className="logo ml-2 md:ml-6">
          <img
            className="h-[32px] md:h-[40px]"
            src={LogoImg}
            loading="lazy"
            alt="Logo"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${ulStyle} ${
                isActive
                  ? "text-[#2D3142] font-bold underline underline-offset-6"
                  : ""
              }`
            }
          >
            الرئيسية
          </NavLink>

          <NavLink
            to="/auctions"
            className={({ isActive }) =>
              `${ulStyle} ${
                isActive
                  ? "text-[#2D3142] font-bold underline underline-offset-4"
                  : ""
              }`
            }
          >
            المزادات
          </NavLink>

          <NavLink
            to="/contact-us"
            className={({ isActive }) =>
              `${ulStyle} ${
                isActive
                  ? "text-[#2D3142] font-bold underline underline-offset-4"
                  : ""
              }`
            }
          >
            تواصل معنا
          </NavLink>

          <NavLink
            to="/faq"
            className={({ isActive }) =>
              `${ulStyle} ${
                isActive
                  ? "text-[#2D3142] font-bold underline underline-offset-4"
                  : ""
              }`
            }
          >
            الأسئلة الشائعة
          </NavLink>
        </div>
      </div>

      <div className="leftSide flex items-center gap-1">
        {isAuthenticated ? (
          <>
            {/* Desktop Authenticated Menu */}
            <div className="hidden md:flex items-center gap-1">
              {/* Notification icone */}
              <div className="pt-2 rounded-[15%] w-[40px] h-[40px] flex justify-center align-middle border-1 shadow-2xl border-[#BFC0C0] cursor-pointer">
                <img
                  src={NotificationIcon}
                  alt="notfication"
                  className="w-6 h-6"
                />
              </div>

              {/* add mazad BTN */}
              <button
                className="btn bg-[#FA6300] text-[16px] font-medium px-6 border-none rounded-lg mx-4 text-white"
                onClick={() => navigate("/addAuction")}
              >
                إضافة مزاد جديد
              </button>

              {/* img user  */}
              {userData?.profileImage ? (
                <img
                  className="w-[40px] h-[40px] rounded-full bg-[#f1f1f1]"
                  src={userData?.profileImage}
                  alt="user"
                />
              ) : (
                <FaUser className="w-[32px] h-[32px] rounded-full bg-[#f1f1f1] text-[#e46e37]" />
              )}

              {/* User name > Dropdown & log out */}
              <div className="dropdown dropdown-center">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn bg-transparent border-0 px-0 mr-1 text-[16px] text-[#2D3142]"
                >
                  {userData?.fullName}
                  <IoIosArrowDown className="text-orange-500 bg-[#f1f1f1] rounded-full w-[20px] h-[20px]" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-1 p-2 w-48 shadow-sm"
                >
                  <li className="flex-row justify-content-between items-center gap-2">
                    <a href="/profile">
                      الحساب الشخصي{" "}
                      <FaUser className="w-[16px] h-[16px] mr-6" />
                    </a>
                  </li>
                  {userData?.isAdmin && (
                    <li className="flex-row justify-content-between items-center gap-2">
                      <a href="/dashboard">
                        لوحة الإدارة{" "}
                        <FaCog className="w-[16px] h-[16px] mr-14" />
                      </a>
                    </li>
                  )}
                  <li className="flex-row justify-content-between items-center gap-2">
                    <a onClick={handleLogout}>
                      تسجيل خروج{" "}
                      <LuLogOut className="w-[16px] h-[16px] mr-12" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 hover:text-[#FA6300] focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <HiX className="w-6 h-6" />
                ) : (
                  <HiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Desktop Login Button */}
            <button
              className="hidden md:block btn bg-[#FA6300] text-[14px] md:text-[16px] font-medium px-4 md:px-6 border-none rounded-lg mx-2 md:mx-4 text-white"
              onClick={() => navigate("/login")}
            >
              تسجيل الدخول
            </button>

            {/* Mobile Hamburger Menu for Non-Authenticated Users */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 hover:text-[#FA6300] focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <HiX className="w-6 h-6" />
                ) : (
                  <HiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
          ></div>

          {/* Mobile Menu */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                  {isAuthenticated ? (
                    <>
                      {userData?.profileImage ? (
                        <img
                          className="w-[40px] h-[40px] rounded-full bg-[#f1f1f1]"
                          src={userData?.profileImage}
                          alt="user"
                        />
                      ) : (
                        <FaUser className="w-[32px] h-[32px] rounded-full bg-[#f1f1f1] text-[#e46e37]" />
                      )}
                      <span className="mr-3 text-[16px] text-[#2D3142] font-medium">
                        {userData?.fullName}
                      </span>
                    </>
                  ) : (
                    <span className="mr-3 text-[16px] text-[#2D3142] font-medium">
                      مرحباً بك في زايد
                    </span>
                  )}
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-md text-gray-700 hover:text-[#FA6300]"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4">
                <ul className="space-y-0">
                  <li>
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `${mobileUlStyle} ${
                          isActive ? "text-[#FA6300] bg-orange-50" : ""
                        }`
                      }
                      onClick={closeMobileMenu}
                    >
                      الرئيسية
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/auctions"
                      className={({ isActive }) =>
                        `${mobileUlStyle} ${
                          isActive ? "text-[#FA6300] bg-orange-50" : ""
                        }`
                      }
                      onClick={closeMobileMenu}
                    >
                      المزادات
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/contact-us"
                      className={({ isActive }) =>
                        `${mobileUlStyle} ${
                          isActive ? "text-[#FA6300] bg-orange-50" : ""
                        }`
                      }
                      onClick={closeMobileMenu}
                    >
                      تواصل معنا
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/faq"
                      className={({ isActive }) =>
                        `${mobileUlStyle} ${
                          isActive ? "text-[#FA6300] bg-orange-50" : ""
                        }`
                      }
                      onClick={closeMobileMenu}
                    >
                      الأسئلة الشائعة
                    </NavLink>
                  </li>
                </ul>
              </nav>

              {/* Mobile Menu Actions */}
              <div className="p-4 border-t border-gray-200 space-y-3">
                {isAuthenticated ? (
                  <>
                    {/* Notification */}
                    <button className="w-full flex items-center justify-center py-3 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <img
                        src={NotificationIcon}
                        alt="notfication"
                        className="w-5 h-5 ml-2"
                      />
                      <span className="text-gray-700">الإشعارات</span>
                    </button>

                    {/* Add Auction */}
                    <button
                      className="w-full btn bg-[#FA6300] text-white py-3 px-4 rounded-lg border-none"
                      onClick={() => {
                        navigate("/addAuction");
                        closeMobileMenu();
                      }}
                    >
                      إضافة مزاد جديد
                    </button>

                    {/* Profile */}
                    <a
                      href="/profile"
                      className="block w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <span className="text-gray-700">الحساب الشخصي</span>
                      <FaUser className="w-[16px] h-[16px] text-gray-500" />
                    </a>

                    {/* Dashboard (Admin only) */}
                    {userData?.isAdmin && (
                      <a
                        href="/dashboard"
                        className="block w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={closeMobileMenu}
                      >
                        <span className="text-gray-700">لوحة الإدارة</span>
                        <FaCog className="w-[16px] h-[16px] text-gray-500" />
                      </a>
                    )}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700"
                    >
                      <span>تسجيل خروج</span>
                      <LuLogOut className="w-[16px] h-[16px]" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Login Button for Non-Authenticated Users */}
                    <button
                      className="w-full btn bg-[#FA6300] text-white py-3 px-4 rounded-lg border-none"
                      onClick={() => {
                        navigate("/login");
                        closeMobileMenu();
                      }}
                    >
                      تسجيل الدخول
                    </button>

                    {/* Register Button for Non-Authenticated Users */}
                    <button
                      className="w-full flex items-center justify-center py-3 px-4 rounded-lg border border-[#FA6300] text-[#FA6300] hover:bg-[#FA6300] hover:text-white transition-colors"
                      onClick={() => {
                        navigate("/signup");
                        closeMobileMenu();
                      }}
                    >
                      إنشاء حساب جديد
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Nav;
