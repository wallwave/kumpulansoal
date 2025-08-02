function getPath() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get("path") || "");
}

function cekLogin() {
  const login = localStorage.getItem("admin_login");
  if (login !== "true") {
    alert("Kamu belum login!");
    window.location.href = "login.html";
  }
}

function initKelolaSoal() {
  const path = getPath();
  if (!path) {
    alert("❌ Path tidak ditemukan di URL.");
    return;
  }

  const list = document.getElementById("daftarSoal");
  list.innerHTML = "📦 Memuat data...";

  db.ref(`${path}/soal`).once("value").then(snapshot => {
    const data = snapshot.val();
    if (!data) {
      list.innerHTML = "<p>📭 Belum ada soal di versi ini.</p>";
      return;
    }

    list.innerHTML = "";
    Object.entries(data).forEach(([nomor, soal]) => {
      const wrap = document.createElement("div");
      wrap.className = "soal-item";
      wrap.style.border = "1px solid #ccc";
      wrap.style.padding = "10px";
      wrap.style.marginBottom = "10px";
      wrap.style.background = "#fff";

      wrap.innerHTML = `
        <label><b>Soal ${nomor}</b></label>
        <p>${soal.question || "(kosong)"}</p>
        <ul>
          <li>A. ${soal.a}</li>
          <li>B. ${soal.b}</li>
          <li>C. ${soal.c}</li>
          <li>D. ${soal.d}</li>
        </ul>
        <p>✅ Kunci: <b>${soal.correct?.toUpperCase()}</b></p>
      `;

      list.appendChild(wrap);
    });
  }).catch(err => {
    list.innerHTML = "❌ Gagal load soal: " + err.message;
  });
}
