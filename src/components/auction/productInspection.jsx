import React, { useContext } from 'react';
import paper from '../../assets/images/Group 2147226028.png';
import { Link, useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

// 14-7  5:30 am انا عدلت ف الصفحه دي علشان اروح علي صفحه ال باي مينت الخاصه ب المذاد 
function ProductInspection({ termsPrice }) {
  const { auctions } = useContext(UserContext);
  const { auctionId } = useParams();

  const auction = auctions.find((a) => String(a.id) === String(auctionId));
  if (!auction) {
    return (
      <div className="text-red-500 text-center my-4">
        لا يوجد مزاد مطابق. تأكد من الرابط.
      </div>
    );
  }
  return (
    auction.status === "approved" && (
      <div
        id="korasetElShroot"
        className="korasetElShroot w-full bg-white rounded-md shadow-md p-4 my-6"
      >
        <h2 className="font-bold text-xl text-[#2D3142]">خيارات معاينة المنتج</h2>
        <div className="mt-6 w-fit flex flex-col items-center justify-center">
          <img src={paper} className="w-auto h-auto" alt="كراسة الشروط" />
          <h2 className="text-center font-extrabold my-3 text-[#4F5D75]">
            كراسة الشروط
          </h2>
          <Link to={`/payment/${auction.id}/shroot`}> {/*  انا عدلت ف اللينك دي علشان اروح علي صفحه ال باي مينت الخاصه ب شروط المزاد لان انا بباصي التايب في اللينك*/}
            <button className="btn bg-[#4F5D75] text-white border-none shadow-none">
              شراء كراسة الشروط
            </button>
          </Link>
          <span className="text-center text-[#44A46F] py-2">
            السعر : {termsPrice} جنيه
          </span>
        </div>
        <button className="bg-[#FFF0E6] p-2 mt-2.5 w-full text-right border-r-4 border-amber-600 rounded text-sm">
          من اجل معاينة المنتج يجب عليك شراء كراسة الشروط
        </button>
      </div>
    )
  );
}

export default ProductInspection;
