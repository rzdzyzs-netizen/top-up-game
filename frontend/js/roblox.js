const nominalList = document.getElementById("nominalList");

if (nominalList) {
  const nominals = [
    { label: "80 Robux", price: 14000 },
    { label: "160 Robux", price: 27000 },
    { label: "240 Robux", price: 40000 },
    { label: "320 Robux", price: 54000 },
    { label: "800 Robux", price: 130000 },
    { label: "1700 Robux", price: 270000 },
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
    if (!userId) { alert("Masukkan Username dulu!"); return; }
    if (!selected) { alert("Pilih paket dulu!"); return; }
    const params = new URLSearchParams({
      game: "Roblox",
      userId: userId,
      package: selected.label,
      price: selected.price
    });
    window.location.href = "payment.html?" + params.toString();
  };
}