import React from "react";
import {
  FaEye,
  FaUserCheck,
  FaUserTimes,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUser,
  FaBuilding,
} from "react-icons/fa";

const UserTable = ({
  paginatedUsers,
  getSortIcon,
  setSortBy,
  setSortOrder,
  sortBy,
  sortOrder,
  handleViewUser,
  handleActivateUser,
  handleDeactivateUser,
  handleDeleteUser,
}) => {
  const getStatusBadge = (user) => {
    let status, color;

    if (user.isActive === true) {
      status = "مفعل";
      color = "bg-green-100 text-green-800";
    } else if (user.isActive === false) {
      status = "غير مفعل";
      color = "bg-red-100 text-red-800";
    } else {
      status = "معلق";
      color = "bg-yellow-100 text-yellow-800";
    }

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}
      >
        {status}
      </span>
    );
  };

  const getUserTypeIcon = (isCompany) => {
    return isCompany ? (
      <FaBuilding className="w-4 h-4 text-blue-500" title="شركة" />
    ) : (
      <FaUser className="w-4 h-4 text-green-500" title="فرد" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => {
                    setSortBy("fullName");
                    setSortOrder(
                      sortBy === "fullName" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  الاسم الكامل {getSortIcon("fullName")}
                </button>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => {
                    setSortBy("email");
                    setSortOrder(
                      sortBy === "email" && sortOrder === "asc" ? "desc" : "asc"
                    );
                  }}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  البريد الإلكتروني {getSortIcon("email")}
                </button>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم الهاتف
              </th>
              {/* i think its not important to be displayed in the table */}
              {/* <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الرقم القومي
              </th> */}
              {/* متكررة مرتين  */}
              {/* <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع المستخدم
              </th> */}
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => {
                    setSortBy("createdAt");
                    setSortOrder(
                      sortBy === "createdAt" && sortOrder === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  تاريخ التسجيل {getSortIcon("createdAt")}
                </button>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {user.profileImage ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.profileImage}
                          alt={user.fullName}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="mr-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName || "غير محدد"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.isCompany ? "شركة" : "فرد"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email || "غير محدد"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || "غير محدد"}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.nationalID || "غير محدد"}
                </td> */}
                
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getUserTypeIcon(user.isCompany)}
                    <span className="text-sm text-gray-700">
                      {user.isCompany ? "شركة" : "فرد"}
                    </span>
                  </div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("ar-EG")
                    : "غير محدد"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {/* View Details */}
                    <button
                      onClick={() => handleViewUser(user)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="عرض التفاصيل"
                    >
                      <FaEye />
                    </button>

                    {/* Activate/Deactivate */}
                    {user.isActive ? (
                      <button
                        onClick={() => handleDeactivateUser(user.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
                        title="إلغاء التفعيل"
                      >
                        <FaUserTimes />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateUser(user.id)}
                        className="text-green-600 hover:text-green-800 p-1 rounded"
                        title="تفعيل المستخدم"
                      >
                        <FaUserCheck />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="حذف المستخدم"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
