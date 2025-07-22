import { getDatabase, ref, update, remove } from 'firebase/database';

export const useAuctionActions = () => {
    const db = getDatabase();

    const handleEndAuction = async (auctionId) => {
        try {
            await update(ref(db, `auctions/${auctionId}`), { status: 'ended' });
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