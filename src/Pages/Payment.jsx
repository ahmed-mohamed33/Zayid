import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, push, set, get } from "firebase/database";
import { UserContext } from "../context/UserContext";
import { useForm } from "react-hook-form";
import { getFormConfig } from "../utils/formUtils";

// Import components
import LoadingScreen from "../components/payment/LoadingScreen";
import AlreadyPaidScreen from "../components/payment/AlreadyPaidScreen";
import OTPScreen from "../components/payment/OTPScreen";
import ConfirmationScreen from "../components/payment/ConfirmationScreen";
import PaymentMethodSelector from "../components/payment/PaymentMethodSelector";
import BillSummary from "../components/payment/BillSummary";

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

      return auction?.insurance?.amount || 200;
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

      const hasPaid = await checkPaymentStatus();
      if (hasPaid) {
        throw new Error("لقد قمت بالدفع لهذا النوع من قبل");
      }

      const amount = getPaymentAmount();
      await createPaymentRecord(amount);

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

  // Handle resend OTP
  const handleResendOTP = () => {
    setStatus({
      error: null,
      success: false,
      info: "تم إعادة إرسال رمز التحقق",
    });
  };

  // Handle form submission
  const onSubmit = async (values) => {
    if (selectedPayment === "vodafone") {
      setPhoneNumber(values.phoneNumber);
      setShowOTP(true);
      setStatus({ error: null, success: false, info: null });

      setTimeout(() => {
        setStatus({
          error: null,
          success: false,
          info: "تم إرسال رمز التحقق إلى رقم " + values.phoneNumber,
        });
      }, 1000);
    } else {
      setShowConfirmation(true);
      setStatus({ error: null, success: false, info: null });
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Show already paid message
  if (alreadyPaid) {
    return (
      <AlreadyPaidScreen
        type={type}
        onBackToAuction={() => navigate(`/auction/${auction.id}`)}
      />
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
              {showOTP ? (
                <OTPScreen
                  phoneNumber={phoneNumber}
                  otpCode={otpCode}
                  setOtpCode={setOtpCode}
                  onVerify={handleOTPVerification}
                  onBack={handleBackFromOTP}
                  onResend={handleResendOTP}
                  isDisabled={isSubmitting}
                />
              ) : showConfirmation ? (
                <ConfirmationScreen
                  auction={auction}
                  type={type}
                  selectedPayment={selectedPayment}
                  phoneNumber={phoneNumber}
                  paymentMethods={paymentMethods}
                  getPaymentAmount={getPaymentAmount}
                  generateTransactionId={generateTransactionId}
                  onBack={handleBackFromConfirmation}
                  onConfirm={handleMockPayment}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <PaymentMethodSelector
                  paymentMethods={paymentMethods}
                  selectedPayment={selectedPayment}
                  setSelectedPayment={setSelectedPayment}
                  register={register}
                  errors={errors}
                  setValue={setValue}
                />
              )}
            </div>

            <BillSummary
              type={type}
              getPaymentAmount={getPaymentAmount}
              selectedPayment={selectedPayment}
              showOTP={showOTP}
              showConfirmation={showConfirmation}
              isSubmitting={isSubmitting}
              status={status}
            />
          </div>
        </form>
      </main>
    </div>
  );
}

export default Payment;
