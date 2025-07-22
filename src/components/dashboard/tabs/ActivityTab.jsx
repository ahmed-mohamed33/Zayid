import React, { memo } from "react";
import {
  FaUser,
  FaUserCheck,
  FaUserTimes,
  FaGavel,
  FaDollarSign,
} from "react-icons/fa";

const ActivityTab = memo(
  ({
    localUser,
    userAuctions,
    userPayments,
    getPaymentTypeName,
    formatCurrency,
  }) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">سجل النشاط</h3>

        <div className="space-y-3">
          {/* Account Creation */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FaUser className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-blue-800">تم إنشاء الحساب</p>
              <p className="text-sm text-blue-600">
                {localUser.createdAt
                  ? new Date(localUser.createdAt).toLocaleString("ar-EG")
                  : "غير محدد"}
              </p>
            </div>
          </div>

          {/* Activation */}
          {localUser.activatedAt && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <FaUserCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-800">تم تفعيل الحساب</p>
                <p className="text-sm text-green-600">
                  {new Date(localUser.activatedAt).toLocaleString("ar-EG")}
                </p>
              </div>
            </div>
          )}

          {/* Blocking */}
          {localUser.blockedAt && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <FaUserTimes className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-red-800">تم حظر الحساب</p>
                <p className="text-sm text-red-600">
                  {new Date(localUser.blockedAt).toLocaleString("ar-EG")}
                </p>
              </div>
            </div>
          )}

          {/* Recent Auctions */}
          {userAuctions.slice(0, 3).map((auction) => (
            <div
              key={auction.id}
              className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <FaGavel className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-orange-800">
                  أنشأ مزاد: {auction.title}
                </p>
                <p className="text-sm text-orange-600">
                  {auction.createdAt
                    ? new Date(auction.createdAt).toLocaleString("ar-EG")
                    : "غير محدد"}
                </p>
              </div>
            </div>
          ))}

          {/* Recent Payments */}
          {userPayments.slice(0, 3).map((payment) => (
            <div
              key={payment.id}
              className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <FaDollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-purple-800">
                  دفع {getPaymentTypeName(payment.type)} -{" "}
                  {formatCurrency(payment.amount)}
                </p>
                <p className="text-sm text-purple-600">
                  {payment.timestamp || payment.createdAt
                    ? new Date(
                        payment.timestamp || payment.createdAt
                      ).toLocaleString("ar-EG")
                    : "غير محدد"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ActivityTab.displayName = "ActivityTab";

export default ActivityTab;
