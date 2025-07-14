import React, { useContext } from "react";
import { UserContext } from "../../context/UserContext"; 
import mainImg from "../../assets/images/Rectangle.png";

function ProductImages({ imageUrls }) { 
  return (
    <div className="imgSide w-full md:w-[50%] md:ml-5 mb-5 md:mb-0">
      <img
        className="w-full h-[300px] rounded-md mb-5 object-cover"
        src={imageUrls && imageUrls.length > 0 ? imageUrls[0] : mainImg}
        alt="main"
      />
      <div className="morePhoto flex flex-wrap items-center justify-center md:justify-start">
        {imageUrls && imageUrls.length > 1 ? (
          imageUrls.slice(1).map((url, index) => ( 
            <img
              key={index}
              src={url}
              className="w-[45%] md:w-[100px] lg:h-[90px] rounded-md m-2 object-cover"
              alt={`photo-${index + 1}`}
            />
          ))
        ) : (
          [...Array(4)].map((_, index) => (
            <img
              key={index}
              src={mainImg}
              className="w-[45%] md:w-[100px] lg:h-[90px] rounded-md m-2 object-cover"
              alt={`photo-${index + 1}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ProductImages;