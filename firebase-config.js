const firebaseConfig = {
  apiKey: "AIzaSyBmvcUL3zYLc0frQ0hIRuyq8dUWTZGy3Zo",
  authDomain: "kumpulan-soal-lengkap.firebaseapp.com",
  databaseURL: "https://kumpulan-soal-lengkap-default-rtdb.firebaseio.com",
  projectId: "kumpulan-soal-lengkap",
  storageBucket: "kumpulan-soal-lengkap.appspot.com",
  messagingSenderId: "1097394711054",
  appId: "1:1097394711054:android:97bfb2ca2ac774018baa5f"
};
const firebaseConfig = {
  databaseURL: "https://kumpulan-soal-lengkap-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log("✅ Firebase initialized with URL:", firebaseConfig.databaseURL);

