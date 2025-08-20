import React, { useState, useContext, useEffect } from "react";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCopy,
  FaPencilAlt,
  FaCheck,
} from "react-icons/fa";
import { UserContext } from "../../../context/UserContext";
import { getDatabase, ref, update } from "firebase/database";
import Swal from "sweetalert2";
import {
  getUsersWhoParticipatedInAuction,
  sendAuctionEditNotification,
} from "../../../utils/notificationService";

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
  onAuctionUpdate,
}) => {
  if (!showModal || !selectedAuction) return null;

  const { auctions, setAuctions } = useContext(UserContext);
  const db = getDatabase();
  const [startPrice, setStartPrice] = useState(
    selectedAuction.startPrice || ""
  );
  const [startDate, setStartDate] = useState(
    selectedAuction.startDate
      ? new Date(selectedAuction.startDate).toISOString().slice(0, 16)
      : ""
  );
  const [endDate, setEndDate] = useState(
    selectedAuction.endDate
      ? new Date(selectedAuction.endDate).toISOString().slice(0, 16)
      : ""
  );
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [isEditingEndDate, setIsEditingEndDate] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);
  const [originalAuction, setOriginalAuction] = useState(null);

  const convertDbDateToLocal = (dbDate) => {
    if (!dbDate) return "";
    const dateLocal = new Date(dbDate);

    const dateAdjusted = new Date(
      dateLocal.getTime() - dateLocal.getTimezoneOffset() * 60000
    );
    return dateAdjusted.toISOString().slice(0, 16);
  };

  const convertLocalToDbDate = (localDate) => {
    if (!localDate) return null;
    return new Date(localDate).toISOString();
  };

  useEffect(() => {
    if (selectedAuction) {
      const originalStartDate = selectedAuction.startDate;
      const originalEndDate = selectedAuction.endDate;

      setOriginalAuction({
        startPrice: selectedAuction.startPrice,
        startDate: originalStartDate,
        endDate: originalEndDate,
      });
      setHasChanges(false);

      setStartPrice(selectedAuction.startPrice || "");

      setStartDate(convertDbDateToLocal(originalStartDate));
      setEndDate(convertDbDateToLocal(originalEndDate));
    }
  }, [selectedAuction]);

  useEffect(() => {
    if (originalAuction) {
      const priceChanged =
        Number(startPrice) !== Number(originalAuction.startPrice);

      const originalStartDateFormatted = convertDbDateToLocal(
        originalAuction.startDate
      );
      const originalEndDateFormatted = convertDbDateToLocal(
        originalAuction.endDate
      );

      const startDateChanged = startDate !== originalStartDateFormatted;
      const endDateChanged = endDate !== originalEndDateFormatted;

      setHasChanges(priceChanged || startDateChanged || endDateChanged);
    }
  }, [startPrice, startDate, endDate, originalAuction]);

  const isAuctionActive = () => {
    if (!selectedAuction) return false;

    const now = new Date();
    const currentStartDate = startDate ? new Date(startDate) : null;
    const currentEndDate = endDate ? new Date(endDate) : null;

    if (currentStartDate && currentEndDate) {
      return now >= currentStartDate && now <= currentEndDate;
    }

    return selectedAuction.status === "active";
  };

  const hasAuctionStarted = () => {
    if (!selectedAuction) return false;

    const now = new Date();
    const currentStartDate = startDate ? new Date(startDate) : null;

    if (currentStartDate) {
      return now >= currentStartDate;
    }

    return selectedAuction.status === "active";
  };

  const canEditAuction = () => {
    return !hasAuctionStarted() && !isAuctionActive();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {});
  };

  const cancelEditing = (fieldType) => {
    if (originalAuction) {
      switch (fieldType) {
        case "price":
          setStartPrice(originalAuction.startPrice);
          setIsEditingPrice(false);
          break;
        case "startDate":
          setStartDate(convertDbDateToLocal(originalAuction.startDate));
          setIsEditingStartDate(false);
          break;
        case "endDate":
          setEndDate(convertDbDateToLocal(originalAuction.endDate));
          setIsEditingEndDate(false);
          break;
        default:
          break;
      }
    }
  };

  const sendAuctionEditNotifications = async () => {
    try {
      if (!hasChanges) return;

      const participants = await getUsersWhoParticipatedInAuction(
        selectedAuction.id
      );

      if (participants.length === 0) {
        console.log("No participants found for auction:", selectedAuction.id);
        return;
      }

      const changes = [];
      if (Number(startPrice) !== Number(originalAuction.startPrice)) {
        changes.push(
          `السعر الابتدائي من ${Number(
            originalAuction.startPrice
          ).toLocaleString()} إلى ${Number(startPrice).toLocaleString()} جنيه`
        );
      }

      const originalStartDateFormatted = convertDbDateToLocal(
        originalAuction.startDate
      );
      const originalEndDateFormatted = convertDbDateToLocal(
        originalAuction.endDate
      );

      if (startDate !== originalStartDateFormatted) {
        changes.push(
          `تاريخ البدء من ${
            originalAuction.startDate
              ? new Date(originalAuction.startDate).toLocaleString("ar-EG")
              : "غير محدد"
          } إلى ${new Date(startDate).toLocaleString("ar-EG")}`
        );
      }
      if (endDate !== originalEndDateFormatted) {
        changes.push(
          `تاريخ الانتهاء من ${
            originalAuction.endDate
              ? new Date(originalAuction.endDate).toLocaleString("ar-EG")
              : "غير محدد"
          } إلى ${new Date(endDate).toLocaleString("ar-EG")}`
        );
      }

      const changesText = changes.join("، ");

      const notificationPromises = participants.map((participant) =>
        sendAuctionEditNotification(
          participant.nationalID,
          selectedAuction,
          changesText
        )
      );

      await Promise.all(notificationPromises);
      console.log(
        `Sent auction edit notifications to ${participants.length} insurance/terms participants`
      );

      Swal.fire({
        icon: "success",
        title: "تم إرسال الإشعارات!",
        text: `تم إرسال إشعارات التعديل إلى ${participants.length} مشترك في التأمين/الشروط`,
        confirmButtonText: "حسنًا",
        customClass: {
          confirmButton: "bg-green-500 text-white hover:bg-green-600",
        },
      });
    } catch (error) {
      console.error("Error sending auction edit notifications:", error);
    }
  };

  const handleCloseModal = async () => {
    if (hasChanges) {
      if (!canEditAuction()) {
        Swal.fire({
          icon: "error",
          title: "غير مسموح بالتعديل!",
          text: "لا يمكن حفظ التغييرات لأن المزاد قد بدأ بالفعل!",
          confirmButtonText: "حسنًا",
          customClass: {
            confirmButton: "bg-red-500 text-white hover:bg-red-600",
          },
        });
        return;
      }

      try {
        const updates = {};

        if (Number(startPrice) !== Number(originalAuction.startPrice)) {
          updates.startPrice = Number(startPrice);
        }

        const originalStartDateFormatted = convertDbDateToLocal(
          originalAuction.startDate
        );
        const originalEndDateFormatted = convertDbDateToLocal(
          originalAuction.endDate
        );

        if (startDate !== originalStartDateFormatted) {
          updates.startDate = convertLocalToDbDate(startDate);
        }
        if (endDate !== originalEndDateFormatted) {
          updates.endDate = convertLocalToDbDate(endDate);
        }

        if (Object.keys(updates).length > 0) {
          const auctionRef = ref(db, `auctions/${selectedAuction.id}`);
          await update(auctionRef, updates);

          const updatedSelectedAuction = { ...selectedAuction, ...updates };
          const updatedAuctions = auctions.map((auction) =>
            auction.id === selectedAuction.id ? updatedSelectedAuction : auction
          );
          setAuctions(updatedAuctions);

          if (onAuctionUpdate) {
            onAuctionUpdate(updatedSelectedAuction);
          }
        }

        const participants = await getUsersWhoParticipatedInAuction(
          selectedAuction.id
        );

        if (participants.length > 0) {
          const result = await Swal.fire({
            icon: "question",
            title: "إرسال إشعارات التعديل",
            text: `تم تعديل المزاد. هل تريد إرسال إشعارات إلى ${participants.length} مشترك في التأمين/الشروط؟`,
            showCancelButton: true,
            confirmButtonText: "نعم، أرسل الإشعارات",
            cancelButtonText: "إغلاق بدون إشعارات",
            customClass: {
              confirmButton: "bg-blue-500 text-white hover:bg-blue-600",
              cancelButton: "bg-gray-500 text-white hover:bg-gray-600",
            },
          });

          if (result.isConfirmed) {
            await sendAuctionEditNotifications();
          }
        } else {
          await Swal.fire({
            icon: "info",
            title: "لا يوجد مشتركون",
            text: "تم تعديل المزاد ولكن لا يوجد مشتركون في التأمين/الشروط لإرسال إشعارات إليهم.",
            confirmButtonText: "حسنًا",
            customClass: {
              confirmButton: "bg-blue-500 text-white hover:bg-blue-600",
            },
          });
        }
      } catch (error) {
        console.error("Error saving auction changes:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ في الحفظ!",
          text: "حدث خطأ أثناء حفظ التغييرات. يرجى المحاولة مرة أخرى.",
          confirmButtonText: "حسنًا",
          customClass: {
            confirmButton: "bg-red-500 text-white hover:bg-red-600",
          },
        });
        return;
      }
    }

    setHasChanges(false);
    setOriginalAuction(null);
    setShowModal(false);
  };

  const handlePriceUpdate = async (e) => {
    e.preventDefault();

    if (!canEditAuction()) {
      Swal.fire({
        icon: "error",
        title: "غير مسموح بالتعديل!",
        text: "لا يمكن تعديل المزاد بعد بدايته!",
        confirmButtonText: "حسنًا",
        customClass: {
          confirmButton: "bg-red-500 text-white hover:bg-red-600",
        },
      });
      return;
    }

    const newPrice = Number(startPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "يرجى إدخال سعر صحيح وأكبر من صفر!",
        confirmButtonText: "حسنًا",
        customClass: {
          confirmButton: "bg-red-500 text-white hover:bg-red-600",
        },
      });
      return;
    }

    setStartPrice(newPrice);
    setIsEditingPrice(false);

    Swal.fire({
      icon: "success",
      title: "تم التعديل!",
      text: "تم تعديل السعر. سيتم حفظ التغييرات عند إغلاق النافذة.",
      confirmButtonText: "حسنًا",
      customClass: {
        confirmButton: "bg-green-500 text-white hover:bg-green-600",
      },
    });
  };

  const handleStartDateUpdate = async (e) => {
    e.preventDefault();

    if (!canEditAuction()) {
      Swal.fire({
        icon: "error",
        title: "غير مسموح بالتعديل!",
        text: "لا يمكن تعديل المزاد بعد بدايته!",
        confirmButtonText: "حسنًا",
        customClass: {
          confirmButton: "bg-red-500 text-white hover:bg-red-600",
        },
      });
      return;
    }

    const newStartDate = new Date(startDate).toISOString();
    const currentDate = new Date().toISOString();
    if (new Date(newStartDate) < new Date(currentDate)) {
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "تاريخ البدء يجب أن يكون بعد الوقت الحالي!",
        confirmButtonText: "حسنًا",
        customClass: {
          confirmButton: "bg-red-500 text-white hover:bg-red-600",
        },
      });
      return;
    }
    if (endDate && new Date(newStartDate) >= new Date(endDate)) {
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء!",
        confirmButtonText: "حسنًا",
        customClass: {
          confirmButton: "bg-red-500 text-white hover:bg-red-600",
        },
      });
      return;
    }

    setStartDate(startDate);
    setIsEditingStartDate(false);

    Swal.fire({
      icon: "success",
      title: "تم التعديل!",
      text: "تم تعديل تاريخ البدء. سيتم حفظ التغييرات عند إغلاق النافذة.",
      confirmButtonText: "حسنًا",
      customClass: {
        confirmButton: "bg-green-500 text-white hover:bg-green-600",
      },
    });
  };

  const handleEndDateUpdate = async (e) => {
    e.preventDefault();

    if (!canEditAuction()) {
      Swal.fire({
        icon: "error",
        title: "غير مسموح بالتعديل!",
        text: "لا يمكن تعديل المزاد بعد بدايته!",
        confirmButtonText: "حسنًا",
        customClass: {
          confirmButton: "bg-red-500 text-white hover:bg-red-600",
        },
      });
      return;
    }

    const newEndDate = new Date(endDate).toISOString();
    if (new Date(newEndDate) <= new Date(startDate)) {
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء!",
        confirmButtonText: "حسنًا",
        customClass: {
          confirmButton: "bg-red-500 text-white hover:bg-red-600",
        },
      });
      return;
    }

    setEndDate(endDate);
    setIsEditingEndDate(false);

    Swal.fire({
      icon: "success",
      title: "تم التعديل!",
      text: "تم تعديل تاريخ الانتهاء. سيتم حفظ التغييرات عند إغلاق النافذة.",
      confirmButtonText: "حسنًا",
      customClass: {
        confirmButton: "bg-green-500 text-white hover:bg-green-600",
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">تفاصيل المزاد</h3>
              {isAuctionActive() && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  مزاد نشط
                </span>
              )}
              {hasAuctionStarted() && !isAuctionActive() && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  بدأ المزاد
                </span>
              )}
              {hasChanges && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  تم التعديل
                </span>
              )}
            </div>
            <button
              onClick={handleCloseModal}
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
                  {isEditingPrice ? (
                    <form
                      onSubmit={handlePriceUpdate}
                      className="mt-1 flex items-center"
                    >
                      <input
                        type="number"
                        value={startPrice}
                        onChange={(e) => setStartPrice(e.target.value)}
                        className={`w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          canEditAuction()
                            ? "border-gray-300"
                            : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                        }`}
                        min="0"
                        step="0.01"
                        placeholder="أدخل السعر"
                        disabled={!canEditAuction()}
                      />
                      <button
                        type="submit"
                        className={`ml-2 p-2 ${
                          canEditAuction()
                            ? "text-green-500 hover:text-green-700"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        title="حفظ"
                        disabled={!canEditAuction()}
                      >
                        <FaCheck />
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelEditing("price")}
                        className="ml-1 p-2 text-red-500 hover:text-red-700"
                        title="إلغاء"
                      >
                        <FaTimes />
                      </button>
                    </form>
                  ) : (
                    <div className="mt-1 flex items-center">
                      <p className="text-gray-900">
                        {Number(startPrice).toLocaleString()} جنيه
                      </p>
                      {canEditAuction() ? (
                        <button
                          onClick={() => setIsEditingPrice(true)}
                          className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                          title="تعديل السعر"
                        >
                          <FaPencilAlt />
                        </button>
                      ) : (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          لا يمكن التعديل
                        </span>
                      )}
                    </div>
                  )}
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
                          "ar-EG",
                          {
                            timeZone: "Africa/Cairo",
                          }
                        )
                      : "غير محدد"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    تاريخ البدء المخطط:
                  </span>
                  {isEditingStartDate ? (
                    <form
                      onSubmit={handleStartDateUpdate}
                      className="mt-1 flex items-center"
                    >
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          canEditAuction()
                            ? "border-gray-300"
                            : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!canEditAuction()}
                      />
                      <button
                        type="submit"
                        className={`ml-2 p-2 ${
                          canEditAuction()
                            ? "text-green-500 hover:text-green-700"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        title="حفظ"
                        disabled={!canEditAuction()}
                      >
                        <FaCheck />
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelEditing("startDate")}
                        className="ml-1 p-2 text-red-500 hover:text-red-700"
                        title="إلغاء"
                      >
                        <FaTimes />
                      </button>
                    </form>
                  ) : (
                    <div className="mt-1 flex items-center">
                      <p className="text-gray-900">
                        {startDate
                          ? new Date(startDate).toLocaleString("ar-EG", {
                              timeZone: "Africa/Cairo",
                            })
                          : "غير محدد"}
                      </p>
                      {canEditAuction() ? (
                        <button
                          onClick={() => setIsEditingStartDate(true)}
                          className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                          title="تعديل تاريخ البدء"
                        >
                          <FaPencilAlt />
                        </button>
                      ) : (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          لا يمكن التعديل
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    تاريخ الانتهاء:
                  </span>
                  {isEditingEndDate ? (
                    <form
                      onSubmit={handleEndDateUpdate}
                      className="mt-1 flex items-center"
                    >
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          canEditAuction()
                            ? "border-gray-300"
                            : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!canEditAuction()}
                      />
                      <button
                        type="submit"
                        className={`ml-2 p-2 ${
                          canEditAuction()
                            ? "text-green-500 hover:text-green-700"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        title="حفظ"
                        disabled={!canEditAuction()}
                      >
                        <FaCheck />
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelEditing("endDate")}
                        className="ml-1 p-2 text-red-500 hover:text-red-700"
                        title="إلغاء"
                      >
                        <FaTimes />
                      </button>
                    </form>
                  ) : (
                    <div className="mt-1 flex items-center">
                      <p className="text-gray-900">
                        {endDate
                          ? new Date(endDate).toLocaleString("ar-EG", {
                              timeZone: "Africa/Cairo",
                            })
                          : "غير محدد"}
                      </p>
                      {canEditAuction() ? (
                        <button
                          onClick={() => setIsEditingEndDate(true)}
                          className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                          title="تعديل تاريخ الانتهاء"
                        >
                          <FaPencilAlt />
                        </button>
                      ) : (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          لا يمكن التعديل
                        </span>
                      )}
                    </div>
                  )}
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
              onClick={handleCloseModal}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                hasChanges
                  ? "border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {hasChanges ? "حفظ التغييرات وإغلاق" : "إغلاق"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionModal;
