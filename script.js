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
    const data = snapshot.val() || {};
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);

    updateDropdown('jenjangDropdown', data);
    updateDropdown('jenjangDropdown2', data);
    updateDropdown('jenjangDropdown3', data);
    updateDropdown('jenjangDropdown4', data);

    // Force isi dropdown turunan
    setTimeout(() => {
      const jenjang2 = document.getElementById('jenjangDropdown2').value;
      if (jenjang2) loadChildDropdown(jenjang2, 'kelasDropdown');

      const jenjang3 = document.getElementById('jenjangDropdown3').value;
      if (jenjang3) loadChildDropdown(jenjang3, 'kelasDropdown2');

      const jenjang4 = document.getElementById('jenjangDropdown4').value;
      if (jenjang4) loadChildDropdown(jenjang4, 'kelasDropdown3');

      setTimeout(() => {
        const kelas2 = document.getElementById('kelasDropdown').value;
        if (jenjang2 && kelas2) loadChildDropdown(`${jenjang2}/${kelas2}`, 'mapelDropdown');

        const kelas3 = document.getElementById('kelasDropdown3').value;
        if (jenjang4 && kelas3) loadChildDropdown(`${jenjang4}/${kelas3}`, 'mapelDropdown2');

        const mapel = document.getElementById('mapelDropdown2').value;
        if (jenjang4 && kelas3 && mapel) loadChildDropdown(`${jenjang4}/${kelas3}/${mapel}`, 'semesterDropdown');
      }, 300);
    }, 300);
  });
}

// 🔁 Helper isi dropdown jenjang
function updateDropdown(dropdownId, data) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = '';

  if (dropdown && data) {
    Object.keys(data).forEach(jenjang => {
      const option = document.createElement('option');
      option.value = jenjang;
      option.text = jenjang;
      dropdown.appendChild(option);
    });
  }
}

// 🔁 Helper isi dropdown anak
function loadChildDropdown(path, dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = '';

  db.ref(path).once('value').then(snapshot => {
    const data = snapshot.val();
    if (data) {
      Object.keys(data).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.text = key;
        dropdown.appendChild(option);
      });
    }
  });
}

// 🎯 Listener semua dropdown berantai
document.addEventListener('DOMContentLoaded', () => {
  // Tambah Mapel
  document.getElementById('jenjangDropdown2').addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown2').value;
    if (jenjang) loadChildDropdown(jenjang, 'kelasDropdown');
  });

  document.getElementById('kelasDropdown').addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown2').value;
    const kelas = document.getElementById('kelasDropdown').value;
    if (jenjang && kelas) loadChildDropdown(`${jenjang}/${kelas}`, 'mapelDropdown');
  });

  // Tambah Semester
  document.getElementById('jenjangDropdown3').addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown3').value;
    if (jenjang) loadChildDropdown(jenjang, 'kelasDropdown2');
  });

  document.getElementById('kelasDropdown2').addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown3').value;
    const kelas = document.getElementById('kelasDropdown2').value;
    if (jenjang && kelas) loadChildDropdown(`${jenjang}/${kelas}`, 'mapelDropdown');
  });

  // Tambah Versi
  document.getElementById('jenjangDropdown4').addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown4').value;
    if (jenjang) loadChildDropdown(jenjang, 'kelasDropdown3');
  });

  document.getElementById('kelasDropdown3').addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown4').value;
    const kelas = document.getElementById('kelasDropdown3').value;
    if (jenjang && kelas) loadChildDropdown(`${jenjang}/${kelas}`, 'mapelDropdown2');
  });

  document.getElementById('mapelDropdown2').addEventListener('change', () => {
    const jenjang = document.getElementById('jenjangDropdown4').value;
    const kelas = document.getElementById('kelasDropdown3').value;
    const mapel = document.getElementById('mapelDropdown2').value;
    if (jenjang && kelas && mapel) loadChildDropdown(`${jenjang}/${kelas}/${mapel}`, 'semesterDropdown');
  });
});

// ✅ Fungsi Tambah Data
function tambahJenjang() {
  const jenjang = document.getElementById('jenjangInput').value.trim();
  if (!jenjang) return alert('Isi jenjang dulu');

  db.ref(jenjang).set(true).then(() => {
    alert(`✅ Jenjang "${jenjang}" berhasil ditambahkan`);
    document.getElementById('jenjangInput').value = '';
    loadAllKategori();
  });
}

function tambahKelas() {
  const jenjang = document.getElementById('jenjangDropdown').value;
  const kelas = document.getElementById('kelasInput').value.trim();
  if (!jenjang || !kelas) return alert('Pilih jenjang dan isi kelas');

  db.ref(`${jenjang}/${kelas}`).set(true).then(() => {
    alert(`✅ Kelas "${kelas}" berhasil ditambahkan ke ${jenjang}`);
    document.getElementById('kelasInput').value = '';
    loadAllKategori();
  });
}

function tambahMapel() {
  const jenjang = document.getElementById('jenjangDropdown2').value;
  const kelas = document.getElementById('kelasDropdown').value;
  const mapel = document.getElementById('mapelInput').value.trim();
  if (!jenjang || !kelas || !mapel) return alert('Lengkapi semua kolom');

  db.ref(`${jenjang}/${kelas}/${mapel}`).set(true).then(() => {
    alert(`✅ Mapel "${mapel}" berhasil ditambahkan`);
    document.getElementById('mapelInput').value = '';
    loadAllKategori();
  });
}

function tambahSemester() {
  const jenjang = document.getElementById('jenjangDropdown3').value;
  const kelas = document.getElementById('kelasDropdown2').value;
  const mapel = document.getElementById('mapelDropdown').value;
  const semester = document.getElementById('semesterInput').value.trim();
  if (!jenjang || !kelas || !mapel || !semester) return alert('Lengkapi semua kolom');

  db.ref(`${jenjang}/${kelas}/${mapel}/${semester}`).set(true).then(() => {
    alert(`✅ Semester "${semester}" berhasil ditambahkan`);
    document.getElementById('semesterInput').value = '';
    loadAllKategori();
  });
}

function tambahVersi() {
  const jenjang = document.getElementById('jenjangDropdown4').value;
  const kelas = document.getElementById('kelasDropdown3').value;
  const mapel = document.getElementById('mapelDropdown2').value;
  const semester = document.getElementById('semesterDropdown').value;
  const versi = document.getElementById('versiInput').value.trim();
  if (!jenjang || !kelas || !mapel || !semester || !versi) return alert('Lengkapi semua kolom');

  db.ref(`${jenjang}/${kelas}/${mapel}/${semester}/${versi}`).set(true).then(() => {
    alert(`✅ Versi "${versi}" berhasil ditambahkan`);
    document.getElementById('versiInput').value = '';
    loadAllKategori();
  });
}
