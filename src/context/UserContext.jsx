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
  child,
  update,
} from "firebase/database";
import { auth } from "../config/Firebase";
import { registerUser, loginUser, logoutUser } from "../utils/firebaseUtils";
import {
  uploadToCloudinary,
  uploadMultipleImages as cloudinaryUploadMultiple,
} from "../utils/cloudinaryUtils";
import { v4 as uuidv4 } from "uuid";

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
      console.log("Fetching user data for authenticated user:", user.uid);

      const db = getDatabase();
      const usersRef = ref(db, "users");

      const unsubscribe = onValue(
        usersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("All users data:", data);

            // Find user by Firebase Auth UID
            const userEntry = Object.entries(data).find(
              ([_, userData]) => userData.userId === user.uid
            );

            if (userEntry) {
              const [_, userData] = userEntry;
              console.log("Found user data:", userData);
              setUserData(userData);
              setIsActive(userData.isActive);
              setIsAdmin(userData.isAdmin);
            } else {
              console.log("No user data found for UID:", user.uid);
              setUserData(null);
              setIsActive(false);
              setIsAdmin(false);
            }
          } else {
            console.log("No users data exists");
            setUserData(null);
            setIsActive(false);
            setIsAdmin(false);
          }
        },
        (error) => {
          console.error("Error fetching user data:", error);
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
                currentStatus === "pending"
              ) {
                currentStatus = "active";
                // Update status in database
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
        console.error("Error fetching auctions:", error);
        setAuctions([]);
        setAuctionsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Periodic auction status check
  useEffect(() => {
    const checkAuctionStatuses = async () => {
      if (auctions.length === 0) return;

      const db = getDatabase();
      const now = new Date();

      for (const auction of auctions) {
        const startDate = new Date(auction.startDate);
        const endDate = new Date(auction.endDate);
        const currentStatus = auction.status;

        // Check if auction should be active
        if (now >= startDate && now <= endDate && currentStatus === "pending") {
          await update(ref(db, `auctions/${auction.id}`), { status: "active" });
        }
        // Check if auction should be ended
        else if (now > endDate && currentStatus !== "ended") {
          await update(ref(db, `auctions/${auction.id}`), { status: "ended" });
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkAuctionStatuses, 60000);

    return () => clearInterval(interval);
  }, [auctions]);

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
          console.error("Error fetching auctions:", error);
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
          console.error("Error fetching winners:", error);
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
          console.error("Error fetching payments:", error);
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
      console.error("Login error:", error.message);
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
      console.error("Sign up error:", error.message);
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
      console.error("Update user data error:", error.message);
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
      console.error("Logout error:", error.message);
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
      console.error("Create auction error:", error.message);
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
