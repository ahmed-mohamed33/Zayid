import React from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaBuilding,
  FaUser,
} from "react-icons/fa";

const UserStatsCards = ({ users }) => {
  const stats = React.useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.isActive === true).length;
    const inactiveUsers = users.filter(
      (user) => user.isActive === false
    ).length;
    const pendingUsers = users.filter(
      (user) => user.isActive === null || user.isActive === undefined
    ).length;
    const companies = users.filter((user) => user.isCompany).length;
    const individuals = users.filter((user) => !user.isCompany).length;

    return [
      {
        title: "إجمالي المستخدمين",
        value: totalUsers,
        icon: FaUsers,
        color: "bg-blue-500",
        textColor: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "المستخدمين المفعلين",
        value: activeUsers,
        icon: FaUserCheck,
        color: "bg-green-500",
        textColor: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "المستخدمين غير المفعلين",
        value: inactiveUsers,
        icon: FaUserTimes,
        color: "bg-red-500",
        textColor: "text-red-600",
        bgColor: "bg-red-50",
      },
      {
        title: "المستخدمين المعلقين",
        value: pendingUsers,
        icon: FaUsers,
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
        bgColor: "bg-yellow-50",
      },
      {
        title: "الشركات",
        value: companies,
        icon: FaBuilding,
        color: "bg-purple-500",
        textColor: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "الأفراد",
        value: individuals,
        icon: FaUser,
        color: "bg-indigo-500",
        textColor: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
    ];
  }, [users]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg shadow-sm p-3 gap-2 border border-gray-200`}
        >
          <div className="flex flex-col ">
            <div className="flex gap-2">
              <div
                className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="text-white text-xl" />
              </div>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>

            <p className="text-sm font-medium text-gray-600 mb-1">
              {stat.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStatsCards;
