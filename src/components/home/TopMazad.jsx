import React, { useRef } from 'react';
import MazadCard from '../common/MazadCard';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// imgs
import img from '../../assets/images/smartWatch.png';

function TopMazad() {
  const sliderRef = useRef(null);

  const mazadItems = [
    { image: img, price: '3,500', title: 'ساعة ذكية' },
    { image: img, price: '3,500', title: 'ساعة ذكية' },
    { image: img, price: '3,500', title: 'ساعة ذكية' },
    { image: img, price: '3,500', title: 'ساعة ذكية' },
  ];

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
        }
      },
      {
        breakpoint: 768, 
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 650, 
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <section dir='rtl' className="py-10 bg-[#F1F1F1] px-5 overflow-hidden">
      <h2 className="text-center text-2xl font-bold text-gray-700 mb-8">أعلى المزادات</h2>
      
      <Slider ref={sliderRef} {...settings}>
        {mazadItems.map((item, index) => (
          <div key={index}>
            <MazadCard image={item.image} price={item.price} title={item.title} />
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
