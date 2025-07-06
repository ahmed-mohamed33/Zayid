import React from 'react';
import SideBarTips from './sideBarTips';
import AuctionPreview from './AuctionPreview';

export default function SideBar() {
  return (
    <>
      <style>
        {`
          .sidebar-container {
            width: 30%;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          @media (max-width: 768px) {
            .sidebar-container {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="sidebar-container">
        <SideBarTips />
        <AuctionPreview />
      </div>
    </>
  );
}
