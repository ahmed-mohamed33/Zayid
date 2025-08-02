import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import Swal from "sweetalert2";
import highestBidIcon from "../../assets/icons/highestBid.svg";
import calendarIcon from "../../assets/icons/calendar.svg";
import participantsIcon from "../../assets/icons/participants.svg";
import noOfBidsIcon from "../../assets/icons/noOfBids.svg";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { UserContext } from "../../context/UserContext";
import { updateAuctionStatus } from "../../utils/firebaseUtils";
import { sendOutbidNotification } from "../../utils/notificationService";

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
          const hours = Math.floor(
            (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

          setAuctionTime(
            `ينتهي خلال: ${days} يوم و ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`
          );
        } else {
          // المزاد خلص
          setAuctionTime("انتهى");
          if (status !== "ended") {
            updateAuctionStatus(auctionId, "ended");
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
          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          setRemainingTime(
            `${days} يوم و ${hours.toString().padStart(2, "0")}  : ${minutes
              .toString()
              .padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`
          );
        } else {
          setRemainingTime("0:00:00");
          setIsAuctionLive(true);
          updateAuctionStatus(auctionId, "active");
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


//==================================================================
  //  ببعت المزايدة للفايربيز لو الزاد اللايف شغال ومش أدمن
  const handleBidSubmit = async () => {
    if (!isAuctionLive || status === "ended") {
      Swal.fire({
        title: "المزاد غير متاح!",
        text: "المزاد لم يبدأ بعد أو انتهى!",
        icon: "warning",
        confirmButtonText: "حسنًا",
        confirmButtonColor: "#FA6300",
      });
      return;
    }

    if (!hasPaidTerms || !hasPaidInsurance) {
      Swal.fire({
        title: "الدفع غير مكتمل!",
        text: "يجب دفع كراسة الشروط والتأمين للمشاركة!",
        icon: "error",
        confirmButtonText: "حسنًا",
        confirmButtonColor: "#FA6300",
      });
      return;
    }

    const newBidAmount = Number(bidAmount);
    if (newBidAmount <= 0) {
      Swal.fire({
        title: "سعر غير صحيح!",
        text: "السعر يجب أن يكون أكبر من صفر!",
        icon: "error",
        confirmButtonText: "حسنًا",
        confirmButtonColor: "#FA6300",
      });
      return;
    }

    const startPrice = Number(auction.startPrice) || 0;
    const minIncrement = Number(auction.minIncrement) || 0;
    const minimumBid = startPrice + minIncrement;

    if (bids.length === 0 && newBidAmount < minimumBid) {
      Swal.fire({
        title: "اعد ادخال السعر!",
        text: `السعر الأول يجب أن يكون أكبر من أو يساوي ${minimumBid} ج.م!`,
        icon: "error",
        confirmButtonText: "حسنًا",
        confirmButtonColor: "#FA6300",
      });
      return;
    }

    const highestBidAmount =
      bids.length > 0 ? Math.max(...bids.map((b) => Number(b.bidAmount))) : 0;
    if (bids.length > 0 && newBidAmount <= highestBidAmount) {
      Swal.fire({
        title: "السعر منخفض!",
        text: "السعر المضاف أقل من أعلى سعر حالي!",
        icon: "error",
        confirmButtonText: "حسنًا",
        confirmButtonColor: "#FA6300",
      });
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

      // Update the highest price immediately
      const auctionRef = ref(db, `auctions/${auctionId}`);
      const updatedBids = [...bids, bidData];
      const newHighestBid = Math.max(
        ...updatedBids.map((b) => Number(b.bidAmount))
      );
      const formattedHighestBid = `${newHighestBid} ج.م`;
      await update(auctionRef, { highestBid: formattedHighestBid });

      // Update local state
      setBids(updatedBids);
      setBidAmount("");

      // Send outbid notifications to previous highest bidders
      if (bids.length > 0) {
        const previousHighestBid = bids.reduce((max, current) =>
          Number(current.bidAmount) > Number(max.bidAmount) ? current : max
        );

        // Don't send notification to the current bidder
        if (previousHighestBid.userId !== user.uid) {
          const auctionData = {
            id: auctionId,
            title: auction.title || "المزاد",
            image: auction.imageUrls?.[0] || "",
          };

          await sendOutbidNotification(
            previousHighestBid.userId,
            auctionData,
            newBidAmount
          );
        }
      }
      setHighestBid(formattedHighestBid);
    } catch (error) {
      console.error("Error updating bid:", error);
      Swal.fire({
        title: "خطأ!",
        text: "حدث خطأ أثناء إضافة المزايدة، حاول مرة أخرى!",
        icon: "error",
        confirmButtonText: "حسنًا",
        confirmButtonColor: "#FA6300",
      });
    }
  };
  // =========================================================================================

  // ف حاله صاحب المزاد
  const handleEndAuction = () => {
    if (user.uid === createdBy) {
      if (bids.length === 0) {
        Swal.fire({
          title: "لا يوجد مزايدات!",
          text: "لا يوجد مزايدات لتحديد فائز!",
          icon: "warning",
          confirmButtonText: "حسنًا",
          confirmButtonColor: "#FA6300",
        });
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
      set(ref(db, `users/${winnerBid.userId}/auctions/${auctionId}`), {
        isWinner: true,
        winnerBid: winnerBid.bidAmount,
        winnerTime: winnerBid.bidTime,
        auctionId: auctionId,
        auctionTitle: auction.title || "مزاد",
        auctionImage: auction.image || "",
        isPaid: false,
      });
      update(ref(db, `winners/${auctionId}`), {
        winnerId: winnerBid.userId,
        winnerName: winnerBid.userName,
        winnerBid: winnerBid.bidAmount,
        winnerTime: winnerBid.bidTime,
        isPaid: false,
        auctionId: auctionId,
        auctionTitle: auction.title || "مزاد",
        auctionImage: auction.imageUrls?.[0] || "",
      });

      setRemainingTime("");
    }
  };

  // هنا بقي الداتا بقت دينامك
  // useMemo
  const stats = useMemo(
    () => [
      {
        label: `${auctionTime} `,
        icon: <img src={calendarIcon} alt="calendar" className="w-5 h-5" />,
        color: "border-[#FA6300] bg-[rgba(250,99,0,0.1)] text-[#702D00]",
      },
      {
        label: `عدد المشاركين : ${participantsCount}`,
        icon: (
          <img src={participantsIcon} alt="participants" className="w-5 h-5" />
        ),
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
    ],
    [auctionTime, participantsCount, noOfBids, highestBid]
  );

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

      {!isAuctionLive && status !== "ended" && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center text-center p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-[#FA6300] mb-2 animate-pulse">
            المزاد سيبدأ قريبًا
          </h2>
          <div className="text-[#2D3142] text-lg font-semibold">
            تبقّى على بدء المزاد:
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#2D3142] tracking-wide animate-pulse">
            {remainingTime}
          </div>
          <div className="mt-4 text-sm text-[#555] italic">
            يرجى الانتظار حتى يتم تفعيل المزاد تلقائيًا
          </div>
        </div>
      )}

      {/* لو المزاد انتهي  يوقف شكل المزاد */}
      {status === "ended" && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-1 rounded-2xl flex flex-col justify-center items-center p-6 shadow-2xl">
          <div className="bg-white text-center flex justify-center items-center rounded-xl p-6 shadow-md max-w-md w-full animate-fade-in-up">
            <h1 className="text-xl font-extrabold text-[#fa3a00] mx-2 ">
              المزاد انتهى
            </h1>
            <div className="text-lg text-[#2D3142] flex ">
              الفائز:{" "}
              <p className="font-bold text-[#44A46F] animate-bounce mx-2">
                {winner?.userName || "لا يوجد فائز"}
              </p>
            </div>
            🎉
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingChat;
