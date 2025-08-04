import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDT_A1OngbjNwJEOqHmepDjClNl4N2T6Sg",
  authDomain: "zayid-itp25.firebaseapp.com",
  projectId: "zayid-itp25",
  storageBucket: "zayid-itp25.firebasestorage.app",
  messagingSenderId: "802245016540",
  appId: "1:802245016540:web:43b08451f17ae79249ed19",
  measurementId: "G-7GLVZKTM4X",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const messaging = getMessaging(app);
//  export const analytics = getAnalytics(app);
const db = getFirestore(app);

export async function sendEmail({ to, subject, text, html }) {
  try {
    const docRef = await addDoc(collection(db, "mail"), {
      to: [to], // required array
      message: {
        subject: subject,
        text: text,
        html: html || undefined,
      },
      createdAt: new Date(), // add a timestamp for debugging
    });
    console.log("✅ Email trigger created with ID:", docRef.id);
  } catch (err) {
    // Print the full error for better debugging
    console.error("❌ Failed to send email:", err);
  }
}
