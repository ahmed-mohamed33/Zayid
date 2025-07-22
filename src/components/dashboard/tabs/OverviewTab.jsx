import React, { memo } from "react";

const OverviewTab = memo(
  ({
    localUser,
    userAuctions,
    userPayments,
    isEditing,
    editForm,
    setEditForm,
    actionLoading,
    handleSaveEdit,
    setIsEditing,
    formatCurrency,
  }) => {
    if (isEditing) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            تعديل البيانات الأساسية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) =>
                  setEditForm({ ...editForm, fullName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveEdit}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              حفظ التغييرات
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            المعلومات الشخصية
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">الاسم الكامل:</span>
              <span className="font-medium">
                {localUser.fullName || "غير محدد"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">البريد الإلكتروني:</span>
              <span className="font-medium">
                {localUser.email || "غير محدد"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">رقم الهاتف:</span>
              <span className="font-medium">
                {localUser.phone || "غير محدد"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الرقم القومي:</span>
              <span className="font-medium">
                {localUser.nationalID || "غير محدد"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">نوع المستخدم:</span>
              <span className="font-medium">
                {localUser.isCompany ? "شركة" : "فرد"}
              </span>
            </div>
            {localUser.companyName && (
              <div className="flex justify-between">
                <span className="text-gray-600">اسم الشركة:</span>
                <span className="font-medium">{localUser.companyName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            إحصائيات سريعة
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userAuctions.length}
              </div>
              <div className="text-sm text-blue-700">المزادات</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {userPayments.length}
              </div>
              <div className="text-sm text-green-700">المدفوعات</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userAuctions.filter((a) => a.status === "active").length}
              </div>
              <div className="text-sm text-purple-700">مزادات نشطة</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(
                  userPayments.reduce(
                    (sum, p) => sum + (Number(p.amount) || 0),
                    0
                  )
                )}
              </div>
              <div className="text-sm text-orange-700">إجمالي المدفوعات</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OverviewTab.displayName = "OverviewTab";

export default OverviewTab;
