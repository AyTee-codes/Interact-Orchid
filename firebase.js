import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyB1aG6QpOj9hPyC_saj_q41t1GGU9uQpkA",
  authDomain: "interact-club-of-orchid.firebaseapp.com",
  projectId: "interact-club-of-orchid",
  storageBucket: "interact-club-of-orchid.firebasestorage.app",
  messagingSenderId: "125333013481",
  appId: "1:125333013481:web:062e6eccc1071be786c178",
  measurementId: "G-G0CC8WJXHE"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase services
const db = getFirestore(app);
const auth = getAuth(app);


// Export for app.js
export { db, auth };