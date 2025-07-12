import React, { useContext } from 'react';
import LogoImg from '../../assets/images/Logo.webp';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
// icone
import { IoNotificationsOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";


const ulStyle = "link link-hover mx-2.5 text-gray-700 hover:text-[#FA6300] transition-colors duration-200";

function Nav() {
  const navigate = useNavigate();
  const { userData, isAuthenticated, logout } = useContext(UserContext); 

  // Function Logout
  const handleLogout = async () => {
    try {
      await logout(); 
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };
  

  return (
    <div className="Navbar flex items-center py-3 px-7 bg-[#F1F1F1] justify-between shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-10 sticky top-0 w-full">
      <div className="rightSide flex items-center">
        <div className="logo ml-9">
          <img className="w-[70px] h-[35px]" src={LogoImg} loading="lazy" alt="Logo" />
        </div>
        <ul className="flex items-center">
          <li><Link to="/" className={ulStyle}>الرئيسية</Link></li>
          <li><Link to="/auctions" className={ulStyle}>المذادات</Link></li>
          <li><Link to="/contact" className={ulStyle}>تواصل معنا</Link></li>
          <li><Link to="/faq" className={ulStyle}>FAQ</Link></li>
        </ul>
      </div>
      <div className="leftSide flex items-center gap-1">
        {isAuthenticated ? (
          <>
          {/* Notification icone */}
            <div className=' p-1 rounded-[15%] font-bold border-1 shadow-2xl border-[#BFC0C0] text-[#344258] cursor-pointer'> <IoNotificationsOutline /></div>
            {/* User name > Dropdown & log out */}
            <div className="dropdown dropdown-bottom ">
                <div tabIndex={0} role="button" className="btn bg-transparent border-0">
                    <IoIosArrowDown className='text-orange-500'/>
                    {userData?.fullName}
                </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                      <li><a  onClick={handleLogout}>تسجيل خروج</a></li>
                  </ul>
            </div>
            {/* img user  */}
            <img className=' w-[30px] h-[30px] rounded-full bg-gray-200' src=''/>
            {/* add mazad BTN */}
            <button className="btn bg-[#FA6300] text-[12px] px-2 by-0.5 text-white mr-3" onClick={() => navigate('/addAuction')}> إضافة مزاد جديد</button>
          </>
        ) : (
          <button className="btn bg-[#FA6300] text-white m-5" onClick={() => navigate('/login')}>تسجيل الدخول</button>
        )}
      </div>
    </div>
  );
}

export default Nav;