import Link from "next/link";
import articles from "@/data/articles.json";

export default function ArtikelPage() {
  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",color:"white",fontFamily:"sans-serif"}}>

      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid #1a1a2e",position:"sticky",top:0,background:"rgba(10,10,15,0.95)",backdropFilter:"blur(10px)",zIndex:100}}>
        <div style={{fontSize:"22px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          AYSIEL<span style={{color:"#00e676"}}>TOPUP</span>
        </div>
        <nav style={{display:"flex",gap:"20px"}}>
          <Link href="/" style={{color:"#555570",fontSize:"13px",textDecoration:"none"}}>Home</Link>
          <Link href="/cek-pesanan" style={{color:"#555570",fontSize:"13px",textDecoration:"none"}}>Cek Pesanan</Link>
          <Link href="/artikel" style={{color:"#00e676",fontSize:"13px",textDecoration:"none"}}>Artikel</Link>
        </nav>
      </header>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"40px 24px"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <p style={{fontSize:"11px",letterSpacing:"4px",color:"#00e676",textTransform:"uppercase",marginBottom:"12px"}}>Blog & Tips</p>
          <h1 style={{fontSize:"32px",fontWeight:"800",marginBottom:"8px"}}>Artikel & Tutorial</h1>
          <p style={{color:"#555570",fontSize:"13px"}}>Tips, tutorial, dan panduan top up game terlengkap</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}>
          {articles.map((a) => (
            <Link key={a.slug} href={`/artikel/${a.slug}`} style={{textDecoration:"none",color:"white"}}>
              <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"20px",height:"100%",boxSizing:"border-box",transition:"all 0.2s",cursor:"pointer"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#00e676";e.currentTarget.style.transform="translateY(-3px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#1a1a2e";e.currentTarget.style.transform="translateY(0)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                  <span style={{fontSize:"10px",color:"#00e676",background:"rgba(0,230,118,0.1)",padding:"3px 10px",letterSpacing:"1px"}}>{a.category}</span>
                  <span style={{fontSize:"11px",color:"#333355"}}>{a.date}</span>
                </div>
                <h2 style={{fontSize:"15px",fontWeight:"700",lineHeight:"1.4",marginBottom:"10px"}}>{a.title}</h2>
                <p style={{fontSize:"12px",color:"#555570",lineHeight:"1.6",marginBottom:"16px"}}>{a.excerpt}</p>
                <span style={{fontSize:"11px",color:"#00e676",letterSpacing:"1px"}}>Baca Selengkapnya →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer style={{borderTop:"1px solid #1a1a2e",padding:"24px",textAlign:"center",color:"#333355",fontSize:"12px",letterSpacing:"2px",marginTop:"40px"}}>
        © 2026 AYSIELTOPUP — ALL RIGHTS RESERVED
      </footer>
    </main>
  );
}