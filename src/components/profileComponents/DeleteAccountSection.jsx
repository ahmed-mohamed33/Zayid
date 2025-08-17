import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';

import { auth } from './../../config/Firebase';

export default function DeleteAccountSection({ onClose }) {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);

      alert('تم حذف الحساب بنجاح');

      navigate('/login');
    } catch (err) {
      setError('كلمة المرور غير صحيحة.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-red-600 mb-4 text-right">
        تأكيد حذف الحساب
      </h2>
      <input
        type="password"
        placeholder="أدخل كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-4 rounded text-right"
      />
      {error && <p className="text-sm text-red-500 mb-2 text-right">{error}</p>}
      <div className="flex justify-between">
        <button
          onClick={handleDeleteAccount}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          حذف الحساب
        </button>
        <button
          onClick={onClose}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}

