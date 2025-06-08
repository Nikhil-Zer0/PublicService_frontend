// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-8b1a9k2e3f4c5b6d7e8f9g0h1i2j3k4",
  authDomain: "public-service-feedback.firebaseapp.com",
  projectId: "public-service-feedback",
  storageBucket: "public-service-feedback.firebasestorage.app",
  messagingSenderId: "665391290053",
  appId: "1:665391290053:web:1e6476048ede03bf2602ac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)