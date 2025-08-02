// ocr-ai-handler.js

// Helper DOM\const $ = id => document.getElementById(id);

let selectedFile = null;

// Pilih gambar soal
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

// Mulai scan OCR pake Tesseract.js
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
    })
    .catch(err => {
      alert('OCR gagal: ' + err.message);
    })
    .finally(() => {
      $('btnMulaiScan').disabled = false;
      $('btnMulaiScan').textContent = '🔍 Mulai Scan OCR';
    });
});

// Tombol parse OCR ke JSON lokal
$('btnParseOCR').addEventListener('click', () => {
  const rawText = $('ocrResult').value.trim();
  if (!rawText) return alert('Teks OCR kosong.');

  const json = parseSoalFromText(rawText);

  // Transform array jadi object versi_1
  const soalObject = { versi_1: {} };
  json.forEach((item, index) => {
    soalObject.versi_1[(index + 1).toString()] = item;
  });

  $('jsonResult').value = JSON.stringify(soalObject, null, 2);
  window.soalArray = soalObject;
});

// =======================
// Parser Lokal Pintar
// =======================
function parseSoalFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const soalArray = [];
  let currentSoal = null;

  lines.forEach(line => {
    const soalMatch = line.match(/^(\d+)[\.\)]*[\s\-]*(.+)/);
    if (soalMatch) {
      if (currentSoal) soalArray.push(currentSoal);
      currentSoal = {
        question: soalMatch[2].trim(),
        a: '', b: '', c: '', d: '', correct: ''
      };
      return;
    }

    const pilihanMatch = line.match(/^([a-dA-D])[\.\)\-–]?\s*(.+)/);
    if (pilihanMatch && currentSoal) {
      const huruf = pilihanMatch[1].toLowerCase();
      currentSoal[huruf] = pilihanMatch[2].replace(/[€•]/g, '').trim();
      return;
    }

    if (line.toLowerCase().includes('jawaban') && currentSoal) {
      const correctMatch = line.match(/jawaban[\s\:\-]*([a-dA-D])/i);
      if (correctMatch) currentSoal.correct = correctMatch[1].toLowerCase();
    }

    if (currentSoal && line.includes('€')) {
      line.split('€').forEach(sub => {
        const subMatch = sub.match(/^([a-dA-D])[\.\)\-]?\s*(.+)/);
        if (subMatch) {
          const huruf = subMatch[1].toLowerCase();
          currentSoal[huruf] = subMatch[2].trim();
        }
      });
    }

    if (currentSoal && currentSoal.d === '') {
      const potongan = line.match(/(.+?)\s+(.+?)\s+(.+?)\s+(.+)/);
      if (potongan) {
        ['a', 'b', 'c', 'd'].forEach((h, i) => {
          currentSoal[h] = potongan[i + 1]?.trim();
        });
      }
    }
  });

  if (currentSoal) soalArray.push(currentSoal);
  return soalArray;
}
