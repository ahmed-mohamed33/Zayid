import React, { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

function Insurancepayment() {
  const { auctions } = useContext(UserContext);
  const { auctionId } = useParams();
  const auction = auctions.find((a) => String(a.id) === String(auctionId));

  return (
    <>
      <div className="flex flex-col py-5 gap-2 bg-[#FFF0E6] text-[#4F5D75] font-bold   cursor-pointer p-2 mt-6 w-full text-right border-r-4 border-amber-600 rounded">
        <p className=" ">
          يجب دفع مبلغ التأمين قبل بدء المزاد لتتمكن من المزايدة
        </p>
        <span className="">
          مبلغ التأمين المطلوب: {auction.insurance.amount} ج.م
        </span>
        <Link to={`/payment/${auction.id}/insurance`}>
          {" "}
          {/*  انا عدلت ف اللينك دي علشان اروح علي صفحه ال باي مينت الخاصه ب التأمين لان انا بباصي التايب في اللينك*/}
          <button className="btn w-fit bg-[#4F5D75] text-white mt-3">
            دفع مبلغ التأمين
          </button>
        </Link>
      </div>
    </>
  );
}

export default Insurancepayment;
