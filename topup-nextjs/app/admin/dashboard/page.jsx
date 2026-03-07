"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("admin_logged_in")) {
        router.push("/admin");
        return;
      }
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("order")
      .select("*")
      .order("id", { ascending: false });
    if (!error) {
      setOrders(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  const handleFilter = (status) => {
    setFilter(status);
    if (status === "all") setFiltered(orders);
    else setFiltered(orders.filter((o) => o.status === status));
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    router.push("/admin");
  };

  const exportExcel = () => {
    const headers = ["Order ID","Game","User ID","Paket","Harga","Metode","Status"];
    const rows = filtered.map((o) => [o.order_id, o.game, o.user_id, o.package, o.price, o.method, o.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
  };

  const totalPendapatan = filtered.filter(o => o.status === "success").reduce((sum, o) => sum + (o.price || 0), 0);

  const btn = (label, val) => (
    <button
      key={val}
      onClick={() => handleFilter(val)}
      style={{padding:"8px 20px",background: filter===val ? "#00e676" : "transparent",border: filter===val ? "1px solid #00e676" : "1px solid #1a1a2e",color: filter===val ? "#000" : "#555570",fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",fontWeight: filter===val ? "700" : "400"}}
    >
      {label}
    </button>
  );

  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",color:"white",fontFamily:"sans-serif"}}>

      {/* HEADER */}
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 40px",borderBottom:"1px solid #1a1a2e"}}>
        <div style={{fontSize:"22px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace"}}>
          TOPUP<span style={{color:"#00e676"}}>GAME</span>
          <span style={{fontSize:"12px",color:"#555570",letterSpacing:"3px",marginLeft:"16px",fontFamily:"sans-serif"}}>ADMIN</span>
        </div>
        <button onClick={handleLogout} style={{background:"transparent",border:"1px solid #ff4444",color:"#ff4444",padding:"8px 20px",fontSize:"12px",letterSpacing:"2px",cursor:"pointer"}}>
          LOGOUT
        </button>
      </header>

      <div style={{padding:"32px 40px"}}>

        {/* STATS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px",marginBottom:"32px"}}>
          {[
            ["Total Order", orders.length, "#00e676"],
            ["Order Sukses", orders.filter(o=>o.status==="success").length, "#00e676"],
            ["Total Pendapatan", "Rp " + totalPendapatan.toLocaleString("id-ID"), "#00e676"],
          ].map(([label, val, color]) => (
            <div key={label} style={{background:"#111120",border:"1px solid #1a1a2e",clipPath:"polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)",padding:"20px 24px"}}>
              <p style={{fontSize:"11px",color:"#555570",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"8px"}}>{label}</p>
              <p style={{fontSize:"24px",fontWeight:"700",color}}>{val}</p>
            </div>
          ))}
        </div>

        {/* FILTER & EXPORT */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <div style={{display:"flex",gap:"8px"}}>
            {btn("Semua","all")}
            {btn("Sukses","success")}
            {btn("Pending","pending")}
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={fetchOrders} style={{padding:"8px 20px",background:"transparent",border:"1px solid #1a1a2e",color:"#555570",fontSize:"12px",letterSpacing:"2px",cursor:"pointer"}}>↻ REFRESH</button>
            <button onClick={exportExcel} style={{padding:"8px 20px",background:"transparent",border:"1px solid #00e676",color:"#00e676",fontSize:"12px",letterSpacing:"2px",cursor:"pointer"}}>↓ EXPORT CSV</button>
          </div>
        </div>

        {/* TABLE */}
        <div style={{background:"#111120",border:"1px solid #1a1a2e",overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #1a1a2e"}}>
                {["Order ID","Game","User ID","Paket","Harga","Metode","Status"].map((h) => (
                  <th key={h} style={{padding:"14px 16px",textAlign:"left",fontSize:"11px",letterSpacing:"2px",color:"#555570",textTransform:"uppercase",fontWeight:"600"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{padding:"40px",textAlign:"center",color:"#555570"}}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{padding:"40px",textAlign:"center",color:"#555570"}}>Belum ada orderan</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} style={{borderBottom:"1px solid #0f0f1a"}}>
                  <td style={{padding:"14px 16px",color:"#00e676",fontFamily:"monospace",fontSize:"12px"}}>{o.order_id}</td>
                  <td style={{padding:"14px 16px"}}>{o.game}</td>
                  <td style={{padding:"14px 16px",color:"#888899"}}>{o.user_id}</td>
                  <td style={{padding:"14px 16px",color:"#888899"}}>{o.package}</td>
                  <td style={{padding:"14px 16px"}}>Rp {(o.price||0).toLocaleString("id-ID")}</td>
                  <td style={{padding:"14px 16px",color:"#888899"}}>{o.method}</td>
                  <td style={{padding:"14px 16px"}}>
                    <span style={{padding:"4px 12px",background: o.status==="success" ? "rgba(0,230,118,0.1)" : "rgba(255,170,0,0.1)",color: o.status==="success" ? "#00e676" : "#ffaa00",fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase"}}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}