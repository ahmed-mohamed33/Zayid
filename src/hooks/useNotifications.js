import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import {
    initializeNotifications,
    getPermissionStatus,
    isPermissionBlocked,
    saveFCMToken,
    setupForegroundMessageListener,
    getUserNotifications,
    markNotificationAsRead,
    deleteNotification
} from '../utils/notificationService';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/Firebase';

export const useNotifications = () => {
    const { user, userData } = useContext(UserContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState(getPermissionStatus());
    const [initializationError, setInitializationError] = useState(null);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    // Initialize notifications when user is authenticated
    useEffect(() => {
        if (user?.uid && userData) {
            initializeNotificationsForUser();
            const cleanup = setupRealTimeNotificationsListener();

            // Cleanup function
            return () => {
                if (cleanup) cleanup();
            };
        }
    }, [user, userData]);


    const setupRealTimeNotificationsListener = () => {
        if (!user?.uid || !userData) return null;


        const nationalID = userData.nationalID || user.uid;
        const notificationsRef = ref(database, `notifications/${nationalID}`);

        const unsubscribe = onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
                const notificationsData = [];
                snapshot.forEach((childSnapshot) => {
                    notificationsData.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });

                // Sort by timestamp (newest first)
                const sortedNotifications = notificationsData.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );

                // Check if there are new notifications
                const previousUnreadCount = unreadCount;
                const newUnreadCount = sortedNotifications.filter(notification => !notification.read).length;

                setNotifications(sortedNotifications);
                setUnreadCount(newUnreadCount);

                // If there are new unread notifications, show visual feedback
                if (newUnreadCount > previousUnreadCount) {
                    // Set flag for visual animation
                    setHasNewNotifications(true);

                    // Reset animation after 3 seconds
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
                console.log('Notifications already initialized');
                return;
            }

            // Check if permission is blocked
            if (isPermissionBlocked()) {
                setPermissionStatus(getPermissionStatus());
                return;
            }

            // Initialize notifications
            const result = await initializeNotifications();

            if (result.success && result.token && user?.uid && userData) {
                // Use national ID for saving FCM token
                const nationalID = userData.nationalID || user.uid;
                await saveFCMToken(nationalID, result.token);
                setPermissionStatus(getPermissionStatus());
                console.log('Notifications initialized successfully for user:', nationalID);
            } else {
                setInitializationError(result.error);
                console.error('Failed to initialize notifications:', result.error);
            }

            // Setup foreground message listener
            setupForegroundMessageListener((payload) => {
                console.log('Foreground message received:', payload);
                // The real-time listener will automatically update the notifications
            });

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
        retryInitialization
    };
}; 