import React from "react";
import { FaMoneyBillWave } from "react-icons/fa";

const UserInfoCard = ({ userData, isPaymentsView = false, paymentStats }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-row items-center justify-between">
      <div className="flex items-center gap-6">
        <div
          className={`w-24 h-24 rounded-full border-4 border-[#F3F4F6] flex items-center justify-center text-2xl font-bold ${
            isPaymentsView ? (
              "bg-purple-500 text-white text-3xl"
            ) : (
              <img
                src={userData?.profileImage}
                alt="User Profile"
                className="w-full h-full object-cover rounded-full"
              />
            )
          }`}
        >
          {isPaymentsView ? (
            <FaMoneyBillWave />
          ) : (
            userData?.fullName
              ?.trim()
              ?.split(" ")
              ?.map((word) => word[0])
              ?.slice(0, 2)
              ?.join("")
              ?.toUpperCase() || "؟"
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {isPaymentsView
              ? "إحصائيات المدفوعات"
              : userData?.fullName || "أدمن"}
          </h1>
          <h5 className="text-gray-500 text-base">
            {isPaymentsView
              ? `إجمالي المدفوعات: ${paymentStats?.totalPayments?.toLocaleString()} جنيه`
              : userData?.email}
          </h5>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;
