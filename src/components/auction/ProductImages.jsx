import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import mainImg from "../../assets/images/Rectangle.png";

function ProductImages({ imageUrls }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const images =
    imageUrls && imageUrls.length > 0
      ? imageUrls
      : [mainImg, mainImg, mainImg, mainImg, mainImg];

  // Handle keyboard events for zoom modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isZoomed) return;

      if (event.key === "Escape") {
        setIsZoomed(false);
      } else if (event.key === "ArrowLeft") {
        setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (event.key === "ArrowRight") {
        setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    if (isZoomed) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isZoomed]);

  return (
    <div className=" w-full md:w-[50%] md:ml-5 mb-5 md:mb-0">
      <img
        className="w-full h-[300px] rounded-md mb-5 p-2 object-contain  bg-white shadow-md hover:shadow-lg transition-shadow duration-200 cursor-zoom-in"
        src={images[selectedImage]}
        alt="main"
        onClick={() => setIsZoomed(true)}
      />
      <div className=" flex flex-wrap items-center justify-center md:justify-start">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            className={`w-[45%] md:w-[100px] lg:h-[90px] rounded-md m-2 object-contain cursor-pointer transition-all duration-200 ${
              selectedImage === index
                ? "border-3 border-orange-500 shadow-lg scale-105"
                : "border-2 border-transparent hover:border-gray-300"
            }`}
            alt={`photo-${index}`}
            onClick={() => setSelectedImage(index)}
          />
        ))}
      </div>

      {/* zoom */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-[#000000be] flex items-center justify-center z-50 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] p-4 rounded-md">
            <img
              src={images[selectedImage]}
              alt="Zoomed image"
              className="max-w-[70vw] max-h-[90vh] object-contain rounded-md "
              onClick={(e) => e.stopPropagation()}
            />
            {/* close button */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-2 right-[-50px] bg-[#ffffffbe] hover:bg-white text-black rounded-full p-2 transition-all duration-200"
            >
              <IoClose className="w-6 h-6 text-black" />
            </button>

            {/*arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) =>
                      prev > 0 ? prev - 1 : images.length - 1
                    );
                  }}
                  className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 bg-[#ffffffbe] hover:bg-white text-black rounded-full p-2 transition-all duration-200"
                >
                  <IoChevronBack className="w-6 h-6 text-black" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((prev) =>
                      prev < images.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 bg-[#ffffffbe] hover:bg-white text-black rounded-full p-2 transition-all duration-200"
                >
                  <IoChevronForward className="w-6 h-6 text-black" />
                </button>
              </>
            )}

            {/* counter */}
            <div className="absolute bottom-[-45px] left-1/2 transform -translate-x-1/2 bg-[#ffffffbe] text-black px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductImages;
