import React from "react";

const MyActivities = ({ activities, loadingActivities }) => {
  return (
    <div className="overflow-x-auto min-h-[120px]">
      {loadingActivities ? (
        <table className="min-w-full text-right animate-pulse">
          <thead>
            <tr className="text-gray-500 text-base">
              <th className="py-3 px-6">اسم المزاد</th>
              <th className="py-3 px-6">حالة الكراسة</th>
              <th className="py-3 px-6">حالة التأمين</th>
              <th className="py-3 px-6">حالة المزاد</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>
                <td className="py-3 px-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="py-3 px-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="py-3 px-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="py-3 px-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : activities.length > 0 ? (
        <table className="min-w-full text-right">
          <thead>
            <tr className="text-gray-500 text-base">
              <th className="py-3 px-6">اسم المزاد</th>
              <th className="py-3 px-6">حالة الكراسة</th>
              <th className="py-3 px-6">حالة التأمين</th>
              <th className="py-3 px-6">حالة المزاد</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item, i) => (
              <tr key={i}>
                <td className="py-3 px-6 font-medium">{item.name}</td>
                <td className="py-3 px-6">
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {item.chair}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      item.insurance === "لم يتم الدفع"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {item.insurance}
                  </span>
                </td>
                <td className="py-3 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      item.auctionStatus === "جاري"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {item.auctionStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-300 py-10">
          لا يوجد نشاطات حتى الآن.
        </div>
      )}
    </div>
  );
};

export default MyActivities;
