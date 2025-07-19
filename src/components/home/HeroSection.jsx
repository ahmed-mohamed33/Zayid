import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import heroimg from "../../assets/images/Hero.webp";

function HeroSection() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: false,
  };

  const images = [heroimg, heroimg, heroimg];

  return (
    <section className="hero-slider relative h-[88.3vh]  overflow-hidden ">
      <Slider {...settings}>
        {images.map((src, idx) => (
          <div key={idx} className="relative">
            <img
              src={src}
              alt={`slide-${idx}`}
              className="h-[88.3vh] w-full object-center"
            />
            <div className="absolute top-[50%] right-10 transform -translate-y-1/2  z-10 text-right max-w-[40%] pr-[24px]">
              <h2 className="text-5xl text-[#2D3142] font-bold mb-2">
                أهلاً بك في أول
              </h2>
              <p className="text-4xl text-[#2D3142] font-bold my-6">
                منصة مزايدات عربية
                <br /> مفتوحة للجميع!
              </p>
              <p className="text-xl  mt-7 mb-5">
                زايد,عاين,اشتري بأمان في أي فئة تحبها - من اي مكان
              </p>

              {/* ملهاش لازمة مع السلايدر لإن اليوزر مش هيلحق يسيرش */}
              {/* <div dir="rtl" className="join">
                <div>
                  <label className="input  join-item">
                    <input type="text" placeholder="ابحث عن مزاد" />
                  </label>
                </div>
                <button className="btn bg-[#FA6300] text-white text-right join-item">
                  بحث
                </button>
              </div> */}
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}

export default HeroSection;
