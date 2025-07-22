import React, { memo } from "react";
import { FaGavel } from "react-icons/fa";

const AuctionsTab = memo(
  ({ userAuctions, formatCurrency, getAuctionStatusBadge }) => {
    if (userAuctions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FaGavel className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>لا توجد مزادات لهذا المستخدم</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          مزادات المستخدم ({userAuctions.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  اسم المزاد
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  السعر الابتدائي
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  تاريخ الإنشاء
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  تاريخ البدء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userAuctions.map((auction) => (
                <tr key={auction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      {auction.imageUrls && auction.imageUrls[0] && (
                        <img
                          src={auction.imageUrls[0]}
                          alt={auction.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <span>{auction.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(auction.startPrice)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getAuctionStatusBadge(auction.status)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {auction.createdAt
                      ? new Date(auction.createdAt).toLocaleDateString("ar-EG")
                      : "غير محدد"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {auction.startDate
                      ? new Date(auction.startDate).toLocaleDateString("ar-EG")
                      : "غير محدد"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

AuctionsTab.displayName = "AuctionsTab";

export default AuctionsTab;
