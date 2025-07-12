import React, { useContext } from "react";
//img
import img from "../../assets/images/Frame.jpg";
import users from "../../assets/images/profile-2user.png";
import timer from "../../assets/images/timer.png";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext"; 

function MazadCard({ auctionId }) {
  const { auctions } = useContext(UserContext); 
  const auction = auctions.find((a) => a.id === auctionId); 

  if (!auction) {
    return <div className="card w-[90%] m-auto bg-white"> ..... </div>;
  }

  return (
    <div className="card w-[90%] m-auto bg-white">
      <img
        src={auction.imageUrls ? auction.imageUrls[0] : img} 
        alt={auction.title}
        className="rounded-t-md w-full h-55 object-cover"
      />
      <div dir="rtl" className="card-body ">
        <h2 className="card-title text-[#4F5D75]">{auction.title}</h2>
        <p className="text-[#44A46F] font-semibold my-1">السعر الابتدائي: {auction.startPrice || 'غير محدد'}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-center">
            <img src={users} />
            <h2 className="text-[#4F5D75] mx-2">المزايدين {auction.usersInMAzad || 0}</h2>
          </div>
          <div className="flex items-center justify-center">
            <img className="w-[15px] h-[15px]" src={timer} />
            <p className="text-[#FA6300] mx-1">متبقي: {auction.time || 'غير محدد'} أيام</p>
          </div>
        </div>
        <Link to={`/auction/${auction.id}`}>
          <button className="btn w-full bg-[#4F5D75] text-white mt-2 flex items-center justify-center">
            <h2 className="mx-2">زايد الان</h2>
            <img src={img} />
          </button>
        </Link>
      </div>
    </div>
  );
}

export default MazadCard;