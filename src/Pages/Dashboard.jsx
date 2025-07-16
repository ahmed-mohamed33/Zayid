import React, { useState, useContext, useEffect } from 'react';
import User from '../components/dashboard/User';
import Product from '../components/dashboard/Product';
import { UserContext } from '../context/UserContext';
import { getDatabase, ref, onValue } from 'firebase/database';

import { 
  FaUsers, 
  FaGavel, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaExclamationTriangle,
  FaSearch,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaAd,
  FaClipboardList
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const { auctions } = useContext(UserContext);
  const [allUsers, setAllUsers] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [openComplaints, setOpenComplaints] = useState(0);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersArray = Object.entries(snapshot.val()).map(([id, userData]) => ({ id, ...userData }));
        setAllUsers(usersArray);
      } else {
        setAllUsers([]);
      }
    });

    // Fetch payments for revenue
    const paymentsRef = ref(db, 'payments');
    const unsubPayments = onValue(paymentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const paymentsArray = Object.values(snapshot.val());
        const revenue = paymentsArray.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        setTotalRevenue(revenue);
      } else {
        setTotalRevenue(0);
      }
    });
    // Fetch complaints for open complaints
    const complaintsRef = ref(db, 'complaints');
    const unsubComplaints = onValue(complaintsRef, (snapshot) => {
      if (snapshot.exists()) {
        const complaintsArray = Object.values(snapshot.val());
        const openCount = complaintsArray.filter(c => c.status === 'open').length;
        setOpenComplaints(openCount);
      } else {
        setOpenComplaints(0);
      }
    });

    return () => {
      unsubscribe();
      unsubPayments();
      unsubComplaints();
    };
  }, []);

  // Compute statistics from real data
  const totalUsers = allUsers.length;
  const activeAuctions = auctions.filter(a => a.status === 'active').length;
  const endedAuctions = auctions.filter(a => a.status === 'ended').length;
  const pendingAuctions = auctions.filter(a => a.status === 'pending').length;
  const companyUsers = allUsers.filter(u => u.isCompany).length;
  // Placeholder for revenue and complaints (replace with real logic if available)
  // const totalRevenue = 'غير متوفر';
  // const openComplaints = 'غير متوفر';

  const statistics = [
    {
      title: 'إجمالي المستخدمين',
      value: totalUsers,
      icon: FaUsers,
      color: 'bg-blue-500',
      change: '',
    },
    {
      title: 'عدد الشركات',
      value: companyUsers,
      icon: FaUsers,
      color: 'bg-indigo-500',
      change: '',
    },
    {
      title: 'المزادات النشطة',
      value: activeAuctions,
      icon: FaGavel,
      color: 'bg-green-500',
      change: '',
    },
    {
      title: 'المزادات المعلقة',
      value: pendingAuctions,
      icon: FaClipboardList,
      color: 'bg-yellow-500',
      change: '',
    },
    {
      title: 'المزادات المنتهية',
      value: endedAuctions,
      icon: FaClipboardList,
      color: 'bg-orange-500',
      change: '',
    },
    {
      title: 'إجمالي الإيرادات',
      value: totalRevenue.toLocaleString() + ' ريال',
      icon: FaMoneyBillWave,
      color: 'bg-purple-500',
      change: '',
    },
    {
      title: 'الشكاوى المفتوحة',
      value: openComplaints,
      icon: FaExclamationTriangle,
      color: 'bg-red-500',
      change: '',
    },
  ];

  // Chart data for auction activity
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  // Count active auctions by startDate weekday
  const activeByDay = Array(7).fill(0);
  const endedByDay = Array(7).fill(0);
  auctions.forEach(a => {
    if (a.status === 'active' && a.startDate) {
      const d = new Date(a.startDate);
      activeByDay[d.getDay()]++;
    }
    if (a.status === 'ended' && a.endDate) {
      const d = new Date(a.endDate);
      endedByDay[d.getDay()]++;
    }
  });
  const chartData = {
    labels: weekDays,
    datasets: [
      {
        label: 'المزادات النشطة',
        data: activeByDay,
        borderColor: '#FA6300',
        backgroundColor: 'rgba(250, 99, 0, 0.1)',
        tension: 0.4,
      },
      {
        label: 'المزادات المنتهية',
        data: endedByDay,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        rtl: true,
      },
      title: {
        display: true,
        text: 'نشاط المزادات خلال الأسبوع',
        font: {
          size: 16,
          family: 'Tajawal, sans-serif',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Sample data for tables
  const recentAuctions = [
    {
      id: 1,
      name: 'سيارة BMW 2023',
      seller: 'أحمد محمد',
      highestBid: '45,000 ريال',
      status: 'نشط',
      endDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'عقار في الرياض',
      seller: 'فاطمة علي',
      highestBid: '2,500,000 ريال',
      status: 'منتهي',
      endDate: '2024-01-10',
    },
    {
      id: 3,
      name: 'مجموعة ساعات فاخرة',
      seller: 'خالد عبدالله',
      highestBid: '85,000 ريال',
      status: 'نشط',
      endDate: '2024-01-20',
    },
    {
      id: 4,
      name: 'أثاث مكتبي',
      seller: 'سارة أحمد',
      highestBid: '12,000 ريال',
      status: 'معلق',
      endDate: '2024-01-12',
    },
  ];

  // Get the 4 most recent users from allUsers
  const newUsers = [...allUsers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const menuItems = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: FaChartLine },
    { id: 'users', name: 'المستخدمين', icon: FaUsers },
    { id: 'auctions', name: 'المزادات', icon: FaGavel },
    // { id: 'reports', name: 'التقارير المالية', icon: FaMoneyBillWave },
    // { id: 'ads', name: 'الإعلانات', icon: FaAd },
    { id: 'complaints', name: 'الشكاوى', icon: FaExclamationTriangle },
    { id: 'settings', name: 'الإعدادات', icon: FaCog },
  ];

  return (
    
    <div className="flex gap-5 h-screen bg-gray-50 font-['Tajawal'] " dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 text-start">زايد</h1>
          <p className="text-sm text-gray-600 text-start mt-1">لوحة التحكم</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center px-6 py-3 text-right transition-colors duration-200 ${
                activeMenu === item.id
                  ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600'
              }`}
            >
              <item.icon className="ml-3 text-lg" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
          
          <button className="w-full flex items-center px-6 py-3 text-right text-red-600 hover:bg-red-50 transition-colors duration-200 mt-6">
            <FaSignOutAlt className="ml-3 text-lg" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </nav>
      </div>

      {/* Main Content Switcher */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeMenu === 'users' ? (
          <div className="p-6">
            <User />
          </div>
        ) : activeMenu === 'auctions' ? (
          <div className="p-6">
            <Product />
          </div>
        ) : (
          <>
            {/* Top Bar */}
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="البحث..."
                      className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                 
                  
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">مرحباً،  ادمن</p>
                      <p className="text-sm text-gray-600">أدمن</p>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Dashboard Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {statistics.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        <p className={`text-sm font-medium ${
                          stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change} من الشهر الماضي
                        </p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="text-white text-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">نشاط المزادات خلال الأسبوع</h2>
                <div className="h-80">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Tables Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Auctions Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">المزادات الحديثة</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            اسم المزاد
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            البائع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            أعلى مزايدة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تاريخ الانتهاء
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentAuctions.map((auction) => (
                          <tr key={auction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {auction.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {auction.seller}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {auction.highestBid}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                auction.status === 'نشط' ? 'bg-green-100 text-green-800' :
                                auction.status === 'منتهي' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {auction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {auction.endDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* New Users Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">المستخدمين الجدد</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الاسم الكامل
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            البريد الإلكتروني
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            نوع المستخدم
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تاريخ التسجيل
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {newUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.fullName || 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email || 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.isCompany ? 'شركة' : 'فرد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.isActive ? 'مفعل' : 'غير مفعل'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
