// ✅ Login check
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

// ✅ Load full Firebase structure
function loadStruktur() {
  db.ref().once('value', snapshot => {
    document.getElementById('output').textContent = JSON.stringify(snapshot.val(), null, 2);
  });
}

// ✅ Add structure
function tambahStruktur() {
  console.log("🚀 tambahStruktur called");
  const jenjang = document.getElementById('jenjang').value.trim();
  const mapel = document.getElementById('mapel').value.trim();
  const kelas = document.getElementById('kelas').value.trim();
  const semester = document.getElementById('semester').value.trim();
  const versi = document.getElementById('versi').value.trim();
  console.log({ jenjang, mapel, kelas, semester, versi });

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

// ✅ Load kategori list
function loadKategori() {
  const drop = document.getElementById('kategoriDeleteDropdown');
  drop.innerHTML = '';
  db.ref().once('value')
    .then(snapshot => {
      snapshot.forEach(child => {
        const opt = document.createElement('option');
        opt.text = child.key;
        opt.value = child.key;
        drop.appendChild(opt);
      });
    })
    .catch(err => alert("Error loadKategori: " + err.message));
}

// ✅ Add category
function tambahKategoriBaru() {
  const kategori = document.getElementById('kategoriBaru').value.trim();
  if (!kategori) return alert('Nama kategori kosong');
  db.ref(kategori).once('value')
    .then(snapshot => {
      if (snapshot.exists()) alert('Kategori sudah ada!'); else return db.ref(kategori).set("");
    })
    .then(x => {
      alert('✅ Kategori berhasil ditambahkan!');
      loadKategori();
    })
    .catch(err => alert("Error: " + err.message));
}

// ✅ Remove category
function hapusKategori() {
  const kategori = document.getElementById('kategoriDeleteDropdown').value;
  if (!confirm(`Yakin hapus kategori "${kategori}"?`)) return;
  db.ref(kategori).remove()
    .then(() => {
      alert('🗑️ Kategori dihapus');
      loadKategori();
      loadStruktur();
    })
    .catch(err => alert("Error hapusKategori: " + err.message));
}
