import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, set, get, child } from 'firebase/database';
import { auth, db } from '../config/Firebase';
import { registerUser, loginUser, logoutUser } from '../utils/firebaseUtils';
import { uploadToCloudinary, uploadMultipleImages as cloudinaryUploadMultiple } from '../utils/cloudinaryUtils';
import { v4 as uuidv4 } from 'uuid';

// Create Context
export const UserContext = createContext();

// Context Provider 
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [userData, setUserData] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [auctions, setAuctions] = useState([]);
  const [winners, setWinners] = useState({}); 
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true); 

  // Real-time listeners
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get data from Realtime Database based on userId
  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const usersRef = ref(db, 'users');
      const userQuery = query(usersRef, orderByChild('userId'), equalTo(user.uid));

      const unsubscribe = onValue(userQuery, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userId = Object.keys(data)[0];
          setUserData({ userId, ...data[userId] });
        } else {
          setUserData(null);
        }
      }, (error) => {
        console.error('Error fetching user data:', error);
        setUserData(null);
      });

      return () => unsubscribe();
    } else {
      setUserData(null);
    }
  }, [user]);

  // Get all auctions (publicly available)
  useEffect(() => {
    const db = getDatabase();
    const auctionsRef = ref(db, 'auctions');

    const unsubscribe = onValue(auctionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allAuctions = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
          startDate: data.startDate || null,
        }));
        setAuctions(allAuctions);
      } else {
        setAuctions([]);
      }
    }, (error) => {
      console.error('Error fetching auctions:', error);
      setAuctions([]);
    });

    return () => unsubscribe();
  }, []);

  // Get Winners Data
  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const winnersRef = ref(db, 'winners');
      const userWinnersQuery = query(winnersRef, orderByChild('userId'), equalTo(user.uid));

      const unsubscribe = onValue(userWinnersQuery, (snapshot) => {
        if (snapshot.exists()) {
          setWinners(snapshot.val());
        } else {
          setWinners({});
        }
      }, (error) => {
        console.error('Error fetching winners:', error);
        setWinners({});
      });

      return () => unsubscribe();
    } else {
      setWinners({});
    }
  }, [user]);

  // Get users Payments
  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const paymentsRef = ref(db, 'payments');
      const userPaymentsQuery = query(paymentsRef, orderByChild('userId'), equalTo(user.uid));

      const unsubscribe = onValue(userPaymentsQuery, (snapshot) => {
        if (snapshot.exists()) {
          const userPayments = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data,
          }));
          setPayments(userPayments);
        } else {
          setPayments([]);
        }
      }, (error) => {
        console.error('Error fetching payments:', error);
        setPayments([]);
      });

      return () => unsubscribe();
    } else {
      setPayments([]);
    }
  }, [user]);

  // Login
  const login = async (email, password) => {
    try {
      const result = await loginUser(email, password);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  // Sign up
  const register = async (values, idImageFile, companyName, companyImageFile) => {
    try {
      const dbRef = ref(getDatabase());
      const userId = uuidv4();
      const nationalIDSnapshot = await get(child(dbRef, `users/${userId}`));
      if (nationalIDSnapshot.exists()) {
        throw new Error('هذا المعرف مسجل بالفعل في النظام');
      }

      const result = await registerUser(values.email, values.password);
      if (!result.success) {
        throw new Error(result.error);
      }
      const { user } = result;
      const userData = {
        birthDate: values.birthDate,
        createdAt: new Date().toISOString(),
        email: values.email,
        fullName: values.fullName,
        isActive: true,
        isAdmin: false,
        isCompany: companyName.trim() !== '',
        isVerified: false,
        nationalID: values.nationalID,
        nationalIDImage: idImageFile,
        phone: values.phone,
        userId: userId,
      };

      if (companyName.trim() !== '') {
        userData.companyName = companyName;
        userData.commercialRecordImage = companyImageFile;
      }

      const db = getDatabase();
      await set(ref(db, `users/${userId}`), userData);
    } catch (error) {
      console.error('Register error:', error.message);
      throw error;
    }
  };

  // Log_out 
  const logout = async () => {
    try {
      const result = await logoutUser();
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  };

  // Create Auction
  const createAuction = async (auctionData, imageFiles) => {
    try {
      if (!user) {
        throw new Error('User must be logged in to create an auction');
      }

      const uploadResult = await cloudinaryUploadMultiple(imageFiles);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      const auctionId = uuidv4();
      const auctionWithImages = {
        ...auctionData,
        imageUrls: uploadResult.urls,
        status: 'pending',
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        insurance: {
          rate: 0.05,
          amount: Math.round(auctionData.startPrice * 0.05),
        },
      };

      const db = getDatabase();
      const auctionsRef = ref(db, `auctions/${auctionId}`);
      await set(auctionsRef, auctionWithImages);

      // تحديث الـ auctions في السياق
      const updatedAuctions = [...auctions, { id: auctionId, ...auctionWithImages }];
      setAuctions(updatedAuctions);
    } catch (error) {
      console.error('Create auction error:', error.message);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        isAuthenticated,
        auctions,
        winners,
        payments,
        loading,
        login,
        register,
        logout,
        createAuction,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};