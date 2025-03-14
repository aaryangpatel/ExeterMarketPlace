import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCSJKksHf5pTYiWCYRZxnWDj4qQE15iBUI",
    authDomain: "exetermarketplace-peastuco.firebaseapp.com",
    projectId: "exetermarketplace-peastuco",
    storageBucket: "exetermarketplace-peastuco.firebasestorage.app",
    messagingSenderId: "721614883548",
    appId: "1:721614883548:web:8b7e791d70195d3633c219",
    measurementId: "G-Z8GZKFVXYH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, firestore, provider };
