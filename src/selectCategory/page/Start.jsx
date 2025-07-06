import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StartStep() {
  const navigate = useNavigate();
  const handleNext = () => {
    navigate('/home');
  };
  return (
    <>
      <div
        style={{ padding: '91px 96px' }}
        className="bg-[#F1F1F1] flex flex-col justify-between  min-h-screen"
      >
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
            className="w-31 h-0.5 bg-[#FA6300] mt-4 -mr-[28px]"
            style={{
              marginTop: 'calc(var(--spacing) * -4)',
              marginLeft: '-22px',
            }}
          ></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FA6300] text-white z-10">
              3
            </div>
            <span className="text-[#FA6300] text-xs mt-1">البدء</span>
          </div>
        </div>
        <div className="text-center  ">
          <h2 style={{ fontSize: '36px' }} className="font-bold text-[#2D3142]">
            انت الان جاهز
          </h2>
          <p className="text-[#444] ">انطلق في عالم زايد</p>
          <button
            onClick={handleNext}
            className="mt-14 bg-orange-600 text-white px-38 py-2 rounded-md font-semibold hover:bg-orange-700"
          >
            التالي
          </button>
        </div>
      </div>
    </>
  );
}
