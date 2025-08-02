// Helper DOM
const $ = id => document.getElementById(id);

// ======= AUTH =======

function cekLogin() {
  if (localStorage.getItem('admin_login') !== 'true') {
    alert('Kamu belum login!');
    window.location.href = 'login.html';
  }
}

function cekLoginLalu(callback) {
  if (localStorage.getItem('admin_login') === 'true') {
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

// ======= CRUD TAMBAH =======

function tambahJenjang() {
  const jenjang = $('jenjangInput').value.trim();
  if (!jenjang) return alert('⚠ Isi jenjang dulu.');
  db.ref(jenjang).set(true).then(() => {
    alert(`✅ Jenjang '${jenjang}' ditambahkan!`);
    $('jenjangInput').value = '';
    loadAllKategori();
  });
}

function tambahKelas() {
  const jenjang = $('jenjangDropdown').value;
  const kelas = $('kelasInput').value.trim();
  if (!jenjang || !kelas) return alert('⚠ Pilih jenjang dan isi kelas.');
  db.ref(`${jenjang}/${kelas}`).set(true).then(() => {
    alert(`✅ Kelas '${kelas}' ditambahkan ke '${jenjang}'`);
    $('kelasInput').value = '';
    loadAllKategori();
  });
}

function tambahMapel() {
  const j = $('jenjangDropdown2').value;
  const k = $('kelasDropdown').value;
  const m = $('mapelInput').value.trim();
  if (!j || !k || !m) return alert('⚠ Lengkapi jenjang, kelas, dan mapel.');
  db.ref(`${j}/${k}/${m}`).set(true).then(() => {
    alert(`✅ Mapel '${m}' ditambahkan!`);
    $('mapelInput').value = '';
    loadAllKategori();
  });
}

function tambahSemester() {
  const j = $('jenjangDropdown3').value;
  const k = $('kelasDropdown2').value;
  const m = $('mapelDropdown').value;
  const s = $('semesterInput').value.trim();
  if (!j || !k || !m || !s) return alert('⚠ Lengkapi semua field.');
  db.ref(`${j}/${k}/${m}/${s}`).set(true).then(() => {
    alert(`✅ Semester '${s}' ditambahkan!`);
    $('semesterInput').value = '';
    loadAllKategori();
  });
}

function tambahVersi() {
  const j = $('jenjangDropdown4').value;
  const k = $('kelasDropdown3').value;
  const m = $('mapelDropdown2').value;
  const s = $('semesterDropdown').value;
  const v = $('versiInput').value.trim();
  if (!j || !k || !m || !s || !v) return alert('⚠ Lengkapi semua field.');
  db.ref(`${j}/${k}/${m}/${s}/${v}`).set(true).then(() => {
    alert(`✅ Versi '${v}' ditambahkan!`);
    $('versiInput').value = '';
    loadAllKategori();
  });
}

// ======= NAVIGASI KELOLA SOAL =======

function isKelolaSoalReady() {
  return ['jenjangManage', 'kelasManage', 'mapelManage', 'semesterManage', 'versiManage']
    .every(id => $(id).value !== '');
}

function updateKelolaButton() {
  const btn = $('btnKelolaSoal');
  btn.disabled = !isKelolaSoalReady();
}

function navigateToKelolaSoal() {
  if (!isKelolaSoalReady()) {
    alert('Lengkapi semua dropdown terlebih dahulu!');
    return;
  }
  const path = [
    $('jenjangManage').value,
    $('kelasManage').value,
    $('mapelManage').value,
    $('semesterManage').value,
    $('versiManage').value
  ].join('/');
  window.location.href = `kelola-soal.html?path=${encodeURIComponent(path)}`;
}

// ======= LOAD DATA =======

function loadAllKategori() {
  db.ref().once('value').then(snapshot => {
    const data = snapshot.val() || {};
    const jenjangKeys = Object.keys(data);

    const dropdowns = [
      'jenjangDropdown', 'jenjangDropdown2', 'jenjangDropdown3',
      'jenjangDropdown4', 'jenjangManage'
    ];

    dropdowns.forEach(id => {
      const el = $(id);
      if (!el) return;
      el.innerHTML = '<option value="">--Pilih Jenjang--</option>';
      jenjangKeys.forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key;
        el.appendChild(opt);
      });
    });

    $('output').textContent = JSON.stringify(data, null, 2);
  });
}

function loadChildDropdown(path, dropdownId) {
  const el = $(dropdownId);
  if (!el) return;
  el.innerHTML = '<option value="">--Pilih--</option>';

  db.ref(path).once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data) return;
    Object.keys(data).forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key;
      el.appendChild(opt);
    });
  });
}

// ======= SETUP EVENT DROPDOWN =======

function setupDropdownEvents() {
  // Tambah Mapel Chain
  $('jenjangDropdown2')?.addEventListener('change', e => {
    loadChildDropdown(e.target.value, 'kelasDropdown');
  });

  $('kelasDropdown')?.addEventListener('change', () => {
    const j = $('jenjangDropdown2').value;
    const k = $('kelasDropdown').value;
    loadChildDropdown(`${j}/${k}`, 'mapelDropdown');
  });

  // Tambah Semester Chain
  $('jenjangDropdown3')?.addEventListener('change', e => {
    loadChildDropdown(e.target.value, 'kelasDropdown2');
  });

  $('kelasDropdown2')?.addEventListener('change', () => {
    const j = $('jenjangDropdown3').value;
    const k = $('kelasDropdown2').value;
    loadChildDropdown(`${j}/${k}`, 'mapelDropdown');
  });

  $('mapelDropdown')?.addEventListener('change', () => {
    const j = $('jenjangDropdown3').value;
    const k = $('kelasDropdown2').value;
    const m = $('mapelDropdown').value;
    loadChildDropdown(`${j}/${k}/${m}`, 'semesterDropdown');
  });

  // Tambah Versi Chain
  $('jenjangDropdown4')?.addEventListener('change', e => {
    loadChildDropdown(e.target.value, 'kelasDropdown3');
  });

  $('kelasDropdown3')?.addEventListener('change', () => {
    const j = $('jenjangDropdown4').value;
    const k = $('kelasDropdown3').value;
    loadChildDropdown(`${j}/${k}`, 'mapelDropdown2');
  });

  $('mapelDropdown2')?.addEventListener('change', () => {
    const j = $('jenjangDropdown4').value;
    const k = $('kelasDropdown3').value;
    const m = $('mapelDropdown2').value;
    loadChildDropdown(`${j}/${k}/${m}`, 'semesterDropdown');
  });

  $('semesterDropdown')?.addEventListener('change', () => {
    const j = $('jenjangDropdown4').value;
    const k = $('kelasDropdown3').value;
    const m = $('mapelDropdown2').value;
    const s = $('semesterDropdown').value;
    loadChildDropdown(`${j}/${k}/${m}/${s}`, 'versiManage');
  });

  // Kelola Soal Chain
  $('jenjangManage')?.addEventListener('change', e => {
    loadChildDropdown(e.target.value, 'kelasManage');
    updateKelolaButton();
  });

  $('kelasManage')?.addEventListener('change', () => {
    const j = $('jenjangManage').value;
    const k = $('kelasManage').value;
    loadChildDropdown(`${j}/${k}`, 'mapelManage');
    updateKelolaButton();
  });

  $('mapelManage')?.addEventListener('change', () => {
    const j = $('jenjangManage').value;
    const k = $('kelasManage').value;
    const m = $('mapelManage').value;
    loadChildDropdown(`${j}/${k}/${m}`, 'semesterManage');
    updateKelolaButton();
  });

  $('semesterManage')?.addEventListener('change', () => {
    const j = $('jenjangManage').value;
    const k = $('kelasManage').value;
    const m = $('mapelManage').value;
    const s = $('semesterManage').value;
    loadChildDropdown(`${j}/${k}/${m}/${s}`, 'versiManage');
    updateKelolaButton();
  });

  $('versiManage')?.addEventListener('change', () => {
    updateKelolaButton();
  });

  // Tombol Kelola Soal
  $('btnKelolaSoal')?.addEventListener('click', navigateToKelolaSoal);
}

// ======= STARTUP =======

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  loadAllKategori();
  setupDropdownEvents();
  updateKelolaButton(); // pastikan tombol disable pas mulai
});
