import React from "react";

export default function StepOverview({ onNext }) {
  const overviewItems = [
    {
      icon: "/src/assets/categry/وثيقه.svg",
      title: "شراء كراسة الشروط",
      desc: "للحصول على التفاصيل الكاملة للمنتج والمزاد.",
    },
    {
      icon: "/src/assets/categry/eye.svg",
      title: "تحديد المعاينة",
      desc: "احجز موعد لمعاينة المنتج مباشرة أو بالفيديو.",
    },
    {
      icon: "/src/assets/categry/credit.svg",
      title: "دفع التأمين",
      desc: "أكمل الدفع التأميني لتفعيل المشاركة.",
    },
    {
      icon: "/src/assets/categry/مطرقه.svg",
      title: "المزايدة",
      desc: "ابدأ تقديم عروض الأسعار قبل انتهاء الوقت.",
    },
    {
      icon: "/src/assets/categry/كأس.svg",
      title: "فوز بالمزاد",
      desc: "إذا كان عرضك هو الأعلى ستتمكن من المنتج.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* tittle */}
      <div style={{ width: "349px", margin: "auto" }} className=" text-center ">
        <h2 className="text-2xl font-bold text-[#2D3142] mb-1">
          ابدأ رحلتك في المزادات
        </h2>
        <p className="text-sm text-[#444] text-center">
          تعرّف على كيفية المشاركة في المزادات، وكيف تساعدك المنصة على الوصول
          إلى ما يهمك.
        </p>
      </div>

      {/* Cards*/}
      <div className="mt-8">
        <div className="grid grid-cols-[71px_1fr] gap-5 max-w-4xl mx-auto relative">
          {overviewItems.map((item, index) => (
            <React.Fragment key={index}>
              {/* Icon*/}
              <div className="relative flex justify-center ">
                {/* line*/}
                {index !== overviewItems.length - 1 && (
                  <div
                    style={{
                      backgroundColor: "rgba(250, 99, 0, 0.10)",
                    }}
                    className="top-17 absolute  left-1/2 -translate-x-1/2 w-2  h-16  z-0"
                  />
                )}
                <div
                  style={{
                    backgroundColor: "rgba(250, 99, 0, 0.10)",
                    height: "70px",
                    width: "70px",
                    borderRadius: "50px",
                  }}
                  className="relative z-10  flex items-center justify-center"
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </div>

              {/* card*/}
              <div
                style={{ border: "0.5px solid  #B9B9B9" }}
                className="bg-[#FFF]   rounded-lg py-6 px-4"
              >
                <h3 className="text-[#1C1C1C] font-semibold mb-4">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/*btn next*/}
      <div className="flex justify-end mt-10">
        <button
          onClick={onNext}
          className="bg-orange-600 text-white px-10 py-2 rounded-md font-semibold hover:bg-orange-700"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
