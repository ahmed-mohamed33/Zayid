import React from "react";
import AddAuctionForm from "../components/addAuction/AddAuctionForm";
import SideBar from "../components/addAuction/SideBar";
function AddAuctionPage() {
  return (
    <div
      className="
        bg-[#f1f1f1]
        py-10 px-30 
        flex flex-row gap-[24px]
        max-md:flex-col 
        max-md:px-[24px]
        max-md:py-[24px]
        max-lg:flex-col
      "
    >
      <AddAuctionForm />
      <SideBar />
    </div>
  );
}

export default AddAuctionPage;
