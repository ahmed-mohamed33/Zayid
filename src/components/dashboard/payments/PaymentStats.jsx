import React from "react";
import { Pie } from "react-chartjs-2";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaUndo,
} from "react-icons/fa";

const PaymentStats = ({ stats, totalStats, pieOptions }) => {
  // Ensure we have valid data
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <p className="text-center text-gray-500">لا توجد إحصائيات متاحة</p>
      </div>
    );
  }

  // Create stats array from the stats object
  const statsArray = [
    {
      title: "إجمالي المدفوعات",
      value: (stats.total || 0).toLocaleString(),
      icon: FaMoneyBillWave,
      color: "bg-blue-500",
    },
    {
      title: "المدفوعات المؤكدة",
      value: (stats.paid || 0).toLocaleString(),
      icon: FaCheckCircle,
      color: "bg-green-500",
    },
    {
      title: "المدفوعات المعلقة",
      value: (stats.pending || 0).toLocaleString(),
      icon: FaClock,
      color: "bg-yellow-500",
    },
    {
      title: "المدفوعات الفاشلة",
      value: (stats.failed || 0).toLocaleString(),
      icon: FaTimes,
      color: "bg-red-500",
    },
    {
      title: "المدفوعات المستردة",
      value: (stats.refunded || 0).toLocaleString(),
      icon: FaUndo,
      color: "bg-purple-500",
    },
    {
      title: "إجمالي المبلغ",
      value: (stats.totalAmount || 0).toLocaleString() + " جنيه",
      icon: FaMoneyBillWave,
      color: "bg-teal-500",
    },
  ];

  return (
    <>
      {/* Payment Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsArray.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PaymentStats;
