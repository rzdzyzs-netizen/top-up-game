import Link from "next/link";
import articles from "@/data/articles.json";

export default function ArticleSection({ gameSlug }) {
  const filtered = gameSlug
    ? articles.filter(a => a.game === gameSlug || a.game === null).slice(0, 3)
    : articles.slice(0, 3);

  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"0 24px 40px"}}>
      <div style={{borderTop:"1px solid #1a1a2e",paddingTop:"32px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <p style={{fontSize:"11px",letterSpacing:"3px",color:"#555570",textTransform:"uppercase"}}>Artikel & Tips</p>
          <Link href="/artikel" style={{fontSize:"11px",color:"#00e676",textDecoration:"none",letterSpacing:"1px"}}>Lihat Semua →</Link>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"12px"}}>
          {filtered.map(a => (
            <Link key={a.slug} href={`/artikel/${a.slug}`} style={{textDecoration:"none",color:"white"}}>
              <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"16px",transition:"all 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#00e676"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#1a1a2e"}>
                <span style={{fontSize:"10px",color:"#00e676",background:"rgba(0,230,118,0.1)",padding:"2px 8px",letterSpacing:"1px",display:"inline-block",marginBottom:"10px"}}>{a.category}</span>
                <p style={{fontSize:"13px",fontWeight:"700",lineHeight:"1.4",marginBottom:"8px"}}>{a.title}</p>
                <p style={{fontSize:"11px",color:"#555570",lineHeight:"1.5"}}>{a.excerpt.slice(0,80)}...</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}