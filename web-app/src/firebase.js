// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx6FbnKkJufzCOFGKkgIwShBdbbW654ws",
  authDomain: "ajututvus.firebaseapp.com",
  projectId: "ajututvus",
  storageBucket: "ajututvus.firebasestorage.app",
  messagingSenderId: "932269592321",
  appId: "1:932269592321:web:babe5fa85fe139966d9500",
  measurementId: "G-JQKF0QNJ7X",
  databaseURL:
    "https://ajututvus-default-rtdb.europe-west1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Sign in anonymously so each player gets a unique ID
const signInPlayer = () => signInAnonymously(auth);

export { app, auth, db, signInPlayer };
