// === 🔥 Firebase Initialization ===
const firebaseConfig = {
  apiKey: "AIzaSyA2TAQM23nj7VOiHPv8HgDuXdWV_OVjX7A",
  authDomain: "minibeasts-3d.firebaseapp.com",
  projectId: "minibeasts-3d",
  storageBucket: "minibeasts-3d.firebasestorage.app",
  messagingSenderId: "192684036080",
  appId: "1:192684036080:web:c306f5de3f62ef87199735",
  measurementId: "G-MHG9HCXRCB"
};

// ✅ Инициализация только один раз
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
