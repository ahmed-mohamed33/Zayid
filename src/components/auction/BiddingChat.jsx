import React, { useState, useEffect, useRef } from 'react';
import highestBidIcon from '../../assets/icons/highestBid.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import participantsIcon from '../../assets/icons/participants.svg';
import noOfBidsIcon from '../../assets/icons/noOfBids.svg';




const BiddingChat = () => {
  const [auctionTime, setAuctionTime] = useState('2 ايام و 4 ساعات');
  const [highestBid, setHighestBid] = useState('2.500 ج.م');
  const [noOfBids, setNoOfBids] = useState(12);
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState([
    {
      id: 1,
      user: 'مستخدم رقم #8421',
      amount: '2500',
      time: 'منذ دقيقة',
      avatar: 'م'}]);
  const user = {isAdmin: true};
  const bidsContainerRef = useRef(null);
  useEffect(() => {
    if (bidsContainerRef.current) {
      bidsContainerRef.current.scrollTop = bidsContainerRef.current.scrollHeight;
    }
  }, [bids]);

  const stats = [
    {
      label: `ينتهي خلال : ${auctionTime}`,
      icon: (
        <img src={calendarIcon} alt="calendar" className="w-5 h-5" />
      ),
      color: 'border-[#FA6300] bg-[rgba(250,99,0,0.1)] text-[#702D00]'
    },
    {
      label: 'عدد المشاركين : 12',
      icon: (
        <img src={participantsIcon} alt="participants" className="w-5 h-5" />
      ),
      color: 'border-[#44A46F] bg-[rgba(68,164,111,0.1)] text-[#2A6046]'
    },
    {
      label: `عدد المزايدات : ${noOfBids}`,
      icon: (
        <img src={noOfBidsIcon} alt="noOfBids" className="w-4 h-4" />
      ),
      color: 'border-[#44A46F] bg-[rgba(68,164,111,0.1)] text-[#2A6046]'
    },
    {
      label: `اعلي عرض : ${highestBid}`,
      icon: (
        <img src={highestBidIcon} alt="highestBid" className="w-6 h-6" />
      ),
      color: 'border-[#4CAF80] bg-[rgba(68,164,111,0.1)] text-[#2A6046]'
    },
    

  ];

  const handleBidSubmit = async ()  => {
    if (Number(bidAmount) > 0 && Number(bidAmount) > Number(bids[bids.length - 1].amount)) {
      console.log('Bid submitted:', bidAmount);
      setBids([...bids, {
        id: bids.length + 1,
        user: 'مستخدم رقم #8421',
        amount: Number(bidAmount),
        time: 'منذ دقيقة',
        avatar: bids.length %2 === 0 ? 'م' : 'س'
      }]);

      setHighestBid(Number(bidAmount));
      setBidAmount('');
      setNoOfBids(bids.length + 1);
    }else{
      alert('السعر المضاف أقل من أفضل سعر حالي');
    }
  };

  const handleEndAuction = () => {
    setAuctionTime('انتهى');

  };

  return (
    <div className="bg-white rounded-2xl border border-[#BFC0C0] p-6 w-full mt-8" dir="rtl">
  
      <h2 className="text-2xl font-bold text-[#2D3142] text-right mb-4">
        سجل المزايدات
      </h2>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-6 items-center justify-start mb-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`flex items-center gap-1 px-2 py-2.5 rounded border-r-[2.4px] ${stat.color}`}
          >
             <div className="shrink-0">
              {stat.icon}
            </div>
            <span className="text-base font-normal whitespace-nowrap">
              {stat.label}
            </span>
           
          </div>
        ))}
      </div>

      {/* Bidding History */}
      <div className="bg-[#FCF6F6] rounded-lg p-6 mb-4">
        <div ref={bidsContainerRef} className="space-y-1.5 max-h-[300px] overflow-y-auto scroll-smooth">
          {bids.map((bid, index) => (
            <div
              key={bid.id}
              className={`flex items-center justify-between py-4 ${
                index < bids.length - 1 ? 'border-b border-[#E9E9E9]' : ''
              }`}
            >
              {/* User Info */}
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="w-10 h-10 bg-[#DDDDDD] rounded-full flex items-center justify-center">
                  <span className="font-bold text-base text-[#2D3142]">
                    {bid.avatar}
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-base text-[#2D3142] leading-normal">
                    {bid.user}
                  </div>
                  <div className="font-normal text-sm text-[#666666] leading-normal">
                    {bid.time}
                  </div>
                </div>
              </div>

              {/* Bid Amount */}
              <div className="text-xl font-bold text-[#44A46F] text-left">
                {bid.amount}ج.م
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* bidding input */}
      <div className="flex h-12">
        <input
          type="text"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="00.00 ج.م"
          className="flex-1 bg-[#F1F1F1] text-[#5F626F] px-4 py-3 rounded-r-lg text-right outline-none border-none"
        />
        <button
          onClick={handleBidSubmit}
          className="bg-[#FA6300] hover:bg-[#e55a00] text-white font-bold px-4 py-3 rounded-l-lg transition-colors duration-200"
        >
          أضف سعرك
        </button>
      </div>
      {/* end of bidding input */}
      {user.isAdmin && (
        <div className="flex justify-center items-center mt-4 w-full">
        <button onClick={handleEndAuction} className="bg-[#44A46F] hover:bg-[#4f8c6b] text-white font-bold px-4 py-3 rounded-lg transition-colors duration-200 w-[340px] justify-items-center">
        انهاء المزاد
        </button> 
      </div>
      )}
    </div>
  );
};

export default BiddingChat;
