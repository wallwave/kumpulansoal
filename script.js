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

    const jenjangDropdown = document.getElementById('jenjangDropdown');
    const jenjangDropdown2 = document.getElementById('jenjangDropdown2');
    jenjangDropdown.innerHTML = '';
    jenjangDropdown2.innerHTML = '';

    for (const jenjang in data) {
      const opt1 = document.createElement('option');
      opt1.value = jenjang;
      opt1.textContent = jenjang;
      jenjangDropdown.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = jenjang;
      opt2.textContent = jenjang;
      jenjangDropdown2.appendChild(opt2);
    }
  });
}

function tambahJenjang() {
  const jenjang = document.getElementById('jenjangInput').value.trim();
  if (!jenjang) return alert('Masukkan jenjang!');
  db.ref(jenjang).set("init").then(() => {
    alert('✅ Jenjang ditambahkan!');
    document.getElementById('jenjangInput').value = '';
    loadAllKategori();
  });
}

function tambahMapel() {
  const jenjang = document.getElementById('jenjangDropdown').value;
  const mapel = document.getElementById('mapelInput').value.trim();
  if (!mapel) return alert('Masukkan mapel!');
  db.ref(`${jenjang}/${mapel}`).set("init").then(() => {
    alert('✅ Mapel ditambahkan!');
    document.getElementById('mapelInput').value = '';
    loadAllKategori();
  });
}

function tambahKelas() {
  const jenjang = document.getElementById('jenjangDropdown2').value;
  const mapel = document.getElementById('mapelDropdown').value;
  const kelas = document.getElementById('kelasInput').value.trim();
  if (!kelas) return alert('Masukkan kelas!');
  db.ref(`${jenjang}/${mapel}/${kelas}`).set("init").then(() => {
    alert('✅ Kelas ditambahkan!');
    document.getElementById('kelasInput').value = '';
    loadAllKategori();
  });
}

// Populate mapelDropdown saat jenjangDropdown2 berubah
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('jenjangDropdown2').addEventListener('change', function () {
    const jenjang = this.value;
    db.ref(jenjang).once('value', (snapshot) => {
      const data = snapshot.val();
      const mapelDropdown = document.getElementById('mapelDropdown');
      mapelDropdown.innerHTML = '';
      for (const mapel in data) {
        const opt = document.createElement('option');
        opt.value = mapel;
        opt.textContent = mapel;
        mapelDropdown.appendChild(opt);
      }
    });
  });
});
