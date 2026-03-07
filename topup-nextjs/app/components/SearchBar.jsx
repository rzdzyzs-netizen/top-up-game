"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import games from "@/data/games.json";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const router = useRouter();

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim() === "") { setResults([]); return; }
    const filtered = games.filter(g =>
      g.name.toLowerCase().includes(val.toLowerCase()) ||
      g.publisher.toLowerCase().includes(val.toLowerCase())
    );
    setResults(filtered);
  };

  const handleSelect = (slug) => {
    setQuery("");
    setResults([]);
    router.push(`/game/${slug}`);
  };

  return (
    <div style={{position:"relative",maxWidth:"480px",margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",background:"#111120",border:"1px solid #1a1a2e",padding:"0 16px"}}>
        <span style={{color:"#555570",marginRight:"10px",fontSize:"16px"}}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Cari game... (Mobile Legends, Free Fire, dll)"
          style={{flex:1,background:"transparent",border:"none",color:"white",padding:"14px 0",fontSize:"14px",outline:"none",fontFamily:"sans-serif"}}
        />
        {query && (
          <button onClick={()=>{setQuery("");setResults([]);}} style={{background:"transparent",border:"none",color:"#555570",cursor:"pointer",fontSize:"16px",padding:"0"}}>✕</button>
        )}
      </div>

      {results.length > 0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#111120",border:"1px solid #1a1a2e",borderTop:"none",zIndex:200,maxHeight:"280px",overflowY:"auto"}}>
          {results.map(g => (
            <div key={g.slug} onClick={()=>handleSelect(g.slug)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",cursor:"pointer",borderBottom:"1px solid #0d0d1a",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="#0d0d1a"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <img src={g.image} alt={g.name} style={{width:"36px",height:"36px",objectFit:"cover",flexShrink:0}} />
              <div style={{textAlign:"left"}}>
                <p style={{fontSize:"13px",fontWeight:"600",color:"white",marginBottom:"2px"}}>{g.name}</p>
                <p style={{fontSize:"11px",color:"#555570"}}>{g.publisher}</p>
              </div>
              <span style={{marginLeft:"auto",fontSize:"11px",color:"#00e676"}}>Top Up →</span>
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#111120",border:"1px solid #1a1a2e",borderTop:"none",padding:"16px",textAlign:"center",color:"#555570",fontSize:"13px",zIndex:200}}>
          Game tidak ditemukan 😔
        </div>
      )}
    </div>
  );
}