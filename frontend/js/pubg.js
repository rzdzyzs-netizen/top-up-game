const nominalList = document.getElementById("nominalList");

if (nominalList) {
  const nominals = [
    { label: "60 UC", price: 14000 },
    { label: "120 UC", price: 27000 },
    { label: "325 UC", price: 69000 },
    { label: "660 UC", price: 139000 },
    { label: "1800 UC", price: 379000 },
    { label: "3850 UC", price: 759000 },
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
    if (!userId) { alert("Masukkan User ID dulu!"); return; }
    if (!selected) { alert("Pilih paket UC dulu!"); return; }
    const params = new URLSearchParams({
      game: "PUBG Mobile",
      userId: userId,
      package: selected.label,
      price: selected.price
    });
    window.location.href = "payment.html?" + params.toString();
  };
}