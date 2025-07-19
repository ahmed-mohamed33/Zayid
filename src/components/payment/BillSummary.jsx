import React from "react";

function BillSummary({
  type,
  getPaymentAmount,
  selectedPayment,
  showOTP,
  showConfirmation,
  isSubmitting,
  status,
}) {
  const getButtonText = () => {
    if (isSubmitting) return "جاري المعالجة...";
    if (showOTP) return "جاري التحقق...";
    if (showConfirmation) return "جاري التأكيد...";
    if (selectedPayment === "vodafone") return "إرسال رمز التحقق";
    return "المتابعة للتأكيد";
  };

  return (
    <div className="lg:w-96 h-fit top-8">
      <div className="card bg-white shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-gray-900 text-right mb-6">
            ملخص الفاتورة
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-700">
                {type === "shroot" ? "قيمة الشروط" : "قيمة التأمين"}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {getPaymentAmount()} ج.م
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-700">رسوم الخدمة</span>
              <span className="text-2xl font-bold text-gray-900">50 ج.م</span>
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-gray-900">
              المبلغ الإجمالي
            </span>
            <span className="text-2xl font-bold text-orange-500">
              {getPaymentAmount() + 50} ج.م
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || showOTP || showConfirmation}
            className="btn bg-[#FA6300] hover:bg-[#e55a00] w-full text-white font-bold disabled:opacity-50"
          >
            {getButtonText()}
          </button>

          {status.error && (
            <div className="text-error text-sm mt-4 text-center">
              {status.error}
            </div>
          )}
          {status.info && (
            <div className="text-info text-sm mt-4 text-center">
              {status.info}
            </div>
          )}
          {status.success && (
            <div className="text-green-500 text-sm mt-4 text-center">
              تم الدفع بنجاح!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillSummary;
