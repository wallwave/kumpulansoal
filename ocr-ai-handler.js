// 🔐 Cek login dulu
function cekLogin() {
  const login = localStorage.getItem("admin_login");
  if (login !== "true") {
    alert("Kamu belum login!");
    window.location.href = "login.html";
  }
}

// 🔍 Ambil path dari URL
function getPath() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get("path") || "");
}

// 📦 Upload gambar soal → kirim ke OCR.space
async function processImageAI(imageDataUrl) {
  const formData = new FormData();
  formData.append("base64Image", imageDataUrl);
  formData.append("language", "ind");
  formData.append("isOverlayRequired", "false");

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      apikey: "helloworld" // Gratis & aman
    },
    body: formData,
  });

  const json = await res.json();
  const text = json.ParsedResults?.[0]?.ParsedText || "";

  console.log("📄 OCR Text Result:\n", text);

  return parseSoalFromText(text);
}

// 🧠 Parser teks OCR jadi array soal
function parseSoalFromText(text) {
  const soalList = [];
  const soalRaw = text.split(/Soal\s*\d+/i).filter(s => s.trim());

  soalRaw.forEach((item, index) => {
    const lines = item.trim().split('\n').filter(l => l.trim());
    if (lines.length < 5) return;

    const question = lines[0];
    const options = lines.slice(1, 5);
    let correct = (lines[5] || "").trim().toLowerCase();

    if (!["a", "b", "c", "d"].includes(correct)) correct = "a";

    soalList.push({
      question,
      a: options[0],
      b: options[1],
      c: options[2],
      d: options[3],
      correct,
    });
  });

  return soalList;
}

// 📤 Upload gambar → tampilkan preview & hasil AI
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

// 🧾 Render soal hasil parsing
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

// 🔁 Load soal tersimpan dari Firebase
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

// 🚀 Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  cekLogin();
  tampilkanSoalTersimpan();
  document.getElementById("uploadSoalGambar").addEventListener("change", handleImageUpload);
  document.getElementById("btnSimpanSoal").addEventListener("click", simpanKeFirebase);
});
