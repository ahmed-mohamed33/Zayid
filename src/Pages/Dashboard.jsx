import React, { useState } from "react";
import {
  User,
  Product,
  PaymentManagement,
  DashboardSidebar,
  DashboardStats,
  UserInfoCard,
  DashboardCharts,
  DefaultTerms,
  DisputeManagement,
} from "../components/dashboard";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  FaUsers,
  FaGavel,
  FaChartLine,
  FaMoneyBillWave,
  FaClipboardList,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const {
    userData,
    logout,
    loading,
    statistics,
    categoryData,
    paymentChartData,
    auctions,
  } = useDashboardData();

  // Get auction activity for the past 7 days
  const getAuctionsByDay = () => {
    const activeByDay = Array(7).fill(0);
    const endedByDay = Array(7).fill(0);
    const pendingByDay = Array(7).fill(0);

    // Get the last 7 days including today
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }

    auctions.forEach((auction) => {
      // Check when auction was created/started
      if (auction.createdAt) {
        const createdDate = new Date(auction.createdAt);
        createdDate.setHours(0, 0, 0, 0);

        // Find which day this auction was created
        const dayIndex = days.findIndex(
          (day) => day.getTime() === createdDate.getTime()
        );

        if (dayIndex !== -1) {
          if (auction.status === "active") {
            activeByDay[dayIndex]++;
          } else if (auction.status === "ended") {
            endedByDay[dayIndex]++;
          } else if (auction.status === "pending") {
            pendingByDay[dayIndex]++;
          }
        }
      }
    });

    return { activeByDay, endedByDay, pendingByDay, days };
  };

  const { activeByDay, endedByDay, pendingByDay, days } = getAuctionsByDay();

  // Get day labels for the chart
  const getDayLabels = () => {
    return days.map((date) => {
      const dayNames = [
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
      ];
      const dayName = dayNames[date.getDay()];
      const dayNumber = date.getDate();
      const month = date.getMonth() + 1;
      return `${dayName}\n${dayNumber}/${month}`;
    });
  };

  const chartData = {
    labels: getDayLabels(),
    datasets: [
      {
        label: "المزادات النشطة",
        data: activeByDay,
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.3,
        fill: false,
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: "المزادات المنتهية",
        data: endedByDay,
        borderColor: "#F97316",
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        tension: 0.3,
        fill: false,
        pointBackgroundColor: "#F97316",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: "المزادات المعلقة",
        data: pendingByDay,
        borderColor: "#EAB308",
        backgroundColor: "rgba(234, 179, 8, 0.2)",
        tension: 0.3,
        fill: false,
        pointBackgroundColor: "#EAB308",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
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
            family: "Almarai, sans-serif",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `نشاط المزادات خلال آخر 7 أيام`,
        font: {
          size: 16,
          family: "Almarai, sans-serif",
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        rtl: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "Almarai, sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "Almarai, sans-serif",
          size: 12,
        },
        callbacks: {
          title: function (context) {
            const dayNames = [
              "الأحد",
              "الإثنين",
              "الثلاثاء",
              "الأربعاء",
              "الخميس",
              "الجمعة",
              "السبت",
            ];
            const date = days[context[0].dataIndex];
            return `${dayNames[date.getDay()]} ${date.getDate()}/${
              date.getMonth() + 1
            }`;
          },
          label: function (context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value} ${
              value === 1 ? "مزاد" : "مزادات"
            }`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: "Almarai, sans-serif",
            size: 11,
          },
          callback: function (value) {
            return Number.isInteger(value) ? value : "";
          },
        },
        grid: {
          display: true,
          drawBorder: false,
          color: "rgba(0, 0, 0, 0.1)",
        },
        title: {
          display: true,
          text: "عدد المزادات",
          font: {
            family: "Almarai, sans-serif",
            size: 12,
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: "Almarai, sans-serif",
            size: 10,
          },
          maxRotation: 0,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "الأيام",
          font: {
            family: "Almarai, sans-serif",
            size: 12,
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        rtl: true,
        labels: {
          font: {
            family: "Almarai, sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: "توزيع المدفوعات حسب النوع ",
        font: {
          size: 16,
          family: "Almarai, sans-serif",
        },
      },
    },
  };

  const menuItems = [
    { id: "dashboard", name: "لوحة التحكم", icon: FaChartLine },
    { id: "users", name: "المستخدمين", icon: FaUsers },
    { id: "auctions", name: "المزادات", icon: FaGavel },
    { id: "payments", name: "المدفوعات", icon: FaMoneyBillWave },
    {
      id: "settings-default-terms",
      name: "الشروط الافتراضية",
      icon: FaClipboardList,
    },
    {
      id: "disputes",
      name: "إدارة النزاعات",
      icon: FaExclamationTriangle,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-6 justify-between bg-[#F6F6F6] p-6">
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        handleLogout={handleLogout}
      />

      <div className="flex-1">
        {activeMenu === "users" ? (
          <User />
        ) : activeMenu === "auctions" ? (
          <Product />
        ) : activeMenu === "payments" ? (
          <PaymentManagement />
        ) : activeMenu === "settings-default-terms" ? (
          <DefaultTerms />
        ) : activeMenu === "disputes" ? (
          <DisputeManagement />
        ) : (
          <div className="flex flex-col gap-6">
            <UserInfoCard userData={userData} />
            <DashboardStats statistics={statistics} />
            <DashboardCharts
              chartData={chartData}
              chartOptions={chartOptions}
              categoryData={categoryData}
              paymentChartData={paymentChartData}
              pieOptions={pieOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
