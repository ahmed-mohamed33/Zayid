import React from "react";

const DashboardStats = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statistics.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div
              className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
            >
              <stat.icon size={24} className="text-white " />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
