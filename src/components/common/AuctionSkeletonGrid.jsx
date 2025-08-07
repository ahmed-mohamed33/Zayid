import React from "react";
import AuctionSkeleton from "./AuctionSkeleton";

const AuctionSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] lg:gap-[24px] mb-8">
      {Array.from({ length: count }, (_, index) => (
        <AuctionSkeleton key={index} />
      ))}
    </div>
  );
};

export default AuctionSkeletonGrid;
