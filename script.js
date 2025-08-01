// ✅ Cek Login
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

// ✅ Load Struktur Soal dari Firebase
function loadStruktur() {
  db.ref().once('value', (snapshot) => {
    const data = snapshot.val();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
  });
}

// ✅ Tambah Struktur Soal
function tambahStruktur() {
  const jenjang = document.getElementById('jenjang').value.trim();
  const mapel = document.getElementById('mapel').value.trim();
  const kelas = document.getElementById('kelas').value.trim();
  const semester = document.getElementById('semester').value.trim();
  const versi = document.getElementById('versi').value.trim();

  if (!jenjang || !mapel || !kelas || !semester || !versi) {
    alert("Lengkapi semua field dulu!");
    return;
  }

  const path = `${jenjang}/${mapel}/${kelas}/${semester}/${versi}`;
  db.ref(path).set({}).then(() => {
    alert("✅ Struktur berhasil ditambahkan!");
    loadStruktur();
  });
}

// ✅ Tambah Kategori Baru
function loadKategori() {
  const dropdowns = [
    document.getElementById('kategoriDeleteDropdown')
  ];

  dropdowns.forEach(drop => {
    if (drop) drop.innerHTML = '';
  });

  db.ref().once('value')
    .then(snapshot => {
      snapshot.forEach(childSnapshot => {
        const kategori = childSnapshot.key;
        dropdowns.forEach(drop => {
          const option = document.createElement('option');
          option.text = kategori;
          option.value = kategori;
          drop.appendChild(option);
        });
      });
    })
    .catch(error => {
      alert("Gagal load kategori: " + error.message);
    });
}

function tambahKategoriBaru() {
  const kategori = document.getElementById('kategoriBaru').value.trim();
  if (kategori === '') {
    alert('Kategori tidak boleh kosong!');
    return;
  }

  db.ref(kategori).once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        alert('Kategori sudah ada!');
        return;
      }
      return db.ref(kategori).set("");
    })
    .then(() => {
      alert('✅ Kategori berhasil ditambahkan!');
      document.getElementById('kategoriBaru').value = '';
      loadKategori();
    })
    .catch(err => {
      alert("Terjadi error saat menambahkan kategori: " + err.message);
      console.error(err);
    });
}

// ✅ Hapus Kategori
function hapusKategori() {
  const kategori = document.getElementById('kategoriDeleteDropdown').value;
  const yakin = confirm(`Yakin ingin menghapus kategori "${kategori}"? Semua data akan hilang!`);

  if (yakin) {
    db.ref(kategori).remove()
      .then(() => {
        alert('🗑️ Kategori berhasil dihapus!');
        loadKategori();
        loadStruktur();
      })
      .catch(error => {
        alert('Gagal menghapus kategori: ' + error.message);
      });
  }
}
