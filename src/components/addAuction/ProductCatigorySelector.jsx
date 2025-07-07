import { FaGem, FaPaintBrush, FaLaptop, FaHome, FaCouch, FaCar, FaWrench, FaTh } from 'react-icons/fa';

const categories = [
  { label: "عقارات وأراضي", icon: <FaHome />, selected: true },
  { label: "إلكترونيات", icon: <FaLaptop /> },
  { label: "تحف وأعمال فنية", icon: <FaPaintBrush /> },
  { label: "مجوهرات", icon: <FaGem /> },
  { label: "أثاث", icon: <FaCouch /> },
  { label: "سيارات", icon: <FaCar /> },
  { label: "عدة ومواد معادن", icon: <FaWrench /> },
  { label: "أخرى", icon: <FaTh /> },
];

export default function ProductCategorySelector() {
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
        {categories.map((cat, i) => (
          <button
            key={i}
            className={`
              flex gap-2 justify-center items-center
              px-4 py-3
              border border-[#B9B9B9]
              rounded-lg
              cursor-pointer
              text-[18px]
              w-full
              hover:border-[#FA6300]
              ${cat.selected ? 'border-[#FA6300] font-bold text-[#FA6300]' : ''}
            `}
          >
            <span
              className={`
                text-[18px]
                ${cat.selected ? 'text-[#FA6300]' : 'text-[#2D3142]'}
              `}
            >
              {cat.icon}
            </span>
            <span
              className={`
                text-[18px] font-medium
                ${cat.selected ? 'text-[#FA6300]' : 'text-[#2D3142]'}
              `}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}