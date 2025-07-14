import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductImages from "../components/auction/ProductImages";
import ProductDetails from "../components/auction/ProductDetails";
import ProductDescription from "../components/auction/ProductDescription";
import ProductInspection from "../components/auction/ProductInspection";
import CardsInfo from "../components/auction/CardsInfo";
import PreviewOptions from "../components/auction/PreviewOptions";
import Insurancepayment from "../components/auction/Insurancepayment";
// import BiddingChat from "../components/auction/BiddingChat";
import { UserContext } from "../context/UserContext";
import { getDatabase,ref,onValue,query,orderByChild, equalTo} from "firebase/database";

//انا عددلت ف الصفحه دي علشان اعرض الداتا علي حسب الاكشن وعملت الفيتش هنا مش ف الكونتكست
//  علشان معملش لود علي الموقع و اجيب حاله الدفع بتاعه كل اليوزر فوقت واحد 
// واحنا مش محتاجيتنهم كده بجيب لليوزر و للمزار اللي انا فيه بس   

function TheauctionPage() {
  const { auctions, user, payments } = useContext(UserContext); 
  const { auctionId } = useParams();
  const auction = auctions.find((a) => a.id === auctionId);

  // State for terms if paid 
  const [hasPaidTerms, setHasPaidTerms] = useState(false);

  useEffect(() => {
    if (user && auctionId) {
      const db = getDatabase();
      const paymentsRef = ref(db, "payments");
      const userPaymentsQuery = query(
        paymentsRef,
        orderByChild("userId"),
        equalTo(user.uid)
      );

      const unsubscribe = onValue(userPaymentsQuery, (snapshot) => {
        if (snapshot.exists()) {
          const userPayments = snapshot.val();
          const paidTerms = Object.values(userPayments).some(
            (payment) =>
              payment.auctionId === auctionId &&
              payment.type === "shroot" &&
              payment.status === "paid"
          );
          setHasPaidTerms(paidTerms);
        } else {
          setHasPaidTerms(false);
        }
      });

      return () => unsubscribe();
    }
  }, [user, auctionId]);

  if (!auction) {
    return (
      <div className="flex justify-center items-center h-screen">.....</div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-7 bg-[#F1F1F1]">
      {/* Fixed section */}
      <div className="flex flex-col md:flex-row mb-6">
        <ProductImages imageUrls={auction.imageUrls} />
        <ProductDetails
          name={auction.title}
          category={auction.categoryId}
          price={auction.startPrice}
          endDate={auction.endDate}
          allTime={auction.allTime}
          type={auction.type}
          condition={auction.condition}
          startDate={auction.startDate}
        />
      </div>
      <ProductDescription description={auction.description} />

      {/* Dynamic section */}
      {hasPaidTerms ? (
        <>
          <CardsInfo
            sellerName={auction.seller.name}
            insurancePrice={auction.insurance.amount}
            lowestBid={auction.minIncrement}
          />
          <PreviewOptions />
          <Insurancepayment />
        </>
      ) : (
        <ProductInspection termsPrice={auction.terms.price} />
      )}

      {/* <BiddingChat auctionId={auctionId} /> */}
    </div>
  );
}

export default TheauctionPage;