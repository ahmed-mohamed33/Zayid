import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyPurchases = ({ loadingPurchases, purchases }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {loadingPurchases ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-6 flex flex-col items-center shadow-sm animate-pulse"
            >
              <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded" />
              <div className="h-3 bg-gray-200 w-1/2 mb-1 rounded" />
              <div className="h-3 bg-gray-200 w-1/3 mb-1 rounded" />
              <div className="h-3 bg-gray-200 w-1/4 rounded" />
            </div>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center text-gray-400 text-lg py-10">
          لا يوجد مشتريات حتى الآن.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {purchases.map((item, i) => (
            <div key={i} className="border border-[#E5E7EB] rounded-xl p-6 ">
              <div className="relative mb-4">
                <img
                  src={item.image || '/placeholder.jpg'}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => (e.target.src = '/placeholder.jpg')}
                />
                <span
                  className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.status === 'pending' ? 'قيد المراجعة' : 'منتهي'}
                </span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">
                {item.title}
              </h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-green-600">
                  {item.price} ج.م
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.isPaid
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {item.isPaid ? 'تم الدفع' : 'لم يتم الدفع'}
                </span>
              </div>
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors  ${
                  item.isPaid
                    ? 'hidden'
                    : 'bg-[#FA6300] hover:bg-[#e55a00] disabled:bg-[#e55a00] cursor-pointer'
                } text-white`}
                onClick={() => {
                  console.log('++++++item.isPaid', item.isPaid);

                  if (!item.isPaid) {
                    navigate(`/payment/${item.auctionId}/winner`);
                  }
                }}
                disabled={item.isPaid}
              >
                {item.isPaid ? 'تم الدفع' : 'اتمام الدفع'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
