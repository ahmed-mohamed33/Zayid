import React, { useState } from 'react';
import homeIcon from '../../assets/icons/house.svg';
import toolsIcon from '../../assets/icons/tools.svg';
import artIcon from '../../assets/icons/paints.svg';
import furnitureIcon from '../../assets/icons/chair.svg';
import jewelryIcon from '../../assets/icons/daimond.svg';
import carIcon from '../../assets/icons/car.svg';
import electronicsIcon from '../../assets/icons/pc.svg';

const categories = [
  { label: 'عقارات وأراضي', value: 'Real Estate', icon: homeIcon },
  { label: 'خردة وبواقي معادن', value: 'Scrap', icon: toolsIcon },
  { label: 'تحف وأعمال فنية', value: 'Antiques and Arts', icon: artIcon },
  { label: 'أثاث', value: 'Furniture', icon: furnitureIcon },
  { label: 'مجوهرات', value: 'Jewelry', icon: jewelryIcon },
  { label: 'سيارات', value: 'Cars', icon: carIcon },
  { label: 'إلكترونيات', value: 'Electronics', icon: electronicsIcon },
];

const userInterests = ['Cars', 'Electronics', 'Antiques and Arts'];

const Sidebar = ({ onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [inspectionTypes, setInspectionTypes] = useState([]);
  const [productConditions, setProductConditions] = useState([]);
  const [auctionStatuses, setAuctionStatuses] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterByInterest, setFilterByInterest] = useState(false);

  const handleCategoryClick = (value) => {
    const updated = selectedCategories.includes(value)
      ? selectedCategories.filter((v) => v !== value)
      : [...selectedCategories, value];
    setSelectedCategories(updated);
    emitFilter({ categories: updated });
  };

  const handleCheckboxChange = (type, value, checked) => {
    const stateMap = {
      inspection: [inspectionTypes, setInspectionTypes],
      condition: [productConditions, setProductConditions],
      status: [auctionStatuses, setAuctionStatuses],
    };

    const [current, setter] = stateMap[type];
    const updated = checked
      ? [...current, value]
      : current.filter((v) => v !== value);
    setter(updated);
    emitFilter({
      inspectionTypes,
      productConditions,
      auctionStatuses,
      [type === 'inspection' ? 'inspectionTypes' : type === 'condition' ? 'productConditions' : 'auctionStatuses']: updated,
    });
  };

  const handlePriceChange = (type, value) => {
    if (type === 'min') {
      setMinPrice(value);
      emitFilter({ minPrice: value, maxPrice });
    } else {
      setMaxPrice(value);
      emitFilter({ minPrice, maxPrice: value });
    }
  };

  const handleInterestToggle = (checked) => {
    setFilterByInterest(checked);
    emitFilter({ filterByInterest: checked });
  };

  const emitFilter = (changes = {}) => {
    onFilterChange({
      categories: selectedCategories,
      inspectionTypes,
      productConditions,
      auctionStatuses,
      minPrice,
      maxPrice,
      filterByInterest,
      ...changes,
    });
  };

  return (
    <div className="w-64 bg-white rounded-2xl p-4 flex flex-col gap-4 shadow-md text-right font-sans overflow-y-auto">
      <h2 className="text-lg font-bold text-[#2D3142] mb-2">التصفية والفلاتر</h2>

      <div className="flex flex-row items-center gap-2 mb-2">
        <input
          type="checkbox"
          id="interest"
          checked={filterByInterest}
          onChange={(e) => handleInterestToggle(e.target.checked)}
          className="accent-[#2D3142] w-4 h-4"
        />
        <label htmlFor="interest" className="text-sm text-[#2D3142] cursor-pointer">
          فلترة حسب اهتماماتي
        </label>
      </div>

      <div className="text-xs text-[#5F626F] mb-1">الفئات</div>
      <div className="flex flex-col gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => handleCategoryClick(cat.value)}
            className={`flex flex-row-reverse items-center justify-end rounded-lg px-4 py-2 text-sm font-medium w-full transition-colors text-right ${
              selectedCategories.includes(cat.value)
                ? 'bg-[#5F626F] text-white'
                : 'bg-[#F3F4F6] text-[#2D3142] hover:bg-[#E5E7EB]'
            }`}
          >
            <span>{cat.label}</span>
            <img
              src={cat.icon}
              alt="icon"
              className={`w-5 h-5 ml-2 ${selectedCategories.includes(cat.value) ? 'filter brightness-0 invert' : ''}`}
            />
          </button>
        ))}
      </div>

      <div className="text-right font-semibold text-[#2D3142]">نوع المعاينة</div>
      <div className="flex flex-col gap-2 mb-4">
        {["Personal Inespection", "Live Video"].map((type) => (
          <label key={type} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => handleCheckboxChange('inspection', type, e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">{type === "Personal Inespection" ? "معاينة شخصية" : "فيديو لايف"}</span>
          </label>
        ))}
      </div>

      <div className="text-xs text-[#5F626F] mb-1">نطاق السعر</div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm">من</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => handlePriceChange('min', e.target.value)}
          className="border rounded px-3 py-1"
        />
        <label className="text-sm">إلى</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => handlePriceChange('max', e.target.value)}
          className="border rounded px-3 py-1"
        />
      </div>

      <div className="text-sm text-[#2D3142] font-semibold">حالة المنتج</div>
      <div className="flex flex-col gap-2 mb-4">
        {["New", "Used", "Very Good"].map((status) => (
          <label key={status} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => handleCheckboxChange('condition', status, e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              {status === "New" ? "جديد" : status === "Used" ? "مستعمل" : "جيد جدا"}
            </span>
          </label>
        ))}
      </div>

      <div className="text-sm text-[#2D3142] font-semibold">حالة المزاد</div>
      <div className="flex flex-col gap-2">
        {["Active", "In Inspection", "Terminated"].map((status) => (
          <label key={status} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => handleCheckboxChange('status', status, e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              {status === "Active" ? "جاري" : status === "In Inspection" ? "معاينة" : "منتهي"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
