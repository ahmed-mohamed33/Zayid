import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, push, set, update, get } from "firebase/database";
import { UserContext } from "../context/UserContext";
import Lock from "../assets/icons/lock.svg";
import Vodafone from "../assets/icons/vodafone.svg";
import Visa from "../assets/icons/visa.svg";
import { useForm } from "react-hook-form";
import {
  getFormConfig,
  getFieldConfig,
  formatCardNumber,
  formatCVV,
  formatExpiryDate,
} from "../utils/formUtils";

const paymentMethods = {
  vodafone: {
    title: "فودافون كاش",
    description: "سيتم إرسال رمز التحقق إلى رقمك",
    icon: "Vodafone",
  },
  card: {
    title: "البطاقة البنكية",
    description: "",
    icon: "Visa",
  },
};

function Payment() {
  const [selectedPayment, setSelectedPayment] = useState("vodafone");
  const [status, setStatus] = useState({
    error: null,
    success: false,
    info: null,
  });
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { user, auctions } = useContext(UserContext);
  const { auctionId, type } = useParams();
  const navigate = useNavigate();
  const auction = auctions.find((a) => String(a.id) === String(auctionId));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm(getFormConfig(selectedPayment));

  useEffect(() => {
    reset();
  }, [selectedPayment, reset]);

  // Helper function to check if user has already paid
  const checkPaymentStatus = async () => {
    if (!user || !auction || !type) return false;

    const db = getDatabase();

    // Check payments query for user
    const paymentsSnapshot = await get(ref(db, "payments"));
    if (paymentsSnapshot.exists()) {
      const payments = paymentsSnapshot.val();
      const existingPayment = Object.values(payments).find(
        (payment) =>
          payment.userId === user.uid &&
          payment.auctionId === auction.id &&
          payment.type === type &&
          payment.status === "paid"
      );
      if (existingPayment) return true;
    }

    // Check participant data as backup
    const participantSnapshot = await get(
      ref(db, `auctions/${auctionId}/participants/${user.uid}`)
    );
    if (participantSnapshot.exists()) {
      const participantData = participantSnapshot.val();
      return (
        (type === "shroot" && participantData.hasPurchasedShroot) ||
        (type === "insurance" && participantData.hasPaidInsurance)
      );
    }

    return false;
  };

  // Helper function to get payment amount
  const getPaymentAmount = () => {
    if (type === "shroot") {
      return auction?.terms?.price || 100;
    } else if (type === "insurance") {
      return auction?.insurance?.price || 200;
    }
    return 0;
  };

  // Helper function to generate transaction ID
  const generateTransactionId = () => {
    return (
      "TXN" +
      Date.now().toString().slice(-8) +
      Math.random().toString(36).substr(2, 4).toUpperCase()
    );
  };

  // Helper function to update participant data
  const updateParticipantData = async (updates) => {
    const db = getDatabase();
    const participantRef = ref(
      db,
      `auctions/${auctionId}/participants/${user.uid}`
    );
    const snapshot = await get(participantRef);

    let currentData = {};
    if (snapshot.exists()) {
      currentData = snapshot.val();
    }

    await set(participantRef, { ...currentData, ...updates });
  };

  // Helper function to create payment record
  const createPaymentRecord = async (amount) => {
    const db = getDatabase();
    const paymentRef = ref(db, "payments");
    const newPaymentRef = push(paymentRef);

    await set(newPaymentRef, {
      amount: amount,
      auctionId: auction.id,
      method: selectedPayment,
      status: "paid",
      timestamp: new Date().toISOString(),
      type: type,
      userId: user.uid,
    });
  };

  // Check payment status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const hasPaid = await checkPaymentStatus();
        setAlreadyPaid(hasPaid);
      } catch (error) {
        console.error("Error checking payment status:", error);
        setStatus({
          error: "خطأ في التحقق من حالة الدفع",
          success: false,
          info: null,
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user, auction, type, auctionId]);

  const handleMockPayment = async () => {
    try {
      if (!auction) {
        throw new Error("المزاد غير موجود. تأكد من أن الرابط صحيح.");
      }

      if (!type || (type !== "shroot" && type !== "insurance")) {
        throw new Error("نوع الدفع غير صحيح أو غير محدد في الرابط.");
      }

      // Double-check if user has already paid
      const hasPaid = await checkPaymentStatus();
      if (hasPaid) {
        throw new Error("لقد قمت بالدفع لهذا النوع من قبل");
      }

      const amount = getPaymentAmount();

      // Create payment record
      await createPaymentRecord(amount);

      // Update participant data based on payment type
      if (type === "shroot") {
        await updateParticipantData({
          hasPurchasedShroot: true,
          joinedAt: new Date().toISOString(),
        });
      } else if (type === "insurance") {
        await updateParticipantData({
          hasPaidInsurance: true,
          paidInsuranceAt: new Date().toISOString(),
        });
      }

      setStatus({ success: true, error: null, info: null });
      navigate(`/auction/${auction.id}`);
    } catch (error) {
      console.error("payment error:", error);
      setStatus({
        success: false,
        error: error.message || "خطأ أثناء الدفع ",
        info: null,
      });
    }
  };

  // Handle OTP verification
  const handleOTPVerification = async () => {
    try {
      if (!otpCode || otpCode.length !== 6) {
        setStatus({
          error: "يرجى إدخال رمز التحقق المكون من 6 أرقام",
          success: false,
          info: null,
        });
        return;
      }

      // Mock OTP verification (in real app, this would call API)
      if (otpCode === "889797") {
        setShowOTP(false);
        setShowConfirmation(true);
        setStatus({ error: null, success: false, info: null });
      } else {
        setStatus({ error: "رمز التحقق غير صحيح", success: false, info: null });
      }
    } catch (error) {
      setStatus({
        error: error.message || "خطأ في التحقق من الرمز",
        success: false,
        info: null,
      });
    }
  };

  // Handle going back from OTP screen
  const handleBackFromOTP = () => {
    setShowOTP(false);
    setOtpCode("");
    setStatus({ error: null, success: false, info: null });
  };

  // Handle going back from confirmation screen
  const handleBackFromConfirmation = () => {
    setShowConfirmation(false);
    if (selectedPayment === "vodafone") {
      setShowOTP(true);
    }
    setStatus({ error: null, success: false, info: null });
  };


  const onSubmit = async (values) => {
    if (selectedPayment === "vodafone") {
      // For Vodafone Cash, show OTP input
      setPhoneNumber(values.phoneNumber);
      setShowOTP(true);
      setStatus({ error: null, success: false, info: null });
      // 
      setTimeout(() => {
        setStatus({
          error: null,
          success: false,
          info: "تم إرسال رمز التحقق إلى رقم " + values.phoneNumber,
        });
      }, 1000);
    } else {
      // 
      setShowConfirmation(true);
      setStatus({ error: null, success: false, info: null });
    }
  };

  const renderField = (name, label) => {
    const config = getFieldConfig(name);
    const formatters = {
      number: formatCardNumber,
      cvv: formatCVV,
      expiry: formatExpiryDate,
    };

    return (
      <div className="form-control">
        <label className="label">
          <span className="text-lg font-normal leading-normal label-text text-right text-[#2D3142]">
            {label}
          </span>
        </label>
        <input
          {...register(name)}
          {...config}
          className={`input input-bordered w-full text-right ${
            errors[name] ? "input-error" : ""
          }`}
          onChange={
            formatters[name]
              ? (e) => {
                  const formatted = formatters[name](e.target.value);
                  setValue(name, formatted, { shouldValidate: true });
                }
              : undefined
          }
        />
        {errors[name] && (
          <div className="text-error text-sm mt-1">{errors[name].message}</div>
        )}
      </div>
    );
  };

  const renderPaymentMethod = (methodKey) => {
    const method = paymentMethods[methodKey];
    const isSelected = selectedPayment === methodKey;
    const Icon = { Vodafone, Visa }[method.icon];

    return (
      <div
        key={methodKey}
        className={`card bg-white shadow-md cursor-pointer transition-all duration-300 ${
          isSelected ? "ring-2 ring-orange-500" : ""
        }`}
        onClick={() => setSelectedPayment(methodKey)}
      >
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 flex items-center justify-center text-white">
              <img src={Icon} alt={method.title} className="w-8 h-8" />
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold text-gray-900">
                {method.title}
              </h3>
              {method.description && (
                <p className="text-sm text-gray-600">{method.description}</p>
              )}
            </div>
          </div>

          {isSelected && (
            <div className="space-y-4">
              {methodKey === "card" ? (
                <>
                  {renderField("name", "اسم حامل البطاقة")}
                  {renderField("number", "رقم البطاقة")}
                  <div className="grid grid-cols-2 gap-4">
                    {renderField("cvv", "رمز الأمان (CVV)")}
                    {renderField("expiry", "تاريخ الانتهاء")}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                    <img src={Lock} alt="Lock" className="w-4 h-4" />
                    <span>معلوماتك آمنة ويتم تشفيرها</span>
                  </div>
                </>
              ) : (
                renderField("phoneNumber", "رقم الهاتف")
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-100 font-sans flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-orange-500"></div>
          <p className="mt-4 text-lg text-gray-700">
            جاري التحقق من حالة الدفع...
          </p>
        </div>
      </div>
    );
  }

  // Show already paid message
  if (alreadyPaid) {
    return (
      <div className="min-h-screen bg-gray-100 font-sans" dir="rtl">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="card bg-white shadow-lg max-w-md mx-auto">
              <div className="card-body">
                <div className="text-green-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
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
                  onClick={() => navigate(`/auction/${auction.id}`)}
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

  return (
    <div className="min-h-screen bg-gray-100 font-sans" dir="rtl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-right mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            إتمام عملية الدفع
          </h1>
          <p className="text-lg text-gray-700">
            اختر وسيلة الدفع لإكمال المزاد
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              {showOTP ? ( //otp screen
                <div className="card bg-white shadow-lg">
                  <div className="card-body">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img
                          src={Vodafone}
                          alt="Vodafone"
                          className="w-8 h-8"
                        />
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
                            setOtpCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          className="input input-bordered w-full text-center text-2xl tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleBackFromOTP}
                          className="btn btn-outline flex-1"
                        >
                          رجوع
                        </button>
                        <button
                          type="button"
                          onClick={handleOTPVerification}
                          disabled={otpCode.length !== 6}
                          className="btn bg-[#FA6300] hover:bg-[#e55a00] text-white flex-1 disabled:opacity-50"
                        >
                          تأكيد
                        </button>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          لم يصلك الرمز؟
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setStatus({
                              error: null,
                              success: false,
                              info: "تم إعادة إرسال رمز التحقق",
                            })
                          }
                          className="btn btn-link text-orange-500 btn-sm"
                        >
                          إعادة إرسال
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-[#FFF0E6]  p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded text-sm">
                        889797
                      </div>
                    </div>
                  </div>
                </div>
              ) : showConfirmation ? (
                // Confirmation screen
                <div className="card bg-white shadow-lg">
                  <div className="card-body">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
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
                        <h3 className="font-semibold text-gray-900 mb-3">
                          تفاصيل المزاد
                        </h3>
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
                        <h3 className="font-semibold text-gray-900 mb-3">
                          تفاصيل الدفع
                        </h3>
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
                            <span className="font-medium">
                              {getPaymentAmount()} ج.م
                            </span>
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
                          onClick={handleBackFromConfirmation}
                          className="btn btn-outline flex-1"
                        >
                          رجوع
                        </button>
                        <button
                          type="button"
                          onClick={handleMockPayment}
                          disabled={isSubmitting}
                          className="btn bg-[#FA6300] hover:bg-[#e55a00] text-white flex-1 disabled:opacity-50"
                        >
                          {isSubmitting ? "جاري المعالجة..." : "تأكيد الدفع"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // payment methods selection
                Object.keys(paymentMethods).map(renderPaymentMethod)
              )}
            </div>

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
                      <span className="text-2xl font-bold text-gray-900">
                        50 ج.م
                      </span>
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
                    {isSubmitting
                      ? "جاري المعالجة..."
                      : showOTP
                      ? "جاري التحقق..."
                      : showConfirmation
                      ? "جاري التأكيد..."
                      : selectedPayment === "vodafone"
                      ? "إرسال رمز التحقق"
                      : "المتابعة للتأكيد"}
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
          </div>
        </form>
      </main>
    </div>
  );
}

export default Payment;
