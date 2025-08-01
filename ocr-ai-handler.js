function cekLogin() {
  const login = localStorage.getItem('admin_login');
  if (login !== 'true') {
    alert('Kamu belum login!');
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('admin_login');
  window.location.href = 'login.html';
}

function getPath() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get('path') || '');
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const imageDataUrl = e.target.result;
    document.getElementById("ocrPreview").src = imageDataUrl;

    // Pakai OCR.space API publik gratis
    fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: "helloworld", // key gratis demo
      },
      body: new URLSearchParams({
        base64Image: imageDataUrl,
        language: "ind",
        isOverlayRequired: false
      }),
    })
      .then(res => res.json())
      .then(res => {
        const hasil = res.ParsedResults?.[0]?.ParsedText || "";
        document.getElementById("ocrResult").value = hasil;
      })
      .catch(err => alert("❌ Gagal OCR: " + err.message));
  };
  reader.readAsDataURL(file);
}

function parseOCRToEditor() {
  const raw = document.getElementById("ocrResult").value;
  const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  const soalList = [];
  let current = null;
  let options = [];

  lines.forEach((line) => {
    if (/^Soal\s*\d+/i.test(line)) {
      if (current && options.length === 4) {
        soalList.push({ ...current });
      }
      current = { question: "", a: "", b: "", c: "", d: "", correct: "a" };
      options = [];
    } else if (!current.question) {
      current.question = line;
    } else if (options.length < 4) {
      const index = ["a", "b", "c", "d"][options.length];
      current[index] = line;
      options.push(line);
    } else if (/^[ABCDabcd]$/.test(line)) {
      current.correct = line.toLowerCase();
    }
  });

  if (current && options.length === 4) soalList.push(current);

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
  const path = getPath(); // contoh: SD/kelas_1/IPA/semester_1/versi_1
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
    .catch(err => alert("❌ Gagal simpan soal: " + err.message));
}

function tampilkanSoalTersimpan() {
  const path = getPath();
  db.ref(`${path}/soal`).once("value").then(snapshot => {
    const data = snapshot.val();
    if (data) {
      const arr = Object.values(data);
      renderSoalEditor(arr);
    }
  });
}
