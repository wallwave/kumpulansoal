// ✅ Firebase dan Auth
function cekLogin() {
  const login = localStorage.getItem('admin_login');
  if (login !== 'true') {
    alert('Kamu belum login!');
    window.location.href = 'login.html';
  }
}

function cekLoginLalu(callback) {
  const login = localStorage.getItem('admin_login');
  if (login === 'true') {
    callback();
  } else {
    alert('Kamu belum login!');
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('admin_login');
  window.location.href = 'login.html';
}

// ✅ Tambah Data Fungsi
function tambahJenjang() {
  const jenjang = document.getElementById('jenjangInput').value.trim();
  if (!jenjang) return alert('Jenjang tidak boleh kosong.');
  db.ref(jenjang).set(true).then(() => {
    alert('Jenjang ditambahkan!');
    loadAllKategori();
  });
}

function tambahKelas() {
  const jenjang = document.getElementById('jenjangDropdown').value;
  const kelas = document.getElementById('kelasInput').value.trim();
  if (!jenjang || !kelas) return alert('Pilih jenjang dan isi kelas!');
  db.ref(`${jenjang}/${kelas}`).set(true).then(() => {
    alert('Kelas ditambahkan!');
    loadAllKategori();
  });
}

function tambahMapel() {
  const j = document.getElementById('jenjangDropdown2').value;
  const k = document.getElementById('kelasDropdown').value;
  const m = document.getElementById('mapelInput').value.trim();
  if (!j || !k || !m) return alert('Pilih jenjang & kelas, isi mapel!');
  db.ref(`${j}/${k}/${m}`).set(true).then(() => {
    alert('Mapel ditambahkan!');
    loadAllKategori();
  });
}

function tambahSemester() {
  const j = document.getElementById('jenjangDropdown3').value;
  const k = document.getElementById('kelasDropdown2').value;
  const m = document.getElementById('mapelDropdown').value;
  const s = document.getElementById('semesterInput').value.trim();
  if (!j || !k || !m || !s) return alert('Lengkapi semua input!');
  db.ref(`${j}/${k}/${m}/${s}`).set(true).then(() => {
    alert('Semester ditambahkan!');
    loadAllKategori();
  });
}

function tambahVersi() {
  const j = document.getElementById('jenjangDropdown4').value;
  const k = document.getElementById('kelasDropdown3').value;
  const m = document.getElementById('mapelDropdown2').value;
  const s = document.getElementById('semesterDropdown').value;
  const v = document.getElementById('versiInput').value.trim();
  if (!j || !k || !m || !s || !v) return alert('Lengkapi semua input!');
  db.ref(`${j}/${k}/${m}/${s}/${v}`).set(true).then(() => {
    alert('Versi ditambahkan!');
    loadAllKategori();
  });
}

// ✅ Navigasi
function navigateToKelolaSoal() {
  const j = document.getElementById('jenjangManage').value;
  const k = document.getElementById('kelasManage').value;
  const m = document.getElementById('mapelManage').value;
  const s = document.getElementById('semesterManage').value;
  const v = document.getElementById('versiManage').value;
  if (!j || !k || !m || !s || !v) return alert('Lengkapi semua dropdown terlebih dahulu!');
  const path = encodeURIComponent(`${j}/${k}/${m}/${s}/${v}`);
  window.location.href = `kelola-soal.html?path=${path}`;
}

// ✅ Load Semua Kategori
function loadAllKategori() {
  db.ref().once('value').then(snapshot => {
    const data = snapshot.val();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);

    const jenjangIds = ['jenjangDropdown', 'jenjangDropdown2', 'jenjangDropdown3', 'jenjangDropdown4', 'jenjangManage'];
    jenjangIds.forEach(id => updateDropdown(id, data));

    setupDropdownEvents(data); // pasang ulang event tiap reload
  });
}

// ✅ Update Dropdown Umum
function updateDropdown(dropdownId, data) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  dropdown.innerHTML = '<option value="">--Pilih--</option>';
  Object.keys(data || {}).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    dropdown.appendChild(option);
  });
}

// ✅ Update Anak Dropdown
function loadChildDropdown(path, targetId) {
  const dropdown = document.getElementById(targetId);
  if (!dropdown) return;
  dropdown.innerHTML = '<option value="">--Pilih--</option>';
  db.ref(path).once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data) return;
    Object.keys(data).forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      dropdown.appendChild(option);
    });
  });
}

// ✅ Dropdown Chain Setup
function setupDropdownEvents(data) {
  const config = [
    ['jenjangDropdown2', 'kelasDropdown', j => `${j}`],
    ['kelasDropdown', 'mapelDropdown', (j, k) => `${j}/${k}`],
    ['jenjangDropdown3', 'kelasDropdown2', j => `${j}`],
    ['kelasDropdown2', 'mapelDropdown', (j, k) => `${j}/${k}`],
    ['mapelDropdown', 'semesterDropdown', (j, k, m) => `${j}/${k}/${m}`],
    ['jenjangDropdown4', 'kelasDropdown3', j => `${j}`],
    ['kelasDropdown3', 'mapelDropdown2', (j, k) => `${j}/${k}`],
    ['mapelDropdown2', 'semesterDropdown', (j, k, m) => `${j}/${k}/${m}`],
    ['semesterDropdown', 'versiDropdown', (j, k, m, s) => `${j}/${k}/${m}/${s}`],
    ['jenjangManage', 'kelasManage', j => `${j}`],
    ['kelasManage', 'mapelManage', (j, k) => `${j}/${k}`],
    ['mapelManage', 'semesterManage', (j, k, m) => `${j}/${k}/${m}`],
    ['semesterManage', 'versiManage', (j, k, m, s) => `${j}/${k}/${m}/${s}`],
  ];

  config.forEach(([from, to, pathFn]) => {
    const fromEl = document.getElementById(from);
    if (!fromEl) return;

    fromEl.addEventListener('change', () => {
      const j = document.getElementById(from)?.value || '';
      const k = document.getElementById('kelasDropdown')?.value || document.getElementById('kelasDropdown2')?.value || document.getElementById('kelasDropdown3')?.value || document.getElementById('kelasManage')?.value || '';
      const m = document.getElementById('mapelDropdown')?.value || document.getElementById('mapelDropdown2')?.value || document.getElementById('mapelManage')?.value || '';
      const s = document.getElementById('semesterDropdown')?.value || document.getElementById('semesterManage')?.value || '';

      const path = pathFn ? pathFn(j, k, m, s) : j;
      loadChildDropdown(path, to);
    });
  });
}
