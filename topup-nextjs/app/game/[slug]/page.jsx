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
  const [whatsapp, setWhatsapp] = useState("");
  const [selected, setSelected] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [copied, setCopied] = useState(null);

  // Voucher states
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherData, setVoucherData] = useState(null);
  const [voucherError, setVoucherError] = useState("");

  if (!game) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "48px", marginBottom: "16px" }}>😔</p>
        <p style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Game tidak ditemukan</p>
        <Link href="/" style={{ color: "#00e676", fontSize: "13px" }}>← Kembali ke Home</Link>
      </div>
    </div>
  );

  const finalPrice = voucherData ? voucherData.finalPrice : selected?.price || 0;
  const discountAmount = voucherData ? voucherData.discountAmount : 0;

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleApplyVoucher = async () => {
    if (!selected) { setVoucherError("Pilih paket dulu sebelum pakai voucher!"); return; }
    if (!voucherCode.trim()) { setVoucherError("Masukkan kode voucher dulu!"); return; }
    setVoucherLoading(true);
    setVoucherError("");
    setVoucherData(null);

    try {
      const res = await fetch("/api/voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode, price: selected.price }),
      });
      const data = await res.json();
      if (data.valid) {
        setVoucherData(data);
      } else {
        setVoucherError(data.message);
      }
    } catch {
      setVoucherError("Gagal memverifikasi voucher");
    }
    setVoucherLoading(false);
  };

  const handleRemoveVoucher = () => {
    setVoucherData(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const sendWANotification = async (orderId) => {
    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp,
          orderId,
          game: game.name,
          packageName: selected.label,
          price: selected.price,
          finalPrice,
          userId,
          discount: voucherData?.discount || 0,
        }),
      });
    } catch (err) {
      console.error("WA notif gagal:", err);
    }
  };

  const handleBayar = async () => {
    if (!userId) { alert("Masukkan User ID dulu!"); return; }
    if (!whatsapp) { alert("Masukkan nomor WhatsApp dulu!"); return; }
    if (!selected) { alert("Pilih paket dulu!"); return; }
    if (!selectedMethod) { alert("Pilih metode pembayaran dulu!"); return; }
    setConfirming(true);

    const id = "TG-" + Date.now().toString().slice(-8).toUpperCase();

    try {
      const res = await fetch("/api/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, amount: finalPrice, game: game.name, userId, packageName: selected.label }),
      });
      const data = await res.json();

      if (data.token) {
        await supabase.from("order").insert([{
          order_id: id, game: game.name, user_id: userId, package: selected.label,
          price: finalPrice, method: selectedMethod, status: "pending", whatsapp,
          voucher: voucherData?.code || null, discount: voucherData?.discount || 0,
        }]);

        window.snap.pay(data.token, {
          onSuccess: async () => {
            await supabase.from("order").update({ status: "success" }).eq("order_id", id);
            await sendWANotification(id);
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
    await sendWANotification(orderId);
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
    { id: "QRIS", label: "QRIS", sub: "Semua E-Wallet", badge: "POPULER" },
    { id: "GoPay", label: "GoPay", sub: "Transfer ke nomor" },
    { id: "OVO", label: "OVO", sub: "Transfer ke nomor" },
    { id: "DANA", label: "DANA", sub: "Transfer ke nomor" },
    { id: "BCA", label: "Bank BCA", sub: "Virtual Account" },
    { id: "BRI", label: "Bank BRI", sub: "Virtual Account" },
    { id: "Mandiri", label: "Bank Mandiri", sub: "Virtual Account" },
  ];

  const methodIcons = {
    QRIS: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#00e676" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#00e676" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#00e676" strokeWidth="1.5"/><rect x="5" y="5" width="3" height="3" fill="#00e676"/><rect x="16" y="5" width="3" height="3" fill="#00e676"/><rect x="5" y="16" width="3" height="3" fill="#00e676"/><path d="M14 14h2v2h-2zM16 16h2v2h-2zM18 14h3v1h-3zM14 18h2v3h-2zM17 18h4v1h-4z" fill="#00e676"/></svg>),
    GoPay: (<div style={{width:28,height:28,borderRadius:"50%",background:"#00AED6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"800",color:"white"}}>GP</div>),
    OVO: (<div style={{width:28,height:28,borderRadius:"50%",background:"#4C3494",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"800",color:"white"}}>OVO</div>),
    DANA: (<div style={{width:28,height:28,borderRadius:"50%",background:"#118EEA",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"800",color:"white"}}>DANA</div>),
    BCA: (<div style={{width:28,height:28,borderRadius:"4px",background:"#005BAA",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"800",color:"white"}}>BCA</div>),
    BRI: (<div style={{width:28,height:28,borderRadius:"4px",background:"#003B7A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"800",color:"white"}}>BRI</div>),
    Mandiri: (<div style={{width:28,height:28,borderRadius:"4px",background:"#003087",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px",fontWeight:"800",color:"#F5A623"}}>MDR</div>),
  };

  const inputBase = {
    width: "100%", background: "#0d0d1c", border: "1px solid #1a1a2e", color: "white",
    padding: "13px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box",
    fontFamily: "sans-serif", transition: "border-color 0.2s", borderRadius: "4px",
  };

  const steps = ["Data Diri", "Pilih Paket", "Pembayaran"];

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", backgroundImage: "linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)", backgroundSize: "40px 40px", color: "white", fontFamily: "sans-serif" }}>

      {/* HEADER */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #1a1a2e", position: "sticky", top: 0, background: "rgba(10,10,15,0.97)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "4px", fontFamily: "monospace", color: "white" }}>
            AYSIEL<span style={{ color: "#00e676" }}>TOPUP</span>
          </div>
        </Link>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#555570", fontSize: "12px", textDecoration: "none", padding: "8px 14px", border: "1px solid #1a1a2e", borderRadius: "4px", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#00e676"; e.currentTarget.style.color = "#00e676"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a2e"; e.currentTarget.style.color = "#555570"; }}>
          ← Home
        </Link>
      </header>

      {/* GAME BANNER */}
      <div style={{ position: "relative", height: "180px", overflow: "hidden", borderBottom: "1px solid #1a1a2e" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0a0a0f 0%, #111120 50%, #0a0a0f 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 70% 50%, rgba(0,230,118,0.08) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 24px", maxWidth: "800px", margin: "0 auto", width: "100%", left: "50%", transform: "translateX(-50%)" }}>
          <div style={{ width: "96px", height: "96px", flexShrink: 0, overflow: "hidden", border: "2px solid #1a1a2e", borderRadius: "12px", boxShadow: "0 0 24px rgba(0,230,118,0.15)", marginRight: "20px" }}>
            <img src={game.image} alt={game.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "10px", color: "#00e676", background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)", padding: "2px 10px", letterSpacing: "2px", borderRadius: "2px" }}>TOP UP</span>
            </div>
            <h1 style={{ fontSize: "clamp(18px, 3vw, 26px)", fontWeight: "800", marginBottom: "4px" }}>{game.name}</h1>
            <p style={{ color: "#555570", fontSize: "13px", marginBottom: "10px" }}>{game.publisher}</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[["⚡", "Proses Instan"], ["🔒", "100% Aman"], ["🕒", "24/7 Online"]].map(([icon, label]) => (
                <span key={label} style={{ fontSize: "11px", color: "#888899", background: "rgba(255,255,255,0.04)", padding: "3px 10px", border: "1px solid #1a1a2e", borderRadius: "20px" }}>{icon} {label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px 100px" }}>

        {step === 1 && (
          <>
            {/* STEP INDICATOR */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px" }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: i === 0 ? "#00e676" : "#111120", border: `2px solid ${i === 0 ? "#00e676" : "#1a1a2e"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: i === 0 ? "#000" : "#333355" }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: "10px", color: i === 0 ? "#00e676" : "#333355", letterSpacing: "1px", whiteSpace: "nowrap" }}>{s}</span>
                  </div>
                  {i < steps.length - 1 && <div style={{ width: "50px", height: "1px", background: "#1a1a2e", margin: "0 6px", marginBottom: "18px" }} />}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gap: "16px" }}>

              {/* SECTION 1 - DATA DIRI */}
              <div style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,230,118,0.02)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#00e676", flexShrink: 0 }}>1</div>
                  <p style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#aaaacc", fontWeight: "600" }}>Masukkan Data Kamu</p>
                </div>
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "#555570", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>USER ID {game.name.toUpperCase()}</label>
                    <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
                      onFocus={() => setFocusedInput("userId")} onBlur={() => setFocusedInput(null)}
                      placeholder={`Masukkan User ID ${game.name}`}
                      style={{ ...inputBase, borderColor: focusedInput === "userId" ? "#00e676" : userId ? "rgba(0,230,118,0.3)" : "#1a1a2e" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#555570", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>NOMOR WHATSAPP</label>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: "1px", top: "1px", bottom: "1px", display: "flex", alignItems: "center", padding: "0 14px", background: "#0d0d1c", borderRight: "1px solid #1a1a2e", color: "#555570", fontSize: "13px", borderRadius: "4px 0 0 4px", zIndex: 1 }}>+62</div>
                      <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                        onFocus={() => setFocusedInput("wa")} onBlur={() => setFocusedInput(null)}
                        placeholder="8123456789"
                        style={{ ...inputBase, paddingLeft: "62px", borderColor: focusedInput === "wa" ? "#00e676" : whatsapp ? "rgba(0,230,118,0.3)" : "#1a1a2e" }} />
                    </div>
                    <p style={{ fontSize: "11px", color: "#333355", marginTop: "6px" }}>📱 Notifikasi otomatis akan dikirim ke WA ini setelah bayar</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2 - PILIH PAKET */}
              <div style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,230,118,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#00e676", flexShrink: 0 }}>2</div>
                    <p style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#aaaacc", fontWeight: "600" }}>Pilih Paket {game.currency}</p>
                  </div>
                  {selected && <span style={{ fontSize: "11px", color: "#00e676", background: "rgba(0,230,118,0.1)", padding: "3px 10px", borderRadius: "20px", border: "1px solid rgba(0,230,118,0.2)" }}>✓ Terpilih</span>}
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px" }}>
                    {game.nominals.map((n, i) => (
                      <div key={i} onClick={() => { setSelected(n); setVoucherData(null); setVoucherError(""); setVoucherCode(""); }}
                        style={{ padding: "14px 12px", border: selected?.label === n.label ? "1px solid #00e676" : "1px solid #1a1a2e", background: selected?.label === n.label ? "rgba(0,230,118,0.08)" : "#0d0d1c", cursor: "pointer", transition: "all 0.18s", borderRadius: "6px", position: "relative", overflow: "hidden" }}
                        onMouseEnter={e => { if (selected?.label !== n.label) { e.currentTarget.style.borderColor = "rgba(0,230,118,0.4)"; e.currentTarget.style.background = "rgba(0,230,118,0.03)"; } }}
                        onMouseLeave={e => { if (selected?.label !== n.label) { e.currentTarget.style.borderColor = "#1a1a2e"; e.currentTarget.style.background = "#0d0d1c"; } }}
                      >
                        {selected?.label === n.label && (
                          <div style={{ position: "absolute", top: "6px", right: "6px", width: "16px", height: "16px", borderRadius: "50%", background: "#00e676", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#000", fontWeight: "800" }}>✓</div>
                        )}
                        <p style={{ fontWeight: "700", fontSize: "13px", marginBottom: "6px", color: "white", lineHeight: "1.3", paddingRight: selected?.label === n.label ? "20px" : "0" }}>{n.label}</p>
                        <p style={{ color: "#00e676", fontSize: "13px", fontWeight: "700" }}>Rp {n.price.toLocaleString("id-ID")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3 - VOUCHER */}
              <div style={{ background: "#111120", border: voucherData ? "1px solid rgba(0,230,118,0.4)" : "1px solid #1a1a2e", borderRadius: "8px", overflow: "hidden", transition: "border-color 0.3s" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "space-between", background: voucherData ? "rgba(0,230,118,0.04)" : "rgba(0,230,118,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🎟️</div>
                    <p style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#aaaacc", fontWeight: "600" }}>Kode Voucher</p>
                  </div>
                  <span style={{ fontSize: "10px", color: "#555570", background: "#0d0d1c", padding: "2px 8px", borderRadius: "10px", border: "1px solid #1a1a2e" }}>OPSIONAL</span>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  {!voucherData ? (
                    <>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(""); }}
                          onFocus={() => setFocusedInput("voucher")}
                          onBlur={() => setFocusedInput(null)}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                          placeholder="Masukkan kode voucher..."
                          style={{ ...inputBase, borderColor: focusedInput === "voucher" ? "#00e676" : voucherError ? "rgba(255,68,68,0.5)" : "#1a1a2e", letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase" }}
                        />
                        <button onClick={handleApplyVoucher} disabled={voucherLoading || !voucherCode.trim()}
                          style={{ padding: "0 20px", background: voucherCode.trim() ? "rgba(0,230,118,0.15)" : "#0d0d1c", border: `1px solid ${voucherCode.trim() ? "#00e676" : "#1a1a2e"}`, color: voucherCode.trim() ? "#00e676" : "#333355", fontSize: "12px", fontWeight: "700", cursor: voucherCode.trim() ? "pointer" : "not-allowed", borderRadius: "4px", whiteSpace: "nowrap", letterSpacing: "1px", transition: "all 0.2s", flexShrink: 0 }}>
                          {voucherLoading ? "..." : "PAKAI"}
                        </button>
                      </div>
                      {voucherError && (
                        <p style={{ fontSize: "12px", color: "#ff4444", marginTop: "8px" }}>❌ {voucherError}</p>
                      )}
                      <p style={{ fontSize: "11px", color: "#333355", marginTop: "8px" }}>💡 Punya kode voucher? Masukkan di sini untuk dapat diskon</p>
                    </>
                  ) : (
                    <div style={{ background: "rgba(0,230,118,0.06)", border: "1px solid rgba(0,230,118,0.25)", borderRadius: "6px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "800", color: "#00e676", letterSpacing: "2px", fontFamily: "monospace" }}>{voucherData.code}</span>
                          <span style={{ fontSize: "10px", color: "#00e676", background: "rgba(0,230,118,0.15)", padding: "1px 8px", borderRadius: "10px" }}>-{voucherData.discount}%</span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#888899" }}>{voucherData.description}</p>
                        <p style={{ fontSize: "13px", color: "#00e676", fontWeight: "700", marginTop: "4px" }}>Hemat Rp {voucherData.discountAmount.toLocaleString("id-ID")}</p>
                      </div>
                      <button onClick={handleRemoveVoucher}
                        style={{ background: "transparent", border: "1px solid rgba(255,68,68,0.3)", color: "#ff6666", padding: "6px 12px", fontSize: "11px", cursor: "pointer", borderRadius: "4px", flexShrink: 0 }}>
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4 - METODE BAYAR */}
              <div style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,230,118,0.02)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#00e676", flexShrink: 0 }}>3</div>
                  <p style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#aaaacc", fontWeight: "600" }}>Metode Pembayaran</p>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: "10px", color: "#333355", letterSpacing: "2px", marginBottom: "8px", fontWeight: "600" }}>QRIS</p>
                  {methods.filter(m => m.id === "QRIS").map(m => (
                    <div key={m.id} onClick={() => setSelectedMethod(m.id)}
                      style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", border: selectedMethod === m.id ? "1px solid #00e676" : "1px solid #1a1a2e", background: selectedMethod === m.id ? "rgba(0,230,118,0.06)" : "#0d0d1c", marginBottom: "12px", cursor: "pointer", transition: "all 0.18s", borderRadius: "6px" }}
                      onMouseEnter={e => { if (selectedMethod !== m.id) e.currentTarget.style.borderColor = "rgba(0,230,118,0.3)"; }}
                      onMouseLeave={e => { if (selectedMethod !== m.id) e.currentTarget.style.borderColor = "#1a1a2e"; }}
                    >
                      <div style={{ width: "36px", height: "36px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{methodIcons[m.id]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ fontSize: "14px", fontWeight: "600" }}>{m.label}</p>
                          {m.badge && <span style={{ fontSize: "9px", color: "#00e676", background: "rgba(0,230,118,0.15)", padding: "1px 6px", letterSpacing: "1px", borderRadius: "2px" }}>{m.badge}</span>}
                        </div>
                        <p style={{ fontSize: "11px", color: "#555570" }}>{m.sub}</p>
                      </div>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${selectedMethod === m.id ? "#00e676" : "#333355"}`, background: selectedMethod === m.id ? "#00e676" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.18s" }}>
                        {selectedMethod === m.id && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#000" }} />}
                      </div>
                    </div>
                  ))}

                  <p style={{ fontSize: "10px", color: "#333355", letterSpacing: "2px", marginBottom: "8px", fontWeight: "600" }}>E-WALLET</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                    {methods.filter(m => ["GoPay", "OVO", "DANA"].includes(m.id)).map(m => (
                      <div key={m.id} onClick={() => setSelectedMethod(m.id)}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "16px 8px", border: selectedMethod === m.id ? "1px solid #00e676" : "1px solid #1a1a2e", background: selectedMethod === m.id ? "rgba(0,230,118,0.06)" : "#0d0d1c", cursor: "pointer", transition: "all 0.18s", borderRadius: "6px", position: "relative" }}
                        onMouseEnter={e => { if (selectedMethod !== m.id) e.currentTarget.style.borderColor = "rgba(0,230,118,0.3)"; }}
                        onMouseLeave={e => { if (selectedMethod !== m.id) e.currentTarget.style.borderColor = "#1a1a2e"; }}
                      >
                        {selectedMethod === m.id && <div style={{ position: "absolute", top: "6px", right: "6px", width: "14px", height: "14px", borderRadius: "50%", background: "#00e676", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#000", fontWeight: "800" }}>✓</div>}
                        {methodIcons[m.id]}
                        <span style={{ fontSize: "11px", fontWeight: "600", color: selectedMethod === m.id ? "#00e676" : "#888899" }}>{m.label}</span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: "10px", color: "#333355", letterSpacing: "2px", marginBottom: "8px", fontWeight: "600" }}>TRANSFER BANK</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    {methods.filter(m => ["BCA", "BRI", "Mandiri"].includes(m.id)).map(m => (
                      <div key={m.id} onClick={() => setSelectedMethod(m.id)}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "16px 8px", border: selectedMethod === m.id ? "1px solid #00e676" : "1px solid #1a1a2e", background: selectedMethod === m.id ? "rgba(0,230,118,0.06)" : "#0d0d1c", cursor: "pointer", transition: "all 0.18s", borderRadius: "6px", position: "relative" }}
                        onMouseEnter={e => { if (selectedMethod !== m.id) e.currentTarget.style.borderColor = "rgba(0,230,118,0.3)"; }}
                        onMouseLeave={e => { if (selectedMethod !== m.id) e.currentTarget.style.borderColor = "#1a1a2e"; }}
                      >
                        {selectedMethod === m.id && <div style={{ position: "absolute", top: "6px", right: "6px", width: "14px", height: "14px", borderRadius: "50%", background: "#00e676", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#000", fontWeight: "800" }}>✓</div>}
                        {methodIcons[m.id]}
                        <span style={{ fontSize: "11px", fontWeight: "600", color: selectedMethod === m.id ? "#00e676" : "#888899" }}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 2 - INSTRUKSI BAYAR */}
        {step === 2 && selectedMethod && (
          <div>
            <div style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#555570", letterSpacing: "2px", marginBottom: "4px" }}>METODE</p>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: "#00e676" }}>{selectedMethod}</p>
                </div>
                <span style={{ fontSize: "11px", color: "#ffaa00", background: "rgba(255,170,0,0.1)", border: "1px solid rgba(255,170,0,0.25)", padding: "6px 14px", borderRadius: "20px" }}>⏳ Menunggu</span>
              </div>
              <div style={{ background: "#0d0d1c", border: "1px solid #1a1a2e", borderRadius: "6px", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: voucherData ? "10px" : "0" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <img src={game.image} alt={game.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{game.name}</p>
                      <p style={{ fontSize: "11px", color: "#555570" }}>{selected?.label}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {voucherData && <p style={{ fontSize: "12px", color: "#555570", textDecoration: "line-through", marginBottom: "2px" }}>Rp {selected?.price.toLocaleString("id-ID")}</p>}
                    <p style={{ fontSize: "18px", fontWeight: "800", color: "#00e676" }}>Rp {finalPrice.toLocaleString("id-ID")}</p>
                    <p style={{ fontSize: "11px", color: "#555570" }}>+62{whatsapp}</p>
                  </div>
                </div>
                {voucherData && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "10px", borderTop: "1px solid #1a1a2e" }}>
                    <span style={{ fontSize: "12px" }}>🎟️</span>
                    <span style={{ fontSize: "12px", color: "#00e676" }}>Voucher <strong>{voucherData.code}</strong> (-{voucherData.discount}%) — Hemat Rp {discountAmount.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", color: "#555570", letterSpacing: "2px", marginBottom: "16px" }}>DETAIL PEMBAYARAN</p>

              {instruksi[selectedMethod]?.type === "qris" && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "13px", color: "#888899", marginBottom: "16px" }}>Scan QR Code dengan aplikasi e-wallet kamu</p>
                  <div style={{ display: "inline-block", padding: "16px", background: "white", borderRadius: "12px", marginBottom: "12px", boxShadow: "0 0 32px rgba(0,230,118,0.15)" }}>
                    <img src="/images/qris.png" alt="QRIS" style={{ width: "180px", height: "180px", objectFit: "contain", display: "block" }} />
                  </div>
                  <p style={{ fontSize: "12px", color: "#555570" }}>GoPay • OVO • DANA • ShopeePay • LinkAja • dll</p>
                </div>
              )}

              {instruksi[selectedMethod]?.type === "ewallet" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ background: "#0d0d1c", border: "1px solid #1a1a2e", borderRadius: "6px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#555570", marginBottom: "4px" }}>Nomor {selectedMethod}</p>
                      <p style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "2px", fontFamily: "monospace" }}>{instruksi[selectedMethod].number}</p>
                    </div>
                    <button onClick={() => copyText(instruksi[selectedMethod].number, "number")}
                      style={{ background: copied === "number" ? "#00e676" : "transparent", border: "1px solid #00e676", color: copied === "number" ? "#000" : "#00e676", padding: "8px 16px", fontSize: "12px", cursor: "pointer", borderRadius: "4px", fontWeight: "600", transition: "all 0.2s", flexShrink: 0, minWidth: "80px" }}>
                      {copied === "number" ? "✓ OK" : "Salin"}
                    </button>
                  </div>
                  <div style={{ background: "#0d0d1c", border: "1px solid rgba(0,230,118,0.2)", borderRadius: "6px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#555570", marginBottom: "4px" }}>Nominal Transfer</p>
                      <p style={{ fontSize: "20px", fontWeight: "800", color: "#00e676", fontFamily: "monospace" }}>Rp {finalPrice.toLocaleString("id-ID")}</p>
                    </div>
                    <button onClick={() => copyText(finalPrice.toString(), "amount")}
                      style={{ background: copied === "amount" ? "#00e676" : "transparent", border: "1px solid #00e676", color: copied === "amount" ? "#000" : "#00e676", padding: "8px 16px", fontSize: "12px", cursor: "pointer", borderRadius: "4px", fontWeight: "600", transition: "all 0.2s", flexShrink: 0, minWidth: "80px" }}>
                      {copied === "amount" ? "✓ OK" : "Salin"}
                    </button>
                  </div>
                </div>
              )}

              {instruksi[selectedMethod]?.type === "bank" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ background: "#0d0d1c", border: "1px solid #1a1a2e", borderRadius: "6px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#555570", marginBottom: "4px" }}>{selectedMethod} Virtual Account</p>
                      <p style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "3px", fontFamily: "monospace" }}>{instruksi[selectedMethod].number}</p>
                    </div>
                    <button onClick={() => copyText(instruksi[selectedMethod].number, "number")}
                      style={{ background: copied === "number" ? "#00e676" : "transparent", border: "1px solid #00e676", color: copied === "number" ? "#000" : "#00e676", padding: "8px 16px", fontSize: "12px", cursor: "pointer", borderRadius: "4px", fontWeight: "600", transition: "all 0.2s", flexShrink: 0, minWidth: "80px" }}>
                      {copied === "number" ? "✓ OK" : "Salin"}
                    </button>
                  </div>
                  <div style={{ background: "#0d0d1c", border: "1px solid rgba(0,230,118,0.2)", borderRadius: "6px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#555570", marginBottom: "4px" }}>Nominal Transfer</p>
                      <p style={{ fontSize: "20px", fontWeight: "800", color: "#00e676", fontFamily: "monospace" }}>Rp {finalPrice.toLocaleString("id-ID")}</p>
                    </div>
                    <button onClick={() => copyText(finalPrice.toString(), "amount")}
                      style={{ background: copied === "amount" ? "#00e676" : "transparent", border: "1px solid #00e676", color: copied === "amount" ? "#000" : "#00e676", padding: "8px 16px", fontSize: "12px", cursor: "pointer", borderRadius: "4px", fontWeight: "600", transition: "all 0.2s", flexShrink: 0, minWidth: "80px" }}>
                      {copied === "amount" ? "✓ OK" : "Salin"}
                    </button>
                  </div>
                  <div style={{ background: "rgba(255,170,0,0.05)", border: "1px solid rgba(255,170,0,0.2)", borderRadius: "6px", padding: "12px 16px", display: "flex", gap: "8px" }}>
                    <span>⚠️</span>
                    <p style={{ fontSize: "12px", color: "#ffaa00" }}>Transfer tepat sesuai nominal sampai angka terakhir!</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={handleSudahBayar}
                style={{ width: "100%", padding: "16px", background: "#00e676", border: "none", color: "#000", fontWeight: "700", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", borderRadius: "6px" }}>
                ✅ Saya Sudah Bayar
              </button>
              <button onClick={() => setStep(1)}
                style={{ width: "100%", padding: "13px", background: "transparent", border: "1px solid #1a1a2e", color: "#555570", fontSize: "13px", cursor: "pointer", borderRadius: "6px", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#333355"; e.currentTarget.style.color = "#888899"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a2e"; e.currentTarget.style.color = "#555570"; }}>
                ← Kembali & Ubah Pesanan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM BAR */}
      {step === 1 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,10,15,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid #1a1a2e", padding: "14px 20px", zIndex: 50 }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {selected ? (
                <>
                  <p style={{ fontSize: "11px", color: "#555570", marginBottom: "2px" }}>Total Pembayaran</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {voucherData && <p style={{ fontSize: "13px", color: "#555570", textDecoration: "line-through" }}>Rp {selected.price.toLocaleString("id-ID")}</p>}
                    <p style={{ fontSize: "20px", fontWeight: "800", color: "#00e676", lineHeight: 1 }}>Rp {finalPrice.toLocaleString("id-ID")}</p>
                    {voucherData && <span style={{ fontSize: "10px", color: "#00e676", background: "rgba(0,230,118,0.15)", padding: "1px 6px", borderRadius: "10px" }}>-{voucherData.discount}%</span>}
                  </div>
                  <p style={{ fontSize: "11px", color: "#555570", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.label} · {selectedMethod || "Pilih metode dulu"}</p>
                </>
              ) : (
                <p style={{ fontSize: "13px", color: "#333355" }}>Lengkapi form untuk melanjutkan</p>
              )}
            </div>
            <button onClick={handleBayar} disabled={confirming || !selected || !userId || !whatsapp || !selectedMethod}
              style={{ padding: "14px 24px", background: selected && userId && whatsapp && selectedMethod ? "#00e676" : "#111120", border: `1px solid ${selected && userId && whatsapp && selectedMethod ? "#00e676" : "#1a1a2e"}`, color: selected && userId && whatsapp && selectedMethod ? "#000" : "#333355", fontWeight: "700", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", cursor: selected && userId && whatsapp && selectedMethod ? "pointer" : "not-allowed", borderRadius: "6px", transition: "all 0.2s", flexShrink: 0, opacity: confirming ? 0.7 : 1 }}>
              {confirming ? "Memproses..." : "Bayar Sekarang →"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUKSES */}
      {success && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px", backdropFilter: "blur(8px)" }}>
          <div style={{ background: "#111120", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "40px 32px", textAlign: "center", maxWidth: "400px", width: "100%", boxShadow: "0 0 60px rgba(0,230,118,0.1)" }}>
            <div style={{ width: "72px", height: "72px", background: "rgba(0,230,118,0.12)", border: "2px solid #00e676", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>✅</div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>Pembayaran Berhasil!</h2>
            <p style={{ color: "#555570", fontSize: "13px", marginBottom: "4px" }}>{selected?.label} untuk {game.name} berhasil diproses.</p>
            <p style={{ color: "#00e676", fontSize: "13px", marginBottom: "4px" }}>📱 Notifikasi WA dikirim ke +62{whatsapp}</p>
            {voucherData && <p style={{ color: "#888899", fontSize: "12px", marginBottom: "16px" }}>🎟️ Voucher {voucherData.code} berhasil digunakan</p>}
            <div style={{ background: "#0a0a0f", border: "1px solid rgba(0,230,118,0.2)", borderRadius: "6px", padding: "14px", marginBottom: "24px" }}>
              <p style={{ fontSize: "10px", color: "#555570", marginBottom: "4px", letterSpacing: "2px" }}>ORDER ID</p>
              <p style={{ fontFamily: "monospace", color: "#00e676", fontSize: "18px", fontWeight: "700", letterSpacing: "3px" }}>{orderId}</p>
            </div>
            <button onClick={() => router.push("/")}
              style={{ width: "100%", padding: "14px", background: "#00e676", border: "none", color: "#000", fontWeight: "700", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", borderRadius: "6px" }}>
              Kembali ke Home
            </button>
          </div>
        </div>
      )}
    </main>
  );
}