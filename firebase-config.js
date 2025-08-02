
const firebaseConfig = {
  databaseURL: "https://kumpulan-soal-lengkap-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log("✅ Firebase initialized with URL:", firebaseConfig.databaseURL);