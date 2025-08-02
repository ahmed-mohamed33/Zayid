import React from "react";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCopy,
} from "react-icons/fa";

const AuctionModal = ({
  showModal,
  selectedAuction,
  currentImageIndex,
  setCurrentImageIndex,
  handleImageNavigation,
  openImageModal,
  getBidInfo,
  getStatusBadge,
  setShowModal,
}) => {
  if (!showModal || !selectedAuction) return null;
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {});
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">تفاصيل المزاد</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-6">
            {/* Images Section */}
            {selectedAuction.imageUrls &&
              selectedAuction.imageUrls.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    صور المزاد ({selectedAuction.imageUrls.length})
                  </h4>

                  {/* Main Image Display */}
                  <div className="relative mb-4">
                    <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedAuction.imageUrls[currentImageIndex]}
                        alt={`${selectedAuction.title} ${
                          currentImageIndex + 1
                        }`}
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={() => openImageModal(currentImageIndex)}
                      />

                      {/* Navigation Arrows */}
                      {selectedAuction.imageUrls.length > 1 && (
                        <>
                          <button
                            onClick={() => handleImageNavigation("prev")}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                          >
                            <FaChevronLeft />
                          </button>
                          <button
                            onClick={() => handleImageNavigation("next")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                          >
                            <FaChevronRight />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} /{" "}
                        {selectedAuction.imageUrls.length}
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => openImageModal(currentImageIndex)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                        title="عرض بحجم كامل"
                      >
                        <FaExpand />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Navigation */}
                  {selectedAuction.imageUrls.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedAuction.imageUrls.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex
                              ? "border-orange-500"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${selectedAuction.title} thumbnail ${
                              index + 1
                            }`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">اسم المزاد:</span>
                  <p className="text-gray-900 mt-1">{selectedAuction.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    اسم صاحب المزاد:
                  </span>
                  <p className="text-gray-900 mt-1">
                    {selectedAuction.seller.name} 
                    
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-700">رقم المزاد:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm mt-1">
                        {selectedAuction.id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedAuction.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FaCopy className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">الفئة:</span>
                  <p className="text-gray-900 mt-1">
                    {selectedAuction.categoryId || "غير محدد"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    السعر الابتدائي:
                  </span>
                  <p className="text-gray-900 mt-1 font-semibold">
                    {Number(selectedAuction.startPrice).toLocaleString()} جنيه
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    المزايدة الحالية:
                  </span>
                  <p className="text-gray-900 mt-1">
                    {(() => {
                      const { currentBid } = getBidInfo(selectedAuction);
                      return currentBid > 0 ? (
                        <span className="text-green-600 font-semibold">
                          {currentBid.toLocaleString()} جنيه
                        </span>
                      ) : (
                        <span className="text-gray-400">لا توجد مزايدات</span>
                      );
                    })()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">الحالة:</span>
                  <div className="mt-1">
                    {getStatusBadge(selectedAuction.status)}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    تاريخ الإنشاء:
                  </span>
                  <p className="text-gray-900 mt-1">
                    {selectedAuction.createdAt
                      ? new Date(selectedAuction.createdAt).toLocaleString(
                          "ar-EG"
                        )
                      : "غير محدد"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    تاريخ البدء المخطط:
                  </span>
                  <p className="text-gray-900 mt-1">
                    {selectedAuction.startDate
                      ? new Date(selectedAuction.startDate).toLocaleString(
                          "ar-EG"
                        )
                      : "غير محدد"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    تاريخ الانتهاء:
                  </span>
                  <p className="text-gray-900 mt-1">
                    {selectedAuction.endDate
                      ? new Date(selectedAuction.endDate).toLocaleString(
                          "ar-EG"
                        )
                      : "غير محدد"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    عدد المزايدات:
                  </span>
                  <p className="text-gray-900 mt-1">
                    {(() => {
                      const { bidCount } = getBidInfo(selectedAuction);
                      return `${bidCount} ${
                        bidCount === 1 ? "مزايدة" : "مزايدات"
                      }`;
                    })()}
                  </p>
                </div>
                {selectedAuction.actualStartDate && (
                  <div>
                    <span className="font-medium text-gray-700">
                      تاريخ التفعيل الفعلي:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedAuction.actualStartDate).toLocaleString(
                        "ar-EG"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {selectedAuction.description && (
              <div>
                <span className="font-medium text-gray-700">وصف المزاد:</span>
                <p className="text-gray-900 mt-2 bg-gray-50 p-4 rounded-lg">
                  {selectedAuction.description}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-2 justify-end">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionModal;
