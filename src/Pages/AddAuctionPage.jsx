import React from 'react';
import AddAuctionForm from '../components/addAuction/addAuctionForm';
import SideBar from '../components/addAuction/SideBar';

function AddAuctionPage() {
  return (
    <>
      <style>
        {`
          .auction-page {
            background-color: #f1f1f1;
            padding: 40px 56px;
            display: flex;
            flex-direction: row;
            gap: 24px;
          }

          @media (max-width: 768px) {
            .auction-page {
              flex-direction: column;
              padding: 24px;
            }
          }
        `}
      </style>

      <div className="auction-page">
        <AddAuctionForm />
        <SideBar />
      </div>
    </>
  );
}

export default AddAuctionPage;
