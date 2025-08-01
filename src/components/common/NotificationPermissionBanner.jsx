import React, { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { getNotificationInstructions } from "../../utils/notificationService";

const NotificationPermissionBanner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    permissionStatus,
    initializationError,
    errorMessage,
    needsManualReset,
    retryInitialization,
  } = useNotifications();


  if (permissionStatus.status === "granted" && !initializationError) {
    return null;
  }


  if (permissionStatus.status === "unsupported") {
    return null;
  }

  const getMessageContent = () => {
    if (needsManualReset) {
      const instructions = getNotificationInstructions();
      return {
        type: "error",
        title: "إشعارات محظورة",
        message: `تم حظر الإشعارات في متصفح ${instructions.browser}. لتمكينها:`,
        instructions: instructions.steps,
        actionText: "أعد تحميل الصفحة",
        action: () => window.location.reload(),
      };
    }

    if (permissionStatus.status === "default") {
      return {
        type: "info",
        title: "تمكين الإشعارات",
        message: "للتأكد من عدم تفويت أي مزايدة، يرجى تمكين الإشعارات.",
        instructions: [],
        actionText: "تمكين الإشعارات",
        action: retryInitialization,
      };
    }

    if (initializationError === "SERVICE_WORKER_FAILED") {
      return {
        type: "warning",
        title: "مشكلة في خدمة الإشعارات",
        message: "حدث خطأ في تسجيل خدمة الإشعارات.",
        instructions: [],
        actionText: "إعادة المحاولة",
        action: retryInitialization,
      };
    }

    return {
      type: "info",
      title: "مشكلة في الإشعارات",
      message: errorMessage || "حدث خطأ في إعداد الإشعارات.",
      instructions: [],
      actionText: "إعادة المحاولة",
      action: retryInitialization,
    };
  };

  const content = getMessageContent();

  const getToggleButtonStyles = () => {
    const baseStyles =
      "fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg border-2 transition-all duration-200 hover:scale-110";

    switch (content.type) {
      case "error":
        return `${baseStyles} bg-red-500 border-red-600 text-white hover:bg-red-600`;
      case "warning":
        return `${baseStyles} bg-yellow-500 border-yellow-600 text-white hover:bg-yellow-600`;
      case "info":
      default:
        return `${baseStyles} bg-blue-500 border-blue-600 text-white hover:bg-blue-600`;
    }
  };

  const getMessageStyles = () => {
    const baseStyles =
      "fixed bottom-16 left-4 z-50 w-80 p-4 rounded-lg shadow-xl border-l-4 transition-all duration-300";

    switch (content.type) {
      case "error":
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case "warning":
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case "info":
      default:
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
    }
  };

  const getIcon = () => {
    switch (content.type) {
      case "error":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };


  return (
    <>
 
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={getToggleButtonStyles()}
        title="إعدادات الإشعارات"
      >
        <div className="relative">
          {getIcon()}
     
        </div>
      </button>


      {isOpen && (
        <div className={getMessageStyles()}>
          <div className="flex items-start">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="mr-3 flex-1">
              <h3 className="text-sm font-medium mb-1">{content.title}</h3>
              <p className="text-sm mb-2">{content.message}</p>

              {content.instructions.length > 0 && (
                <ol className="text-sm list-decimal list-inside space-y-1 mb-3">
                  {content.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    content.action();
                    setIsOpen(false);
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded-md ${
                    content.type === "error"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : content.type === "warning"
                      ? "bg-yellow-600 text-white hover:bg-yellow-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {content.actionText}
                </button>

                {!needsManualReset && (
                  <button
                    onClick={() => {
                      window.location.reload();
                      setIsOpen(false);
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    إعادة تحميل
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}


      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default NotificationPermissionBanner;
