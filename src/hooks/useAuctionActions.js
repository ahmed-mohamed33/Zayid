import { getDatabase, ref, update, remove, get } from 'firebase/database';
import {
    notifyNewAuctionApproved,
    handleAuctionStartWithParticipants,
    handleAuctionEndWithParticipants,
} from '../utils/auctionNotificationUtils';

export const useAuctionActions = () => {
    const db = getDatabase();

    const handleEndAuction = async (auctionId) => {
        try {
            await update(ref(db, `auctions/${auctionId}`), { status: 'ended' });

            const auctionSnap = await get(ref(db, `auctions/${auctionId}`));
            const raw = auctionSnap.exists() ? auctionSnap.val() : {};
            const auctionData = { id: auctionId, ...raw, category: raw.category || raw.categoryId };

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
                    }
                }
            } catch (err) {

                console.error('Error computing winner info:', err);
            }


            try {
                await handleAuctionEndWithParticipants(auctionData, winnerInfo);
            } catch (err) {
                console.error('Error sending end notifications:', err);
            }
            alert('تم إنهاء المزاد بنجاح');
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء إنهاء المزاد');
            return { success: false, error: err };
        }
    };

    const handleRemoveAuction = async (auctionId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المزاد؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            return { success: false, cancelled: true };
        }

        try {
            await remove(ref(db, `auctions/${auctionId}`));
            alert('تم حذف المزاد بنجاح');
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء حذف المزاد');
            return { success: false, error: err };
        }
    };

    const handleApproveAuction = async (auctionId) => {
        try {
            await update(ref(db, `auctions/${auctionId}`), { status: 'approved' });

            try {
                const auctionSnap = await get(ref(db, `auctions/${auctionId}`));
                if (auctionSnap.exists()) {
                    const raw = auctionSnap.val();
                    const auctionData = { id: auctionId, ...raw, category: raw.category || raw.categoryId };
                    await notifyNewAuctionApproved(auctionData);
                }
            } catch (err) {
                console.error('Error sending approval notifications:', err);
            }
            alert('تم الموافقة على المزاد بنجاح');
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء الموافقة على المزاد');
            return { success: false, error: err };
        }
    };

    const handleActivateAuction = async (auctionId) => {
        try {
            await update(ref(db, `auctions/${auctionId}`), {
                status: 'active',
                actualStartDate: new Date().toISOString()
            });

            try {
                const auctionSnap = await get(ref(db, `auctions/${auctionId}`));
                if (auctionSnap.exists()) {
                    const raw = auctionSnap.val();
                    const auctionData = { id: auctionId, ...raw, category: raw.category || raw.categoryId };
                    await handleAuctionStartWithParticipants(auctionData);
                }
            } catch (err) {
                console.error('Error sending start notifications:', err);
            }
            alert('تم تفعيل المزاد بنجاح');
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء تفعيل المزاد');
            return { success: false, error: err };
        }
    };

    const handleRejectAuction = async (auctionId) => {
        if (!window.confirm('هل أنت متأكد من رفض هذا المزاد؟')) {
            return { success: false, cancelled: true };
        }

        try {
            await update(ref(db, `auctions/${auctionId}`), { status: 'rejected' });
            alert('تم رفض المزاد');
            return { success: true };
        } catch (err) {
            alert('حدث خطأ أثناء رفض المزاد');
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