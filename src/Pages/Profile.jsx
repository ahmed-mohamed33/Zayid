import { useEffect, useState } from "react";
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
//import Settings from './../components/auction/ProfileSettings';
import ProfileInfoCard from "./../components/profileComponents/ProfileInfoCard";
import MyAuctions from "./../components/profileComponents/MyAuctionsSection";
import MyPurchases from "./../components/profileComponents/MyPurchasesSection";
import MyActivities from "./../components/profileComponents/MyActivities";
import {
  getWonAuctionsByUser,
  deleteAuction,
  endAuctionById,
} from "../utils/auctionUtils";
import Settings from "../components/profileComponents/ProfileSettings";

const Profile = () => {
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
                  (status === "pending" ||
                    status === "active" ||
                    status === "approved") &&
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
                } else if (status === "ended") {
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
                  status === "approved" &&
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

            const approved = allAuctions.filter(
              (a) => a.status === "approved"
            ).length;

            const ended = allAuctions.filter(
              (a) => a.status === "ended"
            ).length;

            setAuctions(allAuctions);
            setStats({
              total: allAuctions.length,
              active,
              approved,
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
              console.log("🔥 auction data:", auction);
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
              } else if (auction.status === "approved") {
                auctionStatus = "موافق عليه";
              } else if (auction.status === "pending") {
                auctionStatus = "لم يبدأ بعد";
              } else if (auction.status === "ended") {
                auctionStatus = "منتهي";
              }

              const activity = {
                auctionId,
                name: auction?.title || "غير معروف",
                auctionStatus,
                insurance: insurancePayment ? "تم الدفع" : "لم يتم الدفع",
                chair: shrootPayment ? "تم الشراء" : "لم تُشترى",
              };

              setActivities((prev) => {
                const updated = prev.filter((a) => a.id !== auctionId);
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
    approved: 0,
  });

  const statsArray = [
    { label: "إجمالي المزادات", value: stats.total },
    { label: "مزادات نشطة", value: stats.active },
    { label: "مزادات تمت الموافقه ", value: stats.approved },
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
        const approved = auctions.filter((a) => a.status === "approved").length;
        const pending = auctions.filter((a) => a.status === "pending").length;
        const ended = auctions.filter((a) => a.status === "ended").length;

        setStats({ total, active, pending, approved, ended });
      } catch (error) {
        console.error("❌ Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // حذف
  const handleDeleteAuction = async (auctionId) => {
    try {
      await deleteAuction(auctionId);
      setAuctions((prev) => prev.filter((item) => item.id !== auctionId));
    } catch (err) {
      console.error("❌ Error deleting auction:", err);
    }
  };

  // إنهاء
  const endAuction = async (auctionId) => {
    try {
      const result = await endAuctionById(auctionId);
      setAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? { ...auction, status: "ended", ...result }
            : auction
        )
      );
    } catch (error) {
      console.error("❌ فشل في إنهاء المزاد:", error);
      alert("حدث خطأ أثناء إنهاء المزاد");
    }
  };

  // handleLogout
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-6">
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
                <MyAuctions
                  myAuctions={myAuctions}
                  loadingAuctions={loadingAuctions}
                  handleDeleteAuction={handleDeleteAuction}
                  endAuction={endAuction}
                />
              )}

              {/* المشتريات */}
              {activeTab === "المشتريات" && (
                <MyPurchases
                  loadingPurchases={loadingPurchases}
                  purchases={purchases}
                />
              )}

              {/* النشاطات */}
              {activeTab === "النشاطات" && (
                <MyActivities
                  activities={activities}
                  loadingActivities={loadingActivities}
                />
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Profile;
