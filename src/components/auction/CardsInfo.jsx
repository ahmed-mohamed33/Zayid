import React, { useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { RiStarSFill } from "react-icons/ri";
import { useTermsActions } from "../../hooks/useTermsActions";

const CardItem = ({ title, children }) => {
  return (
    <div className=" p-4 w-full  bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className=" mb-2">
        <h3 className="text-lg font-semibold py-2 text-gray-800">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
};

function CardsInfo({ sellerName, insurancePrice, lowestBid, sellerLocation, auctionId }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { generateTermsPDF } = useTermsActions();

  const handleDownloadTerms = async () => {
    if (!auctionId) {
      alert("معرف المزاد غير متوفر");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const result = await generateTermsPDF({
        auctionId,
        sellerName,
        sellerLocation,
        lowestBid,
        insurancePrice
      });

      if (!result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.log(error, "error in handleDownloadTerms");
      alert("حدث خطأ أثناء تحميل كراسة الشروط");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      <div className="py-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <button 
            onClick={handleDownloadTerms}
            disabled={isGeneratingPDF}
            className="w-full text-[14px] bg-[#FA6300] text-white py-1.5 mt-6 rounded-md hover:bg-[#fa4b00] disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
          >
            {isGeneratingPDF ? "جاري الإنشاء..." : "تحميل كراسة الشروط"}
          </button>
        </CardItem>
      </div>
    </>
  );
}

export default CardsInfo;

