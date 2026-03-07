"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import games from "@/data/games.json";
import { supabase } from "@/lib/supabase";

export default function GamePage({ params }) {
  const { slug } = use(params);
  const game = games.find((g) => g.slug === slug);
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState(1); // 1=order, 2=instruksi bayar
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!game) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p>Game tidak ditemukan</p>
    </div>
  );

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Tersalin: " + text);
  };

  const handleBayar = async () => {
    if (!userId) { alert("Masukkan User ID dulu!"); return; }
    if (!selected) { alert("Pilih paket dulu!"); return; }
    if (!selectedMethod) { alert("Pilih metode pembayaran dulu!"); return; }
    setConfirming(true);

    const id = "TG-" + Date.now().toString().slice(-8).toUpperCase();

    try {
      const res = await fetch("/api/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, amount: selected.price, game: game.name, userId, packageName: selected.label }),
      });
      const data = await res.json();

      if (data.token) {
        await supabase.from("order").insert([{
          order_id: id, game: game.name, user_id: userId, package: selected.label,
          price: selected.price, method: selectedMethod, status: "pending"
        }]);

        window.snap.pay(data.token, {
          onSuccess: async () => {
            await supabase.from("order").update({ status: "success" }).eq("order_id", id);
            setOrderId(id); setSuccess(true);
          },
          onPending: () => { setOrderId(id); setStep(2); },
          onError: () => { alert("Pembayaran gagal!"); },
          onClose: () => { setOrderId(id); setStep(2); }
        });
      }
    } catch (err) { alert("Terjadi kesalahan!"); }
    setConfirming(false);
  };

  const handleSudahBayar = async () => {
    await supabase.from("order").update({ status: "success" }).eq("order_id", orderId);
    setSuccess(true);
  };

  const instruksi = {
    QRIS: { number: null, type: "qris" },
    GoPay: { number: "0881025943146", type: "ewallet" },
    OVO: { number: "0881025943146", type: "ewallet" },
    DANA: { number: "0881025943146", type: "ewallet" },
    BCA: { number: "1442331526", type: "bank" },
    BRI: { number: "1442331526", type: "bank" },
    Mandiri: { number: "1442331526", type: "bank" },
  };

  const methods = [
    { id:"QRIS", label:"QRIS", sub:"Semua E-Wallet", icon:"⬛" },
    { id:"GoPay", label:"GoPay", sub:"Transfer ke nomor", icon:"💚" },
    { id:"OVO", label:"OVO", sub:"Transfer ke nomor", icon:"💜" },
    { id:"DANA", label:"DANA", sub:"Transfer ke nomor", icon:"💙" },
    { id:"BCA", label:"BCA", sub:"Virtual Account", icon:"🏦" },
    { id:"BRI", label:"BRI", sub:"Virtual Account", icon:"🏦" },
    { id:"Mandiri", label:"Mandiri", sub:"Virtual Account", icon:"🏦" },
  ];

  const box = { background:"#111120", border:"1px solid #1a1a2e", padding:"16px", marginBottom:"12px" };

  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",color:"white",fontFamily:"sans-serif"}}>

      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid #1a1a2e"}}>
        <div style={{fontSize:"20px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          TOPUP<span style={{color:"#00e676"}}>GAME</span>
        </div>
        <Link href="/" style={{color:"#555570",fontSize:"12px",textDecoration:"none"}}>← Home</Link>
      </header>

      <div style={{maxWidth:"600px",margin:"0 auto",padding:"20px"}}>

        {step === 1 && (
          <>
            {/* GAME INFO */}
            <div style={{...box, display:"flex", gap:"14px", alignItems:"center"}}>
              <div style={{width:"70px",height:"70px",flexShrink:0,background:"#0a0a0f",overflow:"hidden"}}>
                <img src={game.image} alt={game.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
              </div>
              <div>
                <h2 style={{fontSize:"17px",fontWeight:"700",marginBottom:"3px"}}>{game.name}</h2>
                <p style={{color:"#555570",fontSize:"12px",marginBottom:"6px"}}>{game.publisher}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {["⚡ Instan","🕒 24 Jam","✅ Aman"].map(t=>(
                    <span key={t} style={{fontSize:"10px",color:"#888899",background:"#0a0a0f",padding:"2px 8px",border:"1px solid #1a1a2e"}}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* USER ID */}
            <div style={box}>
              <p style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>
                <span style={{color:"#00e676",marginRight:"8px"}}>1</span>Masukkan User ID
              </p>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={`User ID ${game.name}`}
                style={{width:"100%",background:"#0a0a0f",border:"1px solid #1a1a2e",color:"white",padding:"12px 14px",fontSize:"14px",outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"}}
              />
            </div>

            {/* PILIH PAKET */}
            <div style={box}>
              <p style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>
                <span style={{color:"#00e676",marginRight:"8px"}}>2</span>Pilih Paket {game.currency}
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px"}}>
                {game.nominals.map((n,i) => (
                  <div key={i} onClick={() => setSelected(n)} style={{padding:"12px",border: selected?.label===n.label ? "1px solid #00e676" : "1px solid #1a1a2e",background: selected?.label===n.label ? "rgba(0,230,118,0.07)" : "#0a0a0f",cursor:"pointer",transition:"all 0.2s"}}>
                    <p style={{fontWeight:"700",fontSize:"13px",marginBottom:"3px"}}>{n.label}</p>
                    <p style={{color:"#00e676",fontSize:"12px"}}>Rp {n.price.toLocaleString("id-ID")}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PILIH METODE */}
            <div style={box}>
              <p style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>
                <span style={{color:"#00e676",marginRight:"8px"}}>3</span>Pilih Metode Pembayaran
              </p>

              <p style={{fontSize:"10px",color:"#333355",letterSpacing:"1px",marginBottom:"6px"}}>QRIS</p>
              {methods.filter(m=>m.id==="QRIS").map(m=>(
                <div key={m.id} onClick={()=>setSelectedMethod(m.id)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 14px",border: selectedMethod===m.id?"1px solid #00e676":"1px solid #1a1a2e",background: selectedMethod===m.id?"rgba(0,230,118,0.05)":"#0a0a0f",marginBottom:"6px",cursor:"pointer",transition:"all 0.2s"}}>
                  <span>{m.icon}</span>
                  <div style={{flex:1}}><p style={{fontSize:"13px",fontWeight:"600"}}>{m.label}</p><p style={{fontSize:"11px",color:"#555570"}}>{m.sub}</p></div>
                  {selectedMethod===m.id && <span style={{color:"#00e676"}}>✓</span>}
                </div>
              ))}

              <p style={{fontSize:"10px",color:"#333355",letterSpacing:"1px",margin:"10px 0 6px"}}>E-WALLET</p>
              {methods.filter(m=>["GoPay","OVO","DANA"].includes(m.id)).map(m=>(
                <div key={m.id} onClick={()=>setSelectedMethod(m.id)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 14px",border: selectedMethod===m.id?"1px solid #00e676":"1px solid #1a1a2e",background: selectedMethod===m.id?"rgba(0,230,118,0.05)":"#0a0a0f",marginBottom:"6px",cursor:"pointer",transition:"all 0.2s"}}>
                  <span>{m.icon}</span>
                  <div style={{flex:1}}><p style={{fontSize:"13px",fontWeight:"600"}}>{m.label}</p><p style={{fontSize:"11px",color:"#555570"}}>{m.sub}</p></div>
                  {selectedMethod===m.id && <span style={{color:"#00e676"}}>✓</span>}
                </div>
              ))}

              <p style={{fontSize:"10px",color:"#333355",letterSpacing:"1px",margin:"10px 0 6px"}}>TRANSFER BANK</p>
              {methods.filter(m=>["BCA","BRI","Mandiri"].includes(m.id)).map(m=>(
                <div key={m.id} onClick={()=>setSelectedMethod(m.id)} style={{display:"flex",alignItems:"center",gap:"10px",padding:"12px 14px",border: selectedMethod===m.id?"1px solid #00e676":"1px solid #1a1a2e",background: selectedMethod===m.id?"rgba(0,230,118,0.05)":"#0a0a0f",marginBottom:"6px",cursor:"pointer",transition:"all 0.2s"}}>
                  <span>{m.icon}</span>
                  <div style={{flex:1}}><p style={{fontSize:"13px",fontWeight:"600"}}>{m.label}</p><p style={{fontSize:"11px",color:"#555570"}}>{m.sub}</p></div>
                  {selectedMethod===m.id && <span style={{color:"#00e676"}}>✓</span>}
                </div>
              ))}
            </div>

            {/* TOTAL + BAYAR */}
            {selected && (
              <div style={{background:"#111120",border:"1px solid #00e676",padding:"16px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontSize:"11px",color:"#555570",marginBottom:"3px"}}>Total Pembayaran</p>
                  <p style={{fontSize:"22px",fontWeight:"800",color:"#00e676"}}>Rp {selected.price.toLocaleString("id-ID")}</p>
                </div>
                <p style={{fontSize:"12px",color:"#888899"}}>{selected.label}</p>
              </div>
            )}

            <button onClick={handleBayar} disabled={confirming} style={{width:"100%",padding:"16px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer",opacity: confirming?0.7:1}}>
              {confirming ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </>
        )}

        {/* STEP 2 - INSTRUKSI */}
        {step === 2 && selectedMethod && (
          <div>
            <div style={box}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",paddingBottom:"12px",borderBottom:"1px solid #1a1a2e"}}>
                <p style={{fontSize:"16px",fontWeight:"700",color:"#00e676",textTransform:"uppercase",letterSpacing:"2px"}}>{selectedMethod}</p>
                <span style={{fontSize:"11px",color:"#ffaa00",background:"rgba(255,170,0,0.1)",border:"1px solid rgba(255,170,0,0.3)",padding:"4px 12px"}}>MENUNGGU</span>
              </div>

              <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"12px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontSize:"11px",color:"#555570",marginBottom:"3px"}}>Order</p>
                  <p style={{fontSize:"13px",fontWeight:"600"}}>{game.name} — {selected?.label}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:"11px",color:"#555570",marginBottom:"3px"}}>Total</p>
                  <p style={{fontSize:"16px",fontWeight:"700",color:"#00e676"}}>Rp {selected?.price.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {instruksi[selectedMethod]?.type === "qris" && (
                <div style={{textAlign:"center"}}>
                  <p style={{fontSize:"12px",color:"#555570",marginBottom:"12px"}}>Scan QR Code berikut:</p>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:"12px"}}>
                    <img src="/images/qris.png" alt="QRIS" style={{width:"180px",height:"180px",objectFit:"contain",border:"4px solid #00e676",padding:"8px",background:"white"}} />
                  </div>
                  <p style={{fontSize:"11px",color:"#555570"}}>GoPay • OVO • DANA • ShopeePay • dll</p>
                </div>
              )}

              {instruksi[selectedMethod]?.type === "ewallet" && (
                <div>
                  <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"14px",marginBottom:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <p style={{fontSize:"11px",color:"#555570",marginBottom:"3px"}}>{selectedMethod}</p>
                      <p style={{fontSize:"20px",fontWeight:"700",letterSpacing:"2px"}}>{instruksi[selectedMethod].number}</p>
                    </div>
                    <button onClick={()=>copyText(instruksi[selectedMethod].number)} style={{background:"transparent",border:"1px solid #00e676",color:"#00e676",padding:"8px 14px",fontSize:"12px",cursor:"pointer"}}>Salin</button>
                  </div>
                  <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <p style={{fontSize:"11px",color:"#555570",marginBottom:"3px"}}>Nominal</p>
                      <p style={{fontSize:"20px",fontWeight:"700",color:"#00e676"}}>Rp {selected?.price.toLocaleString("id-ID")}</p>
                    </div>
                    <button onClick={()=>copyText(selected?.price.toString())} style={{background:"transparent",border:"1px solid #00e676",color:"#00e676",padding:"8px 14px",fontSize:"12px",cursor:"pointer"}}>Salin</button>
                  </div>
                </div>
              )}

              {instruksi[selectedMethod]?.type === "bank" && (
                <div>
                  <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"14px",marginBottom:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <p style={{fontSize:"11px",color:"#555570",marginBottom:"3px"}}>{selectedMethod} Virtual Account</p>
                      <p style={{fontSize:"20px",fontWeight:"700",letterSpacing:"2px"}}>{instruksi[selectedMethod].number}</p>
                    </div>
                    <button onClick={()=>copyText(instruksi[selectedMethod].number)} style={{background:"transparent",border:"1px solid #00e676",color:"#00e676",padding:"8px 14px",fontSize:"12px",cursor:"pointer"}}>Salin</button>
                  </div>
                  <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <p style={{fontSize:"11px",color:"#555570",marginBottom:"3px"}}>Nominal</p>
                      <p style={{fontSize:"20px",fontWeight:"700",color:"#00e676"}}>Rp {selected?.price.toLocaleString("id-ID")}</p>
                    </div>
                    <button onClick={()=>copyText(selected?.price.toString())} style={{background:"transparent",border:"1px solid #00e676",color:"#00e676",padding:"8px 14px",fontSize:"12px",cursor:"pointer"}}>Salin</button>
                  </div>
                  <p style={{fontSize:"11px",color:"#555570",borderLeft:"2px solid #00e676",paddingLeft:"10px",marginTop:"10px"}}>Transfer tepat sesuai nominal!</p>
                </div>
              )}
            </div>

            <button onClick={handleSudahBayar} style={{width:"100%",padding:"16px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",marginBottom:"10px"}}>
              ✅ Saya Sudah Bayar
            </button>
            <button onClick={()=>setStep(1)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid #1a1a2e",color:"#555570",fontSize:"13px",letterSpacing:"2px",cursor:"pointer"}}>
              ← Kembali
            </button>
          </div>
        )}
      </div>

      {/* MODAL SUKSES */}
      {success && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}}>
          <div style={{background:"#111120",border:"1px solid #00e676",padding:"40px",textAlign:"center",maxWidth:"400px",width:"100%"}}>
            <div style={{width:"60px",height:"60px",background:"#00e676",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:"26px",color:"#000",fontWeight:"700"}}>✓</div>
            <h2 style={{fontSize:"22px",fontWeight:"700",marginBottom:"10px"}}>Pembayaran Berhasil!</h2>
            <p style={{color:"#555570",fontSize:"13px",marginBottom:"16px"}}>{selected?.label} untuk {game.name} berhasil!</p>
            <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"12px",marginBottom:"20px",fontFamily:"monospace",color:"#00e676",fontSize:"13px"}}>Order ID: {orderId}</div>
            <button onClick={()=>router.push("/")} style={{width:"100%",padding:"14px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer"}}>
              Kembali ke Home
            </button>
          </div>
        </div>
      )}
    </main>
  );
}