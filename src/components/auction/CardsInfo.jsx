import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { RiStarSFill } from "react-icons/ri";

const CardItem = ({ title, children }) => {
  return (
    <div className="max-w-sm p-4   bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className=" mb-2">
        <h3 className="text-lg font-semibold py-2 text-gray-800">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
};

function CardsInfo({ sellerName, insurancePrice, lowestBid, sellerLocation }) {
  return (
    <>
      <div className="py-4  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardItem title="معلومات المزاد">
          <p className=" font-bold my-2 ">أقل مزايده : {lowestBid} ج.م</p>
          <p className=" font-bold my-3 ">مبلغ التأمين {insurancePrice} ج.م</p>
        </CardItem>

        <CardItem title="معلومات البائع">
          <div className=" flex items-center justify-between">
            <p className=" font-bold"> اسم البائع : {sellerName}</p>
          </div>
          <div className=" flex items-center py-3">
            <FaLocationDot className=" text-red-700" />
            <p className=" px-1 font-bold"> مكان المزاد : {sellerLocation} </p>
          </div>
        </CardItem>

        <CardItem title="كراسة الشروط">
          <div className=" flex items-center text-[15px] text-green-600 gap-2">
            <p>تم الشراء</p>
            <IoCheckmarkCircleSharp />
          </div>
          <button className="w-full text-[14px] bg-[#FA6300] text-white py-1.5 mt-6 rounded-md hover:bg-[#fa4b00] cursor-pointer transition-colors duration-200">
            تحميل كراسة الشروط
          </button>
        </CardItem>
      </div>
    </>
  );
}

export default CardsInfo;
