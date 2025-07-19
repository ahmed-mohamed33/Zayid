import React, { useContext } from "react";
import LogoImg from "../../assets/images/Logo.webp";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
// icone
// import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import NotificationIcon from "../../assets/icons/notification.svg";
import { FaUser } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";

const ulStyle =
  "link link-hover mx-2.5 text-gray-700 hover:text-[#FA6300] transition-colors duration-200";

function Nav() {
  const location = useLocation();
  const hideOnRoutes = ["/login", "/signup", "/forgetpass"];
  //to hide navbar
  if (hideOnRoutes.includes(location.pathname)) return null;

  const navigate = useNavigate();
  const { userData, isAuthenticated, logout } = useContext(UserContext);

  // Function Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <div className="Navbar flex items-center py-3 px-[56px] bg-[#fff] justify-between shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-10 sticky top-0 w-full">
      <div className="rightSide flex items-center">
        <div className="logo ml-6">
          <img className=" h-[40px]" src={LogoImg} loading="lazy" alt="Logo" />
        </div>
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
      <div className="leftSide flex items-center gap-1">
        {isAuthenticated ? (
          <>
            {/* Notification icone */}
            <div className=" pt-2 rounded-[15%] w-[40px] h-[40px] flex justify-center align-middle border-1 shadow-2xl border-[#BFC0C0]  cursor-pointer">
              {" "}
              <img
                src={NotificationIcon}
                alt="notfication"
                className="w-6 h-6 "
              />
            </div>

            {/* add mazad BTN */}
            <button
              className="btn bg-[#FA6300] text-[16px] font-medium px-6 border-none rounded-lg mx-4 text-white"
              onClick={() => navigate("/addAuction")}
            >
              {" "}
              إضافة مزاد جديد
            </button>

            {/* img user  */}
            {userData?.profileImage ? (
              <img
                className=" w-[40px] h-[40px] rounded-full bg-[#f1f1f1]"
                src={userData?.profileImage}
                alt="user"
              />
            ) : (
              <FaUser className="w-[32px] h-[32px] rounded-full bg-[#f1f1f1] text-[#e46e37]" />
            )}
            {/* User name > Dropdown & log out */}
            <div className="dropdown  dropdown-center ">
              <div
                tabIndex={0}
                role="button"
                className="btn bg-transparent border-0 px-0 mr-1 text-[16px]  text-[#2D3142]"
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
                    الحساب الشخصي <FaUser className="w-[16px] h-[16px] mr-6" />
                  </a>
                </li>
                <li className="flex-row justify-content-between items-center gap-2">
                  <a onClick={handleLogout}>
                    تسجيل خروج <LuLogOut className="w-[16px] h-[16px] mr-12" />
                  </a>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <button
            className="btn bg-[#FA6300] text-[16px] font-medium px-6 border-none rounded-lg mx-4 text-white "
            onClick={() => navigate("/login")}
          >
            تسجيل الدخول
          </button>
        )}
      </div>
    </div>
  );
}

export default Nav;
