// ─── FIREBASE SETUP ──────────────────────────────────────────────────────────
// Firebase = Google's cloud platform
// Firestore = their real-time database where questions and progress are stored
// This file sets up the connection once, and every other file imports from here

import { initializeApp }   from 'firebase/app'
import { getFirestore,
         doc, getDoc, setDoc,
         collection, getDocs,
         writeBatch }       from 'firebase/firestore'

// Your project's unique config — do not share the apiKey publicly in production
const firebaseConfig = {
  apiKey:            "AIzaSyBfdTw0k2hwsqOAhP5HGLN2MZJHXwCLNN8",
  authDomain:        "jee-mock-app-bced4.firebaseapp.com",
  projectId:         "jee-mock-app-bced4",
  storageBucket:     "jee-mock-app-bced4.firebasestorage.app",
  messagingSenderId: "1008465760495",
  appId:             "1:1008465760495:web:95c136b405d48253e5cb1a"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Re-export Firestore tools so other files can import them from here
export { doc, getDoc, setDoc, collection, getDocs, writeBatch }
