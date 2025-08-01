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

// ✅ Load Semua Struktur
function loadAllKategori() {
  db.ref().once('value').then(snapshot => {
    const data = snapshot.val();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);

    // Populate semua dropdown
    updateDropdown('jenjangDropdown', data);
    updateDropdown('jenjangDropdown2', data);
    updateDropdown('jenjangDropdown3', data);
    updateDropdown('jenjangDropdown4', data);
  });
}

// 🔁 Helper isi dropdown
function updateDropdown(dropdownId, data) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = '';

  if (dropdown && data) {
    Object.keys(data).forEach(j => {
      const option = document.createElement('option');
      option.value = j;
      option.text = j;
      dropdown.appendChild(option);
    });
  }
}

// ✅ Tambah Jenjang
function tambahJenjang() {
  const jenjang = document.getElementById('jenjangInput').value.trim();
  if (!jenjang) return alert('Isi jenjang dulu');

  db.ref(jenjang).set({})
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

  db.ref(`${jenjang}/${kelas}`).set({})
    .then(() => {
      alert(`✅ Kelas "${kelas}" berhasil ditambahkan ke ${jenjang}`);
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

  db.ref(`${jenjang}/${kelas}/${mapel}`).set({})
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

  db.ref(`${jenjang}/${kelas}/${mapel}/${semester}`).set({})
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

  db.ref(`${jenjang}/${kelas}/${mapel}/${semester}/${versi}`).set({})
    .then(() => {
      alert(`✅ Versi "${versi}" berhasil ditambahkan`);
      document.getElementById('versiInput').value = '';
      loadAllKategori();
    })
    .catch(err => alert("❌ Gagal tambah versi: " + err.message));
}
