const nominalList = document.getElementById("nominalList");

if (nominalList) {
  const nominals = [
    { label: "200 Cash", price: 10000 },
    { label: "500 Cash", price: 24000 },
    { label: "1000 Cash", price: 47000 },
    { label: "2000 Cash", price: 93000 },
    { label: "5000 Cash", price: 230000 },
    { label: "10000 Cash", price: 455000 },
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
      game: "Point Blank",
      userId: userId,
      package: selected.label,
      price: selected.price
    });
    window.location.href = "payment.html?" + params.toString();
  };
}