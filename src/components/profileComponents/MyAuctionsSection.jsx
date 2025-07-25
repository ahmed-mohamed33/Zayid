import React from 'react';

const MyAuctions = ({
  myAuctions,
  loadingAuctions,
  handleDeleteAuction,
  endAuction,
}) => {
  return (
    <div className="overflow-x-auto min-h-[100px]">
      {loadingAuctions ? (
        // Skeleton
        <table className="min-w-full text-right animate-pulse">
          <thead>
            <tr className="text-gray-500 text-base">
              <th className="py-3 px-6">اسم المزاد</th>
              <th className="py-3 px-6">قيمة أعلى سعر</th>
              <th className="py-3 px-6">حالة المزاد</th>
              <th className="py-3 px-6">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td className="py-4 px-6">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </td>
                <td className="py-4 px-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </td>
                <td className="py-4 px-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="py-4 px-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : myAuctions.length > 0 ? (
        <table className="min-w-full text-right">
          <thead>
            <tr className="text-gray-500 text-base">
              <th className="py-3 px-6">اسم المزاد</th>
              <th className="py-3 px-6">قيمة أعلى سعر</th>
              <th className="py-3 px-6">حالة المزاد</th>
              <th className="py-3 px-6">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {myAuctions.map((item, i) => (
              <tr key={i}>
                <td className="py-3 px-6 font-medium">{item.title}</td>
                <td className="py-3 px-6">
                  {item.finalBid ? `${item.finalBid} جنيه` : 'لا توجد مزايدات'}
                </td>
                <td className="py-3 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      item.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : item.status === 'pending'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {item.status === 'active'
                      ? 'جاري'
                      : item.status === 'pending'
                      ? 'قيد المراجعة'
                      : 'منتهي'}
                  </span>
                </td>
                <td className="py-3 px-6">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleDeleteAuction(item.id)}
                      className="flex items-center gap-1 text-red-600 bg-red-100 hover:bg-red-200 px-4 py-1 rounded-full font-semibold transition"
                    >
                      حذف
                    </button>
                  )}
                  {item.status === 'active' && (
                    <button
                      onClick={() => endAuction(item.id)}
                      className="flex items-center gap-1 text-yellow-600 bg-yellow-100 hover:bg-yellow-200 px-4 py-1 rounded-full font-semibold transition"
                    >
                      إنهاء
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-300 py-10">
          لا يوجد مزادات حالياً.
        </div>
      )}
    </div>
  );
};

export default MyAuctions;
