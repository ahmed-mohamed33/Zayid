import React from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const FullScreenImageModal = ({
  showImageModal,
  selectedAuction,
  currentImageIndex,
  handleImageNavigation,
  setShowImageModal,
}) => {
  if (!showImageModal || !selectedAuction?.imageUrls) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-60">
      <div className="relative max-w-full max-h-full">
        <img
          src={selectedAuction.imageUrls[currentImageIndex]}
          alt={`${selectedAuction.title} ${currentImageIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Close Button */}
        <button
          onClick={() => setShowImageModal(false)}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
        >
          <FaTimes />
        </button>

        {/* Navigation */}
        {selectedAuction.imageUrls.length > 1 && (
          <>
            <button
              onClick={() => handleImageNavigation("prev")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => handleImageNavigation("next")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
            >
              <FaChevronRight />
            </button>
          </>
        )}

        {/* Image Info */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          {currentImageIndex + 1} / {selectedAuction.imageUrls.length}
        </div>
      </div>
    </div>
  );
};

export default FullScreenImageModal;
