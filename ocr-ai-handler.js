// Helper DOM
const $ = id => document.getElementById(id);

let selectedFile = null;

// ✅ Event: Pilih gambar soal
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

// ✅ Event: Mulai scan OCR pakai Tesseract.js
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

// ✅ Event: Parse hasil OCR ke JSON Soal (tanpa API eksternal)
$('btnParseOCR').addEventListener('click', () => {
  const rawText = $('ocrResult').value.trim();
  if (!rawText) {
    alert('Teks OCR kosong, lakukan scan dulu!');
    return;
  }

  $('btnParseOCR').disabled = true;
  $('btnParseOCR').textContent = '⚙️ Memproses...';

  // Proses parsing lokal
  const soalArray = [];
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);

  let currentSoal = null;
  let pilihan = { a: '', b: '', c: '', d: '' };
  let index = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Deteksi awal soal
    const soalMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);
    if (soalMatch) {
      if (currentSoal) {
        soalArray.push({
          question: currentSoal,
          a: pilihan.a,
          b: pilihan.b,
          c: pilihan.c,
          d: pilihan.d,
          correct: 'a' // Default sementara, bisa diedit manual
        });
      }
      currentSoal = soalMatch[2].trim();
      pilihan = { a: '', b: '', c: '', d: '' };
      continue;
    }

    // Deteksi pilihan jawaban
    const pilihanMatch = line.match(/^([a-dA-D])[\.€\)]\s*(.+)/);
    if (pilihanMatch) {
      const key = pilihanMatch[1].toLowerCase();
      pilihan[key] = pilihanMatch[2].trim();
    }
  }

  // Tambahkan soal terakhir
  if (currentSoal) {
    soalArray.push({
      question: currentSoal,
      a: pilihan.a,
      b: pilihan.b,
      c: pilihan.c,
      d: pilihan.d,
      correct: 'a'
    });
  }

  // Konversi ke format versi_1
  const soalObject = { versi_1: {} };
  soalArray.forEach((item, idx) => {
    soalObject.versi_1[(idx + 1).toString()] = item;
  });

  // Tampilkan JSON hasil di textarea
  $('jsonResult').value = JSON.stringify(soalObject, null, 2);
  window.soalArray = soalObject;

  $('btnParseOCR').disabled = false;
  $('btnParseOCR').textContent = '⚙️ Parse ke Format JSON Soal';
});
