import { useEffect, useState, useContext } from "react";
import {
  ref,
  get,
  remove,
  getDatabase,
  update,
  onValue,
  child,
  off,
} from "firebase/database";

import { auth, database } from "../config/Firebase";
import { useNavigate } from "react-router-dom";
import userIcon from "../assets/icons/profile.svg";
import { getAuctionsByUser, getUserActivities } from "../utils/firebaseUtils";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Settings from "../components/profileComponents/ProfileSettings";
import ProfileInfoCard from "../components/profileComponents/ProfileInfoCard";
import { UserContext } from "../context/UserContext";
const Profile = ({}) => {
  const { auctions } = useContext(UserContext);
  const navigate = useNavigate();

  //taps
  const [activeTab, setActiveTab] = useState("مزاداتي");
  // console.log('activeTab:', activeTab);

  const categories = [
    { label: "الملف الشخصي", icon: userIcon },
    { label: "الاعدادات", icon: userIcon },
    { label: "تسجيل الخروج", icon: userIcon },
  ];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // المزادات
  const [myAuctions, setAuctions] = useState([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoadingAuctions(true);
          const { data } = await getAuctionsByUser(user.uid);

          if (data) {
            const auctionEntries = Object.entries(data);

            const allAuctions = await Promise.all(
              auctionEntries.map(async ([id, value]) => {
                const bids = value.bids
                  ? Object.values(value.bids).filter((bid) => bid?.bidAmount)
                  : [];

                let topBid = { bidAmount: 0, userName: "لا يوجد مزايدين" };
                if (bids.length > 0) {
                  topBid = bids.reduce(
                    (max, bid) =>
                      parseFloat(bid.bidAmount) > parseFloat(max.bidAmount)
                        ? bid
                        : max,
                    { bidAmount: 0, userName: "لا يوجد مزايدين" }
                  );
                }

                const now = new Date();
                const startDate = new Date(value.startDate);
                const endDate = new Date(value.endDate);

                let status = value.status || "pending";

                if (
                  (status === "pending" || status === "active") &&
                  now > endDate
                ) {
                  status = "ended";

                  let topBid = { bidAmount: 0, userId: null };
                  if (bids.length > 0) {
                    topBid = bids.reduce(
                      (max, bid) =>
                        parseFloat(bid.bidAmount) > parseFloat(max.bidAmount)
                          ? bid
                          : max,
                      { bidAmount: 0, userId: null }
                    );
                  }

                  const auctionRef = ref(database, `auctions/${id}`);
                  await update(auctionRef, {
                    status: "ended",
                    highestBid: topBid.bidAmount,
                    highestBidderId: topBid.userId || null,
                  });
                }

                // ✅ الحالة تبدأ تلقائيًا
                else if (
                  status === "pending" &&
                  now >= startDate &&
                  now <= endDate
                ) {
                  status = "active";
                  const auctionRef = ref(database, `auctions/${id}`);
                  await update(auctionRef, { status: "active" });
                }

                return {
                  id,
                  ...value,
                  finalBid: topBid.bidAmount,
                  topBidder: topBid.userName,
                  status,
                };
              })
            );

            const pending = allAuctions.filter(
              (a) => a.status === "pending"
            ).length;
            const active = allAuctions.filter(
              (a) => a.status === "active"
            ).length;
            const ended = allAuctions.filter(
              (a) => a.status === "ended"
            ).length;

            setAuctions(allAuctions);
            setStats({
              total: allAuctions.length,
              active,
              pending,
              ended,
            });
          } else {
            setAuctions([]);
          }
        } catch (error) {
          console.error("Error loading auctions:", error);
        } finally {
          setLoadingAuctions(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // المشتريات
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [purchases, setPurchases] = useState([]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoadingPurchases(false);
        return;
      }

      try {
        const { data: wonAuctions } = await getWonAuctionsByUser(user.uid);
        console.log("✅ Won Auctions:", wonAuctions);
        if (!wonAuctions || wonAuctions.length === 0) {
          setPurchases([]);
        } else {
          const dbRef = ref(database);

          const purchasesList = await Promise.all(
            wonAuctions.map(async (win) => {
              const auctionSnap = await get(
                child(dbRef, `auctions/${win.auctionId}`)
              );
              const auctionData = auctionSnap.val();

              return {
                auctionId: win.auctionId,
                title: auctionData?.title || "مزاد غير معروف",
                price: win.finalBid,
                image: auctionData?.imageUrls?.[0],
                status: auctionData?.status || "غير معروف",
                isPaid: win.isPaid,
              };
            })
          );

          setPurchases(purchasesList);
          console.log("🎯 Final Purchases List:", purchasesList);
          console.log("purchases state:", purchases);
        }
      } catch (err) {
        console.error("❌ Error fetching purchases:", err);
      } finally {
        setLoadingPurchases(false);
      }
    });

    return () => unsubscribe();
  }, []);
  console.log("Auctions:", auctions);
  // النشاطات
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoadingActivities(true);
        try {
          const db = getDatabase();
          const paymentsSnap = await get(ref(db, "payments"));
          const paymentsData = paymentsSnap.exists() ? paymentsSnap.val() : {};
          const userPayments = Object.values(paymentsData).filter(
            (p) =>
              p.userId === user.uid && ["insurance", "shroot"].includes(p.type)
          );
          const auctionIds = [...new Set(userPayments.map((p) => p.auctionId))];

          const listeners = [];

          auctionIds.forEach((auctionId) => {
            const auctionRef = ref(db, `auctions/${auctionId}`);
            const listener = onValue(auctionRef, (snapshot) => {
              const auction = snapshot.val();
              if (!auction) return;

              const insurancePayment = userPayments.find(
                (p) => p.auctionId === auctionId && p.type === "insurance"
              );
              const shrootPayment = userPayments.find(
                (p) => p.auctionId === auctionId && p.type === "shroot"
              );

              let auctionStatus = "غير معروف";
              if (auction.status === "active") {
                auctionStatus = "جاري";
              } else if (auction.status === "pending") {
                auctionStatus = "لم يبدأ بعد";
              } else if (auction.status === "ended") {
                auctionStatus = "منتهي";
              }

              const activity = {
                name: auction?.title || "غير معروف",
                auctionStatus,
                insurance: insurancePayment ? "تم الدفع" : "لم يتم الدفع",
                chair: shrootPayment ? "تم الشراء" : "لم تُشترى",
              };

              setActivities((prev) => {
                const updated = prev.filter((a) => a.name !== activity.name);
                return [...updated, activity];
              });
            });

            listeners.push({ auctionRef, listener });
          });

          return () => {
            listeners.forEach(({ auctionRef }) => off(auctionRef));
          };
        } catch (err) {
          console.error("Error fetching activities:", err);
          setActivities([]);
        } finally {
          setLoadingActivities(false);
        }
      } else {
        setActivities([]);
        setLoadingActivities(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // stats
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    ended: 0,
  });

  const statsArray = [
    { label: "إجمالي المزادات", value: stats.total },
    { label: "مزادات نشطة", value: stats.active },
    { label: "قيد المراجعة", value: stats.pending },
    { label: "منتهية", value: stats.ended },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);

      try {
        const db = getDatabase();
        const auctionsSnap = await get(ref(db, "auctions"));

        const auctions = auctionsSnap.exists()
          ? Object.values(auctionsSnap.val())
          : [];

        const total = auctions.length;
        const active = auctions.filter((a) => a.status === "active").length;
        const pending = auctions.filter((a) => a.status === "pending").length;
        const ended = auctions.filter((a) => a.status === "ended").length;

        setStats({ total, active, pending, ended });
      } catch (error) {
        console.error("❌ Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // delete mazad
  const handleDeleteAuction = async (auctionId) => {
    try {
      await remove(ref(database, `auctions/${auctionId}`));

      setAuctions((prev) => prev.filter((item) => item.id !== auctionId));
    } catch (err) {
      console.error("❌ Error deleting auction:", err);
    }
  };

  // end mazad
  const endAuction = async (auctionId) => {
    try {
      const auctionRef = ref(database, `auctions/${auctionId}`);
      const snapshot = await get(auctionRef);

      if (!snapshot.exists()) {
        alert("المزاد غير موجود");
        return;
      }

      const auction = snapshot.val();

      const bidsObject = auction?.bids || {};
      const bids = Object.values(bidsObject);

      let topBid = { bidAmount: 0, userId: null };
      if (bids.length > 0) {
        topBid = bids.reduce(
          (max, bid) =>
            parseFloat(bid.bidAmount) > parseFloat(max.bidAmount) ? bid : max,
          { bidAmount: 0, userId: null }
        );
      }

      await update(auctionRef, {
        status: "ended",
        highestBid: topBid.bidAmount,
        highestBidderId: topBid.userId || null,
      });

      setAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? {
                ...auction,
                status: "ended",
                highestBid: topBid.bidAmount,
                highestBidderId: topBid.userId || null,
              }
            : auction
        )
      );
    } catch (error) {
      console.error("❌ فشل في إنهاء المزاد:", error);
      alert("حدث خطأ أثناء إنهاء المزاد");
    }
  };

  // won mazad
  const getWonAuctionsByUser = async (userId) => {
    const db = getDatabase();
    const auctionsRef = ref(db, "auctions");
    const snapshot = await get(auctionsRef);

    if (!snapshot.exists()) return { data: [] };

    const allAuctions = snapshot.val();
    const wonAuctions = Object.entries(allAuctions)
      .filter(
        ([_, auction]) =>
          auction?.highestBidderId === userId && auction?.status === "ended"
      )
      .map(([auctionId, auction]) => ({
        auctionId,
        finalBid: auction.highestBid || 0,
        isPaid: auction?.payments?.[userId]?.isPaid || false, // أو أي نظام دفع عندك
      }));

    return { data: wonAuctions };
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("فشل تسجيل الخروج:", error);
    }
  };

  return (
    <div className="flex w-full gap-6 justify-between bg-[#F6F6F6]  p-6">
      {/* Sidebar */}
      <aside className=" bg-white rounded-xl border border-[#E5E7EB] hidden lg:block w-72 shrink-0 min-h-[600px] ">
        <div className=" p-4 flex flex-col gap-2 mb-4">
          {categories.map((cat, idx) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => {
                if (cat.label === "تسجيل الخروج") {
                  handleLogout();
                } else {
                  setActiveCategory(idx);
                }
              }}
              className={`flex flex-row-reverse items-center justify-end rounded-lg px-4 py-3 text-base font-medium transition-colors w-full text-right border ${
                activeCategory === idx
                  ? "bg-[#FFF6F1] text-[#FA6300] border-[#FA6300]"
                  : "bg-[#F3F4F6] text-[#2D3142] border-transparent hover:bg-[#E5E7EB]"
              }`}
            >
              {/* Sidebar icon */}
              <span>{cat.label}</span>
              <img src={cat.icon} alt="icon" className="w-5 h-5 ml-2" />
            </button>
          ))}
        </div>
      </aside>
      {/* Main */}
      {activeCategory === 1 ? (
        <Settings />
      ) : (
        <main className="flex-1 flex flex-col gap-6">
          {/* user data */}
          <ProfileInfoCard />

          {/* Stats Cards */}
          {loadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-xl p-6 flex flex-col items-center animate-pulse h-28"
                >
                  <div className="h-6 w-12 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              {statsArray.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center shadow-sm"
                >
                  <div className="text-2xl font-bold text-gray-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Card */}
          <div className="bg-white rounded-xl shadow p-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-[#E5E7EB] px-8 pt-4">
              {["مزاداتي", "المشتريات", "النشاطات"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-lg font-semibold transition-colors border-b-2 ${
                    activeTab === tab
                      ? "border-[#FA6300] text-[#FA6300]"
                      : "border-transparent text-gray-600 hover:text-[#FA6300]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div className="p-8">
              {/* مزاداتي */}
              {activeTab === "مزاداتي" && (
                <div className="overflow-x-auto min-h-[100px]">
                  {loadingAuctions ? (
                    // ✅ Skeleton Loader جدولي أثناء التحميل
                    <table className="min-w-full text-right animate-pulse">
                      <thead>
                        <tr className="text-gray-500 text-base">
                          <th className="py-3 px-6">اسم المزاد</th>
                          <th className="py-3 px-6">قيمة أعلى سعر</th>
                          <th className="py-3 px-6">حالة المزاد</th>
                          <th className="py-3 px-6">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...Array(3)].map((_, i) => (
                          <tr key={i}>
                            <td className="py-4 px-6">
                              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : myAuctions.length > 0 ? (
                    //  جدول المزادات الحقيقي
                    <table className="min-w-full text-right">
                      <thead>
                        <tr className="text-gray-500 text-base">
                          <th className="py-3 px-6">اسم المزاد</th>
                          <th className="py-3 px-6">قيمة أعلى سعر</th>
                          <th className="py-3 px-6">حالة المزاد</th>
                          <th className="py-3 px-6">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myAuctions.map((item, i) => (
                          <tr key={i}>
                            <td className="py-3 px-6 font-medium">
                              {item.title}
                            </td>
                            <td className="py-3 px-6">
                              {/* لو عايزين ف المستقبل نعرض اسم صاحب اعلى مزايده (${item.topBidder}) */}
                              {item.finalBid
                                ? `${item.finalBid} جنيه `
                                : "لا توجد مزايدات"}
                            </td>

                            <td className="py-3 px-6">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  item.status === "active"
                                    ? "bg-green-100 text-green-600"
                                    : item.status === "pending"
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {item.status === "active"
                                  ? "جاري"
                                  : item.status === "pending"
                                  ? "قيد المراجعة"
                                  : "منتهي"}
                              </span>
                            </td>

                            <td className="py-3 px-6">
                              {item.status === "pending" && (
                                <button
                                  onClick={() => handleDeleteAuction(item.id)}
                                  className="flex items-center gap-1 text-red-600 bg-red-100 hover:bg-red-200 px-4 py-1 rounded-full font-semibold transition"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M6 18L18 6M6 6l12 12"
                                      stroke="#EF4444"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  حذف
                                </button>
                              )}

                              {item.status === "active" && (
                                <button
                                  onClick={() => endAuction(item.id)}
                                  className="flex items-center gap-1 text-yellow-600 bg-yellow-100 hover:bg-yellow-200 px-4 py-1 rounded-full font-semibold transition"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M6 18L18 6M6 6l12 12"
                                      stroke="#D97706"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  إنهاء
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    // ✅ عند عدم وجود بيانات بعد التحميل
                    <div className="text-center text-gray-300 py-10">
                      <svg
                        className="mx-auto mb-3"
                        xmlns="http://www.w3.org/2000/svg"
                        width="42"
                        height="42"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 17v-6h6v6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h3l2-2h2l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z"
                        />
                      </svg>
                      لا يوجد مزادات حالياً.
                    </div>
                  )}
                </div>
              )}

              {/* المشتريات */}
              {activeTab === "المشتريات" && (
                <div className="p-6">
                  {loadingPurchases ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-xl p-6 flex flex-col items-center shadow-sm animate-pulse"
                        >
                          <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4" />
                          <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded" />
                          <div className="h-3 bg-gray-200 w-1/2 mb-1 rounded" />
                          <div className="h-3 bg-gray-200 w-1/3 mb-1 rounded" />
                          <div className="h-3 bg-gray-200 w-1/4 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : purchases.length === 0 ? (
                    <div className="text-center text-gray-400 text-lg py-10">
                      لا يوجد مشتريات حتى الآن.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {purchases.map((item, i) => (
                        <div
                          key={i}
                          className="border border-[#E5E7EB] rounded-xl p-6 flex flex-col items-center shadow-sm"
                        >
                          <img
                            src={item.image}
                            alt="product"
                            className="w-32 h-32 object-cover mb-4 rounded-lg"
                          />
                          <div className="font-bold mb-2 text-lg">
                            {item.title}
                          </div>
                          <div className="text-green-700 mb-1 text-base">
                            {item.price} ج.م
                          </div>
                          <div className="text-gray-500 text-sm mb-1">
                            الحالة:{" "}
                            {item.status === "active"
                              ? "جاري"
                              : item.status === "pending"
                              ? "قيد المراجعة"
                              : "منتهي"}
                          </div>
                          <div
                            className={`text-xs font-semibold mb-3 ${
                              item.isPaid ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {item.isPaid ? "تم الدفع" : "لم يتم الدفع"}
                          </div>
                          <button
                            className="bg-gray-200 text-gray-500 px-6 py-2 rounded-lg font-semibold cursor-not-allowed"
                            disabled
                          >
                            تم الشراء
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* النشاطات */}
              {activeTab === "النشاطات" && (
                <div className="overflow-x-auto min-h-[120px]">
                  {loadingActivities ? (
                    <table className="min-w-full text-right animate-pulse">
                      <thead>
                        <tr className="text-gray-500 text-base">
                          <th className="py-3 px-6">اسم المزاد</th>
                          <th className="py-3 px-6">حالة الكراسة</th>
                          <th className="py-3 px-6">حالة التأمين</th>
                          <th className="py-3 px-6">حالة المزاد</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i}>
                            <td className="py-3 px-6">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </td>
                            <td className="py-3 px-6">
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </td>
                            <td className="py-3 px-6">
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </td>
                            <td className="py-3 px-6">
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : activities.length > 0 ? (
                    <table className="min-w-full text-right">
                      <thead>
                        <tr className="text-gray-500 text-base">
                          <th className="py-3 px-6">اسم المزاد</th>
                          <th className="py-3 px-6">حالة الكراسة</th>
                          <th className="py-3 px-6">حالة التأمين</th>
                          <th className="py-3 px-6">حالة المزاد</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((item, i) => (
                          <tr key={i}>
                            <td className="py-3 px-6 font-medium">
                              {item.name}
                            </td>
                            <td className="py-3 px-6">
                              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                                {item.chair}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  item.insurance === "لم يتم الدفع"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-green-100 text-green-600"
                                }`}
                              >
                                {item.insurance}
                              </span>
                            </td>
                            <td className="py-3 px-6">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  item.auctionStatus === "جاري"
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-green-100 text-green-600"
                                }`}
                              >
                                {item.auctionStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center text-gray-300 py-10">
                      لا يوجد نشاطات حتى الآن.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Profile;
