

import { messaging } from '../config/Firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { ref, set, get, push, update, remove } from 'firebase/database';
import { database } from '../config/Firebase';

// Utility functions for consistent user ID handling
const normalizeUserId = async (userId) => {
    try {
        
        if (/^\d+$/.test(userId)) {
            return { nationalID: userId, firebaseUID: null };
        }

     
        if (userId && userId.length > 20) { 
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);

            if (snapshot.exists()) {
                let nationalID = null;
                let foundUserData = null;

                snapshot.forEach((childSnapshot) => {
                    const userData = childSnapshot.val();
                    if (userData && userData.userId === userId) {
                        nationalID = childSnapshot.key;
                        foundUserData = userData;
                    }
                });

                if (nationalID && foundUserData) {
                    console.log(`Found national ID ${nationalID} for Firebase UID ${userId}`);
                    return { nationalID, firebaseUID: userId };
                }
            }

            console.warn(`No national ID found for Firebase UID: ${userId}`);
            return null;
        }

        console.warn(`Invalid user ID format: ${userId}`);
        return null;
    } catch (error) {
        console.error('Error normalizing user ID:', error);
        return null;
    }
};


export const findNationalIDFromFirebaseUID = async (firebaseUID) => {
    try {
        if (!firebaseUID || typeof firebaseUID !== 'string' || firebaseUID.length < 20) {
            console.warn('Invalid Firebase UID provided:', firebaseUID);
            return null;
        }

        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (!snapshot.exists()) {
            console.warn('No users found in database');
            return null;
        }

        let nationalID = null;
        snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            if (userData && userData.userId === firebaseUID) {
                nationalID = childSnapshot.key;
            }
        });

        if (nationalID) {
            console.log(`Successfully found national ID ${nationalID} for Firebase UID ${firebaseUID}`);
            return nationalID;
        } else {
            console.warn(`No national ID found for Firebase UID: ${firebaseUID}`);
            return null;
        }
    } catch (error) {
        console.error('Error finding national ID from Firebase UID:', error);
        return null;
    }
};

export const findFirebaseUIDFromNationalID = async (nationalID) => {
    try {
        if (!nationalID || typeof nationalID !== 'string' || !/^\d+$/.test(nationalID)) {
            console.warn('Invalid national ID provided:', nationalID);
            return null;
        }

        const userRef = ref(database, `users/${nationalID}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            console.warn(`No user found for national ID: ${nationalID}`);
            return null;
        }

        const userData = snapshot.val();
        const firebaseUID = userData?.userId;

        if (firebaseUID) {
            console.log(`Successfully found Firebase UID ${firebaseUID} for national ID ${nationalID}`);
            return firebaseUID;
        } else {
            console.warn(`No Firebase UID found for national ID: ${nationalID}`);
            return null;
        }
    } catch (error) {
        console.error('Error finding Firebase UID from national ID:', error);
        return null;
    }
};

const getNormalizedUserData = async (userId) => {
    try {
        const normalizedResult = await normalizeUserId(userId);

        if (!normalizedResult) {
            console.warn('Could not normalize user ID:', userId);
            return null;
        }

        const { nationalID, firebaseUID } = normalizedResult;

        if (!nationalID) {
            console.warn('No national ID found for user:', userId);
            return null;
        }

    
        const userRef = ref(database, `users/${nationalID}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            return {
                nationalID,
                firebaseUID: userData.userId || firebaseUID,
                userData,
           
                fcmToken: userData.fcmToken || null,
                notificationSettings: userData.notificationSettings || {}
            };
        }

        console.warn(`User data not found for national ID: ${nationalID}`);
        return null;
    } catch (error) {
        console.error('Error getting normalized user data:', error);
        return null;
    }
};


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
            initialized: false,
            message: 'Notifications are not supported in this browser'
        };
    }

    const permission = Notification.permission;

    return {
        status: permission,
        needsManualReset: permission === 'denied',
        initialized: permission === 'granted',
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
            console.log('FCM Token obtained successfully');
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


export const saveFCMToken = async (userId, token, platform = 'web') => {
    try {

        if (!token || typeof token !== 'string') {
            console.warn('Invalid token format, not saving:', token);
            return;
        }


        const tokenRef = ref(database, `users/${userId}/fcmTokens/${platform}`);
        await set(tokenRef, {
            token: token,
            timestamp: new Date().toISOString(),
            platform: platform,
            deviceType: platform === 'web' ? 'web' : 'mobile',
            tokenType: token.startsWith('ExponentPushToken[') ? 'expo' : 'fcm'
        });

        const tokenType = token.startsWith('ExponentPushToken[') ? 'Expo' : 'FCM';
        console.log(`${tokenType} token saved for user ${userId} on platform ${platform}`);
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
};


export const getUserFCMToken = async (userId, platform = 'web') => {
    try {
        let nationalID = userId;

      
        if (userId && userId.length > 20) { 
            try {
                const usersRef = ref(database, 'users');
                const snapshot = await get(usersRef);

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const userData = childSnapshot.val();
                        if (userData.userId === userId) {
                            nationalID = childSnapshot.key; 
                        }
                    });
                }
            } catch (error) {
                console.warn('Could not find national ID for Firebase UID:', userId);
            }
        }


        const tokenRef = ref(database, `users/${nationalID}/fcmTokens/${platform}`);
        const snapshot = await get(tokenRef);

        if (snapshot.exists()) {
            const token = snapshot.val().token;
            return token;
        }

        console.log(`No FCM token found for user ${nationalID} on platform ${platform}`);
        return null;
    } catch (error) {
        console.error('Error getting user FCM token:', error);
        return null;
    }
};

export const getAllUserFCMTokens = async (userId) => {
    try {
        // First try to get tokens using the provided userId as national ID
        let tokensRef = ref(database, `users/${userId}/fcmTokens`);
        let snapshot = await get(tokensRef);

        // If tokens found, process them
        if (snapshot.exists()) {
            const tokens = [];
            snapshot.forEach((childSnapshot) => {
                const tokenData = childSnapshot.val();
                if (tokenData.token) {
                    tokens.push({
                        token: tokenData.token,
                        platform: tokenData.platform,
                        deviceType: tokenData.deviceType,
                        timestamp: tokenData.timestamp
                    });
                }
            });
            if (tokens.length > 0) {
                return tokens;
            }
        }

        // If no tokens found, check if this is a Firebase UID
        const userRef = ref(database, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            // If this user has a national ID, try that
            if (userData.nationalID) {
                tokensRef = ref(database, `users/${userData.nationalID}/fcmTokens`);
                snapshot = await get(tokensRef);
                if (snapshot.exists()) {
                    const tokens = [];
                    snapshot.forEach((childSnapshot) => {
                        const tokenData = childSnapshot.val();
                        if (tokenData.token) {
                            tokens.push({
                                token: tokenData.token,
                                platform: tokenData.platform,
                                deviceType: tokenData.deviceType,
                                timestamp: tokenData.timestamp
                            });
                        }
                    });
                    if (tokens.length > 0) {
                        return tokens;
                    }
                }
            }
        }

        // If still no tokens found, search all users for a matching Firebase UID
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);

        if (usersSnapshot.exists()) {
            let nationalID = null;
            usersSnapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                if (userData.userId === userId) {
                    nationalID = childSnapshot.key;
                }
            });

            // If national ID found, try to get tokens using that
            if (nationalID) {
                tokensRef = ref(database, `users/${nationalID}/fcmTokens`);
                snapshot = await get(tokensRef);
                if (snapshot.exists()) {
                    const tokens = [];
                    snapshot.forEach((childSnapshot) => {
                        const tokenData = childSnapshot.val();
                        if (tokenData.token) {
                            tokens.push({
                                token: tokenData.token,
                                platform: tokenData.platform,
                                deviceType: tokenData.deviceType,
                                timestamp: tokenData.timestamp
                            });
                        }
                    });
                    if (tokens.length > 0) {
                        return tokens;
                    }
                }
            }
        }

        return [];
    } catch (error) {
        console.error('Error getting user FCM tokens:', error);
        return [];
    }
};

// Test utility functions removed for production

// Comprehensive error handling wrapper for notifications
const withNotificationErrorHandling = async (operationName, operation, userId, ...args) => {
    try {
        console.log(`[${operationName}] Starting operation for user: ${userId}`);
        const result = await operation(userId, ...args);
        console.log(`[${operationName}] Operation completed successfully`);
        return result;
    } catch (error) {
        console.error(`[${operationName}] Operation failed:`, error);
        console.error(`[${operationName}] User ID: ${userId}`);
        console.error(`[${operationName}] Arguments:`, args);

        // Try to provide more context about the error
        if (error.code) {
            console.error(`[${operationName}] Error code: ${error.code}`);
        }
        if (error.message) {
            console.error(`[${operationName}] Error message: ${error.message}`);
        }

        throw error;
    }
};

// Enhanced outbid notification with better error handling
export const sendOutbidNotification = async (userId, auctionData, newBidAmount) => {
    return withNotificationErrorHandling(
        'sendOutbidNotification',
        async (userId, auctionData, newBidAmount) => {
            console.log(`Attempting to send outbid notification to user: ${userId}`);

            const normalizedUser = await getNormalizedUserData(userId);
            if (!normalizedUser) {
                console.warn('Could not get normalized user data for:', userId);

                // Fallback: try to find user data directly
                try {
                    const usersRef = ref(database, 'users');
                    const snapshot = await get(usersRef);

                    if (snapshot.exists()) {
                        let nationalID = null;
                        snapshot.forEach((childSnapshot) => {
                            const userData = childSnapshot.val();
                            if (userData && userData.userId === userId) {
                                nationalID = childSnapshot.key;
                            }
                        });

                        if (nationalID) {
                            console.log(`Fallback: Found national ID ${nationalID} for Firebase UID ${userId}`);
                            // Try to send notification with the found national ID
                            const userToken = await getUserFCMToken(nationalID);
                            if (userToken) {
                                const notificationRef = ref(database, `notifications/${nationalID}`);
                                const newNotificationRef = push(notificationRef);

                                const notificationData = {
                                    id: newNotificationRef.key,
                                    type: 'outbid',
                                    title: 'تم تجاوز مزايدتك!',
                                    body: `تم تجاوز مزايدتك في ${auctionData.title || 'المزاد'} بسعر ${newBidAmount} ج.م`,
                                    auctionId: auctionData.id,
                                    auctionTitle: auctionData.title || 'المزاد',
                                    newBidAmount: newBidAmount || 0,
                                    timestamp: new Date().toISOString(),
                                    read: false,
                                    data: {
                                        auctionId: auctionData.id,
                                        action: 'view_auction'
                                    }
                                };

                                await set(newNotificationRef, notificationData);
                                await sendFCMNotification(userToken, notificationData);

                                console.log('Outbid notification sent via fallback method to user:', nationalID);
                                return notificationData;
                            }
                        }
                    }
                } catch (fallbackError) {
                    console.error('Fallback method also failed:', fallbackError);
                }

                return null;
            }

            const { nationalID, firebaseUID } = normalizedUser;

            const userToken = await getUserFCMToken(nationalID);
            if (!userToken) {
                console.log('No FCM token found for user:', nationalID);
                return null;
            }

            const notificationRef = ref(database, `notifications/${nationalID}`);
            const newNotificationRef = push(notificationRef);

            const notificationData = {
                id: newNotificationRef.key,
                type: 'outbid',
                title: 'تم تجاوز مزايدتك!',
                body: `تم تجاوز مزايدتك في ${auctionData.title || 'المزاد'} بسعر ${newBidAmount} ج.م`,
                auctionId: auctionData.id,
                auctionTitle: auctionData.title || 'المزاد',
                newBidAmount: newBidAmount || 0,
                timestamp: new Date().toISOString(),
                read: false,
                data: {
                    auctionId: auctionData.id,
                    action: 'view_auction'
                }
            };

            await set(newNotificationRef, notificationData);
            await sendFCMNotification(userToken, notificationData);

            console.log('Outbid notification sent to user:', nationalID, 'Firebase UID:', firebaseUID);
            return notificationData;
        },
        userId,
        auctionData,
        newBidAmount
    );
};

export const sendAuctionStartedNotification = async (userId, auctionData) => {
    try {
        console.log(`Attempting to send auction started notification to user: ${userId}`);

        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);

            // Fallback: try to find user data directly
            try {
                const usersRef = ref(database, 'users');
                const snapshot = await get(usersRef);

                if (snapshot.exists()) {
                    let nationalID = null;
                    snapshot.forEach((childSnapshot) => {
                        const userData = childSnapshot.val();
                        if (userData && userData.userId === userId) {
                            nationalID = childSnapshot.key;
                        }
                    });

                    if (nationalID) {
                        console.log(`Fallback: Found national ID ${nationalID} for Firebase UID ${userId}`);
                        // Try to send notification with the found national ID
                        const userToken = await getUserFCMToken(nationalID);
                        if (userToken) {
                            const notificationRef = ref(database, `notifications/${nationalID}`);
                            const newNotificationRef = push(notificationRef);

                            const notificationData = {
                                id: newNotificationRef.key,
                                type: 'auction_started',
                                title: 'بدأ المزاد! 🚀',
                                body: `بدأ المزاد "${auctionData.title || 'المزاد الجديد'}" - ابدأ المزايدة الآن!`,
                                auctionId: auctionData.id,
                                auctionTitle: auctionData.title || 'المزاد',
                                timestamp: new Date().toISOString(),
                                read: false,
                                data: {
                                    auctionId: auctionData.id,
                                    action: 'view_auction'
                                }
                            };

                            await set(newNotificationRef, notificationData);
                            await sendFCMNotification(userToken, notificationData);

                            console.log('Auction started notification sent via fallback method to user:', nationalID);
                            return notificationData;
                        }
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback method also failed:', fallbackError);
            }

            return null;
        }

        const { nationalID, firebaseUID } = normalizedUser;

        const userToken = await getUserFCMToken(nationalID);
        if (!userToken) {
            console.log('No FCM token found for user:', nationalID);
            return null;
        }

        const notificationRef = ref(database, `notifications/${nationalID}`);
        const newNotificationRef = push(notificationRef);

        const notificationData = {
            id: newNotificationRef.key,
            type: 'auction_started',
            title: 'بدأ المزاد! 🚀',
            body: `بدأ المزاد "${auctionData.title || 'المزاد الجديد'}" - ابدأ المزايدة الآن!`,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title || 'المزاد',
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: 'view_auction'
            }
        };

        await set(newNotificationRef, notificationData);
        await sendFCMNotification(userToken, notificationData);

        console.log('Auction started notification sent to user:', nationalID, 'Firebase UID:', firebaseUID);
        return notificationData;
    } catch (error) {
        console.error('Error sending auction started notification:', error);
        throw error;
    }
};

export const sendAuctionEndedNotification = async (userId, auctionData, winnerInfo = null) => {
    try {
        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);
            return null;
        }

        const { nationalID, firebaseUID } = normalizedUser;

        const userToken = await getUserFCMToken(nationalID);
        if (!userToken) {
            console.log('No FCM token found for user:', nationalID);
            return null;
        }

        const notificationRef = ref(database, `notifications/${nationalID}`);
        const newNotificationRef = push(notificationRef);

        let title, body, action = 'view_auction';
        if (winnerInfo && winnerInfo.userId === userId) {
            title = 'مبروك! فزت بالمزاد! 🏆';
            body = `فزت بمزاد "${auctionData.title || 'المزاد'}" بسعر ${winnerInfo.finalBid || 0} ج.م. أكمل الدفع الآن لإتمام العملية.`;
            action = 'pay_winner';
        } else {
            title = 'انتهى المزاد! 🏁';
            const finalPrice = auctionData.finalPrice || auctionData.highestBid || winnerInfo?.finalBid || 'غير محدد';
            body = `انتهى مزاد "${auctionData.title || 'المزاد'}" - السعر النهائي: ${finalPrice} ج.م`;
        }

        const notificationData = {
            id: newNotificationRef.key,
            type: 'auction_ended',
            title: title,
            body: body,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title || 'المزاد',
            finalPrice: auctionData.highestBid || winnerInfo?.finalBid || 0,
            winnerInfo: winnerInfo || null,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: action
            }
        };

        await set(newNotificationRef, notificationData);
        await sendFCMNotification(userToken, notificationData);

        console.log('Auction ended notification sent to user:', nationalID, 'Firebase UID:', firebaseUID);
        return notificationData;
    } catch (error) {
        console.error('Error sending auction ended notification:', error);
        throw error;
    }
};

export const sendNewAuctionApprovedNotification = async (userId, auctionData) => {
    try {
        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);
            return null;
        }

        const { nationalID, firebaseUID } = normalizedUser;

        const notificationRef = ref(database, `notifications/${nationalID}`);
        const newNotificationRef = push(notificationRef);

        const notificationData = {
            id: newNotificationRef.key,
            type: 'new_auction_approved',
            title: 'مزاد جديد يهمك! 🎯',
            body: `تمت الموافقة على مزاد جديد "${auctionData.title || 'المزاد'}" يتناسب مع اهتماماتك`,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title || 'المزاد',
            category: auctionData.category || 'غير محدد',
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: 'view_auction'
            }
        };

        await set(newNotificationRef, notificationData);

        try {
            const allTokens = await getAllUserFCMTokens(nationalID);
            if (allTokens.length > 0) {
                await sendFCMNotificationToAllDevices(nationalID, notificationData);
                console.log(`Push notification sent to ${allTokens.length} devices for user:`, nationalID);
            } else {
                console.log('No FCM tokens found for user:', nationalID, '- notification saved to database only');
            }
        } catch (fcmError) {
            console.warn('Failed to send push notification, but in-app notification was saved:', fcmError);
        }

        console.log('New auction approved notification processed for user:', nationalID, {
            inAppNotification: true,
            pushNotificationSent: true,
            nationalID: nationalID,
            firebaseUID: firebaseUID
        });
        return notificationData;
    } catch (error) {
        console.error('Error sending new auction approved notification:', error);
        throw error;
    }
};

export const sendNewAuctionApprovedToInterestedUsers = async (auctionData, interestedUsers) => {
    try {
        const notifications = [];

        for (const user of interestedUsers) {
            try {
                const notification = await sendNewAuctionApprovedNotification(user.nationalID, auctionData);
                notifications.push(notification);
            } catch (error) {
                console.error(`Error sending notification to user ${user.nationalID}:`, error);
            }
        }

        console.log(`Sent new auction notifications to ${notifications.length} users`);
        return notifications;
    } catch (error) {
        console.error('Error sending new auction notifications to interested users:', error);
        throw error;
    }
};

export const sendAuctionStartedToInterestedUsers = async (auctionData, interestedUsers) => {
    try {
        const notifications = [];

        for (const user of interestedUsers) {
            try {
                const notification = await sendAuctionStartedNotification(user.nationalID, auctionData);
                notifications.push(notification);
            } catch (error) {
                console.error(`Error sending auction started notification to user ${user.nationalID}:`, error);
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
            const firebaseUID = userData.userId;
            const nationalID = childSnapshot.key;

            if (!firebaseUID || !nationalID) {
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

            if ((matchesInterest || hasBidOnCategory) && !interestedUsers.includes(nationalID)) {
                interestedUsers.push({
                    nationalID,
                    firebaseUID,
                    userData
                });
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
        const userDataMap = new Map();

        snapshot.forEach((childSnapshot) => {
            const bidData = childSnapshot.val();
            if (bidData.userId) {
                userIds.add(bidData.userId);

                if (!userDataMap.has(bidData.userId)) {
                    userDataMap.set(bidData.userId, {
                        firebaseUID: bidData.userId,
                        bidAmount: bidData.bidAmount,
                        bidTime: bidData.timestamp
                    });
                }
            }
        });

        const users = [];
        for (const firebaseUID of userIds) {
            const normalizedData = await getNormalizedUserData(firebaseUID);
            if (normalizedData) {
                users.push({
                    ...normalizedData,
                    bidData: userDataMap.get(firebaseUID)
                });
            }
        }

        return users;
    } catch (error) {
        console.error('Error getting users who bid on auction:', error);
        return [];
    }
};

export const getUsersWhoParticipatedInAuction = async (auctionId) => {
    try {
        const participantsRef = ref(database, `auctions/${auctionId}/participants`);
        const snapshot = await get(participantsRef);

        if (!snapshot.exists()) {
            return [];
        }

        const participants = [];
        snapshot.forEach((childSnapshot) => {
            const participantData = childSnapshot.val();
            const firebaseUID = childSnapshot.key;

            participants.push({
                firebaseUID: firebaseUID,
                joinedAt: participantData.joinedAt,
                hasPaidInsurance: participantData.hasPaidInsurance || false,
                hasPurchasedShroot: participantData.hasPurchasedShroot || false,
                paidInsuranceAt: participantData.paidInsuranceAt || null
            });
        });

        const users = [];
        for (const participant of participants) {
            const normalizedData = await getNormalizedUserData(participant.firebaseUID);
            if (normalizedData) {
                users.push({
                    ...normalizedData,
                    participationData: participant
                });
            }
        }

        return users;
    } catch (error) {
        console.error('Error getting users who participated in auction:', error);
        return [];
    }
};

// Helper function to get FCM tokens for auction participants
export const getParticipantFCMTokens = async (auctionId) => {
    try {
        const participants = await getUsersWhoParticipatedInAuction(auctionId);
        const fcmTokens = participants
            .map(participant => participant.fcmToken)
            .filter(token => token && token.trim() !== '');

        return fcmTokens;
    } catch (error) {
        console.error('Error getting participant FCM tokens:', error);
        return [];
    }
};

// Helper function to get participant data with national IDs for easier storage access
export const getParticipantNationalIDs = async (auctionId) => {
    try {
        const participants = await getUsersWhoParticipatedInAuction(auctionId);
        const nationalIDs = participants
            .map(participant => participant.nationalID)
            .filter(id => id && id.toString().trim() !== '');

        return nationalIDs;
    } catch (error) {
        console.error('Error getting participant national IDs:', error);
        return [];
    }
};


const sendExpoNotification = async (token, notificationData) => {
    try {
        const message = {
            to: token,
            title: notificationData.title,
            body: notificationData.body,
            data: notificationData.data,
            sound: 'default',
            priority: 'high'
        };

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        });

        const result = await response.json();
        if (result.data && result.data[0] && result.data[0].status === 'ok') {
            console.log('Expo notification sent successfully');
            return true;
        } else {
            console.error('Expo notification failed:', result);
            return false;
        }
    } catch (error) {
        console.error('Error sending Expo notification:', error);
        return false;
    }
};

// Alternative approach: Trigger notifications via database changes
// This will work with your existing Firebase Functions that watch for database changes
export const triggerNotificationViaDatabase = async (nationalID, notificationData) => {
    try {
        // Get user's FCM token using the national ID directly
        const userToken = await getUserFCMToken(nationalID);
        if (!userToken) {
            console.log('No FCM token found for user:', nationalID);
            return { success: false, error: 'No FCM token found' };
        }

        // Create a notification entry that will trigger Firebase Functions
        const fcmNotificationRef = ref(database, `fcm_notifications/${userToken}/${Date.now()}`);
        await set(fcmNotificationRef, {
            ...notificationData,
            timestamp: new Date().toISOString(),
            userId: nationalID, // Use the correct national ID here
            token: userToken
        });

        console.log('FCM notification triggered via database for user:', nationalID);
        return { success: true, message: 'Notification triggered via database' };
    } catch (error) {
        console.error('Error triggering notification via database:', error);
        return { success: false, error: error.message };
    }
};

// Function to call Firebase Functions for sending FCM notifications
const callFirebaseFunction = async (functionName, data) => {
    try {
        // You'll need to replace this URL with your actual Firebase Functions URL
        const functionUrl = `https://us-central1-zayid-itp25.cloudfunctions.net/${functionName}`;

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`Firebase Function ${functionName} called successfully:`, result);
        return result;
    } catch (error) {
        console.error(`Error calling Firebase Function ${functionName}:`, error);
        return { success: false, error: error.message };
    }
};

const sendFCMNotification = async (token, notificationData) => {
    try {
        if (!token || typeof token !== 'string') {
            console.warn('Invalid token format:', token);
            return false;
        }

        // For client-side, we can't send FCM directly - we need to use Firebase Functions
        // The notification is already saved to database, so Firebase Functions can pick it up
        // or we can trigger a function call

        if (token.startsWith('ExponentPushToken[')) {
            return await sendExpoNotification(token, notificationData);
        }

        // Since we can't send FCM from client-side, we'll use the fallback browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(notificationData.title, {
                body: notificationData.body,
                icon: '/logo-zayid.png',
                badge: '/logo-zayid.png',
                tag: notificationData.type,
                data: notificationData.data,
                requireInteraction: true
            });

            notification.onclick = () => {
                window.focus();
                if (notificationData.data?.auctionId) {
                    window.location.href = `/auction/${notificationData.data.auctionId}`;
                }
                notification.close();
            };

            setTimeout(() => notification.close(), 10000);
            return true;
        }

        console.log('FCM notification queued for server-side processing');
        return true;
    } catch (error) {
        console.error('Error in sendFCMNotification:', error);
        return false;
    }
};

const sendFCMNotificationToAllDevices = async (userId, notificationData) => {
    try {
        const allTokens = await getAllUserFCMTokens(userId);

        if (allTokens.length === 0) {
            console.log('No FCM tokens found for user:', userId);
            return { sentCount: 0, totalTokens: 0 };
        }

        const sendPromises = allTokens.map(tokenData =>
            sendFCMNotification(tokenData.token, notificationData)
        );

        const results = await Promise.all(sendPromises);
        const successCount = results.filter(result => result === true).length;

        console.log(`Notifications sent to ${successCount}/${allTokens.length} devices for user:`, userId);
        return { sentCount: successCount, totalTokens: allTokens.length };
    } catch (error) {
        console.error('Error sending FCM notification to all devices:', error);
        return { sentCount: 0, totalTokens: 0 };
    }
};

/**
 * COMPREHENSIVE NOTIFICATION SYSTEM
 * 
 * This system provides multiple fallback methods for sending notifications:
 * 
 * 1. PRIMARY: Database trigger → Firebase Functions → FCM Push Notifications
 *    - Creates entry in `fcm_notifications/{token}/{id}` 
 *    - Triggers your existing Firebase Functions automatically
 *    - Sends real push notifications to devices
 * 
 * 2. FALLBACK 1: Direct Firebase Functions call
 *    - Calls `sendMultipleNotifications` function directly
 *    - Useful if database trigger fails
 * 
 * 3. FALLBACK 2: Browser notifications
 *    - Local browser notifications if FCM fails
 *    - Ensures user always gets notified
 * 
 * 4. ALWAYS: In-app notifications
 *    - Saved to `notifications/{nationalID}` database
 *    - Available in the app interface
 * 
 * The system automatically handles:
 * - User ID normalization (Firebase UID ↔ National ID)
 * - FCM token retrieval and validation
 * - Multiple fallback strategies
 * - Comprehensive error handling
 */

export const sendNotification = async (userId, notificationData) => {
    try {
        let nationalID = userId;
        let firebaseUID = userId;

        // If userId is a Firebase UID, find the corresponding national ID first
        if (userId && userId.length > 20) {
            try {
                const usersRef = ref(database, 'users');
                const snapshot = await get(usersRef);

                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const userData = childSnapshot.val();
                        if (userData.userId === userId) {
                            nationalID = childSnapshot.key;
                        }
                    });
                }
            } catch (userFetchError) {
                console.warn('Could not find national ID for Firebase UID:', userId);
            }
        }

        try {
            const userRef = ref(database, `users/${userId}`);
            const userSnapshot = await get(userRef);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                if (userData.nationalID) {
                    nationalID = userData.nationalID;
                }
                if (userData.userId) {
                    firebaseUID = userData.userId;
                }
            }
        } catch (userFetchError) {
            console.warn('Could not fetch user data, using provided userId for notifications:', userFetchError);
        }

        // Save notification to database using national ID
        const notificationRef = ref(database, `notifications/${nationalID}`);
        const newNotificationRef = push(notificationRef);

        const fullNotificationData = {
            id: newNotificationRef.key,
            ...notificationData,
            timestamp: new Date().toISOString(),
            read: false
        };

        await set(newNotificationRef, fullNotificationData);

        // Get user's FCM tokens using the national ID
        const userToken = await getUserFCMToken(nationalID);
        if (userToken) {
            // Try to send via database trigger first (this will work with your existing Firebase Functions)
            try {
                const dbTriggerResult = await triggerNotificationViaDatabase(nationalID, fullNotificationData);

                if (dbTriggerResult.success) {
                    console.log(`Push notification triggered via database for user:`, nationalID);
                } else {
                    console.log('Database trigger failed, trying Firebase Functions directly');
                    // Fallback to direct Firebase Functions call
                    const fcmResult = await callFirebaseFunction('sendMultipleNotifications', {
                        tokens: [userToken],
                        notificationData: fullNotificationData
                    });

                    if (fcmResult.success) {
                        console.log(`Push notification sent via Firebase Functions for user:`, nationalID);
                    } else {
                        console.log('Firebase Functions failed, using fallback browser notification');
                        // Final fallback to browser notification
                        await sendFCMNotification(userToken, fullNotificationData);
                    }
                }
            } catch (error) {
                console.log('Database trigger error, using fallback browser notification:', error);
                // Fallback to browser notification
                await sendFCMNotification(userToken, fullNotificationData);
            }
        } else {
            console.log('No FCM token found for user:', nationalID, '- notification saved to database only');
        }

        console.log('Notification processed:', {
            userId: nationalID,
            type: fullNotificationData.type,
            inAppNotification: true,
            pushNotificationSent: !!userToken
        });
        return fullNotificationData;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

export const sendUserActivationNotification = async (userId) => {
    try {
        console.log(`Attempting to send user activation notification to user: ${userId}`);

        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);

            // Fallback: try to find user data directly
            try {
                const usersRef = ref(database, 'users');
                const snapshot = await get(usersRef);

                if (snapshot.exists()) {
                    let nationalID = null;
                    snapshot.forEach((childSnapshot) => {
                        const userData = childSnapshot.val();
                        if (userData && userData.userId === userId) {
                            nationalID = childSnapshot.key;
                        }
                    });

                    if (nationalID) {
                        console.log(`Fallback: Found national ID ${nationalID} for Firebase UID ${userId}`);
                        // Try to send notification with the found national ID
                        const userToken = await getUserFCMToken(nationalID);
                        if (userToken) {
                            const notificationRef = ref(database, `notifications/${nationalID}`);
                            const newNotificationRef = push(notificationRef);

                            const notificationData = {
                                id: newNotificationRef.key,
                                type: 'account_activated',
                                title: 'تم تفعيل حسابك! 🎉',
                                body: 'مرحباً بك في زايد! تم تفعيل حسابك بنجاح ويمكنك الآن الاستمتاع بجميع خدماتنا.',
                                timestamp: new Date().toISOString(),
                                read: false,
                                data: {
                                    action: 'account_activated'
                                }
                            };

                            await set(newNotificationRef, notificationData);
                            await sendFCMNotification(userToken, notificationData);

                            console.log('User activation notification sent via fallback method to user:', nationalID);
                            return notificationData;
                        }
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback method also failed:', fallbackError);
            }

            return null;
        }

        const { nationalID, firebaseUID } = normalizedUser;

        const notificationRef = ref(database, `notifications/${nationalID}`);
        const newNotificationRef = push(notificationRef);

        const notificationData = {
            id: newNotificationRef.key,
            type: 'account_activated',
            title: 'تم تفعيل حسابك! 🎉',
            body: 'مرحباً بك في زايد! تم تفعيل حسابك بنجاح ويمكنك الآن الاستمتاع بجميع خدماتنا.',
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                action: 'account_activated'
            }
        };

        await set(newNotificationRef, notificationData);

        let pushNotificationResult = { sentCount: 0, totalTokens: 0 };
        try {
            pushNotificationResult = await sendFCMNotificationToAllDevices(nationalID, notificationData);

            if (pushNotificationResult.totalTokens > 0) {
                console.log(`Push notification sent to ${pushNotificationResult.sentCount}/${pushNotificationResult.totalTokens} devices for user:`, nationalID);
            } else {
                console.log('No FCM tokens found for user:', nationalID, '- notification saved to database only');
            }
        } catch (fcmError) {
            console.warn('Failed to send push notification, but in-app notification was saved:', fcmError);
        }

        console.log('User activation notification processed:', {
            userId: nationalID,
            type: notificationData.type,
            inAppNotification: true,
            pushNotificationSent: pushNotificationResult.sentCount > 0,
            devicesNotified: pushNotificationResult.sentCount,
            totalDevices: pushNotificationResult.totalTokens
        });
        return notificationData;
    } catch (error) {
        console.error('Error sending user activation notification:', error);
        throw error;
    }
};

export const sendWinnerPaymentNotification = async (userId, auctionData, finalBidAmount) => {
    try {

        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);
            return null;
        }

        const { nationalID, firebaseUID } = normalizedUser;


        const paymentTrackingRef = ref(database, `payment_notifications/${auctionData.id}/winner_payment_request/${nationalID}`);
        const trackingSnapshot = await get(paymentTrackingRef);

        if (trackingSnapshot.exists() && trackingSnapshot.val()?.sent === true) {
            console.log(`Winner payment notification already sent for auction ${auctionData.title} to user ${nationalID} (original: ${userId})`);
            return null;
        }

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

        const result = await sendNotification(nationalID, notificationData);

        // Mark payment request notification as sent
        await set(paymentTrackingRef, {
            sent: true,
            timestamp: new Date().toISOString(),
            nationalID: nationalID,
            firebaseUID: firebaseUID,
            originalUserId: userId,
            finalBidAmount: finalBidAmount
        });

        console.log(`Winner payment notification sent and tracked for auction ${auctionData.title} - user: ${nationalID}`);
        return result;
    } catch (error) {
        console.error('Error sending winner payment notification:', error);
        throw error;
    }
};

// Function to send payment completion notifications with spam prevention
export const sendPaymentCompletionNotifications = async (auctionId, buyerUserId, sellerUserId, auctionData, amount) => {
    try {
        // Check if payment completion notifications have already been sent for this auction
        const paymentCompletionTrackingRef = ref(database, `payment_notifications/${auctionId}/payment_completion_sent`);
        const trackingSnapshot = await get(paymentCompletionTrackingRef);

        if (trackingSnapshot.exists() && trackingSnapshot.val()?.sent === true) {
            console.log(`Payment completion notifications already sent for auction: ${auctionData?.title || auctionId}`);
            return { buyerNotification: null, sellerNotification: null };
        }

        const results = {};

        // Send notification to buyer (winner)
        try {
            const buyerNotification = await sendNotification(buyerUserId, {
                type: "payment",
                title: "تم دفع مبلغ الفوز بالمزاد 💳",
                body: ` لاتمام عملية الاستلام تم تأكيد دفعك لمزاد "${auctionData?.title || ""
                    }" بنجاح. تم إرسال معلومات البائع على بريدك الإلكتروني.`,
                auctionId: auctionId,
                data: {
                    auctionId: auctionId,
                    action: "view_auction",
                    paymentType: "winner",
                    amount: amount,
                },
            });
            results.buyerNotification = buyerNotification;
            console.log("✅ Buyer payment completion notification sent successfully");
        } catch (e) {
            console.error("❌ Failed to send buyer payment completion notification:", e);
            results.buyerNotification = null;
        }

        // Send notification to seller about payment completion
        if (sellerUserId) {
            try {
                const sellerNotification = await sendNotification(sellerUserId, {
                    type: "payment_received",
                    title: "تم دفع مبلغ الفوز لمزادك! 💰",
                    body: `تم دفع مبلغ الفوز لمزاد "${auctionData?.title || ""
                        }" بنجاح. يرجى تزويدنا بمعلومات الدفع.`,
                    auctionId: auctionId,
                    data: {
                        auctionId: auctionId,
                        action: "view_auction",
                        paymentType: "winner",
                        amount: amount,
                    },
                });
                results.sellerNotification = sellerNotification;
                console.log("✅ Seller payment completion notification sent successfully");
            } catch (e) {
                console.error("❌ Failed to send seller payment completion notification:", e);
                results.sellerNotification = null;
            }
        }

        // Mark payment completion notifications as sent
        await set(paymentCompletionTrackingRef, {
            sent: true,
            timestamp: new Date().toISOString(),
            buyerUserId: buyerUserId,
            sellerUserId: sellerUserId,
            amount: amount,
            auctionTitle: auctionData?.title
        });

        console.log(`Payment completion notifications sent and tracked for auction: ${auctionData?.title || auctionId}`);
        return results;
    } catch (error) {
        console.error('Error sending payment completion notifications:', error);
        throw error;
    }
};


export const resetPaymentNotificationTracking = async (auctionId) => {
    try {
        const paymentTrackingRef = ref(database, `payment_notifications/${auctionId}`);
        await remove(paymentTrackingRef);

        console.log(`✅ Reset payment notification tracking for auction: ${auctionId}`);
        return true;
    } catch (error) {
        console.error('❌ Error resetting payment notification tracking:', error);
        return false;
    }
};

export const sendAuctionParticipantNotification = async (userId, auctionData, notificationType) => {
    try {
        // Get normalized user data
        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);
            return null;
        }

        const { nationalID, firebaseUID } = normalizedUser;

        // Get FCM token using national ID
        const userToken = await getUserFCMToken(nationalID);
        if (!userToken) {
            console.log('No FCM token found for user:', nationalID);
            return null;
        }

        // Create notification in database under national ID
        const notificationRef = ref(database, `notifications/${nationalID}`);
        const newNotificationRef = push(notificationRef);

        let title, body;

        switch (notificationType) {
            case 'auction_started':
                title = 'بدأ المزاد الذي شاركت فيه! 🚀';
                body = `بدأ المزاد "${auctionData.title || 'المزاد'}" الذي اشتريت فيه التأمين/الشروط - ابدأ المزايدة الآن!`;
                break;
            case 'auction_starting_soon':
                title = 'المزاد سيبدأ خلال دقيقة ⏳';
                body = `المزاد "${auctionData.title || 'المزاد'}" سيبدأ خلال دقيقة. استعد للمزايدة!`;
                break;
            case 'auction_ending_soon':
                title = 'المزاد ينتهي قريباً! ⏰';
                body = `المزاد "${auctionData.title || 'المزاد'}" الذي شاركت فيه سينتهي قريباً - تأكد من مزايدتك النهائية!`;
                break;
            case 'auction_ended':
                title = 'انتهى المزاد الذي شاركت فيه! 🏁';
                body = `انتهى المزاد "${auctionData.title || 'المزاد'}" الذي شاركت فيه - تحقق من النتيجة!`;
                break;
            case 'new_bid':
                title = 'مزايدة جديدة في المزاد! 💰';
                body = `تمت مزايدة جديدة في المزاد "${auctionData.title || 'المزاد'}" الذي شاركت فيه`;
                break;
            case 'auction_reminder':
                title = 'تذكير بالمزاد! 🔔';
                body = `تذكر أن المزاد "${auctionData.title || 'المزاد'}" الذي شاركت فيه سينتهي قريباً`;
                break;
            default:
                title = 'تحديث في المزاد! 📢';
                body = `تحديث جديد في المزاد "${auctionData.title || 'المزاد'}" الذي شاركت فيه`;
        }

        const notificationData = {
            id: newNotificationRef.key,
            type: `auction_participant_${notificationType}`,
            title: title,
            body: body,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title || 'المزاد',
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

        console.log(`Auction participant notification (${notificationType}) sent to user:`, nationalID);
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

            for (const participant of participants) {
                try {
                    // Use nationalID for notifications
                    const notification = await sendAuctionParticipantNotification(participant.nationalID, auctionData, notificationType);
                    notifications.push(notification);
                } catch (error) {
                    console.error(`Error sending participant notification to user ${participant.nationalID}:`, error);
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

export const sendAuctionApprovedNotification = async (auctionData) => {
    try {
        // Get the auction owner's information
        const ownerId = auctionData.createdBy || auctionData.ownerId;
        if (!ownerId) {
            console.warn('No owner ID found for auction:', auctionData.id);
            return null;
        }

        // Get normalized user data for the owner
        const normalizedUser = await getNormalizedUserData(ownerId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for auction owner:', ownerId);
            return null;
        }

        const { nationalID, firebaseUID } = normalizedUser;

        // Create notification for the auction owner
        const notificationRef = ref(database, `notifications/${nationalID}`);
        const newNotificationRef = push(notificationRef);

        const notificationData = {
            id: newNotificationRef.key,
            type: 'auction_approved',
            title: 'تمت الموافقة على مزادك! ✅',
            body: `تمت الموافقة على مزادك "${auctionData.title || 'المزاد'}" ويمكن الآن عرضه للمستخدمين`,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title || 'المزاد',
            category: auctionData.category || 'غير محدد',
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: 'view_auction'
            }
        };

        // Save notification to database
        await set(newNotificationRef, notificationData);

        // Send push notification
        try {
            const allTokens = await getAllUserFCMTokens(nationalID);
            if (allTokens.length > 0) {
                await sendFCMNotificationToAllDevices(nationalID, notificationData);
                console.log(`Auction approval notification sent to ${allTokens.length} devices for owner:`, nationalID);
            } else {
                console.log('No FCM tokens found for auction owner:', nationalID, '- notification saved to database only');
            }
        } catch (fcmError) {
            console.warn('Failed to send auction approval push notification, but in-app notification was saved:', fcmError);
        }

        console.log('Auction approval notification processed for owner:', ownerId, {
            inAppNotification: true,
            pushNotificationSent: true,
            nationalID: nationalID,
            firebaseUID: firebaseUID
        });
        return notificationData;
    } catch (error) {
        console.error('Error sending auction approval notification:', error);
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
                tag: payload.data?.auctionId || 'zayid-notification',
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
        console.log(`Getting notifications for user: ${userId}`);

        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);
            return [];
        }

        const { nationalID } = normalizedUser;

        // Get notifications using national ID
        const notificationsRef = ref(database, `notifications/${nationalID}`);
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
        console.log(`Marking notification ${notificationId} as read for user: ${userId}`);

        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);
            return false;
        }

        const { nationalID } = normalizedUser;

        // Mark notification as read using national ID
        const notificationRef = ref(database, `notifications/${nationalID}/${notificationId}`);
        await update(notificationRef, { read: true });

        console.log(`Notification ${notificationId} marked as read for user: ${nationalID}`);
        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
};

export const deleteNotification = async (userId, notificationId) => {
    try {
        console.log(`Deleting notification ${notificationId} for user: ${userId}`);

        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);
            return false;
        }

        const { nationalID } = normalizedUser;

        // Delete notification using national ID
        const notificationRef = ref(database, `notifications/${nationalID}/${notificationId}`);
        await set(notificationRef, null);

        console.log(`Notification ${notificationId} deleted for user: ${nationalID}`);
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        return false;
    }
};

export const sendAuctionEditNotification = async (userId, auctionData, changes) => {
    try {
        console.log(`Attempting to send auction edit notification to user: ${userId}`);

        const normalizedUser = await getNormalizedUserData(userId);
        if (!normalizedUser) {
            console.warn('Could not get normalized user data for:', userId);

            // Fallback: try to find user data directly
            try {
                const usersRef = ref(database, 'users');
                const snapshot = await get(usersRef);

                if (snapshot.exists()) {
                    let nationalID = null;
                    snapshot.forEach((childSnapshot) => {
                        const userData = childSnapshot.val();
                        if (userData && userData.userId === userId) {
                            nationalID = childSnapshot.key;
                        }
                    });

                    if (nationalID) {
                        console.log(`Fallback: Found national ID ${nationalID} for Firebase UID ${userId}`);
                        // Try to send notification with the found national ID
                        const userToken = await getUserFCMToken(nationalID);
                        if (userToken) {
                            const notificationRef = ref(database, `notifications/${nationalID}`);
                            const newNotificationRef = push(notificationRef);

                            const notificationData = {
                                id: newNotificationRef.key,
                                type: 'auction_edited',
                                title: 'تم تعديل المزاد! ⚠️',
                                body: `تم تعديل مزاد "${auctionData.title || 'المزاد'}" الذي شاركت فيه. التغييرات: ${changes}`,
                                auctionId: auctionData.id,
                                auctionTitle: auctionData.title || 'المزاد',
                                changes: changes || 'تغييرات عامة',
                                timestamp: new Date().toISOString(),
                                read: false,
                                data: {
                                    auctionId: auctionData.id,
                                    action: 'view_auction',
                                    type: 'auction_edited'
                                }
                            };

                            await set(newNotificationRef, notificationData);
                            await sendFCMNotification(userToken, notificationData);

                            console.log('Auction edit notification sent via fallback method to user:', nationalID);
                            return notificationData;
                        }
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback method also failed:', fallbackError);
            }

            return null;
        }

        const { nationalID, firebaseUID } = normalizedUser;

        const userToken = await getUserFCMToken(nationalID);
        if (!userToken) {
            console.log('No FCM token found for user:', nationalID);
            return null;
        }

        // Create notification in database under national ID
        const notificationRef = ref(database, `notifications/${nationalID}`);
        const newNotificationRef = push(notificationRef);

        const notificationData = {
            id: newNotificationRef.key,
            type: 'auction_edited',
            title: 'تم تعديل المزاد! ⚠️',
            body: `تم تعديل مزاد "${auctionData.title || 'المزاد'}" الذي شاركت فيه. التغييرات: ${changes}`,
            auctionId: auctionData.id,
            auctionTitle: auctionData.title || 'المزاد',
            changes: changes || 'تغييرات عامة',
            timestamp: new Date().toISOString(),
            read: false,
            data: {
                auctionId: auctionData.id,
                action: 'view_auction',
                type: 'auction_edited'
            }
        };

        // Save notification to database
        await set(newNotificationRef, notificationData);

        // Send push notification
        try {
            const allTokens = await getAllUserFCMTokens(nationalID);
            if (allTokens.length > 0) {
                await sendFCMNotificationToAllDevices(nationalID, notificationData);
                console.log(`Auction edit notification sent to ${allTokens.length} devices for user:`, nationalID);
            } else {
                console.log('No FCM tokens found for user:', nationalID, '- notification saved to database only');
            }
        } catch (fcmError) {
            console.warn('Failed to send auction edit push notification, but in-app notification was saved:', fcmError);
        }

        console.log('Auction edit notification processed:', {
            userId: nationalID,
            type: notificationData.type,
            inAppNotification: true,
            pushNotificationSent: true
        });
        return notificationData;
    } catch (error) {
        console.error('Error sending auction edit notification:', error);
        throw error;
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

// Note: For comprehensive testing of all notification types, use the NotificationTester component
// This provides a user-friendly interface to test notifications with real user IDs 