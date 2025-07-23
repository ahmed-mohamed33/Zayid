import React, { useContext, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ProductImages from "../components/auction/ProductImages";
import ProductDetails from "../components/auction/ProductDetails";
import ProductDescription from "../components/auction/ProductDescription";
import ProductInspection from "../components/auction/ProductInspection";
import CardsInfo from "../components/auction/CardsInfo";
import PreviewOptions from "../components/auction/PreviewOptions";
import Insurancepayment from "../components/auction/Insurancepayment";
import BiddingChat from "../components/auction/BiddingChat";
import { UserContext } from "../context/UserContext";
import { getDatabase, ref, onValue } from "firebase/database";
import Loading from "../components/common/Loading";
import ErrorPage from "../components/common/errorPage";

// انا عملت دي علشان احسب مدة المزاد ب  (أيام/ساعات/دقايق)
const formatAuctionDuration = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return "غير محدد";

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffMs = end - start;

  if (isNaN(diffMs) || diffMs <= 0) return "غير محدد";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffHour = Math.floor(diffHours % 24);

  if (diffDays >= 1) {
    return `${diffDays} يوم${diffDays > 1 ? "" : ""} و ${diffHour} ساعة`;
  } else if (diffHours >= 1) {
    const remainingMins = diffMins % 60;
    return `${diffHours} ساعة${
      remainingMins > 0 ? ` و${remainingMins} دقيقة` : ""
    }`;
  } else {
    return `${diffMins} دقيقة`;
  }
};

function TheauctionPage() {
  const { auctions, user } = useContext(UserContext);
  const { auctionId } = useParams();
  const auction = auctions.find((a) => a.id === auctionId);

  // State declarations
  const [hasPaidTerms, setHasPaidTerms] = useState(false);
  const [hasPaidInsurance, setHasPaidInsurance] = useState(false);
  const [isAuctionLive, setIsAuctionLive] = useState(false);
  const [auctionWinner, setAuctionWinner] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState("pending");
const [isUserActive, setIsUserActive] = useState(true);

  const formattedDuration = useMemo(() => {
    return auction
      ? formatAuctionDuration(auction.startDate, auction.endDate)
      : "غير محدد";
  }, [auction?.startDate, auction?.endDate]);

  const displayCondition = useMemo(() => {
    const conditionMap = {
      new: "جديد",
      old: "مستعمل",
      veryGood: "مستعمل بعناية",
    };
    return auction
      ? conditionMap[auction.productCondition] || "غير محدد"
      : "غير محدد";
  }, [auction?.productCondition]);

  useEffect(() => {
    const getParticipantData = async () => {
      if (user && auctionId) {
        const db = getDatabase();
        const participantRef = ref(
          db,
          `auctions/${auctionId}/participants/${user.uid}`
        );
        const unsubscribe = onValue(participantRef, (snapshot) => {
          if (snapshot.exists()) {
            const participantData = snapshot.val();
            setHasPaidTerms(participantData.hasPurchasedShroot === true);
            setHasPaidInsurance(participantData.hasPaidInsurance === true);
            setIsParticipant(true);
            console.log(
              "Participant Data from TheauctionPage:",
              participantData
            );
          } else {
            setHasPaidTerms(false);
            setHasPaidInsurance(false);
            setIsParticipant(false);
          }
        });
        return () => unsubscribe();
      } else {
        setIsParticipant(false);
      }
    };
    getParticipantData();

    if (auction?.startDate && auction?.endDate) {
      const checkAuctionTime = () => {
        const now = new Date();
        const startDate = new Date(auction.startDate);
        const endDate = new Date(auction.endDate);
        setIsAuctionLive(now >= startDate && now <= endDate);
      };
      checkAuctionTime();
      const interval = setInterval(checkAuctionTime, 60000);
      return () => clearInterval(interval);
    }
    if (auctionId) {
      const db = getDatabase();
      const auctionRef = ref(db, `auctions/${auctionId}`);
      const unsubscribeStatus = onValue(auctionRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setAuctionStatus(data.status || "pending");
        }
      });
      return () => unsubscribeStatus();
    }

    if (user && user.uid) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      const unsubscribeProfile = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.isActive === true) {
          setIsUserActive(true);
        } else {
          setIsUserActive(false);
        }
      });
      return () => unsubscribeProfile();
    }
  }, [user, auctionId, auction?.startDate, auction?.endDate]);

  // هنا بعمل سبينر
  if (!auction) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

if (!isUserActive || auctionStatus === "rejected" || (isAuctionLive && !isParticipant)) {
    return !isUserActive ? (
      <ErrorPage
        message="عذرًا، حسابك غير مفعل بعد. يرجى التواصل مع الدعم أو التحقق من الداشبورد لتفعيله."
        redirectTo="/"
      />
    ) : auctionStatus === "rejected" ? (
      <ErrorPage message="هذا المزاد لم يتم الموافقه عليه" redirectTo="/" />
    ) : (
      <ErrorPage
        message="عذرًا، ليس لديك إذن بالدخول إلى هذا المزاد. يرجى التأكد من أنك مسجل كمشارك وأنك دفعته كراسة الشروط والتأمين قبل بدء المزاد."
        redirectTo="/"
      />
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-7 bg-[#F1F1F1]">
      <div className="flex flex-col md:flex-row mb-6">
        {/* Fixed section */}
        <ProductImages imageUrls={auction.imageUrls} />
        <ProductDetails
          name={auction.title}
          category={auction.categoryId}
          price={auction.startPrice}
          endDate={auction.endDate}
          allTime={formattedDuration}
          type={auction.type}
          condition={displayCondition}
          startDate={auction.startDate}
        />
      </div>
      <ProductDescription description={auction.description} />

      {/* Dynamic section */}
      {/**لو دفع الشروط  هيظهر ده */}
      {user && auction.createdBy && user.uid === auction.createdBy ? (
        <BiddingChat
          auctionId={auctionId}
          isAuctionLive={isAuctionLive}
          endDate={auction.endDate}
          startDate={auction.startDate}
          hasPaidTerms={true}
          hasPaidInsurance={true}
          setAuctionWinner={setAuctionWinner}
          auctionWinner={auctionWinner}
          setIsAuctionLive={setIsAuctionLive}
          auction={auction}
        >
          {/*  لو المزاد لسه ما بدأش هعرض كانه مش شغال */}
          {!isAuctionLive && (
            <div className="w-full h-full absolute top-0 left-0 bg-[#8e5135b8] z-10 flex justify-center items-center text-white">
              تبقى على بدء المزاد ...
            </div>
          )}
        </BiddingChat>
      ) : hasPaidTerms ? (
        <>
          <CardsInfo
            sellerName={auction?.seller?.name || ""}
            insurancePrice={auction?.insurance?.amount || 0}
            lowestBid={auction?.minIncrement || 0}
            sellerLocation={auction?.inspection?.place || ""}
            auctionId={auctionId}
          />
          <PreviewOptions />

          {/* لو دفع التأمين هيظهر ده */}
          {hasPaidInsurance ? (
            <BiddingChat
              auctionId={auctionId}
              isAuctionLive={isAuctionLive}
              endDate={auction.endDate}
              startDate={auction.startDate}
              hasPaidTerms={hasPaidTerms}
              hasPaidInsurance={hasPaidInsurance}
              setAuctionWinner={setAuctionWinner}
              auctionWinner={auctionWinner}
              setIsAuctionLive={setIsAuctionLive}
              auction={auction}
            >
              {/*  لو المزاد لسه ما بدأش هعرض كانه مش شغال */}
              {!isAuctionLive && (
                <div className="w-full h-full absolute top-0 left-0 bg-[#8e5135b8] z-10 flex justify-center items-center text-white">
                  تبقى على بدء المزاد ...
                </div>
              )}
            </BiddingChat>
          ) : (
            <Insurancepayment auctionId={auctionId} />
          )}
        </>
      ) : (
        <ProductInspection termsPrice={auction?.terms?.price || 0} />
      )}
    </div>
  );
}

export default TheauctionPage;
