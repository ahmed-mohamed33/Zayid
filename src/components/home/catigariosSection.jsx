import React from "react";
import { motion } from "framer-motion";
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

const Card = ({ icon, label, onClick, index }) => (
  <motion.div
    className="w-[294px] h-[72px] flex items-center justify-center gap-2 bg-gray-100 text-[#2D3142] text-center rounded-xl px-4 py-3 text-[16px] font-medium cursor-pointer"
    onClick={onClick}
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{
      y: -3,
      scale: 1.02,
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    }}
    whileTap={{
      scale: 0.98,
      y: -1,
    }}
    transition={{
      duration: 0.2,
      ease: "easeOut",
      delay: index * 0.05,
    }}
    viewport={{ once: true, margin: "-20px" }}
  >
    <motion.span
      className="w-[24px]"
      whileHover={{ rotate: 180 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {icon}
    </motion.span>
    <span className="text-[18px] font-bold">{label}</span>
  </motion.div>
);

function Catigarios() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/auctions?category=${category}`);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <section className="py-[96px] px-[56px]">
      <motion.h2
        className="text-center text-2xl text-[#232634] font-bold mb-8"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        تصفح حسب الفئات
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center mb-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {categories.slice(0, 4).map((cat, idx) => (
          <Card
            key={idx}
            index={idx}
            icon={cat.icon}
            label={cat.label}
            onClick={() => handleCategoryClick(cat.label)}
          />
        ))}
      </motion.div>

      <motion.div
        className="flex justify-center gap-6 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        viewport={{ once: true }}
      >
        {categories.slice(4).map((cat, idx) => (
          <Card
            key={idx + 4}
            index={idx + 4}
            icon={cat.icon}
            label={cat.label}
            onClick={() => handleCategoryClick(cat.label)}
          />
        ))}
      </motion.div>
    </section>
  );
}

export default Catigarios;
