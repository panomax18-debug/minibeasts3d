// firebase-init.js

// ✅ Конфігурація Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD...твій ключ...",
  authDomain: "minibeasts-3d.firebaseapp.com",
  projectId: "minibeasts-3d",
  storageBucket: "minibeasts-3d.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// 🔌 Ініціалізація
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 📦 Експорт Firestore (опціонально)
window.firebaseDB = db;

// 📦 Ініціалізація Storage
const storage = firebase.storage();

// 📦 Експорт Storage (опціонально)
window.firebaseStorage = storage;
