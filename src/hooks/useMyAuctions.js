// import { ref, update } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

import { getWonAuctionsByUser } from '../utils/auctionUtils';
import { database } from '../config/Firebase';

const fetchMyAuctions = async (user) => {
  const { data } = await getWonAuctionsByUser(user.uid);
  if (!data) return [];

  const auctionEntries = Object.entries(data);
  const allAuctions = await Promise.all(
    auctionEntries.map(async ([id, value]) => {
      const bids = value.bids
        ? Object.values(value.bids).filter((bid) => bid?.bidAmount)
        : [];

      let topBid = { bidAmount: 0, userName: 'لا يوجد مزايدين' };
      if (bids.length > 0) {
        topBid = bids.reduce(
          (max, bid) =>
            parseFloat(bid.bidAmount) > parseFloat(max.bidAmount) ? bid : max,
          { bidAmount: 0, userName: 'لا يوجد مزايدين' }
        );
      }

      const now = new Date();
      const startDate = new Date(value.startDate);
      const endDate = new Date(value.endDate);

      let status = value.status || 'pending';

      if ((status === 'pending' || status === 'active') && now > endDate) {
        status = 'ended';
        const auctionRef = ref(database, `auctions/${id}`);
        await update(auctionRef, {
          status: 'ended',
          highestBid: topBid.bidAmount,
          highestBidderId: topBid.userId || null,
        });
      } else if (status === 'pending' && now >= startDate && now <= endDate) {
        status = 'active';
        const auctionRef = ref(database, `auctions/${id}`);
        await update(auctionRef, { status: 'active' });
      }

      return {
        id,
        ...value,
        finalBid: topBid.bidAmount,
        topBidder: topBid.userName,
        status,
      };
    })
  );

  return allAuctions;
};

export default fetchMyAuctions;
