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
    <>
      <style>
        {`
          .category-container {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(2, 1fr);
            margin: 2rem auto;
            width: 100%;
          }

          .category-button {
            display: flex;
            gap: 8px;
            justify-content: center;
            align-items: center;
            padding: 12px 16px;
            border: 1px solid #B9B9B9;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            width: 100%;
          }

          .category-button:hover {
            border-color: #FA6300;

          }

          .category-button.selected {
            border-color: #FA6300;
            font-weight: bold;
            color: #FA6300;
          }
          .category-button.selected .icon,
          .category-button.selected .label {
            color: #FA6300;
          }

          .icon {
            font-size: 18px;
            color: #2D3142;
          }
          
          .label {
            font-size: 18px;
            font-weight: medium;
            color: #2D3142;
          }
          

          @media (min-width: 600px) {
            .category-container {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (min-width: 900px) {
            .category-container {
              grid-template-columns: repeat(4, 1fr);
            }
          }
        `}
      </style>

      <div > 
        <div className="category-container">
          {categories.map((cat, i) => (
            <button
              key={i}
              className={`category-button ${cat.selected ? 'selected' : ''}`}
            >
              <span className="icon">{cat.icon}</span>
              <span className="label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
