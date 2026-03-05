const nominalList = document.getElementById("nominalList");

if (nominalList) {
  const nominals = [
    { label: "Weekly Diamond Pass", price: 17000 },
    { label: "Twilight Pass", price: 85000 },
    { label: "86 Diamonds", price: 26000 },
    { label: "172 Diamonds", price: 51000 },
    { label: "257 Diamonds", price: 76000 },
    { label: "344 Diamonds", price: 100000 }
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
      game: "Mobile Legends",
      userId: userId,
      package: selected.label,
      price: selected.price
    });

    window.location.href = "payment.html?" + params.toString();
  };
}