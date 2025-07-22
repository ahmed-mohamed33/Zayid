import React, { useState, useMemo } from "react";
import {
  FaUser,
  FaGavel,
  FaDollarSign,
  FaHistory,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";
import { useUserProfile } from "../../../hooks/useUserProfile.jsx";
import UserProfileHeader from "./UserProfileHeader";
import UserProfileTabs from "./UserProfileTabs";
import { OverviewTab, DocumentsTab, ActivityTab } from "../tabs";
import { AuctionsTab } from "../auctions";
import { PaymentsTab } from "../payments";
import { Pop as Popup } from "../shared";

const UserProfile = ({ user, onBack }) => {
  const [popup, setPopup] = useState({
    open: false,
    type: "",
    message: "",
    onConfirm: null,
  });
  const [activeTab, setActiveTab] = useState("overview");

  const {
    actionLoading,
    localUser,
    userAuctions,
    userPayments,
    showFullImage,
    setShowFullImage,
    isEditing,
    setIsEditing,
    editForm,
    setEditForm,
    statusInfo,
    handleApprove,
    handleBlock,
    handleRemove,
    handleSaveEdit,
    formatCurrency,
    getAuctionStatusBadge,
    getPaymentTypeName,
    getPaymentMethodName,
  } = useUserProfile(user);

  // Popup handlers
  const showPopup = (type, message, onConfirm = null) => {
    setPopup({ open: true, type, message, onConfirm });
  };

  const closePopup = () =>
    setPopup({ open: false, type: "", message: "", onConfirm: null });

  const handleApproveWithPopup = async () => {
    const result = await handleApprove();
    showPopup(result.success ? "info" : "error", result.message);
  };

  const handleBlockWithPopup = async () => {
    const result = await handleBlock();
    showPopup(result.success ? "info" : "error", result.message);
  };

  const handleRemoveWithPopup = () => {
    showPopup(
      "confirm",
      "هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته نهائياً.",
      async () => {
        const result = await handleRemove();
        showPopup(result.success ? "info" : "error", result.message, () => {
          if (result.success) onBack();
        });
      }
    );
  };

  const handleSaveEditWithPopup = async () => {
    const result = await handleSaveEdit();
    showPopup(result.success ? "info" : "error", result.message);
  };

  // Memoized tabs configuration
  const tabs = useMemo(
    () => [
      { id: "overview", name: "نظرة عامة", icon: FaUser },
      {
        id: "auctions",
        name: "المزادات",
        icon: FaGavel,
        count: userAuctions.length,
      },
      {
        id: "payments",
        name: "المدفوعات",
        icon: FaDollarSign,
        count: userPayments.length,
      },
      { id: "documents", name: "الوثائق", icon: FaFileAlt },
      { id: "activity", name: "النشاط", icon: FaHistory },
    ],
    [userAuctions.length, userPayments.length]
  );

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            localUser={localUser}
            userAuctions={userAuctions}
            userPayments={userPayments}
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            actionLoading={actionLoading}
            handleSaveEdit={handleSaveEditWithPopup}
            setIsEditing={setIsEditing}
            formatCurrency={formatCurrency}
          />
        );
      case "auctions":
        return (
          <AuctionsTab
            userAuctions={userAuctions}
            formatCurrency={formatCurrency}
            getAuctionStatusBadge={getAuctionStatusBadge}
          />
        );
      case "payments":
        return (
          <PaymentsTab
            userPayments={userPayments}
            formatCurrency={formatCurrency}
            getPaymentTypeName={getPaymentTypeName}
            getPaymentMethodName={getPaymentMethodName}
          />
        );
      case "documents":
        return (
          <DocumentsTab
            localUser={localUser}
            setShowFullImage={setShowFullImage}
          />
        );
      case "activity":
        return (
          <ActivityTab
            localUser={localUser}
            userAuctions={userAuctions}
            userPayments={userPayments}
            getPaymentTypeName={getPaymentTypeName}
            formatCurrency={formatCurrency}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Component */}
        <UserProfileHeader
          localUser={localUser}
          statusInfo={statusInfo}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          actionLoading={actionLoading}
          handleApprove={handleApproveWithPopup}
          handleBlock={handleBlockWithPopup}
          handleRemove={handleRemoveWithPopup}
          onBack={onBack}
        />

        {/* Tabs Component */}
        <UserProfileTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowFullImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={showFullImage}
              alt="صورة مكبرة"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onError={() => setShowFullImage(null)}
            />
            <button
              onClick={() => setShowFullImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200"
              title="إغلاق"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Popup */}
      <Popup
        isOpen={popup.open}
        onClose={closePopup}
        title={
          popup.type === "confirm"
            ? "تأكيد"
            : popup.type === "error"
            ? "خطأ"
            : "تنبيه"
        }
        onConfirm={popup.type === "confirm" ? popup.onConfirm : undefined}
        confirmText={popup.type === "confirm" ? "نعم، تأكيد" : undefined}
        cancelText={popup.type === "confirm" ? "إلغاء" : undefined}
      >
        {popup.message}
      </Popup>
    </div>
  );
};

export default UserProfile;
