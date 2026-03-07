"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();

  const game = params.get("game") || "-";
  const userId = params.get("userId") || "-";
  const pkg = params.get("package") || "-";
  const price = parseInt(params.get("price") || "0");

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [seconds, setSeconds] = useState(15 * 60 - 1);
  const [step, setStep] = useState(1); // 1=pilih metode, 2=instruksi bayar
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 0) { clearInterval(timer); router.push("/"); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Tersalin: " + text);
  };

  const handleLanjut = async () => {
    if (!selectedMethod) { alert("Pilih metode dulu!"); return; }
    setConfirming(true);

    const id = "TG-" + Date.now().toString().slice(-8).toUpperCase();
    setCurrentOrderId(id);

    try {
      const res = await fetch("/api/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, amount: price, game, userId, packageName: pkg }),
      });
      const data = await res.json();

      if (data.token) {
        await supabase.from("order").insert([{
          order_id: id, game, user_id: userId, package: pkg, price, method: selectedMethod, status: "pending"
        }]);

        window.snap.pay(data.token, {
          onSuccess: async () => {
            await supabase.from("order").update({ status: "success" }).eq("order_id", id);
            setOrderId(id);
            setSuccess(true);
          },
          onPending: async () => {
            setOrderId(id);
            setStep(2);
          },
          onError: () => { alert("Pembayaran gagal!"); },
          onClose: () => { setStep(2); setOrderId(id); }
        });
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan!");
    }
    setConfirming(false);
  };

  const handleSudahBayar = async () => {
    await supabase.from("order").update({ status: "success" }).eq("order_id", currentOrderId || orderId);
    setOrderId(currentOrderId || orderId);
    setSuccess(true);
  };

  const s = { background:"#111120", border:"1px solid #1a1a2e", padding:"20px", marginBottom:"12px" };

  const methods = [
    { id:"QRIS", label:"QRIS", sub:"Semua E-Wallet", icon:"⬛" },
    { id:"GoPay", label:"GoPay", sub:"Transfer ke nomor", icon:"💚" },
    { id:"OVO", label:"OVO", sub:"Transfer ke nomor", icon:"💜" },
    { id:"DANA", label:"DANA", sub:"Transfer ke nomor", icon:"💙" },
    { id:"BCA", label:"BCA", sub:"Virtual Account", icon:"🏦" },
    { id:"BRI", label:"BRI", sub:"Virtual Account", icon:"🏦" },
    { id:"Mandiri", label:"Mandiri", sub:"Virtual Account", icon:"🏦" },
  ];

  const instruksi = {
    QRIS: { number: null, type: "qris" },
    GoPay: { number: "0881025943146", type: "ewallet" },
    OVO: { number: "0881025943146", type: "ewallet" },
    DANA: { number: "0881025943146", type: "ewallet" },
    BCA: { number: "1442331526", type: "bank" },
    BRI: { number: "1442331526", type: "bank" },
    Mandiri: { number: "1442331526", type: "bank" },
  };

  const steps_bayar = {
    QRIS: ["Buka aplikasi e-wallet kamu", "Pilih menu Scan QR atau Bayar", "Scan QR Code di atas", "Pastikan nominal sesuai lalu konfirmasi", "Klik Saya Sudah Bayar"],
    GoPay: ["Buka aplikasi Gojek", "Pilih GoPay lalu Transfer", `Masukkan nomor 0881025943146`, `Masukkan nominal Rp ${price.toLocaleString("id-ID")}`, "Konfirmasi pembayaran", "Klik Saya Sudah Bayar"],
    OVO: ["Buka aplikasi OVO", "Pilih menu Transfer", `Masukkan nomor 0881025943146`, `Masukkan nominal Rp ${price.toLocaleString("id-ID")}`, "Konfirmasi pembayaran", "Klik Saya Sudah Bayar"],
    DANA: ["Buka aplikasi DANA", "Pilih menu Kirim", `Masukkan nomor 0881025943146`, `Masukkan nominal Rp ${price.toLocaleString("id-ID")}`, "Konfirmasi pembayaran", "Klik Saya Sudah Bayar"],
    BCA: ["Buka BCA Mobile", "Pilih Transfer lalu Virtual Account", "Masukkan nomor VA: 1442331526", `Nominal: Rp ${price.toLocaleString("id-ID")}`, "Konfirmasi pembayaran", "Klik Saya Sudah Bayar"],
    BRI: ["Buka BRImo", "Pilih Pembayaran lalu BRIVA", "Masukkan nomor VA: 1442331526", `Nominal: Rp ${price.toLocaleString("id-ID")}`, "Konfirmasi pembayaran", "Klik Saya Sudah Bayar"],
    Mandiri: ["Buka Livin by Mandiri", "Pilih Transfer lalu Virtual Account", "Masukkan nomor VA: 1442331526", `Nominal: Rp ${price.toLocaleString("id-ID")}`, "Konfirmasi pembayaran", "Klik Saya Sudah Bayar"],
  };

  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",color:"white",fontFamily:"sans-serif"}}>

      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid #1a1a2e"}}>
        <div style={{fontSize:"20px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          TOPUP<span style={{color:"#00e676"}}>GAME</span>
        </div>
        <Link href="/" style={{color:"#555570",fontSize:"12px",textDecoration:"none"}}>← Home</Link>
      </header>

      <div style={{maxWidth:"600px",margin:"0 auto",padding:"20px"}}>

        {/* ORDER SUMMARY */}
        <div style={{...s,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
          <div>
            <p style={{fontSize:"11px",color:"#555570",letterSpacing:"2px",marginBottom:"4px"}}>PESANAN</p>
            <p style={{fontWeight:"700",fontSize:"14px"}}>{game} — {pkg}</p>
            <p style={{fontSize:"12px",color:"#888899"}}>User ID: {userId}</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:"11px",color:"#555570",marginBottom:"4px"}}>TOTAL</p>
            <p style={{fontSize:"22px",fontWeight:"800",color:"#00e676"}}>Rp {price.toLocaleString("id-ID")}</p>
          </div>
        </div>

        {/* TIMER */}
        <div style={{background:"#111120",border: seconds < 60 ? "1px solid #ff4444" : "1px solid #1a1a2e",padding:"12px 20px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{fontSize:"12px",color:"#555570"}}>Batas Pembayaran</p>
          <p style={{fontSize:"24px",fontWeight:"800",fontFamily:"monospace",color: seconds < 60 ? "#ff4444" : "#00e676"}}>{formatTime(seconds)}</p>
        </div>

        {/* STEP 1 - PILIH METODE */}
        {step === 1 && (
          <div>
            <p style={{fontSize:"11px",color:"#555570",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"12px"}}>Pilih Metode Pembayaran</p>

            {/* QRIS */}
            <p style={{fontSize:"11px",color:"#333355",marginBottom:"6px",letterSpacing:"1px"}}>QRIS</p>
            {methods.filter(m => m.id === "QRIS").map(m => (
              <div key={m.id} onClick={() => setSelectedMethod(m.id)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",border: selectedMethod===m.id ? "1px solid #00e676" : "1px solid #1a1a2e",background: selectedMethod===m.id ? "rgba(0,230,118,0.05)" : "#111120",marginBottom:"8px",cursor:"pointer",transition:"all 0.2s"}}>
                <span style={{fontSize:"20px"}}>{m.icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:"13px",fontWeight:"600"}}>{m.label}</p>
                  <p style={{fontSize:"11px",color:"#555570"}}>{m.sub}</p>
                </div>
                {selectedMethod===m.id && <span style={{color:"#00e676",fontSize:"16px"}}>✓</span>}
              </div>
            ))}

            <p style={{fontSize:"11px",color:"#333355",marginBottom:"6px",letterSpacing:"1px",marginTop:"12px"}}>E-WALLET</p>
            {methods.filter(m => ["GoPay","OVO","DANA"].includes(m.id)).map(m => (
              <div key={m.id} onClick={() => setSelectedMethod(m.id)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",border: selectedMethod===m.id ? "1px solid #00e676" : "1px solid #1a1a2e",background: selectedMethod===m.id ? "rgba(0,230,118,0.05)" : "#111120",marginBottom:"8px",cursor:"pointer",transition:"all 0.2s"}}>
                <span style={{fontSize:"20px"}}>{m.icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:"13px",fontWeight:"600"}}>{m.label}</p>
                  <p style={{fontSize:"11px",color:"#555570"}}>{m.sub}</p>
                </div>
                {selectedMethod===m.id && <span style={{color:"#00e676",fontSize:"16px"}}>✓</span>}
              </div>
            ))}

            <p style={{fontSize:"11px",color:"#333355",marginBottom:"6px",letterSpacing:"1px",marginTop:"12px"}}>TRANSFER BANK</p>
            {methods.filter(m => ["BCA","BRI","Mandiri"].includes(m.id)).map(m => (
              <div key={m.id} onClick={() => setSelectedMethod(m.id)} style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",border: selectedMethod===m.id ? "1px solid #00e676" : "1px solid #1a1a2e",background: selectedMethod===m.id ? "rgba(0,230,118,0.05)" : "#111120",marginBottom:"8px",cursor:"pointer",transition:"all 0.2s"}}>
                <span style={{fontSize:"20px"}}>{m.icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:"13px",fontWeight:"600"}}>{m.label}</p>
                  <p style={{fontSize:"11px",color:"#555570"}}>{m.sub}</p>
                </div>
                {selectedMethod===m.id && <span style={{color:"#00e676",fontSize:"16px"}}>✓</span>}
              </div>
            ))}

            <button onClick={handleLanjut} disabled={confirming} style={{width:"100%",padding:"16px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer",marginTop:"8px",opacity: confirming ? 0.7 : 1}}>
              {confirming ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </div>
        )}

        {/* STEP 2 - INSTRUKSI BAYAR */}
        {step === 2 && selectedMethod && (
          <div>
            <div style={{...s}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",paddingBottom:"12px",borderBottom:"1px solid #1a1a2e"}}>
                <p style={{fontSize:"16px",fontWeight:"700",color:"#00e676",textTransform:"uppercase",letterSpacing:"2px"}}>{selectedMethod}</p>
                <span style={{fontSize:"11px",color:"#555570",background:"rgba(255,170,0,0.1)",border:"1px solid rgba(255,170,0,0.3)",color:"#ffaa00",padding:"4px 12px"}}>MENUNGGU PEMBAYARAN</span>
              </div>

              {/* QRIS */}
              {instruksi[selectedMethod]?.type === "qris" && (
                <div style={{textAlign:"center"}}>
                  <p style={{fontSize:"12px",color:"#555570",marginBottom:"12px"}}>Scan QR Code berikut:</p>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:"12px"}}>
                    <img src="/images/qris.png" alt="QRIS" style={{width:"180px",height:"180px",objectFit:"contain",border:"4px solid #00e676",padding:"8px",background:"white"}} />
                  </div>
                  <p style={{fontSize:"12px",color:"#555570"}}>Bisa dibayar via GoPay, OVO, DANA, ShopeePay, dll</p>
                </div>
              )}

              {/* E-Wallet */}
              {instruksi[selectedMethod]?.type === "ewallet" && (
                <div>
                  <p style={{fontSize:"12px",color:"#555570",marginBottom:"12px"}}>Transfer ke nomor {selectedMethod}:</p>
                  <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"16px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <p style={{fontSize:"11px",color:"#555570",marginBottom:"4px"}}>{selectedMethod}</p>
                      <p style={{fontSize:"22px",fontWeight:"700",letterSpacing:"2px"}}>{instruksi[selectedMethod].number}</p>
                    </div>
                    <button onClick={() => copyText(instruksi[selectedMethod].number)} style={{background:"transparent",border:"1px solid #00e676",color:"#00e676",padding:"8px 16px",fontSize:"12px",cursor:"pointer"}}>Salin</button>
                  </div>
                  <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <p style={{fontSize:"11px",color:"#555570",marginBottom:"4px"}}>Nominal Transfer</p>
                      <p style={{fontSize:"22px",fontWeight:"700",color:"#00e676"}}>Rp {price.toLocaleString("id-ID")}</p>
                    </div>
                    <button onClick={() => copyText(price.toString())} style={{background:"transparent",border:"1px solid #00e676",color:"#00e676",padding:"8px 16px",fontSize:"12px",cursor:"pointer"}}>Salin</button>
                  </div>
                </div>
              )}

              {/* Bank */}
              {instruksi[selectedMethod]?.type === "bank" && (
                <div>
                  <p style={{fontSize:"12px",color:"#555570",marginBottom:"12px"}}>{selectedMethod} Virtual Account:</p>
                  <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"16px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <p style={{fontSize:"11px",color:"#555570",marginBottom:"4px"}}>{selectedMethod} VA</p>
                      <p style={{fontSize:"22px",fontWeight:"700",letterSpacing:"2px"}}>{instruksi[selectedMethod].number}</p>
                    </div>
                    <button onClick={() => copyText(instruksi[selectedMethod].number)} style={{background:"transparent",border:"1px solid #00e676",color:"#00e676",padding:"8px 16px",fontSize:"12px",cursor:"pointer"}}>Salin</button>
                  </div>
                  <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <p style={{fontSize:"11px",color:"#555570",marginBottom:"4px"}}>Nominal Transfer</p>
                      <p style={{fontSize:"22px",fontWeight:"700",color:"#00e676"}}>Rp {price.toLocaleString("id-ID")}</p>
                    </div>
                    <button onClick={() => copyText(price.toString())} style={{background:"transparent",border:"1px solid #00e676",color:"#00e676",padding:"8px 16px",fontSize:"12px",cursor:"pointer"}}>Salin</button>
                  </div>
                  <p style={{fontSize:"11px",color:"#555570",borderLeft:"2px solid #00e676",paddingLeft:"10px",marginTop:"12px"}}>Transfer tepat sesuai nominal sampai angka terakhir!</p>
                </div>
              )}

              {/* Langkah */}
              <div style={{marginTop:"20px",paddingTop:"16px",borderTop:"1px solid #1a1a2e"}}>
                <p style={{fontSize:"11px",color:"#555570",letterSpacing:"2px",marginBottom:"10px"}}>CARA BAYAR:</p>
                <ol style={{paddingLeft:"18px",margin:0}}>
                  {(steps_bayar[selectedMethod]||[]).map((step,i)=>(
                    <li key={i} style={{fontSize:"13px",color:"#888899",marginBottom:"8px",lineHeight:"1.5"}}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <button onClick={handleSudahBayar} style={{width:"100%",padding:"16px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",marginBottom:"10px"}}>
              ✅ Saya Sudah Bayar
            </button>
            <button onClick={() => setStep(1)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid #1a1a2e",color:"#555570",fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer"}}>
              ← Ganti Metode
            </button>
          </div>
        )}
      </div>

      {/* MODAL SUKSES */}
      {success && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}}>
          <div style={{background:"#111120",border:"1px solid #00e676",padding:"40px",textAlign:"center",maxWidth:"400px",width:"100%"}}>
            <div style={{width:"60px",height:"60px",background:"#00e676",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:"26px",color:"#000",fontWeight:"700"}}>✓</div>
            <h2 style={{fontSize:"22px",fontWeight:"700",letterSpacing:"2px",marginBottom:"10px"}}>Pembayaran Berhasil!</h2>
            <p style={{color:"#555570",fontSize:"13px",marginBottom:"16px"}}>{pkg} untuk {game} berhasil dikirim ke User ID {userId}</p>
            <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"12px",marginBottom:"20px",fontFamily:"monospace",letterSpacing:"2px",color:"#00e676",fontSize:"13px"}}>Order ID: {orderId}</div>
            <button onClick={() => router.push("/")} style={{width:"100%",padding:"14px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer"}}>
              Kembali ke Home
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}