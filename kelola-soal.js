// kelola-soal.js

function logout() {
  localStorage.removeItem("admin_login");
  window.location.href = "login.html";
}

function getPath() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get("path") || "");
}

function tampilkanSoalTersimpan() {
  const path = getPath();
  db.ref(`${path}/soal`).once("value").then((snapshot) => {
    const data = snapshot.val();
    if (data) {
      const arr = Object.keys(data).map((k) => data[k]);
      renderSoalEditor(arr);
    }
  });
}

function simpanSemuaSoalKeFirebase() {
  const path = getPath();
  const soalEls = document.querySelectorAll(".soal-item");
  const soalObj = {};

  soalEls.forEach((el, i) => {
    const question = el.querySelector(".question").value.trim();
    const a = el.querySelector(".a").value.trim();
    const b = el.querySelector(".b").value.trim();
    const c = el.querySelector(".c").value.trim();
    const d = el.querySelector(".d").value.trim();
    const correct = el.querySelector(".correct").value;

    soalObj[i + 1] = { question, a, b, c, d, correct };
  });

  db.ref(`${path}/soal`).set(soalObj)
    .then(() => alert("✅ Soal berhasil disimpan ke Firebase!"))
    .catch((err) => alert("❌ Gagal simpan soal: " + err.message));
}

function initKelolaSoal() {
  tampilkanSoalTersimpan();
  document.getElementById("btnMulaiScan").addEventListener("click", mulaiScanOCR);
  document.getElementById("btnParseOCR").addEventListener("click", parseOCRToEditor);
  document.getElementById("btnSimpanSoal").addEventListener("click", simpanSemuaSoalKeFirebase);
}

