import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

const UserFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  userTypeFilter,
  setUserTypeFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  totalUsers,
  filteredCount,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            إدارة المستخدمين
          </h2>
          <p className="text-gray-600">
            إجمالي المستخدمين: {totalUsers} | المعروضين: {filteredCount}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في المستخدمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">جميع الحالات</option>
          <option value="active">مفعل</option>
          <option value="inactive">غير مفعل</option>
          <option value="pending">معلق</option>
        </select>

        {/* User Type Filter */}
        <select
          value={userTypeFilter}
          onChange={(e) => setUserTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="all">جميع الأنواع</option>
          <option value="individual">فرد</option>
          <option value="company">شركة</option>
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-");
            setSortBy(field);
            setSortOrder(order);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="createdAt-desc">الأحدث أولاً</option>
          <option value="createdAt-asc">الأقدم أولاً</option>
          <option value="fullName-asc">الاسم (أ-ي)</option>
          <option value="fullName-desc">الاسم (ي-أ)</option>
          <option value="email-asc">البريد الإلكتروني (أ-ي)</option>
          <option value="email-desc">البريد الإلكتروني (ي-أ)</option>
        </select>
      </div>
    </div>
  );
};

export default UserFilters;
