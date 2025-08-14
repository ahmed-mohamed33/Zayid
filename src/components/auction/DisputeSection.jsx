import React, { useState, useEffect, useContext } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { UserContext } from "../../context/UserContext";
import { useDisputeActions } from "../../hooks/useDisputeActions";
import Swal from "sweetalert2";

const DisputeSection = ({ auctionId, auction }) => {
  const db = getDatabase();
  const { userData, user } = useContext(UserContext);
  const { createDispute, loading } = useDisputeActions();
  const [showForm, setShowForm] = useState(false);

  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
    customReason: "",
  });

  // Fetch dispute settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = ref(db, "settings/disputes");
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
          setSettings(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching dispute settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [db]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!settings?.enabled) {
      Swal.fire({
        icon: "error",
        title: "عذراً",
        text: "نظام النزاعات غير متاح حالياً",
        confirmButtonColor: "#FA6300",
      });
      return;
    }

    // Check for valid user ID
    const userId = user?.uid;
    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لم يتم العثور على معرف المستخدم. يرجى تسجيل الدخول مرة أخرى.",
        confirmButtonColor: "#FA6300",
      });
      return;
    }

    // Validate seller ID
    if (!auction.seller.id) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لم يتم العثور على معرف البائع",
        confirmButtonColor: "#FA6300",
      });
      return;
    }

    // Get seller data
    const sellerRef = ref(db, `users/${auction.seller.id}`);
    const sellerSnap = await get(sellerRef);
    const sellerData = sellerSnap.exists() ? sellerSnap.val() : null;

    // Validate seller data
    if (!sellerData) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "لم يتم العثور على بيانات البائع",
        confirmButtonColor: "#FA6300",
      });
      return;
    }



    const disputeData = {
      auctionId,
      userId,
      reason:
        formData.reason === "other" ? formData.customReason : formData.reason,
      description: formData.description,
      amount: Number(
        auction.highestBid?.replace(" ج.م", "") || auction.startPrice || 0
      ),
      userName: userData?.fullName || user?.displayName || "مستخدم غير معروف",
      userEmail: userData?.email || user?.email || "",
      userPhone: userData?.phone || "",
      auctionTitle: auction.title || "مزاد غير معروف",
      auctionPrice: Number(
        auction.highestBid?.replace(" ج.م", "") || auction.startPrice || 0
      ),
      auctionEndDate: auction.endDate,

      sellerId: auction.seller.id,
      sellerName: auction.seller.name || "بائع غير معروف",
      sellerEmail: auction.seller.email || "",
      sellerPhone: auction.seller.phone || "",
    };

    const result = await createDispute(disputeData);

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "تم إنشاء النزاع",
        text: "سيتم مراجعة النزاع والرد عليك في أقرب وقت",
        confirmButtonColor: "#FA6300",
      });
      setShowForm(false);
      setFormData({ reason: "", description: "", customReason: "" });
    } else {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: result.message,
        confirmButtonColor: "#FA6300",
      });
    }
  };


  if (loadingSettings || !settings?.enabled || auction.status !== "ended") {
    return null;
  }

  // Check if user is logged in and a participant
  const userId = user?.uid;
  if (!userId) {
    return null;
  }

  const isParticipant =
    auction.participants?.[userId]?.hasPurchasedShroot === true;
  if (!isParticipant) {
    return null;
  }

  const auctionAmount = Number(
    auction.highestBid?.replace(" ج.م", "") || auction.startPrice
  );
  const canSubmitDispute = auctionAmount >= settings.minDisputeAmount;

  return (
    <div
      className="bg-white rounded-2xl border border-[#BFC0C0] p-4 md:px-6 w-full mt-8"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#2D3142]">
          هل لديك شكوى أو نزاع؟
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#FA6300] hover:bg-[#e55a00] text-white font-bold px-4 py-2 rounded-lg transition-colors duration-200"
          >
            تقديم نزاع
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="block text-[#2D3142] font-medium mb-2">
              سبب النزاع
            </label>
            <select
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full border border-[#E5E7EB] rounded-lg p-2"
              required
            >
              <option value="">اختر السبب</option>
              {settings.allowedReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
              <option value="other">سبب آخر</option>
            </select>
          </div>

          {/* Custom Reason */}
          {formData.reason === "other" && (
            <div>
              <label className="block text-[#2D3142] font-medium mb-2">
                السبب (حدد)
              </label>
              <input
                type="text"
                value={formData.customReason}
                onChange={(e) =>
                  setFormData({ ...formData, customReason: e.target.value })
                }
                className="w-full border border-[#E5E7EB] rounded-lg p-2"
                placeholder="اكتب سبب النزاع"
                required
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[#2D3142] font-medium mb-2">
              تفاصيل النزاع
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-[#E5E7EB] rounded-lg p-2 h-32"
              placeholder="اشرح تفاصيل المشكلة"
              required
            />
          </div>

          {/* Amount Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-[#2D3142] mb-2">
              <span className="font-medium">قيمة المزاد:</span> {auctionAmount}{" "}
              جنيه
            </p>
            {!canSubmitDispute && (
              <p className="text-red-600 text-sm">
                * لا يمكن تقديم نزاع للمزادات التي تقل قيمتها عن{" "}
                {settings.minDisputeAmount} جنيه
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 rounded-lg text-[#2D3142] border border-[#E5E7EB] hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmitDispute}
              className={`px-6 py-2 rounded-lg text-white font-semibold ${
                loading || !canSubmitDispute
                  ? "bg-[#f7a46e]"
                  : "bg-[#FA6300] hover:bg-[#e55a00]"
              }`}
            >
              {loading ? "جارِ الإرسال..." : "تقديم النزاع"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DisputeSection;
