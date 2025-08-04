import React from "react";
import { motion } from "framer-motion";

//icons
import Hummer from "../../assets/icons/auction-hummer.svg";
import Eye from "../../assets/icons/eyee.svg";
import Protection from "../../assets/icons/protection.svg";
import Variety from "../../assets/icons/variety.svg";

function FeatureCard({ icon, title, desc, index }) {
  return (
    <motion.div
      className="bg-white py-6 px-4 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.div
        className="flex justify-center mb-2"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1 + 0.2,
          type: "spring",
          stiffness: 200,
        }}
        viewport={{ once: true }}
      >
        <span className="p-2 rounded-full">
          <img src={icon} alt={title} className="w-12 h-12" />
        </span>
      </motion.div>
      <motion.p
        className="text-[24px] mb-2 font-semibold text-[#333c65e0]"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1 + 0.3,
        }}
        viewport={{ once: true }}
      >
        {title}
      </motion.p>
      <motion.p
        className="text-gray-600 text-[16px]"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1 + 0.4,
        }}
        viewport={{ once: true }}
      >
        {desc}
      </motion.p>
    </motion.div>
  );
}

function ZayidFeatures() {
  return (
    <div className=" px-4 md:px-6 lg:px-14  bg-[#F1F1F1] py-[96px] text-center">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">مميزات المنصة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <FeatureCard
          index={0}
          icon={Hummer}
          title="مزايدات حقيقية مباشرة"
          desc="شارك في مزايدات حية ومباشرة مع مزايدين حقيقيين"
        />
        <FeatureCard
          index={1}
          icon={Eye}
          title="معاينة قبل الشراء"
          desc="  اطلع على المنتج شخصياً أو عبر مكالمة فيديو"
        />
        <FeatureCard
          index={2}
          icon={Protection}
          title="وساطة مالية آمنة"
          desc=" حماية كاملة لحقوق البائع والمشتري"
        />
        <FeatureCard
          index={3}
          icon={Variety}
          title="فئات متنوعة"
          desc="من الإلكترونيات إلى السيارات والخدمات"
        />
      </div>
    </div>
  );
}

export default ZayidFeatures;
