"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import games from "@/data/games.json";

export default function GamePage({ params }) {
  const { slug } = use(params);
  const game = games.find((g) => g.slug === slug);
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [selected, setSelected] = useState(null);

  if (!game) {
    return (
      <div style={{minHeight:"100vh",background:"#0a0a0f",color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <p>Game tidak ditemukan</p>
      </div>
    );
  }

  const handleOrder = () => {
    if (!userId) { alert("Masukkan User ID dulu!"); return; }
    if (!selected) { alert("Pilih paket dulu!"); return; }
    const query = new URLSearchParams({
      game: game.name,
      userId,
      package: selected.label,
      price: selected.price,
    });
    router.push(`/payment?${query.toString()}`);
  };

  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",color:"white",fontFamily:"sans-serif"}}>

      {/* HEADER */}
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid #1a1a2e"}}>
        <div style={{fontSize:"20px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          TOPUP<span style={{color:"#00e676"}}>GAME</span>
        </div>
        <nav style={{display:"flex",gap:"16px"}}>
          <Link href="/" style={{color:"#555570",fontSize:"12px",textDecoration:"none"}}>Home</Link>
        </nav>
      </header>

      {/* CONTENT */}
      <div style={{padding:"20px",maxWidth:"1100px",margin:"0 auto"}}>

        {/* GAME INFO - mobile: stack vertical */}
        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

          {/* Game Card */}
          <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"16px",display:"flex",gap:"16px",alignItems:"center"}}>
            <div style={{width:"80px",height:"80px",flexShrink:0,background:"#0a0a0f",overflow:"hidden"}}>
              <img src={game.image} alt={game.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
            </div>
            <div>
              <h2 style={{fontSize:"18px",fontWeight:"700",marginBottom:"4px"}}>{game.name}</h2>
              <p style={{color:"#555570",fontSize:"12px",marginBottom:"8px"}}>{game.publisher}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
                {["⚡ Proses Instan","🕒 24 Jam","✅ Aman"].map(t=>(
                  <span key={t} style={{fontSize:"11px",color:"#888899",background:"#0a0a0f",padding:"3px 8px",border:"1px solid #1a1a2e"}}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* User ID */}
          <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"16px"}}>
            <h3 style={{fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"12px",color:"white"}}>
              <span style={{color:"#00e676",marginRight:"8px"}}>1</span> Masukkan User ID
            </h3>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={`User ID ${game.name}`}
              style={{width:"100%",background:"#0a0a0f",border:"1px solid #1a1a2e",color:"white",padding:"12px 14px",fontSize:"14px",outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"}}
            />
          </div>

          {/* Nominal */}
          <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"16px"}}>
            <h3 style={{fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"12px",color:"white"}}>
              <span style={{color:"#00e676",marginRight:"8px"}}>2</span> Pilih Paket {game.currency}
            </h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"10px"}}>
              {game.nominals.map((n, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(n)}
                  style={{
                    padding:"12px",
                    border: selected?.label === n.label ? "1px solid #00e676" : "1px solid #1a1a2e",
                    background: selected?.label === n.label ? "rgba(0,230,118,0.07)" : "#0a0a0f",
                    cursor:"pointer",
                    transition:"all 0.2s"
                  }}
                >
                  <p style={{fontWeight:"700",fontSize:"13px",marginBottom:"4px"}}>{n.label}</p>
                  <p style={{color:"#00e676",fontSize:"12px"}}>Rp {n.price.toLocaleString("id-ID")}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tombol */}
          <button
            onClick={handleOrder}
            style={{width:"100%",padding:"16px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer"}}
          >
            Beli Sekarang
          </button>

        </div>
      </div>
    </main>
  );
}