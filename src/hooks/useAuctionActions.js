import { getDatabase, ref, update, remove, get, set } from "firebase/database";
import { auth } from "../config/Firebase";
import { sendWinnerPaymentNotification } from "../utils/notificationService";
import Swal from 'sweetalert2';
import {
  handleAuctionStartWithParticipants,
  handleAuctionEndWithParticipants,
  notifyAuctionApproved,
  notifyNewAuctionToInterestedUsers,
} from "../utils/auctionNotificationUtils";

export const useAuctionActions = () => {
  const db = getDatabase();

  const handleEndAuction = async (auctionId) => {
    try {
      const auctionRef = ref(db, `auctions/${auctionId}`);
      const nowIso = new Date().toISOString();
      await update(auctionRef, { status: "ended", endDate: nowIso });

      const auctionSnap = await get(auctionRef);
      const raw = auctionSnap.exists() ? auctionSnap.val() : {};
      const auctionData = {
        id: auctionId,
        ...raw,
        category: raw.category || raw.categoryId,
      };

      let winnerInfo = null;
      try {
        const bidsSnap = await get(ref(db, `auctions/${auctionId}/bids`));
        if (bidsSnap.exists()) {
          let highestBid = -Infinity;
          let winnerUserId = null;
          bidsSnap.forEach((child) => {
            const bid = child.val();
            const amount = Number(bid.bidAmount);
            if (!Number.isNaN(amount) && amount > highestBid) {
              highestBid = amount;
              winnerUserId = bid.userId || null;
            }
          });
          if (winnerUserId && highestBid !== -Infinity) {
            winnerInfo = { userId: winnerUserId, finalBid: highestBid };

            await update(auctionRef, {
              winnerId: winnerUserId,
              winnerBid: highestBid,
            });
            const winnersRef = ref(db, `winners/${auctionId}`);
            await set(winnersRef, {
              auctionId,
              winnerId: winnerUserId,
              winnerBid: highestBid,
              isPaid: false,
              auctionTitle: raw.title || "بدون عنوان",
              auctionImage:
                raw.imageUrls?.[0] || "https://via.placeholder.com/80",
            });
            //
            try {
              await sendWinnerPaymentNotification(
                winnerUserId,
                { id: auctionId, title: raw.title },
                highestBid
              );
            } catch (e) {
              console.error("Error sending winner payment notification:", e);
            }
          }
        }
      } catch (err) {
        console.error("Error computing winner info:", err);
      }

      try {
        await handleAuctionEndWithParticipants(auctionData, winnerInfo);
      } catch (err) {
        console.error("Error sending end notifications:", err);
      }
      await Swal.fire({
        title: 'تم الإنهاء!',
        text: 'تم إنهاء المزاد بنجاح',
        icon: 'success',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#10b981'
      });
      return { success: true };
    } catch (err) {
      await Swal.fire({
        title: 'خطأ!',
        text: 'حدث خطأ أثناء إنهاء المزاد',
        icon: 'error',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#ef4444'
      });
      return { success: false, error: err };
    }
  };

  const handleRemoveAuction = async (auctionId) => {
    const result = await Swal.fire({
      title: 'تأكيد الحذف',
      text: 'هل أنت متأكد من حذف هذا المزاد؟ هذا الإجراء لا يمكن التراجع عنه.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف المزاد',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    });

    if (!result.isConfirmed) {
      return { success: false, cancelled: true };
    }

    try {
      // Optional reason from admin/user to aid auditing
      const reasonResult = await Swal.fire({
        title: 'سبب الحذف',
        input: 'textarea',
        inputLabel: 'سبب الحذف (اختياري)',
        inputPlaceholder: 'اكتب السبب هنا...',
        showCancelButton: true,
        confirmButtonText: 'متابعة',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280'
      });

      if (reasonResult.isDismissed) {
        return { success: false, cancelled: true };
      }

      const reason = reasonResult.value || null;

      // Read the auction to archive it client-side (in case backend trigger isn't active)
      const auctionRef = ref(db, `auctions/${auctionId}`);
      const snap = await get(auctionRef);
      const existing = snap.exists() ? snap.val() : null;

      // Attach deletion metadata before deletion so the backend archive gets it
      const deletionMeta = {
        deletedBy: auth.currentUser?.uid || null,
        deletedAt: new Date().toISOString(),
        reason,
      };
      await update(auctionRef, { deletionMeta });

      // Client-side archive write (idempotent with backend trigger)
      if (existing) {
        const archivePayload = {
          ...existing,
          deletionMeta,
          archivedFrom: "auctions",
          deletedAt: deletionMeta.deletedAt,
          ownerId: existing.createdBy || null,
        };
        await set(ref(db, `deleted_auctions/${auctionId}`), archivePayload);
      }

      // Hard delete (will trigger archive function too, if deployed)
      await remove(auctionRef);
      await Swal.fire({
        title: 'تم الحذف!',
        text: 'تم حذف المزاد بنجاح',
        icon: 'success',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#10b981'
      });
      return { success: true };
    } catch (err) {
      await Swal.fire({
        title: 'خطأ!',
        text: 'حدث خطأ أثناء حذف المزاد',
        icon: 'error',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#ef4444'
      });
      return { success: false, error: err };
    }
  };

  const handleApproveAuction = async (auctionId) => {
    try {
      await update(ref(db, `auctions/${auctionId}`), { status: "approved" });

      try {
        const auctionSnap = await get(ref(db, `auctions/${auctionId}`));
        if (auctionSnap.exists()) {
          const raw = auctionSnap.val();
          const auctionData = {
            id: auctionId,
            ...raw,
            category: raw.category || raw.categoryId,
          };

          // Notify the auction owner that their auction was approved
          await notifyAuctionApproved(auctionData);

          // Also notify interested users about the new approved auction
          await notifyNewAuctionToInterestedUsers(auctionData);
        }
      } catch (err) {
        console.error("Error sending approval notifications:", err);
      }
      await Swal.fire({
        title: 'تمت الموافقة!',
        text: 'تم الموافقة على المزاد بنجاح',
        icon: 'success',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#10b981'
      });
      return { success: true };
    } catch (err) {
      await Swal.fire({
        title: 'خطأ!',
        text: 'حدث خطأ أثناء الموافقة على المزاد',
        icon: 'error',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#ef4444'
      });
      return { success: false, error: err };
    }
  };

  const handleActivateAuction = async (auctionId) => {
    try {
      await update(ref(db, `auctions/${auctionId}`), {
        status: "active",
        actualStartDate: new Date().toISOString(),
      });

      try {
        const auctionSnap = await get(ref(db, `auctions/${auctionId}`));
        if (auctionSnap.exists()) {
          const raw = auctionSnap.val();
          const auctionData = {
            id: auctionId,
            ...raw,
            category: raw.category || raw.categoryId,
          };
          await handleAuctionStartWithParticipants(auctionData);
        }
      } catch (err) {
        console.error("Error sending start notifications:", err);
      }
      await Swal.fire({
        title: 'تم التفعيل!',
        text: 'تم تفعيل المزاد بنجاح',
        icon: 'success',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#10b981'
      });
      return { success: true };
    } catch (err) {
      await Swal.fire({
        title: 'خطأ!',
        text: 'حدث خطأ أثناء تفعيل المزاد',
        icon: 'error',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#ef4444'
      });
      return { success: false, error: err };
    }
  };

  const handleRejectAuction = async (auctionId) => {
    const result = await Swal.fire({
      title: 'تأكيد الرفض',
      text: 'هل أنت متأكد من رفض هذا المزاد؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، ارفض المزاد',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });

    if (!result.isConfirmed) {
      return { success: false, cancelled: true };
    }

    try {
      const reasonResult = await Swal.fire({
        title: 'سبب الرفض',
        input: 'textarea',
        inputLabel: 'سبب الرفض (اختياري)',
        inputPlaceholder: 'اكتب السبب هنا...',
        showCancelButton: true,
        confirmButtonText: 'متابعة',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280'
      });

      if (reasonResult.isDismissed) {
        return { success: false, cancelled: true };
      }

      const reason = reasonResult.value || null;
      const rejectedAt = new Date().toISOString();
      await update(ref(db, `auctions/${auctionId}`), {
        status: "rejected",
        rejectedAt,
        rejectedMeta: {
          reason,
          by: auth.currentUser?.uid || "admin",
          at: rejectedAt,
        },
      });
      await Swal.fire({
        title: 'تم الرفض!',
        text: 'تم رفض المزاد',
        icon: 'success',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#10b981'
      });
      return { success: true };
    } catch (err) {
      await Swal.fire({
        title: 'خطأ!',
        text: 'حدث خطأ أثناء رفض المزاد',
        icon: 'error',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#ef4444'
      });
      return { success: false, error: err };
    }
  };

  return {
    handleEndAuction,
    handleRemoveAuction,
    handleApproveAuction,
    handleActivateAuction,
    handleRejectAuction,
  };
};
