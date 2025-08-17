import React, { useState, useEffect, useContext } from "react";
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  get,
  set,
} from "firebase/database";
import {
  FaExclamationTriangle,
  FaCheck,
  FaClock,
  FaArrowUp,
  FaCog,
  FaList,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useDisputeActions } from "../../../hooks/useDisputeActions";
import { UserContext } from "../../../context/UserContext";

const DisputeManagement = () => {
  const db = getDatabase();
  const { userData } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("list"); // list or settings
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [settings, setSettings] = useState({
    enabled: false,
    slaHours: 48,
    escalationDays: 3,
    autoCloseAfterDays: 14,
    minDisputeAmount: 1000,
    allowedReasons: [
      "عدم استلام المنتج",
      "المنتج مختلف عن الوصف",
      "المنتج به عيوب",
      "البائع غير متجاوب",
      "مشكلة في الدفع",
    ],
    notifyEmails: [],
    escalationEmails: [],
  });
  const [saving, setSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [expandedDisputes, setExpandedDisputes] = useState(new Set());

  const { updateDisputeStatus, escalateDispute } = useDisputeActions();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const settingsRef = ref(db, "settings/disputes");
      const disputesRef = ref(db, "disputes");
      const disputesQuery = query(disputesRef, orderByChild("createdAt"));

      try {
        // Fetch settings
        const settingsSnap = await get(settingsRef);
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.val());
        }

        // Subscribe to disputes
        const unsubscribe = onValue(disputesQuery, (snapshot) => {
          if (snapshot.exists()) {
            const disputesData = [];
            snapshot.forEach((child) => {
              disputesData.unshift({ ...child.val(), id: child.key });
            });
            setDisputes(disputesData);
          } else {
            setDisputes([]);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, [db]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const settingsRef = ref(db, "settings/disputes");
      await set(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: userData?.fullName || userData?.email || "admin",
      });

      Swal.fire({
        icon: "success",
        title: "تم الحفظ",
        text: "تم تحديث إعدادات النزاعات بنجاح",
        confirmButtonColor: "#FA6300",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء الحفظ. حاول مرة أخرى.",
        confirmButtonColor: "#FA6300",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "escalated":
        return "text-red-500";
      case "resolved":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="w-5 h-5" />;
      case "escalated":
        return <FaExclamationTriangle className="w-5 h-5" />;
      case "resolved":
        return <FaCheck className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const handleStatusChange = async (disputeId, newStatus) => {
    const result = await Swal.fire({
      title: "تغيير حالة النزاع",
      input: "text",
      inputLabel: "أضف تعليقاً (اختياري)",
      showCancelButton: true,
      confirmButtonText: "تأكيد",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#44A46F",
    });

    if (result.isConfirmed) {
      const updateResult = await updateDisputeStatus(
        disputeId,
        newStatus,
        result.value || ""
      );

      if (updateResult.success) {
        Swal.fire({
          icon: "success",
          title: "تم تحديث الحالة",
          text: updateResult.message,
          confirmButtonColor: "#44A46F",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: updateResult.message,
          confirmButtonColor: "#FA6300",
        });
      }
    }
  };

  const handleEscalate = async (disputeId) => {
    const result = await Swal.fire({
      title: "تصعيد النزاع",
      input: "text",
      inputLabel: "سبب التصعيد",
      inputValidator: (value) => {
        if (!value) {
          return "يرجى إدخال سبب التصعيد";
        }
      },
      showCancelButton: true,
      confirmButtonText: "تصعيد",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      const escalateResult = await escalateDispute(disputeId, result.value);

      if (escalateResult.success) {
        Swal.fire({
          icon: "success",
          title: "تم التصعيد",
          text: escalateResult.message,
          confirmButtonColor: "#44A46F",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: escalateResult.message,
          confirmButtonColor: "#FA6300",
        });
      }
    }
  };

  const toggleDisputeExpansion = (disputeId) => {
    const newExpanded = new Set(expandedDisputes);
    if (newExpanded.has(disputeId)) {
      newExpanded.delete(disputeId);
    } else {
      newExpanded.add(disputeId);
    }
    setExpandedDisputes(newExpanded);
  };

  const filteredDisputes = disputes.filter((dispute) => {
    if (filter === "all") return true;
    return dispute.status === filter;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisputes = filteredDisputes.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTimeline = (timeline) => {
    if (!timeline || typeof timeline !== "object") return null;

    const entries = Object.entries(timeline).sort(
      (a, b) => new Date(b[1].date) - new Date(a[1].date)
    );

    return (
      <div className="mt-4 border-t pt-4">
        <h4 className="font-medium text-[#2D3142] mb-2">سجل النزاع</h4>
        <div className="space-y-2">
          {entries.map(([key, entry]) => (
            <div key={key} className="flex items-start gap-2 text-sm">
              <div className="w-24 flex-shrink-0 text-gray-500">
                {formatDate(entry.date)}
              </div>
              <div className="flex-1">
                <span className="font-medium">
                  {entry.type === "created"
                    ? "إنشاء"
                    : entry.type === "status_update"
                    ? "تحديث الحالة"
                    : "تصعيد"}
                </span>
                <p className="text-gray-600 mt-1">{entry.description}</p>
                {entry.comment && (
                  <p className="text-gray-500 mt-1">التعليق: {entry.comment}</p>
                )}
                {entry.by && (
                  <p className="text-gray-500 mt-1">بواسطة: {entry.by}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#2D3142]">إدارة النزاعات</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "list"
                ? "bg-[#FA6300] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaList />
            قائمة النزاعات
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "settings"
                ? "bg-[#FA6300] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaCog />
            الإعدادات
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="all">جميع النزاعات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="escalated">مصعدة</option>
                <option value="resolved">محلولة</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              إجمالي النزاعات: {filteredDisputes.length}
            </div>
          </div>

          {currentDisputes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              لا توجد نزاعات {filter !== "all" ? "بهذه الحالة" : ""}
            </div>
          ) : (
            <div className="space-y-4">
              {currentDisputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#2D3142]">
                        {dispute.auctionTitle} (#{dispute.auctionId})
                      </h3>
                      <p className="text-sm text-gray-500">
                        تم الإنشاء: {formatDate(dispute.createdAt)}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${getStatusColor(
                        dispute.status
                      )}`}
                    >
                      {getStatusIcon(dispute.status)}
                      <span className="font-medium">
                        {dispute.status === "pending"
                          ? "قيد الانتظار"
                          : dispute.status === "escalated"
                          ? "مصعد"
                          : "محلول"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* User Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-[#2D3142] mb-3">
                        معلومات مقدم النزاع
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">الاسم:</span>{" "}
                          {dispute.userName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">
                            البريد الإلكتروني:
                          </span>{" "}
                          {dispute.userEmail}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">رقم الهاتف:</span>{" "}
                          {dispute.userPhone}
                        </p>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-[#2D3142] mb-3">
                        معلومات البائع
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">الاسم:</span>{" "}
                          {dispute.sellerName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">
                            البريد الإلكتروني:
                          </span>{" "}
                          {dispute.sellerEmail}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">رقم الهاتف:</span>{" "}
                          {dispute.sellerPhone}
                        </p>
                      </div>
                    </div>

                    {/* Dispute Details */}
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-[#2D3142] mb-3">
                        تفاصيل النزاع
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">السبب:</span>{" "}
                            {dispute.reason}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">المبلغ:</span>{" "}
                            {dispute.amount} جنيه
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">تاريخ المزاد:</span>{" "}
                            {formatDate(dispute.auctionEndDate)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">قيمة المزاد:</span>{" "}
                            {dispute.auctionPrice} جنيه
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">تاريخ النزاع:</span>{" "}
                            {formatDate(dispute.createdAt)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">آخر تحديث:</span>{" "}
                            {formatDate(
                              dispute.lastUpdated || dispute.createdAt
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleDisputeExpansion(dispute.id)}
                      className="text-[#FA6300] hover:text-[#e55a00] text-sm font-medium"
                    >
                      {expandedDisputes.has(dispute.id)
                        ? "إخفاء التفاصيل"
                        : "عرض التفاصيل"}
                    </button>

                    <div className="flex gap-2">
                      {dispute.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleEscalate(dispute.id)}
                            className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <FaArrowUp className="w-4 h-4" />
                            تصعيد
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(dispute.id, "resolved")
                            }
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            حل النزاع
                          </button>
                        </>
                      )}
                      {dispute.status === "escalated" && (
                        <button
                          onClick={() =>
                            handleStatusChange(dispute.id, "resolved")
                          }
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          حل النزاع
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedDisputes.has(dispute.id) && (
                    <div className="mt-4 border-t pt-4">
                      <div className="mb-4">
                        <h4 className="font-medium text-[#2D3142] mb-2">
                          تفاصيل النزاع
                        </h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {dispute.description}
                        </p>
                      </div>
                      {renderTimeline(dispute.timeline)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                السابق
              </button>
              <span className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          {/* Settings Form */}
          <div className="flex items-center justify-between">
            <label className="text-[#2D3142] font-medium">
              تفعيل نظام النزاعات
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) =>
                  setSettings({ ...settings, enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FA6300]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#2D3142] font-medium mb-2">
                وقت الاستجابة المستهدف (بالساعات)
              </label>
              <input
                type="number"
                min="1"
                value={settings.slaHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    slaHours: Number(e.target.value),
                  })
                }
                className="w-full border border-[#E5E7EB] rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-[#2D3142] font-medium mb-2">
                أيام التصعيد
              </label>
              <input
                type="number"
                min="1"
                value={settings.escalationDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    escalationDays: Number(e.target.value),
                  })
                }
                className="w-full border border-[#E5E7EB] rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-[#2D3142] font-medium mb-2">
                الإغلاق التلقائي بعد (أيام)
              </label>
              <input
                type="number"
                min="1"
                value={settings.autoCloseAfterDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoCloseAfterDays: Number(e.target.value),
                  })
                }
                className="w-full border border-[#E5E7EB] rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-[#2D3142] font-medium mb-2">
                الحد الأدنى لمبلغ النزاع (جنيه)
              </label>
              <input
                type="number"
                min="0"
                value={settings.minDisputeAmount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minDisputeAmount: Number(e.target.value),
                  })
                }
                className="w-full border border-[#E5E7EB] rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#2D3142] font-medium mb-2">
              أسباب النزاع المسموح بها
            </label>
            <div className="space-y-2">
              {settings.allowedReasons.map((reason, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => {
                      const newReasons = [...settings.allowedReasons];
                      newReasons[index] = e.target.value;
                      setSettings({ ...settings, allowedReasons: newReasons });
                    }}
                    className="flex-1 border border-[#E5E7EB] rounded-lg p-2"
                    placeholder="أدخل سبب النزاع"
                  />
                  <button
                    onClick={() => {
                      const newReasons = settings.allowedReasons.filter(
                        (_, i) => i !== index
                      );
                      setSettings({ ...settings, allowedReasons: newReasons });
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    حذف
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    allowedReasons: [...settings.allowedReasons, ""],
                  })
                }
                className="text-[#FA6300] hover:bg-orange-50 px-4 py-2 rounded-lg"
              >
                + إضافة سبب جديد
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#2D3142] font-medium mb-2">
              البريد الإلكتروني للإشعارات (مفصولة بفواصل)
            </label>
            <textarea
              value={settings.notifyEmails.join(", ")}
              onChange={(e) => {
                const emails = e.target.value
                  .split(",")
                  .map((email) => email.trim())
                  .filter(Boolean);
                setSettings({ ...settings, notifyEmails: emails });
              }}
              className="w-full border border-[#E5E7EB] rounded-lg p-2 h-20"
              placeholder="example1@domain.com, example2@domain.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-[#2D3142] font-medium mb-2">
              البريد الإلكتروني للتصعيد (مفصولة بفواصل)
            </label>
            <textarea
              value={settings.escalationEmails.join(", ")}
              onChange={(e) => {
                const emails = e.target.value
                  .split(",")
                  .map((email) => email.trim())
                  .filter(Boolean);
                setSettings({ ...settings, escalationEmails: emails });
              }}
              className="w-full border border-[#E5E7EB] rounded-lg p-2 h-20"
              placeholder="manager@domain.com, supervisor@domain.com"
              dir="ltr"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-white font-semibold ${
                saving ? "bg-[#f7a46e]" : "bg-[#FA6300] hover:bg-[#e55a00]"
              }`}
            >
              {saving ? "جارِ الحفظ..." : "حفظ الإعدادات"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeManagement;

