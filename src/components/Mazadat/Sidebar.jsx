import React, { useState } from "react";
import homeIcon from "../../assets/icons/house.svg";
import toolsIcon from "../../assets/icons/tools.svg";
import artIcon from "../../assets/icons/paints.svg";
import furnitureIcon from "../../assets/icons/chair.svg";
import jewelryIcon from "../../assets/icons/daimond.svg";
import carIcon from "../../assets/icons/car.svg";
import electronicsIcon from "../../assets/icons/pc.svg";

const categories = [
  { label: "عقارات وأراضي", icon: homeIcon },
  { label: "خردة وبواقي معادن", icon: toolsIcon },
  { label: "تحف وأعمال فنية", icon: artIcon },
  { label: "أثاث", icon: furnitureIcon },
  { label: "مجوهرات", icon: jewelryIcon },
  { label: "سيارات", icon: carIcon },
  { label: "إلكترونيات", icon: electronicsIcon },
];

const Sidebar = () => {
  const [activeCategory, setActiveCategory] = useState(null); // No default selected

  return (
    <div className="w-64 bg-white rounded-t-2xl rounded-b-2xl p-4 flex flex-col gap-4 shadow-md text-right font-sans overflow-y-auto ">
      <h2 className="text-lg font-bold text-[#2D3142] mb-2">
        التصفية والفلاتر
      </h2>
      <div className="flex flex-row items-center gap-2 mb-2">
        <input
          type="checkbox"
          id="interest"
          className="accent-[#2D3142] w-4 h-4"
        />
        <label
          htmlFor="interest"
          className="text-sm text-[#2D3142] cursor-pointer"
        >
          فلترة حسب اهتماماتي
        </label>
      </div>
      <div className="text-xs text-[#5F626F] mb-1">الفئات</div>
      <div className="flex flex-col gap-2 mb-4">
        {categories.map((cat, idx) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setActiveCategory(idx)}
            className={`flex flex-row-reverse items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors w-full text-right ${
              activeCategory === idx
                ? "bg-[#5F626F] text-white "
                : "bg-[#F3F4F6] text-[#2D3142] hover:bg-[#E5E7EB]"
            }`}
          >
            <span>{cat.label}</span>
            <img
              src={cat.icon}
              alt="icon"
              className={`w-5 h-5 ml-2 ${
                activeCategory === idx ? "filter brightness-0 invert" : ""
              }`}
            />
          </button>
        ))}
      </div>
      <div className="text-right font-normal not-italic leading-normal text-[var(--text-primary,#2D3142)] text-[length:var(--typography-font-size-body-16px,16px)] font-[Almarai]">
        نوع المعاينة
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="flex flex-row items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 bg-white border border-black rounded"
          />
          <span className="text-right font-normal not-italic leading-normal text-[var(--text-primary,#2D3142)] text-[length:var(--typography-font-size-body-16px,16px)] font-[Almarai]">
            معاينة شخصية
          </span>
        </label>
        <label className="flex flex-row items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 bg-white border border-black rounded"
          />
          <span className="text-right font-normal not-italic leading-normal text-[var(--text-primary,#2D3142)] text-[length:var(--typography-font-size-body-16px,16px)] font-[Almarai]">
            فيديو لايف
          </span>
        </label>
      </div>
      <div className="text-xs text-[#5F626F] mb-1">نطاق السعر</div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-right font-normal not-italic leading-normal text-[var(--text-primary,#2D3142)] text-[length:var(--typography-font-size-body-16px,16px)] font-[Almarai]">
          من
        </label>
        <input
          type="number"
          placeholder="ادخل السعر الأقل"
          className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F626F] text-right placeholder:text-[#A0AEC0]"
        />
        <label className="text-right font-normal not-italic leading-normal text-[var(--text-primary,#2D3142)] text-[length:var(--typography-font-size-body-16px,16px)] font-[Almarai]">
          إلى
        </label>
        <input
          type="number"
          placeholder="ادخل السعر الأعلى"
          className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F626F] text-right placeholder:text-[#A0AEC0]"
        />
      </div>
      <div className="text-right font-normal not-italic leading-normal text-[var(--text-primary,#2D3142)] text-[length:var(--typography-font-size-body-16px,16px)] font-[Almarai]">
        حالة المنتج
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {["جديد", "مستعمل", "جيد جدا"].map((status) => (
          <label
            key={status}
            className="flex flex-row items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              className="w-4 h-4 bg-white border border-black rounded"
            />
            <span className="text-sm text-black">{status}</span>
          </label>
        ))}
      </div>
      <div className="text-right font-normal not-italic leading-normal text-[var(--text-primary,#2D3142)] text-[length:var(--typography-font-size-body-16px,16px)] font-[Almarai]">
        حالة المزاد
      </div>
      <div className="flex flex-col gap-2">
        {["جاري", "معاينة", "منتهي"].map((status) => (
          <label
            key={status}
            className="flex flex-row items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              className="w-4 h-4 bg-white border border-black rounded"
            />
            <span className="text-sm text-black">{status}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
