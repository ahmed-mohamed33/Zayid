const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onValueCreated } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendOutbidNotification = onValueCreated("/fcm_notifications/{token}/{id}", async (event) => {
    const notificationData = event.data.val();
    const userToken = event.params.token;

    try {
        const message = {
            notification: {
                title: notificationData.title,
                body: notificationData.body,
                icon: "/logo-zayid.png",
                badge: "/logo-zayid.png",
            },
            data: {
                auctionId: notificationData.auctionId || "",
                action: notificationData.data?.action || "view_auction",
                type: notificationData.type || "outbid",
                click_action: `https://${notificationData.auctionId ? `zayid-itp25.web.app/auction/${notificationData.auctionId}` : 'zayid-itp25.web.app'}`
            },
            token: userToken,
            priority: "high",
            webpush: {
                headers: {
                    Urgency: "high"
                },
                notification: {
                    requireInteraction: true,
                    actions: [
                        {
                            action: "view",
                            title: "عرض المزاد",
                            icon: "/logo-zayid.png"
                        },
                        {
                            action: "dismiss",
                            title: "إغلاق",
                            icon: "/logo-zayid.png"
                        }
                    ]
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);


        await event.data.ref.remove();

        return { success: true, messageId: response };
    } catch (error) {
        console.error("Error sending message:", error);

        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            await event.data.ref.remove();
        }

        return { success: false, error: error.message };
    }
});


exports.sendMultipleNotifications = onRequest(async (req, res) => {
    try {
        const { tokens, notificationData } = req.body;

        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            res.status(400).json({ error: 'Tokens array is required' });
            return;
        }

        const message = {
            notification: {
                title: notificationData.title,
                body: notificationData.body,
                icon: "/logo-zayid.png",
                badge: "/logo-zayid.png",
            },
            data: {
                auctionId: notificationData.auctionId || "",
                action: notificationData.data?.action || "view_auction",
                type: notificationData.type || "outbid",
            },
            tokens: tokens,
            priority: "high"
        };

        const response = await admin.messaging().sendMulticast(message);
        console.log('Successfully sent messages:', response.successCount);
        console.log('Failed to send messages:', response.failureCount);

        res.json({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses
        });
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        res.status(500).json({ error: error.message });
    }
});


async function getAuctionIdToParticipantUserIds(db) {
    const snap = await db.ref('payments').once('value');
    const map = new Map();
    if (!snap.exists()) return map;
    snap.forEach(child => {
        const p = child.val();
        if (!p || !p.auctionId || !p.userId) return;
        const type = (p.type || '').toLowerCase();
        if (type === 'insurance' || type === 'shroot') {
            if (!map.has(p.auctionId)) map.set(p.auctionId, new Set());
            map.get(p.auctionId).add(p.userId);
        }
    });
    return map;
}


async function getUserIdToToken(db) {
    const snap = await db.ref('users').once('value');
    const tokens = new Map();
    if (!snap.exists()) return tokens;
    snap.forEach(child => {
        const userId = child.key;
        const val = child.val();
        const token = val && val.fcmToken && val.fcmToken.token;
        if (token) tokens.set(userId, token);
    });
    return tokens;
}


async function sendMulticastToTokens(admin, tokens, notificationPayload) {
    if (!tokens || tokens.length === 0) return { successCount: 0, failureCount: 0 };
    const message = {
        notification: {
            title: notificationPayload.title,
            body: notificationPayload.body,
            icon: "/logo-zayid.png",
            badge: "/logo-zayid.png",
        },
        data: {
            auctionId: notificationPayload.auctionId || "",
            action: notificationPayload.data?.action || "view_auction",
            type: notificationPayload.type || "info",
        },
        tokens,
        priority: "high",
        webpush: {
            headers: { Urgency: "high" },
            notification: { requireInteraction: true },
        },
    };
    return await admin.messaging().sendMulticast(message);
}


exports.notifyAuctionsStartingSoon = onSchedule({ schedule: 'every 1 minutes', timeZone: 'Etc/UTC' }, async () => {
    const db = admin.database();
    const [auctionsSnap, auctionParticipants, userTokens] = await Promise.all([
        db.ref('auctions').once('value'),
        getAuctionIdToParticipantUserIds(db),
        getUserIdToToken(db),
    ]);

    if (!auctionsSnap.exists()) return { processed: 0 };
    const now = Date.now();
    const windowMs = 1 * 60 * 1000; // 1 minute
    let processed = 0;

    const updates = {};
    const sends = [];

    auctionsSnap.forEach(child => {
        const auctionId = child.key;
        const a = child.val() || {};
        if (!a.startDate || a.status === 'ended') return;
        const startMs = Date.parse(a.startDate);
        if (Number.isNaN(startMs)) return;


        if (startMs > now && startMs - now <= windowMs && a.status !== 'active') {
            const already = a.notificationsSent && a.notificationsSent.startingSoon;
            if (already) return;

            const participantSet = auctionParticipants.get(auctionId) || new Set();
            const tokens = Array.from(participantSet)
                .map(uid => userTokens.get(uid))
                .filter(Boolean);

            if (tokens.length > 0) {
                const title = 'المزاد سيبدأ قريباً ⏳';
                const body = `المزاد "${a.title || ''}" سيبدأ خلال 30 دقيقة. استعد للمزايدة!`;
                const payload = {
                    title,
                    body,
                    auctionId,
                    type: 'auction_participant_auction_starting_soon',
                    data: { action: 'view_auction' },
                };
                sends.push(sendMulticastToTokens(admin, tokens, payload));
                updates[`auctions/${auctionId}/notificationsSent/startingSoon`] = true;
                processed += tokens.length;
            }
        }
    });

    await Promise.all(sends);
    if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
    }

    return { processed };
});


exports.notifyAuctionsEndingSoon = onSchedule({ schedule: 'every 1 minutes', timeZone: 'Etc/UTC' }, async () => {
    const db = admin.database();
    const [auctionsSnap, auctionParticipants, userTokens] = await Promise.all([
        db.ref('auctions').once('value'),
        getAuctionIdToParticipantUserIds(db),
        getUserIdToToken(db),
    ]);

    if (!auctionsSnap.exists()) return { processed: 0 };
    const now = Date.now();
    const windowMs = 1 * 60 * 1000; // 1 minute
    let processed = 0;

    const updates = {};
    const sends = [];

    auctionsSnap.forEach(child => {
        const auctionId = child.key;
        const a = child.val() || {};
        if (!a.endDate || a.status !== 'active') return;
        const endMs = Date.parse(a.endDate);
        if (Number.isNaN(endMs)) return;

        if (endMs > now && endMs - now <= windowMs) {
            const already = a.notificationsSent && a.notificationsSent.endingSoon;
            if (already) return;

            const participantSet = auctionParticipants.get(auctionId) || new Set();
            const tokens = Array.from(participantSet)
                .map(uid => userTokens.get(uid))
                .filter(Boolean);

            if (tokens.length > 0) {
                const title = 'المزاد سينتهي قريباً ⏰';
                const body = `المزاد "${a.title || ''}" سينتهي خلال 30 دقيقة. قدّم مزايدتك الأخيرة الآن!`;
                const payload = {
                    title,
                    body,
                    auctionId,
                    type: 'auction_participant_auction_ending_soon',
                    data: { action: 'view_auction' },
                };
                sends.push(sendMulticastToTokens(admin, tokens, payload));
                updates[`auctions/${auctionId}/notificationsSent/endingSoon`] = true;
                processed += tokens.length;
            }
        }
    });

    await Promise.all(sends);
    if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
    }

    return { processed };
});


async function getInterestedUserIdsByCategory(db, category) {
    if (!category) return new Set();
    const snap = await db.ref('users').once('value');
    const set = new Set();
    if (!snap.exists()) return set;
    snap.forEach(child => {
        const u = child.val() || {};
        const uid = u.userId;
        if (!uid) return;
        const interests = Array.isArray(u.userInterests) ? u.userInterests : (Array.isArray(u.interests) ? u.interests : []);
        const history = Array.isArray(u.biddingHistory) ? u.biddingHistory : [];
        const matches = interests.includes(category) || history.some(b => b?.category === category || b?.auctionCategory === category || b?.categoryId === category);
        if (matches) set.add(uid);
    });
    return set;
}


exports.activateAuctionsAndNotifyStart = onSchedule({ schedule: 'every 1 minutes', timeZone: 'Etc/UTC' }, async () => {
    const db = admin.database();
    const auctionsSnap = await db.ref('auctions').once('value');
    if (!auctionsSnap.exists()) return { activated: 0, notified: 0 };

    const now = Date.now();
    let activated = 0;
    let notified = 0;
    const updates = {};
    const sendPromises = [];

    const userTokens = await getUserIdToToken(db);

    auctionsSnap.forEach(child => {
        const auctionId = child.key;
        const a = child.val() || {};
        if (!a.startDate || a.status === 'ended') return;
        const startMs = Date.parse(a.startDate);
        if (Number.isNaN(startMs)) return;

        if (startMs <= now && a.status === 'approved') {
            updates[`auctions/${auctionId}/status`] = 'active';
            updates[`auctions/${auctionId}/actualStartDate`] = new Date().toISOString();
            activated += 1;

            const alreadyStartedNotified = a.notificationsSent && a.notificationsSent.started;
            if (!alreadyStartedNotified) {

                const category = a.category || a.categoryId;
                sendPromises.push((async () => {
                    const interestedIds = await getInterestedUserIdsByCategory(db, category);
                    const interestedTokens = Array.from(interestedIds).map(uid => userTokens.get(uid)).filter(Boolean);
                    if (interestedTokens.length > 0) {
                        const payloadInterested = {
                            title: 'بدأ المزاد! 🚀',
                            body: `بدأ المزاد "${a.title || ''}" - ابدأ المزايدة الآن!`,
                            auctionId,
                            type: 'auction_started',
                            data: { action: 'view_auction' },
                        };
                        await sendMulticastToTokens(admin, interestedTokens, payloadInterested);
                        notified += interestedTokens.length;
                    }
                })());


                const participantsSetPromise = getAuctionIdToParticipantUserIds(db).then(map => map.get(auctionId) || new Set());
                sendPromises.push((async () => {
                    const participantsSet = await participantsSetPromise;
                    const participantTokens = Array.from(participantsSet).map(uid => userTokens.get(uid)).filter(Boolean);
                    if (participantTokens.length > 0) {
                        const payloadParticipants = {
                            title: 'بدأ المزاد الذي شاركت فيه! 🚀',
                            body: `المزاد "${a.title || ''}" أصبح نشطاً - ابدأ المزايدة الآن!`,
                            auctionId,
                            type: 'auction_participant_auction_started',
                            data: { action: 'view_auction' },
                        };
                        await sendMulticastToTokens(admin, participantTokens, payloadParticipants);
                        notified += participantTokens.length;
                    }
                })());

                updates[`auctions/${auctionId}/notificationsSent/started`] = true;
            }
        }
    });

    await Promise.all(sendPromises);
    if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
    }

    return { activated, notified };
});