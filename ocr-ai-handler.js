// Helper DOM
const $ = id => document.getElementById(id);

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

// Parse OCR text ke JSON soal via API
$('btnParseOCR').addEventListener('click', async () => {
  const rawText = $('ocrResult').value.trim();
  if (!rawText) {
    alert('Teks OCR kosong, lakukan scan dulu!');
    return;
  }

  $('btnParseOCR').disabled = true;
  $('btnParseOCR').textContent = '⚙️ Memproses...';

  try {
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rawText }),
    });

    if (!res.ok) {
      const errText = await res.text();
      alert('Gagal parse OCR ke JSON:\n' + errText);
      return;
    }

    const json = await res.json();

    // Transform array jadi object versi_1
    const soalObject = { versi_1: {} };
    json.forEach((item, index) => {
      soalObject.versi_1[(index + 1).toString()] = item;
    });

    // Update textarea JSON result
    $('jsonResult').value = JSON.stringify(soalObject, null, 2);

    // Simpan ke global soalArray untuk kelola-soal.js
    window.soalArray = soalObject;

  } catch (e) {
    alert('Error saat parsing OCR ke JSON: ' + e.message);
  } finally {
    $('btnParseOCR').disabled = false;
    $('btnParseOCR').textContent = '⚙️ Parse ke Format JSON Soal';
  }
});
