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

// Utility functions for auction notifications

/**
 * Tell users about new approved auction
 * Spams users who dig this category
 */
export const notifyNewAuctionApproved = async (auctionData) => {
    try {
        // Find users who dig this category
        const interestedUsers = await getUsersInterestedInCategory(auctionData.category);

        if (interestedUsers.length > 0) {
            // Spam all interested users
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

/**
 * Tell users auction is live
 * Spams users who dig this category
 */
export const notifyAuctionStarted = async (auctionData) => {
    try {
        // Find users who dig this category
        const interestedUsers = await getUsersInterestedInCategory(auctionData.category);

        if (interestedUsers.length > 0) {
            // Spam all interested users
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

/**
 * Tell users auction is done
 * Spams all users who bid on this auction
 */
export const notifyAuctionEnded = async (auctionData, winnerInfo = null) => {
    try {
        // Find all users who bid on this auction
        const bidders = await getUsersWhoBidOnAuction(auctionData.id);

        if (bidders.length > 0) {
            // Spam all bidders
            const notifications = [];

            for (const userId of bidders) {
                try {
                    // Check if this user is the winner
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

/**
 * Tell specific user auction is live
 */
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

/**
 * Tell specific user about new auction
 */
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

/**
 * Tell specific user auction is done
 */
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

/**
 * Tell participants auction is live
 * Spams users who bought insurance/terms for this auction
 */
export const notifyAuctionParticipantsAboutStart = async (auctionData) => {
    try {
        // Find users who participated in this auction (bought insurance/terms)
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            // Spam all participants
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

/**
 * Send notification to auction participants when auction is ending soon
 * This will notify users who bought insurance or terms for this auction
 */
export const notifyAuctionParticipantsAboutEndingSoon = async (auctionData) => {
    try {
        // Get users who participated in this auction (bought insurance/terms)
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            // Send notifications to all participants
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

/**
 * Send notification to auction participants when auction ends
 * This will notify users who bought insurance or terms for this auction
 */
export const notifyAuctionParticipantsAboutEnd = async (auctionData, winnerInfo = null) => {
    try {
        // Get users who participated in this auction (bought insurance/terms)
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            // Send notifications to all participants
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

/**
 * Send notification to auction participants about new bids
 * This will notify users who bought insurance or terms for this auction
 */
export const notifyAuctionParticipantsAboutNewBid = async (auctionData) => {
    try {
        // Get users who participated in this auction (bought insurance/terms)
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            // Send notifications to all participants
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

/**
 * Send reminder notification to auction participants
 * This will notify users who bought insurance or terms for this auction
 */
export const sendAuctionParticipantReminder = async (auctionData) => {
    try {
        // Get users who participated in this auction (bought insurance/terms)
        const participants = await getUsersWhoParticipatedInAuction(auctionData.id);

        if (participants.length > 0) {
            // Send notifications to all participants
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

/**
 * Send notification to a specific auction participant
 */
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

/**
 * Example usage functions for different auction scenarios
 */

// Example: When admin approves a new auction
export const handleNewAuctionApproval = async (auctionData) => {
    console.log('New auction approved:', auctionData.title);
    await notifyNewAuctionApproved(auctionData);
};

// Example: When auction start time is reached
export const handleAuctionStart = async (auctionData) => {
    console.log('Auction started:', auctionData.title);
    await notifyAuctionStarted(auctionData);
};

// Example: When auction end time is reached
export const handleAuctionEnd = async (auctionData, winnerInfo) => {
    console.log('Auction ended:', auctionData.title);
    await notifyAuctionEnded(auctionData, winnerInfo);
};

// Example: When user manually starts an auction
export const handleManualAuctionStart = async (auctionData) => {
    console.log('Manual auction start:', auctionData.title);
    await notifyAuctionStarted(auctionData);
};

// Example: When auction starts - notify both interested users and participants
export const handleAuctionStartWithParticipants = async (auctionData) => {
    console.log('Auction started with participant notifications:', auctionData.title);

    // Notify interested users (existing functionality)
    await notifyAuctionStarted(auctionData);

    // Notify participants who bought insurance/terms
    await notifyAuctionParticipantsAboutStart(auctionData);
};

// Example: When auction is ending soon (e.g., 1 hour before end)
export const handleAuctionEndingSoon = async (auctionData) => {
    console.log('Auction ending soon:', auctionData.title);
    await notifyAuctionParticipantsAboutEndingSoon(auctionData);
};

// Example: When auction ends - notify both bidders and participants
export const handleAuctionEndWithParticipants = async (auctionData, winnerInfo) => {
    console.log('Auction ended with participant notifications:', auctionData.title);

    // Notify bidders (existing functionality)
    await notifyAuctionEnded(auctionData, winnerInfo);

    // Notify participants who bought insurance/terms
    await notifyAuctionParticipantsAboutEnd(auctionData, winnerInfo);
};

// Example: When a new bid is placed
export const handleNewBidWithParticipantNotification = async (auctionData) => {
    console.log('New bid placed:', auctionData.title);
    await notifyAuctionParticipantsAboutNewBid(auctionData);
};

// Example: Send reminder to participants (e.g., 30 minutes before end)
export const handleParticipantReminder = async (auctionData) => {
    console.log('Sending participant reminder:', auctionData.title);
    await sendAuctionParticipantReminder(auctionData);
};

// Example: Comprehensive auction lifecycle notifications
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