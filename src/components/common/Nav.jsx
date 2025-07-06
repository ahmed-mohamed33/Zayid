import React from 'react';
import LogoImg from '../../assets/images/Logo.webp';
import { Link } from 'react-router-dom';

const ulStyle = "link link-hover mx-2.5 text-gray-700 hover:text-[#FA6300] transition-colors duration-200";

function Nav() {
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
      <div className="leftSide">
        <button className="btn bg-[#FA6300] text-white ">تسجيل دخول</button>
      </div>
    </div>
  );
}

export default Nav;




