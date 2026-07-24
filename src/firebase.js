import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDrhLd0oPcIvSXxp8wgjGsed47B-1f6S9I",
  authDomain: "tranferfiles-8cdd0.firebaseapp.com",
  projectId: "tranferfiles-8cdd0",
  storageBucket: "tranferfiles-8cdd0.firebasestorage.app",
  messagingSenderId: "752314837781",
  appId: "1:752314837781:web:8fef3168606a57c56c571c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
