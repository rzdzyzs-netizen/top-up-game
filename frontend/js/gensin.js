const nominalList = document.getElementById("nominalList");

if (nominalList) {
  const nominals = [
    { label: "60 Genesis Crystal", price: 14000 },
    { label: "300 Genesis Crystal", price: 69000 },
    { label: "980 Genesis Crystal", price: 139000 },
    { label: "1980 Genesis Crystal", price: 279000 },
    { label: "3280 Genesis Crystal", price: 459000 },
    { label: "6480 Genesis Crystal", price: 879000 },
  ];

  let selected = null;

  nominals.forEach(n => {
    const div = document.createElement("div");
    div.className = "nominal";
    div.innerHTML = `
      <strong>${n.label}</strong><br>
      <span>Rp ${n.price.toLocaleString("id-ID")}</span>
    `;
    div.onclick = () => {
      document.querySelectorAll(".nominal").forEach(el => el.classList.remove("active"));
      div.classList.add("active");
      selected = n;
    };
    nominalList.appendChild(div);
  });

  document.getElementById("orderBtn").onclick = () => {
    const userId = document.getElementById("userId").value.trim();
    if (!userId) { alert("Masukkan UID dulu!"); return; }
    if (!selected) { alert("Pilih paket dulu!"); return; }
    const params = new URLSearchParams({
      game: "Genshin Impact",
      userId: userId,
      package: selected.label,
      price: selected.price
    });
    window.location.href = "payment.html?" + params.toString();
  };
}