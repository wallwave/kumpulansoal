// Helper DOM
const $ = id => document.getElementById(id);
let selectedFile = null;
let ocrMemory = []; // buat belajar bentuk soal

$('uploadSoalGambar').addEventListener('change', e => {
  if (e.target.files.length === 0) return resetOCR();
  selectedFile = e.target.files[0];
  $('ocrPreview').src = URL.createObjectURL(selectedFile);
  resetOCR();
});

function resetOCR() {
  $('ocrPreview').src = '';
  $('ocrResult').value = '';
  $('jsonResult').value = '';
}

$('btnMulaiScan').addEventListener('click', () => {
  if (!selectedFile) return alert('Pilih gambar dulu');
  $('btnMulaiScan').disabled = true;
  $('btnMulaiScan').textContent = '🔄 Memindai...';
  Tesseract.recognize(selectedFile, 'ind')
    .then(({ data: { text } }) => {
      $('ocrResult').value = text;
      saveOCRMemory(text); // simpan buat "belajar"
    })
    .catch(err => alert('OCR gagal: ' + err.message))
    .finally(() => {
      $('btnMulaiScan').disabled = false;
      $('btnMulaiScan').textContent = '🔍 Mulai Scan OCR';
    });
});

$('btnParseOCR').addEventListener('click', () => {
  const raw = $('ocrResult').value.trim();
  if (!raw) return alert('Belum ada teks OCR');
  const parsed = parseSoalFromText(raw);
  $('jsonResult').value = JSON.stringify({ versi_1: parsed }, null, 2);
  window.soalArray = { versi_1: parsed };
});

function parseSoalFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = {};
  let i = 0;

  while (i < lines.length) {
    if (!/^\d+[\).]/.test(lines[i])) {
      i++; continue;
    }

    const question = lines[i++].replace(/^\d+[\).]\s*/, '');

    const opsi = {};
    while (i < lines.length && /^[a-dA-D][\).]/.test(lines[i])) {
      const key = lines[i][0].toLowerCase();
      opsi[key] = lines[i].substring(2).trim();
      i++;
    }

    // Deteksi Jawaban
    let correct = 'a'; // default
    if (i < lines.length && /jawaban\s*[:\-–]\s*/i.test(lines[i])) {
      const match = lines[i].match(/jawaban\s*[:\-–]\s*([a-dA-D])/i);
      if (match) correct = match[1].toLowerCase();
      i++;
    }

    const no = Object.keys(result).length + 1;
    result[no] = {
      question,
      a: opsi.a || '',
      b: opsi.b || '',
      c: opsi.c || '',
      d: opsi.d || '',
      correct: ['a', 'b', 'c', 'd'].includes(correct) ? correct : 'a'
    };
  }

  return result;
}


// Simpan hasil ke memory lokal (buat belajar)
function saveOCRMemory(text) {
  const data = localStorage.getItem('ocr_learning') || '[]';
  const arr = JSON.parse(data);
  arr.push(text);
  localStorage.setItem('ocr_learning', JSON.stringify(arr));
}

// Liat riwayat belajar AI
function lihatRiwayatOCR() {
  const data = JSON.parse(localStorage.getItem('ocr_learning') || '[]');
  console.log(`📚 AI telah melihat ${data.length} OCR`);
  console.table(data.slice(-3)); // tampilkan 3 terakhir
}
