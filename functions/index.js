const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onValueCreated } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendOutbidNotification = onValueCreated("/fcm_notifications/{token}", async (event) => {
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
                click_action: `https://${notificationData.auctionId ? `your-domain.com/auction/${notificationData.auctionId}` : 'your-domain.com'}`
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

// Function to send notification to multiple users
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