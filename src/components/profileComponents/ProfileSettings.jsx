import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import users from '../../assets/icons/profile.svg';
import { UserContext } from '../../context/UserContext';

import { EmailAuthProvider } from 'firebase/auth/web-extension';
import { auth } from '../../config/Firebase';
import {
  deleteUser,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { deleteDoc, doc } from 'firebase/firestore';
import { ref, remove } from 'firebase/database';

import ProfileInfoCard from './../profileComponents/ProfileInfoCard';
import DeleteAccountSection from './../profileComponents/DeleteAccountSection';

const Settings = () => {
  const { userData } = useContext(UserContext);
  // بيانات المستخدم
  const userInfo = userData;
  const user = auth.currentUser;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [notifications, setNotifications] = useState({
    email: true,
    auctions: true,
  });

  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'كلمتا المرور غير متطابقتين',
      }));
    } else {
      setErrors((prev) => {
        const { confirmPassword, ...rest } = prev;
        return rest;
      });
    }
  }, [newPassword, confirmPassword]);

  const handleUpdatePassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('من فضلك املأ كل الحقول');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    try {
      setIsUpdating(true);

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setSuccessMessage('تم تحديث كلمة المرور بنجاح ');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/invalid-credential') {
        setErrorMessage('كلمة المرور الحالية غير صحيحة');
      } else {
        setErrorMessage('حدث خطأ أثناء التحديث. حاول مرة أخرى.');
      }
    } finally {
      setIsUpdating(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  // function to delete the account
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;

    if (!user) return;

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      await deleteDoc(doc(db, 'users', user.uid));

      await remove(ref(rtdb, `users/${user.uid}`));

      await deleteUser(user);

      console.log('تم حذف الحساب وكل البيانات بنجاح.');
      // redirect to homepage or show confirmation
    } catch (error) {
      console.error('خطأ أثناء حذف الحساب:', error);
    }
  };

  return (
    <div className="flex justify-center w-full min-h-screen bg-[#F6F6F6] ">
      <div className="flex flex-col gap-8 w-full ">
        {/* Profile Info Card */}
        <ProfileInfoCard />

        {/* Account Info Card */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-10">
          <h2 className="text-xl font-bold mb-8 text-right">معلومات الحساب</h2>
          {/* update password */}
          <form className="flex flex-col gap-5 text-right">
            <label className="font-medium">
              البريد الإلكتروني
              <input
                type="email"
                className="block w-full mt-2 border border-[#E5E7EB] rounded-lg px-4 py-2 bg-[#F6F6F6]"
                value={userInfo?.email || ''}
                readOnly
              />
            </label>

            <label className="font-medium">
              رقم الهاتف
              <input
                type="text"
                className="block w-full mt-2 border border-[#E5E7EB] rounded-lg px-4 py-2 bg-[#F6F6F6]"
                defaultValue={userInfo?.phone || ''}
                readOnly
              />
            </label>

            {/* كلمة المرور الحالية */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                كلمة المرور الحالية
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                />
                <div
                  onClick={() => setShowCurrent((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
                >
                  {showCurrent ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </div>
              </div>
            </div>

            {/* كلمة المرور الجديدة */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                />
                <div
                  onClick={() => setShowNew((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
                >
                  {showNew ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </div>
              </div>
            </div>

            {/* تأكيد كلمة المرور */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                />
                <div
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-600"
                >
                  {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* زر التحديث */}
            <button
              onClick={(e) => {
                e.preventDefault(); // تمنع الريفريش
                handleUpdatePassword();
              }}
              disabled={isUpdating}
              className={`w-full py-2 mt-4 rounded-lg text-white transition-all ${
                isUpdating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isUpdating ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
            </button>

            {/* رسائل التنبيه */}
            {successMessage && (
              <p className="text-green-600 text-sm mt-2 text-center">
                {successMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-red-600 text-sm mt-2 text-center">
                {errorMessage}
              </p>
            )}
          </form>
          {/* notifcation */}
          <div className="mt-10">
            <h3 className="font-bold mb-3">الإشعارات</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() =>
                    setNotifications((n) => ({ ...n, email: !n.email }))
                  }
                  className="accent-[#FA6300] w-5 h-5"
                />
                <span className="text-right">
                  التنبيهات عبر البريد الإلكتروني
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.auctions}
                  onChange={() =>
                    setNotifications((n) => ({ ...n, auctions: !n.auctions }))
                  }
                  className="accent-[#FA6300] w-5 h-5"
                />
                <span className="text-right">تنبيهات المزادات الجديدة</span>
              </label>
            </div>
            <button className="flex items-center gap-2 bg-[#FA6300] hover:bg-[#e65a00] text-white px-7 py-2 rounded-lg font-semibold text-base transition self-end mt-5">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 20h9"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </svg>
              حفظ الإشعارات
            </button>
          </div>
          <div className="bg-red-100 p-4 rounded-md mt-10">
            <h3 className="text-red-700 font-bold mb-2">حذف الحساب</h3>
            <p className="text-sm text-red-600 mb-4">
              سيتم حذف حسابك بشكل نهائي ولا يمكن استرجاعه.
            </p>

            <button
              onClick={() => setShowDeletePopup(true)}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              حذف الحساب نهائيًا
            </button>
          </div>

          {/* المكون اللي بيظهر كـ Popup لما يضغط الزر */}
          {showDeletePopup && (
            <div className="fixed inset-0  backdrop-blur-xs flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
                <DeleteAccountSection
                  onClose={() => setShowDeletePopup(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;