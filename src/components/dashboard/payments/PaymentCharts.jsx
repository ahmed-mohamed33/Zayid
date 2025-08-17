import React, { memo, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { FaChartBar, FaChartPie, FaChartLine, FaArrowUp } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const PaymentCharts = memo(
  ({ payments, stats, showMethodAndTypeCharts = false }) => {
    // Safety check for required data
    if (!payments || !stats) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-center text-gray-500">لا توجد بيانات للعرض</p>
        </div>
      );
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("ar-EG", {
        style: "currency",
        currency: "EGP",
        minimumFractionDigits: 0,
      }).format(amount || 0);
    };

    // Status distribution chart
    const statusChartData = useMemo(() => {
      try {
        const statusColors = {
          paid: "#10B981",
          pending: "#F59E0B",
          failed: "#EF4444",
          refunded: "#3B82F6",
          cancelled: "#6B7280",
        };

        const statusLabels = {
          paid: "مدفوع",
          pending: "معلق",
          failed: "فشل",
          refunded: "مسترد",
          cancelled: "ملغي",
        };

        const statusData = [
          { status: "paid", count: stats.paid, amount: stats.paidAmount },
          {
            status: "pending",
            count: stats.pending,
            amount: stats.pendingAmount,
          },
          { status: "failed", count: stats.failed, amount: stats.failedAmount },
          {
            status: "refunded",
            count: stats.refunded,
            amount: stats.refundedAmount,
          },
          {
            status: "cancelled",
            count: stats.cancelled,
            amount: stats.cancelledAmount,
          },
        ].filter((item) => item.count > 0);

        return {
          labels: statusData.map((item) => statusLabels[item.status]),
          datasets: [
            {
              data: statusData.map((item) => item.count),
              backgroundColor: statusData.map(
                (item) => statusColors[item.status]
              ),
              borderColor: statusData.map((item) => statusColors[item.status]),
              borderWidth: 2,
            },
          ],
        };
      } catch (error) {
        console.log(error, "error in statusChartData");
        return {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
              borderColor: [],
              borderWidth: 2,
            },
          ],
        };
      }
    }, [stats]);

    // Payment methods chart (only when needed)
    const methodChartData = useMemo(() => {
      if (!showMethodAndTypeCharts) return null;

      try {
        const methodColors = {
          vodafone: "#E60023",
          card: "#1E40AF",
          visa: "#1A1F71",
          mastercard: "#EB001B",
          bank: "#059669",
          cash: "#6B7280",
        };

        const methodLabels = {
          vodafone: "فودافون كاش",
          card: "بطاقة ائتمان",
          visa: "فيزا",
          mastercard: "ماستركارد",
          bank: "تحويل بنكي",
          cash: "نقدي",
        };

        const methodData = Object.entries(stats.byMethod || {})
          .map(([method, data]) => ({
            method,
            count: data.count,
            amount: data.amount,
            label: methodLabels[method] || method,
          }))
          .sort((a, b) => b.amount - a.amount);

        return {
          labels: methodData.map((item) => item.label),
          datasets: [
            {
              label: "المبلغ",
              data: methodData.map((item) => item.amount),
              backgroundColor: methodData.map(
                (item) => methodColors[item.method] || "#6B7280"
              ),
              borderColor: methodData.map(
                (item) => methodColors[item.method] || "#6B7280"
              ),
              borderWidth: 2,
            },
          ],
        };
      } catch (error) {
        console.log(error, "error in methodChartData");
        return {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
              borderColor: [],
              borderWidth: 2,
            },
          ],
        };
      }
    }, [stats.byMethod, showMethodAndTypeCharts]);

    // Payment types chart (only when needed)
    const typeChartData = useMemo(() => {
      if (!showMethodAndTypeCharts) return null;

      try {
        const typeColors = {
          insurance: "#8B5CF6",
          shroot: "#6366F1",
          auction: "#F97316",
          subscription: "#10B981",
          fee: "#F59E0B",
        };

        const typeLabels = {
          insurance: "تأمين",
          shroot: "كراسة شروط",
          auction: "مزاد",
          subscription: "اشتراك",
          fee: "رسوم",
        };

        const typeData = Object.entries(stats.byType || {})
          .map(([type, data]) => ({
            type,
            count: data.count,
            amount: data.amount,
            label: typeLabels[type] || type,
          }))
          .sort((a, b) => b.amount - a.amount);

        return {
          labels: typeData.map((item) => item.label),
          datasets: [
            {
              label: "عدد المدفوعات",
              data: typeData.map((item) => item.count),
              backgroundColor: typeData.map(
                (item) => typeColors[item.type] || "#6B7280"
              ),
              borderColor: typeData.map(
                (item) => typeColors[item.type] || "#6B7280"
              ),
              borderWidth: 2,
            },
          ],
        };
      } catch (error) {
        console.log(error, "error in typeChartData");
          return {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
              borderColor: [],
              borderWidth: 2,
            },
          ],
        };
      }
    }, [stats.byType, showMethodAndTypeCharts]);

    // Daily payments trend
    const trendChartData = useMemo(() => {
      const last30Days = [];
      const today = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        last30Days.push(dateString);
      }

      const dailyData = last30Days.map((date) => {
        const dayData = stats.byDate?.[date] || { count: 0, amount: 0 };
        return {
          date,
          count: dayData.count,
          amount: dayData.amount,
          label: new Date(date).toLocaleDateString("ar-EG", {
            month: "short",
            day: "numeric",
          }),
        };
      });

      return {
        labels: dailyData.map((item) => item.label),
        datasets: [
          {
            label: "عدد المدفوعات",
            data: dailyData.map((item) => item.count),
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: "y",
          },
          {
            label: "المبلغ (جنيه)",
            data: dailyData.map((item) => item.amount),
            borderColor: "#10B981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: "y1",
          },
        ],
      };
    }, [stats.byDate]);

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          rtl: true,
          labels: {
            font: {
              family: "Almarai, Arial, sans-serif",
            },
          },
        },
        tooltip: {
          rtl: true,
          titleFont: {
            family: "Almarai, Arial, sans-serif",
          },
          bodyFont: {
            family: "Almarai, Arial, sans-serif",
          },
          callbacks: {
            label: function (context) {
              if (
                context.dataset.label?.includes("المبلغ") ||
                context.dataset.label?.includes("جنيه")
              ) {
                return `${context.dataset.label}: ${formatCurrency(
                  context.parsed.y || context.parsed
                )}`;
              }
              return `${context.dataset.label}: ${
                context.parsed.y || context.parsed
              }`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              family: "Almarai, Arial, sans-serif",
            },
          },
        },
        y: {
          ticks: {
            font: {
              family: "Almarai, Arial, sans-serif",
            },
          },
        },
      },
    };

    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          rtl: true,
          labels: {
            font: {
              family: "Almarai, Arial, sans-serif",
            },
            padding: 20,
          },
        },
        tooltip: {
          rtl: true,
          titleFont: {
            family: "Almarai, Arial, sans-serif",
          },
          bodyFont: {
            family: "Almarai, Arial, sans-serif",
          },
        },
      },
    };

    const trendOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
          rtl: true,
          labels: {
            font: {
              family: "Almarai, Arial, sans-serif",
            },
          },
        },
        tooltip: {
          rtl: true,
          titleFont: {
            family: "Almarai, Arial, sans-serif",
          },
          bodyFont: {
            family: "Almarai, Arial, sans-serif",
          },
          callbacks: {
            label: function (context) {
              if (context.dataset.label?.includes("جنيه")) {
                return `${context.dataset.label}: ${formatCurrency(
                  context.parsed.y
                )}`;
              }
              return `${context.dataset.label}: ${context.parsed.y}`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "التاريخ",
            font: {
              family: "Almarai, Arial, sans-serif",
            },
          },
          ticks: {
            font: {
              family: "Almarai, Arial, sans-serif",
            },
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "عدد المدفوعات",
            font: {
              family: "Almarai, Arial, sans-serif",
            },
          },
          ticks: {
            font: {
              family: "Almarai, Arial, sans-serif",
            },
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "المبلغ (جنيه)",
            font: {
              family: "Almarai, Arial, sans-serif",
            },
          },
          ticks: {
            font: {
              family: "Almarai, Arial, sans-serif",
            },
            callback: function (value) {
              return formatCurrency(value);
            },
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };

    return (
      <div className="space-y-6">

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartPie className="w-5 h-5 text-blue-500" />
              توزيع الحالات
            </h3>
            <div className="h-80">
              <Pie data={statusChartData} options={pieOptions} />
            </div>
          </div>

          {/* Payment Methods - Only in statistics view */}
          {showMethodAndTypeCharts && methodChartData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaChartBar className="w-5 h-5 text-green-500" />
                توزيع المدفوعات حسب الطريقة
              </h3>
              <div className="h-80">
                <Bar data={methodChartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Payment Types - Only in statistics view */}
          {showMethodAndTypeCharts && typeChartData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaChartBar className="w-5 h-5 text-purple-500" />
                توزيع المدفوعات حسب النوع
              </h3>
              <div className="h-80">
                <Bar data={typeChartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Daily Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="w-5 h-5 text-orange-500" />
              الاتجاه اليومي (آخر 30 يوم)
            </h3>
            <div className="h-80">
              <Line data={trendChartData} options={trendOptions} />
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            إحصائيات تفصيلية
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Breakdown */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">تفصيل الحالات</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-700">مدفوع</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-800">
                      {stats.paid}
                    </div>
                    <div className="text-xs text-green-600">
                      {formatCurrency(stats.paidAmount)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-yellow-700">معلق</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-yellow-800">
                      {stats.pending}
                    </div>
                    <div className="text-xs text-yellow-600">
                      {formatCurrency(stats.pendingAmount)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-700">فشل</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-800">
                      {stats.failed}
                    </div>
                    <div className="text-xs text-red-600">
                      {formatCurrency(stats.failedAmount)}
                    </div>
                  </div>
                </div>

                {stats.refunded > 0 && (
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm text-blue-700">مسترد</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-800">
                        {stats.refunded}
                      </div>
                      <div className="text-xs text-blue-600">
                        {formatCurrency(stats.refundedAmount)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Top Payment Methods - Only in statistics view */}
            {showMethodAndTypeCharts && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  أعلى طرق الدفع
                </h4>
                <div className="space-y-2">
                  {Object.entries(stats.byMethod || {})
                    .sort(([, a], [, b]) => b.amount - a.amount)
                    .slice(0, 5)
                    .map(([method, data]) => {
                      const methodLabels = {
                        vodafone: "فودافون كاش",
                        card: "بطاقة ائتمان",
                        visa: "فيزا",
                        mastercard: "ماستركارد",
                        bank: "تحويل بنكي",
                        cash: "نقدي",
                      };

                      return (
                        <div
                          key={method}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700">
                            {methodLabels[method] || method}
                          </span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-800">
                              {data.count}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatCurrency(data.amount)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Top Payment Types - Only in statistics view */}
            {showMethodAndTypeCharts && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  أعلى أنواع المدفوعات
                </h4>
                <div className="space-y-2">
                  {Object.entries(stats.byType || {})
                    .sort(([, a], [, b]) => b.amount - a.amount)
                    .slice(0, 5)
                    .map(([type, data]) => {
                      const typeLabels = {
                        insurance: "تأمين",
                        shroot: "كراسة شروط",
                        auction: "مزاد",
                        subscription: "اشتراك",
                        fee: "رسوم",
                      };

                      return (
                        <div
                          key={type}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-700">
                            {typeLabels[type] || type}
                          </span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-800">
                              {data.count}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatCurrency(data.amount)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PaymentCharts.displayName = "PaymentCharts";

export default PaymentCharts;

