import { useEffect, useState } from 'react';
import {
  ref,
  get,
  remove,
  getDatabase,
  update,
  onValue,
  child,
  off,
} from 'firebase/database';

import { auth, database } from '../config/Firebase';
import { useNavigate } from 'react-router-dom';
import userIcon from '../assets/icons/profile.svg';
import { getAuctionsByUser, getUserActivities } from '../utils/firebaseUtils';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Settings from './../components/profileComponents/ProfileSettings';
import ProfileInfoCard from './../components/profileComponents/ProfileInfoCard';
import MyAuctionsSection from './../components/profileComponents/MyAuctionsSection';
import MyPurchasesSection from './../components/profileComponents/MyPurchasesSection';
import MyActivities from '../components/profileComponents/MyActivities';

const Profile = () => {
  const navigate = useNavigate();

  //taps
  const [activeTab, setActiveTab] = useState('مزاداتي');

  const categories = [
    { label: 'الملف الشخصي', icon: userIcon },
    { label: 'الاعدادات', icon: userIcon },
    { label: 'تسجيل الخروج', icon: userIcon },
  ];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // المزادات\\
  const [myAuctions, setAuctions] = useState([]);
  //done

  // المشتريات
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  // النشاطات
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activities, setActivities] = useState([]);
  // stats
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    ended: 0,
  });

  const statsArray = [
    { label: 'إجمالي المزادات', value: stats.total },
    { label: 'مزادات نشطة', value: stats.active },
    { label: 'قيد المراجعة', value: stats.pending },
    { label: 'منتهية', value: stats.ended },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);

      try {
        const db = getDatabase();
        const auctionsSnap = await get(ref(db, 'auctions'));

        const auctions = auctionsSnap.exists()
          ? Object.values(auctionsSnap.val())
          : [];

        const total = auctions.length;
        const active = auctions.filter((a) => a.status === 'active').length;
        const pending = auctions.filter((a) => a.status === 'pending').length;
        const ended = auctions.filter((a) => a.status === 'ended').length;

        setStats({ total, active, pending, ended });
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
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
      console.error('❌ Error deleting auction:', err);
    }
  };

  const getWonAuctionsByAnUser = async (userId) => {
    try {
      const db = getDatabase();
      const winnersRef = ref(db, 'winners');
      const userAuctionsRef = ref(db, `users/${userId}/auctions`);
      const [winnersSnap, userAuctionsSnap] = await Promise.all([
        get(winnersRef),
        get(userAuctionsRef)
      ]);

      if (!userAuctionsSnap.exists()) {
        return { data: [], success: true };
      }

      const userAuctions = userAuctionsSnap.val();
      const wonAuctions = Object.entries(userAuctions)
        .filter(([_, auction]) => auction.isWinner)
        .map(([auctionId, auction]) => ({
          auctionId,
          finalBid: auction.winnerBid || 0,
          isPaid: auction.isPaid ,
          title: auction.auctionTitle || '',
          imageUrls: auction.auctionImage ? [auction.auctionImage] : []
        }));

      return { data: wonAuctions, success: true };
    } catch (error) {
      console.error('❌ Error fetching won auctions:', error);
      return {
        error: error.message,
        success: false
      };
    }
  };

  // end mazad
  const handleEndAuction = async (auctionId) => {
    try {
      const auctionRef = ref(database, `auctions/${auctionId}`);
      const snapshot = await get(auctionRef);

      if (!snapshot.exists()) {
        alert('المزاد غير موجود');
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
        status: 'ended',
        highestBid: topBid.bidAmount,
        highestBidderId: topBid.userId || null,
      });

      setAuctions((prev) =>
        prev.map((auction) =>
          auction.id === auctionId
            ? {
                ...auction,
                status: 'ended',
                highestBid: topBid.bidAmount,
                highestBidderId: topBid.userId || null,
              }
            : auction
        )
      );
    } catch (error) {
      console.error('❌ فشل في إنهاء المزاد:', error);
      alert('حدث خطأ أثناء إنهاء المزاد');
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('فشل تسجيل الخروج:', error);
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
                if (cat.label === 'تسجيل الخروج') {
                  handleLogout();
                } else {
                  setActiveCategory(idx);
                }
              }}
              className={`flex flex-row-reverse items-center justify-end rounded-lg px-4 py-3 text-base font-medium transition-colors w-full text-right border ${
                activeCategory === idx
                  ? 'bg-[#FFF6F1] text-[#FA6300] border-[#FA6300]'
                  : 'bg-[#F3F4F6] text-[#2D3142] border-transparent hover:bg-[#E5E7EB]'
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
              {['مزاداتي', 'المشتريات', 'النشاطات'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-lg font-semibold transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-[#FA6300] text-[#FA6300]'
                      : 'border-transparent text-gray-600 hover:text-[#FA6300]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div className="p-8">
              <MyAuctionsSection
                setAuctions={setAuctions}
                myAuctions={myAuctions}
                activeTab={activeTab}
                endAuction={handleEndAuction}
                handleDeleteAuction={handleDeleteAuction}
                setStats={setStats}
              />

              {/* المشتريات */}
              <MyPurchasesSection
                loadingPurchases={loadingPurchases}
                setLoadingPurchases={setLoadingPurchases}
                activeTab={activeTab}
                getWonAuctionsByAnUser={getWonAuctionsByAnUser}
              />
              {/* النشاطات */}
              <MyActivities
                activeTab={activeTab}
                setLoadingActivities={setLoadingActivities}
                loadingActivities={loadingActivities}
                setActivities={setActivities}
                activities={activities}
              />
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Profile;
