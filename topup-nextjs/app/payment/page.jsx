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
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

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

  const handleConfirm = async () => {
    if (!selectedMethod) { alert("Pilih metode dulu!"); return; }
    setConfirming(true);
    const id = "TG-" + Date.now().toString().slice(-8).toUpperCase();
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
          onPending: () => { alert("Pembayaran pending!"); },
          onError: () => { alert("Pembayaran gagal!"); },
        });
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan!");
    }
    setConfirming(false);
  };

  const methods = [
    { group: "QRIS", items: ["QRIS"] },
    { group: "E-Wallet", items: ["GoPay", "OVO", "DANA"] },
    { group: "Transfer Bank", items: ["BCA", "BRI", "Mandiri"] },
  ];

  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",color:"white",fontFamily:"sans-serif"}}>

      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid #1a1a2e"}}>
        <div style={{fontSize:"20px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          TOPUP<span style={{color:"#00e676"}}>GAME</span>
        </div>
        <Link href="/" style={{color:"#555570",fontSize:"12px",textDecoration:"none"}}>Home</Link>
      </header>

      <div style={{padding:"20px",maxWidth:"1100px",margin:"0 auto"}}>

        {/* DETAIL ORDER */}
        <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"16px",marginBottom:"16px"}}>
          <p style={{fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:"#555570",marginBottom:"12px"}}>Detail Pesanan</p>
          {[["Game",game],["User ID",userId],["Paket",pkg]].map(([label,val])=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",marginBottom:"10px",fontSize:"13px"}}>
              <span style={{color:"#555570"}}>{label}</span>
              <strong style={{color:"white",textAlign:"right",maxWidth:"200px",wordBreak:"break-all"}}>{val}</strong>
            </div>
          ))}
          <div style={{borderTop:"1px solid #1a1a2e",marginTop:"10px",paddingTop:"10px",display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#555570",fontSize:"13px"}}>Total Bayar</span>
            <strong style={{color:"#00e676",fontSize:"16px"}}>Rp {price.toLocaleString("id-ID")}</strong>
          </div>
        </div>

        {/* TIMER */}
        <div style={{background:"#111120",border:"1px solid #1a1a2e",padding:"16px",marginBottom:"16px",textAlign:"center"}}>
          <p style={{fontSize:"11px",letterSpacing:"2px",color:"#555570",marginBottom:"6px"}}>Selesaikan pembayaran dalam</p>
          <p style={{fontSize:"36px",fontWeight:"800",fontFamily:"monospace",color: seconds < 60 ? "#ff4444" : "#00e676",letterSpacing:"4px"}}>{formatTime(seconds)}</p>
        </div>

        {/* METODE */}
        <p style={{fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:"#555570",marginBottom:"12px"}}>Pilih Metode Pembayaran</p>

        {methods.map(({ group, items }) => (
          <div key={group} style={{marginBottom:"12px"}}>
            <p style={{fontSize:"11px",color:"#333355",letterSpacing:"2px",marginBottom:"6px"}}>{group}</p>
            {items.map((m) => (
              <div key={m} onClick={() => setSelectedMethod(m)}
                style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",border: selectedMethod===m ? "1px solid #00e676" : "1px solid #1a1a2e",background: selectedMethod===m ? "rgba(0,230,118,0.05)" : "#111120",marginBottom:"8px",cursor:"pointer",transition:"all 0.2s"}}>
                <span style={{fontSize:"14px",flex:1}}>{m}</span>
                {selectedMethod===m && <span style={{color:"#00e676"}}>✓</span>}
              </div>
            ))}
          </div>
        ))}

        <button onClick={handleConfirm} disabled={confirming}
          style={{width:"100%",padding:"16px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer",marginTop:"8px",opacity: confirming ? 0.7 : 1}}>
          {confirming ? "Memproses..." : "Lanjut Bayar"}
        </button>

      </div>

      {success && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}}>
          <div style={{background:"#111120",border:"1px solid #00e676",padding:"32px",textAlign:"center",width:"100%",maxWidth:"400px"}}>
            <div style={{width:"56px",height:"56px",background:"#00e676",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:"24px",color:"#000",fontWeight:"700"}}>✓</div>
            <h2 style={{fontSize:"20px",fontWeight:"700",letterSpacing:"2px",marginBottom:"10px"}}>Pembayaran Berhasil!</h2>
            <p style={{color:"#555570",fontSize:"13px",marginBottom:"14px"}}>{pkg} untuk {game} berhasil!</p>
            <div style={{background:"#0a0a0f",border:"1px solid #1a1a2e",padding:"10px",marginBottom:"20px",fontFamily:"monospace",fontSize:"12px",letterSpacing:"2px",color:"#00e676",wordBreak:"break-all"}}>Order ID: {orderId}</div>
            <button onClick={() => router.push("/")}
              style={{width:"100%",padding:"14px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer"}}>
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