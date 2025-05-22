import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC5_gqYP_9VY4TBEEeRGiTTbF5JTFvqpCk",
  authDomain: "alexb-control-system.firebaseapp.com",
  projectId: "alexb-control-system",
  storageBucket: "alexb-control-system.firebasestorage.app",
  messagingSenderId: "718102911285",
  appId: "1:718102911285:web:331435e1072b8282a3d47c",
  measurementId: "G-S0L324K9NG"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
