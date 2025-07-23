import React from "react";
import { Link } from "react-router-dom";

function ErrorPage({ message, redirectTo }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-6">
      <h1 className="text-4xl font-bold text-orange-600 mb-4">خطأ في الوصول!</h1>
      <p className="text-lg text-gray-700 mb-6">
        { message}
      </p>
      <Link
        to={redirectTo}
        className="bg-[#262939d0] text-white px-6 py-3 rounded-lg hover:bg-[#2e3145] transition-colors"
      >
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}

export default ErrorPage;
