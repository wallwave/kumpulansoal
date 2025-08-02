// Helper DOM
const $ = id => document.getElementById(id);
let selectedFile = null;
let ocrMemory = []; // Buat belajar pola OCR dari scan sebelumnya

// Pilih gambar soal
$('uploadSoalGambar').addEventListener('change', e => {
  if (e.target.files.length === 0) return resetOCR();
  selectedFile = e.target.files[0];
  $('ocrPreview').src = URL.createObjectURL(selectedFile);
  resetOCR();
});

function resetOCR() {
  $('ocrResult').value = '';
  $('jsonResult').value = '';
}

// Proses scan OCR
$('btnMulaiScan').addEventListener('click', () => {
  if (!selectedFile) return alert('Pilih gambar dulu!');
  $('btnMulaiScan').disabled = true;
  $('btnMulaiScan').textContent = '🔄 Memindai...';

  Tesseract.recognize(selectedFile, 'ind')
    .then(({ data: { text } }) => {
      const cleanedText = cleanupOCRText(text);
      $('ocrResult').value = cleanedText;
      saveOCRMemory(cleanedText);
    })
    .catch(err => alert('OCR gagal: ' + err.message))
    .finally(() => {
      $('btnMulaiScan').disabled = false;
      $('btnMulaiScan').textContent = '🔍 Mulai Scan OCR';
    });
});

// Parse OCR text jadi JSON soal
$('btnParseOCR').addEventListener('click', () => {
  const raw = $('ocrResult').value.trim();
  if (!raw) return alert('Belum ada teks hasil scan!');
  const parsed = parseSoalFromText(raw);
  $('jsonResult').value = JSON.stringify({ versi_1: parsed }, null, 2);
  window.soalArray = { versi_1: parsed };
});

// ✨ Bersihin teks hasil OCR biar lebih mudah diparse
function cleanupOCRText(text) {
  return text
    .replace(/[€•·]/g, '.')         // simbol aneh jadi titik
    .replace(/[\s]+/g, ' ')         // spasi berlebihan
    .replace(/([a-dA-D])[\s]*[\.:\)-]/g, '$1.') // benerin opsi
    .replace(/\n\s*/g, '\n')        // rapihin line
    .replace(/\.{2,}/g, '.')        // titik ganda
    .replace(/\s{2,}/g, ' ')        // spasi ganda
    .replace(/^\s+|\s+$/gm, '');    // trim tiap baris
}

// 🧠 Parsing dengan bantuan memory AI
function parseSoalFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = {};
  let i = 0;

  while (i < lines.length) {
    if (!/^\d+[\.\)\s]/.test(lines[i])) {
      i++; continue; // skip baris yang bukan nomor soal
    }

    const question = lines[i++].replace(/^\d+[\.\)\s]*/, '');
    const opsi = {};

    while (i < lines.length && /^[a-dA-D][\.\)\s]/.test(lines[i])) {
      const key = lines[i][0].toLowerCase();
      opsi[key] = lines[i].substring(2).trim();
      i++;
    }

    let correct = 'a'; // default correct
    if (i < lines.length && /jawaban[:\s]/i.test(lines[i])) {
      correct = lines[i].split(/[:\s]/).pop().trim().toLowerCase();
      i++;
    }

    const no = Object.keys(result).length + 1;
    result[no] = {
      question,
      a: opsi.a || '',
      b: opsi.b || '',
      c: opsi.c || '',
      d: opsi.d || '',
      correct: ['a', 'b', 'c', 'd'].includes(correct) ? correct : 'a',
    };
  }

  return result;
}

// 🚀 Simpan hasil OCR ke localStorage buat belajar
function saveOCRMemory(text) {
  const data = localStorage.getItem('ocr_learning') || '[]';
  const arr = JSON.parse(data);
  if (text.length > 30) arr.push(text);
  localStorage.setItem('ocr_learning', JSON.stringify(arr));
}

// 🔍 Lihat memori belajar AI
function lihatRiwayatOCR() {
  const data = JSON.parse(localStorage.getItem('ocr_learning') || '[]');
  console.log(`📚 AI telah melihat ${data.length} input OCR`);
  console.table(data.slice(-3));
}
