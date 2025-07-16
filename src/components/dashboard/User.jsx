import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import UserProfile from './UserProfile';

export default function User() {
  const { loading } = useContext(UserContext);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const usersArray = Object.entries(data).map(([id, userData]) => ({
            id,
            ...userData,
          }));
          setAllUsers(usersArray);
        } else {
          setAllUsers([]);
        }
        setUsersLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setAllUsers([]);
        setUsersLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading || usersLoading) {
    return <div>Loading...</div>;
  }

  if (selectedUser) {
    return <UserProfile user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  if (!allUsers || allUsers.length === 0) {
    return <div>No users found.</div>;
  }

  const filteredUsers = showPendingOnly ? allUsers.filter(u => !u.isActive) : allUsers;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">جميع المستخدمين</h2>
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${showPendingOnly ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setShowPendingOnly(v => !v)}
        >
          {showPendingOnly ? 'عرض الكل' : 'عرض المستخدمين المعلقين'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم الكامل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الهاتف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرقم القومي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع المستخدم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.fullName || 'غير محدد'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email || 'غير محدد'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || 'غير محدد'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.nationalID || 'غير محدد'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.isCompany ? 'شركة' : 'فرد'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'مفعل' : 'غير مفعل'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
  );
}