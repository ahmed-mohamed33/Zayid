import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import ProductImages from "../components/auction/ProductImages";
import ProductDetails from "../components/auction/ProductDetails";
import ProductDescription from "../components/auction/ProductDescription";
import ProductInspection from "../components/auction/productInspection";
import CardsInfo from "../components/auction/CardsInfo";
// import PreviewOptions from "../components/auction/PreviewOptions";
// import Insurancepayment from "../components/auction/Insurancepayment";
import BiddingChat from "../components/auction/BiddingChat";
import { UserContext } from "../context/UserContext";

function AuctionPage() {
  const { auctions } = useContext(UserContext);
  const { auctionId } = useParams();
  const auction = auctions.find((a) => a.id === auctionId);

  if (!auction) {
    return (
      <div className="flex justify-center items-center h-screen"> ..... </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-7 bg-[#F1F1F1]">
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
      <ProductInspection termsPrice={auction.terms.price} />
      <CardsInfo
        sellerName={auction.seller.name}
        insurancePrice={auction.insurance.amount}
        lowestBid={auction.minIncrement}
      />
      {/* <PreviewOptions /> */}
      {/* <Insurancepayment /> */}
      <BiddingChat auctionId={auctionId} />
    </div>
  );
}

export default AuctionPage;
