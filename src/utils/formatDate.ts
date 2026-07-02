import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2l8BgXIQZw0bTJf41yEVoqJ7LezNRjkI",
  authDomain: "clinica-app-fc454.firebaseapp.com",
  projectId: "clinica-app-fc454",
  storageBucket: "clinica-app-fc454.firebasestorage.app",
  messagingSenderId: "192560949874",
  appId: "1:192560949874:web:415068a0eea7e2564670eb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);