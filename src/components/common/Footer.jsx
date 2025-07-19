import React from "react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

function Footer() {
  const sectionTitleClass = "font-bold text-lg mb-4";
  const linkListClass = "space-y-2 text-sm";
  const linkItemClass = "hover:underline";
  const icons =
    "hover:text-orange-500 w-[25px] h-[25px] p-[6px] bg-white rounded-full text-[#2a2f47]";

  return (
    <footer
      className="bg-[#262939] text-white py-10 px-5 text-center md:text-right"
      dir="rtl"
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className={sectionTitleClass}>روابط سريعة</h3>
          <ul className={linkListClass}>
            <li>
              <a href="#" className={linkItemClass}>
                من نحن
              </a>
            </li>
            <li>
              <a href="#" className={linkItemClass}>
                الأسئلة الشائعة
              </a>
            </li>
            <li>
              <a href="#" className={linkItemClass}>
                سياسة الخصوصية
              </a>
            </li>
            <li>
              <a href="#" className={linkItemClass}>
                اتصل بنا
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={sectionTitleClass}>فئات المزادات</h3>
          <ul className={linkListClass}>
            <li>
              <a href="#" className={linkItemClass}>
                إلكترونيات
              </a>
            </li>
            <li>
              <a href="#" className={linkItemClass}>
                عقارات
              </a>
            </li>
            <li>
              <a href="#" className={linkItemClass}>
                سيارات
              </a>
            </li>
            <li>
              <a href="#" className={linkItemClass}>
                تحف وأنتيكات
              </a>
            </li>
            <li>
              <a href="#" className={linkItemClass}>
                مجوهرات
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={sectionTitleClass}>اشترك في نشرتنا</h3>
          <p className="text-sm mb-4">احصل على آخر الأخبار والمزادات الحصرية</p>
          <form>
            <div dir="rtl" className="join">
              <div>
                <label className="input join-item">
                  <input
                    className="text-black"
                    type="text"
                    placeholder="  البريد ألالكتروني"
                  />
                </label>
              </div>
              <button className="btn bg-[#FA6300] text-white text-right join-item">
                أشتراك
              </button>
            </div>
          </form>
          <div className="flex justify-center md:justify-start gap-4 mt-4">
            <a href="#">
              <FaInstagram className={icons} />
            </a>
            <a href="#">
              <FaTwitter className={icons} />
            </a>
            <a href="#">
              <FaLinkedinIn className={icons} />
            </a>
            <a href="#">
              <FaFacebookF className={icons} />
            </a>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-600" />
      <p className="text-sm text-center">&copy; 2025 ZAYID</p>
    </footer>
  );
}

export default Footer;
