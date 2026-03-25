"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RiwayatOrder() {
  const [whatsapp, setWhatsapp] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);

  const handleCari = async () => {
    if (!whatsapp.trim()) { alert("Masukkan nomor WhatsApp dulu!"); return; }
    setLoading(true);
    setSearched(false);
    setOrders([]);

    const { data, error } = await supabase
      .from("order")
      .select("*")
      .eq("whatsapp", whatsapp.trim())
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setSearched(true);
    setLoading(false);
  };

  const statusConfig = {
    success: { label: "Sukses", color: "#00e676", bg: "rgba(0,230,118,0.08)", border: "rgba(0,230,118,0.25)", icon: "✅" },
    pending: { label: "Menunggu", color: "#ffaa00", bg: "rgba(255,170,0,0.08)", border: "rgba(255,170,0,0.25)", icon: "⏳" },
    failed:  { label: "Gagal",    color: "#ff4444", bg: "rgba(255,68,68,0.08)",  border: "rgba(255,68,68,0.25)",  icon: "❌" },
  };

  const getStatus = (s) => statusConfig[s] || statusConfig.failed;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handleHubungiAdmin = (order) => {
    const msg = encodeURIComponent(
      `Halo admin AysielTopUp! Saya ingin menanyakan pesanan saya:\n\n` +
      `🆔 Order ID: ${order.order_id}\n` +
      `🎮 Game: ${order.game}\n` +
      `📦 Paket: ${order.package}\n` +
      `💰 Total: Rp ${parseInt(order.price).toLocaleString("id-ID")}\n` +
      `📊 Status: ${getStatus(order.status).label}\n\n` +
      `Mohon bantuannya, terima kasih!`
    );
    window.open(`https://wa.me/6281025943146?text=${msg}`, "_blank");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", backgroundImage: "linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)", backgroundSize: "40px 40px", color: "white", fontFamily: "sans-serif" }}>

      {/* HEADER */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #1a1a2e", position: "sticky", top: 0, background: "rgba(10,10,15,0.97)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "4px", fontFamily: "monospace", color: "white" }}>
            AYSIEL<span style={{ color: "#00e676" }}>TOPUP</span>
          </div>
        </Link>
        <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link href="/" style={{ color: "#555570", fontSize: "13px", textDecoration: "none", letterSpacing: "1px" }}>Home</Link>
          <Link href="/cek-pesanan" style={{ color: "#555570", fontSize: "13px", textDecoration: "none", letterSpacing: "1px" }}>Cek Pesanan</Link>
          <Link href="/riwayat" style={{ color: "#00e676", fontSize: "13px", textDecoration: "none", letterSpacing: "1px" }}>Riwayat</Link>
          <Link href="/artikel" style={{ color: "#555570", fontSize: "13px", textDecoration: "none", letterSpacing: "1px" }}>Artikel</Link>
        </nav>
      </header>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 20px" }}>

        {/* HERO */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "22px" }}>🧾</div>
          <p style={{ fontSize: "11px", letterSpacing: "4px", color: "#00e676", textTransform: "uppercase", marginBottom: "10px" }}>Lacak Semua Transaksi</p>
          <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Riwayat Order</h1>
          <p style={{ color: "#555570", fontSize: "13px" }}>Masukkan nomor WhatsApp kamu untuk melihat semua riwayat transaksi</p>
        </div>

        {/* SEARCH BOX */}
        <div style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
          <label style={{ fontSize: "11px", color: "#555570", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>NOMOR WHATSAPP</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <div style={{ position: "absolute", left: "1px", top: "1px", bottom: "1px", display: "flex", alignItems: "center", padding: "0 14px", background: "#0d0d1c", borderRight: "1px solid #1a1a2e", color: "#555570", fontSize: "13px", borderRadius: "4px 0 0 4px", zIndex: 1 }}>+62</div>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                onKeyDown={(e) => e.key === "Enter" && handleCari()}
                placeholder="8123456789"
                style={{ width: "100%", background: "#0d0d1c", border: `1px solid ${focusedInput ? "#00e676" : whatsapp ? "rgba(0,230,118,0.3)" : "#1a1a2e"}`, color: "white", padding: "13px 16px 13px 62px", fontSize: "14px", outline: "none", boxSizing: "border-box", borderRadius: "4px", fontFamily: "sans-serif", transition: "border-color 0.2s" }}
              />
            </div>
            <button onClick={handleCari} disabled={loading}
              style={{ padding: "0 24px", background: "#00e676", border: "none", color: "#000", fontWeight: "700", fontSize: "13px", letterSpacing: "1px", cursor: "pointer", borderRadius: "4px", flexShrink: 0, opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}>
              {loading ? "..." : "CARI"}
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "#333355", marginTop: "8px" }}>📱 Gunakan nomor yang sama saat melakukan top up</p>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
            <p style={{ color: "#555570", fontSize: "13px" }}>Mengambil data...</p>
          </div>
        )}

        {/* TIDAK ADA ORDER */}
        {searched && !loading && orders.length === 0 && (
          <div style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>📭</p>
            <p style={{ fontSize: "16px", fontWeight: "700", marginBottom: "6px" }}>Tidak ada riwayat order</p>
            <p style={{ fontSize: "13px", color: "#555570", marginBottom: "20px" }}>Nomor WA ini belum pernah melakukan transaksi, atau nomor yang dimasukkan berbeda.</p>
            <Link href="/" style={{ display: "inline-block", padding: "10px 24px", background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.3)", color: "#00e676", textDecoration: "none", fontSize: "13px", fontWeight: "600", borderRadius: "4px" }}>
              Top Up Sekarang →
            </Link>
          </div>
        )}

        {/* DAFTAR ORDER */}
        {orders.length > 0 && (
          <div>
            {/* SUMMARY */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "Total Order", value: orders.length, color: "white" },
                { label: "Sukses", value: orders.filter(o => o.status === "success").length, color: "#00e676" },
                { label: "Pending", value: orders.filter(o => o.status === "pending").length, color: "#ffaa00" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
                  <p style={{ fontSize: "22px", fontWeight: "800", color, marginBottom: "4px" }}>{value}</p>
                  <p style={{ fontSize: "11px", color: "#555570", letterSpacing: "1px" }}>{label}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "11px", color: "#555570", letterSpacing: "2px", marginBottom: "12px" }}>
              MENAMPILKAN {orders.length} TRANSAKSI
            </p>

            {/* ORDER CARDS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {orders.map((order) => {
                const status = getStatus(order.status);
                return (
                  <div key={order.order_id} style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "8px", overflow: "hidden", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#333355"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a2e"}
                  >
                    {/* STATUS BAR */}
                    <div style={{ height: "3px", background: status.color, opacity: 0.6 }} />

                    <div style={{ padding: "16px 20px" }}>
                      {/* TOP ROW */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <p style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "700", color: "#00e676", letterSpacing: "1px" }}>{order.order_id}</p>
                            <span style={{ fontSize: "10px", color: status.color, background: status.bg, border: `1px solid ${status.border}`, padding: "2px 8px", borderRadius: "20px" }}>
                              {status.icon} {status.label}
                            </span>
                          </div>
                          <p style={{ fontSize: "11px", color: "#333355" }}>{formatDate(order.created_at)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "18px", fontWeight: "800", color: "#00e676" }}>Rp {parseInt(order.price).toLocaleString("id-ID")}</p>
                          <p style={{ fontSize: "11px", color: "#555570" }}>{order.method}</p>
                        </div>
                      </div>

                      {/* DETAIL ROW */}
                      <div style={{ background: "#0d0d1c", border: "1px solid #1a1a2e", borderRadius: "6px", padding: "12px 14px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: "700", marginBottom: "2px" }}>{order.game}</p>
                          <p style={{ fontSize: "12px", color: "#555570" }}>{order.package}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "11px", color: "#555570", marginBottom: "2px" }}>User ID</p>
                          <p style={{ fontSize: "12px", fontWeight: "600", fontFamily: "monospace" }}>{order.user_id}</p>
                        </div>
                      </div>

                      {/* VOUCHER INFO */}
                      {order.voucher && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                          <span style={{ fontSize: "12px" }}>🎟️</span>
                          <span style={{ fontSize: "12px", color: "#00e676" }}>Voucher <strong>{order.voucher}</strong> digunakan (-{order.discount}%)</span>
                        </div>
                      )}

                      {/* PENDING WARNING */}
                      {order.status === "pending" && (
                        <div style={{ background: "rgba(255,170,0,0.05)", border: "1px solid rgba(255,170,0,0.2)", borderRadius: "6px", padding: "10px 14px", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                          <span>⚠️</span>
                          <p style={{ fontSize: "12px", color: "#ffaa00" }}>Pembayaran belum dikonfirmasi. Hubungi admin jika sudah bayar.</p>
                        </div>
                      )}

                      {/* HUBUNGI ADMIN BUTTON */}
                      <button onClick={() => handleHubungiAdmin(order)}
                        style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid rgba(0,230,118,0.25)", color: "#00e676", fontSize: "12px", fontWeight: "600", cursor: "pointer", borderRadius: "6px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,230,118,0.06)"; e.currentTarget.style.borderColor = "#00e676"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(0,230,118,0.25)"; }}>
                        <span>💬</span> Hubungi Admin via WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1a1a2e", padding: "24px", textAlign: "center", color: "#333355", fontSize: "12px", letterSpacing: "2px", marginTop: "40px" }}>
        © 2026 AYSIELTOPUP — ALL RIGHTS RESERVED
      </footer>
    </main>
  );
}