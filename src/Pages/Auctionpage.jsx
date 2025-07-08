import React from "react";
import ProductImages from "../components/auction/ProductImages";
import ProductDetails from "../components/auction/ProductDetails";
import ProductDescription from "../components/auction/ProductDescription";
import ProductInspection from "../components/auction/productInspection";
import CardsInfo from "../components/auction/CardsInfo";
import PreviewOptions from "../components/auction/PreviewOptions";
import Insurancepayment from "../components/auction/Insurancepayment";
import BiddingChat from "../components/auction/BiddingChat";

function AuctionPage() {
  const product = {
    name: "ساعة يد نادرة من طراز رولكس",
    category: "المقتنيات الفاخرة",
    price: "20000",
    endDate: "5-7-2025  الساعة 5:00 مساءً",
    allTime: "48 ساعه",
    type: "معاينه شخصيه و فيديو لايف",
    condition: "جديد",
    description: `لوحة فنية أصلية نادرة من القرن التاسع عشر، تعود للفنان الشهير [اسم الفنان]. تتميز اللوحة بألوانها الزاهية وتفاصيلها الدقيقة التي تعكس الحياة في تلك الفترة. حالة اللوحة ممتازة مع إطار خشبي أصلي محفوظ بعناية.`,
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-7 bg-[#F1F1F1]">
      <div className="flex flex-col md:flex-row mb-6">
        <ProductImages />
        <ProductDetails product={product} />
      </div>

      <ProductDescription description={product.description} />
      <ProductInspection />
      <CardsInfo />
      {/* <PreviewOptions /> */}
      {/* <Insurancepayment /> */}
      <BiddingChat /> 
    </div>
  );
}

export default AuctionPage;