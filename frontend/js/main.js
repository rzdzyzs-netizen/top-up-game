const gameList = document.getElementById("gameList");

if (gameList) {

  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "loading-card";
    gameList.appendChild(skeleton);
  }

  fetch("http://127.0.0.1:5000/api/games")
    .then(res => res.json())
    .then(data => {
      gameList.innerHTML = "";

      data.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card";

        card.innerHTML = `
          <div class="game-card-img">
            <img src="images/${game.image}" alt="${game.name}">
          </div>
          <div class="game-card-info">
            <h3>${game.name}</h3>
            <span class="game-card-tag">Top Up →</span>
          </div>
        `;

        card.onclick = () => {
          const name = game.name.toLowerCase();
          if (name.includes("genshin")) {
            window.location.href = "genshin.html";
          } else if (name.includes("roblox")) {
            window.location.href = "roblox.html";
          } else if (name.includes("point blank")) {
            window.location.href = "pb.html";
          } else if (name.includes("delta force")) {
            window.location.href = "deltaforce.html";
          } else if (name.includes("free fire")) {
            window.location.href = "ff.html"
          } else if (name.includes("mobile legend")) {
            window.location.href = "ml.html" 
          } else if (name.includes("pubg mobile")) {
            window.location.href = "pubg.html" 

            alert("Halaman game ini belum tersedia!");
          }
        };

        gameList.appendChild(card);
      });
    })
    .catch(err => {
      gameList.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; color: #555570; padding: 60px 20px;">
          <p style="font-size: 14px; letter-spacing: 1px;">⚠ Gagal memuat data — pastikan backend Python sudah berjalan</p>
        </div>
      `;
      console.error("Gagal ambil data game:", err);
    });
}