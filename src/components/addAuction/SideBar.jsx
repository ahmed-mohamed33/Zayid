import React from 'react';
import SideBarTips from './sideBarTips';
import AuctionPreview from './AuctionPreview';

export default function SideBar() {
  return (
    <div className="flex flex-col gap-6 w-[30%] max-md:w-full">
      <SideBarTips />
      <AuctionPreview />
    </div>
  );
}