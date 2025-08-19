import React, { useRef, useContext } from "react";
import { motion } from "framer-motion";
import MazadCard from "../common/MazadCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { UserContext } from "../../context/UserContext";

function TopMazad() {
  const sliderRef = useRef(null);
  const { auctions } = useContext(UserContext);
  const filteredAuctions = auctions.filter(
    (auction) => auction.status === "approved" || auction.status === "active"
  );

  const settings = {
    dots: false,
    infinite: filteredAuctions.length >= 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: filteredAuctions.length >= 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: filteredAuctions.length >= 2,
        },
      },
      {
        breakpoint: 650,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: filteredAuctions.length >= 1,
        },
      },
    ],
  };

  return (
    <section
      dir="rtl"
      className="py-10 bg-[#F1F1F1] px-4 md:px-6 lg:px-14 overflow-hidden"
    >
      <motion.h2
        className="text-center text-2xl font-bold text-gray-700 mb-8"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        أعلى المزادات
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {filteredAuctions.length === 0 ? (
          <div className="text-center text-gray-500 text-lg font-semibold">
            لا توجد مزادات متاحة حاليًا
          </div>
        ) : filteredAuctions.length === 1 ? (
          <div className="flex justify-center">
            <motion.div
              key={filteredAuctions[0].id}
              className="px-3 w-full max-w-[400px]"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.08,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            >
              <MazadCard auctionId={filteredAuctions[0].id} />
            </motion.div>
          </div>
        ) : filteredAuctions.length === 2 ? (
          <div className="flex justify-center gap-6 flex-wrap">
            {filteredAuctions.map((auction) => (
              <motion.div
                key={auction.id}
                className="px-3 w-full max-w-[400px]"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.08,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
              >
                <MazadCard auctionId={auction.id} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Slider ref={sliderRef} {...settings}>
            {filteredAuctions.map((auction, index) => (
              <motion.div
                key={auction.id}
                className="px-3"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.08,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
              >
                <MazadCard auctionId={auction.id} />
              </motion.div>
            ))}
          </Slider>
        )}
      </motion.div>

      {filteredAuctions.length >= 3 && (
        <motion.div
          className="flex justify-center gap-4 mt-6"
          // initial={{ opacity: 0 ignition key replacement cost, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={() => sliderRef.current.slickPrev()}
            className="w-10 h-10 bg-white rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaArrowRight />
          </motion.button>
          <motion.button
            onClick={() => sliderRef.current.slickNext()}
            className="w-10 h-10 bg-white rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaArrowLeft />
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}

export default TopMazad;