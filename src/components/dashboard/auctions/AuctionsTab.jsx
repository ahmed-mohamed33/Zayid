import React, { memo, useEffect, useMemo, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";
import { FaGavel } from "react-icons/fa";

const AuctionsTab = memo(
  ({ localUser, userAuctions, formatCurrency, getAuctionStatusBadge }) => {
    const [activeTab, setActiveTab] = useState("all");
    const [deletedAuctions, setDeletedAuctions] = useState([]);
    const [deletedLoading, setDeletedLoading] = useState(true);

    // Load deleted auctions owned by this user
    useEffect(() => {
      const ownerId = localUser?.userId || localUser?.uid || null;
      if (!ownerId) {
        setDeletedAuctions([]);
        setDeletedLoading(false);
        return;
      }
      const db = getDatabase();
      const r = ref(db, "deleted_auctions");
      const unsub = onValue(
        r,
        (snap) => {
          if (snap.exists()) {
            const items = Object.entries(snap.val())
              .map(([id, a]) => ({ id, ...a }))
              .filter((a) => (a.ownerId || a.createdBy) === ownerId);
            items.sort(
              (a, b) =>
                new Date(b.deletedAt || b.deletionMeta?.deletedAt || 0) -
                new Date(a.deletedAt || a.deletionMeta?.deletedAt || 0)
            );
            setDeletedAuctions(items);
          } else {
            setDeletedAuctions([]);
          }
          setDeletedLoading(false);
        },
        () => setDeletedLoading(false)
      );
      return () => typeof unsub === "function" && unsub();
    }, [localUser?.userId, localUser?.uid]);

    const filtered = useMemo(() => {
      switch (activeTab) {
        case "active":
          return userAuctions.filter((a) => a.status === "active");
        case "pending":
          return userAuctions.filter((a) => a.status === "pending");
        case "approved":
          return userAuctions.filter((a) => a.status === "approved");
        case "ended":
          return userAuctions.filter((a) => a.status === "ended");
        case "rejected":
          return userAuctions.filter((a) => a.status === "rejected");
        case "deleted":
          return deletedAuctions;
        default:
          return userAuctions;
      }
    }, [activeTab, userAuctions, deletedAuctions]);

    const counts = useMemo(
      () => ({
        all: userAuctions.length,
        active: userAuctions.filter((a) => a.status === "active").length,
        pending: userAuctions.filter((a) => a.status === "pending").length,
        approved: userAuctions.filter((a) => a.status === "approved").length,
        ended: userAuctions.filter((a) => a.status === "ended").length,
        rejected: userAuctions.filter((a) => a.status === "rejected").length,
        deleted: deletedAuctions.length,
      }),
      [userAuctions, deletedAuctions]
    );

    if (userAuctions.length === 0 && counts.deleted === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FaGavel className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>لا توجد مزادات لهذا المستخدم</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">مزادات المستخدم</h3>

        {/* Sub-tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: "all", name: `الكل (${counts.all})` },
            { id: "active", name: `نشطة (${counts.active})` },
            { id: "pending", name: `قيد المراجعة (${counts.pending})` },
            { id: "approved", name: `معتمدة (${counts.approved})` },
            { id: "ended", name: `منتهية (${counts.ended})` },
            { id: "rejected", name: `مرفوضة (${counts.rejected})` },
            { id: "deleted", name: `محذوفة (${counts.deleted})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                activeTab === t.id
                  ? "bg-orange-50 text-orange-600 border-orange-300"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  اسم المزاد
                </th>
                {activeTab !== "deleted" && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    السعر الابتدائي
                  </th>
                )}
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  تاريخ الإنشاء
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  تاريخ البدء
                </th>
                {activeTab === "deleted" && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    تاريخ الحذف
                  </th>
                )}
                {activeTab === "rejected" && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    سبب الرفض
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(activeTab === "deleted" ? deletedLoading : false) ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={6}
                  >
                    جارٍ التحميل...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={6}
                  >
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                filtered.map((auction) => {
                  const isDeleted = activeTab === "deleted";
                  const title = auction.title || "بدون عنوان";
                  const createdAt = auction.createdAt || auction.created_at;
                  const startDate = auction.startDate;
                  const status =
                    auction.status ||
                    (isDeleted ? auction.previousStatus || "deleted" : "");
                  const deletedAt =
                    auction.deletedAt || auction.deletionMeta?.deletedAt;
                  const rejectReason =
                    auction.rejectedMeta?.reason ||
                    auction.rejectionReason ||
                    "-";
                  return (
                    <tr key={auction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          {auction.imageUrls && auction.imageUrls[0] && (
                            <img
                              src={auction.imageUrls[0]}
                              alt={title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span>{title}</span>
                        </div>
                      </td>
                      {activeTab !== "deleted" && (
                        <td className="px-4 py-3 text-sm">
                          {formatCurrency(auction.startPrice)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm">
                        {getAuctionStatusBadge(status)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {createdAt
                          ? new Date(createdAt).toLocaleDateString("ar-EG")
                          : "غير محدد"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {startDate
                          ? new Date(startDate).toLocaleDateString("ar-EG")
                          : "غير محدد"}
                      </td>
                      {activeTab === "deleted" && (
                        <td className="px-4 py-3 text-sm">
                          {deletedAt
                            ? new Date(deletedAt).toLocaleString("ar-EG")
                            : "-"}
                        </td>
                      )}
                      {activeTab === "rejected" && (
                        <td className="px-4 py-3 text-sm">{rejectReason}</td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

AuctionsTab.displayName = "AuctionsTab";

export default AuctionsTab;
