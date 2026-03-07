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
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
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
    <main className="min-h-screen bg-[#0a0a0f] text-white">

      {/* HEADER */}
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 40px",borderBottom:"1px solid #1a1a2e"}}>
        <div style={{fontSize:"22px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          TOPUP<span style={{color:"#00e676"}}>GAME</span>
        </div>
        <nav style={{display:"flex",gap:"24px"}}>
          <Link href="/" style={{color:"#555570",fontSize:"13px",textDecoration:"none",letterSpacing:"1px"}}>Home</Link>
          <Link href="#" style={{color:"#555570",fontSize:"13px",textDecoration:"none",letterSpacing:"1px"}}>Cek Pesanan</Link>
        </nav>
      </header>

      {/* ORDER WRAPPER */}
      <div style={{display:"flex",gap:"32px",padding:"40px",maxWidth:"1100px",margin:"0 auto"}}>

        {/* KIRI */}
        <div style={{width:"280px",flexShrink:0}}>
          <div style={{background:"#111120",border:"1px solid #1a1a2e",clipPath:"polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",padding:"24px"}}>
            <div style={{width:"100%",aspectRatio:"1",background:"#0a0a0f",marginBottom:"16px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <img src={game.image} alt={game.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
            </div>
            <h2 style={{fontSize:"20px",fontWeight:"700",letterSpacing:"2px",marginBottom:"4px"}}>{game.name}</h2>
            <p style={{color:"#555570",fontSize:"13px",marginBottom:"16px"}}>{game.publisher}</p>
            <ul style={{listStyle:"none",padding:0,display:"flex",flexDirection:"column",gap:"8px"}}>
              <li style={{fontSize:"13px",color:"#888899"}}>⚡ Proses Instan</li>
              <li style={{fontSize:"13px",color:"#888899"}}>🕒 Buka 24 Jam</li>
              <li style={{fontSize:"13px",color:"#888899"}}>✅ Aman & Terpercaya</li>
              <li style={{fontSize:"13px",color:"#888899"}}>💎 {game.currency} Langsung Masuk</li>
            </ul>
          </div>
        </div>

        {/* KANAN */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:"20px"}}>

          {/* User ID */}
          <div style={{background:"#111120",border:"1px solid #1a1a2e",clipPath:"polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",padding:"24px"}}>
            <h3 style={{fontSize:"12px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"16px",display:"flex",alignItems:"center",gap:"10px"}}>
              <span style={{color:"#00e676",fontWeight:"700",fontSize:"16px"}}>1</span> Masukkan User ID
            </h3>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={`Masukkan User ID ${game.name} kamu`}
              style={{width:"100%",background:"#0a0a0f",border:"1px solid #1a1a2e",color:"white",padding:"12px 16px",fontSize:"14px",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              onFocus={(e) => e.target.style.borderColor="#00e676"}
              onBlur={(e) => e.target.style.borderColor="#1a1a2e"}
            />
          </div>

          {/* Nominal */}
          <div style={{background:"#111120",border:"1px solid #1a1a2e",clipPath:"polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",padding:"24px"}}>
            <h3 style={{fontSize:"12px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"16px",display:"flex",alignItems:"center",gap:"10px"}}>
              <span style={{color:"#00e676",fontWeight:"700",fontSize:"16px"}}>2</span> Pilih Paket {game.currency}
            </h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"12px"}}>
              {game.nominals.map((n, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(n)}
                  style={{
                    padding:"14px",
                    border: selected?.label === n.label ? "1px solid #00e676" : "1px solid #1a1a2e",
                    background: selected?.label === n.label ? "rgba(0,230,118,0.07)" : "#0a0a0f",
                    cursor:"pointer",
                    clipPath:"polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
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
            style={{width:"100%",padding:"16px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer",clipPath:"polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",transition:"background 0.2s"}}
            onMouseEnter={(e) => e.target.style.background="#00ff88"}
            onMouseLeave={(e) => e.target.style.background="#00e676"}
          >
            Beli Sekarang
          </button>

        </div>
      </div>
    </main>
  );
}