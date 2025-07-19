import React from "react";
import {
  FaGem,
  FaPaintBrush,
  FaTools,
  FaHome,
  FaCar,
  FaTv,
  FaCouch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const categories = [
  { icon: <FaGem />, label: "مجوهرات" },
  { icon: <FaPaintBrush />, label: "تحف وأعمال فنية" },
  { icon: <FaTools />, label: "خردة وبواقي معادن" },
  { icon: <FaHome />, label: "عقارات وأراضي" },
  { icon: <FaCar />, label: "سيارات" },
  { icon: <FaTv />, label: "إلكترونيات" },
  { icon: <FaCouch />, label: "أثاث" },
];

const Card = ({ icon, label }) => (
  <div className="w-[294px] h-[72px] flex items-center justify-center gap-2 bg-gray-100 text-[#2D3142] text-center rounded-xl px-4 py-3 text-[16px] font-medium transition-all duration-300 cursor-pointer">
    <span className="w-[24px]">{icon}</span>
    <span className="text-[18px] font-bold">{label}</span>
  </div>
);

function Catigarios() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/auctions?category=${category}`);
  };
  return (
    <section className="py-[96px] px-[56px]">
      <h2 className="text-center text-2xl text-[#232634] font-bold mb-8">
        تصفح حسب الفئات
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center mb-6">
        {categories.slice(0, 4).map((cat, idx) => (
          <Card
            key={idx}
            icon={cat.icon}
            label={cat.label}
            onClick={() => handleCategoryClick(cat.label)}
          />
        ))}
      </div>

      <div className="flex justify-center gap-6 flex-wrap">
        {categories.slice(4).map((cat, idx) => (
          <Card
            key={idx + 4}
            icon={cat.icon}
            label={cat.label}
            onClick={() => handleCategoryClick(cat.label)}
          />
        ))}
      </div>
    </section>
  );
}

export default Catigarios;
