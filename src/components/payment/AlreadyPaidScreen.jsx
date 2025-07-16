import React from "react";
import { IoCheckmarkCircle } from "react-icons/io5";

function AlreadyPaidScreen({ type, onBackToAuction }) {
  return (
    <div className="min-h-screen bg-gray-100 font-sans" dir="rtl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="card bg-white shadow-lg max-w-md mx-auto">
            <div className="card-body">
              <div className="text-green-500 mb-4">
                <IoCheckmarkCircle className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                تم الدفع مسبقاً
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                {type === "shroot"
                  ? "لقد قمت بدفع الشروط لهذا المزاد من قبل"
                  : "لقد قمت بدفع التأمين لهذا المزاد من قبل"}
              </p>
              <button
                onClick={onBackToAuction}
                className="btn bg-[#FA6300] hover:bg-[#e55a00] w-full text-white font-bold"
              >
                العودة إلى المزاد
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AlreadyPaidScreen;
