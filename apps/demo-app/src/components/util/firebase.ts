import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCwD7PX9mn829cXPiFweOA1IrB-e5we7G4",
  authDomain: "voice-naija.firebaseapp.com",
  projectId: "voice-naija",
  storageBucket: "voice-naija.appspot.com",
  messagingSenderId: "401009367113",
  appId: "1:401009367113:web:d00a71ab574eae0d074798"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);