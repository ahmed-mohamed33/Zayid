import React from "react";

function LoadingScreen({ message = "جاري التحقق من حالة الدفع..." }) {
  return (
    <div
      className="min-h-screen bg-gray-100 font-sans flex items-center justify-center"
      dir="rtl"
    >
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-orange-500"></div>
        <p className="mt-4 text-lg text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
