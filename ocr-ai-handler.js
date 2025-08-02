// ocr-ai-handler.js

const $ = id => document.getElementById(id);

let selectedFile = null;
window.soalArray = {};

// Simpan semua hasil raw OCR ke localStorage buat "belajar"
function simpanHasilOCR(text) {
  const history = JSON.parse(localStorage.getItem('ocr_history') || '[]');
  history.push({
    timestamp: Date.now(),
    raw: text
  });
  localStorage.setItem('ocr_history', JSON.stringify(history));
}

// Belajar dari riwayat OCR (untuk masa depan: analisis struktur pertanyaan)
function getRiwayatOCR() {
  return JSON.parse(localStorage.getItem('ocr_history') || '[]');
}

$('uploadSoalGambar').addEventListener('change', e => {
  if (e.target.files.length === 0) {
    selectedFile = null;
    $('ocrPreview').src = '';
    $('ocrResult').value = '';
    $('jsonResult').value = '';
    return;
  }
  selectedFile = e.target.files[0];
  $('ocrPreview').src = URL.createObjectURL(selectedFile);
  $('ocrResult').value = '';
  $('jsonResult').value = '';
});

$('btnMulaiScan').addEventListener('click', () => {
  if (!selectedFile) {
    alert('Pilih gambar soal terlebih dahulu!');
    return;
  }
  $('btnMulaiScan').disabled = true;
  $('btnMulaiScan').textContent = '🔄 Memindai...';

  Tesseract.recognize(selectedFile, 'ind')
    .then(({ data: { text } }) => {
      $('ocrResult').value = text;
      simpanHasilOCR(text);
    })
    .catch(err => {
      alert('OCR gagal: ' + err.message);
    })
    .finally(() => {
      $('btnMulaiScan').disabled = false;
      $('btnMulaiScan').textContent = '🔍 Mulai Scan OCR';
    });
});

$('btnParseOCR').addEventListener('click', () => {
  const rawText = $('ocrResult').value.trim();
  if (!rawText) {
    alert('Teks OCR kosong, lakukan scan dulu!');
    return;
  }

  const soalList = parseSoalManual(rawText);
  const soalObject = { versi_1: {} };
  soalList.forEach((item, i) => {
    soalObject.versi_1[(i + 1).toString()] = item;
  });
  $('jsonResult').value = JSON.stringify(soalObject, null, 2);
  window.soalArray = soalObject;
});

// Parser manual (versi awal)
function parseSoalManual(text) {
  const blocks = text.split(/\n\s*\n/); // pisah antar soal dengan baris kosong
  const result = [];
  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 5) return;

    const question = lines[0];
    const a = lines.find(l => l.toLowerCase().startsWith('a'))?.slice(2).trim();
    const b = lines.find(l => l.toLowerCase().startsWith('b'))?.slice(2).trim();
    const c = lines.find(l => l.toLowerCase().startsWith('c'))?.slice(2).trim();
    const d = lines.find(l => l.toLowerCase().startsWith('d'))?.slice(2).trim();
    const correct = 'a'; // default dulu, nanti bisa diedit

    if (a && b && c && d) {
      result.push({ question, a, b, c, d, correct });
    }
  });
  return result;
}

// Belajar struktur soal (buat ke depannya bisa AI learning manual)
window.lihatRiwayatOCR = () => {
  const list = getRiwayatOCR();
  alert(`Total hasil OCR yang disimpan: ${list.length}`);
  console.log(list);
};
