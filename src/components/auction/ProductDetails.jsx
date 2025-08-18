import React, { useContext } from "react";
import { UserContext } from "../../context/UserContext";

function ProductDetails({
  name,
  category,
  price,
  endDate,
  allTime,
  condition,
  startDate,
  hasPaidTerms,
  auction,
  status,
}) {
  const { user, userData } = useContext(UserContext);
  console.log("Status received:", status);
  return (
    <div className="detailsSide bg-white w-full md:w-[50%] rounded-md py-9 px-6 shadow-md flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-5">{name || "غير محدد"}</h2>
        <p className="mb-3 text-lg text-[#2D3142]">
          الفئة: {category || "غير محدد"}
        </p>
        <p className="mb-3 text-lg text-[#2D3142]">
          السعر الإفتتاحي: {price || "غير محدد"} ج.م
        </p>
        <p className="mb-3 text-lg text-[#2D3142]">
          موعد البدء:{" "}
          {startDate
            ? new Date(startDate).toLocaleString("ar-EG", {
                timeZone: "Africa/Cairo",
              })
            : "غير محدد"}
        </p>
        <p className="mb-3 text-lg text-[#2D3142]">
          موعد الانتهاء:{" "}
          {endDate
            ? new Date(endDate).toLocaleString("ar-EG", {
                timeZone: "Africa/Cairo",
              })
            : "غير محدد"}
        </p>
        <p className="mb-3 text-lg text-[#2D3142]">
          مدة المزاد: {allTime || "غير محدد"}
        </p>
        <p className="mb-3 text-lg text-[#2D3142]">
          حالة المنتج: {condition || "غير محدد"}
        </p>
        {!hasPaidTerms &&
          (<div
            className={`transition-opacity duration-300 ${
              status === "active" ? "opacity-0" : "opacity-100"
            }`}
          >
            {user && auction && user.uid === auction.createdBy ? (
            <button className="flex items-center justify-between bg-[#FFF0E6] cursor-pointer p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded text-sm">
              <span>هذا المزاد الخاص بك</span>
            </button>
          ) : (
            <button className="flex items-center justify-between bg-[#FFF0E6] cursor-pointer p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded text-[14px] sm:text-[12px] md:text-[14px]">
              <a href="#korasetElShroot">
                من اجل معاينة المنتج يجب عليك شراء كراسة الشروط
              </a>
              <a
                href="#korasetElShroot"
                className="text-green-500 cursor-pointer text-[13px] sm:text-[11px] md:text-[13px]"
              >
                اشتري الان
              </a>
            </button>
          )}
          </div>)}
      </div>
    </div>
  );
}

export default ProductDetails;
