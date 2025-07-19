import React from "react";
import Vodafone from "../../assets/icons/vodafone.svg";

function OTPScreen({
  phoneNumber,
  otpCode,
  setOtpCode,
  onVerify,
  onBack,
  onResend,
  isDisabled = false,
}) {
  return (
    <div className="card bg-white shadow-lg">
      <div className="card-body">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={Vodafone} alt="Vodafone" className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            أدخل رمز التحقق
          </h2>
          <p className="text-gray-600">
            تم إرسال رمز التحقق إلى رقم: {phoneNumber}
          </p>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="text-lg font-normal leading-normal label-text text-right text-[#2D3142]">
                رمز التحقق (6 أرقام)
              </span>
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="input input-bordered w-full text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="btn btn-outline flex-1"
              disabled={isDisabled}
            >
              رجوع
            </button>
            <button
              type="button"
              onClick={onVerify}
              disabled={otpCode.length !== 6 || isDisabled}
              className="btn bg-[#FA6300] hover:bg-[#e55a00] text-white flex-1 disabled:opacity-50"
            >
              تأكيد
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">لم يصلك الرمز؟</p>
            <button
              type="button"
              onClick={onResend}
              className="btn btn-link text-orange-500 btn-sm"
              disabled={isDisabled}
            >
              إعادة إرسال
            </button>
          </div>

          <div className="flex items-center justify-between bg-[#FFF0E6] p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded text-sm">
            889797
          </div>
        </div>
      </div>
    </div>
  );
}

export default OTPScreen;
