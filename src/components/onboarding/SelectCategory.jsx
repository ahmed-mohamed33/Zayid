import React from "react";
import Diamond from "../../assets/categry/الماس.svg";
import ArtGallery from "../../assets/categry/ArtGallery.svg";
import Building from "../../assets/categry/مبنى.svg";
import Clippathgroup from "../../assets/categry/Clippathgroup.svg";
import Furniture from "../../assets/categry/اثاث.svg";
import Laptop from "../../assets/categry/لاب.svg";
export default function SelectCategory({
  onNext,
  selectedCategories,
  setSelectedCategories,
}) {
  const categories = [
    { id: "سيارات", name: "سيارات", icon: "/src/assets/categry/car.svg" },
    {
      id: "مجوهرات",
      name: "مجوهرات",
      icon: Diamond,
    },
    {
      id: "تحف وأعمال فنية",
      name: "تحف وأعمال فنية",
      icon: ArtGallery,
    },
    {
      id: "عقارات وأراضي",
      name: "عقارات وأراضي",
      icon: Building,
    },
    {
      id: "خردة وبواقي معادن",
      name: "خردة وبواقي معادن",
      icon: Clippathgroup,
    },
    { id: "أثاث", name: "أثاث", icon: Furniture },
    {
      id: "إلكترونيات",
      name: "إلكترونيات",
      icon: Laptop,
    },
  ];

  const handleSelect = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((item) => item !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">ابدأ رحلتك في المزادات</h2>
      <p className="text-gray-500 mb-8">
        اختر الفئات التي تهمك لعرض أفضل العروض لك
      </p>

      {/* **** Category Cards **** */}
      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto mb-10">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            className={`relative cursor-pointer rounded-xl flex flex-col items-center bg-white justify-center transition ${
              selectedCategories.includes(cat.id)
                ? "border-2 border-[#4F5D75]"
                : "text-gray-800 border border-gray-200 hover:border-gray-400"
            }`}
            style={{ height: "176px", width: "201px" }}
          >
            <div className="mb-2 w-10 h-10">
              <img
                src={cat.icon}
                alt={cat.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-medium">{cat.name}</span>

            {selectedCategories.includes(cat.id) && (
              <img
                src="/src/assets/categry/صح.svg"
                alt="selected icon"
                className="absolute top-2 right-2 w-5 h-5"
              />
            )}
          </div>
        ))}
      </div>

      {/* ***** btn next **** */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={selectedCategories.length === 0}
          className={`px-16 py-2 rounded-md font-semibold text-white transition ${
            selectedCategories.length > 0
              ? "bg-[#FA6300] hover:bg-orange-700"
              : "bg-[#BFC0C0] cursor-not-allowed"
          }`}
        >
          التالي
        </button>
      </div>
    </div>
  );
}
