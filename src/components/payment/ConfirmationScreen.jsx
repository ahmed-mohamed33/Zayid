import React from "react";
import { IoCheckmarkCircle } from "react-icons/io5";

function ConfirmationScreen({
  auction,
  type,
  selectedPayment,
  phoneNumber,
  paymentMethods,
  getPaymentAmount,
  generateTransactionId,
  onBack,
  onConfirm,
  isSubmitting = false,
}) {
  return (
    <div className="card bg-white shadow-lg">
      <div className="card-body">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoCheckmarkCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            تأكيد عملية الدفع
          </h2>
          <p className="text-gray-600">
            تحقق من تفاصيل الدفع قبل إتمام العملية
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">تفاصيل المزاد</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">رقم المزاد:</span>
                <span className="font-medium">#{auction?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">نوع الدفع:</span>
                <span className="font-medium">
                  {type === "shroot" ? "دفع الشروط" : "دفع التأمين"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">رقم المعاملة:</span>
                <span className="font-medium font-mono text-sm">
                  {generateTransactionId()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">تفاصيل الدفع</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">طريقة الدفع:</span>
                <span className="font-medium">
                  {paymentMethods[selectedPayment].title}
                </span>
              </div>

              {selectedPayment === "vodafone" && (
                <div className="flex justify-between">
                  <span className="text-gray-700">رقم الهاتف:</span>
                  <span className="font-medium">{phoneNumber}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-700">المبلغ:</span>
                <span className="font-medium">{getPaymentAmount()} ج.م</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700">رسوم الخدمة:</span>
                <span className="font-medium">50 ج.م</span>
              </div>

              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">المجموع:</span>
                  <span className="text-orange-500">
                    {getPaymentAmount() + 50} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="btn btn-outline flex-1"
              disabled={isSubmitting}
            >
              رجوع
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="btn bg-[#FA6300] hover:bg-[#e55a00] text-white flex-1 disabled:opacity-50"
            >
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الدفع"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationScreen;
