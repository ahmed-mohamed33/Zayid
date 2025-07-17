import React, { useRef, useContext } from "react";
import MazadCard from "../common/MazadCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { UserContext } from "../../context/UserContext";
import { Link } from "react-router-dom";

function TopMazad() {
  const sliderRef = useRef(null);
  const { auctions } = useContext(UserContext);

  const settings = {
    dots: false,
    infinite: true,
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
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 650,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section dir="rtl" className="py-10 bg-[#F1F1F1] px-[56px] overflow-hidden">
      <h2 className="text-center text-2xl font-bold text-gray-700 mb-8">
        أعلى المزادات
      </h2>

      <Slider ref={sliderRef} {...settings}>
        {auctions.map((auction) => (
          <div key={auction.id} className="px-3">
            <MazadCard auctionId={auction.id} />
          </div>
        ))}
      </Slider>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => sliderRef.current.slickPrev()}
          className="w-10 h-10 bg-white rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
        >
          <FaArrowRight />
        </button>
        <button
          onClick={() => sliderRef.current.slickNext()}
          className="w-10 h-10 bg-white rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
        >
          <FaArrowLeft />
        </button>
      </div>
    </section>
  );
}

export default TopMazad;
