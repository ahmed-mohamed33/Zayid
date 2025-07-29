import React, { useEffect, useState, useMemo } from "react";
import { useDashboardData } from "../../hooks/useDashboardData";
import CountUp from "react-countup";
import statistic from "../../assets/icons/statistic.svg";
import Users from "../../assets/icons/profile-2user.svg";
import Group from "../../assets/icons/Group.svg";
import sandClock from "../../assets/icons/sandClock.svg";
import clock from "../../assets/icons/clock.svg";

function NumberCard({ icon, number, label }) {
  return (
    <div className="bg-[#F1F1F1] p-6 rounded-lg shadow-md">
      <div className="flex justify-center mb-2">
        <span className="p-2 rounded-full">
          <img src={icon} alt={label} className="w-6 h-6" />
        </span>
      </div>
      <p className="text-2xl font-semibold text-[#333c65e0]">
        <CountUp
          end={number || 0}
          duration={2.5}
          delay={0.2}
          separator=","
          enableScrollSpy={true}
          scrollSpyOnce={true}
        />
      </p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

function OurNumbers() {
  const { statistics, paymentStatistics, categoryData, loading } =
    useDashboardData();
  const [stats, setStats] = useState({
    totalAuctions: 0,
    totalCategories: 0,
    completedAuctions: 0,
    activeAuctions: 0,
    totalUsers: 0,
  });

  const calculatedStats = useMemo(() => {
    if (loading || !statistics || !categoryData) {
      return {
        totalAuctions: 0,
        totalCategories: 0,
        completedAuctions: 0,
        activeAuctions: 0,
        totalUsers: 0,
      };
    }

    const totalAuctions = statistics.reduce(
      (sum, stat) => sum + (stat.title.includes("مزادات") ? stat.value : 0),
      0
    );
    return {
      totalAuctions,
      totalCategories: categoryData.labels?.length || 0,
      completedAuctions:
        statistics.find((stat) => stat.title === "المزادات المنتهية")?.value ||
        0,
      activeAuctions:
        statistics.find((stat) => stat.title === "المزادات النشطة")?.value || 0,
      totalUsers:
        statistics.find((stat) => stat.title === "إجمالي المستخدمين")?.value ||
        0,
    };
  }, [loading, JSON.stringify(statistics), JSON.stringify(categoryData)]);

  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);

  if (loading) {
    return (
      <div className="px-[56px] py-[96px] text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="px-[56px] py-[96px] text-center">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">إحصائيات</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <NumberCard
          icon={statistic}
          number={stats.totalAuctions}
          label="إجمالي المزادات"
        />
        <NumberCard
          icon={Group}
          number={stats.totalCategories}
          label="الفئات"
        />
        <NumberCard
          icon={sandClock}
          number={stats.completedAuctions}
          label="مزاد مكتمل"
        />
        <NumberCard
          icon={clock}
          number={stats.activeAuctions}
          label="مزاد حالي"
        />
        <NumberCard icon={Users} number={stats.totalUsers} label="مستخدم" />
      </div>
    </div>
  );
}

export default OurNumbers;
