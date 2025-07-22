import React from 'react';

const Popup = ({ isOpen, onClose, title, children, onConfirm, confirmText = 'تأكيد', cancelText = 'إلغاء' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]">
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          {onConfirm ? (
            <>
              <button
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                onClick={onClose}
              >
                {cancelText}
              </button>
              <button
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              onClick={onClose}
            >
              إغلاق
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup; 