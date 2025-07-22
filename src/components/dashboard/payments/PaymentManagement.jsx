import React, { useState, useMemo } from "react";
import {
  FaDollarSign,
  FaChartLine,
  FaFileExport,
  FaFilter,
} from "react-icons/fa";
import { usePaymentData } from "../../../hooks/usePaymentData";
import { usePaymentActions } from "../../../hooks/usePaymentActions.jsx";
import PaymentFilters from "./PaymentFilters";
import PaymentTable from "./PaymentTable";
import PaymentModal from "./PaymentModal";
import PaymentStats from "./PaymentStats";
import PaymentCharts from "./PaymentCharts";
import { Pop as Popup } from "../shared";

const PaymentManagement = () => {
  const [activeView, setActiveView] = useState("table");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [popup, setPopup] = useState({
    open: false,
    type: "",
    message: "",
    onConfirm: null,
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    method: "all",
    type: "all",
    dateRange: { start: "", end: "" },
    amountRange: { min: "", max: "" },
  });

  // Sorting and pagination
  const [sortConfig, setSortConfig] = useState({
    field: "timestamp",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Custom hooks
  const { payments, loading, error, totalStats, refetch } = usePaymentData();
  const {
    verifyPayment,
    refundPayment,
    updatePaymentStatus,
    exportPayments,
    bulkUpdateStatus,
  } = usePaymentActions();

  // Filtered and sorted payments
  const filteredPayments = useMemo(() => {
    let filtered = payments.filter((payment) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !payment.id.toLowerCase().includes(searchTerm) &&
          !payment.userId?.toLowerCase().includes(searchTerm) &&
          !payment.auctionId?.toLowerCase().includes(searchTerm) &&
          !payment.method?.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== "all" && payment.status !== filters.status) {
        return false;
      }

      // Method filter
      if (filters.method !== "all" && payment.method !== filters.method) {
        return false;
      }

      // Type filter
      if (filters.type !== "all" && payment.type !== filters.type) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const paymentDate = new Date(payment.timestamp || payment.createdAt);
        if (
          filters.dateRange.start &&
          paymentDate < new Date(filters.dateRange.start)
        ) {
          return false;
        }
        if (
          filters.dateRange.end &&
          paymentDate > new Date(filters.dateRange.end)
        ) {
          return false;
        }
      }

      // Amount range filter
      if (filters.amountRange.min || filters.amountRange.max) {
        const amount = Number(payment.amount) || 0;
        if (
          filters.amountRange.min &&
          amount < Number(filters.amountRange.min)
        ) {
          return false;
        }
        if (
          filters.amountRange.max &&
          amount > Number(filters.amountRange.max)
        ) {
          return false;
        }
      }

      return true;
    });

    // Sort payments
    if (sortConfig.field) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.field];
        let bValue = b[sortConfig.field];

        // Handle special cases
        if (sortConfig.field === "amount") {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        } else if (
          sortConfig.field === "timestamp" ||
          sortConfig.field === "createdAt"
        ) {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        } else {
          aValue = String(aValue || "").toLowerCase();
          bValue = String(bValue || "").toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [payments, filters, sortConfig]);

  // Paginated payments
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  // Stats for filtered payments
  const filteredStats = useMemo(() => {
    const stats = {
      total: filteredPayments.length,
      totalAmount: 0,
      paid: 0,
      paidAmount: 0,
      pending: 0,
      pendingAmount: 0,
      failed: 0,
      failedAmount: 0,
      refunded: 0,
      refundedAmount: 0,
      cancelled: 0,
      cancelledAmount: 0,

      byMethod: {},
      byType: {},
      byDate: {},
      successRate: 0,
      averageAmount: 0,
    };

    // Calculate stats by iterating through filtered payments
    filteredPayments.forEach((payment) => {
      const amount = Number(payment.amount) || 0;
      stats.totalAmount += amount;

      // Count by status and calculate amounts
      switch (payment.status) {
        case "paid":
          stats.paid++;
          stats.paidAmount += amount;
          break;
        case "pending":
          stats.pending++;
          stats.pendingAmount += amount;
          break;
        case "failed":
          stats.failed++;
          stats.failedAmount += amount;
          break;
        case "refunded":
          stats.refunded++;
          stats.refundedAmount += amount;
          break;
        case "cancelled":
          stats.cancelled++;
          stats.cancelledAmount += amount;
          break;
      }

      // Group by method
      const method = payment.method || "unknown";
      if (!stats.byMethod[method]) {
        stats.byMethod[method] = { count: 0, amount: 0 };
      }
      stats.byMethod[method].count++;
      stats.byMethod[method].amount += amount;

      // Group by type
      const type = payment.type || "unknown";
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, amount: 0 };
      }
      stats.byType[type].count++;
      stats.byType[type].amount += amount;

      // Group by date (daily)
      const date = new Date(
        payment.timestamp || payment.createdAt || new Date()
      )
        .toISOString()
        .split("T")[0];
      if (!stats.byDate[date]) {
        stats.byDate[date] = { count: 0, amount: 0 };
      }
      stats.byDate[date].count++;
      stats.byDate[date].amount += amount;
    });

    // Calculate derived metrics
    stats.averageAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;
    stats.successRate = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;

    return stats;
  }, [filteredPayments]);

  // Action handlers
  const showPopup = (type, message, onConfirm = null) => {
    setPopup({ open: true, type, message, onConfirm });
  };

  const closePopup = () => {
    setPopup({ open: false, type: "", message: "", onConfirm: null });
  };

  const handlePaymentAction = async (action, paymentId, data = {}) => {
    try {
      let result;
      switch (action) {
        case "verify":
          result = await verifyPayment(paymentId, data);
          break;
        case "refund":
          result = await refundPayment(paymentId, data);
          break;
        case "updateStatus":
          result = await updatePaymentStatus(paymentId, data.status, data.note);
          break;
        default:
          return;
      }

      if (result.success) {
        showPopup("info", result.message);
        refetch();
        setShowModal(false);
      } else {
        showPopup("error", result.message);
      }
    } catch (error) {
      showPopup("error", "حدث خطأ أثناء تنفيذ العملية");
    }
  };

  const handleBulkAction = async (action, paymentIds) => {
    if (paymentIds.length === 0) {
      showPopup("error", "الرجاء اختيار مدفوعات للتعديل");
      return;
    }

    showPopup(
      "confirm",
      `هل أنت متأكد من تطبيق هذا الإجراء على ${paymentIds.length} مدفوعة؟`,
      async () => {
        try {
          const result = await bulkUpdateStatus(paymentIds, action);
          if (result.success) {
            showPopup("info", result.message);
            setSelectedPayments([]);
            refetch();
          } else {
            showPopup("error", result.message);
          }
        } catch (error) {
          showPopup("error", "حدث خطأ أثناء تنفيذ العملية");
        }
      }
    );
  };

  const handleExport = async (format) => {
    try {
      const result = await exportPayments(filteredPayments, format);
      if (result.success) {
        showPopup("info", "تم تصدير البيانات بنجاح");
      } else {
        showPopup("error", result.message);
      }
    } catch (error) {
      showPopup("error", "حدث خطأ أثناء تصدير البيانات");
    }
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePaymentSelect = (paymentId, selected) => {
    if (selected) {
      setSelectedPayments((prev) => [...prev, paymentId]);
    } else {
      setSelectedPayments((prev) => prev.filter((id) => id !== paymentId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedPayments(paginatedPayments.map((p) => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const viewTabs = [
    { id: "table", name: "الجدول", icon: FaDollarSign },
    { id: "stats", name: "الإحصائيات", icon: FaChartLine },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">حدث خطأ في تحميل البيانات: {error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المدفوعات</h1>
          <p className="text-gray-600">
            إجمالي {filteredPayments.length} مدفوعة
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === tab.id
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
              <FaFileExport className="w-4 h-4" />
              تصدير
            </button>
            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport("csv")}
                className="block w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="block w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {(activeView === "stats" || activeView === "charts") && (
        <PaymentStats stats={filteredStats} totalStats={totalStats} />
      )}

      {/* Filters */}
      {activeView === "stats" || activeView === "charts" ? null : (
        <PaymentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={() => {
            setFilters({
              search: "",
              status: "all",
              method: "all",
              type: "all",
              dateRange: { start: "", end: "" },
              amountRange: { min: "", max: "" },
            });
            setCurrentPage(1);
          }}
        />
      )}

      {/* Content */}
      {activeView === "table" ? (
        <PaymentTable
          payments={paginatedPayments}
          selectedPayments={selectedPayments}
          sortConfig={sortConfig}
          onSort={handleSort}
          onPaymentSelect={handlePaymentSelect}
          onSelectAll={handleSelectAll}
          onPaymentClick={(payment) => {
            setSelectedPayment(payment);
            setShowModal(true);
          }}
          onBulkAction={handleBulkAction}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredPayments.length / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
          totalItems={filteredPayments.length}
        />
      ) : (
        <PaymentCharts
          payments={filteredPayments}
          stats={filteredStats}
          showMethodAndTypeCharts={activeView === "stats"}
        />
      )}

      {/* Payment Modal */}
      {showModal && selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => {
            setShowModal(false);
            setSelectedPayment(null);
          }}
          onAction={handlePaymentAction}
        />
      )}

      {/* Popup */}
      <Popup
        isOpen={popup.open}
        onClose={closePopup}
        title={
          popup.type === "confirm"
            ? "تأكيد"
            : popup.type === "error"
            ? "خطأ"
            : "تنبيه"
        }
        onConfirm={popup.type === "confirm" ? popup.onConfirm : undefined}
        confirmText={popup.type === "confirm" ? "نعم، تأكيد" : undefined}
        cancelText={popup.type === "confirm" ? "إلغاء" : undefined}
      >
        {popup.message}
      </Popup>
    </div>
  );
};

export default PaymentManagement;
