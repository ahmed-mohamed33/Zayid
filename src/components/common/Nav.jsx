import React from 'react'
import LogoImg from '../../assets/images/Logo.png'
import { Link } from 'react-router-dom'

// class vriable 
let ulStyle ="link link-hover mx-2.5" 

function Nav() {
  return (
    <>
    <div className='Navbar  flex items-center py-3 px-7 bg-[#F1F1F1] justify-between shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-10"'>
        <div className='rightSide flex items-center'>
        <div className='logo  ml-9'>
            <img className=' w-[70px] h-[35px]' src={LogoImg } loading="lazy"></img>
        </div>
        <ul className=' flex items-center '>
            <li><Link className={ulStyle}>الرئيسية</Link></li>
            <li><Link className={ulStyle}>المذادات</Link></li>
            <li><Link className={ulStyle}>تواصل معنا</Link></li>
            <li><Link className={ulStyle}>FAQ</Link></li>
        </ul>
        </div>
        <div className='leftSide'>
            <button className="btn bg-[#FA6300] text-white">تسجيل دخول</button>
        </div>

    </div>
    </>
  )
}

export default Nav