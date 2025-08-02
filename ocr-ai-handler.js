// OCR AI Handler with Self-Learning Capability
const $ = id => document.getElementById(id);

// Learning Database
let learningDB = JSON.parse(localStorage.getItem('ocrLearningDB')) || {
  patterns: {
    question: [
      /^(\d+)\.\.(.+)/,      // 1..Question
      /^(\d+)\)(.+)/,         // 1) Question
      /^(\d+)\.(.+)/,         // 1. Question
      /^(\d+)\s(.+)/          // 1 Question
    ],
    option: [
      /^([a-d])[\.\)]\s*(.+)/i,  // a. Option
      /^\.\s*(.+)/,              // . Option
      /^([a-d])\s*(.+)/i         // a Option
    ],
    correct: [
      /€/,                     // Euro symbol marker
      /√/,                     // Checkmark
      /jawaban\s*:\s*([a-d])/i, // Jawaban: a
      /kunci\s*:\s*([a-d])/i    // Kunci: b
    ]
  },
  corrections: [],
  stats: {
    totalProcessed: 0,
    accuracy: 0
  }
};

let selectedFile = null;
let currentSoalSet = [];

// Initialize OCR Handler
function initOCRHandler() {
  // Event Listeners
  $('uploadSoalGambar').addEventListener('change', handleFileUpload);
  $('btnMulaiScan').addEventListener('click', startOCRScan);
  $('btnParseOCR').addEventListener('click', parseOCRText);
  
  // Load any saved corrections
  updateLearningStats();
}

// File Upload Handler
function handleFileUpload(e) {
  if (e.target.files.length === 0) {
    resetOCRInterface();
    return;
  }
  
  selectedFile = e.target.files[0];
  $('ocrPreview').src = URL.createObjectURL(selectedFile);
  $('ocrResult').value = '';
  $('jsonResult').value = '';
}

// Reset OCR Interface
function resetOCRInterface() {
  selectedFile = null;
  $('ocrPreview').src = '';
  $('ocrResult').value = '';
  $('jsonResult').value = '';
  $('daftarSoal').innerHTML = '';
}

// Start OCR Scanning
async function startOCRScan() {
  if (!selectedFile) {
    alert('Pilih gambar soal terlebih dahulu!');
    return;
  }

  $('btnMulaiScan').disabled = true;
  $('btnMulaiScan').textContent = '🔄 Memindai...';

  try {
    const { data: { text } } = await Tesseract.recognize(
      selectedFile,
      'ind',
      { 
        logger: m => console.log(m),
        preserve_interword_spaces: true
      }
    );
    
    $('ocrResult').value = text;
    learningDB.stats.totalProcessed++;
    saveLearningDB();
    
  } catch (err) {
    alert('OCR gagal: ' + err.message);
    console.error(err);
  } finally {
    $('btnMulaiScan').disabled = false;
    $('btnMulaiScan').textContent = '🔍 Mulai Scan OCR';
  }
}

// Parse OCR Text to Structured Questions
function parseOCRText() {
  const rawText = $('ocrResult').value.trim();
  if (!rawText) {
    alert('Teks OCR kosong, lakukan scan dulu!');
    return;
  }

  $('btnParseOCR').disabled = true;
  $('btnParseOCR').textContent = '🧠 Memproses...';

  try {
    const parsedData = parseQuestionsWithAI(rawText);
    $('jsonResult').value = JSON.stringify(parsedData, null, 2);
    
    // Convert to array format for Firebase
    currentSoalSet = Object.values(parsedData.versi_1);
    renderQuestionEditor(currentSoalSet);
    
  } catch (err) {
    alert('Gagal parse soal: ' + err.message);
    console.error(err);
  } finally {
    $('btnParseOCR').disabled = false;
    $('btnParseOCR').textContent = '⚙️ Parse ke Format JSON Soal';
  }
}

// AI-Powered Question Parser
function parseQuestionsWithAI(rawText) {
  const lines = rawText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const questions = { versi_1: {} };
  let currentQuestion = null;
  let qIndex = 1;
  let optionBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for question patterns
    const qMatch = matchPattern(line, learningDB.patterns.question);
    if (qMatch) {
      if (currentQuestion) {
        processQuestionOptions(currentQuestion, optionBuffer);
        questions.versi_1[qIndex] = currentQuestion;
        optionBuffer = [];
        qIndex++;
      }
      
      currentQuestion = {
        question: cleanQuestionText(qMatch[2]),
        a: '', b: '', c: '', d: '',
        correct: ''
      };
      continue;
    }
    
    // Check for option patterns
    const oMatch = matchPattern(line, learningDB.patterns.option);
    if (oMatch && currentQuestion) {
      optionBuffer.push(line);
      continue;
    }
    
    // Check for correct answer markers
    const cMatch = matchPattern(line, learningDB.patterns.correct);
    if (cMatch && currentQuestion) {
      if (cMatch[1]) { // For patterns with capture group like /jawaban: ([a-d])/
        currentQuestion.correct = cMatch[1].toLowerCase();
      } else { // For marker patterns like /€/
        // Find which option contains the marker
        const markedOption = findMarkedOption(optionBuffer);
        if (markedOption) currentQuestion.correct = markedOption;
      }
      continue;
    }
    
    // If no pattern matched, add to current option buffer
    if (currentQuestion) optionBuffer.push(line);
  }

  // Process the last question
  if (currentQuestion) {
    processQuestionOptions(currentQuestion, optionBuffer);
    questions.versi_1[qIndex] = currentQuestion;
  }

  return questions;
}

// Helper: Match text against multiple patterns
function matchPattern(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match;
  }
  return null;
}

// Helper: Clean question text
function cleanQuestionText(text) {
  return text
    .replace(/^\s*[-.)]\s*/, '') // Remove leading bullets
    .replace(/\s+/g, ' ')         // Collapse multiple spaces
    .trim();
}

// Helper: Find which option contains correct answer marker
function findMarkedOption(buffer) {
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i].match(/[€√]/)) {
      // Find which option this belongs to
      const optionMatch = buffer[i].match(/^([a-d])/i);
      if (optionMatch) return optionMatch[1].toLowerCase();
      
      // If no option letter, guess based on position
      if (i === 0) return 'a';
      if (i === 1) return 'b';
      if (i === 2) return 'c';
      if (i === 3) return 'd';
    }
  }
  return null;
}

// Process question options from buffer
function processQuestionOptions(question, buffer) {
  const options = { a: [], b: [], c: [], d: [] };
  let currentOption = null;

  buffer.forEach(line => {
    // Check if line starts a new option
    const oMatch = matchPattern(line, learningDB.patterns.option);
    if (oMatch) {
      currentOption = oMatch[1] ? oMatch[1].toLowerCase() : 
        (!options.a.length ? 'a' :
         !options.b.length ? 'b' :
         !options.c.length ? 'c' : 'd');
      
      const optionText = oMatch[2] || oMatch[1] || line;
      options[currentOption].push(cleanOptionText(optionText));
      return;
    }
    
    // Continue adding to current option
    if (currentOption) {
      options[currentOption].push(cleanOptionText(line));
    }
  });

  // Join multi-line options and clean up
  ['a', 'b', 'c', 'd'].forEach(opt => {
    question[opt] = options[opt].join(' ').trim();
  });
  
  // If no correct answer detected, make an educated guess
  if (!question.correct) {
    question.correct = guessCorrectAnswer(question);
  }
}

// Helper: Clean option text
function cleanOptionText(text) {
  return text
    .replace(/[€√]/g, '')      // Remove answer markers
    .replace(/^\s*[-.)]\s*/, '') // Remove leading bullets
    .replace(/\s+/g, ' ')       // Collapse multiple spaces
    .trim();
}

// Educated guess for correct answer
function guessCorrectAnswer(question) {
  // Check for any remaining markers
  for (const opt of ['a', 'b', 'c', 'd']) {
    if (question[opt].match(/[€√]/)) return opt;
  }
  
  // Check for longest option (common in tests)
  const options = ['a', 'b', 'c', 'd']
    .map(opt => ({ opt, length: question[opt].length }))
    .sort((a, b) => b.length - a.length);
  
  return options[0].opt;
}

// Render Question Editor
function renderQuestionEditor(questions) {
  const container = $('daftarSoal');
  container.innerHTML = '';

  if (!questions || questions.length === 0) {
    container.innerHTML = '<p>Belum ada soal yang diparsing.</p>';
    return;
  }

  questions.forEach((q, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'soal-item';
    questionDiv.innerHTML = `
      <h4>Soal ${index + 1}</h4>
      <textarea data-index="${index}" data-field="question" 
        style="width:100%; margin-bottom:10px;">${q.question || ''}</textarea>
      
      <div class="option-grid">
        <label>A: <input type="text" data-index="${index}" data-field="a" value="${q.a || ''}"></label>
        <label>B: <input type="text" data-index="${index}" data-field="b" value="${q.b || ''}"></label>
        <label>C: <input type="text" data-index="${index}" data-field="c" value="${q.c || ''}"></label>
        <label>D: <input type="text" data-index="${index}" data-field="d" value="${q.d || ''}"></label>
      </div>
      
      <div style="margin-top:10px;">
        <label>Jawaban Benar:
          <select data-index="${index}" data-field="correct">
            <option value="a" ${q.correct === 'a' ? 'selected' : ''}>A</option>
            <option value="b" ${q.correct === 'b' ? 'selected' : ''}>B</option>
            <option value="c" ${q.correct === 'c' ? 'selected' : ''}>C</option>
            <option value="d" ${q.correct === 'd' ? 'selected' : ''}>D</option>
          </select>
        </label>
        <button class="btn-remove" data-index="${index}">🗑 Hapus</button>
      </div>
      <hr>
    `;
    
    container.appendChild(questionDiv);
  });

  // Add event listeners for real-time updates
  container.querySelectorAll('textarea, input, select').forEach(el => {
    el.addEventListener('input', updateQuestionFromEditor);
  });

  // Add event listeners for remove buttons
  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', removeQuestion);
  });
}

// Update question data from editor
function updateQuestionFromEditor(e) {
  const index = e.target.dataset.index;
  const field = e.target.dataset.field;
  const value = e.target.value;
  
  if (index && field && currentSoalSet[index]) {
    currentSoalSet[index][field] = value;
  }
}

// Remove question from set
function removeQuestion(e) {
  const index = e.target.dataset.index;
  if (index >= 0 && index < currentSoalSet.length) {
    currentSoalSet.splice(index, 1);
    renderQuestionEditor(currentSoalSet);
  }
}

// Save Learning Database
function saveLearningDB() {
  localStorage.setItem('ocrLearningDB', JSON.stringify(learningDB));
}

// Update Learning Stats Display
function updateLearningStats() {
  const statsDiv = document.getElementById('learningStats') || createLearningStatsPanel();
  statsDiv.innerHTML = `
    <h4>📊 Statistik Pembelajaran AI</h4>
    <p>Total diproses: ${learningDB.stats.totalProcessed}</p>
    <p>Akurasi: ${(learningDB.stats.accuracy * 100).toFixed(1)}%</p>
    <p>Pola yang dipelajari: ${learningDB.patterns.question.length + 
                              learningDB.patterns.option.length + 
                              learningDB.patterns.correct.length}</p>
  `;
}

function createLearningStatsPanel() {
  const panel = document.createElement('div');
  panel.id = 'learningStats';
  panel.className = 'learning-panel';
  document.querySelector('.form').appendChild(panel);
  return panel;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initOCRHandler);
