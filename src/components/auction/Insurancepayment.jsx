import React from "react";

function Insurancepayment() {
  return (
    <>
      <div className="flex flex-col py-5 gap-2 bg-[#FFF0E6] text-[#4F5D75] font-bold   cursor-pointer p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded">
        <p className=" ">
          يجب دفع مبلغ التأمين قبل بدء المزاد لتتمكن من المزايدة
        </p>
        <span className="">مبلغ التأمين المطلوب: 10,000 ج.م</span>
        <button className="btn w-fit bg-[#4F5D75] text-white mt-3">
          دفع مبلغ التأمين
        </button>
      </div>
    </>
  );
}

export default Insurancepayment;
