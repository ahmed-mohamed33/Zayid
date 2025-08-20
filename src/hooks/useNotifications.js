import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import {
    getPermissionStatus,
    isPermissionBlocked,
    initializeNotifications,
    saveFCMToken,
    getUserNotifications,
    markNotificationAsRead,
    deleteNotification,
    findNationalIDFromFirebaseUID,
} from '../utils/notificationService';
import { ref, onValue, off, get } from 'firebase/database';
import { database } from '../config/Firebase';

export const useNotifications = () => {
    const { user, userData, loading: userLoading } = useContext(UserContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState(getPermissionStatus());
    const [initializationError, setInitializationError] = useState(null);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    // Helper function to get the correct user ID for notifications
    const getNotificationUserId = () => {
        if (!user?.uid) return null;

        // If userData has nationalID, use that
        if (userData?.nationalID) {
            return userData.nationalID;
        }

        // Otherwise, use the Firebase UID
        return user.uid;
    };

    // Initialize notifications when user is authenticated
    useEffect(() => {
        if (user?.uid && userData) {
            const shouldInitialize = async () => {
                if (permissionStatus.status !== 'granted') {
                    return true;
                }

                if (permissionStatus.status === 'granted' && permissionStatus.initialized) {
                    return false;
                }

                return false;
            };

            shouldInitialize().then(needsInit => {
                if (needsInit) {
                    initializeNotificationsForUser();
                    const cleanup = setupRealTimeNotificationsListener();

                    return () => {
                        if (cleanup) cleanup();
                    };
                }
            });
        }
    }, [user, userData, userLoading, permissionStatus.initialized, permissionStatus.status]);

    // Set up real-time notifications listener when user data is available
    useEffect(() => {
        if (user?.uid && userData) {
            console.log('User data available, setting up notifications listener');
            const cleanup = setupRealTimeNotificationsListener();

            // Also fetch notifications immediately
            fetchNotifications();

            return () => {
                if (cleanup) cleanup();
            };
        }
    }, [user, userData]);

    const setupRealTimeNotificationsListener = () => {
        if (!user?.uid || !userData) return null;

        const notificationUserId = getNotificationUserId();
        if (!notificationUserId) {
            console.warn('Could not determine notification user ID');
            return null;
        }

        console.log('Setting up notifications listener for user:', notificationUserId);
        const notificationsRef = ref(database, `notifications/${notificationUserId}`);

        const unsubscribe = onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
                const notificationsData = [];
                snapshot.forEach((childSnapshot) => {
                    notificationsData.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });

                const sortedNotifications = notificationsData.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );

                const previousUnreadCount = unreadCount;
                const newUnreadCount = sortedNotifications.filter(notification => !notification.read).length;

                setNotifications(sortedNotifications);
                setUnreadCount(newUnreadCount);

                if (newUnreadCount > previousUnreadCount) {
                    setHasNewNotifications(true);

                    setTimeout(() => {
                        setHasNewNotifications(false);
                    }, 3000);

                    // Show browser notification if app is in background
                    if (document.hidden && Notification.permission === 'granted') {
                        const latestNotification = sortedNotifications.find(n => !n.read);
                        if (latestNotification) {
                            new Notification(latestNotification.title, {
                                body: latestNotification.body,
                                icon: '/logo-zayid.png',
                                badge: '/logo-zayid.png',
                                tag: latestNotification.data?.auctionId || 'zayid-notification'
                            });
                        }
                    }
                }
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        }, (error) => {
            console.error('Error listening to notifications:', error);
        });

        return unsubscribe;
    };

    // Initialize notifications for the current user
    const initializeNotificationsForUser = async () => {
        if (!user?.uid || !userData) return;

        try {
            setIsLoading(true);

            // Check if notifications are already initialized
            if (permissionStatus.status === 'granted') {
                const notificationUserId = getNotificationUserId();
                if (notificationUserId) {
                    const newStatus = { ...permissionStatus, initialized: true };
                    setPermissionStatus(newStatus);
                    console.log('Notifications already initialized for user:', notificationUserId);
                    return;
                }
            }

            // Check if permission is blocked
            if (isPermissionBlocked()) {
                const newStatus = getPermissionStatus();
                newStatus.initialized = true;
                setPermissionStatus(newStatus);
                return;
            }

            // Initialize notifications
            const result = await initializeNotifications();

            if (result.success && result.token && user?.uid && userData) {
                const notificationUserId = getNotificationUserId();
                if (notificationUserId) {
                    await saveFCMToken(notificationUserId, result.token);

                    const newStatus = getPermissionStatus();
                    newStatus.initialized = true;
                    setPermissionStatus(newStatus);

                    console.log('Notifications initialized successfully for user:', notificationUserId);
                }
            } else {
                console.log('Failed to initialize notifications:', result);
                setInitializationError(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
            setInitializationError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Load user notifications ( real-time listener)
    const loadUserNotifications = async () => {

    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        if (!user?.uid || !userData) return;

        try {
            // Use national ID for notifications path
            const nationalID = userData.nationalID || user.uid;
            await markNotificationAsRead(nationalID, notificationId);

            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );

            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Delete notification
    const removeNotification = async (notificationId) => {
        if (!user?.uid || !userData) return;

        try {
            // Use national ID for notifications path
            const nationalID = userData.nationalID || user.uid;
            await deleteNotification(nationalID, notificationId);

            // Update local state
            setNotifications(prev =>
                prev.filter(notification => notification.id !== notificationId)
            );

            // Update unread count if notification was unread
            const notification = notifications.find(n => n.id === notificationId);
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (!user?.uid || !userData) return;

        try {
            const unreadNotifications = notifications.filter(notification => !notification.read);

            // Mark all unread notifications as read
            const nationalID = userData.nationalID || user.uid;
            await Promise.all(
                unreadNotifications.map(notification =>
                    markNotificationAsRead(nationalID, notification.id)
                )
            );

            // Update local state only for unread notifications, don't overwrite others
            setNotifications(prev =>
                prev.map(notification =>
                    !notification.read ? { ...notification, read: true } : notification
                )
            );

            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    // Retry notification initialization
    const retryInitialization = async () => {
        setInitializationError(null);
        await initializeNotificationsForUser();
    };

    // Manual fetch notifications function
    const fetchNotifications = async () => {
        if (!user?.uid) return;

        try {
            setIsLoading(true);
            const notificationUserId = getNotificationUserId();

            if (!notificationUserId) {
                console.warn('Could not determine notification user ID for fetching');
                return;
            }

            console.log('Manually fetching notifications for user:', notificationUserId);
            const fetchedNotifications = await getUserNotifications(notificationUserId);

            if (fetchedNotifications && fetchedNotifications.length > 0) {
                console.log('Fetched notifications:', fetchedNotifications);
                setNotifications(fetchedNotifications);
                setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
            } else {
                console.log('No notifications found for user:', notificationUserId);
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debug function to check notification path
    const debugNotificationPath = () => {
        const notificationUserId = getNotificationUserId();
        console.log('Debug - User ID for notifications:', notificationUserId);
        console.log('Debug - User data:', userData);
        console.log('Debug - Firebase UID:', user?.uid);
        console.log('Debug - Expected notification path:', `notifications/${notificationUserId}`);

        if (notificationUserId) {
            // Check if the path exists in database
            const notificationsRef = ref(database, `notifications/${notificationUserId}`);
            get(notificationsRef).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log('Debug - Notifications path exists with data:', snapshot.val());
                } else {
                    console.log('Debug - Notifications path does not exist');
                }
            }).catch((error) => {
                console.error('Debug - Error checking notifications path:', error);
            });
        }
    };

    // Get error message for display
    const getErrorMessage = () => {
        switch (initializationError) {
            case 'PERMISSION_BLOCKED':
                return 'Notifications are blocked. Please enable them in your browser settings and refresh the page.';
            case 'PERMISSION_DENIED':
                return 'Notification permission was denied. You can enable notifications in your browser settings.';
            case 'SERVICE_WORKER_FAILED':
                return 'Failed to register notification service. Please refresh the page and try again.';
            case 'UNSUPPORTED_BROWSER':
                return 'Notifications are not supported in this browser.';
            default:
                return initializationError || null;
        }
    };

    // Check if user needs to manually enable notifications
    const needsManualReset = () => {
        return permissionStatus.needsManualReset || initializationError === 'PERMISSION_BLOCKED';
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        permissionStatus,
        initializationError,
        errorMessage: getErrorMessage(),
        needsManualReset: needsManualReset(),
        hasNewNotifications,
        loadUserNotifications,
        markAsRead,
        removeNotification,
        markAllAsRead,
        retryInitialization,
        fetchNotifications,
        debugNotificationPath
    };
}; 