import React from 'react';
import SideBarTips from '../addAuction/SideBarTips';
// import AuctionPreview from './AuctionPreview';

export default function SideBar( ) {
  return (
    <div className="flex flex-col gap-6 w-[40%] max-md:w-full max-md:hidden">
      <SideBarTips  />
      {/* <AuctionPreview /> */}
    </div>
  );
}