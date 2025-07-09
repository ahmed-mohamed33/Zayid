import React, { useState } from 'react';
import {
  FaGem,
  FaPaintBrush,
  FaLaptop,
  FaHome,
  FaCouch,
  FaCar,
  FaWrench,
  FaTh,
} from 'react-icons/fa';

const categories = [
  { label: "عقارات وأراضي", icon: <FaHome /> },
  { label: "إلكترونيات", icon: <FaLaptop /> },
  { label: "تحف وأعمال فنية", icon: <FaPaintBrush /> },
  { label: "مجوهرات", icon: <FaGem /> },
  { label: "أثاث", icon: <FaCouch /> },
  { label: "سيارات", icon: <FaCar /> },
  { label: "عدة ومواد معادن", icon: <FaWrench /> },
  { label: "أخرى", icon: <FaTh /> },
];

export default function ProductCategorySelector({ selectedCategory, setSelectedCategory, error }) {
  return (
    <div>
      <div
        className="
          grid gap-2 grid-cols-2
          w-full
          my-8
          sm:grid-cols-3
          md:grid-cols-4
          mx-auto
        "
      >
        {categories.map((cat, i) => {
          const isSelected = selectedCategory === cat.label;

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedCategory(cat.label)}
              className={`
                flex gap-2 justify-center items-center
                px-4 py-3
                border rounded-lg w-full
                text-[18px] font-medium
                cursor-pointer
                transition
                hover:border-[#FA6300]
                ${isSelected
                  ? 'border-[#FA6300] text-[#FA6300] font-bold'
                  : 'border-[#B9B9B9] text-[#2D3142]'
                }
              `}
            >
              <span className={isSelected ? 'text-[#FA6300]' : 'text-[#2D3142]'}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ✅ عرض رسالة الخطأ لو فيه */}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

