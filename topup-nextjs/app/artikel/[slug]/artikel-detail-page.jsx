import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "@/data/articles.json";
import games from "@/data/games.json";

export default async function ArtikelDetail({ params }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const relatedGame = article.game ? games.find(g => g.slug === article.game) : null;
  const relatedArticles = articles.filter(a => a.slug !== slug).slice(0, 3);

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

      <div style={{maxWidth:"720px",margin:"0 auto",padding:"40px 24px"}}>

        {/* BREADCRUMB */}
        <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"24px",fontSize:"12px",color:"#555570"}}>
          <Link href="/" style={{color:"#555570",textDecoration:"none"}}>Home</Link>
          <span>›</span>
          <Link href="/artikel" style={{color:"#555570",textDecoration:"none"}}>Artikel</Link>
          <span>›</span>
          <span style={{color:"#00e676"}}>{article.title}</span>
        </div>

        {/* ARTIKEL */}
        <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"32px",marginBottom:"24px"}}>
          <div style={{display:"flex",gap:"12px",alignItems:"center",marginBottom:"16px"}}>
            <span style={{fontSize:"10px",color:"#00e676",background:"rgba(0,230,118,0.1)",padding:"3px 10px",letterSpacing:"1px"}}>{article.category}</span>
            <span style={{fontSize:"11px",color:"#333355"}}>{article.date}</span>
          </div>
          <h1 style={{fontSize:"clamp(20px,4vw,28px)",fontWeight:"800",lineHeight:"1.3",marginBottom:"16px"}}>{article.title}</h1>
          <p style={{fontSize:"14px",color:"#888899",lineHeight:"1.7",borderLeft:"3px solid #00e676",paddingLeft:"16px",marginBottom:"24px",fontStyle:"italic"}}>{article.excerpt}</p>
          <div style={{fontSize:"14px",color:"#aaaacc",lineHeight:"1.8"}}>{article.content}</div>
        </div>

        {/* CTA TOPUP */}
        {relatedGame && (
          <div style={{background:"rgba(0,230,118,0.05)",border:"1px solid rgba(0,230,118,0.2)",padding:"20px",marginBottom:"24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
            <div>
              <p style={{fontSize:"13px",fontWeight:"700",marginBottom:"4px"}}>Mau top up {relatedGame.name}?</p>
              <p style={{fontSize:"12px",color:"#555570"}}>Harga terbaik, proses instan, aman & terpercaya</p>
            </div>
            <Link href={`/game/${relatedGame.slug}`} style={{padding:"10px 20px",background:"#00e676",color:"#000",fontWeight:"700",fontSize:"12px",letterSpacing:"2px",textDecoration:"none",textTransform:"uppercase",flexShrink:0}}>
              Top Up Sekarang →
            </Link>
          </div>
        )}

        {/* ARTIKEL TERKAIT */}
        <div>
          <p style={{fontSize:"11px",letterSpacing:"3px",color:"#555570",textTransform:"uppercase",marginBottom:"16px"}}>Artikel Terkait</p>
          <div style={{display:"grid",gap:"10px"}}>
            {relatedArticles.map(a => (
              <Link key={a.slug} href={`/artikel/${a.slug}`} style={{textDecoration:"none",color:"white"}}>
                <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#00e676"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#1a1a2e"}>
                  <div>
                    <span style={{fontSize:"10px",color:"#00e676",marginRight:"8px"}}>{a.category}</span>
                    <span style={{fontSize:"13px",fontWeight:"600"}}>{a.title}</span>
                  </div>
                  <span style={{color:"#555570",fontSize:"12px",flexShrink:0,marginLeft:"12px"}}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Link href="/artikel" style={{display:"block",textAlign:"center",padding:"14px",border:"1px solid #1a1a2e",color:"#555570",textDecoration:"none",fontSize:"13px",letterSpacing:"2px",marginTop:"16px"}}>
          ← Semua Artikel
        </Link>
      </div>

      <footer style={{borderTop:"1px solid #1a1a2e",padding:"24px",textAlign:"center",color:"#333355",fontSize:"12px",letterSpacing:"2px",marginTop:"40px"}}>
        © 2026 AYSIELTOPUP — ALL RIGHTS RESERVED
      </footer>
    </main>
  );
}