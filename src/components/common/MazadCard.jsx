import React, { useContext, useState } from "react";
//img
import hummer from "../../assets/icons/sml-hummer.svg";
import users from "../../assets/icons/users.svg";
import timer from "../../assets/icons/timer.svg";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { getDatabase, ref, set, get } from "firebase/database";

function MazadCard({ auctionId }) {
  const { auctions, isAuthenticated, user, userData } = useContext(UserContext);
  const navigate = useNavigate();
  const auction = auctions.find((a) => a.id === auctionId);
  const [isParticipant, setIsParticipant] = useState(false);
  const handleAuctionClick = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (auction?.status !== "approved") {
      navigate(`/auction/${auction.id}`);
      return;
    }

    try {
      const db = getDatabase();

      const participantRef = ref(
        db,
        `auctions/${auctionId}/participants/${user.uid}`
      );
      const snapshot = await get(participantRef);

      if (snapshot.exists()) {
        navigate(`/auction/${auction.id}`);
        return;
      }
      await set(ref(db, `auctions/${auctionId}/participants/${user.uid}`), {
        userId: user.uid,
        userName: userData.fullName || "Anonymous",
        joinedAt: new Date().toISOString(),
        hasPurchasedShroot: false,
        hasPaidInsurance: false,
      });
      setIsParticipant(true);

      navigate(`/auction/${auction.id}`);
    } catch (error) {
      console.error("Error adding participant:", error);

      navigate(`/auction/${auction.id}`);
    }
  };

  if (!auction) {
    return <div className="card w-[90%] m-auto bg-white"> ..... </div>;
  }

  return (
    <div className="card bg-white w-full min-w-0 overflow-hidden break-words">
      <img
        src={auction.imageUrls ? auction.imageUrls[0] : img}
        alt={auction.title}
        className="rounded-t-md w-full h-60 object-cover"
      />
      <div
        className={`badge border-none text-[12px] ${
          auction.status === "approved"
            ? "bg-orange-500 text-white"
            : auction.status === "active"
            ? "bg-green-500 text-white"
            : auction.status === "ended"
            ? "bg-red-500 text-white"
            : "bg-gray-100 text-gray-800"
        } absolute top-2 left-2`}
      >
        {auction.status === "approved"
          ? "متاح للمعاينة"
          : auction.status === "active"
          ? "نشط"
          : auction.status === "ended"
          ? "منتهي"
          : "غير معروف"}
      </div>

      <div dir="rtl" className="card-body ">
        <h2 className="card-title text-[#4F5D75]">{auction.title}</h2>

        <p className="text-[#44A46F] font-semibold my-1 ">
          {auction.status === "approved" ? "السعر الابتدائي:" : "السعر الأعلى:"}{" "}
          {auction.status === "approved"
            ? (auction.startPrice || "غير محدد") + " ج.م"
            : auction.highestBid || "لم يتم المزايدة"}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-center">
            <img src={users} />
            <h2 className="text-[#4F5D75] mx-2 text-sm">
              المزايدين :{" "}
              {auction?.participants
                ? Object.keys(auction.participants).filter(
                    (participant) =>
                      auction.participants[participant].hasPaidInsurance ===
                        true &&
                      auction.participants[participant].hasPurchasedShroot ===
                        true
                  ).length
                : 0}
            </h2>
          </div>
          <div
            className={`flex items-center justify-center ${
              auction.status === "approved" ? "" : "hidden"
            }`}
          >
            <img className="w-[11px] h-[11px]" src={timer} />
            <p className="text-[#FA6300] mx-1 overflow-hidden max-w-[100px] text-ellipsis text-[12px] whitespace-nowrap ">
              متبقي:{" "}
              {auction.status === "approved" ? auction.remainingTime : "انتهي"}
            </p>
          </div>
        </div>
        {isAuthenticated ? (
          auction.status === "approved" ? (
            <button
              onClick={handleAuctionClick}
              className="btn w-full h-[48px] border-none rounded-lg bg-[#4F5D75] text-white mt-2  items-center justify-center"
            >
              <h2 className="mx-2">زايد الان</h2>
              <img src={hummer} alt="bid" />
            </button>
          ) : (
            <button
              className="btn w-full h-[48px] border-none rounded-lg bg-[#FA6300] text-white mt-2  items-center justify-center "
              onClick={() => navigate(`/auction/${auction.id}`)}
            >
              <h2 className="mx-2">تصفح المزاد</h2>
            </button>
          )
        ) : (
          <button
            className="btn w-full bg-gray-300 text-gray-600 mt-2 flex items-center justify-center cursor-not-allowed"
            disabled
          >
            <Link to="/login">
              <h2 className="mx-2">للمزايده والتفاصيل سجل دخول</h2>
            </Link>
          </button>
        )}
      </div>
    </div>
  );
}

export default MazadCard;
