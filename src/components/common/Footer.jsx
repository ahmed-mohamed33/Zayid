import React, { useState } from "react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";

function Footer() {
  const [email, setEmail] = useState("");
  const location = useLocation();
  const hideOnRoutes = ["/login", "/signup", "/forgetpass"];

  if (hideOnRoutes.includes(location.pathname)) return null;

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription

    setEmail("");
  };

  return (
    <footer
      className="bg-[#262939] text-white py-12 px-4 md:px-[56px]"
      dir="rtl"
    >
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Quick Links */}
          <div className="text-center md:text-right">
            <h3 className="font-bold text-lg mb-4 text-white">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-[#FA6300] transition-colors duration-200"
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-[#FA6300] transition-colors duration-200"
                >
                  الأسئلة الشائعة
                </Link>
              </li>

              <li>
                <Link
                  to="/contact-us"
                  className="text-gray-300 hover:text-[#FA6300] transition-colors duration-200"
                >
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="text-gray-300 hover:text-[#FA6300] transition-colors duration-200"
                >
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          {/* Auction Categories */}
          <div className="text-center md:text-right">
            <h3 className="font-bold text-lg mb-4 text-white">فئات المزادات</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/auctions?category=إلكترونيات"
                  className="text-gray-300 hover:text-[#FA6300] transition-colors duration-200"
                >
                  إلكترونيات
                </Link>
              </li>
              <li>
                <Link
                  to="/auctions?category=عقارات وأراضي"
                  className="text-gray-300 hover:text-[#FA6300] transition-colors duration-200"
                >
                  عقارات
                </Link>
              </li>
              <li>
                <Link
                  to="/auctions?category=سيارات"
                  className="text-gray-300 hover:text-[#FA6300] transition-colors duration-200"
                >
                  سيارات
                </Link>
              </li>
              <li>
                <Link
                  to="/auctions?category=تحف وأعمال فنية"
                  className="text-gray-300 hover:text-[#FA6300] transition-colors duration-200"
                >
                  تحف وأعمال فنية
                </Link>
              </li>
              <li>
                <Link
                  to="/auctions?category=مجوهرات"
                  className="text-gray-300 hover:text-[#FA6300] transition-colors duration-200"
                >
                  مجوهرات
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="text-center md:text-right lg:col-span-2">
            <h3 className="font-bold text-lg mb-4 text-white">
              اشترك في نشرتنا
            </h3>
            <p className="text-sm mb-6 text-gray-300">
              احصل على آخر الأخبار والمزادات الحصرية
            </p>

            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  className="flex-1 px-4 py-3 rounded-lg bg-white border  border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA6300] focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#FA6300] text-white font-medium rounded-lg hover:bg-[#e55a00] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FA6300] focus:ring-offset-2 focus:ring-offset-[#262939]"
                >
                  اشتراك
                </button>
              </div>
            </form>

            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2a2f47] hover:text-[#FA6300] hover:bg-gray-100 transition-all duration-200"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2a2f47] hover:text-[#FA6300] hover:bg-gray-100 transition-all duration-200"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2a2f47] hover:text-[#FA6300] hover:bg-gray-100 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#2a2f47] hover:text-[#FA6300] hover:bg-gray-100 transition-all duration-200"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-right">
              &copy; 2025 ZAYID. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
