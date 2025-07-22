import React, { memo } from "react";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaCheck,
  FaTimes,
  FaUndo,
  FaChevronDown,
  FaTrash,
} from "react-icons/fa";

const PaymentTable = memo(
  ({
    payments,
    selectedPayments,
    sortConfig,
    onSort,
    onPaymentSelect,
    onSelectAll,
    onPaymentClick,
    onBulkAction,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    totalItems,
  }) => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("ar-EG", {
        style: "currency",
        currency: "EGP",
        minimumFractionDigits: 0,
      }).format(amount || 0);
    };

    const formatDate = (date) => {
      if (!date) return "غير محدد";
      return new Date(date).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getStatusBadge = (status) => {
      const statusConfig = {
        paid: {
          color: "bg-green-100 text-green-800",
          text: "مدفوع",
          icon: FaCheck,
        },
        pending: {
          color: "bg-yellow-100 text-yellow-800",
          text: "معلق",
          icon: null,
        },
        failed: {
          color: "bg-red-100 text-red-800",
          text: "فشل",
          icon: FaTimes,
        },
        refunded: {
          color: "bg-blue-100 text-blue-800",
          text: "مسترد",
          icon: FaUndo,
        },
        cancelled: {
          color: "bg-gray-100 text-gray-800",
          text: "ملغي",
          icon: FaTimes,
        },
      };

      const config = statusConfig[status] || {
        color: "bg-gray-100 text-gray-800",
        text: status,
      };
      const Icon = config.icon;

      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
        >
          {Icon && <Icon className="w-3 h-3" />}
          {config.text}
        </span>
      );
    };

    const getMethodBadge = (method) => {
      const methodConfig = {
        vodafone: { color: "bg-red-100 text-red-800", text: "فودافون كاش" },
        card: { color: "bg-blue-100 text-blue-800", text: "بطاقة" },
        visa: { color: "bg-blue-100 text-blue-800", text: "فيزا" },
        mastercard: {
          color: "bg-orange-100 text-orange-800",
          text: "ماستركارد",
        },
        bank: { color: "bg-green-100 text-green-800", text: "تحويل بنكي" },
        cash: { color: "bg-gray-100 text-gray-800", text: "نقدي" },
      };

      const config = methodConfig[method] || {
        color: "bg-gray-100 text-gray-800",
        text: method || "غير محدد",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
        >
          {config.text}
        </span>
      );
    };

    const getTypeBadge = (type) => {
      const typeConfig = {
        insurance: { color: "bg-purple-100 text-purple-800", text: "تأمين" },
        shroot: { color: "bg-indigo-100 text-indigo-800", text: "كراسة شروط" },
        auction: { color: "bg-orange-100 text-orange-800", text: "مزاد" },
        subscription: { color: "bg-green-100 text-green-800", text: "اشتراك" },
        fee: { color: "bg-yellow-100 text-yellow-800", text: "رسوم" },
      };

      const config = typeConfig[type] || {
        color: "bg-gray-100 text-gray-800",
        text: type || "غير محدد",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
        >
          {config.text}
        </span>
      );
    };

    const getSortIcon = (field) => {
      if (sortConfig.field !== field) {
        return <FaSort className="w-3 h-3 text-gray-400" />;
      }
      return sortConfig.direction === "asc" ? (
        <FaSortUp className="w-3 h-3 text-orange-500" />
      ) : (
        <FaSortDown className="w-3 h-3 text-orange-500" />
      );
    };

    const handleSelectAll = (e) => {
      onSelectAll(e.target.checked);
    };

    const handleRowSelect = (paymentId, e) => {
      e.stopPropagation();
      onPaymentSelect(paymentId, e.target.checked);
    };

    const isAllSelected =
      payments.length > 0 && selectedPayments.length === payments.length;
    const isIndeterminate =
      selectedPayments.length > 0 && selectedPayments.length < payments.length;

    const bulkActions = [
      { id: "verify", label: "تأكيد الدفع", color: "text-green-600" },
      { id: "pending", label: "تعيين كمعلق", color: "text-yellow-600" },
      { id: "failed", label: "تعيين كفشل", color: "text-red-600" },
      { id: "refund", label: "استرداد", color: "text-blue-600" },
    ];

    // Pagination
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Bulk Actions Bar */}
        {selectedPayments.length > 0 && (
          <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-orange-800">
                  تم اختيار {selectedPayments.length} مدفوعة
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-orange-700">الإجراءات:</span>
                  {bulkActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => onBulkAction(action.id, selectedPayments)}
                      className={`px-3 py-1 text-sm ${action.color} hover:bg-white rounded-lg transition-colors`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectAll(false)}
                className="text-sm text-orange-600 hover:text-orange-800"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                </th>

                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSort("id")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    رقم المدفوعة
                    {getSortIcon("id")}
                  </button>
                </th>

                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSort("type")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    النوع
                    {getSortIcon("type")}
                  </button>
                </th>

                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSort("amount")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    المبلغ
                    {getSortIcon("amount")}
                  </button>
                </th>

                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSort("method")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    طريقة الدفع
                    {getSortIcon("method")}
                  </button>
                </th>

                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSort("status")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    الحالة
                    {getSortIcon("status")}
                  </button>
                </th>

                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSort("timestamp")}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    التاريخ
                    {getSortIcon("timestamp")}
                  </button>
                </th>

                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  المستخدم
                </th>

                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  تفاصيل المزاد
                </th>

                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedPayments.includes(payment.id) ? "bg-orange-50" : ""
                  }`}
                  onClick={() => onPaymentClick(payment)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.id)}
                      onChange={(e) => handleRowSelect(payment.id, e)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.id?.substring(0, 8) || "غير محدد"}...
                    </div>
                    {payment.transactionId && (
                      <div className="text-xs text-gray-500">
                        معرف المعاملة: {payment.transactionId.substring(0, 8)}
                        ...
                      </div>
                    )}
                  </td>

                  <td className="px-2 py-3">{getTypeBadge(payment.type)}</td>

                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {getMethodBadge(payment.method)}
                  </td>

                  <td className="px-4 py-3">
                    {getStatusBadge(payment.status)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {formatDate(payment.timestamp || payment.createdAt)}
                    </div>
                    {payment.processedAt &&
                      payment.processedAt !== payment.timestamp && (
                        <div className="text-xs text-gray-500">
                          معالج: {formatDate(payment.processedAt)}
                        </div>
                      )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.userName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.userEmail}
                    </div>
                    {payment.userType && (
                      <div className="text-xs">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.userType === "شركة"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {payment.userType}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {payment.auctionTitle &&
                    payment.auctionTitle !== "غير محدد" ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.auctionTitle}
                        </div>
                        {payment.auctionCategory && (
                          <div className="text-xs text-gray-500">
                            الفئة: {payment.auctionCategory}
                          </div>
                        )}
                        {payment.auctionStartPrice && (
                          <div className="text-xs text-gray-500">
                            السعر: {formatCurrency(payment.auctionStartPrice)}
                          </div>
                        )}
                        {payment.auctionStatus && (
                          <div className="text-xs">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                payment.auctionStatus === "active"
                                  ? "bg-green-100 text-green-800"
                                  : payment.auctionStatus === "ended"
                                  ? "bg-gray-100 text-gray-800"
                                  : payment.auctionStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {payment.auctionStatus === "active"
                                ? "نشط"
                                : payment.auctionStatus === "ended"
                                ? "منتهي"
                                : payment.auctionStatus === "pending"
                                ? "معلق"
                                : payment.auctionStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        لا يوجد مزاد مرتبط
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPaymentClick(payment);
                      }}
                      className="inline-flex items-center px-3 py-1 text-sm text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <FaEye className="w-4 h-4 ml-1" />
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">عرض</span>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">عنصر</span>
            </div>

            {/* Items info */}
            <div className="text-sm text-gray-700">
              عرض {startItem} إلى {endItem} من {totalItems} مدفوعة
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {payments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaTrash className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد مدفوعات
            </h3>
            <p className="text-gray-500">
              لم يتم العثور على مدفوعات تطابق معايير البحث
            </p>
          </div>
        )}
      </div>
    );
  }
);

PaymentTable.displayName = "PaymentTable";

export default PaymentTable;
