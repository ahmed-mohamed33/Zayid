import React, { useContext } from "react";
import LogoImg from "../../assets/images/Logo.webp";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
// icone
// import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import NotificationIcon from "../../assets/icons/notification.svg";

const ulStyle =
  "link link-hover mx-2.5 text-gray-700 hover:text-[#FA6300] transition-colors duration-200";

function Nav() {
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
          to="/contact"
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
              className="btn bg-[#FA6300] text-[16px] font-medium px-6 border-none text-white mx-1"
              onClick={() => navigate("/addAuction")}
            >
              {" "}
              إضافة مزاد جديد
            </button>

            {/* img user  */}
            <img
              className=" w-[40px] h-[40px] rounded-full bg-gray-200"
              src=""
            />
            {/* User name > Dropdown & log out */}
            <div className="dropdown dropdown-bottom ">
              <div
                tabIndex={0}
                role="button"
                className="btn bg-transparent border-0 px-0 mr-1 text-[16px] text-[#2D3142]"
              >
                {userData?.fullName}
                <IoIosArrowDown className="text-orange-500" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-1 p-2 shadow-sm"
              >
                <li>
                  <a onClick={handleLogout}>تسجيل خروج</a>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <button
            className="btn bg-[#FA6300] text-white m-5"
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
