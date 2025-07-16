import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { getDatabase, ref, update, remove } from 'firebase/database';

export default function Product() {
  const { auctions, loading, userData } = useContext(UserContext);
  const db = getDatabase();
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const handleEndAuction = async (auctionId) => {
    try {
      await update(ref(db, `auctions/${auctionId}`), { status: 'ended' });
      // Optionally: update UI or show feedback
    } catch (err) {
      alert('حدث خطأ أثناء إنهاء المزاد');
    }
  };

  const handleRemoveAuction = async (auctionId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المزاد؟')) return;
    try {
      await remove(ref(db, `auctions/${auctionId}`));
      // Optionally: update UI or show feedback
    } catch (err) {
      alert('حدث خطأ أثناء حذف المزاد');
    }
  };

  const handleAcceptAuction = async (auctionId) => {
    try {
      await update(ref(db, `auctions/${auctionId}`), { status: 'active' });
    } catch (err) {
      alert('حدث خطأ أثناء قبول المزاد');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!auctions || auctions.length === 0) {
    return <div>No products (auctions) found.</div>;
  }

  const filteredAuctions = showPendingOnly ? auctions.filter(a => a.status === 'pending') : auctions;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">كل المنتجات (المزادات)</h2>
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${showPendingOnly ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setShowPendingOnly(v => !v)}
        >
          {showPendingOnly ? 'عرض الكل' : 'عرض المزادات المعلقة'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم المنتج</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر الإفتتاحي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAuctions.map((auction) => (
              <tr key={auction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{auction.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{auction.startPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{auction.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{auction.startDate ? new Date(auction.startDate).toLocaleString('ar-EG') : ''}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{auction.endDate ? new Date(auction.endDate).toLocaleString('ar-EG') : ''}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  {auction.status === 'pending' && (
                    <>
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs"
                        onClick={() => handleAcceptAuction(auction.id)}
                      >
                        قبول
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                        onClick={() => handleRemoveAuction(auction.id)}
                      >
                        حذف
                      </button>
                    </>
                  )}
                  {auction.status === 'active' && (
                    <>
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs"
                        onClick={() => handleEndAuction(auction.id)}
                      >
                        إنهاء
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                        onClick={() => handleRemoveAuction(auction.id)}
                      >
                        حذف
                      </button>
                    </>
                  )}
                  {auction.status === 'ended' && (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                      onClick={() => handleRemoveAuction(auction.id)}
                    >
                      حذف
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
