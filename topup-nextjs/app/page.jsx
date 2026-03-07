"use client";
import Link from "next/link";
import games from "@/data/games.json";

export default function Home() {
  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",color:"white",fontFamily:"sans-serif",backgroundImage:"linear-gradient(rgba(0, 230, 118, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 230, 118, 0.03) 1px, transparent 1px)",backgroundSize:"40px 40px"}}>
      {/* HEADER */}
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 40px",borderBottom:"1px solid #1a1a2e"}}>
        <div style={{fontSize:"22px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          TOPUP<span style={{color:"#00e676"}}>GAME</span>
        </div>
        <nav style={{display:"flex",gap:"24px"}}>
          <Link href="/" style={{color:"#00e676",fontSize:"13px",textDecoration:"none",letterSpacing:"1px"}}>Home</Link>
          <Link href="#" style={{color:"#555570",fontSize:"13px",textDecoration:"none",letterSpacing:"1px"}}>Cek Pesanan</Link>
        </nav>
      </header>

      {/* HERO */}
      <section style={{textAlign:"center",padding:"48px 20px 32px"}}>
        <p style={{color:"#00e676",fontSize:"11px",letterSpacing:"4px",textTransform:"uppercase",marginBottom:"12px"}}>Platform Top Up Terpercaya</p>
        <h1 style={{fontSize:"36px",fontWeight:"800",letterSpacing:"-1px",marginBottom:"12px"}}>
          Top Up Game <span style={{color:"#00e676"}}>Cepat & Aman</span>
        </h1>
        <p style={{color:"#555570",fontSize:"13px",maxWidth:"400px",margin:"0 auto"}}>
          Proses instan, harga terbaik, tersedia 24 jam untuk semua game favorit kamu.
        </p>
      </section>

      {/* GAME LIST */}
      <section style={{padding:"0 40px 60px"}}>
        <p style={{fontSize:"11px",color:"#333355",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"20px"}}>Pilih Game</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",gap:"16px"}}>
          {games.map((game) => (
            <Link key={game.id} href={`/game/${game.slug}`} style={{textDecoration:"none",color:"white"}}>
              <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"14px",cursor:"pointer",clipPath:"polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",transition:"border-color 0.2s"}}
                onMouseEnter={(e) => e.currentTarget.style.borderColor="#00e676"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor="#1a1a2e"}
              >
                <div style={{width:"100%",aspectRatio:"1",background:"#0a0a0f",marginBottom:"10px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <img src={game.image} alt={game.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                </div>
                <p style={{fontWeight:"700",fontSize:"13px",marginBottom:"4px",letterSpacing:"0.5px"}}>{game.name}</p>
                <span style={{color:"#00e676",fontSize:"11px",letterSpacing:"1px"}}>Top Up →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid #1a1a2e",padding:"24px",textAlign:"center",color:"#333355",fontSize:"11px",letterSpacing:"3px"}}>
        © 2026 TOPUPGAME — ALL RIGHTS RESERVED
      </footer>

    </main>
  );
}