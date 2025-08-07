import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { getDatabase, ref, onValue } from "firebase/database";
import {
    FaUsers,
    FaGavel,
    FaMoneyBillWave,
    FaClipboardList,
    FaCreditCard,
    FaMobileAlt,
    FaStore,
} from "react-icons/fa";

export const useDashboardData = () => {
    const { auctions, userData, logout } = useContext(UserContext);
    const [allUsers, setAllUsers] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    const [paymentStats, setPaymentStats] = useState({
        totalPayments: 0,
        insurancePayments: 0,
        shrootPayments: 0,
        paymentsByMethod: {
            vodafone: 0,
            card: 0,

        },
    });

    const [categoryData, setCategoryData] = useState({
        labels: [],
        datasets: [
            {
                label: "عدد المزادات",
                data: [],
                backgroundColor: [
                    "rgba(255, 159, 64, 0.7)",
                    "rgba(59, 130, 246, 0.7)",
                    "rgba(16, 185, 129, 0.7)",
                    "rgba(250, 204, 21, 0.7)",
                    "rgba(139, 92, 246, 0.7)",
                ],
                borderColor: [
                    "rgba(255, 159, 64, 1)",
                    "rgba(59, 130, 246, 1)",
                    "rgba(16, 185, 129, 1)",
                    "rgba(250, 204, 21, 1)",
                    "rgba(139, 92, 246, 1)",
                ],
                borderWidth: 1,
            },
        ],
    });

    const [paymentChartData, setPaymentChartData] = useState({
        labels: ["مدفوعات التأمين", "مدفوعات الشروط"],
        datasets: [
            {
                data: [0, 0],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.7)",
                    "rgba(139, 92, 246, 0.7)",
                ],
                borderColor: [
                    "rgba(59, 130, 246, 1)",
                    "rgba(139, 92, 246, 1)",
                ],
                borderWidth: 1,
            },
        ],
    });

    // Fetch users and payments data
    useEffect(() => {
        const db = getDatabase();
        const usersRef = ref(db, "users");
        const paymentsRef = ref(db, "payments");

        const unsubscribeUsers = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const usersArray = Object.entries(snapshot.val()).map(([id, userData]) => ({
                    id,
                    ...userData,
                }));
                setAllUsers(usersArray);
            } else {
                setAllUsers([]);
            }
        });

        const unsubscribePayments = onValue(paymentsRef, (snapshot) => {
            if (snapshot.exists()) {
                const paymentsArray = Object.values(snapshot.val());
                const revenue = paymentsArray.reduce(
                    (sum, p) => sum + (Number(p.amount) || 0),
                    0
                );
                setTotalRevenue(revenue);

                // Calculate payment statistics
                const stats = {
                    totalPayments: 0,
                    insurancePayments: 0,
                    shrootPayments: 0,
                    paymentsByMethod: {
                        vodafone: 0,
                        card: 0,

                    },
                };

                paymentsArray.forEach((payment) => {
                    const amount = Number(payment.amount) || 0;
                    stats.totalPayments += amount;

                    if (payment.type === "insurance") {
                        stats.insurancePayments += amount;
                    } else if (payment.type === "shroot") {
                        stats.shrootPayments += amount;
                    }

                    if (payment.method) {
                        stats.paymentsByMethod[payment.method] =
                            (stats.paymentsByMethod[payment.method] || 0) + amount;
                    }
                });

                setPaymentStats(stats);
            } else {
                setTotalRevenue(0);
            }
            setLoading(false);
        });

        return () => {
            unsubscribeUsers();
            unsubscribePayments();
        };
    }, []);

    // Calculate category data
    useEffect(() => {
        if (auctions.length > 0) {
            const categoryLabels = {
                "عقارات وأراضي": "عقارات وأراضي",
                "إلكترونيات": "إلكترونيات",
                "تحف وأعمال فنية": "تحف وأعمال فنية",
                "مجوهرات": "مجوهرات",
                "أثاث": "أثاث",
                "سيارات": "سيارات",
                "خردة وبواقي معادن": "خردة وبواقي معادن",
                "أخرى": "أخرى"
            };

            const categories = {};
            auctions.forEach((auction) => {
                const category = auction.categoryId || "أخرى";
                const categoryLabel = categoryLabels[category] || "أخرى";
                categories[categoryLabel] = (categories[categoryLabel] || 0) + 1;
            });

            setCategoryData({
                labels: Object.keys(categories),
                datasets: [
                    {
                        ...categoryData.datasets[0],
                        data: Object.values(categories),
                    },
                ],
            });
        }
    }, [auctions]);

    // Update payment chart data
    useEffect(() => {
        setPaymentChartData({
            labels: ["مدفوعات التأمين", "مدفوعات الشروط"],
            datasets: [
                {
                    data: [paymentStats.insurancePayments, paymentStats.shrootPayments],
                    backgroundColor: [
                        "rgba(59, 130, 246, 0.7)",
                        "rgba(139, 92, 246, 0.7)",
                    ],
                    borderColor: [
                        "rgba(59, 130, 246, 1)",
                        "rgba(139, 92, 246, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        });
    }, [paymentStats]);

    // Calculate statistics
    const totalUsers = allUsers.length;
    const activeAuctions = auctions.filter((a) => a.status === "active").length;
    const endedAuctions = auctions.filter((a) => a.status === "ended").length;
    const pendingAuctions = auctions.filter((a) => a.status === "pending").length;
    const companyUsers = allUsers.filter((u) => u.isCompany).length;

    const newAuctions = auctions.filter((auction) => {
        const createdAt = new Date(auction.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return createdAt >= sevenDaysAgo;
    }).length;

    const statistics = [
        {
            title: "إجمالي المستخدمين",
            value: totalUsers,
            icon: FaUsers,
            color: "bg-blue-500",
        },
        {
            title: "عدد الشركات",
            value: companyUsers,
            icon: FaUsers,
            color: "bg-indigo-500",
        },
        {
            title: "المزادات النشطة",
            value: activeAuctions,
            icon: FaGavel,
            color: "bg-green-500",
        },
        {
            title: "المزادات المعلقة",
            value: pendingAuctions,
            icon: FaClipboardList,
            color: "bg-yellow-500",
        },
        {
            title: "المزادات المنتهية",
            value: endedAuctions,
            icon: FaClipboardList,
            color: "bg-orange-500",
        },

        {
            title: "إجمالي الإيرادات",
            value: totalRevenue.toLocaleString() + " جنيه",
            icon: FaMoneyBillWave,
            color: "bg-teal-500",
        },
    ];

    const paymentStatistics = [
        {
            title: "إجمالي المدفوعات",
            value: paymentStats.totalPayments.toLocaleString() + " جنيه",
            icon: FaMoneyBillWave,
            color: "bg-emerald-500",
        },
        {
            title: "مدفوعات التأمين",
            value: paymentStats.insurancePayments.toLocaleString() + " جنيه",
            icon: FaCreditCard,
            color: "bg-blue-500",
        },
        {
            title: "مدفوعات الشروط",
            value: paymentStats.shrootPayments.toLocaleString() + " جنيه",
            icon: FaClipboardList,
            color: "bg-purple-500",
        },
        {
            title: "فودافون كاش",
            value: paymentStats.paymentsByMethod.vodafone.toLocaleString() + " جنيه",
            icon: FaMobileAlt,
            color: "bg-red-500",
        },
        {
            title: "البطاقات البنكية",
            value: paymentStats.paymentsByMethod.card.toLocaleString() + " جنيه",
            icon: FaCreditCard,
            color: "bg-indigo-500",
        },

    ];

    return {
        userData,
        logout,
        loading,
        statistics,
        paymentStatistics,
        paymentStats,
        categoryData,
        paymentChartData,
        auctions,
    };
}; 