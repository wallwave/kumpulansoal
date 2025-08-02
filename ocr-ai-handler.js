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

// Parse teks OCR ke JSON soal secara lokal
$('btnParseOCR').addEventListener('click', () => {
  const rawText = $('ocrResult').value.trim();
  if (!rawText) {
    alert('Teks OCR kosong, lakukan scan dulu!');
    return;
  }

  $('btnParseOCR').disabled = true;
  $('btnParseOCR').textContent = '⚙️ Memproses...';

  try {
    const soalObject = { versi_1: {} };
    const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
    let currentQuestion = null;
    let questionIndex = 1;
    let currentOption = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Deteksi pertanyaan baru (format: "1. Apa itu...")
      const questionMatch = line.match(/^(\d+)\.\s*(.+)/);
      if (questionMatch) {
        // Simpan pertanyaan sebelumnya jika ada
        if (currentQuestion) {
          soalObject.versi_1[questionIndex.toString()] = currentQuestion;
          questionIndex++;
        }
        currentQuestion = {
          question: questionMatch[2],
          a: '',
          b: '',
          c: '',
          d: '',
          correct: 'a' // default
        };
        currentOption = null;
        continue;
      }
      
      // Deteksi opsi jawaban (format: "a. Jawaban a")
      const optionMatch = line.match(/^([a-d])[\.\)]\s*(.+)/i);
      if (optionMatch && currentQuestion) {
        const option = optionMatch[1].toLowerCase();
        currentQuestion[option] = optionMatch[2];
        currentOption = option;
        continue;
      }
      
      // Deteksi jawaban benar (format: "Jawaban: a" atau "Kunci: b")
      const answerMatch = line.match(/^(jawaban|kunci)\s*:\s*([a-d])/i);
      if (answerMatch && currentQuestion) {
        currentQuestion.correct = answerMatch[2].toLowerCase();
        continue;
      }
      
      // Jika sedang memproses opsi dan baris ini bukan format khusus,
      // tambahkan ke opsi terakhir (untuk jawaban multi-baris)
      if (currentOption && currentQuestion) {
        currentQuestion[currentOption] += ' ' + line;
      }
    }
    
    // Tambahkan pertanyaan terakhir jika ada
    if (currentQuestion) {
      soalObject.versi_1[questionIndex.toString()] = currentQuestion;
    }

    $('jsonResult').value = JSON.stringify(soalObject, null, 2);
    window.soalArray = soalObject;
    
    // Tampilkan hasil parsing
    displayParsedQuestions(soalObject.versi_1);
    
  } catch (err) {
    alert('Gagal parse soal: ' + err.message);
    console.error(err);
  } finally {
    $('btnParseOCR').disabled = false;
    $('btnParseOCR').textContent = '⚙️ Parse ke Format JSON Soal';
  }
});

// Fungsi untuk menampilkan hasil parsing dalam bentuk yang lebih mudah dibaca
function displayParsedQuestions(questions) {
  const container = $('parsedQuestionsContainer') || document.createElement('div');
  container.id = 'parsedQuestionsContainer';
  container.innerHTML = '<h3>Hasil Parsing:</h3>';
  
  Object.entries(questions).forEach(([number, question]) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
      <h4>Soal ${number}: ${question.question}</h4>
      <ul>
        <li class="${question.correct === 'a' ? 'correct' : ''}">a. ${question.a}</li>
        <li class="${question.correct === 'b' ? 'correct' : ''}">b. ${question.b}</li>
        <li class="${question.correct === 'c' ? 'correct' : ''}">c. ${question.c}</li>
        <li class="${question.correct === 'd' ? 'correct' : ''}">d. ${question.d}</li>
      </ul>
      <p>Jawaban benar: ${question.correct.toUpperCase()}</p>
      <hr>
    `;
    container.appendChild(questionDiv);
  });
  
  if (!document.getElementById('parsedQuestionsContainer')) {
    document.body.appendChild(container);
  }
  
  // Tambahkan styling sederhana
  const style = document.createElement('style');
  style.textContent = `
    .question {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .correct {
      color: green;
      font-weight: bold;
    }
    #parsedQuestionsContainer {
      margin-top: 20px;
      font-family: Arial, sans-serif;
    }
  `;
  document.head.appendChild(style);
}
