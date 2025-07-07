import React, { useState } from "react";

function PreviewOptions() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <>
      <div className="py-4 px-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold py-3 text-gray-800">
          خيارات معاينة المزاد
        </h2>

        <div className="flex gap-3 text-gray-500 pb-4 font-bold">
          <p
            className={`py-2 cursor-pointer ${
              activeTab === "personal"
                ? "border-b-2 border-orange-500 text-orange-500"
                : ""
            }`}
            onClick={() => setActiveTab("personal")}
          >
            معاينة شخصيه
          </p>
          <p
            className={`py-2 cursor-pointer ${
              activeTab === "video"
                ? "border-b-2 border-orange-500 text-orange-500"
                : ""
            }`}
            onClick={() => setActiveTab("video")}
          >
            معاينة عبر مكالمه فيديو
          </p>
        </div>

        {activeTab === "personal" ? (
          <div className="flex flex-col gap-2 text-gray-600 text-[15px]">
            <span>العنوان : مدينه نصر القاهره</span>
            <span>
              المواعيد : المتاحه : <br /> الثلاثاء، 2 يوليو — 4:00 مساءً إلى
              6:00 مساءً
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-gray-600 text-[15px]">
            <p>
              سيتم ترتيب مكالمة فيديو بين البائع والمشتري لمعاينة المنتج عن
              بُعد.
              <span className="block py-2">
                ستتلقى رابط Zoom أو Google Meet عبر البريد الإلكتروني بعد تأكيد
                الحجز.
              </span>
            </p>
            <span>
              المواعيد المتاحة: الثلاثاء، 2 يوليو - من 4:00 إلى 6:00 مساءً
            </span>
          </div>
        )}

        {activeTab === "personal" ? (
          <button className="w-fit bg-orange-500 text-white py-2 px-8 mt-5 cursor-pointer rounded-md hover:bg-orange-600 transition-colors duration-200">
            حجز معاينة شخصية
          </button>
        ) : (
          <button className="w-fit bg-orange-500 text-white py-2 px-8 mt-5 cursor-pointer rounded-md hover:bg-orange-600 transition-colors duration-200">
            حجز مكالمة فيديو
          </button>
        )}

        <button className="flex items-center justify-between bg-[#FFF0E6] cursor-pointer p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded text-sm">
          ننصح بمعاينة المنتج قبل بدء المزاد للتأكد من مطابقة كل شيء للوصف.
        </button>
      </div>
    </>
  );
}

export default PreviewOptions;
