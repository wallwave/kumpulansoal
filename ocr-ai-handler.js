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
  let opsiIndex = 0;
  let nomor = 1;

  const abcd = ['a', 'b', 'c', 'd'];

  lines.forEach((line, idx) => {
    // Deteksi nomor soal
    if (/^\d+[\).]/.test(line) || /^Soal\s*\d+/i.test(line)) {
      if (current) soalList.push(current);
      current = { question: "", a: "", b: "", c: "", d: "", correct: "a" };
      opsiIndex = 0;
      current.question = line.replace(/^\d+[\).]\s*/, "").replace(/^Soal\s*\d+[:.)]?\s*/i, "");
    }
    // Deteksi opsi
    else if (/^[a-dA-D][).]/.test(line)) {
      const opt = abcd[opsiIndex];
      current[opt] = line.replace(/^[a-dA-D][).]\s*/, "");
      opsiIndex++;
    }
    // Deteksi jawaban benar (misal cuma satu huruf)
    else if (/^[a-dA-D]$/.test(line)) {
      current.correct = line.toLowerCase();
    }
    // Tambahan fallback (kalau OCR ga perfect)
    else if (current && current.question && opsiIndex < 4) {
      const opt = abcd[opsiIndex];
      current[opt] = line;
      opsiIndex++;
    }
  });

  if (current) soalList.push(current);

  // JSON Preview
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
