import React from 'react';

const MyPurchases = ({ loadingPurchases, purchases }) => {
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
            <div
              key={i}
              className="border border-[#E5E7EB] rounded-xl p-6 flex flex-col items-center shadow-sm"
            >
              <img
                src={item.image}
                alt="product"
                className="w-32 h-32 object-cover mb-4 rounded-lg"
              />
              <div className="font-bold mb-2 text-lg">{item.title}</div>
              <div className="text-green-700 mb-1 text-base">
                {item.price} ج.م
              </div>
              <div className="text-gray-500 text-sm mb-1">
                الحالة:{' '}
                {item.status === 'active'
                  ? 'جاري'
                  : item.status === 'pending'
                  ? 'قيد المراجعة'
                  : 'منتهي'}
              </div>
              <div
                className={`text-xs font-semibold mb-3 ${
                  item.isPaid ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {item.isPaid ? 'تم الدفع' : 'لم يتم الدفع'}
              </div>
              <button
                className="bg-gray-200 text-gray-500 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
                disabled
              >
                تم الشراء
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
