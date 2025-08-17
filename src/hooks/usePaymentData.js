import { useState, useEffect, useMemo, useCallback } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, get } from 'firebase/database';

export const usePaymentData = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [users, setUsers] = useState({});
    const [auctions, setAuctions] = useState({});
    const [rawPayments, setRawPayments] = useState([]);

    // Memoize database reference to prevent recreation
    const db = useMemo(() => getDatabase(), []);

    // Fetch users data for mapping
    useEffect(() => {
        const usersRef = ref(db, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                setUsers(usersData);
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch auctions data for mapping
    useEffect(() => {
        const auctionsRef = ref(db, 'auctions');
        const unsubscribe = onValue(auctionsRef, (snapshot) => {
            if (snapshot.exists()) {
                const auctionsData = snapshot.val();
                setAuctions(auctionsData);
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch raw payments data (separate from enrichment)
    useEffect(() => {
        setLoading(true);
        setError(null);

        try {
            // Query payments ordered by timestamp
            const paymentsRef = query(
                ref(db, 'payments'),
                orderByChild('timestamp')
            );

            const unsubscribe = onValue(
                paymentsRef,
                (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        const paymentsArray = Object.entries(data).map(([id, payment]) => ({
                            id,
                            ...payment,
                            // Ensure timestamp exists
                            timestamp: payment.timestamp || payment.createdAt || new Date().toISOString(),
                            // Normalize amount to number
                            amount: Number(payment.amount) || 0,
                            fee: Number(payment.fee) || 0,
                        }));

                        setRawPayments(paymentsArray);
                        setError(null);
                    } else {
                        setRawPayments([]);
                    }
                    setLoading(false);
                },
                (error) => {
                    setError(error.message || 'حدث خطأ في تحميل البيانات');
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (error) {
            setError(error.message || 'حدث خطأ في الاتصال بقاعدة البيانات');
            setLoading(false);
        }
    }, [db]);

    // Enrich payments with user and auction data (memoized)
    const enrichedPayments = useMemo(() => {
        if (rawPayments.length === 0) return [];

        const enriched = rawPayments.map(payment => {
            // Enrich payment with user details
            const paymentUserId = payment.userId; // This is Firebase Auth UID

            // Find user by searching through all users for matching userId property
            let user = null;
            if (paymentUserId) {
                user = Object.values(users).find(u => u.userId === paymentUserId);
            }

            // If still not found, try other fallback methods
            if (!user && paymentUserId) {
                user = Object.values(users).find(u =>
                    u.id === paymentUserId ||
                    u.nationalID === paymentUserId ||
                    u.email === payment.userEmail
                );
            }

            // Enrich payment with auction details
            const auction = payment.auctionId ? auctions[payment.auctionId] : null;

            return {
                ...payment,
                // Enhanced user information
                userName: user?.fullName || user?.username || payment.userName || `مستخدم (${paymentUserId?.substring(0, 8)}...)`,
                userEmail: user?.email || payment.userEmail || 'غير محدد',
                userPhone: user?.phone || payment.userPhone || 'غير محدد',
                userType: user?.isCompany ? 'شركة' : 'فرد',
                userStatus: user?.isActive === true ? 'نشط' : user?.isActive === false ? 'غير نشط' : 'غير محدد',

                // Enhanced auction information
                auctionTitle: auction?.title || payment.auctionTitle || 'غير محدد',
                auctionCategory: auction?.category || payment.auctionCategory,
                auctionStartPrice: auction?.startPrice || payment.auctionStartPrice,
                auctionStatus: auction?.status || payment.auctionStatus,
                auctionCreatedBy: auction?.createdBy,
                auctionEndDate: auction?.endDate,
                auctionImages: auction?.imageUrls || auction?.images,
            };
        });

        // Sort by timestamp descending (newest first)
        enriched.sort((a, b) => {
            const dateA = new Date(a.timestamp || a.createdAt || 0);
            const dateB = new Date(b.timestamp || b.createdAt || 0);
            return dateB - dateA;
        });

        return enriched;
    }, [rawPayments, users, auctions]);

    // Update payments state when enriched data changes
    useEffect(() => {
        setPayments(enrichedPayments);
        if (enrichedPayments.length > 0) {
            setLastUpdated(new Date());
        }
    }, [enrichedPayments]);

    // Calculate total statistics
    const totalStats = useMemo(() => {
        if (payments.length === 0) {
            return {
                total: 0,
                totalAmount: 0,
                totalFees: 0,
                paid: 0,
                paidAmount: 0,
                pending: 0,
                pendingAmount: 0,
                failed: 0,
                failedAmount: 0,
                refunded: 0,
                refundedAmount: 0,
                cancelled: 0,
                cancelledAmount: 0,
                byMethod: {},
                byType: {},
                byDate: {},
                averageAmount: 0,
                successRate: 0
            };
        }

        const stats = {
            total: payments.length,
            totalAmount: 0,
            totalFees: 0,
            paid: 0,
            paidAmount: 0,
            pending: 0,
            pendingAmount: 0,
            failed: 0,
            failedAmount: 0,
            refunded: 0,
            refundedAmount: 0,
            cancelled: 0,
            cancelledAmount: 0,
            byMethod: {},
            byType: {},
            byDate: {},
        };

        payments.forEach(payment => {
            const amount = Number(payment.amount) || 0;
            const fee = Number(payment.fee) || 0;

            stats.totalAmount += amount;
            stats.totalFees += fee;

            // Count by status
            switch (payment.status) {
                case 'paid':
                    stats.paid++;
                    stats.paidAmount += amount;
                    break;
                case 'pending':
                    stats.pending++;
                    stats.pendingAmount += amount;
                    break;
                case 'failed':
                    stats.failed++;
                    stats.failedAmount += amount;
                    break;
                case 'refunded':
                    stats.refunded++;
                    stats.refundedAmount += amount;
                    break;
                case 'cancelled':
                    stats.cancelled++;
                    stats.cancelledAmount += amount;
                    break;
            }

            // Group by method
            const method = payment.method || 'unknown';
            if (!stats.byMethod[method]) {
                stats.byMethod[method] = { count: 0, amount: 0 };
            }
            stats.byMethod[method].count++;
            stats.byMethod[method].amount += amount;

            // Group by type
            const type = payment.type || 'unknown';
            if (!stats.byType[type]) {
                stats.byType[type] = { count: 0, amount: 0 };
            }
            stats.byType[type].count++;
            stats.byType[type].amount += amount;

            // Group by date (daily)
            const date = new Date(payment.timestamp || payment.createdAt || new Date())
                .toISOString().split('T')[0];
            if (!stats.byDate[date]) {
                stats.byDate[date] = { count: 0, amount: 0 };
            }
            stats.byDate[date].count++;
            stats.byDate[date].amount += amount;
        });

        // Calculate derived metrics
        stats.averageAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;
        stats.successRate = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;

        return stats;
    }, [payments]);

    const getPaymentsByDateRange = useCallback((startDate, endDate) => {
        return payments.filter(payment => {
            const paymentDate = new Date(payment.timestamp || payment.createdAt);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return paymentDate >= start && paymentDate <= end;
        });
    }, [payments]);

    const getPaymentsByStatus = useCallback((status) => {
        return payments.filter(payment => payment.status === status);
    }, [payments]);

    const getPaymentsByMethod = useCallback((method) => {
        return payments.filter(payment => payment.method === method);
    }, [payments]);

    const getPaymentsByType = useCallback((type) => {
        return payments.filter(payment => payment.type === type);
    }, [payments]);

    const getRecentPayments = useCallback((limit = 10) => {
        return payments.slice(0, limit);
    }, [payments]);

    const getTopPaymentsByAmount = useCallback((limit = 10) => {
        return [...payments]
            .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
            .slice(0, limit);
    }, [payments]);

    const searchPayments = useCallback((searchTerm) => {
        if (!searchTerm) return payments;

        const term = searchTerm.toLowerCase();
        return payments.filter(payment =>
            payment.id?.toLowerCase().includes(term) ||
            payment.userId?.toLowerCase().includes(term) ||
            payment.userEmail?.toLowerCase().includes(term) ||
            payment.userName?.toLowerCase().includes(term) ||
            payment.transactionId?.toLowerCase().includes(term) ||
            payment.method?.toLowerCase().includes(term) ||
            payment.type?.toLowerCase().includes(term) ||
            payment.description?.toLowerCase().includes(term) ||
            payment.auctionTitle?.toLowerCase().includes(term) ||
            payment.auctionCategory?.toLowerCase().includes(term)
        );
    }, [payments]);

    const refetch = useCallback(() => {
        setLoading(true);
        setError(null);
        // The useEffect will handle the refetch automatically
    }, []);

    return {
        // Data
        payments,
        totalStats,
        loading,
        error,
        lastUpdated,

        // Utility functions
        getPaymentsByDateRange,
        getPaymentsByStatus,
        getPaymentsByMethod,
        getPaymentsByType,
        getRecentPayments,
        getTopPaymentsByAmount,
        searchPayments,
        refetch,
    };
}; 
