const nominalList = document.getElementById("nominalList");

if (nominalList) {
  const nominals = [
    { label: "5 Diamonds", price: 884 },
    { label: "10 Diamonds", price: 1000 },
    { label: "12 Diamonds", price: 1200 },
    { label: "15 Diamonds", price: 2000 },
    { label: "20 Diamonds", price: 3000 },
    { label: "25 Diamonds", price: 4000 }
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

    if (!userId) {
      alert("Masukkan User ID dulu!");
      return;
    }
    if (!selected) {
      alert("Pilih paket diamond dulu!");
      return;
    }

    // Kirim data ke payment.html lewat URL params
    const params = new URLSearchParams({
      game: "Free Fire",
      userId: userId,
      package: selected.label,
      price: selected.price
    });

    window.location.href = "payment.html?" + params.toString();
  };
}