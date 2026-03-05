// =============================
// PAYMENT.JS
// =============================

const params     = new URLSearchParams(window.location.search);
const game       = params.get("game") || "-";
const userId     = params.get("userId") || "-";
const pkg        = params.get("package") || "-";
const price      = parseInt(params.get("price") || "0");

// Tampilkan detail order
document.getElementById("summaryGame").textContent    = game;
document.getElementById("summaryUserId").textContent  = userId;
document.getElementById("summaryPackage").textContent = pkg;
document.getElementById("summaryPrice").textContent   = "Rp " + price.toLocaleString("id-ID");

// Isi nominal di instruksi bank
document.getElementById("bankAmount").textContent     = "Rp " + price.toLocaleString("id-ID");
document.getElementById("copyAmountBtn").onclick      = () => copyText(price.toString());

// =============================
// TIMER COUNTDOWN
// =============================
let totalSeconds = 15 * 60 - 1;
const countdownEl = document.getElementById("countdown");

const timer = setInterval(() => {
  const menit = Math.floor(totalSeconds / 60);
  const detik = totalSeconds % 60;
  countdownEl.textContent =
    String(menit).padStart(2, "0") + ":" + String(detik).padStart(2, "0");

  if (totalSeconds < 60) countdownEl.classList.add("warning");

  if (totalSeconds <= 0) {
    clearInterval(timer);
    alert("Waktu pembayaran habis! Silakan order ulang.");
    window.location.href = "index.html";
  }
  totalSeconds--;
}, 1000);

// =============================
// PILIH METODE
// =============================
let selectedMethod = null;

function selectMethod(el) {
  document.querySelectorAll(".method-option").forEach(opt => opt.classList.remove("active"));
  el.classList.add("active");
  selectedMethod = el.getAttribute("data-method");
}

// =============================
// TAMPILKAN INSTRUKSI BAYAR
// =============================
const instrSteps = {
  QRIS: [
    "Buka aplikasi e-wallet kamu (GoPay, OVO, DANA, dll)",
    "Pilih menu 'Scan QR' atau 'Bayar'",
    "Scan QR Code yang tampil di layar",
    "Pastikan nominal sesuai lalu konfirmasi pembayaran",
    "Klik tombol 'Saya Sudah Bayar' setelah selesai"
  ],
  GoPay: [
    "Buka aplikasi Gojek",
    "Pilih menu 'GoPay' lalu 'Transfer'",
    "Masukkan nomor: 0881025943146",
    "Masukkan nominal: Rp " + price.toLocaleString("id-ID"),
    "Konfirmasi pembayaran",
    "Klik tombol 'Saya Sudah Bayar' setelah selesai"
  ],
  OVO: [
    "Buka aplikasi OVO",
    "Pilih menu 'Transfer'",
    "Masukkan nomor: 0881025943146",
    "Masukkan nominal: Rp " + price.toLocaleString("id-ID"),
    "Konfirmasi pembayaran",
    "Klik tombol 'Saya Sudah Bayar' setelah selesai"
  ],
  DANA: [
    "Buka aplikasi DANA",
    "Pilih menu 'Kirim'",
    "Masukkan nomor: 0881025943146",
    "Masukkan nominal: Rp " + price.toLocaleString("id-ID"),
    "Konfirmasi pembayaran",
    "Klik tombol 'Saya Sudah Bayar' setelah selesai"
  ],
  BCA: [
    "Buka aplikasi BCA Mobile atau m-BCA",
    "Pilih 'Transfer' lalu 'Virtual Account'",
    "Masukkan nomor VA: 1442331526",
    "Nominal otomatis terisi: Rp " + price.toLocaleString("id-ID"),
    "Konfirmasi dan selesaikan pembayaran",
    "Klik tombol 'Saya Sudah Bayar' setelah selesai"
  ],
  BRI: [
    "Buka aplikasi BRImo",
    "Pilih 'Pembayaran' lalu 'BRIVA'",
    "Masukkan nomor VA: 1442331526",
    "Nominal otomatis terisi: Rp " + price.toLocaleString("id-ID"),
    "Konfirmasi dan selesaikan pembayaran",
    "Klik tombol 'Saya Sudah Bayar' setelah selesai"
  ],
  Mandiri: [
    "Buka aplikasi Livin by Mandiri",
    "Pilih 'Transfer' lalu 'Virtual Account'",
    "Masukkan nomor VA: 1442331526",
    "Nominal otomatis terisi: Rp " + price.toLocaleString("id-ID"),
    "Konfirmasi dan selesaikan pembayaran",
    "Klik tombol 'Saya Sudah Bayar' setelah selesai"
  ]
};

function showInstructions() {
  if (!selectedMethod) {
    alert("Pilih metode pembayaran dulu!");
    return;
  }

  // Sembunyiin step 1, tampilkan step 2
  document.getElementById("stepMethod").style.display = "none";
  document.getElementById("stepInstructions").style.display = "block";

  // Judul metode
  document.getElementById("instructionMethod").textContent = selectedMethod;

  // Sembunyiin semua konten instruksi dulu
  document.getElementById("instrQRIS").style.display    = "none";
  document.getElementById("instrEwallet").style.display = "none";
  document.getElementById("instrBank").style.display    = "none";

  // Tampilkan yang sesuai
  if (selectedMethod === "QRIS") {
    document.getElementById("instrQRIS").style.display = "block";
  } else if (["GoPay", "OVO", "DANA"].includes(selectedMethod)) {
    document.getElementById("instrEwallet").style.display = "block";
    document.getElementById("ewalletName").textContent = selectedMethod;
  } else {
    document.getElementById("instrBank").style.display = "block";
    document.getElementById("bankName").textContent = selectedMethod + " Virtual Account";
  }

  // Isi langkah-langkah
  const stepsList = document.getElementById("instrStepsList");
  stepsList.innerHTML = "";
  instrSteps[selectedMethod].forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });
}

// Balik ke pilih metode
function backToMethod() {
  document.getElementById("stepMethod").style.display = "block";
  document.getElementById("stepInstructions").style.display = "none";
}

// =============================
// SALIN TEKS
// =============================
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Tersalin: " + text);
  });
}

// =============================
// KONFIRMASI SUDAH BAYAR
// =============================
function confirmPayment() {
  const btn = document.getElementById("confirmBtn");
  btn.disabled = true;
  btn.textContent = "Memverifikasi...";

  setTimeout(() => {
    clearInterval(timer);

    const orderId = "TG-" + Date.now().toString().slice(-8).toUpperCase();

    fetch("http://127.0.0.1:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        game: game,
        user_id: userId,
        package: pkg,
        price: price,
        method: selectedMethod,
        status: "success"
      })
    })
    .then(res => res.json())
    .then(() => showSuccess(orderId))
    .catch(() => showSuccess(orderId));

  }, 2000);
}

function showSuccess(orderId) {
  document.getElementById("modalDetail").textContent =
    `${pkg} untuk ${game} berhasil dikirim ke User ID ${userId} via ${selectedMethod}`;
  document.getElementById("modalOrderId").textContent = "Order ID: " + orderId;
  document.getElementById("successModal").classList.add("show");
}