import { useState, useEffect, useMemo, useCallback } from "react";
import { getDatabase, ref, update, remove, onValue } from "firebase/database";
import { FaUser, FaUserCheck, FaUserTimes } from "react-icons/fa";

export const useUserProfile = (user) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [userAuctions, setUserAuctions] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [showFullImage, setShowFullImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
  });

  const db = getDatabase();

  // Fetch user's auctions and payments
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userIdentifier = user.userId || user.id;

        if (!userIdentifier) {
          console.error("No user identifier found");
          return;
        }

        // Fetch user's auctions
        const auctionsRef = ref(db, "auctions");
        const auctionsUnsubscribe = onValue(auctionsRef, (snapshot) => {
          if (snapshot.exists()) {
            const allAuctions = snapshot.val();
            const userAuctionsArray = Object.entries(allAuctions)
              .filter(([_, auction]) => auction.createdBy === user.userId)
              .map(([id, auction]) => ({ id, ...auction }));
            setUserAuctions(userAuctionsArray);
          } else {
            setUserAuctions([]);
          }
        });

        // Fetch user's payments
        const paymentsRef = ref(db, "payments");
        const paymentsUnsubscribe = onValue(paymentsRef, (snapshot) => {
          if (snapshot.exists()) {
            const allPayments = snapshot.val();
            const userPaymentsArray = Object.entries(allPayments)
              .filter(([_, payment]) => payment.userId === user.userId)
              .map(([id, payment]) => ({ id, ...payment }));
            setUserPayments(userPaymentsArray);
          } else {
            setUserPayments([]);
          }
        });

        return () => {
          auctionsUnsubscribe();
          paymentsUnsubscribe();
        };
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user.userId, user.id, db]);

  // Action handlers
  const handleApprove = useCallback(async () => {
    setActionLoading(true);
    try {
      const userKey = user.nationalID || user.id;
      await update(ref(db, `users/${userKey}`), {
        isActive: true,
        activatedAt: new Date().toISOString(),
        activatedBy: "admin",
      });
      setLocalUser((prev) => ({ ...prev, isActive: true }));
      return { success: true, message: "تم تفعيل المستخدم بنجاح" };
    } catch (error) {
      console.error("Error approving user:", error);
      return { success: false, message: "حدث خطأ أثناء التفعيل" };
    } finally {
      setActionLoading(false);
    }
  }, [user.nationalID, user.id, db]);

  const handleBlock = useCallback(async () => {
    setActionLoading(true);
    try {
      const userKey = user.nationalID || user.id;
      await update(ref(db, `users/${userKey}`), {
        isActive: false,
        blockedAt: new Date().toISOString(),
        blockedBy: "admin",
      });
      setLocalUser((prev) => ({ ...prev, isActive: false }));
      return { success: true, message: "تم حظر المستخدم بنجاح" };
    } catch (error) {
      console.error("Error blocking user:", error);
      return { success: false, message: "حدث خطأ أثناء الحظر" };
    } finally {
      setActionLoading(false);
    }
  }, [user.nationalID, user.id, db]);

  const handleRemove = useCallback(async () => {
    setActionLoading(true);
    try {
      const userKey = user.nationalID || user.id;
      await remove(ref(db, `users/${userKey}`));
      return { success: true, message: "تم حذف المستخدم بنجاح" };
    } catch (error) {
      console.error("Error removing user:", error);
      return { success: false, message: "حدث خطأ أثناء الحذف" };
    } finally {
      setActionLoading(false);
    }
  }, [user.nationalID, user.id, db]);

  const handleSaveEdit = useCallback(async () => {
    setActionLoading(true);
    try {
      const userKey = user.nationalID || user.id;
      await update(ref(db, `users/${userKey}`), {
        ...editForm,
        updatedAt: new Date().toISOString(),
        updatedBy: "admin",
      });
      setLocalUser((prev) => ({ ...prev, ...editForm }));
      setIsEditing(false);
      return { success: true, message: "تم تحديث بيانات المستخدم بنجاح" };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, message: "حدث خطأ أثناء التحديث" };
    } finally {
      setActionLoading(false);
    }
  }, [user.nationalID, user.id, db, editForm]);

  // Memoized computed values
  const statusInfo = useMemo(() => {
    if (localUser.isActive === true) {
      return {
        text: "مفعل",
        color: "bg-green-100 text-green-800",
        icon: FaUserCheck,
      };
    } else if (localUser.isActive === false) {
      return {
        text: "محظور",
        color: "bg-red-100 text-red-800",
        icon: FaUserTimes,
      };
    } else {
      return {
        text: "معلق",
        color: "bg-yellow-100 text-yellow-800",
        icon: FaUser,
      };
    }
  }, [localUser.isActive]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  const getAuctionStatusBadge = useCallback((status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "معلق" },
      approved: { color: "bg-blue-100 text-blue-800", text: "معتمد" },
      active: { color: "bg-green-100 text-green-800", text: "نشط" },
      ended: { color: "bg-gray-100 text-gray-800", text: "منتهي" },
      rejected: { color: "bg-red-100 text-red-800", text: "مرفوض" },
    };
    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  }, []);

  const getPaymentTypeName = useCallback((type) => {
    const typeNames = {
      insurance: "تأمين",
      shroot: "كراسة شروط",
      auction: "مزاد",
    };
    return typeNames[type] || type || "غير محدد";
  }, []);

  const getPaymentMethodName = useCallback((method) => {
    const methodNames = {
      vodafone: "فودافون كاش",
      card: "بطاقة ائتمان",
      visa: "فيزا",
      mastercard: "ماستركارد",
    };
    return methodNames[method] || method || "غير محدد";
  }, []);

  return {
    // State
    actionLoading,
    localUser,
    userAuctions,
    userPayments,
    showFullImage,
    setShowFullImage,
    isEditing,
    setIsEditing,
    editForm,
    setEditForm,
    statusInfo,

    // Actions
    handleApprove,
    handleBlock,
    handleRemove,
    handleSaveEdit,

    // Utilities
    formatCurrency,
    getAuctionStatusBadge,
    getPaymentTypeName,
    getPaymentMethodName,
  };
};
