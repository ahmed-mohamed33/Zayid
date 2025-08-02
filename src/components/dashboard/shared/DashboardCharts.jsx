import React from "react";
import { Line, Pie } from "react-chartjs-2";

const DashboardCharts = ({
  chartData,
  chartOptions,
  categoryData,
  paymentChartData,
  pieOptions,
}) => {
  return (
    <div className="flex flex-col  gap-8 mb-8">
      {/* Line Chart Section */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          نشاط المزادات خلال آخر 7 أيام
        </h2>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Pie Charts Section */}
      <div className="flex-1 grid grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            عدد المزادات حسب الفئة
          </h2>
          <div className="h-80 flex items-center justify-center">
            <Pie data={categoryData} options={pieOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            توزيع المدفوعات
          </h2>
          <div className="h-80 flex items-center justify-center">
            <Pie data={paymentChartData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
