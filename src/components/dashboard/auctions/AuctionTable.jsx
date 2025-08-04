import React from "react";
import {
  FaEye,
  FaTrash,
  FaCheck,
  FaTimes,
  FaPlay,
  FaStop,
  FaImage,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

const AuctionTable = ({
  paginatedAuctions,
  getBidInfo,
  getStatusBadge,
  getSortIcon,
  setSortBy,
  setSortOrder,
  sortBy,
  sortOrder,
  handleViewDetails,
  handleApproveAuction,
  handleRejectAuction,
  handleActivateAuction,
  handleEndAuction,
  handleRemoveAuction,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => {
                    setSortBy("title");
                    setSortOrder(
                      sortBy === "title" && sortOrder === "asc" ? "desc" : "asc"
                    );
                  }}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  اسم المزاد {getSortIcon("title")}
                </button>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الفئة
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => {
                    setSortBy("startPrice");
                    setSortOrder(
                      sortBy === "startPrice" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  السعر الابتدائي {getSortIcon("startPrice")}
                </button>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المزايدة الحالية
              </th>
              {/* <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عدد المزايدات
              </th> */}
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => {
                    setSortBy("createdAt");
                    setSortOrder(
                      sortBy === "createdAt" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  تاريخ الإنشاء {getSortIcon("createdAt")}
                </button>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAuctions.map((auction) => {
              const { bidCount, currentBid } = getBidInfo(auction);

              return (
                <tr
                  key={auction.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {auction.imageUrls && auction.imageUrls[0] ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={auction.imageUrls[0]}
                            alt={auction.title}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <FaImage className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {auction.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {auction.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {auction.categoryId || "غير محدد"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {Number(auction.startPrice).toLocaleString()} جنيه
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currentBid > 0 ? (
                      <span className="text-green-600 font-medium">
                        {currentBid.toLocaleString()} جنيه
                      </span>
                    ) : (
                      <span className="text-gray-400">لا توجد </span>
                    )}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`${
                        bidCount > 0
                          ? "text-blue-600 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {bidCount} {bidCount === 1 ? "مزايدة" : ""}
                    </span>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(auction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {auction.createdAt
                      ? new Date(auction.createdAt).toLocaleDateString("ar-EG")
                      : "غير محدد"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* View Details */}
                      <button
                        onClick={() => handleViewDetails(auction)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        title="عرض التفاصيل"
                      >
                        <FaEye />
                      </button>

                      {/* Status-specific actions */}
                      {auction.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveAuction(auction.id)}
                            className="text-green-600 hover:text-green-800 p-1 rounded"
                            title="الموافقة على المزاد"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleRejectAuction(auction.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            title="رفض المزاد"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}

                      {auction.status === "approved" && (
                        <button
                          onClick={() => handleActivateAuction(auction.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="تفعيل المزاد"
                        >
                          <FaPlay />
                        </button>
                      )}

                      {auction.status === "active" && (
                        <button
                          onClick={() => handleEndAuction(auction.id)}
                          className="text-yellow-600 hover:text-yellow-800 p-1 rounded"
                          title="إنهاء المزاد"
                        >
                          <FaStop />
                        </button>
                      )}

                      {/* Delete action (available for all statuses) */}
                      <button
                        onClick={() => handleRemoveAuction(auction.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        title="حذف المزاد"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuctionTable;
