// ✅ Inisialisasi Login Cek
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

// ✅ Load Semua Struktur & Sinkronisasi Dropdown
function loadAllKategori() {
  db.ref().once('value').then(snapshot => {
    const data = snapshot.val();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);

    updateDropdown('jenjangDropdown', data);
    updateDropdown('jenjangDropdown2', data);
    updateDropdown('jenjangDropdown3', data);
    updateDropdown('jenjangDropdown4', data);

    // force trigger biar turunannya ikutan update
    triggerAllDropdownEvents();
  });
}

function triggerAllDropdownEvents() {
  ['jenjangDropdown2', 'jenjangDropdown3', 'jenjangDropdown4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.dispatchEvent(new Event('change'));
  });
}

// 🔁 Helper isi dropdown jenjang
function updateDropdown(dropdownId, data) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  dropdown.innerHTML = '';
  Object.keys(data || {}).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.text = key;
    dropdown.appendChild(option);
  });
}

// 🔁 Helper isi dropdown child berdasarkan path
function loadChildDropdown(path, targetId) {
  const dropdown = document.getElementById(targetId);
  if (!dropdown) return;
  dropdown.innerHTML = '';
  db.ref(path).once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data) return;
    Object.keys(data).forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.text = key;
      dropdown.appendChild(option);
    });

    // trigger turunannya
    dropdown.dispatchEvent(new Event('change'));
  });
}

// ✅ Trigger hubungan dropdown berantai
document.addEventListener('DOMContentLoaded', () => {
  // Mapel
  document.getElementById('jenjangDropdown2')?.addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown2').value;
    loadChildDropdown(jenjang, 'kelasDropdown');
  });

  // Semester
  document.getElementById('jenjangDropdown3')?.addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown3').value;
    loadChildDropdown(jenjang, 'kelasDropdown2');
  });
  document.getElementById('kelasDropdown2')?.addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown3').value;
    const kelas = document.getElementById('kelasDropdown2').value;
    loadChildDropdown(`${jenjang}/${kelas}`, 'mapelDropdown');
  });

  // Versi
  document.getElementById('jenjangDropdown4')?.addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown4').value;
    loadChildDropdown(jenjang, 'kelasDropdown3');
  });
  document.getElementById('kelasDropdown3')?.addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown4').value;
    const kelas = document.getElementById('kelasDropdown3').value;
    loadChildDropdown(`${jenjang}/${kelas}`, 'mapelDropdown2');
  });
  document.getElementById('mapelDropdown2')?.addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown4').value;
    const kelas = document.getElementById('kelasDropdown3').value;
    const mapel = document.getElementById('mapelDropdown2').value;
    loadChildDropdown(`${jenjang}/${kelas}/${mapel}`, 'semesterDropdown');
  });
});

// ✅ Tambah Jenjang
function tambahJenjang() {
  const jenjang = document.getElementById('jenjangInput').value.trim();
  if (!jenjang) return alert('Isi jenjang dulu');

  db.ref(jenjang).set(true)
    .then(() => {
      alert(`✅ Jenjang "${jenjang}" berhasil ditambahkan`);
      document.getElementById('jenjangInput').value = '';
      loadAllKategori();
    })
    .catch(err => alert("❌ Gagal tambah jenjang: " + err.message));
}

// ✅ Tambah Kelas
function tambahKelas() {
  const jenjang = document.getElementById('jenjangDropdown').value;
  const kelas = document.getElementById('kelasInput').value.trim();
  if (!jenjang || !kelas) return alert('Pilih jenjang dan isi kelas');

  db.ref(`${jenjang}/${kelas}`).set(true)
    .then(() => {
      alert(`✅ Kelas "${kelas}" berhasil ditambahkan`);
      document.getElementById('kelasInput').value = '';
      loadAllKategori();
    })
    .catch(err => alert("❌ Gagal tambah kelas: " + err.message));
}

// ✅ Tambah Mapel
function tambahMapel() {
  const jenjang = document.getElementById('jenjangDropdown2').value;
  const kelas = document.getElementById('kelasDropdown').value;
  const mapel = document.getElementById('mapelInput').value.trim();
  if (!jenjang || !kelas || !mapel) return alert('Lengkapi semua kolom');

  db.ref(`${jenjang}/${kelas}/${mapel}`).set(true)
    .then(() => {
      alert(`✅ Mapel "${mapel}" berhasil ditambahkan`);
      document.getElementById('mapelInput').value = '';
      loadAllKategori();
    })
    .catch(err => alert("❌ Gagal tambah mapel: " + err.message));
}

// ✅ Tambah Semester
function tambahSemester() {
  const jenjang = document.getElementById('jenjangDropdown3').value;
  const kelas = document.getElementById('kelasDropdown2').value;
  const mapel = document.getElementById('mapelDropdown').value;
  const semester = document.getElementById('semesterInput').value.trim();
  if (!jenjang || !kelas || !mapel || !semester) return alert('Lengkapi semua kolom');

  db.ref(`${jenjang}/${kelas}/${mapel}/${semester}`).set(true)
    .then(() => {
      alert(`✅ Semester "${semester}" berhasil ditambahkan`);
      document.getElementById('semesterInput').value = '';
      loadAllKategori();
    })
    .catch(err => alert("❌ Gagal tambah semester: " + err.message));
}

// ✅ Tambah Versi
function tambahVersi() {
  const jenjang = document.getElementById('jenjangDropdown4').value;
  const kelas = document.getElementById('kelasDropdown3').value;
  const mapel = document.getElementById('mapelDropdown2').value;
  const semester = document.getElementById('semesterDropdown').value;
  const versi = document.getElementById('versiInput').value.trim();
  if (!jenjang || !kelas || !mapel || !semester || !versi) return alert('Lengkapi semua kolom');

  db.ref(`${jenjang}/${kelas}/${mapel}/${semester}/${versi}`).set(true)
    .then(() => {
      alert(`✅ Versi "${versi}" berhasil ditambahkan`);
      document.getElementById('versiInput').value = '';
      loadAllKategori();
    })
    .catch(err => alert("❌ Gagal tambah versi: " + err.message));
}

function updateManageDropdowns() {
  loadAllKategori(); // Pastikan ini sudah jalan dulu

  document.getElementById('jenjangManage').addEventListener('change', () => {
    const j = document.getElementById('jenjangManage').value;
    loadChildDropdown(j, 'kelasManage');
  });

  document.getElementById('kelasManage').addEventListener('change', () => {
    const j = document.getElementById('jenjangManage').value;
    const k = document.getElementById('kelasManage').value;
    loadChildDropdown(`${j}/${k}`, 'mapelManage');
  });

  document.getElementById('mapelManage').addEventListener('change', () => {
    const j = document.getElementById('jenjangManage').value;
    const k = document.getElementById('kelasManage').value;
    const m = document.getElementById('mapelManage').value;
    loadChildDropdown(`${j}/${k}/${m}`, 'semesterManage');
  });

  document.getElementById('semesterManage').addEventListener('change', () => {
    const j = document.getElementById('jenjangManage').value;
    const k = document.getElementById('kelasManage').value;
    const m = document.getElementById('mapelManage').value;
    const s = document.getElementById('semesterManage').value;
    loadChildDropdown(`${j}/${k}/${m}/${s}`, 'versiManage');
  });
}

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

document.addEventListener('DOMContentLoaded', () => {
  handleDropdownTriggers(); // biar semua chain dropdown jalan
  updateManageDropdowns();  // 🔥 ini biar manage versi keisi & tombol bisa jalan
});

