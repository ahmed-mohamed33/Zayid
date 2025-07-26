import React, { useState, useEffect, useContext, useMemo } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { UserContext } from "../../context/UserContext";

const AuctionResults = ({ auctionId }) => {
  const { userData } = useContext(UserContext);
  const [bids, setBids] = useState([]);
  const [participants, setParticipants] = useState({});
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const auctionRef = ref(db, `auctions/${auctionId}`);

    const unsubscribe = onValue(auctionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAuctionData(data);
        const bidsData = data.bids || {};
        const bidsArray = Object.values(bidsData).sort(
          (a, b) => new Date(a.bidTime) - new Date(b.bidTime)
        );
        setBids(bidsArray);
        setParticipants(data.participants || {});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auctionId]);

  const auctionStats = useMemo(() => {
    if (!auctionData || !bids.length) {
      return {
        winner: null,
        highestBid: 0,
        totalBids: 0,
        priceIncrease: 0,
        totalBiddingTime: 0,
        participantsCount: 0,
        firstBidTime: null,
        lastBidTime: null,
      };
    }

    const validBids = bids.filter((bid) => bid.bidAmount > 0);
    const startPrice = auctionData.startPrice || 0;
    const highestBidAmount = Math.max(
      ...validBids.map((bid) => Number(bid.bidAmount))
    );
    const winner = validBids.find(
      (bid) => Number(bid.bidAmount) === highestBidAmount
    );

    const priceIncrease =
      startPrice > 0 ? ((highestBidAmount - startPrice) / startPrice) * 100 : 0;

    const firstBid = validBids[0];
    const lastBid = validBids[validBids.length - 1];
    const totalBiddingTime =
      firstBid && lastBid
        ? new Date(lastBid.bidTime) - new Date(firstBid.bidTime)
        : 0;

    return {
      winner,
      highestBid: highestBidAmount,
      totalBids: validBids.length,
      priceIncrease: Math.round(priceIncrease * 100) / 100,
      totalBiddingTime,
      participantsCount: Object.keys(participants).length,
      firstBidTime: firstBid?.bidTime,
      lastBidTime: lastBid?.bidTime,
    };
  }, [auctionData, bids, participants]);

  const formatDuration = (milliseconds) => {
    if (milliseconds <= 0) return "0 دقيقة";
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) {
      return `${days} يوم و ${hours} ساعة`;
    } else if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    } else {
      return `${minutes} دقيقة`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 w-full mt-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Improved UI/UX for website identity

  if (!auctionStats.winner) {
    return (
      <div className="bg-white rounded-2xl  shadow-md p-6 w-full mt-8 text-center text-[#4F5D75] flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-3"></div>
        <h3 className="text-xl font-bold mb-2 text-[#FA6300]">
          لم يتم تحديد فائز
        </h3>
        <p className="text-base text-[#4F5D75]">
          لم يتم تقديم أي مزايدات على هذا المزاد
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl  shadow-md p-6 w-full mt-8" dir="rtl">
      <h2 className="text-2xl font-extrabold text-[#FA6300] mb-6 flex items-center gap-2">
        نتائج المزاد
      </h2>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#44A46F] bg-opacity-10 p-2"></div>
          <div>
            <div className="text-base font-semibold text-[#44A46F] mb-1">
              الفائز:{" "}
              <span className="text-[#2D3142] font-bold">
                {auctionStats.winner.userName || "مستخدم مجهول"}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              انتهى المزاد في {formatDate(auctionStats.winner.bidTime)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-base font-semibold text-[#2D3142]">
          <span className="rounded-full bg-[#FA6300] bg-opacity-10 px-2 py-1 text-white text-lg font-bold">
            {auctionStats.highestBid.toLocaleString()} ج.م
          </span>
          <span className="text-sm text-gray-500">أعلى مزايدة</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#F7F8FA] rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-xs text-gray-500 mb-1">إجمالي المزايدات</span>
          <span className="font-extrabold text-[#2D3142] text-lg">
            {auctionStats.totalBids}
          </span>
        </div>
        <div className="bg-[#F7F8FA] rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-xs text-gray-500 mb-1">عدد المشاركين</span>
          <span className="font-extrabold text-[#2D3142] text-lg">
            {auctionStats.participantsCount}
          </span>
        </div>
        <div className="bg-[#F7F8FA] rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-xs text-gray-500 mb-1">نسبة الزيادة</span>
          <span className="font-extrabold text-[#FA6300] text-lg">
            {auctionStats.priceIncrease}%
          </span>
        </div>
        <div className="bg-[#F7F8FA] rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-xs text-gray-500 mb-1">مدة المزايدة</span>
          <span className="font-extrabold text-[#2D3142] text-lg">
            {formatDuration(auctionStats.totalBiddingTime)}
          </span>
        </div>
        <div className="bg-[#F7F8FA] rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-xs text-gray-500 mb-1">السعر الابتدائي</span>
          <span className="font-extrabold text-[#44A46F] text-lg">
            {(auctionData?.startPrice || 0).toLocaleString()} ج.م
          </span>
        </div>
        <div className="bg-[#F7F8FA] rounded-lg p-4 flex flex-col items-center shadow-sm">
          <span className="text-xs text-gray-500 mb-1">السعر النهائي</span>
          <span className="font-extrabold text-[#FA6300] text-lg">
            {auctionStats.highestBid.toLocaleString()} ج.م
          </span>
        </div>
      </div>
      {auctionStats.firstBidTime && auctionStats.lastBidTime && (
        <div className="bg-[#F7F8FA] rounded-lg p-4 mb-4 flex flex-col sm:flex-row sm:justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">أول مزايدة:</span>
            <span className="font-medium text-[#2D3142]">
              {formatDate(auctionStats.firstBidTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">آخر مزايدة:</span>
            <span className="font-medium text-[#2D3142]">
              {formatDate(auctionStats.lastBidTime)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionResults;
