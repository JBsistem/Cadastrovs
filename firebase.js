import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyBx1NSf-sWe11XqDqaaKVLVHm5qEkJ6DHY",

  authDomain: "cadastrojb-8b2c4.firebaseapp.com",

  projectId: "cadastrojb-8b2c4",

  storageBucket: "cadastrojb-8b2c4.firebasestorage.app",

  messagingSenderId: "97202835507",

  appId: "1:97202835507:web:54e09cd58cdb4f2686d346"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };