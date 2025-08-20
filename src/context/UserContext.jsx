import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
  set,
  get,
  update,
} from "firebase/database";
import { auth } from "../config/Firebase";
import { registerUser, loginUser, logoutUser } from "../utils/firebaseUtils";
import { uploadMultipleImages as cloudinaryUploadMultiple } from "../utils/cloudinaryUtils";
import { v4 as uuidv4 } from "uuid";
import { ensureWebTokenRegistration } from "../utils/notificationService";

// Create Context
export const UserContext = createContext();

// Context Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [winners, setWinners] = useState({});
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAuctions, setUserAuctions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Real-time listeners
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update the user data fetching useEffect
  useEffect(() => {
    if (user && isAuthenticated) {
      const db = getDatabase();
      const usersRef = ref(db, "users");

      const unsubscribe = onValue(
        usersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Find user by Firebase Auth UID
            const userEntry = Object.entries(data).find(
              ([_, userData]) => userData.userId === user.uid
            );

            if (userEntry) {
              const [_, userData] = userEntry;
              setUserData(userData);
              setIsActive(userData.isActive);
              setIsAdmin(userData.isAdmin);
            } else {
              setUserData(null);
              setIsActive(false);
              setIsAdmin(false);
            }
          } else {
            setUserData(null);
            setIsActive(false);
            setIsAdmin(false);
          }
        },
        (error) => {
          setUserData(null);
          setIsActive(false);
          setIsAdmin(false);
        }
      );

      return () => unsubscribe();
    } else {
      setUserData(null);
      setIsActive(false);
      setIsAdmin(false);
    }
  }, [user, isAuthenticated]);

  // Initialize web notifications when user is authenticated
  useEffect(() => {
    if (user && userData && isActive) {
      const initializeUserNotifications = async () => {
        try {
          console.log("Initializing web notifications for user:", user.uid);

          // Get the national ID for the user
          const nationalID = userData.nationalID || user.uid;

          // Ensure web FCM token is registered
          const webToken = await ensureWebTokenRegistration(nationalID);

          if (webToken) {
            console.log(
              "Web FCM token successfully registered for user:",
              nationalID
            );
          } else {
            console.log(
              "Web FCM token registration failed for user:",
              nationalID
            );
          }
        } catch (error) {
          console.error("Error initializing user notifications:", error);
        }
      };

      // Delay initialization slightly to ensure everything is ready
      const timer = setTimeout(initializeUserNotifications, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, userData, isActive]);

  // Get all auctions (publicly available)
  useEffect(() => {
    const db = getDatabase();
    const auctionsRef = ref(db, "auctions");

    setAuctionsLoading(true);

    const unsubscribe = onValue(
      auctionsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const allAuctions = Object.entries(snapshot.val()).map(
            // 14-7 2:40 am عملت تعديل اخير هنا عملت الحسبه هنا علشان تكون ف الافيكت
            async ([id, data]) => {
              const startDate = new Date(data.startDate || null);
              const endDate = new Date(data.endDate || null);
              const now = new Date();

              let remainingTime = "";
              let currentStatus = data.status || "pending";

              // Check if auction should be active
              if (
                now >= startDate &&
                now <= endDate &&
                currentStatus === "approved"
              ) {
                currentStatus = "active";

                await update(ref(db, `auctions/${id}`), { status: "active" });
              }

              // Check if auction should be ended
              else if (now > endDate && currentStatus !== "ended") {
                currentStatus = "ended";
                // Update status in database
                await update(ref(db, `auctions/${id}`), { status: "ended" });
              }

              const diffMs = startDate - now;

              if (diffMs > 0) {
                const totalMinutes = Math.floor(diffMs / (1000 * 60));
                const diffDays = Math.floor(totalMinutes / (60 * 24));
                const diffHours = Math.floor((totalMinutes % (60 * 24)) / 60);
                const diffMinutes = totalMinutes % 60;

                if (diffDays > 0) {
                  remainingTime = `${diffDays} ي  ${diffHours} س`;
                } else if (diffHours > 0) {
                  remainingTime = `${diffHours} س ${diffMinutes} د`;
                } else {
                  remainingTime = `${diffMinutes} د`;
                }
              } else {
                remainingTime = "انتهي ";
              }

              return {
                id,
                ...data,
                status: currentStatus,
                startDate: data.startDate || null,
                endDate: data.endDate || null,
                remainingTime: remainingTime,
                highestBid: data.highestBid || "0 ج.م",
              };
            }
          );

          Promise.all(allAuctions).then((resolvedAuctions) => {
            setAuctions(resolvedAuctions);
            setAuctionsLoading(false);
          });
        } else {
          // sellllllllllllllllllllim
          setAuctions([]);
          setAuctionsLoading(false);
        }
      },
      (error) => {
        setAuctions([]);
        setAuctionsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Get Auction that user participated in
  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const auctionsRef = ref(db, "auctions");
      const userAuctionsQuery = query(
        auctionsRef,
        orderByChild("createdBy"),
        equalTo(user.uid)
      );

      const unsubscribe = onValue(
        userAuctionsQuery,
        (snapshot) => {
          if (snapshot.exists()) {
            const auctionsByuser = Object.entries(snapshot.val()).map(
              // 14-7 2:40 am عملت نفس اتعديل هنا بتاع ال وقت المتبقي
              ([id, data]) => {
                const startDate = new Date(data.startDate || null);
                const now = new Date();

                let remainingTime = "";

                const diffMs = startDate - now;

                if (diffMs > 0) {
                  const totalMinutes = Math.floor(diffMs / (1000 * 60));
                  const diffDays = Math.floor(totalMinutes / (60 * 24));
                  const diffHours = Math.floor((totalMinutes % (60 * 24)) / 60);
                  const diffMinutes = totalMinutes % 60;

                  if (diffDays > 0) {
                    remainingTime = `${diffDays}  ي ${diffHours} س`;
                  } else if (diffHours > 0) {
                    remainingTime = `${diffHours}  س ${diffMinutes} د`;
                  } else {
                    remainingTime = `${diffMinutes} د`;
                  }
                } else {
                  remainingTime = "بدأ بالفعل";
                }

                return {
                  id,
                  ...data,
                  startDate: data.startDate || null,
                  remainingTime: remainingTime,
                  highestBid: data.highestBid || "0 ج.م",
                };
              }
            );
            setUserAuctions(auctionsByuser);
          } else {
            setUserAuctions([]);
          }
        },
        (error) => {
          setUserAuctions([]);
        }
      );

      return () => unsubscribe();
    } else {
      setUserAuctions([]);
    }
  }, [user]);

  // Get Winners Data
  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const winnersRef = ref(db, "winners");
      const userWinnersQuery = query(
        winnersRef,
        orderByChild("userId"),
        equalTo(user.uid)
      );

      const unsubscribe = onValue(
        userWinnersQuery,
        (snapshot) => {
          if (snapshot.exists()) {
            setWinners(snapshot.val());
          } else {
            setWinners({});
          }
        },
        (error) => {
          setWinners({});
        }
      );

      return () => unsubscribe();
    } else {
      setWinners({});
    }
  }, [user]);

  // Get users Payments
  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const paymentsRef = ref(db, "payments");
      const userPaymentsQuery = query(
        paymentsRef,
        orderByChild("userId"),
        equalTo(user.uid)
      );

      const unsubscribe = onValue(
        userPaymentsQuery,
        (snapshot) => {
          if (snapshot.exists()) {
            const userPayments = Object.entries(snapshot.val()).map(
              ([id, data]) => ({
                id,
                ...data,
              })
            );
            setPayments(userPayments);
          } else {
            setPayments([]);
          }
        },
        (error) => {
          setPayments([]);
        }
      );

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

      // After successful login, get user data
      const { user } = result;
      const database = getDatabase(); // Use getDatabase() instead of db
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const userEntry = Object.entries(data).find(
          ([_, userData]) => userData.userId === user.uid
        );

        if (userEntry) {
          const [_, userData] = userEntry;
          setUserData(userData);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // Sign up
  const register = async (
    values,
    idImageFile,
    companyName,
    companyImageFile
  ) => {
    try {
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
        isActive: false,
        isAdmin: false,
        isCompany: companyName && companyName.trim() !== "",
        isVerified: false,
        nationalID: values.nationalID,
        nationalIDImage: idImageFile,
        phone: values.phone,
        userId: user.uid,
        onboardingCompleted: false,
        userInterests: [],
        profileImage: "",
      };

      if (companyName && companyName.trim() !== "") {
        userData.companyName = companyName;
        userData.commercialRecordImage = companyImageFile;
      }

      const database = getDatabase();
      await set(ref(database, `users/${values.nationalID}`), userData);

      setUserData(userData);
    } catch (error) {
      throw error;
    }
  };

  // Update User Data
  const updateUserData = async (updates) => {
    try {
      if (!user || !userData) {
        throw new Error("User must be logged in and have existing data");
      }

      const database = getDatabase();
      const updatedUserData = { ...updates };

      // Update in database using nationalID as key
      await update(
        ref(database, `users/${userData.nationalID}`),
        updatedUserData
      );

      // Update local state
      setUserData({ ...userData, ...updatedUserData });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
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
      throw error;
    }
  };

  // Create Auction
  const createAuction = async (auctionData, imageFiles) => {
    try {
      if (!user) {
        throw new Error("User must be logged in to create an auction");
      }

      const uploadResult = await cloudinaryUploadMultiple(imageFiles);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      //هنا بحسب الوقت الكلي الثابت وقت اضافه المزاد 11:15  12-7
      const startDate = new Date(auctionData.startDate || null);
      const endDate = new Date(auctionData.endDate || null);
      const now = new Date();

      // حساب الـ allTime
      const allTime =
        endDate && startDate
          ? ((endDate - startDate) / (1000 * 60 * 60 * 24)).toFixed(0)
          : 0;

      // حساب الـ remainingTime
      let remainingTime = "";
      const diffMs = startDate - now;
      if (diffMs > 0) {
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const diffDays = Math.floor(totalMinutes / (60 * 24));
        const diffHours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const diffMinutes = totalMinutes % 60;

        if (diffDays > 0) {
          remainingTime = `${diffDays}  ي${diffHours} س`;
        } else if (diffHours > 0) {
          remainingTime = `${diffHours}  س ${diffMinutes} د`;
        } else {
          remainingTime = `${diffMinutes} د`;
        }
      } else {
        remainingTime = "بدأ بالفعل";
      }

      const auctionId = uuidv4();
      const auctionWithImages = {
        ...auctionData,
        imageUrls: uploadResult.urls,
        status: "pending",
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        insurance: {
          rate: 0.05,
          amount: Math.round(auctionData.startPrice * 0.05),
        },

        //هنا بخزن ف الداتا بيز الوقت الكلي الثابت 11:15  12-7
        allTime: parseInt(allTime),
        //      هنا انا بخزن الوقت المتبقي
        remainingTime: remainingTime,
        // حاله المنتج
        productCondition: auctionData.productCondition,
      };

      const database = getDatabase(); // Use getDatabase() instead of db
      const auctionsRef = ref(database, `auctions/${auctionId}`);
      await set(auctionsRef, auctionWithImages);

      //  updatedAuctions
      const updatedAuctions = [
        ...auctions,
        { id: auctionId, ...auctionWithImages },
      ];
      setAuctions(updatedAuctions);
    } catch (error) {
      throw error;
    }
  };

  //Provider
  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        isAuthenticated,
        setAuctions,
        auctions,
        auctionsLoading,
        winners,
        payments,
        loading,
        userAuctions,
        login,
        register,
        logout,
        updateUserData,
        setUserData,
        createAuction,
        isActive,
        isAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
