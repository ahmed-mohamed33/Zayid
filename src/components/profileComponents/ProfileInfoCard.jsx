import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from './../../context/UserContext';

export default function ProfileInfoCard() {
  const inputRef = useRef();
  const [loading, setLoading] = useState(true);
  const {
    userData,
    user,
    setUserData,
    updateUserData,
    updateUserDataInProfile,
  } = useContext(UserContext);

  useEffect(() => {
    if (user && userData) {
      setLoading(false);
      }
  }, [user, userData]);

  if (!user || !userData) return null;

  const uploadProfileImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'profile_pictures');
    formData.append('cloud_name', 'dtdqcxn9c');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/dtdqcxn9c/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

      const imageUrl = await uploadProfileImageToCloudinary(file);

      await updateUserDataInProfile(user.uid, {
        profileImage: imageUrl,
      });

      setUserData((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));

      alert(' تم تحديث صورة البروفايل بنجاح');
    } catch (error) {
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-6">
          {/* الصورة */}
          {loading ? (
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
          ) : userData?.profileImage ? (
            <img
              className="w-24 h-24 rounded-full border-4 border-[#F3F4F6] object-cover"
              src={userData.profileImage}
              alt="Profile"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-[#F3F4F6] bg-gray-300 text-gray-700 flex items-center justify-center text-2xl font-bold">
              {userData?.fullName
                ?.trim()
                ?.split(' ')
                ?.map((word) => word[0])
                ?.slice(0, 2)
                ?.join('')
                ?.toUpperCase() || '؟'}
            </div>
          )}

          {/* البيانات */}
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {loading ? (
                <div className="w-40 h-5 bg-gray-200 rounded animate-pulse" />
              ) : (
                userData?.fullName
              )}
            </h1>

            <div className="flex items-center gap-2 mb-1">
              {loading ? (
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              ) : userData?.isVerified ? (
                <>
                  <span className="text-green-600 text-sm font-medium">
                    موثق
                  </span>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#22C55E" />
                    <path
                      d="M8 12.5l2.5 2.5L16 9.5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              ) : (
                <span className="text-gray-400 text-sm font-medium">
                  غير موثق
                </span>
              )}
            </div>

            <h5 className="text-gray-500 text-base">
              {loading ? (
                <div className="w-52 h-4 bg-gray-200 rounded animate-pulse" />
              ) : (
                userData?.email
              )}
            </h5>
          </div>
        </div>

        <div>
          {/* زر تعديل الصورة */}
          <button
            onClick={() => inputRef.current.click()}
            className={`flex items-center gap-2 mb-12 bg-[#FA6300] hover:bg-[#e65a00] text-white px-6 py-2 rounded-lg font-semibold text-base transition ${
              loading && 'opacity-50 pointer-events-none'
            }`}
          >
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
            تعديل الصورة
          </button>

          {/* الإنبوت المخفي */}
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>
    </>
  );
}

