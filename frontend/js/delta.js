const nominalList = document.getElementById("nominalList");

if (nominalList) {
  const nominals = [
    { label: "60 DF Coin", price: 12000 },
    { label: "120 DF Coin", price: 23000 },
    { label: "300 DF Coin", price: 56000 },
    { label: "600 DF Coin", price: 110000 },
    { label: "1280 DF Coin", price: 229000 },
    { label: "2580 DF Coin", price: 449000 },
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
    if (!selected) { alert("Pilih paket dulu!"); return; }
    const params = new URLSearchParams({
      game: "Delta Force",
      userId: userId,
      package: selected.label,
      price: selected.price
    });
    window.location.href = "payment.html?" + params.toString();
  };
}