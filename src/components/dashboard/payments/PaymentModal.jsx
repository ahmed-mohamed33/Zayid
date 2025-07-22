import React, { memo, useState } from "react";
import {
  FaTimes,
  FaCheck,
  FaUndo,
  FaEdit,
  FaUser,
  FaCreditCard,
  FaCalendar,
  FaDollarSign,
  FaFileAlt,
  FaExclamationTriangle,
  FaHistory,
  FaCopy,
  FaExternalLinkAlt,
} from "react-icons/fa";

const PaymentModal = memo(({ payment, onClose, onAction }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [actionForm, setActionForm] = useState({
    status: payment.status || "pending",
    note: "",
    refundAmount: payment.amount || 0,
    refundReason: "",
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "غير محدد";
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      paid: {
        color: "text-green-600 bg-green-100",
        text: "مدفوع",
        icon: FaCheck,
      },
      pending: {
        color: "text-yellow-600 bg-yellow-100",
        text: "معلق",
        icon: null,
      },
      failed: {
        color: "text-red-600 bg-red-100",
        text: "فشل",
        icon: FaExclamationTriangle,
      },
      refunded: {
        color: "text-blue-600 bg-blue-100",
        text: "مسترد",
        icon: FaUndo,
      },
      cancelled: {
        color: "text-gray-600 bg-gray-100",
        text: "ملغي",
        icon: FaTimes,
      },
    };
    return (
      statusConfig[status] || {
        color: "text-gray-600 bg-gray-100",
        text: status,
      }
    );
  };

  const getMethodInfo = (method) => {
    const methodConfig = {
      vodafone: { name: "فودافون كاش", color: "text-red-600" },
      card: { name: "بطاقة ائتمان", color: "text-blue-600" },
      visa: { name: "فيزا", color: "text-blue-600" },
      mastercard: { name: "ماستركارد", color: "text-orange-600" },
      bank: { name: "تحويل بنكي", color: "text-green-600" },
      cash: { name: "نقدي", color: "text-gray-600" },
    };
    return (
      methodConfig[method] || {
        name: method || "غير محدد",
        color: "text-gray-600",
      }
    );
  };

  const getTypeInfo = (type) => {
    const typeConfig = {
      insurance: {
        name: "تأمين",
        description: "رسوم تأمين للمشاركة في المزاد",
      },
      shroot: {
        name: "كراسة شروط",
        description: "رسوم شراء كراسة الشروط والأحكام",
      },
      auction: { name: "مزاد", description: "مدفوعة متعلقة بالمزاد" },
      subscription: { name: "اشتراك", description: "رسوم اشتراك في الخدمة" },
      fee: { name: "رسوم", description: "رسوم إضافية" },
    };
    return typeConfig[type] || { name: type || "غير محدد", description: "" };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
    });
  };

  const handleAction = (actionType) => {
    const data = {
      status: actionForm.status,
      note: actionForm.note,
      refundAmount: actionForm.refundAmount,
      refundReason: actionForm.refundReason,
    };
    onAction(actionType, payment.id, data);
  };

  const statusInfo = getStatusInfo(payment.status);
  const methodInfo = getMethodInfo(payment.method);
  const typeInfo = getTypeInfo(payment.type);
  const StatusIcon = statusInfo.icon;

  const tabs = [
    { id: "details", name: "التفاصيل", icon: FaFileAlt },
    { id: "actions", name: "الإجراءات", icon: FaEdit },
    { id: "history", name: "السجل", icon: FaHistory },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${statusInfo.color}`}>
              {StatusIcon ? (
                <StatusIcon className="w-6 h-6" />
              ) : (
                <FaDollarSign className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                مدفوعة #{payment.id?.substring(0, 8)}
              </h2>
              <p className="text-gray-600">
                {formatCurrency(payment.amount)} - {statusInfo.text}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    معلومات الدفع
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">رقم المدفوعة:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{payment.id}</span>
                        <button
                          onClick={() => copyToClipboard(payment.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FaCopy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {payment.transactionId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">معرف المعاملة:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {payment.transactionId}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(payment.transactionId)
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <FaCopy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">المبلغ:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>

                    {payment.fee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">الرسوم:</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(payment.fee)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">النوع:</span>
                      <div className="text-right">
                        <div className="font-medium">{typeInfo.name}</div>
                        {typeInfo.description && (
                          <div className="text-xs text-gray-500">
                            {typeInfo.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">طريقة الدفع:</span>
                      <span className={`font-medium ${methodInfo.color}`}>
                        {methodInfo.name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    التواريخ والأوقات
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الإنشاء:</span>
                      <span>
                        {formatDate(payment.createdAt || payment.timestamp)}
                      </span>
                    </div>

                    {payment.processedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ المعالجة:</span>
                        <span>{formatDate(payment.processedAt)}</span>
                      </div>
                    )}

                    {payment.updatedAt &&
                      payment.updatedAt !== payment.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">آخر تحديث:</span>
                          <span>{formatDate(payment.updatedAt)}</span>
                        </div>
                      )}

                    {payment.refundedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ الاسترداد:</span>
                        <span>{formatDate(payment.refundedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaUser className="w-4 h-4" />
                  معلومات المستخدم
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">الاسم الكامل:</span>
                    <div className="text-sm font-medium">
                      {payment.userName}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">
                      البريد الإلكتروني:
                    </span>
                    <div className="text-sm">{payment.userEmail}</div>
                  </div>

                  {payment.userPhone && (
                    <div>
                      <span className="text-sm text-gray-600">رقم الهاتف:</span>
                      <div className="text-sm">{payment.userPhone}</div>
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-gray-600">نوع المستخدم:</span>
                    <div className="text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.userType === "شركة"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {payment.userType || "فرد"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">
                      حالة المستخدم:
                    </span>
                    <div className="text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.userStatus === "نشط"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.userStatus || "غير محدد"}
                      </span>
                    </div>
                  </div>

                  {payment.userId && (
                    <div>
                      <span className="text-sm text-gray-600">
                        معرف المستخدم:
                      </span>
                      <div className="font-mono text-xs text-gray-500">
                        {payment.userId}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Auction Info */}
              {payment.auctionTitle && payment.auctionTitle !== "غير محدد" && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaExternalLinkAlt className="w-4 h-4" />
                    تفاصيل المزاد المرتبط
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">اسم المزاد:</span>
                      <div className="text-sm font-medium">
                        {payment.auctionTitle}
                      </div>
                    </div>

                    {payment.auctionCategory && (
                      <div>
                        <span className="text-sm text-gray-600">الفئة:</span>
                        <div className="text-sm">{payment.auctionCategory}</div>
                      </div>
                    )}

                    {payment.auctionStartPrice && (
                      <div>
                        <span className="text-sm text-gray-600">
                          السعر الابتدائي:
                        </span>
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(payment.auctionStartPrice)}
                        </div>
                      </div>
                    )}

                    {payment.auctionStatus && (
                      <div>
                        <span className="text-sm text-gray-600">
                          حالة المزاد:
                        </span>
                        <div className="text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              payment.auctionStatus === "active"
                                ? "bg-green-100 text-green-800"
                                : payment.auctionStatus === "ended"
                                ? "bg-gray-100 text-gray-800"
                                : payment.auctionStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {payment.auctionStatus === "active"
                              ? "نشط"
                              : payment.auctionStatus === "ended"
                              ? "منتهي"
                              : payment.auctionStatus === "pending"
                              ? "معلق"
                              : payment.auctionStatus}
                          </span>
                        </div>
                      </div>
                    )}

                    {payment.auctionEndDate && (
                      <div>
                        <span className="text-sm text-gray-600">
                          تاريخ انتهاء المزاد:
                        </span>
                        <div className="text-sm">
                          {formatDate(payment.auctionEndDate)}
                        </div>
                      </div>
                    )}

                    {payment.auctionId && (
                      <div>
                        <span className="text-sm text-gray-600">
                          معرف المزاد:
                        </span>
                        <div className="font-mono text-xs text-gray-500">
                          {payment.auctionId}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Auction Images */}
                  {payment.auctionImages &&
                    payment.auctionImages.length > 0 && (
                      <div className="mt-4">
                        <span className="text-sm text-gray-600 block mb-2">
                          صور المزاد:
                        </span>
                        <div className="flex gap-2 overflow-x-auto">
                          {payment.auctionImages
                            .slice(0, 3)
                            .map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`صورة المزاد ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ))}
                          {payment.auctionImages.length > 3 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                +{payment.auctionImages.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Additional Info */}
              {(payment.auctionId ||
                payment.description ||
                payment.metadata) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    معلومات إضافية
                  </h3>

                  <div className="space-y-3">
                    {payment.auctionId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">معرف المزاد:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {payment.auctionId}
                          </span>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <FaExternalLinkAlt className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )}

                    {payment.description && (
                      <div>
                        <span className="text-gray-600">الوصف:</span>
                        <div className="mt-1 text-sm bg-white p-3 rounded border">
                          {payment.description}
                        </div>
                      </div>
                    )}

                    {payment.metadata &&
                      typeof payment.metadata === "object" && (
                        <div>
                          <span className="text-gray-600">بيانات إضافية:</span>
                          <div className="mt-1 text-xs bg-white p-3 rounded border font-mono">
                            <pre>
                              {JSON.stringify(payment.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === "actions" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span className="font-medium">تنبيه</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  تأكد من صحة البيانات قبل تنفيذ أي إجراء. بعض الإجراءات لا يمكن
                  التراجع عنها.
                </p>
              </div>

              {/* Status Update */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  تحديث الحالة
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحالة الجديدة
                    </label>
                    <select
                      value={actionForm.status}
                      onChange={(e) =>
                        setActionForm({ ...actionForm, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="pending">معلق</option>
                      <option value="paid">مدفوع</option>
                      <option value="failed">فشل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملاحظة (اختيارية)
                    </label>
                    <textarea
                      value={actionForm.note}
                      onChange={(e) =>
                        setActionForm({ ...actionForm, note: e.target.value })
                      }
                      rows={3}
                      placeholder="أضف ملاحظة حول سبب تغيير الحالة..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={() => handleAction("updateStatus")}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    تحديث الحالة
                  </button>
                </div>
              </div>

              {/* Verification */}
              {payment.status === "pending" && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaCheck className="w-5 h-5 text-green-500" />
                    تأكيد الدفع
                  </h3>

                  <p className="text-gray-600 mb-4">
                    تأكيد أن المدفوعة تمت بنجاح وتغيير حالتها إلى "مدفوع".
                  </p>

                  <button
                    onClick={() => handleAction("verify")}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    تأكيد الدفع
                  </button>
                </div>
              )}

              {/* Refund */}
              {payment.status === "paid" && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUndo className="w-5 h-5 text-blue-500" />
                    استرداد المبلغ
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        مبلغ الاسترداد
                      </label>
                      <input
                        type="number"
                        value={actionForm.refundAmount}
                        onChange={(e) =>
                          setActionForm({
                            ...actionForm,
                            refundAmount: e.target.value,
                          })
                        }
                        max={payment.amount}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        الحد الأقصى: {formatCurrency(payment.amount)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        سبب الاسترداد
                      </label>
                      <textarea
                        value={actionForm.refundReason}
                        onChange={(e) =>
                          setActionForm({
                            ...actionForm,
                            refundReason: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="اذكر سبب الاسترداد..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <button
                      onClick={() => handleAction("refund")}
                      disabled={!actionForm.refundReason.trim()}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      استرداد {formatCurrency(actionForm.refundAmount)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                سجل العمليات
              </h3>

              <div className="space-y-4">
                {/* Creation */}
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaDollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">
                      تم إنشاء المدفوعة
                    </p>
                    <p className="text-sm text-blue-600">
                      {formatDate(payment.createdAt || payment.timestamp)}
                    </p>
                    <p className="text-sm text-blue-700">
                      المبلغ: {formatCurrency(payment.amount)} - {typeInfo.name}
                    </p>
                  </div>
                </div>

                {/* Processing */}
                {payment.processedAt && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <FaEdit className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-yellow-800">
                        تمت معالجة المدفوعة
                      </p>
                      <p className="text-sm text-yellow-600">
                        {formatDate(payment.processedAt)}
                      </p>
                      {payment.processedBy && (
                        <p className="text-sm text-yellow-700">
                          بواسطة: {payment.processedBy}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Status changes */}
                {payment.status === "paid" && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">
                        تم تأكيد الدفع
                      </p>
                      <p className="text-sm text-green-600">
                        {formatDate(payment.paidAt || payment.processedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {payment.status === "refunded" && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <FaUndo className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">
                        تم استرداد المبلغ
                      </p>
                      <p className="text-sm text-blue-600">
                        {formatDate(payment.refundedAt)}
                      </p>
                      {payment.refundAmount && (
                        <p className="text-sm text-blue-700">
                          المبلغ المسترد: {formatCurrency(payment.refundAmount)}
                        </p>
                      )}
                      {payment.refundReason && (
                        <p className="text-sm text-blue-700">
                          السبب: {payment.refundReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {payment.status === "failed" && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <FaTimes className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-red-800">فشلت المدفوعة</p>
                      <p className="text-sm text-red-600">
                        {formatDate(payment.failedAt || payment.updatedAt)}
                      </p>
                      {payment.failureReason && (
                        <p className="text-sm text-red-700">
                          السبب: {payment.failureReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {payment.notes && payment.notes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-800">الملاحظات:</h4>
                    {payment.notes.map((note, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                          <FaFileAlt className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">
                            {note.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(note.createdAt)}{" "}
                            {note.createdBy && `- ${note.createdBy}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
});

PaymentModal.displayName = "PaymentModal";

export default PaymentModal;
