import React from "react";
import mainImg from "../../assets/images/Rectangle.png";

function ProductImages() {
  return (
    <div className="imgSide w-full md:w-[50%] md:ml-5 mb-5 md:mb-0">
      <img
        className="w-full h-[300px] rounded-md mb-5 object-cover"
        src={mainImg}
        alt="main"
      />
      <div className="morePhoto flex flex-wrap items-center justify-center md:justify-start">
        {[...Array(4)].map((_, index) => (
          <img
            key={index}
            src={mainImg}
            className="w-[45%] md:w-[100px] lg:h-[90px]  rounded-md m-2 object-cover"
            alt={`photo-${index}`}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductImages;
