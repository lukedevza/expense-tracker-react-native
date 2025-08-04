// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSCt1HFa9Hb88rrjI_meMT5gH_4Kg7_Tw",
  authDomain: "expense-tracker-f2feb.firebaseapp.com",
  projectId: "expense-tracker-f2feb",
  storageBucket: "expense-tracker-f2feb.firebasestorage.app",
  messagingSenderId: "247841651245",
  appId: "1:247841651245:web:cc8173792362f2f8e096a4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// db
export const firestore = getFirestore(app);
