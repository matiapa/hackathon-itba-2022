// src/firebaseInit.js
import firebase from 'firebase/compat/app';
import 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFpYwBwTySlPY-rGfLhI4KhAqz809uur0",
  authDomain: "hackitba-5868f.firebaseapp.com",
  projectId: "hackitba-5868f",
  storageBucket: "hackitba-5868f.appspot.com",
  messagingSenderId: "816455274220",
  appId: "1:816455274220:web:b4d1bf868ec46107271fc9"
};

// Initialize Firebase
export default firebase.initializeApp(firebaseConfig);