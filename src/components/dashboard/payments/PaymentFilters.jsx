import React, { memo, useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaCalendar,
  FaDollarSign,
} from "react-icons/fa";

const PaymentFilters = memo(({ filters, onFilterChange, onReset }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleDateRangeChange = (field, value) => {
    onFilterChange({
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value },
    });
  };

  const handleAmountRangeChange = (field, value) => {
    onFilterChange({
      ...filters,
      amountRange: { ...filters.amountRange, [field]: value },
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.status !== "all" ||
      filters.method !== "all" ||
      filters.type !== "all" ||
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.amountRange.min ||
      filters.amountRange.max
    );
  };

  const statusOptions = [
    { value: "all", label: "جميع الحالات" },
    { value: "paid", label: "مدفوع" },
    { value: "pending", label: "معلق" },
    { value: "failed", label: "فشل" },
    { value: "refunded", label: "مسترد" },
    { value: "cancelled", label: "ملغي" },
  ];

  const methodOptions = [
    { value: "all", label: "جميع الطرق" },
    { value: "vodafone", label: "فودافون كاش" },
    { value: "card", label: "بطاقة ائتمان" },
    { value: "visa", label: "فيزا" },
    { value: "mastercard", label: "ماستركارد" },
    { value: "bank", label: "تحويل بنكي" },
    { value: "cash", label: "نقدي" },
  ];

  const typeOptions = [
    { value: "all", label: "جميع الأنواع" },
    { value: "insurance", label: "تأمين" },
    { value: "shroot", label: "كراسة شروط" },
    { value: "auction", label: "مزاد" },
    { value: "subscription", label: "اشتراك" },
    { value: "fee", label: "رسوم" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Basic Filters Row */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث برقم المدفوعة، المستخدم، المزاد..."
              value={filters.search}
              onChange={(e) => handleInputChange("search", e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={filters.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Method Filter */}
          <div className="min-w-[150px]">
            <select
              value={filters.method}
              onChange={(e) => handleInputChange("method", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {methodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              isExpanded || hasActiveFilters()
                ? "border-orange-500 text-orange-600 bg-orange-50"
                : "border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            <FaFilter className="w-4 h-4" />
            <span>فلاتر متقدمة</span>
            {hasActiveFilters() && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {
                  [
                    filters.type !== "all",
                    filters.dateRange.start || filters.dateRange.end,
                    filters.amountRange.min || filters.amountRange.max,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>

          {/* Reset Button */}
          {hasActiveFilters() && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
            >
              <FaTimes className="w-4 h-4" />
              <span>مسح الفلاتر</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المدفوعة
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendar className="inline w-4 h-4 ml-1" />
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendar className="inline w-4 h-4 ml-1" />
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaDollarSign className="inline w-4 h-4 ml-1" />
                الحد الأدنى للمبلغ
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.amountRange.min}
                onChange={(e) => handleAmountRangeChange("min", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaDollarSign className="inline w-4 h-4 ml-1" />
                الحد الأقصى للمبلغ
              </label>
              <input
                type="number"
                placeholder="∞"
                value={filters.amountRange.max}
                onChange={(e) => handleAmountRangeChange("max", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            {/* Quick Date Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فلاتر سريعة
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const todayStr = today.toISOString().split("T")[0];
                    handleDateRangeChange("start", todayStr);
                    handleDateRangeChange("end", todayStr);
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  اليوم
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(
                      today.getTime() - 7 * 24 * 60 * 60 * 1000
                    );
                    handleDateRangeChange(
                      "start",
                      weekAgo.toISOString().split("T")[0]
                    );
                    handleDateRangeChange(
                      "end",
                      today.toISOString().split("T")[0]
                    );
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  آخر 7 أيام
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(
                      today.getFullYear(),
                      today.getMonth() - 1,
                      today.getDate()
                    );
                    handleDateRangeChange(
                      "start",
                      monthAgo.toISOString().split("T")[0]
                    );
                    handleDateRangeChange(
                      "end",
                      today.toISOString().split("T")[0]
                    );
                  }}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                >
                  آخر شهر
                </button>
                <button
                  onClick={() => {
                    handleDateRangeChange("start", "");
                    handleDateRangeChange("end", "");
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  مسح التاريخ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PaymentFilters.displayName = "PaymentFilters";

export default PaymentFilters;
