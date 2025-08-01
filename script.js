// ✅ Login Check
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

function loadAllKategori() {
  db.ref().once('value', (snapshot) => {
    const data = snapshot.val();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    updateDropdowns(data);
  });
}

function tambahJenjang() {
  const jenjang = document.getElementById('jenjangInput').value.trim();
  if (!jenjang) return alert('Isi jenjang dulu!');
  db.ref(jenjang).set({}).then(loadAllKategori);
}

function tambahKelas() {
  const jenjang = document.getElementById('jenjangDropdown').value;
  const kelas = document.getElementById('kelasInput').value.trim();
  if (!jenjang || !kelas) return alert('Isi semua field!');
  db.ref(`${jenjang}/${kelas}`).set({}).then(loadAllKategori);
}

function tambahMapel() {
  const jenjang = document.getElementById('jenjangDropdown2').value;
  const kelas = document.getElementById('kelasDropdown').value;
  const mapel = document.getElementById('mapelInput').value.trim();
  if (!jenjang || !kelas || !mapel) return alert('Isi semua field!');
  db.ref(`${jenjang}/${kelas}/${mapel}`).set({}).then(loadAllKategori);
}

function tambahSemester() {
  const jenjang = document.getElementById('jenjangDropdown3').value;
  const kelas = document.getElementById('kelasDropdown2').value;
  const mapel = document.getElementById('mapelDropdown').value;
  const semester = document.getElementById('semesterInput').value.trim();
  if (!jenjang || !kelas || !mapel || !semester) return alert('Isi semua field!');
  db.ref(`${jenjang}/${kelas}/${mapel}/${semester}`).set({}).then(loadAllKategori);
}

function tambahVersi() {
  const jenjang = document.getElementById('jenjangDropdown4').value;
  const kelas = document.getElementById('kelasDropdown3').value;
  const mapel = document.getElementById('mapelDropdown2').value;
  const semester = document.getElementById('semesterDropdown').value;
  const versi = document.getElementById('versiInput').value.trim();
  if (!jenjang || !kelas || !mapel || !semester || !versi) return alert('Isi semua field!');
  db.ref(`${jenjang}/${kelas}/${mapel}/${semester}/${versi}`).set({}).then(loadAllKategori);
}

function updateDropdowns(data) {
  const jenjangs = Object.keys(data || {});
  const kelasByJenjang = {};
  const mapelByKelas = {};
  const semesterByMapel = {};

  // Jenjang
  const jenjangSelects = [
    'jenjangDropdown', 'jenjangDropdown2', 'jenjangDropdown3', 'jenjangDropdown4'
  ];
  jenjangSelects.forEach(id => fillDropdown(id, jenjangs));

  // Kelas
  jenjangs.forEach(j => {
    const kelas = Object.keys(data[j] || {});
    kelasByJenjang[j] = kelas;
  });
  const kelasSelects = ['kelasDropdown', 'kelasDropdown2', 'kelasDropdown3'];
  kelasSelects.forEach(id => {
    const j = document.getElementById(id.replace('kelas', 'jenjang')).value;
    fillDropdown(id, kelasByJenjang[j] || []);
  });

  // Mapel
  for (const j in data) {
    for (const k in data[j]) {
      mapelByKelas[`${j}/${k}`] = Object.keys(data[j][k] || {});
    }
  }
  const mapelSelects = ['mapelDropdown', 'mapelDropdown2'];
  mapelSelects.forEach(id => {
    const j = document.getElementById(id.replace('mapel', 'jenjang')).value;
    const k = document.getElementById(id.replace('mapel', 'kelas')).value;
    fillDropdown(id, mapelByKelas[`${j}/${k}`] || []);
  });

  // Semester
  for (const j in data) {
    for (const k in data[j]) {
      for (const m in data[j][k]) {
        semesterByMapel[`${j}/${k}/${m}`] = Object.keys(data[j][k][m] || {});
      }
    }
  }
  fillDropdown('semesterDropdown', []);
}

function fillDropdown(id, options) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    el.appendChild(o);
  });
}

window.onload = () => {
  cekLogin();
  loadAllKategori();
};
