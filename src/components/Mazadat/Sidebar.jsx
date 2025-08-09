import React, { useState, useEffect } from "react";
import homeIcon from "../../assets/icons/house.svg";
import toolsIcon from "../../assets/icons/toolsi.svg";
import artIcon from "../../assets/icons/paints.svg";
import furnitureIcon from "../../assets/icons/chair.svg";
import jewelryIcon from "../../assets/icons/daimond.svg";
import carIcon from "../../assets/icons/car.svg";
import electronicsIcon from "../../assets/icons/pc.svg";

const categories = [
  { label: "عقارات وأراضي", value: "عقارات وأراضي", icon: homeIcon },
  { label: "خردة وبواقي معادن", value: "خردة وبواقي معادن", icon: toolsIcon },
  { label: "تحف وأعمال فنية", value: "تحف وأعمال فنية", icon: artIcon },
  { label: "أثاث", value: "أثاث", icon: furnitureIcon },
  { label: "مجوهرات", value: "مجوهرات", icon: jewelryIcon },
  { label: "سيارات", value: "سيارات", icon: carIcon },
  { label: "إلكترونيات", value: "إلكترونيات", icon: electronicsIcon },
];

const Sidebar = ({ onFilterChange, filters }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [productConditions, setProductConditions] = useState([]);
  const [auctionStatuses, setAuctionStatuses] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterByInterest, setFilterByInterest] = useState(false);

  useEffect(() => {
    if (filters.categories) {
      setSelectedCategories(filters.categories);
    }
  }, [filters.categories]);

  const handleCategoryClick = (value) => {
    const updated = selectedCategories.includes(value)
      ? selectedCategories.filter((v) => v !== value)
      : [...selectedCategories, value];

    setSelectedCategories(updated);

    onFilterChange({
      categories: updated,
      productConditions,
      auctionStatuses,
      minPrice,
      maxPrice,
      filterByInterest,
    });
  };

  const handleCheckboxChange = (type, value, checked) => {
    const stateMap = {
      condition: [productConditions, setProductConditions],
      status: [auctionStatuses, setAuctionStatuses],
    };

    const [current, setter] = stateMap[type];
    const updated = checked
      ? [...current, value]
      : current.filter((v) => v !== value);
    setter(updated);

    onFilterChange({
      categories: selectedCategories,
      productConditions: type === "condition" ? updated : productConditions,
      auctionStatuses: type === "status" ? updated : auctionStatuses,
      minPrice,
      maxPrice,
      filterByInterest,
    });
  };

  const handlePriceChange = (type, value) => {
    if (type === "min") {
      setMinPrice(value);
      onFilterChange({
        categories: selectedCategories,
        productConditions,
        auctionStatuses,
        minPrice: value,
        maxPrice,
        filterByInterest,
      });
    } else {
      setMaxPrice(value);
      onFilterChange({
        categories: selectedCategories,
        productConditions,
        auctionStatuses,
        minPrice,
        maxPrice: value,
        filterByInterest,
      });
    }
  };

  const handleInterestToggle = (checked) => {
    setFilterByInterest(checked);
    onFilterChange({
      categories: selectedCategories,
      productConditions,
      auctionStatuses,
      minPrice,
      maxPrice,
      filterByInterest: checked,
    });
  };

  return (
    <div className="w-full lg:w-64 bg-white rounded-2xl p-4 flex flex-col gap-4 shadow-md text-right font-sans overflow-y-auto">
      <h2 className="text-lg font-bold text-[#2D3142] mb-2">
        التصفية والفلاتر
      </h2>

      {/* Interest Filter */}
      <div className="flex flex-row items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="interest"
          checked={filterByInterest}
          onChange={(e) => handleInterestToggle(e.target.checked)}
          className="accent-[#2D3142] w-4 h-4"
        />
        <label
          htmlFor="interest"
          className="text-sm text-[#2D3142] cursor-pointer"
        >
          فلترة حسب اهتماماتي
        </label>
      </div>

      {/* Categories Section */}
      <div className="text-xs text-[#5F626F] mb-2">الفئات</div>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => handleCategoryClick(cat.value)}
            className={`flex flex-row-reverse items-center justify-end rounded-lg px-3 py-2 text-sm font-medium w-full transition-colors text-right ${
              selectedCategories.includes(cat.value)
                ? "bg-[#5F626F] text-white"
                : "bg-[#F3F4F6] text-[#2D3142] hover:bg-[#E5E7EB]"
            }`}
          >
            <span className="truncate">{cat.label}</span>
            <img
              src={cat.icon}
              alt="icon"
              className={`w-5 h-5 ml-2 flex-shrink-0 ${
                selectedCategories.includes(cat.value)
                  ? "filter brightness-0 invert"
                  : ""
              }`}
            />
          </button>
        ))}
      </div>

      {/* Price Range Section */}
      <div className="text-xs text-[#5F626F] mb-2">نطاق السعر</div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#2D3142]">من</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => handlePriceChange("min", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FA6300] focus:border-transparent"
            placeholder="0"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-[#2D3142]">إلى</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => handlePriceChange("max", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FA6300] focus:border-transparent"
            placeholder="أي سعر"
          />
        </div>
      </div>

      {/* Product Condition Section */}
      <div className="text-sm text-[#2D3142] font-semibold mb-2">
        حالة المنتج
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mb-4">
        {["new", "veryGood", "old"].map((status) => (
          <label
            key={status}
            className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={productConditions.includes(status)}
              onChange={(e) =>
                handleCheckboxChange("condition", status, e.target.checked)
              }
              className="w-4 h-4 accent-[#FA6300]"
            />
            <span className="text-sm text-[#2D3142]">
              {status === "new"
                ? "جديد"
                : status === "veryGood"
                ? "جيد جدًا"
                : "مستعمل"}
            </span>
          </label>
        ))}
      </div>

      {/* Auction Status Section */}
      <div className="text-sm text-[#2D3142] font-semibold mb-2">
        حالة المزاد
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
        {["approved", "active", "ended"].map((status) => (
          <label
            key={status}
            className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={auctionStatuses.includes(status)}
              onChange={(e) =>
                handleCheckboxChange("status", status, e.target.checked)
              }
              className="w-4 h-4 accent-[#FA6300]"
            />
            <span className="text-sm text-[#2D3142]">
              {status === "approved"
                ? "متاح للمعاينة"
                : status === "ended"
                ? "منتهي"
                : "نشط"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
