import { messaging } from '../config/Firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { ref, set, get, push, update } from 'firebase/database';
import { database } from '../config/Firebase';


const FCM_CONFIG = {
    vapidKey: 'BFxskOBTpKt7ahmR0c_dSqkrCzs-Wz9zzjfVZgkWo4ox44_nIvU2dyl4Vds3byN1KNLa-unmUeB_WJZD7RSMESk', // get from Firebase Console
    fcmOptions: {
        apiKey: 'AIzaSyDT_A1OngbjNwJEOqHmepDjClNl4N2T6Sg',
        authDomain: 'zayid-itp25.firebaseapp.com',
        projectId: 'zayid-itp25',
        messagingSenderId: '802245016540',
    }
};


export const getPermissionStatus = () => {
    if (!('Notification' in window)) {
        return {
            status: 'unsupported',
            needsManualReset: false,
            message: 'Notifications are not supported in this browser'
        };
    }

    const permission = Notification.permission;

    return {
        status: permission,
        needsManualReset: permission === 'denied',
        message: permission === 'granted' ? 'Notifications are enabled' :
            permission === 'denied' ? 'Notifications are blocked' :
                'Notifications are not set'
    };
};


export const isPermissionBlocked = () => {
    return getPermissionStatus().status === 'denied';
};


export const initializeNotifications = async () => {
    try {

        if (!('Notification' in window)) {
            return {
                success: false,
                error: 'UNSUPPORTED_BROWSER',
                message: 'Notifications are not supported in this browser'
            };
        }


        if (!('serviceWorker' in navigator)) {
            return {
                success: false,
                error: 'SERVICE_WORKER_FAILED',
                message: 'Service Worker is not supported in this browser'
            };
        }


        const permissionStatus = getPermissionStatus();


        if (permissionStatus.status === 'granted') {
            const token = await getFCMToken();
            return {
                success: true,
                token: token,
                message: 'Notifications already enabled'
            };
        }


        if (permissionStatus.status === 'denied') {
            return {
                success: false,
                error: 'PERMISSION_BLOCKED',
                message: 'Notification permission is blocked. Please enable it in browser settings.'
            };
        }


        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            const token = await getFCMToken();
            return {
                success: true,
                token: token,
                message: 'Notification permission granted'
            };
        } else {
            return {
                success: false,
                error: 'PERMISSION_DENIED',
                message: 'Notification permission was denied'
            };
        }

    } catch (error) {
        console.error('Error initializing notifications:', error);
        return {
            success: false,
            error: 'INITIALIZATION_ERROR',
            message: error.message
        };
    }
};


export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted');
            return await getFCMToken();
        } else {
            console.log('Notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return null;
    }
};


export const getFCMToken = async () => {
    try {
        const token = await getToken(messaging, {
            vapidKey: FCM_CONFIG.vapidKey
        });

        if (token) {
            console.log('FCM Token:', token);
            return token;
        } else {
            console.log('No registration token available');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};


export const saveFCMToken = async (userId, token) => {
    try {
        const tokenRef = ref(database, `users/${userId}/fcmToken`);
        await set(tokenRef, {
            token: token,
            timestamp: new Date().toISOString(),
            platform: 'web'
        });
        console.log('FCM token saved for user:', userId);
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
};


export const getUserFCMToken = async (userId) => {
    try {
        const tokenRef = ref(database, `users/${userId}/fcmToken`);
        const snapshot = await get(tokenRef);
        if (snapshot.exists()) {
            return snapshot.val().token;
        }
        return null;
    } catch (error) {
        console.error('Error getting user FCM token:', error);
        return null;
    }
};


export const sendOutbidNotification = async (userId, auctionData, newBidAmount) => {
    try {
        const userToken = await getUserFCMToken(userId);
        if (!userToken) {
            console.log('No FCM token found for user:', userId);
            return;
        }


        const notificationRef = ref(database, `notifications/${userId}`);
        const newNotificationRef = push(notificationRef);

        const notificationData = {
            id: newNotificationRef.key,
            type: 'outbid',
            title: 'تم تجاوز مزايدتك!',
            body: `تم تجاوز مزايدتك في ${auctionData.title || 'المزاد'} بسعر ${newBidAmount} ج.م`,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title,
            newBidAmount: newBidAmount,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: 'view_auction'
            }
        };


        await set(newNotificationRef, notificationData);


        await sendFCMNotification(userToken, notificationData);

        console.log('Outbid notification sent to user:', userId);
        return notificationData;
    } catch (error) {
        console.error('Error sending outbid notification:', error);
        throw error;
    }
};


export const sendAuctionStartedNotification = async (userId, auctionData) => {
    try {
        const userToken = await getUserFCMToken(userId);
        if (!userToken) {
            console.log('No FCM token found for user:', userId);
            return;
        }


        const notificationRef = ref(database, `notifications/${userId}`);
        const newNotificationRef = push(notificationRef);

        const notificationData = {
            id: newNotificationRef.key,
            type: 'auction_started',
            title: 'بدأ المزاد! 🚀',
            body: `بدأ المزاد "${auctionData.title || 'المزاد الجديد'}" - ابدأ المزايدة الآن!`,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: 'view_auction'
            }
        };


        await set(newNotificationRef, notificationData);


        await sendFCMNotification(userToken, notificationData);

        console.log('Auction started notification sent to user:', userId);
        return notificationData;
    } catch (error) {
        console.error('Error sending auction started notification:', error);
        throw error;
    }
};


export const sendAuctionEndedNotification = async (userId, auctionData, winnerInfo = null) => {
    try {
        const userToken = await getUserFCMToken(userId);
        if (!userToken) {
            console.log('No FCM token found for user:', userId);
            return;
        }


        const notificationRef = ref(database, `notifications/${userId}`);
        const newNotificationRef = push(notificationRef);

        let title, body, action = 'view_auction';
        if (winnerInfo && winnerInfo.userId === userId) {
            title = 'مبروك! فزت بالمزاد! 🏆';
            body = `فزت بمزاد "${auctionData.title}" بسعر ${winnerInfo.finalBid} ج.م. أكمل الدفع الآن لإتمام العملية.`;
            action = 'pay_winner';
        } else {
            title = 'انتهى المزاد! 🏁';
            body = `انتهى مزاد "${auctionData.title}" - السعر النهائي: ${auctionData.finalPrice || 'غير محدد'} ج.م`;
        }

        const notificationData = {
            id: newNotificationRef.key,
            type: 'auction_ended',
            title: title,
            body: body,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title,
            finalPrice: auctionData.finalPrice,
            winnerInfo: winnerInfo,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: action
            }
        };


        await set(newNotificationRef, notificationData);


        await sendFCMNotification(userToken, notificationData);

        console.log('Auction ended notification sent to user:', userId);
        return notificationData;
    } catch (error) {
        console.error('Error sending auction ended notification:', error);
        throw error;
    }
};


export const sendNewAuctionApprovedNotification = async (userId, auctionData) => {
    try {
        const userToken = await getUserFCMToken(userId);
        if (!userToken) {
            console.log('No FCM token found for user:', userId);
            return;
        }


        const notificationRef = ref(database, `notifications/${userId}`);
        const newNotificationRef = push(notificationRef);

        const notificationData = {
            id: newNotificationRef.key,
            type: 'new_auction_approved',
            title: 'مزاد جديد يهمك! 🎯',
            body: `تمت الموافقة على مزاد جديد "${auctionData.title}" يتناسب مع اهتماماتك`,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title,
            category: auctionData.category,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: 'view_auction'
            }
        };


        await set(newNotificationRef, notificationData);


        await sendFCMNotification(userToken, notificationData);

        console.log('New auction approved notification sent to user:', userId);
        return notificationData;
    } catch (error) {
        console.error('Error sending new auction approved notification:', error);
        throw error;
    }
};


export const sendNewAuctionApprovedToInterestedUsers = async (auctionData, interestedUserIds) => {
    try {
        const notifications = [];

        for (const userId of interestedUserIds) {
            try {
                const notification = await sendNewAuctionApprovedNotification(userId, auctionData);
                notifications.push(notification);
            } catch (error) {
                console.error(`Error sending notification to user ${userId}:`, error);
            }
        }

        console.log(`Sent new auction notifications to ${notifications.length} users`);
        return notifications;
    } catch (error) {
        console.error('Error sending new auction notifications to interested users:', error);
        throw error;
    }
};

export const sendAuctionStartedToInterestedUsers = async (auctionData, interestedUserIds) => {
    try {
        const notifications = [];

        for (const userId of interestedUserIds) {
            try {
                const notification = await sendAuctionStartedNotification(userId, auctionData);
                notifications.push(notification);
            } catch (error) {
                console.error(`Error sending auction started notification to user ${userId}:`, error);
            }
        }

        console.log(`Sent auction started notifications to ${notifications.length} users`);
        return notifications;
    } catch (error) {
        console.error('Error sending auction started notifications to interested users:', error);
        throw error;
    }
};

export const getUsersInterestedInCategory = async (category) => {
    try {
        if (!category) return [];
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (!snapshot.exists()) {
            return [];
        }

        const interestedUsers = [];
        snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val() || {};
            const uid = userData.userId;
            if (!uid) {
                return;
            }

            const interestList = Array.isArray(userData.userInterests)
                ? userData.userInterests
                : Array.isArray(userData.interests)
                    ? userData.interests
                    : [];

            const matchesInterest = interestList.includes(category);

            const history = Array.isArray(userData.biddingHistory) ? userData.biddingHistory : [];
            const hasBidOnCategory = history.some((bid) =>
                bid?.category === category ||
                bid?.auctionCategory === category ||
                bid?.categoryId === category
            );

            if ((matchesInterest || hasBidOnCategory) && !interestedUsers.includes(uid)) {
                interestedUsers.push(uid);
            }
        });

        return interestedUsers;
    } catch (error) {
        console.error('Error getting users interested in category:', error);
        return [];
    }
};

export const getUsersWhoBidOnAuction = async (auctionId) => {
    try {
        const bidsRef = ref(database, `auctions/${auctionId}/bids`);
        const snapshot = await get(bidsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const userIds = new Set();
        snapshot.forEach((childSnapshot) => {
            const bidData = childSnapshot.val();
            if (bidData.userId) {
                userIds.add(bidData.userId);
            }
        });

        return Array.from(userIds);
    } catch (error) {
        console.error('Error getting users who bid on auction:', error);
        return [];
    }
};


const sendFCMNotification = async (token, notificationData) => {
    try {

        const fcmNotificationRef = ref(database, `fcm_notifications/${token}`);
        await push(fcmNotificationRef, {
            ...notificationData,
            sentAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error sending FCM notification:', error);
    }
};

export const sendNotification = async (userId, notificationData) => {
    try {
        const userToken = await getUserFCMToken(userId);
        if (!userToken) {
            console.log('No FCM token found for user:', userId);
            return;
        }

        const notificationRef = ref(database, `notifications/${userId}`);
        const newNotificationRef = push(notificationRef);

        const fullNotificationData = {
            id: newNotificationRef.key,
            ...notificationData,
            timestamp: new Date().toISOString(),
            read: false
        };

        await set(newNotificationRef, fullNotificationData);

        await sendFCMNotification(userToken, fullNotificationData);

        console.log('Notification sent to user:', userId);
        return fullNotificationData;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

export const sendWinnerPaymentNotification = async (userId, auctionData, finalBidAmount) => {
    try {
        const notificationData = {
            type: 'payment',
            title: 'الرجاء إتمام الدفع للفوز بالمزاد 💳',
            body: `لقد فزت بمزاد "${auctionData.title || 'المزاد'}" بسعر ${finalBidAmount ?? ''} ج.م. أكمل الدفع الآن لإتمام العملية.`,
            auctionId: auctionData.id,
            data: {
                auctionId: auctionData.id,
                action: 'pay_winner'
            }
        };
        return await sendNotification(userId, notificationData);
    } catch (error) {
        console.error('Error sending winner payment notification:', error);
        throw error;
    }
};

export const getUsersWhoParticipatedInAuction = async (auctionId) => {
    try {
        const paymentsRef = ref(database, 'payments');
        const snapshot = await get(paymentsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const userIds = new Set();
        snapshot.forEach((childSnapshot) => {
            const paymentData = childSnapshot.val();
            if (paymentData.auctionId === auctionId &&
                ['insurance', 'shroot'].includes(paymentData.type) &&
                paymentData.userId) {
                userIds.add(paymentData.userId);
            }
        });

        return Array.from(userIds);
    } catch (error) {
        console.error('Error getting users who participated in auction:', error);
        return [];
    }
};

export const sendAuctionParticipantNotification = async (userId, auctionData, notificationType) => {
    try {
        const userToken = await getUserFCMToken(userId);
        if (!userToken) {
            console.log('No FCM token found for user:', userId);
            return;
        }

        const notificationRef = ref(database, `notifications/${userId}`);
        const newNotificationRef = push(notificationRef);

        let title, body;

        switch (notificationType) {
            case 'auction_started':
                title = 'بدأ المزاد الذي شاركت فيه! 🚀';
                body = `بدأ المزاد "${auctionData.title}" الذي اشتريت فيه التأمين/الشروط - ابدأ المزايدة الآن!`;
                break;
            case 'auction_starting_soon':
                title = 'المزاد سيبدأ خلال دقيقة ⏳';
                body = `المزاد "${auctionData.title}" سيبدأ خلال دقيقة. استعد للمزايدة!`;
                break;
            case 'auction_ending_soon':
                title = 'المزاد ينتهي قريباً! ⏰';
                body = `المزاد "${auctionData.title}" الذي شاركت فيه سينتهي قريباً - تأكد من مزايدتك النهائية!`;
                break;
            case 'auction_ended':
                title = 'انتهى المزاد الذي شاركت فيه! 🏁';
                body = `انتهى المزاد "${auctionData.title}" الذي شاركت فيه - تحقق من النتيجة!`;
                break;
            case 'new_bid':
                title = 'مزايدة جديدة في المزاد! 💰';
                body = `تمت مزايدة جديدة في المزاد "${auctionData.title}" الذي شاركت فيه`;
                break;
            case 'auction_reminder':
                title = 'تذكير بالمزاد! 🔔';
                body = `تذكر أن المزاد "${auctionData.title}" الذي شاركت فيه سينتهي قريباً`;
                break;
            default:
                title = 'تحديث في المزاد! 📢';
                body = `تحديث جديد في المزاد "${auctionData.title}" الذي شاركت فيه`;
        }

        const notificationData = {
            id: newNotificationRef.key,
            type: `auction_participant_${notificationType}`,
            title: title,
            body: body,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title,
            participantType: 'insurance_or_terms',
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: 'view_auction',
                participantType: 'insurance_or_terms'
            }
        };

        await set(newNotificationRef, notificationData);

        await sendFCMNotification(userToken, notificationData);

        console.log(`Auction participant notification (${notificationType}) sent to user:`, userId);
        return notificationData;
    } catch (error) {
        console.error('Error sending auction participant notification:', error);
        throw error;
    }
};

export const sendAuctionParticipantNotificationToAll = async (auctionData, notificationType) => {
    try {
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            const notifications = [];

            for (const userId of participants) {
                try {
                    const notification = await sendAuctionParticipantNotification(userId, auctionData, notificationType);
                    notifications.push(notification);
                } catch (error) {
                    console.error(`Error sending participant notification to user ${userId}:`, error);
                }
            }

            console.log(`Sent ${notificationType} notifications to ${notifications.length} auction participants`);
            return notifications;
        } else {
            console.log('No participants found for auction:', auctionData.id);
            return [];
        }
    } catch (error) {
        console.error('Error sending auction participant notifications:', error);
        throw error;
    }
};


export const setupForegroundMessageListener = (callback) => {
    return onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);

        if (Notification.permission === 'granted') {
            const notification = new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: '/logo-zayid.png',
                badge: '/logo-zayid.png',
                data: payload.data,
                tag: payload.data?.auctionId || 'zayid-notification', // Group notifications
                requireInteraction: true
            });

            notification.onclick = () => {
                window.focus();
                if (payload.data?.auctionId) {
                    window.location.href = `/auction/${payload.data.auctionId}`;
                }
                notification.close();
            };

            setTimeout(() => {
                notification.close();
            }, 10000);
        }

        if (callback) {
            callback(payload);
        }
    });
};

export const getUserNotifications = async (userId) => {
    try {
        const notificationsRef = ref(database, `notifications/${userId}`);
        const snapshot = await get(notificationsRef);

        if (snapshot.exists()) {
            const notifications = [];
            snapshot.forEach((childSnapshot) => {
                notifications.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }

        return [];
    } catch (error) {
        console.error('Error getting user notifications:', error);
        return [];
    }
};

export const markNotificationAsRead = async (userId, notificationId) => {
    try {
        const notificationRef = ref(database, `notifications/${userId}/${notificationId}`);
        await update(notificationRef, { read: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

export const deleteNotification = async (userId, notificationId) => {
    try {
        const notificationRef = ref(database, `notifications/${userId}/${notificationId}`);
        await set(notificationRef, null);
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
};

export const getNotificationInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let browser = 'unknown';
    let steps = [];

    if (userAgent.includes('chrome')) {
        browser = 'Chrome';
        steps = [
            'انقر على أيقونة القفل 🔒 في شريط العنوان',
            'ابحث عن "الإشعارات" في القائمة',
            'غير الإعداد من "حظر" إلى "السماح"',
            'أعد تحميل الصفحة'
        ];
    } else if (userAgent.includes('firefox')) {
        browser = 'Firefox';
        steps = [
            'انقر على أيقونة الدرع 🛡️ في شريط العنوان',
            'ابحث عن "إرسال إشعارات"',
            'غير الإعداد من "حظر" إلى "السماح"',
            'أعد تحميل الصفحة'
        ];
    } else if (userAgent.includes('safari')) {
        browser = 'Safari';
        steps = [
            'اذهب إلى Safari > التفضيلات',
            'اختر علامة التبويب "المواقع"',
            'ابحث عن موقعنا في القائمة',
            'غير إعداد الإشعارات إلى "السماح"',
            'أعد تحميل الصفحة'
        ];
    } else if (userAgent.includes('edge')) {
        browser = 'Edge';
        steps = [
            'انقر على أيقونة القفل 🔒 في شريط العنوان',
            'ابحث عن "الإشعارات" في القائمة',
            'غير الإعداد من "حظر" إلى "السماح"',
            'أعد تحميل الصفحة'
        ];
    } else {
        browser = 'المتصفح';
        steps = [
            'اذهب إلى إعدادات المتصفح',
            'ابحث عن إعدادات الإشعارات',
            'امنح الإذن للموقع لإرسال الإشعارات',
            'أعد تحميل الصفحة'
        ];
    }

    return {
        browser,
        steps
    };
}; 