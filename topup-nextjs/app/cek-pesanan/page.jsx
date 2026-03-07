"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CekPesanan() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleCek = async () => {
    if (!orderId.trim()) { alert("Masukkan Order ID dulu!"); return; }
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    const { data, error } = await supabase
      .from("order")
      .select("*")
      .eq("order_id", orderId.trim().toUpperCase())
      .single();

    if (error || !data) {
      setNotFound(true);
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  const statusColor = (s) => {
    if (s === "success") return "#00e676";
    if (s === "pending") return "#ffaa00";
    return "#ff4444";
  };

  const statusLabel = (s) => {
    if (s === "success") return "✅ Sukses";
    if (s === "pending") return "⏳ Menunggu Pembayaran";
    return "❌ Gagal";
  };

  const box = { background:"#111120", border:"1px solid #1a1a2e", padding:"20px", marginBottom:"12px" };

  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",color:"white",fontFamily:"sans-serif"}}>

      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid #1a1a2e",position:"sticky",top:0,background:"rgba(10,10,15,0.95)",backdropFilter:"blur(10px)",zIndex:100}}>
        <div style={{fontSize:"22px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          AYSIEL<span style={{color:"#00e676"}}>TOPUP</span>
        </div>
        <nav style={{display:"flex",gap:"20px"}}>
          <Link href="/" style={{color:"#555570",fontSize:"13px",textDecoration:"none"}}>Home</Link>
          <Link href="/cek-pesanan" style={{color:"#00e676",fontSize:"13px",textDecoration:"none"}}>Cek Pesanan</Link>
        </nav>
      </header>

      <div style={{maxWidth:"560px",margin:"0 auto",padding:"40px 20px"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <p style={{fontSize:"11px",letterSpacing:"4px",color:"#00e676",textTransform:"uppercase",marginBottom:"12px"}}>Lacak Pesanan</p>
          <h1 style={{fontSize:"28px",fontWeight:"800",marginBottom:"8px"}}>Cek Status Pesanan</h1>
          <p style={{color:"#555570",fontSize:"13px"}}>Masukkan Order ID yang kamu terima setelah checkout</p>
        </div>

        {/* INPUT ORDER ID */}
        <div style={box}>
          <p style={{fontSize:"11px",letterSpacing:"2px",color:"#555570",textTransform:"uppercase",marginBottom:"12px"}}>Order ID</p>
          <div style={{display:"flex",gap:"10px"}}>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCek()}
              placeholder="Contoh: TG-36180227"
              style={{flex:1,background:"#0a0a0f",border:"1px solid #1a1a2e",color:"white",padding:"12px 14px",fontSize:"14px",outline:"none",fontFamily:"monospace",textTransform:"uppercase"}}
            />
            <button onClick={handleCek} disabled={loading} style={{padding:"12px 20px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"13px",letterSpacing:"2px",cursor:"pointer",flexShrink:0,opacity:loading?0.7:1}}>
              {loading ? "..." : "CEK"}
            </button>
          </div>
        </div>

        {/* NOT FOUND */}
        {notFound && (
          <div style={{background:"rgba(255,68,68,0.05)",border:"1px solid rgba(255,68,68,0.2)",padding:"20px",textAlign:"center",marginBottom:"12px"}}>
            <p style={{fontSize:"24px",marginBottom:"8px"}}>😔</p>
            <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"4px"}}>Order tidak ditemukan</p>
            <p style={{fontSize:"12px",color:"#555570"}}>Pastikan Order ID yang kamu masukkan sudah benar</p>
          </div>
        )}

        {/* ORDER DETAIL */}
        {order && (
          <div>
            {/* STATUS */}
            <div style={{background:"#111120",border:`1px solid ${statusColor(order.status)}`,padding:"20px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{fontSize:"11px",color:"#555570",letterSpacing:"2px",marginBottom:"6px"}}>STATUS PESANAN</p>
                <p style={{fontSize:"20px",fontWeight:"700",color:statusColor(order.status)}}>{statusLabel(order.status)}</p>
              </div>
              <div style={{width:"48px",height:"48px",borderRadius:"50%",background:`${statusColor(order.status)}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px"}}>
                {order.status === "success" ? "✓" : order.status === "pending" ? "⏳" : "✕"}
              </div>
            </div>

            {/* DETAIL */}
            <div style={box}>
              <p style={{fontSize:"11px",letterSpacing:"2px",color:"#555570",textTransform:"uppercase",marginBottom:"16px"}}>Detail Pesanan</p>
              {[
                ["Order ID", order.order_id],
                ["Game", order.game],
                ["Paket", order.package],
                ["User ID", order.user_id],
                ["Metode", order.method],
                ["Total", `Rp ${parseInt(order.price).toLocaleString("id-ID")}`],
                ["WhatsApp", order.whatsapp ? `+62${order.whatsapp}` : "-"],
              ].map(([label, val]) => (
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:"10px",marginBottom:"10px",borderBottom:"1px solid #0d0d1a"}}>
                  <span style={{fontSize:"12px",color:"#555570"}}>{label}</span>
                  <span style={{fontSize:"13px",fontWeight:"600",fontFamily: label === "Order ID" ? "monospace" : "sans-serif",color: label === "Total" ? "#00e676" : "white"}}>{val}</span>
                </div>
              ))}
            </div>

            {/* INFO PENDING */}
            {order.status === "pending" && (
              <div style={{background:"rgba(255,170,0,0.05)",border:"1px solid rgba(255,170,0,0.2)",padding:"16px",marginBottom:"12px"}}>
                <p style={{fontSize:"13px",color:"#ffaa00",marginBottom:"4px",fontWeight:"600"}}>⚠️ Pembayaran Belum Dikonfirmasi</p>
                <p style={{fontSize:"12px",color:"#888899"}}>Jika sudah bayar, hubungi admin via WhatsApp untuk konfirmasi manual.</p>
              </div>
            )}

            <Link href="/" style={{display:"block",width:"100%",padding:"14px",background:"transparent",border:"1px solid #1a1a2e",color:"#555570",textAlign:"center",fontSize:"13px",letterSpacing:"2px",textDecoration:"none",boxSizing:"border-box"}}>
              ← Kembali ke Home
            </Link>
          </div>
        )}
      </div>

      <footer style={{borderTop:"1px solid #1a1a2e",padding:"24px",textAlign:"center",color:"#333355",fontSize:"12px",letterSpacing:"2px"}}>
        © 2026 AYSIELTOPUP — ALL RIGHTS RESERVED
      </footer>
    </main>
  );
}