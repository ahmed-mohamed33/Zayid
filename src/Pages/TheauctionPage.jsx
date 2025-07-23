import React, { useContext, useEffect, useState } from "react";
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
  // State for terms if paid
  const [hasPaidTerms, setHasPaidTerms] = useState(false);
  // State for insurance if paid
  const [hasPaidInsurance, setHasPaidInsurance] = useState(false);
  // State for check if auction time start
  const [isAuctionLive, setIsAuctionLive] = useState(false);
  // state to set auction winner //selim
  const [auctionWinner, setAuctionWinner] = useState(null);
  useEffect(() => {
    // انا عدلت تعديل بسيط بس اختصرتهم ف if واده
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
            console.log(
              "Participant Data from TheauctionPage:",
              participantData
            );
          } else {
            setHasPaidTerms(false);
            setHasPaidInsurance(false);
          }
        });
        return () => unsubscribe();
      }
    };
    getParticipantData();

    //  بحسب الوقت اللي المزاد هيبداء فيه
    if (auction?.endDate) {
      const checkAuctionTime = () => {
        const now = new Date();
        const startDate = new Date(auction.startDate);
        setIsAuctionLive(now >= startDate);
      };
      checkAuctionTime();
      const interval = setInterval(checkAuctionTime, 60000);
      return () => clearInterval(interval);
    }
  }, [user, auctionId, auction?.startDate]);

  // هنا بعمل سبينر
  if (!auction) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  const formattedDuration = formatAuctionDuration(
    auction.startDate,
    auction.endDate
  );

  // بهندل عرض حاله المزاد
  const conditionMap = {
    new: "جديد",
    old: "مستعمل",
    veryGood: "مستعمل بعناية",
  };
  const displayCondition = conditionMap[auction.productCondition] || "غير محدد";

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
      {hasPaidTerms ? (
        <>
          <CardsInfo
            sellerName={auction?.seller?.name || ""}
            insurancePrice={auction?.insurance?.amount || 0}
            lowestBid={auction?.minIncrement || 0}
            sellerLocation={auction?.inspection?.place || ""}
          />
          <PreviewOptions />

          {/* لو دفع التأمين هيظهر ده */}
          {hasPaidInsurance ? (
            <BiddingChat
              auctionId={auctionId}
              isAuctionLive={isAuctionLive}
              endDate={auction.endDate}
              hasPaidTerms={hasPaidTerms}
              hasPaidInsurance={hasPaidInsurance}
              setAuctionWinner={setAuctionWinner}
              auctionWinner={auctionWinner}
              setIsAuctionLive={setIsAuctionLive}
              auction={auction}
            >
              {/*  لو المزاد لسه ما بدأش هعرض كانه مش شغال*/}
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
