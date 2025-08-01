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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("uploadSoalGambar").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImageDataUrl = e.target.result;
      document.getElementById("ocrPreview").src = uploadedImageDataUrl;
    };
    reader.readAsDataURL(file);
  });
});

function mulaiScanOCR() {
  if (!uploadedImageDataUrl) return alert("❗ Upload gambar dulu!");
  document.getElementById("ocrResult").value = "⌛ Sedang memproses...";

  fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: { apikey: "helloworld" },
    body: new URLSearchParams({
      base64Image: uploadedImageDataUrl,
      language: "ind",
      isOverlayRequired: false,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      const hasil = res.ParsedResults?.[0]?.ParsedText || "";
      document.getElementById("ocrResult").value = hasil;
    })
    .catch((err) => {
      document.getElementById("ocrResult").value = "❌ Gagal OCR: " + err.message;
    });
}

function parseOCRToEditor() {
  const raw = document.getElementById("ocrResult").value;
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const soalList = [];

  let current = null;
  let stage = 0;

  lines.forEach(line => {
    if (/^Soal\s*\d+/i.test(line)) {
      if (current) soalList.push(current);
      current = { question: "", a: "", b: "", c: "", d: "", correct: "a" };
      stage = 1;
    } else if (stage === 1) {
      current.question = line;
      stage = 2;
    } else if (stage >= 2 && stage <= 5) {
      const opt = ["a", "b", "c", "d"][stage - 2];
      current[opt] = line;
      stage++;
    } else if (stage > 5 && /^[abcdABCD]$/.test(line)) {
      current.correct = line.toLowerCase();
      stage = 0;
    }
  });

  if (current) soalList.push(current);

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
