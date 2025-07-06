import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StepOverview() {
  const navigate = useNavigate();
  const overviewItems = [
    {
      icon: '/assets/categry/وثيقه.svg',
      title: 'شراء كراسة الشروط',
      desc: 'للحصول على التفاصيل الكاملة للمنتج والمزاد.',
    },
    {
      icon: '/assets/categry/eye.svg',
      title: 'تحديد المعاينة',
      desc: 'احجز موعد لمعاينة المنتج مباشرة أو بالفيديو.',
    },
    {
      icon: '/assets/categry/credit.svg',
      title: 'دفع التأمين',
      desc: 'أكمل الدفع التأميني لتفعيل المشاركة.',
    },
    {
      icon: '/assets/categry/مطرقه.svg',
      title: 'المزايدة',
      desc: 'ابدأ تقديم عروض الأسعار قبل انتهاء الوقت.',
    },
    {
      icon: '/assets/categry/كأس.svg',
      title: 'فوز بالمزاد',
      desc: 'إذا كان عرضك هو الأعلى ستتمكن من المنتج.',
    },
  ];
  const handleNext = () => {
    navigate('/start');
  };

  return (
    <div style={{ padding: '91px 96px' }} className="bg-[#F1F1F1] ">
      <div className="max-w-4xl mx-auto   ">
        {/* **** Progress Steps **** */}
        <div className="flex justify-center items-center mb-8 text-sm font-medium gap-3">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FA6300] text-white z-10">
              1
            </div>
            <span className="text-[#FA6300] text-xs mt-1">اختيار الفئات</span>
          </div>

          {/* line 1 */}
          <div
            className="w-31 h-0.5 bg-[#FA6300] mt-4 -mr-[28px]"
            style={{
              marginTop: 'calc(var(--spacing) * -4)',
              marginLeft: '-27px',
            }}
          ></div>

          <div className="flex flex-col items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FA6300] text-white z-10">
              2
            </div>
            <span className="text-[#FA6300] text-xs mt-1">اختيار الفئات</span>
          </div>

          {/* line 2 */}
          <div
            className="w-31 h-0.5 bg-gray-300 mt-4 -mr-[28px]"
            style={{
              marginTop: 'calc(var(--spacing) * -4)',
              marginLeft: '-22px',
            }}
          ></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#E0E0E0] text-[#5F626F] z-10">
              3
            </div>
            <span className="text-[#5F626F] text-xs mt-1">البدء</span>
          </div>
        </div>

        {/* **** tittle **** */}
        <div
          style={{ width: '349px', margin: 'auto' }}
          className=" text-center "
        >
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
                  {/* ✅ line*/}
                  {index !== overviewItems.length - 1 && (
                    <div
                      style={{
                        backgroundColor: 'rgba(250, 99, 0, 0.10)',
                      }}
                      className="top-17 absolute  left-1/2 -translate-x-1/2 w-2  h-16  z-0"
                    />
                  )}
                  <div
                    style={{
                      backgroundColor: 'rgba(250, 99, 0, 0.10)',
                      height: '70px',
                      width: '70px',
                      borderRadius: '50px',
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
                  style={{ border: '0.5px solid  #B9B9B9' }}
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
            onClick={handleNext}
            className="bg-orange-600 text-white px-10 py-2 rounded-md font-semibold hover:bg-orange-700"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
