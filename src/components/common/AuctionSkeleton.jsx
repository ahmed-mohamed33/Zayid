import React from "react";

const AuctionSkeleton = () => {
  return (
    <div className="card bg-white w-[280px] min-w-0 overflow-hidden break-words animate-pulse mx-auto">
      {/* Image skeleton */}
      <div className="w-full h-60 bg-gray-300 rounded-t-md"></div>

      {/* Status badge skeleton */}
      <div className="absolute top-2 left-2 w-20 h-6 bg-gray-300 rounded-full"></div>

      <div dir="rtl" className="card-body">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-300 rounded mb-2"></div>

        {/* Price skeleton */}
        <div className="h-5 bg-gray-300 rounded mb-3 w-3/4"></div>

        {/* Stats row skeleton */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
        </div>

        {/* Button skeleton */}
        <div className="w-full h-12 bg-gray-300 rounded-lg mt-2"></div>
      </div>
    </div>
  );
};

export default AuctionSkeleton;
