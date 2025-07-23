import React from "react";

export default function ProgressSteps({ currentStep }) {
  return (
    <div className="flex justify-center items-center mb-8 text-sm font-medium gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 flex items-center justify-center rounded-full ${
            currentStep >= 1
              ? "bg-[#FA6300] text-white"
              : "bg-[#E0E0E0] text-[#5F626F]"
          } z-10`}
        >
          1
        </div>
        <span
          className={`text-xs mt-1 ${
            currentStep >= 1 ? "text-[#FA6300]" : "text-[#5F626F]"
          }`}
        >
          اختيار الفئات
        </span>
      </div>

      <div
        className={`w-31 h-0.5 mt-4 -mr-[28px] ${
          currentStep >= 2 ? "bg-[#FA6300]" : "bg-gray-300"
        }`}
        style={{
          marginTop: "calc(var(--spacing) * -4)",
          marginLeft: "-27px",
        }}
      ></div>

      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 flex items-center justify-center rounded-full ${
            currentStep >= 2
              ? "bg-[#FA6300] text-white"
              : "bg-[#E0E0E0] text-[#5F626F]"
          } z-10`}
        >
          2
        </div>
        <span
          className={`text-xs mt-1 ${
            currentStep >= 2 ? "text-[#FA6300]" : "text-[#5F626F]"
          }`}
        >
          نظرة عامة
        </span>
      </div>

      <div
        className={`w-31 h-0.5 mt-4 -mr-[28px] ${
          currentStep >= 3 ? "bg-[#FA6300]" : "bg-gray-300"
        }`}
        style={{
          marginTop: "calc(var(--spacing) * -4)",
          marginLeft: "-22px",
        }}
      ></div>

      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 flex items-center justify-center rounded-full ${
            currentStep >= 3
              ? "bg-[#FA6300] text-white"
              : "bg-[#E0E0E0] text-[#5F626F]"
          } z-10`}
        >
          3
        </div>
        <span
          className={`text-xs mt-1 ${
            currentStep >= 3 ? "text-[#FA6300]" : "text-[#5F626F]"
          }`}
        >
          البدء
        </span>
      </div>
    </div>
  );
}
