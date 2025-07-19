import React from "react";
import { FaGem, FaPaintBrush, FaTools, FaHome, FaCar, FaTv, FaCouch } from "react-icons/fa";

const categories = [
  { icon: <FaGem />, label: "مجوهرات" },
  { icon: <FaPaintBrush />, label: "تحف وأعمال فنية" },
  { icon: <FaTools />, label: "خردة وبواقي معادن" },
  { icon: <FaHome />, label: "عقارات وأراضي" },
  { icon: <FaCar />, label: "سيارات" },
  { icon: <FaTv />, label: "إلكترونيات" },
  { icon: <FaCouch />, label: "أثاث" },
];

function Catigarios() {
  return (
<section className="py-10 px-7">
  <h2 className="text-center text-2xl text-[#232634] font-bold mb-8">تصفح حسب الفئات</h2>
  <div className="grid grid-cols-4 md:grid-cols-4 gap-4 justify-items-center">
    {categories.map((cat, idx) => (
      <div
        key={idx}
        className="flex items-center gap-2 bg-gray-100 text-[#2D3142] text-center rounded-xl px-2 md:px-5  lg:px-9 py-3 text-[14px] md:text-[16px] lg:text-[17px]  font-medium transition-all duration-300 cursor-pointer"
      >
        <span className="text-[15px]">{cat.icon}</span>
        <span>{cat.label}</span>
      </div>
    ))}
  </div>
</section>

  );
}

export default Catigarios;