import React from "react";
import SparkleIcon from "../../assets/icons/sparkle.svg";

const tipStyle = "text-[16px] font-medium text-[#2D3142] max-lg:text-[14px]";
const iconStyle = "text-[#4F5D75] w-4 h-4 max-lg:w-3 max-lg:h-3";
const lineStyle = "flex gap-1 justify-start items-center  ";

export default function sideBarTips() {
  return (
    <div className="bg-white border-r-4 border-[#fa6300] rounded-[16px] px-4 py-6 w-full flex flex-col gap-5 max-lg:hidden">
      <h3 className="text-[24px] font-bold text-[#2D3142] max-lg:text-[18px]">
        نصائح لإنشاء مزاد ناجح
      </h3>
      <div className={lineStyle}>
        <img src={SparkleIcon} className={iconStyle} />
        <div className={tipStyle}>استخدم صوراً واضحة وعالية الجودة للمنتج</div>
      </div>
      <div className={lineStyle}>
        <img src={SparkleIcon} className={iconStyle} />
        <div className={tipStyle}>
          قدم وصفاً تفصيلياً يشمل المواصفات والحالة
        </div>
      </div>
      <div className={lineStyle}>
        <img src={SparkleIcon} className={iconStyle} />
        <div className={tipStyle}>
          حدد سعراً ابتدائياً منطقياً لجذب المزايدين
        </div>
      </div>
      <div className={lineStyle}>
        <img src={SparkleIcon} className={iconStyle} />
        <div className={tipStyle}>اختر مدة مناسبة للمزاد (3-7 أيام مثالية)</div>
      </div>
      <div className={lineStyle}>
        <img src={SparkleIcon} className={iconStyle} />
        <div className={tipStyle}>كن واضحاً بشأن سياسة الشحن والاسترجاع</div>
      </div>
    </div>
  );
}
