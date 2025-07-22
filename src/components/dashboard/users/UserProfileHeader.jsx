import React, { memo } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaCalendar,
  FaBuilding,
  FaUserCheck,
  FaUserTimes,
  FaTrash,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";

const UserProfileHeader = memo(
  ({
    localUser,
    statusInfo,
    isEditing,
    setIsEditing,
    actionLoading,
    handleApprove,
    handleBlock,
    handleRemove,
    onBack,
  }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft />
            <span>العودة للقائمة</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaEdit />
              <span>{isEditing ? "إلغاء التعديل" : "تعديل البيانات"}</span>
            </button>
          </div>
        </div>

        {/* User Header Info */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative">
            <img
              src={
                localUser.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  localUser.fullName || "User"
                )}&background=FA6300&color=fff&size=128`
              }
              alt="صورة المستخدم"
              className="w-24 h-24 rounded-full border-4 border-orange-200 object-cover shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2">
              <statusInfo.icon
                className={`w-6 h-6 p-1 rounded-full ${statusInfo.color
                  .replace("text-", "text-white ")
                  .replace("bg-", "bg-")}`}
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {localUser.fullName || "غير محدد"}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
              >
                {statusInfo.text}
              </span>
              {localUser.isCompany && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                  <FaBuilding className="w-3 h-3" />
                  شركة
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaEnvelope className="w-4 h-4" />
                <span>{localUser.email || "غير محدد"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="w-4 h-4" />
                <span>{localUser.phone || "غير محدد"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaIdCard className="w-4 h-4" />
                <span>{localUser.nationalID || "غير محدد"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendar className="w-4 h-4" />
                <span>
                  {localUser.createdAt
                    ? new Date(localUser.createdAt).toLocaleDateString("ar-EG")
                    : "غير محدد"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={localUser.isActive ? handleBlock : handleApprove}
              disabled={actionLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                localUser.isActive
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {localUser.isActive ? <FaUserTimes /> : <FaUserCheck />}
              <span>
                {localUser.isActive ? "حظر المستخدم" : "تفعيل المستخدم"}
              </span>
            </button>

            <button
              onClick={handleRemove}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <FaTrash />
              <span>حذف المستخدم</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

UserProfileHeader.displayName = "UserProfileHeader";

export default UserProfileHeader;
