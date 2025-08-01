// ocr-ai-handler.js

// 🔐 Cek login dulu biar aman
function cekLogin() {
  const login = localStorage.getItem("admin_login");
  if (login !== "true") {
    alert("Kamu belum login!");
    window.location.href = "login.html";
  }
}

// 🔧 Ambil path dari URL
function getPath() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get("path") || "");
}

// 🧠 Proses gambar dengan OCR (pakai OCR.space API misalnya)
async function processImageAI(imageDataUrl) {
  // Simulasi dummy parsing
  return [
    {
      question: "Apa itu gaya gravitasi?",
      a: "Tarik bumi",
      b: "Tekanan udara",
      c: "Listrik statis",
      d: "Gaya dorong angin",
      correct: "a",
    },
    {
      question: "Air mengalir dari tempat tinggi ke...",
      a: "Tempat lebih tinggi",
      b: "Tempat lebih rendah",
      c: "Samping",
      d: "Langit",
      correct: "b",
    },
  ];
}

// 🖼️ Upload gambar soal
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const imageDataUrl = e.target.result;
    document.getElementById("ocrPreview").src = imageDataUrl;

    const hasil = await processImageAI(imageDataUrl);
    renderAIResult(hasil);
  };
  reader.readAsDataURL(file);
}

// 📋 Render hasil AI ke editor
function renderAIResult(soalList) {
  const container = document.getElementById("daftarSoal");
  container.innerHTML = "";

  soalList.forEach((soal, i) => {
    const wrap = document.createElement("div");
    wrap.className = "soal-item";
    wrap.style.border = "1px solid #ccc";
    wrap.style.padding = "10px";
    wrap.style.marginBottom = "10px";
    wrap.style.background = "#fff";

    wrap.innerHTML = `
      <label>Soal ${i + 1}</label>
      <textarea class="question" rows="2">${soal.question}</textarea>
      <input class="a" placeholder="A" value="${soal.a}" />
      <input class="b" placeholder="B" value="${soal.b}" />
      <input class="c" placeholder="C" value="${soal.c}" />
      <input class="d" placeholder="D" value="${soal.d}" />
      <select class="correct">
        <option value="a" ${soal.correct === "a" ? "selected" : ""}>A</option>
        <option value="b" ${soal.correct === "b" ? "selected" : ""}>B</option>
        <option value="c" ${soal.correct === "c" ? "selected" : ""}>C</option>
        <option value="d" ${soal.correct === "d" ? "selected" : ""}>D</option>
      </select>
    `;
    container.appendChild(wrap);
  });
}

// 💾 Simpan soal ke Firebase
function simpanKeFirebase() {
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
    .then(() => alert("✅ Soal berhasil disimpan!"))
    .catch((err) => alert("❌ Gagal simpan soal: " + err.message));
}

// 🔁 Tampilkan soal dari Firebase
function tampilkanSoalTersimpan() {
  const path = getPath();
  db.ref(`${path}/soal`).once("value").then(snapshot => {
    const data = snapshot.val();
    if (data) {
      const arr = Object.keys(data).map(k => data[k]);
      renderAIResult(arr);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cekLogin();
  tampilkanSoalTersimpan();
  document.getElementById("uploadSoalGambar").addEventListener("change", handleImageUpload);
  document.getElementById("btnSimpanSoal").addEventListener("click", simpanKeFirebase);
});
