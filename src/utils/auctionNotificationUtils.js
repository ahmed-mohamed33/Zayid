import {
    sendAuctionStartedNotification,
    sendAuctionEndedNotification,
    sendNewAuctionApprovedNotification,
    sendNewAuctionApprovedToInterestedUsers,
    sendAuctionStartedToInterestedUsers,
    getUsersInterestedInCategory,
    getUsersWhoBidOnAuction,
    getUsersWhoParticipatedInAuction,
    sendAuctionParticipantNotification,
    sendAuctionParticipantNotificationToAll
} from './notificationService';


export const notifyNewAuctionApproved = async (auctionData) => {
    try {
        const interestedUsers = await getUsersInterestedInCategory(auctionData.category);

        if (interestedUsers.length > 0) {
            await sendNewAuctionApprovedToInterestedUsers(auctionData, interestedUsers);
            console.log(`Notified ${interestedUsers.length} users about new auction: ${auctionData.title}`);
        } else {
            console.log('No interested users found for category:', auctionData.category);
        }

        return interestedUsers.length;
    } catch (error) {
        console.error('Error notifying about new auction approval:', error);
        throw error;
    }
};


export const notifyAuctionStarted = async (auctionData) => {
    try {
        const interestedUsers = await getUsersInterestedInCategory(auctionData.category);

        if (interestedUsers.length > 0) {
            await sendAuctionStartedToInterestedUsers(auctionData, interestedUsers);
            console.log(`Notified ${interestedUsers.length} users about auction start: ${auctionData.title}`);
        } else {
            console.log('No interested users found for category:', auctionData.category);
        }

        return interestedUsers.length;
    } catch (error) {
        console.error('Error notifying about auction start:', error);
        throw error;
    }
};


export const notifyAuctionEnded = async (auctionData, winnerInfo = null) => {
    try {
        const bidders = await getUsersWhoBidOnAuction(auctionData.id);

        if (bidders.length > 0) {
            const notifications = [];

            for (const userId of bidders) {
                try {
                    const isWinner = winnerInfo && winnerInfo.userId === userId;
                    const userWinnerInfo = isWinner ? winnerInfo : null;

                    await sendAuctionEndedNotification(userId, auctionData, userWinnerInfo);
                    notifications.push(userId);
                } catch (error) {
                    console.error(`Error sending auction ended notification to user ${userId}:`, error);
                }
            }

            console.log(`Notified ${notifications.length} users about auction end: ${auctionData.title}`);
            return notifications.length;
        } else {
            console.log('No bidders found for auction:', auctionData.id);
            return 0;
        }
    } catch (error) {
        console.error('Error notifying about auction end:', error);
        throw error;
    }
};


export const notifyUserAboutAuctionStart = async (userId, auctionData) => {
    try {
        await sendAuctionStartedNotification(userId, auctionData);
        console.log(`Notified user ${userId} about auction start: ${auctionData.title}`);
        return true;
    } catch (error) {
        console.error('Error notifying user about auction start:', error);
        throw error;
    }
};


export const notifyUserAboutNewAuction = async (userId, auctionData) => {
    try {
        await sendNewAuctionApprovedNotification(userId, auctionData);
        console.log(`Notified user ${userId} about new auction: ${auctionData.title}`);
        return true;
    } catch (error) {
        console.error('Error notifying user about new auction:', error);
        throw error;
    }
};


export const notifyUserAboutAuctionEnd = async (userId, auctionData, winnerInfo = null) => {
    try {
        await sendAuctionEndedNotification(userId, auctionData, winnerInfo);
        console.log(`Notified user ${userId} about auction end: ${auctionData.title}`);
        return true;
    } catch (error) {
        console.error('Error notifying user about auction end:', error);
        throw error;
    }
};


export const notifyAuctionParticipantsAboutStart = async (auctionData) => {
    try {
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            await sendAuctionParticipantNotificationToAll(auctionData, 'auction_started');
            console.log(`Notified ${participants.length} participants about auction start: ${auctionData.title}`);
        } else {
            console.log('No participants found for auction:', auctionData.id);
        }

        return participants.length;
    } catch (error) {
        console.error('Error notifying auction participants about start:', error);
        throw error;
    }
};


export const notifyAuctionParticipantsAboutEndingSoon = async (auctionData) => {
    try {
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            await sendAuctionParticipantNotificationToAll(auctionData, 'auction_ending_soon');
            console.log(`Notified ${participants.length} participants about auction ending soon: ${auctionData.title}`);
        } else {
            console.log('No participants found for auction:', auctionData.id);
        }

        return participants.length;
    } catch (error) {
        console.error('Error notifying auction participants about ending soon:', error);
        throw error;
    }
};


export const notifyAuctionParticipantsAboutEnd = async (auctionData, winnerInfo = null) => {
    try {
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            await sendAuctionParticipantNotificationToAll(auctionData, 'auction_ended');
            console.log(`Notified ${participants.length} participants about auction end: ${auctionData.title}`);
        } else {
            console.log('No participants found for auction:', auctionData.id);
        }

        return participants.length;
    } catch (error) {
        console.error('Error notifying auction participants about end:', error);
        throw error;
    }
};


export const notifyAuctionParticipantsAboutNewBid = async (auctionData) => {
    try {
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            await sendAuctionParticipantNotificationToAll(auctionData, 'new_bid');
            console.log(`Notified ${participants.length} participants about new bid: ${auctionData.title}`);
        } else {
            console.log('No participants found for auction:', auctionData.id);
        }

        return participants.length;
    } catch (error) {
        console.error('Error notifying auction participants about new bid:', error);
        throw error;
    }
};


export const sendAuctionParticipantReminder = async (auctionData) => {
    try {
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            await sendAuctionParticipantNotificationToAll(auctionData, 'auction_reminder');
            console.log(`Sent reminder to ${participants.length} participants: ${auctionData.title}`);
        } else {
            console.log('No participants found for auction:', auctionData.id);
        }

        return participants.length;
    } catch (error) {
        console.error('Error sending auction participant reminder:', error);
        throw error;
    }
};


export const notifySpecificAuctionParticipant = async (userId, auctionData, notificationType) => {
    try {
        await sendAuctionParticipantNotification(userId, auctionData, notificationType);
        console.log(`Notified participant ${userId} about ${notificationType}: ${auctionData.title}`);
        return true;
    } catch (error) {
        console.error('Error notifying specific auction participant:', error);
        throw error;
    }
};


export const handleNewAuctionApproval = async (auctionData) => {
    console.log('New auction approved:', auctionData.title);
    await notifyNewAuctionApproved(auctionData);
};

export const handleAuctionStart = async (auctionData) => {
    console.log('Auction started:', auctionData.title);
    await notifyAuctionStarted(auctionData);
};

export const handleAuctionEnd = async (auctionData, winnerInfo) => {
    console.log('Auction ended:', auctionData.title);
    await notifyAuctionEnded(auctionData, winnerInfo);
};

export const handleManualAuctionStart = async (auctionData) => {
    console.log('Manual auction start:', auctionData.title);
    await notifyAuctionStarted(auctionData);
};

export const handleAuctionStartWithParticipants = async (auctionData) => {
    console.log('Auction started with participant notifications:', auctionData.title);

    await notifyAuctionStarted(auctionData);

    await notifyAuctionParticipantsAboutStart(auctionData);
};

export const handleAuctionEndingSoon = async (auctionData) => {
    console.log('Auction ending soon:', auctionData.title);
    await notifyAuctionParticipantsAboutEndingSoon(auctionData);
};

export const handleAuctionEndWithParticipants = async (auctionData, winnerInfo) => {
    console.log('Auction ended with participant notifications:', auctionData.title);

    await notifyAuctionEnded(auctionData, winnerInfo);

    await notifyAuctionParticipantsAboutEnd(auctionData, winnerInfo);
};

export const handleNewBidWithParticipantNotification = async (auctionData) => {
    console.log('New bid placed:', auctionData.title);
    await notifyAuctionParticipantsAboutNewBid(auctionData);
};

export const handleParticipantReminder = async (auctionData) => {
    console.log('Sending participant reminder:', auctionData.title);
    await sendAuctionParticipantReminder(auctionData);
};

export const handleCompleteAuctionLifecycle = async (auctionData, event, winnerInfo = null) => {
    console.log(`Auction lifecycle event: ${event}`, auctionData.title);

    switch (event) {
        case 'started':
            await handleAuctionStartWithParticipants(auctionData);
            break;
        case 'ending_soon':
            await handleAuctionEndingSoon(auctionData);
            break;
        case 'new_bid':
            await handleNewBidWithParticipantNotification(auctionData);
            break;
        case 'reminder':
            await handleParticipantReminder(auctionData);
            break;
        case 'ended':
            await handleAuctionEndWithParticipants(auctionData, winnerInfo);
            break;
        default:
            console.log('Unknown auction lifecycle event:', event);
    }
}; 