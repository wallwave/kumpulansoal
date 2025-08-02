// Helper DOM
const $ = id => document.getElementById(id);

let selectedFile = null;

// Pilih gambar
$('uploadSoalGambar').addEventListener('change', e => {
  if (e.target.files.length === 0) {
    selectedFile = null;
    $('ocrPreview').src = '';
    $('ocrResult').value = '';
    $('jsonResult').value = '';
    return;
  }
  selectedFile = e.target.files[0];
  const url = URL.createObjectURL(selectedFile);
  $('ocrPreview').src = url;
  $('ocrResult').value = '';
  $('jsonResult').value = '';
});

// Mulai scan OCR dengan Tesseract
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

// Parse teks OCR ke JSON via API lo (api/parse.js)
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
      body: JSON.stringify({ text: rawText })
    });

    if (!res.ok) {
      const errText = await res.text();
      alert('Gagal parse OCR ke JSON:\n' + errText);
      return;
    }

    const json = await res.json();
    // Tampilkan hasil JSON di textarea
    $('jsonResult').value = JSON.stringify(json, null, 2);

    // Update soalArray di kelola-soal.js
    if (window.soalArray !== undefined) {
      window.soalArray = json;
    }
  } catch (e) {
    alert('Error saat parsing OCR ke JSON: ' + e.message);
  } finally {
    $('btnParseOCR').disabled = false;
    $('btnParseOCR').textContent = '⚙️ Parse ke Format JSON Soal';
  }
});
