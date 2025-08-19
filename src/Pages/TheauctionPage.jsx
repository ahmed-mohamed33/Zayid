import React, { useContext, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ProductImages from "../components/auction/ProductImages";
import ProductDetails from "../components/auction/ProductDetails";
import ProductDescription from "../components/auction/ProductDescription";
import ProductInspection from "../components/auction/productInspection";
import CardsInfo from "../components/auction/CardsInfo";
import PreviewOptions from "../components/auction/PreviewOptions";
import Insurancepayment from "../components/auction/Insurancepayment";
import BiddingChat from "../components/auction/BiddingChat";
import AuctionResults from "../components/auction/AuctionResults";
import DisputeSection from "../components/auction/DisputeSection"; // dispute section new selimmmmmm
import { UserContext } from "../context/UserContext";
import { getDatabase, ref, onValue, update } from "firebase/database";
import Loading from "../components/common/Loading";
import ErrorPage from "../components/common/errorPage";

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
  const { auctions, user, userData } = useContext(UserContext);
  const { auctionId } = useParams();
  const auction = auctions.find((a) => a.id === auctionId);
  // State declarations
  const [hasPaidTerms, setHasPaidTerms] = useState(false);
  const [hasPaidInsurance, setHasPaidInsurance] = useState(false);
  const [isAuctionLive, setIsAuctionLive] = useState(false);
  const [auctionWinner, setAuctionWinner] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState("pending");

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

    //<<<<<<<< انا عملت تعديل هنا علشان الحاله كانت بتتغير علي حسب الوقت مش علي حسب ال الحاله اللث جايه من الفاير بيز <<<<<

    if (auction?.startDate && auction?.endDate) {
      const checkAuctionTime = () => {
        const db = getDatabase();
        const now = new Date();
        const startDateObj = new Date(auction.startDate);
        const endDateObj = new Date(auction.endDate);
        if (auctionStatus === "ended") {
          setIsAuctionLive(false);
          return;
        }

        if (now >= startDateObj && now <= endDateObj) {
          setIsAuctionLive(true);
          if (auctionStatus !== "active") {
            update(ref(db, `auctions/${auctionId}`), { status: "active" })
              .then(() => {
                // Status updated successfully
              })
              .catch((error) => {
                console.error("Error updating auction status:", error);
              });
          }
        } else if (now > endDateObj) {
          setIsAuctionLive(false);
          if (auctionStatus !== "ended") {
            update(ref(db, `auctions/${auctionId}`), { status: "ended" });
          }
        } else {
          setIsAuctionLive(false);
        }
      };

      //   checkAuctionTime();
      //   const interval = setInterval(checkAuctionTime, 60000);
      //   return () => clearInterval(interval);
      // }

      if (auctionId) {
        const db = getDatabase();
        const auctionRef = ref(db, `auctions/${auctionId}`);
        const unsubscribeStatus = onValue(auctionRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const now = new Date();
            const startDateObj = new Date(data.startDate);
            const endDateObj = new Date(data.endDate);

            setAuctionStatus(data.status || "pending");

            // update status dynamic passed on time --Taiseer
            if (data.status !== "ended" && now > endDateObj) {
              update(ref(db, `auctions/${auctionId}`), { status: "ended" })
                .then(() => setAuctionStatus("ended"))
                .catch((error) => {
                  console.error(
                    "Error updating auction status to ended:",
                    error
                  );
                });
            } else if (
              data.status !== "active" &&
              now >= startDateObj &&
              now <= endDateObj
            ) {
              update(ref(db, `auctions/${auctionId}`), { status: "active" })
                .then(() => setAuctionStatus("active"))
                .catch((error) => {
                  console.error(
                    "Error updating auction status to active:",
                    error
                  );
                });
            }

            // update isAuctionLive passed on time --Taiseer
            setIsAuctionLive(now >= startDateObj && now <= endDateObj);
          }
        });
        return () => unsubscribeStatus();
      }
    }
  }, [
    user,
    auctionId,
    auction?.startDate,
    auction?.endDate,
    auctionStatus,
    auction,
  ]);

  // هنا بعمل سبينر
  if (!auction || !auctionStatus) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen px-4 md:px-6 lg:px-14 py-6 bg-[#F1F1F1]">
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
          hasPaidTerms={hasPaidTerms}
          auction={auction}
          status={auctionStatus}
        />
      </div>
      <ProductDescription description={auction.description} />

      {/* Dynamic section */}
      {/**لو دفع الشروط  هيظهر ده */}
      {isAuctionLive ? (
        <>
          {hasPaidTerms && (
            <CardsInfo
              sellerName={auction?.seller?.name || ""}
              insurancePrice={auction?.insurance?.amount || 0}
              lowestBid={auction?.minIncrement || 0}
              sellerLocation={auction?.inspection?.place || ""}
              auctionId={auctionId}
            />
          )}
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
          ></BiddingChat>
        </>
      ) : user && auction.createdBy && user.uid === auction.createdBy ? (
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
          {!isAuctionLive && (
            <div className="w-full h-full absolute top-0 left-0 bg-[#8e5135b8] z-10 flex justify-center items-center text-white">
              تبقى على بدء المزاد ...
            </div>
          )}
        </BiddingChat>
      ) : hasPaidTerms &&
        (auction.status === "approved" || auction.status === "active") ? (
        <>
          <CardsInfo
            sellerName={auction?.seller?.name || ""}
            insurancePrice={auction?.insurance?.amount || 0}
            lowestBid={auction?.minIncrement || 0}
            sellerLocation={auction?.inspection?.place || ""}
            auctionId={auctionId}
          />
          {auction.status === "approved" && <PreviewOptions />}
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

      {auction.status === "ended" && (
        <AuctionResults auctionId={auctionId} auction={auction} />
      )}

      {/* Dispute section selimmmmmm */}
      <DisputeSection auctionId={auctionId} auction={auction} />
    </div>
  );
}

export default TheauctionPage;
