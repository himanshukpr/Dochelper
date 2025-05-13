import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCh8y-xigMI1NqcfarCBkS96rnDOfKM9K4",
    authDomain: "dochelper-a8262.firebaseapp.com",
    projectId: "dochelper-a8262",
    storageBucket: "dochelper-a8262.firebasestorage.app",
    messagingSenderId: "799990343855",
    appId: "1:799990343855:web:d41b94185ef3fe571b0c5a",
    databaseURL: 'https://dochelper-a8262-default-rtdb.firebaseio.com'
};


export const FirebaseApp = initializeApp(firebaseConfig);