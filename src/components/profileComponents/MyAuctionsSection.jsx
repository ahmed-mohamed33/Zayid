import { ref, update } from 'firebase/database';
import { auth, database } from './../../config/Firebase';

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { getAuctionsByUser } from '../../utils/firebaseUtils';

const MyAuctionsSection = ({
  endAuction,
  handleDeleteAuction,
  setStats,
  activeTab,
  myAuctions,
  setAuctions,
}) => {
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoadingAuctions(true);
          const { data } = await getAuctionsByUser(user.uid);

          if (data) {
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
                      parseFloat(bid.bidAmount) > parseFloat(max.bidAmount)
                        ? bid
                        : max,
                    { bidAmount: 0, userName: 'لا يوجد مزايدين' }
                  );
                }

                const now = new Date();
                const startDate = new Date(value.startDate);
                const endDate = new Date(value.endDate);

                let status = value.status || 'pending';

                if (
                  (status === 'pending' || status === 'active') &&
                  now > endDate
                ) {
                  status = 'ended';

                  let topBid = { bidAmount: 0, userId: null };
                  if (bids.length > 0) {
                    topBid = bids.reduce(
                      (max, bid) =>
                        parseFloat(bid.bidAmount) > parseFloat(max.bidAmount)
                          ? bid
                          : max,
                      { bidAmount: 0, userId: null }
                    );
                  }

                  const auctionRef = ref(database, `auctions/${id}`);
                  await update(auctionRef, {
                    status: 'ended',
                    highestBid: topBid.bidAmount,
                    highestBidderId: topBid.userId || null,
                  });
                } else if (
                  status === 'pending' &&
                  now >= startDate &&
                  now <= endDate
                ) {
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

            const pending = allAuctions.filter(
              (a) => a.status === 'pending'
            ).length;
            const active = allAuctions.filter(
              (a) => a.status === 'active'
            ).length;
            const ended = allAuctions.filter(
              (a) => a.status === 'ended'
            ).length;

            setAuctions(allAuctions);
            setStats({
              total: allAuctions.length,
              active,
              pending,
              ended,
            });
          } else {
            setAuctions([]);
          }
        } catch (error) {
          console.error('Error loading auctions:', error);
        } finally {
          setLoadingAuctions(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <>
      {activeTab === 'مزاداتي' && (
        <div className="overflow-x-auto min-h-[100px]">
          {loadingAuctions ? (
            <table className="min-w-full text-right animate-pulse">
              <thead>
                <tr className="text-gray-500 text-base">
                  <th className="py-3 px-6">اسم المزاد</th>
                  <th className="py-3 px-6">قيمة أعلى سعر</th>
                  <th className="py-3 px-6">حالة المزاد</th>
                  <th className="py-3 px-6">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : myAuctions.length > 0 ? (
            //  جدول المزادات الحقيقي
            <table className="min-w-full text-right">
              <thead>
                <tr className="text-gray-500 text-base">
                  <th className="py-3 px-6">اسم المزاد</th>
                  <th className="py-3 px-6">قيمة أعلى سعر</th>
                  <th className="py-3 px-6">حالة المزاد</th>
                  <th className="py-3 px-6">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {myAuctions.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 px-6 font-medium">{item.title}</td>
                    <td className="py-3 px-6">
                      {/* لو عايزين ف المستقبل نعرض اسم صاحب اعلى مزايده (${item.topBidder}) */}
                      {item.finalBid
                        ? `${item.finalBid} جنيه `
                        : 'لا توجد مزايدات'}
                    </td>

                    <td className="py-3 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          item.status === 'active'
                            ? 'bg-green-100 text-green-600'
                            : item.status === 'pending'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {item.status === 'active'
                          ? 'جاري'
                          : item.status === 'pending'
                          ? 'قيد المراجعة'
                          : 'منتهي'}
                      </span>
                    </td>

                    <td className="py-3 px-6">
                      {item.status === 'pending' && (
                        <button
                          onClick={() => handleDeleteAuction(item.id)}
                          className="flex items-center gap-1 text-red-600 bg-red-100 hover:bg-red-200 px-4 py-1 rounded-full font-semibold transition"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M6 18L18 6M6 6l12 12"
                              stroke="#EF4444"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          حذف
                        </button>
                      )}

                      {item.status === 'active' && (
                        <button
                          onClick={() => endAuction(item.id)}
                          className="flex items-center gap-1 text-yellow-600 bg-yellow-100 hover:bg-yellow-200 px-4 py-1 rounded-full font-semibold transition"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M6 18L18 6M6 6l12 12"
                              stroke="#D97706"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          إنهاء
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // ✅ عند عدم وجود بيانات بعد التحميل
            <div className="text-center text-gray-300 py-10">
              <svg
                className="mx-auto mb-3"
                xmlns="http://www.w3.org/2000/svg"
                width="42"
                height="42"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-6h6v6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h3l2-2h2l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z"
                />
              </svg>
              لا يوجد مزادات حالياً.
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MyAuctionsSection;
