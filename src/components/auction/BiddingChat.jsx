import React, { useState, useEffect, useRef, useContext ,useMemo } from "react";
import highestBidIcon from "../../assets/icons/highestBid.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import participantsIcon from "../../assets/icons/participants.svg";
import noOfBidsIcon from "../../assets/icons/noOfBids.svg";
import { getDatabase, ref, onValue, push, update } from "firebase/database";
import { UserContext } from "../../context/UserContext";

const BiddingChat = ({
  auctionId,
  isAuctionLive,
  endDate,
  startDate,
  hasPaidTerms,
  hasPaidInsurance,
  setAuctionWinner,
  setIsAuctionLive,
  auction,
}) => {
  const { user, userData } = useContext(UserContext);
  console.log("User from Context in BiddingChat:", user, "UserData:", userData);
  const [auctionTime, setAuctionTime] = useState(" ...");
  const [highestBid, setHighestBid] = useState("0 ج.م");
  const [noOfBids, setNoOfBids] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState([]);
  // بضيف عدد المشاركين
  const [participantsCount, setParticipantsCount] = useState(0);
  // بضيف صاحب المزاد
  const [createdBy, setCreatedBy] = useState(null);
  // بضيف حالة المزاد
  const [status, setStatus] = useState("pending");
  // الوقت المتبقي
  const [remainingTime, setRemainingTime] = useState("");
  // winner
  const [winner, setWinner] = useState(null);
  const bidsContainerRef = useRef(null);
  const db = getDatabase();

  //هنا بحدث الوقت للانتهاء  و بدء المزاد
useEffect(() => {
  if (startDate && endDate) {
    const updateTime = () => {
      const now = new Date();
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (now < startDateObj) {
        // لسه المزاد مبدأش
        setAuctionTime("لم يبدأ بعد");
      } else if (now >= startDateObj && now <= endDateObj) {
        // المزاد شغال
        const diffMs = endDateObj - now;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setAuctionTime(`ينتهي خلال: ${days} يوم و ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`);
      } else {
        // المزاد خلص
        setAuctionTime("انتهى");
        if (status !== "ended") {
          const auctionRef = ref(db, `auctions/${auctionId}`);
          update(auctionRef, { status: "ended" }).then(() => {
            setStatus("ended");
          });
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }
}, [auctionId, startDate, endDate, status]);


  // بحسب الوقت المتبقي للبداية
  useEffect(() => {
    if (startDate && !isAuctionLive && status !== "ended") {
      const updateRemainingTime = () => {
        const now = new Date();
        const startDateObj = new Date(startDate);
        const diffMs = startDateObj - now;

        if (diffMs > 0) {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          setRemainingTime(
            `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`
          );
        } else {
          setRemainingTime("0:00:00");
          setIsAuctionLive(true);
        }
      };

      updateRemainingTime();
      const interval = setInterval(updateRemainingTime, 1000);
      return () => clearInterval(interval);
    } else {
      setRemainingTime("");
    }
  }, [startDate, isAuctionLive, status]);

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
        const bidsArray = Object.values(bidsData).sort(
          (a, b) => new Date(b.bidTime) - new Date(a.bidTime)
        );
        setBids(bidsArray);

        // بجيب صاحب المزاد
        setCreatedBy(data.createdBy);

        // بجيب حالة المزاد
        setStatus(data.status || "pending");

        // بحسب أعلى سعر وعدد المزايدات
        const validBids = bidsArray.filter((bid) => bid.bidAmount > 0);
        setNoOfBids(validBids.length);
        if (validBids.length > 0) {
          setHighestBid(
            `${Math.max(...validBids.map((b) => Number(b.bidAmount)))} ج.م`
          );
        } else {
          setHighestBid(`${data.startPrice || 0} ج.م`);
        }
      }
    });

    return () => unsubscribe();
  }, [auctionId]);

  //winners
  useEffect(() => {
    if (status === "ended" && bids.length > 0) {
      const winnerBid = bids.reduce((max, current) =>
        Number(current.bidAmount) > Number(max.bidAmount) ? current : max
      );
      setWinner(winnerBid);
      setAuctionWinner(winnerBid);
    }
  }, [status, bids]);

  //  ببعت المزايدة للفايربيز لو الزاد اللايف شغال ومش أدمن
  const handleBidSubmit = async () => {
    if (!isAuctionLive || status === "ended") {
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
    // حساب الحد الأدنى المسموح للمزايدة
    const startPrice = Number(auction.startPrice) || 0;
    const minIncrement = Number(auction.minIncrement) || 0;
    const minimumBid = startPrice + minIncrement;
    // تحقق من أول مزايدة
    if (bids.length === 0 && newBidAmount < minimumBid) {
      alert(`السعر الأول يجب أن يكون أكبر من أو يساوي ${minimumBid} ج.م!`);
      return;
    }

    // اعلي سعر بيتحدث
    const highestBidAmount =
      bids.length > 0 ? Math.max(...bids.map((b) => Number(b.bidAmount))) : 0;
    if (bids.length > 0 && newBidAmount <= highestBidAmount) {
      alert("السعر المضاف أقل من أعلى سعر حالي!");
      return;
    }

    // تشكايه علي انه مسجل دخول انه صاحب المزاد
    if (!user || !user.uid || user.uid === createdBy) {
      alert("صاحب المزاد ما ينفعش يزايد!");
      return;
    }

    const bidId = `bid_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
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

  // ف حاله صاحب المزاد
  const handleEndAuction = () => {
    if (user.uid === createdBy) {
      if (bids.length === 0) {
        alert("لا يوجد مزايدات لتحديد فائز!");
        return;
      }
      // جديد
      setAuctionTime("انتهى");
      const auctionRef = ref(db, `auctions/${auctionId}`);
      update(auctionRef, { status: "ended" });
      setStatus("ended");
      setIsAuctionLive(false);

      const winnerBid = bids.reduce((max, current) =>
        Number(current.bidAmount) > Number(max.bidAmount) ? current : max
      );
      setWinner(winnerBid);
      setAuctionWinner(winnerBid);

      console.log("تفاصيل الفايز:", {
        winnerId: winnerBid.userId,
        winnerName: winnerBid.userName,
        winnerBid: winnerBid.bidAmount,
        winnerTime: winnerBid.bidTime,
      });

      update(auctionRef, {
        winnerId: winnerBid.userId,
        winnerName: winnerBid.userName,
        winnerBid: winnerBid.bidAmount,
        winnerTime: winnerBid.bidTime,
      });
      update(ref(db, `users/${winnerBid.userId}/auctions/${auctionId}`), {
        isWinner: true,
        winnerBid: winnerBid.bidAmount,
        winnerTime: winnerBid.bidTime,
      });
      update(ref(db, `winners/${auctionId}`), {
        winnerId: winnerBid.userId,
        winnerName: winnerBid.userName,
        winnerBid: winnerBid.bidAmount,
        winnerTime: winnerBid.bidTime,
      });

      setRemainingTime("");
    }
  };

  // هنا بقي الداتا بقت دينامك
  // useMemo
const stats = useMemo(() => [
  {
    label: `${auctionTime} `,
    icon: <img src={calendarIcon} alt="calendar" className="w-5 h-5" />,
    color: "border-[#FA6300] bg-[rgba(250,99,0,0.1)] text-[#702D00]",
  },
  {
    label: `عدد المشاركين : ${participantsCount}`,
    icon: <img src={participantsIcon} alt="participants" className="w-5 h-5" />,
    color: "border-[#44A46F] bg-[rgba(68,164,111,0.1)] text-[#2A6046]",
  },
  {
    label: `عدد المزايدات : ${noOfBids}`,
    icon: <img src={noOfBidsIcon} alt="noOfBids" className="w-4 h-4" />,
    color: "border-[#44A46F] bg-[rgba(68,164,111,0.1)] text-[#2A6046]",
  },
  {
    label: `أعلى عرض : ${highestBid}`,
    icon: <img src={highestBidIcon} alt="highestBid" className="w-6 h-6" />,
    color: "border-[#4CAF80] bg-[rgba(68,164,111,0.1)] text-[#2A6046]",
  },
], [auctionTime, participantsCount, noOfBids, highestBid]);

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
          className="space-y-1.5 max-h-[300px] overflow-y-auto scroll-smooth flex flex-col-reverse"
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

      {/* هشيل الإنبوت والزر لو المزاد انتهي & ونظهر زرار إنهاء لو صاحب المزاد     */}
      {user &&
      user.uid &&
      createdBy !== null &&
      user.uid === createdBy &&
      status !== "ended" ? (
        <div className="flex justify-center items-center mt-4 w-full">
          <button
            onClick={handleEndAuction}
            className="bg-[#44A46F] hover:bg-[#4f8c6b] text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200 w-full"
          >
            أنهاء المزاد
          </button>
        </div>
      ) : status !== "ended" ? (
        <div className="flex h-12">
          <input
            type="text"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="00.00 ج.م"
            className="flex-1 bg-[#F1F1F1] text-[#5F626F] px-4 py-3 rounded-r-lg text-right outline-none border-none"
            disabled={!isAuctionLive || status === "ended"}
          />
          <button
            onClick={handleBidSubmit}
            className="bg-[#FA6300] hover:bg-[#e55a00] text-white font-bold px-4 py-3 rounded-l-lg transition-colors duration-200"
            disabled={!isAuctionLive || status === "ended"}
          >
            أضف سعرك
          </button>
        </div>
      ) : null}

      {/* لو المزاد مبدأش  يوقف شكل المزاد */}
      {!isAuctionLive && status != "ended" && (
        <div className="w-full h-full absolute top-0 left-0 bg-[#65656596] text-[#d75a29e5] font-bold rounded-2xl shadow-2xl z-10 flex justify-center items-center flex-col">
          <h2>تبقى على بدء المزاد :</h2>
          <span className="ml-2 text-lg">{remainingTime}</span>{" "}
        </div>
      )}
      {/* لو المزاد انتهي  يوقف شكل المزاد */}
      {status === "ended" && (
        <div className="w-full h-full absolute top-0 left-0 bg-[#6565655c] text-black font-bold rounded-2xl shadow-2xl z-10 flex justify-center items-center">
          <h1 className=" bg-[#150e0ec5] text-white text-center w-full p-4">
            {" "}
            انتهي المزاد لصالح {winner?.userName || "  : لا احد"}{" "}
          </h1>
        </div>
      )}
    </div>
  );
};

export default BiddingChat;
