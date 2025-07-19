import React from "react";

//icons
import Hummer from "../../assets/icons/auction-hummer.svg";
import Eye from "../../assets/icons/eyee.svg";
import Protection from "../../assets/icons/protection.svg";
import Variety from "../../assets/icons/variety.svg";

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-[#F1F1F1] py-6 px-4 rounded-lg shadow-md">
      <div className="flex justify-center mb-2">
        <span className="p-2 rounded-full">
          <img src={icon} alt={title} className="w-12 h-12" />
        </span>
      </div>
      <p className="text-[24px] mb-2 font-semibold text-[#333c65e0]">{title}</p>
      <p className="text-gray-600 text-[16px]">{desc}</p>
    </div>
  );
}

function ZayidFeatures() {
  return (
    <div className=" px-[56px]  py-[96px] text-center">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">مميزات المنصة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <FeatureCard icon={Hummer} title="مزايدات حقيقية مباشرة" desc="شارك في مزايدات حية ومباشرة مع مزايدين حقيقيين" />
        <FeatureCard icon={Eye} title="معاينة قبل الشراء" desc="  اطلع على المنتج شخصياً أو عبر مكالمة فيديو" />
        <FeatureCard icon={Protection} title="وساطة مالية آمنة" desc=" حماية كاملة لحقوق البائع والمشتري" />
        <FeatureCard icon={Variety} title="فئات متنوعة" desc="من الإلكترونيات إلى السيارات والخدمات" />
      </div>
    </div>
  );
}

export default ZayidFeatures;
