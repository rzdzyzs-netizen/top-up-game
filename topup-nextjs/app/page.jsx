import Link from "next/link";
import games from "@/data/games.json";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",color:"white",fontFamily:"sans-serif"}}>

      {/* HEADER */}
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid #1a1a2e",position:"sticky",top:0,background:"rgba(10,10,15,0.95)",backdropFilter:"blur(10px)",zIndex:100}}>
        <div style={{fontSize:"22px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          AYSIEL<span style={{color:"#00e676"}}>TOPUP</span>
        </div>
        <nav style={{display:"flex",gap:"20px",alignItems:"center"}}>
          <Link href="/" style={{color:"#555570",fontSize:"13px",textDecoration:"none",letterSpacing:"1px"}}>Home</Link>
          <Link href="/cek-pesanan" style={{color:"#555570",fontSize:"13px",textDecoration:"none",letterSpacing:"1px"}}>Cek Pesanan</Link>
        </nav>
      </header>

      {/* HERO */}
      <div style={{textAlign:"center",padding:"60px 24px 40px",borderBottom:"1px solid #1a1a2e"}}>
        <p style={{fontSize:"11px",letterSpacing:"4px",color:"#00e676",textTransform:"uppercase",marginBottom:"16px"}}>Platform Top Up Terpercaya</p>
        <h1 style={{fontSize:"clamp(28px,5vw,52px)",fontWeight:"800",lineHeight:"1.1",marginBottom:"16px"}}>
          Top Up Game<br/><span style={{color:"#00e676"}}>Cepat & Aman</span>
        </h1>
        <p style={{color:"#555570",fontSize:"14px",marginBottom:"32px",maxWidth:"400px",margin:"0 auto 32px"}}>
          Proses instan, harga terbaik, tersedia 24 jam untuk semua game favoritmu.
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:"24px",flexWrap:"wrap",marginBottom:"40px"}}>
          {[["⚡","Proses Instan"],["🔒","100% Aman"],["🕒","24/7 Online"],["💎","Harga Terbaik"]].map(([icon,label])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"13px",color:"#888899"}}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <SearchBar />
      </div>

      {/* GAME LIST */}
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"40px 24px"}}>
        <p style={{fontSize:"11px",letterSpacing:"4px",color:"#555570",textTransform:"uppercase",marginBottom:"24px",textAlign:"center"}}>Pilih Game</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"16px"}}>
          {games.map((game) => (
            <Link key={game.slug} href={`/game/${game.slug}`} style={{textDecoration:"none",color:"white"}}>
              <div style={{background:"#111120",border:"1px solid #1a1a2e",clipPath:"polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)",overflow:"hidden",transition:"all 0.2s",cursor:"pointer"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#00e676";e.currentTarget.style.transform="translateY(-4px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#1a1a2e";e.currentTarget.style.transform="translateY(0)"}}>
                <div style={{width:"100%",aspectRatio:"1",background:"#0a0a0f",overflow:"hidden"}}>
                  <img src={game.image} alt={game.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                </div>
                <div style={{padding:"12px"}}>
                  <h3 style={{fontSize:"13px",fontWeight:"700",marginBottom:"2px",lineHeight:"1.3"}}>{game.name}</h3>
                  <p style={{color:"#555570",fontSize:"11px",marginBottom:"8px"}}>{game.publisher}</p>
                  <span style={{fontSize:"10px",color:"#00e676",letterSpacing:"1px"}}>Top Up →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid #1a1a2e",padding:"24px",textAlign:"center",color:"#333355",fontSize:"12px",letterSpacing:"2px"}}>
        © 2026 AYSIELTOPUP — ALL RIGHTS RESERVED
      </footer>
    </main>
  );
}