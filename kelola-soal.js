// helper DOM
const $ = id => document.getElementById(id);

// Global
let currentPath = ""; // path dari query param
let soalArray = []; // array soal parsed

// Cek login
function cekLogin() {
  if (localStorage.getItem('admin_login') !== 'true') {
    alert('Kamu belum login!');
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('admin_login');
  window.location.href = 'login.html';
}

// Ambil path dari URL ?path=
function getPathFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('path') || "";
}

// Init halaman kelola soal
function initKelolaSoal() {
  currentPath = getPathFromURL();
  if (!currentPath) {
    alert('Path tidak ditemukan! Kembali ke halaman utama.');
    window.location.href = 'index.html';
    return;
  }

  loadSoalDariFirebase();

  // Pasang event tombol simpan soal
  $('btnSimpanSoal').addEventListener('click', simpanSemuaSoalKeFirebase);
}

// Load soal dari Firebase ke UI (tampilkan editable form per soal)
function loadSoalDariFirebase() {
  const ref = db.ref(currentPath + "/soal");
  ref.once('value').then(snapshot => {
    soalArray = snapshot.val() || [];
    renderDaftarSoalEditor();
  });
}

// Render editor soal
function renderDaftarSoalEditor() {
  const container = $('daftarSoal');
  container.innerHTML = '';

  if (!Array.isArray(soalArray) || soalArray.length === 0) {
    container.textContent = "Belum ada soal tersimpan di versi ini.";
    return;
  }

  soalArray.forEach((item, i) => {
    const soalDiv = document.createElement('div');
    soalDiv.className = 'soal-item';
    soalDiv.style.border = '1px solid #ccc';
    soalDiv.style.padding = '10px';
    soalDiv.style.marginBottom = '8px';
    soalDiv.style.borderRadius = '6px';

    soalDiv.innerHTML = `
      <label><b>Soal ${i+1}</b></label><br>
      <textarea rows="3" style="width:100%" data-index="${i}" data-key="question">${item.question || ''}</textarea><br>
      <label>A: <input type="text" data-index="${i}" data-key="a" value="${item.a || ''}"></label><br>
      <label>B: <input type="text" data-index="${i}" data-key="b" value="${item.b || ''}"></label><br>
      <label>C: <input type="text" data-index="${i}" data-key="c" value="${item.c || ''}"></label><br>
      <label>D: <input type="text" data-index="${i}" data-key="d" value="${item.d || ''}"></label><br>
      <label>Jawaban Benar: 
        <select data-index="${i}" data-key="correct">
          <option value="">--Pilih--</option>
          <option value="a" ${item.correct === 'a' ? 'selected' : ''}>A</option>
          <option value="b" ${item.correct === 'b' ? 'selected' : ''}>B</option>
          <option value="c" ${item.correct === 'c' ? 'selected' : ''}>C</option>
          <option value="d" ${item.correct === 'd' ? 'selected' : ''}>D</option>
        </select>
      </label>
    `;

    container.appendChild(soalDiv);
  });

  // Pasang event input untuk update soalArray realtime
  container.querySelectorAll('textarea, input[type=text], select').forEach(el => {
    el.addEventListener('input', e => {
      const i = e.target.getAttribute('data-index');
      const key = e.target.getAttribute('data-key');
      if (i === null || !key) return;
      soalArray[i][key] = e.target.value;
    });
  });
}

// Simpan semua soal ke Firebase
function simpanSemuaSoalKeFirebase() {
  if (!Array.isArray(soalArray) || soalArray.length === 0) {
    alert('Belum ada soal untuk disimpan.');
    return;
  }
  // Validasi sederhana soal
  for (let i = 0; i < soalArray.length; i++) {
    const s = soalArray[i];
    if (!s.question || !s.a || !s.b || !s.c || !s.d || !s.correct) {
      alert(`Soal nomor ${i+1} belum lengkap, cek kembali.`);
      return;
    }
  }

  db.ref(currentPath + "/soal").set(soalArray)
    .then(() => {
      alert('✅ Semua soal berhasil disimpan ke Firebase!');
    })
    .catch(err => {
      alert('❌ Gagal simpan soal: ' + err.message);
    });
}
