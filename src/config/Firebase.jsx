import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyDT_A1OngbjNwJEOqHmepDjClNl4N2T6Sg",
  authDomain: "zayid-itp25.firebaseapp.com",
  projectId: "zayid-itp25",
  storageBucket: "zayid-itp25.firebasestorage.app",
  messagingSenderId: "802245016540",
  appId: "1:802245016540:web:43b08451f17ae79249ed19",
  measurementId: "G-7GLVZKTM4X"
};
const app = initializeApp(firebaseConfig);
 export const auth = getAuth(app);
 export const db = getFirestore(app);
 export const database = getDatabase()
//  export const analytics = getAnalytics(app);





