import { ref, set } from 'firebase/database';

import { v4 as uuidv4 } from 'uuid';
import { auth, database } from '../config/Firebase';

export const addMockActivity = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('❌ لم يتم تسجيل الدخول');
    return;
  }

  const userId = user.uid;

  // ID عشوائي للدفع
  const paymentId1 = uuidv4();
  const paymentId2 = uuidv4();

  // ID لمزاد موجود فعليًا عندك
  const auctionId = '03bebf61-d75a-4d61-8041-a1c079d27696';

  try {
    await set(ref(database, `payments/${paymentId1}`), {
      userId,
      auctionId,
      type: 'shroot', // كراسة الشروط
      timestamp: new Date().toISOString(),
    });

    await set(ref(database, `payments/${paymentId2}`), {
      userId,
      auctionId,
      type: 'insurance', // التأمين
      timestamp: new Date().toISOString(),
    });

    console.log('✅ تم إدخال بيانات تجريبية للنشاطات بنجاح');
  } catch (error) {
    console.error('❌ Error adding mock activity:', error);
  }
};
