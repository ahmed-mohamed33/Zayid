import { getDatabase, ref, get, remove, update } from 'firebase/database';

// 🗑️ حذف مزاد
export const deleteAuction = async (auctionId) => {
    const db = getDatabase();
    await remove(ref(db, `auctions/${auctionId}`));
};

// 🔚 إنهاء مزاد
export const endAuctionById = async (auctionId) => {
    const db = getDatabase();
    const auctionRef = ref(db, `auctions/${auctionId}`);
    const snapshot = await get(auctionRef);

    if (!snapshot.exists()) throw new Error('المزاد غير موجود');

    const auction = snapshot.val();
    const bids = Object.values(auction?.bids || []);

    let topBid = { bidAmount: 0, userId: null };
    if (bids.length > 0) {
        topBid = bids.reduce(
            (max, bid) =>
                parseFloat(bid.bidAmount) > parseFloat(max.bidAmount) ? bid : max,
            { bidAmount: 0, userId: null }
        );
    }

    await update(auctionRef, {
        status: 'ended',
        highestBid: topBid.bidAmount,
        highestBidderId: topBid.userId || null,
    });

    return {
        highestBid: topBid.bidAmount,
        highestBidderId: topBid.userId || null,
    };
};

// 🏆 جلب المزادات اللي فاز بيها المستخدم
export const getWonAuctionsByUser = async (userId) => {
    const db = getDatabase();
    const auctionsRef = ref(db, 'auctions');
    const paymentsRef = ref(db, 'payments');
    const [auctionsSnapshot, paymentsSnapshot] = await Promise.all([
        get(auctionsRef),
        get(paymentsRef)
    ]);

    if (!auctionsSnapshot.exists()) return { data: [] };

    const allAuctions = auctionsSnapshot.val();
    const allPayments = paymentsSnapshot.exists() ? paymentsSnapshot.val() : {};

    const wonAuctions = Object.entries(allAuctions)
        .filter(
            ([_, auction]) =>
                auction?.highestBidderId === userId && auction?.status === 'ended'
        )
        .map(([auctionId, auction]) => {

            const paymentData = Object.values(allPayments).find(
                payment =>
                    payment.auctionId === auctionId &&
                    payment.userId === userId &&
                    payment.type === 'winner'
            );

            const isPaid = paymentData?.status === 'paid' || false;

            return {
                auctionId,
                finalBid: auction.highestBid || 0,
                isPaid,
            };
        });

    return { data: wonAuctions };
};
