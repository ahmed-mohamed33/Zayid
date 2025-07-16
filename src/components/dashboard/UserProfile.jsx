import React, { useState } from 'react';
import { getDatabase, ref, update, remove } from 'firebase/database';
import Popup from './Pop';

// const avatarPlaceholder = 'https://ui-avatars.com/api/?name=User&background=FA6300&color=fff&size=128';

const UserProfile = ({ user, onBack }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, type: '', message: '', onConfirm: null });
  const [localUser, setLocalUser] = useState(user); // Add local user state
  const db = getDatabase();

  const showPopup = (type, message, onConfirm = null) => {
    setPopup({ open: true, type, message, onConfirm });
  };
  const closePopup = () => setPopup({ open: false, type: '', message: '', onConfirm: null });

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await update(ref(db, `users/${user.id}`), { isActive: true });
      setLocalUser({ ...localUser, isActive: true }); // Update local state
      showPopup('info', 'تم تفعيل المستخدم بنجاح', () => {
        closePopup();
      });
    } catch {
      showPopup('error', 'حدث خطأ أثناء التفعيل');
    }
    setActionLoading(false);
  };

  const handleBlock = async () => {
    setActionLoading(true);
    try {
      await update(ref(db, `users/${user.id}`), { isActive: false });
      setLocalUser({ ...localUser, isActive: false }); // Update local state
      showPopup('info', 'تم حظر المستخدم', () => {
        closePopup();
      });
    } catch {
      showPopup('error', 'حدث خطأ أثناء الحظر');
    }
    setActionLoading(false);
  };

  const handleRemove = () => {
    showPopup('confirm', 'هل أنت متأكد من حذف هذا المستخدم؟', async () => {
      setActionLoading(true);
      try {
        await remove(ref(db, `users/${user.id}`));
        closePopup();
        showPopup('info', 'تم حذف المستخدم', () => {
          closePopup();
          onBack();
          
        });
      } catch {
        showPopup('error', 'حدث خطأ أثناء الحذف');
      }
      setActionLoading(false);
    });
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 mb-8 max-w-2xl mx-auto relative 
      md:max-h-[90vh] md:overflow-y-auto md:scrollbar-thin md:scrollbar-thumb-orange-200 md:scrollbar-track-gray-100">
      <button onClick={onBack} className="absolute left-6 top-6 text-orange-600 hover:underline flex items-center gap-1">
        <span className="text-xl">←</span>
        <span className="hidden md:inline">رجوع</span>
      </button>
      <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
        <div className="flex flex-col items-center">
          <img
            src={localUser.photoURL || 'https://ui-avatars.com/api/?name=User&background=FA6300&color=fff&size=128'}
            alt="User Avatar"
            className="w-32 h-32 rounded-full border-4 border-orange-200 object-cover shadow mb-2"
          />
          <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${localUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{localUser.isActive ? 'مفعل' : 'غير مفعل'}</span>
        </div>
        <div className="flex-1 grid grid-cols-1 gap-3 text-right">
          <div><span className="font-semibold text-gray-600">الاسم الكامل:</span> {localUser.fullName || 'غير محدد'}</div>
          <div><span className="font-semibold text-gray-600">البريد الإلكتروني:</span> {localUser.email || 'غير محدد'}</div>
          <div><span className="font-semibold text-gray-600">رقم الهاتف:</span> {localUser.phone || 'غير محدد'}</div>
          <div><span className="font-semibold text-gray-600">الرقم القومي:</span> {localUser.nationalID || 'غير محدد'}</div>
          <div><span className="font-semibold text-gray-600">نوع المستخدم:</span> {localUser.isCompany ? 'شركة' : 'فرد'}</div>
          <div><span className="font-semibold text-gray-600">تاريخ التسجيل:</span> {localUser.createdAt ? new Date(localUser.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}</div>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-1">الوثائق والمستندات</h3>
        <div className="flex flex-wrap gap-8 items-center">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-600 mb-1">صورة الهوية</span>
            <img
              src={localUser.nationalIDImage || ''}
              alt="ID Document"
              className="w-44 h-28 rounded border object-cover shadow"
            />
          </div>
         
        </div>
      </div>
      <div className="flex gap-4 justify-end mt-6">
        <button
          onClick={localUser.isActive ? handleBlock : handleApprove}
          disabled={actionLoading}
          className={localUser.isActive
            ? "bg-yellow-500 text-white px-5 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 shadow"
            : "bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 disabled:opacity-50 shadow"
          }
        >
          {localUser.isActive ? 'حظر' : 'تفعيل'}
        </button>
        <button
          onClick={handleRemove}
          disabled={actionLoading}
          className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 disabled:opacity-50 shadow"
        >
          حذف
        </button>
      </div>
      <Popup
        isOpen={popup.open}
        onClose={() => {
          closePopup();
          if (popup.type === 'info' && typeof popup.onConfirm === 'function') {
            popup.onConfirm();
          }
        }}
        title={popup.type === 'confirm' ? 'تأكيد' : popup.type === 'error' ? 'خطأ' : 'تنبيه'}
        onConfirm={popup.type === 'confirm' ? popup.onConfirm : undefined}
        confirmText={popup.type === 'confirm' ? 'نعم، حذف' : undefined}
        cancelText={popup.type === 'confirm' ? 'إلغاء' : undefined}
      >
        {popup.message}
      </Popup>
    </div>
  );
};

export default UserProfile;
