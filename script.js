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

// ✅ Navigasi Kelola Soal
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

// ✅ Load Semua Kategori dan Dropdown
function loadAllKategori() {
  db.ref().once('value').then(snapshot => {
    const data = snapshot.val();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);

    ['jenjangDropdown', 'jenjangDropdown2', 'jenjangDropdown3', 'jenjangDropdown4', 'jenjangManage'].forEach(id => {
      updateDropdown(id, data);
    });

    ['jenjangDropdown2', 'jenjangDropdown3', 'jenjangDropdown4', 'jenjangManage'].forEach(id => {
      document.getElementById(id)?.dispatchEvent(new Event('change'));
    });
  });
}

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
    dropdown.dispatchEvent(new Event('change'));
  });
}

// ✅ Setup Dropdown Berantai
function setupDropdownEvents() {
  const map = [
    ['jenjangDropdown2', 'kelasDropdown'],
    ['jenjangDropdown3', 'kelasDropdown2'],
    ['kelasDropdown2', 'mapelDropdown', (j, k) => `${j}/${k}`],
    ['jenjangDropdown4', 'kelasDropdown3'],
    ['kelasDropdown3', 'mapelDropdown2', (j, k) => `${j}/${k}`],
    ['mapelDropdown2', 'semesterDropdown', (j, k, m) => `${j}/${k}/${m}`],
    ['jenjangManage', 'kelasManage'],
    ['kelasManage', 'mapelManage', (j, k) => `${j}/${k}`],
    ['mapelManage', 'semesterManage', (j, k, m) => `${j}/${k}/${m}`],
    ['semesterManage', 'versiManage', (j, k, m, s) => `${j}/${k}/${m}/${s}`],
  ];

  map.forEach(([from, to, pathFn]) => {
    document.getElementById(from)?.addEventListener('change', () => {
      const j = document.getElementById('jenjangManage')?.value;
      const k = document.getElementById('kelasManage')?.value;
      const m = document.getElementById('mapelManage')?.value;
      const s = document.getElementById('semesterManage')?.value;

      const fromVal = document.getElementById(from)?.value;
      const kVal = document.getElementById(k) ? document.getElementById(k).value : '';
      const mVal = document.getElementById(m) ? document.getElementById(m).value : '';
      const sVal = document.getElementById(s) ? document.getElementById(s).value : '';

      const path = pathFn ? pathFn(j, k, m, s) : fromVal;
      loadChildDropdown(path, to);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cekLogin();
  loadAllKategori();
  setupDropdownEvents();
});
