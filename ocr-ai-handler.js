// ocr-ai-handler.js

function cekLogin() {
  const login = localStorage.getItem("admin_login");
  if (login !== "true") {
    alert("Kamu belum login!");
    window.location.href = "login.html";
  }
}

function getPath() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get("path") || "");
}

let uploadedImageDataUrl = "";

// Inisialisasi
document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("uploadSoalGambar");
  if (uploadInput) {
    uploadInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImageDataUrl = e.target.result;
        document.getElementById("ocrPreview").src = uploadedImageDataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  const btnScan = document.getElementById("btnMulaiScan");
  if (btnScan) {
    btnScan.addEventListener("click", mulaiScanOCR);
  }

  const btnParse = document.getElementById("btnParseOCR");
  if (btnParse) {
    btnParse.addEventListener("click", parseOCRToEditor);
  }

  const simpanBtn = document.getElementById("btnSimpanSoal");
  if (simpanBtn) {
    simpanBtn.addEventListener("click", simpanSemuaSoalKeFirebase);
  }
});

// 🔍 Proses OCR
async function mulaiScanOCR() {
  if (!uploadedImageDataUrl) return alert("Upload gambar dulu!");
  const ocrResult = document.getElementById("ocrResult");
  ocrResult.value = "⌛ Sedang OCR dengan Tesseract.js...";

  const { data: { text } } = await Tesseract.recognize(uploadedImageDataUrl, 'ind', {
    logger: m => {
      ocrResult.value = `🌀 ${m.status} (${Math.round(m.progress * 100)}%)`;
    }
  });

  ocrResult.value = text;
}

// 🧠 Parse hasil OCR menjadi soal JSON
function parseOCRToEditor() {
  const raw = document.getElementById("ocrResult").value;
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const soalList = [];

  let current = null;
  let nomorSoalRegex = /^\d+[\).]{1,2}/;
  let opsiRegex = /^[a-dA-D][\.\)\s]+/;
  let opsiBuffer = [];

  lines.forEach(line => {
    if (nomorSoalRegex.test(line)) {
      if (current) soalList.push(current);
      current = { question: "", a: "", b: "", c: "", d: "", correct: "a" };
      current.question = line.replace(nomorSoalRegex, "").trim();
      opsiBuffer = [];
    }
    else if (opsiRegex.test(line)) {
      const huruf = line.charAt(0).toLowerCase();
      const isi = line.slice(2).trim();
      if (["a", "b", "c", "d"].includes(huruf)) {
        current[huruf] = isi;
      }
    }
    else if (line.includes("€") || line.includes(" - ") || line.includes(".")) {
      // Fallback: split otomatis opsi dalam satu baris
      const parts = line.split(/[€•\-]/).map(s => s.trim()).filter(Boolean);
      ["a", "b", "c", "d"].forEach((huruf, idx) => {
        if (parts[idx]) current[huruf] = parts[idx];
      });
    }
    else if (/^[a-dA-D]$/.test(line)) {
      current.correct = line.toLowerCase();
    }
  });

  if (current) soalList.push(current);

  // Tampilkan hasil parsing ke textarea JSON dan daftar editor
  const jsonArea = document.getElementById("jsonResult");
  if (jsonArea) jsonArea.value = JSON.stringify(soalList, null, 2);

  renderSoalEditor(soalList);
}




function renderSoalEditor(soalList) {
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
