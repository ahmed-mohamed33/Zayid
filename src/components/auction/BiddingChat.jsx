import React, { useState, useEffect, useRef, useContext } from "react";
import highestBidIcon from "../../assets/icons/highestBid.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import participantsIcon from "../../assets/icons/participants.svg";
import noOfBidsIcon from "../../assets/icons/noOfBids.svg";
import { getDatabase, ref, onValue, push, update } from "firebase/database";
import { UserContext } from "../../context/UserContext";

const BiddingChat = ({ auctionId, isAuctionLive, endDate, hasPaidTerms, hasPaidInsurance }) => {
  const { user, userData } = useContext(UserContext);
  console.log("User from Context in BiddingChat:", user, "UserData:", userData);
  const [auctionTime, setAuctionTime] = useState(" ...");
  const [highestBid, setHighestBid] = useState("0 ج.م");
  const [noOfBids, setNoOfBids] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState([]);
  // بضيف عدد المشاركين
  const [participantsCount, setParticipantsCount] = useState(0);
  const bidsContainerRef = useRef(null);
  const db = getDatabase();

//هنا بحدث الوقت المتبقي
  useEffect(() => {
    if (!isAuctionLive && endDate) {
      const updateTime = () => {
        const now = new Date();
        const endDateObj = new Date(endDate);
        const diffMs = endDateObj - now;
        if (diffMs <= 0) {
          setAuctionTime("انتهى");
        } else {
          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setAuctionTime(`${days} أيام و ${hours} ساعات`);
        }
      };
      updateTime();
      const interval = setInterval(updateTime, 60000);//هنا بحدث كل دقيقه لحد م يوصل لوقت الانتهاء ويخلي المزاد متاح  
      return () => clearInterval(interval);
    }
  }, [isAuctionLive, endDate]);

// هنا بجيب الداتا من الفايربيز 
  useEffect(() => {
    const auctionRef = ref(db, `auctions/${auctionId}`);
    const unsubscribe = onValue(auctionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // بجيب عدد المشاركين
        const participants = data.participants || {};
        setParticipantsCount(Object.keys(participants).length);

        // بجيب البيدات
        const bidsData = data.bids || {};
        const bidsArray = Object.values(bidsData).sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
        setBids(bidsArray);

        // بحسب أعلى سعر وعدد المزايدات
        const validBids = bidsArray.filter(bid => bid.bidAmount > 0);
        setNoOfBids(validBids.length);
        if (validBids.length > 0) {
          setHighestBid(`${Math.max(...validBids.map(b => Number(b.bidAmount)))} ج.م`);
        } else {
          setHighestBid(`${data.startPrice || 0} ج.م`);
        }
      }
    });

    return () => unsubscribe();
  }, [auctionId]);

  //  ببعت المزايدة للفايربيز لو الزاد اللايف شغال ومش أدمن
  const handleBidSubmit = async () => {
    if (!isAuctionLive) {
      alert("المزاد لم يبدأ بعد!");
      return;
    }

    // بتاكد بردو انه دافع علشان لو شغل من لينك مثلا
    if (!hasPaidTerms || !hasPaidInsurance) {
      alert("يجب دفع كراسة الشروط والتأمين للمشاركة!");
      return;
    }

    const newBidAmount = Number(bidAmount);
    if (newBidAmount <= 0) {
      alert("السعر يجب أن يكون أكبر من صفر!");
      return;
    }
    // اعلي سعر بيتحدث
    const highest = bids.length > 0 ? Math.max(...bids.map(b => Number(b.bidAmount))) : 0;
    if (newBidAmount <= highest) {
      alert("السعر المضاف أقل من أفضل سعر حالي!");
      return;
    }
    
    // تشكايه علي انه مسجل دخول ومش أدمن
    if (!user || !user.uid || user.isAdmin) {
      alert("صاحب المزاد ما ينفعش يزايد!");
      return;
    }

    const bidId = `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bidData = {
      userId: user.uid || "anonymous_user",
      userName: userData?.fullName || "User", 
      bidAmount: newBidAmount,
      bidTime: new Date().toISOString(),
    };

    const bidsRef = ref(db, `auctions/${auctionId}/bids/${bidId}`);
    try {
      await update(bidsRef, bidData);
      setBidAmount("");
    } catch (error) {
      console.error("Error updating bid:", error);
      alert("حدث خطأ أثناء إضافة المزايدة، حاول مرة أخرى!");
    }
  };

   // ف حاله الادمن
  const handleEndAuction = () => {
    if (user.isAdmin) {
      setAuctionTime("انتهى");
      const auctionRef = ref(db, `auctions/${auctionId}`);
            // بحدث ف الفاير بيز
      update(auctionRef, { status: "closed" });
    }
  };


// هنا بقي الداتا بقت دينامك
  const stats = [
    {
      label: `ينتهي خلال : هنحسبها 🤌🏻`,
      icon: <img src={calendarIcon} alt="calendar" className="w-5 h-5" />,
      color: "border-[#FA6300] bg-[rgba(250,99,0,0.1)] text-[#702D00]",
    },
    {
      label: `عدد المشاركين : ${participantsCount}`,
      icon: <img src={participantsIcon} alt="participants" className="w-5 h-5" />,
      color: "border-[#44A46F] bg-[rgba(68,164,111,0.1)] text-[#2A6046]",
    },
    {
      label: `عدد المزايدات : ${noOfBids}`, // دي بتيجي متحدثه من افاير بيز
      icon: <img src={noOfBidsIcon} alt="noOfBids" className="w-4 h-4" />,
      color: "border-[#44A46F] bg-[rgba(68,164,111,0.1)] text-[#2A6046]",
    },
    {
      label: `أعلى عرض : ${highestBid}`,// زي اللي قبها
      icon: <img src={highestBidIcon} alt="highestBid" className="w-6 h-6" />,
      color: "border-[#4CAF80] bg-[rgba(68,164,111,0.1)] text-[#2A6046]",
    },
  ];

  return (
    <div
      className="bg-white rounded-2xl border border-[#BFC0C0] p-6 w-full mt-8 relative"
      dir="rtl"
    >
      <h2 className="text-2xl font-bold text-[#2D3142] text-right mb-4">
        سجل المزايدات
      </h2>

      <div className="flex flex-wrap gap-6 items-center justify-start mb-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex items-center gap-1 px-2 py-2.5 rounded border-r-[2.4px] ${stat.color}`}
          >
            <div className="shrink-0">{stat.icon}</div>
            <span className="text-base font-normal whitespace-nowrap">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-[#FCF6F6] rounded-lg p-6 mb-4">
        <div
          ref={bidsContainerRef}
          className="space-y-1.5 max-h-[300px] overflow-y-auto scroll-smooth"
        >
          {bids.map((bid, index) => (
            <div
              key={bid.bidTime}
              className={`flex items-center justify-between py-4 ${
                index < bids.length - 1 ? "border-b border-[#E9E9E9]" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#DDDDDD] rounded-full flex items-center justify-center">
                  <span className="font-bold text-base text-[#2D3142]">
                    {bid.userName?.[0] || "م"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-base text-[#2D3142]">
                    {bid.userName || "مستخدم مجهول"}
                  </div>
                  <div className="font-normal text-sm text-[#666666]">
                    {new Date(bid.bidTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="text-xl font-bold text-[#44A46F]">
                {bid.bidAmount} ج.م
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* هشيل الإنبوت والزر للأدمن هنغيره بزرار إنهاء المزاد */}
      {user.isAdmin ? (
        <div className="flex justify-center items-center mt-4 w-full">
          <button
            onClick={handleEndAuction}
            className="bg-[#44A46F] hover:bg-[#4f8c6b] text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200 w-full"
          >
            إنهاء المزاد
          </button>
        </div>
      ) : (
        <div className="flex h-12">
          <input
            type="text"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="00.00 ج.م"
            className="flex-1 bg-[#F1F1F1] text-[#5F626F] px-4 py-3 rounded-r-lg text-right outline-none border-none"
            disabled={!isAuctionLive}
          />
          <button
            onClick={handleBidSubmit}
            className="bg-[#FA6300] hover:bg-[#e55a00] text-white font-bold px-4 py-3 rounded-l-lg transition-colors duration-200"
            disabled={!isAuctionLive}
          >
            أضف سعرك
          </button>
        </div>
      )}

      {user.isAdmin && (
        <div className="flex justify-center items-center mt-4 w-full">
          <button
            onClick={handleEndAuction}
            className="bg-[#44A46F] hover:bg-[#4f8c6b] text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200 w-full"
          >
            إنهاء المزاد
          </button>
        </div>
      )}
      {/* لو المزاد مش شغال يوقف شكل الزاد */}
      {!isAuctionLive && (
        <div className="w-full h-full absolute top-0 left-0 bg-[#65656596] text-black font-bold rounded-2xl shadow-2xl z-10 flex justify-center items-center">
          تبقى على بدء المزاد ...
        </div>
      )}
    </div>
  );
};

export default BiddingChat;