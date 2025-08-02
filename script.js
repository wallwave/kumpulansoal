// ✅ Cek Login
function cekLogin() {
  const login = localStorage.getItem('admin_login');
  if (login !== 'true') {
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

// ✅ Tambah Jenjang
function tambahJenjang() {
  const jenjang = document.getElementById('jenjangInput').value.trim();
  if (!jenjang) return alert('Isi jenjang dulu.');
  db.ref(jenjang).set(true).then(() => {
    alert(`✅ Jenjang '${jenjang}' ditambahkan!`);
    document.getElementById('jenjangInput').value = '';
    loadAllKategori();
  });
}

// ✅ Tambah Kelas
function tambahKelas() {
  const jenjang = document.getElementById('jenjangDropdown').value;
  const kelas = document.getElementById('kelasInput').value.trim();
  if (!jenjang || !kelas) return alert('Pilih jenjang dan isi kelas.');
  db.ref(`${jenjang}/${kelas}`).set(true).then(() => {
    alert(`✅ Kelas '${kelas}' ditambahkan ke '${jenjang}'`);
    document.getElementById('kelasInput').value = '';
    loadAllKategori();
  });
}

// ✅ Tambah Mapel
function tambahMapel() {
  const j = document.getElementById('jenjangDropdown2').value;
  const k = document.getElementById('kelasDropdown').value;
  const m = document.getElementById('mapelInput').value.trim();
  if (!j || !k || !m) return alert('Lengkapi jenjang, kelas, dan mapel.');
  db.ref(`${j}/${k}/${m}`).set(true).then(() => {
    alert(`✅ Mapel '${m}' ditambahkan!`);
    document.getElementById('mapelInput').value = '';
    loadAllKategori();
  });
}

// ✅ Tambah Semester
function tambahSemester() {
  const j = document.getElementById('jenjangDropdown3').value;
  const k = document.getElementById('kelasDropdown2').value;
  const m = document.getElementById('mapelDropdown').value;
  const s = document.getElementById('semesterInput').value.trim();
  if (!j || !k || !m || !s) return alert('Lengkapi semua field.');
  db.ref(`${j}/${k}/${m}/${s}`).set(true).then(() => {
    alert(`✅ Semester '${s}' ditambahkan!`);
    document.getElementById('semesterInput').value = '';
    loadAllKategori();
  });
}

// ✅ Tambah Versi
function tambahVersi() {
  const j = document.getElementById('jenjangDropdown4').value;
  const k = document.getElementById('kelasDropdown3').value;
  const m = document.getElementById('mapelDropdown2').value;
  const s = document.getElementById('semesterDropdown').value;
  const v = document.getElementById('versiInput').value.trim();
  if (!j || !k || !m || !s || !v) return alert('Lengkapi semua field.');
  db.ref(`${j}/${k}/${m}/${s}/${v}`).set(true).then(() => {
    alert(`✅ Versi '${v}' ditambahkan!`);
    document.getElementById('versiInput').value = '';
    loadAllKategori();
  });
}

// ✅ Navigasi Kelola
function navigateToKelolaSoal() {
  const j = document.getElementById('jenjangManage').value;
  const k = document.getElementById('kelasManage').value;
  const m = document.getElementById('mapelManage').value;
  const s = document.getElementById('semesterManage').value;
  const v = document.getElementById('versiManage').value;
  if (!j || !k || !m || !s || !v) return alert('Lengkapi dropdown!');
  const path = encodeURIComponent(`${j}/${k}/${m}/${s}/${v}`);
  window.location.href = `kelola-soal.html?path=${path}`;
}

// ✅ Load Dropdown Root (jenjang)
function loadAllKategori() {
  db.ref().once('value').then(snapshot => {
    const data = snapshot.val() || {};
    const jenjangKeys = Object.keys(data);
    const dropdowns = [
      'jenjangDropdown', 'jenjangDropdown2', 'jenjangDropdown3',
      'jenjangDropdown4', 'jenjangManage'
    ];
    dropdowns.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = '<option value="">--Pilih Jenjang--</option>';
      jenjangKeys.forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key;
        el.appendChild(opt);
      });
    });

    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
  });
}

// ✅ Load Child Dropdown
function loadChildDropdown(path, dropdownId) {
  const el = document.getElementById(dropdownId);
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

// ✅ Pasang Event Berantai
function setupDropdownEvents() {
  document.getElementById('jenjangDropdown2')?.addEventListener('change', e => {
    const j = e.target.value;
    loadChildDropdown(j, 'kelasDropdown');
  });

  document.getElementById('kelasDropdown')?.addEventListener('change', () => {
    const j = document.getElementById('jenjangDropdown2').value;
    const k = document.getElementById('kelasDropdown').value;
    loadChildDropdown(`${j}/${k}`, 'mapelDropdown');
  });

  document.getElementById('jenjangDropdown3')?.addEventListener('change', e => {
    loadChildDropdown(e.target.value, 'kelasDropdown2');
  });

  document.getElementById('kelasDropdown2')?.addEventListener('change', () => {
    const j = document.getElementById('jenjangDropdown3').value;
    const k = document.getElementById('kelasDropdown2').value;
    loadChildDropdown(`${j}/${k}`, 'mapelDropdown');
  });

  document.getElementById('mapelDropdown')?.addEventListener('change', () => {
    const j = document.getElementById('jenjangDropdown3').value;
    const k = document.getElementById('kelasDropdown2').value;
    const m = document.getElementById('mapelDropdown').value;
    loadChildDropdown(`${j}/${k}/${m}`, 'semesterDropdown');
  });

  document.getElementById('jenjangDropdown4')?.addEventListener('change', e => {
    loadChildDropdown(e.target.value, 'kelasDropdown3');
  });

  document.getElementById('kelasDropdown3')?.addEventListener('change', () => {
    const j = document.getElementById('jenjangDropdown4').value;
    const k = document.getElementById('kelasDropdown3').value;
    loadChildDropdown(`${j}/${k}`, 'mapelDropdown2');
  });

  document.getElementById('mapelDropdown2')?.addEventListener('change', () => {
    const j = document.getElementById('jenjangDropdown4').value;
    const k = document.getElementById('kelasDropdown3').value;
    const m = document.getElementById('mapelDropdown2').value;
    loadChildDropdown(`${j}/${k}/${m}`, 'semesterDropdown');
  });

  document.getElementById('semesterDropdown')?.addEventListener('change', () => {
    const j = document.getElementById('jenjangDropdown4').value;
    const k = document.getElementById('kelasDropdown3').value;
    const m = document.getElementById('mapelDropdown2').value;
    const s = document.getElementById('semesterDropdown').value;
    loadChildDropdown(`${j}/${k}/${m}/${s}`, 'versiManage'); // reuse
  });

  document.getElementById('jenjangManage')?.addEventListener('change', e => {
    loadChildDropdown(e.target.value, 'kelasManage');
  });

  document.getElementById('kelasManage')?.addEventListener('change', () => {
    const j = document.getElementById('jenjangManage').value;
    const k = document.getElementById('kelasManage').value;
    loadChildDropdown(`${j}/${k}`, 'mapelManage');
  });

  document.getElementById('mapelManage')?.addEventListener('change', () => {
    const j = document.getElementById('jenjangManage').value;
    const k = document.getElementById('kelasManage').value;
    const m = document.getElementById('mapelManage').value;
    loadChildDropdown(`${j}/${k}/${m}`, 'semesterManage');
  });

  document.getElementById('semesterManage')?.addEventListener('change', () => {
    const j = document.getElementById('jenjangManage').value;
    const k = document.getElementById('kelasManage').value;
    const m = document.getElementById('mapelManage').value;
    const s = document.getElementById('semesterManage').value;
    loadChildDropdown(`${j}/${k}/${m}/${s}`, 'versiManage');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  loadAllKategori();
  setupDropdownEvents();
});