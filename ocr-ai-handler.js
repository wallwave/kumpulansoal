// 📦 ocr-ai-handler.js

// 🧠 Fungsi untuk menangani file gambar & proses OCR
function handleImageDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (!file.type.startsWith('image/')) return alert('File bukan gambar.');

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('imagePreview').src = e.target.result;
    document.getElementById('ocrStatus').innerText = '🔄 Proses OCR...';

    runOCRonImage(e.target.result);
  };
  reader.readAsDataURL(file);
}

function runOCRonImage(base64Image) {
  // Simulasi AI/OCR processing
  setTimeout(() => {
    const hasilAI = [
      {
        question: "Air mengalir dari tempat tinggi ke...",
        a: "Tempat tinggi",
        b: "Tempat rendah",
        c: "Langit",
        d: "Udara",
        correct: "b"
      },
      {
        question: "Benda yang termasuk sumber energi adalah...",
        a: "Batu",
        b: "Air",
        c: "Kertas",
        d: "Kaca",
        correct: "b"
      }
    ];

    renderHasilAI(hasilAI);
    document.getElementById('ocrStatus').innerText = '✅ OCR selesai, silakan review';
  }, 2000);
}

// 🧾 Render hasil OCR ke daftar soal
function renderHasilAI(dataArray) {
  const container = document.getElementById('hasilAIContainer');
  container.innerHTML = '';

  dataArray.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'soal-box';
    div.innerHTML = `
      <label>Soal ${idx + 1}</label>
      <input value="${item.question}" class="soal-input" />
      <div class="opsi">a. <input value="${item.a}" /></div>
      <div class="opsi">b. <input value="${item.b}" /></div>
      <div class="opsi">c. <input value="${item.c}" /></div>
      <div class="opsi">d. <input value="${item.d}" /></div>
      <div class="opsi">Kunci: <select>
        <option ${item.correct === 'a' ? 'selected' : ''}>a</option>
        <option ${item.correct === 'b' ? 'selected' : ''}>b</option>
        <option ${item.correct === 'c' ? 'selected' : ''}>c</option>
        <option ${item.correct === 'd' ? 'selected' : ''}>d</option>
      </select></div>
    `;
    container.appendChild(div);
  });
}

// 🎯 Export jika pakai module bundler
// export { handleImageDrop, runOCRonImage, renderHasilAI }

