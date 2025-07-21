import { auth } from '../config/Firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  update,
  query,
  orderByChild,
  equalTo,
  onValue,
  push,
} from 'firebase/database';

// Authentication utilities
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,

    );
    return {
      user: userCredential.user,
      success: true,
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return {
      user: userCredential.user,
      success: true,
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

// Database utilities
export const writeUserData = async (userId, userData) => {
  try {
    const db = getDatabase();
    await set(ref(db, `users/${userId}`), {
      ...userData,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

export const updateUserData = async (userId, updates) => {
  try {
    const db = getDatabase();
    await update(ref(db, `users/${userId}`), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

export const deleteUserData = async (userId) => {
  try {
    const db = getDatabase();
    await remove(ref(db, `users/${userId}`));
    return { success: true };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

// Auction utilities
export const createAuction = async (auctionData) => {
  try {
    const db = getDatabase();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User must be logged in to create an auction');
    }

    // Generate a new auction ID
    const auctionsRef = ref(db, 'auctions');
    const newAuctionRef = push(auctionsRef);
    const auctionId = newAuctionRef.key;

    const auction = {
      ...auctionData,
      status: 'pending',
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      insurance: {
        rate: 0.05,
        amount: Math.round(auctionData.startPrice * 0.05), // 5% of start price
      },
    };

    await set(newAuctionRef, auction);

    return {
      success: true,
      auctionId,
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

export const getAuction = async (auctionId) => {
  try {
    const db = getDatabase();
    const auctionRef = ref(db, `auctions/${auctionId}`);
    const snapshot = await get(auctionRef);

    if (snapshot.exists()) {
      return {
        data: snapshot.val(),
        success: true,
      };
    }
    return {
      data: null,
      success: true,
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

export const updateAuctionStatus = async (auctionId, status) => {
  try {
    const db = getDatabase();
    await update(ref(db, `auctions/${auctionId}`), {
      status,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

// Real-time listeners
export const subscribeToUserData = (userId, callback) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);

  const unsubscribe = onValue(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ data: snapshot.val(), exists: true });
      } else {
        callback({ data: null, exists: false });
      }
    },
    (error) => {
      callback({ error: error.message, exists: false });
    }
  );

  return unsubscribe;
};

export const subscribeToAllUsers = (callback) => {
  const db = getDatabase();
  const usersRef = ref(db, 'users');

  const unsubscribe = onValue(
    usersRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ data: snapshot.val(), exists: true });
      } else {
        callback({ data: null, exists: false });
      }
    },
    (error) => {
      callback({ error: error.message, exists: false });
    }
  );

  return unsubscribe;
};

export const subscribeToAuction = (auctionId, callback) => {
  const db = getDatabase();
  const auctionRef = ref(db, `auctions/${auctionId}`);

  const unsubscribe = onValue(
    auctionRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ data: snapshot.val(), exists: true });
      } else {
        callback({ data: null, exists: false });
      }
    },
    (error) => {
      callback({ error: error.message, exists: false });
    }
  );

  return unsubscribe;
};

// Query utilities
export const getUserByEmail = async (email) => {
  try {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const emailQuery = query(usersRef, orderByChild('email'), equalTo(email));

    const snapshot = await get(emailQuery);
    if (snapshot.exists()) {
      return {
        data: snapshot.val(),
        success: true,
      };
    }
    return {
      data: null,
      success: true,
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

// Auth state observer
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

/////////////////////// profile ////////////////////////////
// get user activiries
export const getUserActivities = async (userId) => {
  try {
    const db = getDatabase();

    // Fetch all payments
    const paymentsSnap = await get(ref(db, 'payments'));
    const paymentsData = paymentsSnap.exists() ? paymentsSnap.val() : {};

    // Filter payments related to this user (insurance or shroot)
    const userPayments = Object.values(paymentsData).filter(
      (p) => p.userId === userId && ['insurance', 'shroot'].includes(p.type)
    );

    // Get unique auction IDs
    const auctionIds = [...new Set(userPayments.map((p) => p.auctionId))];

    const activities = await Promise.all(
      auctionIds.map(async (auctionId) => {
        const auctionSnap = await get(ref(db, `auctions/${auctionId}`));
        const auction = auctionSnap.val();

        const insurancePayment = userPayments.find(
          (p) => p.auctionId === auctionId && p.type === 'insurance'
        );
        const shrootPayment = userPayments.find(
          (p) => p.auctionId === auctionId && p.type === 'shroot'
        );

        return {
          name: auction?.title || 'غير معروف',
          auctionStatus: auction?.status === 'active' ? 'جاري' : 'منتهي',
          insurance: insurancePayment ? 'تم الدفع' : 'لم يتم الدفع',
          chair: shrootPayment ? 'تم الشراء' : 'لم تُشترى',
        };
      })
    );

    return { data: activities, success: true };
  } catch (error) {
    return { error: error.message, success: false };
  }
};

// Get all auctions created by specific user
export const getAuctionsByUser = async (userId) => {
  try {
    const db = getDatabase();
    const auctionsRef = ref(db, 'auctions');
    const snapshot = await get(auctionsRef);

    if (!snapshot.exists()) {
      return { data: null, success: true };
    }

    const allAuctions = snapshot.val();

    const userAuctions = Object.entries(allAuctions)
      .filter(([_, auction]) => auction.createdBy === userId)
      .reduce((acc, [id, auction]) => {
        acc[id] = auction;
        return acc;
      }, {});

    return {
      data: userAuctions,
      success: true,
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
};

// Get all auctions the user has won

export const getWonAuctionsByUser = async (userId) => {
  try {
    const db = getDatabase();
    const winnersRef = ref(db, 'winners');
    const snapshot = await get(winnersRef);

    if (snapshot.exists()) {
      const winnersData = snapshot.val();

      // رجعي كل المزادات اللي المستخدم كسبها
      const userWins = Object.entries(winnersData)
        .filter(([auctionId, value]) => value.userId === userId)
        .map(([auctionId, value]) => ({
          auctionId,
          ...value,
        }));

      return {
        data: userWins,
        success: true,
      };
    }

    return {
      data: [],
      success: true,
    };
  } catch (error) {
    console.error('❌ Error fetching won auctions:', error);
    return {
      error: error.message,
      success: false,
    };
  }
};