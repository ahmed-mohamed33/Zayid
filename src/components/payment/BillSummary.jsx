import React from "react";

function BillSummary({
  type,
  getPaymentAmount,
  selectedPayment,
  showOTP,
  showConfirmation,
  isSubmitting,
  status,
  auction,
}) {
  const isAuctionStarted = () => {
    if (!auction?.startDate) return false;
    const now = new Date();
    const startDate = new Date(auction.startDate);
    return now >= startDate;
  };
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
                {type === "shroot"
                  ? "قيمة الشروط"
                  : type === "winner"
                  ? "قيمة المزاد"
                  : "قيمة التأمين"}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {getPaymentAmount()} ج.م
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-700">
                {type === "winner" ? " قيمة التأمين" : "رسوم الخدمة"}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {" "}
                {type === "winner" ? "-" + auction?.insurance?.amount : 50} ج.م
              </span>
            </div>
          </div>

          <div className="divider my-2"></div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-gray-900">
              المبلغ الإجمالي
            </span>
            <span className="text-2xl font-bold text-orange-500">
              {type === "winner"
                ? getPaymentAmount() - auction?.insurance?.amount
                : getPaymentAmount() + 50}{" "}
              ج.م
            </span>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              showOTP ||
              showConfirmation ||
              (type === "shroot" && isAuctionStarted())
            }
            className="btn bg-[#FA6300] hover:bg-[#e55a00] w-full text-white font-bold disabled:opacity-50"
          >
            {type === "shroot" && isAuctionStarted()
              ? "لا يمكن الشراء - المزاد قد بدأ"
              : getButtonText()}
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

          {/* Warning for shroot payments when auction has started */}
          {type === "shroot" && isAuctionStarted() && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-yellow-600 mr-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <p className="text-yellow-800 text-sm">
                  لا يمكن شراء الشروط بعد بدء المزاد
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillSummary;
