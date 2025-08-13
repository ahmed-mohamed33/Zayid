import React, { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import notificationIcon from "../../assets/icons/notification.svg";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    permissionStatus,
    hasNewNotifications,
    markAsRead,
    removeNotification,
    markAllAsRead,
    retryInitialization,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Winner payment deep link first
    if (
      notification.data?.auctionId &&
      notification.data?.action === "pay_winner"
    ) {
      navigate(`/payment/${notification.data.auctionId}/winner`);
      return;
    }

    // Default: go to auction
    if (notification.data?.auctionId) {
      navigate(`/auction/${notification.data.auctionId}`);
      return;
    }

    setIsOpen(false);
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ar,
      });
    } catch (error) {
      return "منذ لحظات";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "outbid":
        return "🔔";
      case "auction_started":
        return "🚀";
      case "auction_ended":
        return "🏁";
      case "new_auction_approved":
        return "🎯";
      case "auction_participant_auction_started":
        return "🚀";
      case "auction_participant_auction_ending_soon":
        return "⏰";
      case "auction_participant_new_bid":
        return "💰";
      case "auction_participant_auction_reminder":
        return "🔔";
      case "auction_participant_auction_ended":
        return "🏁";
      case "payment":
        return "💳";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "outbid":
        return "text-red-600";
      case "auction_started":
        return "text-green-600";
      case "auction_ended":
        return "text-blue-600";
      case "new_auction_approved":
        return "text-orange-600";
      case "auction_participant_auction_started":
        return "text-green-600";
      case "auction_participant_auction_ending_soon":
        return "text-yellow-600";
      case "auction_participant_new_bid":
        return "text-emerald-600";
      case "auction_participant_auction_reminder":
        return "text-orange-600";
      case "auction_participant_auction_ended":
        return "text-blue-600";
      case "payment":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  if (permissionStatus.status === "denied") {
    return (
      <div className="relative">
        <button
          onClick={() => retryInitialization()}
          className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors"
          title="تفعيل الإشعارات"
        >
          <img src={notificationIcon} alt="إشعارات" className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            !
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:text-orange-500 transition-colors ${
          hasNewNotifications ? "animate-pulse" : ""
        }`}
        title="الإشعارات"
      >
        <img src={notificationIcon} alt="إشعارات" className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">الإشعارات</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                جاري التحميل...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                لا توجد إشعارات
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-orange-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) =>
                            handleDeleteNotification(e, notification.id)
                          }
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.body}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationDropdown;