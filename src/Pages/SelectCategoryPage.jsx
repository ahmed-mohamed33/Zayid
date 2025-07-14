import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectCategoryPage() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = [
    { id: 'cars', name: 'سيارات', icon: '/src/assets/categry/car.svg' },
    {
      id: 'jewels',
      name: 'مجوهرات و معادن نادرة',
      icon: '/src/assets/categry/الماس.svg',
    },
    {
      id: 'art',
      name: 'تحف و أعمال فنية',
      icon: '/src/assets/categry/ArtGallery.svg',
    },
    {
      id: 'realestate',
      name: 'عقارات و أراضي',
      icon: '/src/assets/categry/مبنى.svg',
    },
    {
      id: 'scrap',
      name: 'الخردة و بواقي المعادن',
      icon: '/src/assets/categry/Clippathgroup.svg',
    },
    { id: 'furniture', name: 'أثاث', icon: '/src/assets/categry/اثاث.svg' },
    { id: 'electronics', name: 'إلكترونيات', icon: '/src/assets/categry/لاب.svg' },
  ];

  const handleSelect = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((item) => item !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleNext = () => {
    navigate('/stepOverview');
  };

  return (
    <div
      style={{ padding: '91px 96px' }}
      className="min-h-screen bg-[#F1F1F1]  text-center "
    >
      <div className="max-w-6xl mx-auto">
        {/* **** Progress Steps **** */}
        <div className="flex justify-center items-center mb-8 text-sm font-medium gap-3">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FA6300] text-white z-10">
              1
            </div>
            <span className="text-[#FA6300] text-xs mt-1">اختيار الفئات</span>
          </div>

          {/* line */}
          <div
            className="w-31 h-0.5 bg-[#FA6300] mt-4 -mr-[28px]"
            style={{
              marginTop: 'calc(var(--spacing) * -4)',
              marginLeft: '-22px',
            }}
          ></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#E0E0E0] text-[#5F626F] z-10">
              2
            </div>
            <span className="text-[#5F626F] text-xs mt-1">نظرة عامة</span>
          </div>

          {/* line */}
          <div
            className="w-31 h-0.5 bg-gray-300 mt-4 -mr-[28px]"
            style={{
              marginTop: 'calc(var(--spacing) * -4)',
              marginLeft: '-22px',
            }}
          ></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#E0E0E0] text-[#5F626F] z-10">
              3
            </div>
            <span className="text-[#5F626F] text-xs mt-1">البدء</span>
          </div>
        </div>

        {/* **** titles **** */}
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
                  ? 'border-2 border-[#4F5D75]'
                  : 'text-gray-800 border border-gray-200 hover:border-gray-400'
              }`}
              style={{ height: '176px', width: '201px' }}
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
            onClick={handleNext}
            disabled={selectedCategories.length === 0}
            className={`px-16 py-2 rounded-md font-semibold text-white transition ${
              selectedCategories.length > 0
                ? 'bg-[#FA6300] hover:bg-orange-700'
                : 'bg-[#BFC0C0] cursor-not-allowed'
            }`}
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
