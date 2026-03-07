"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (username === "rejiel" && password === "akeisya123") {
      localStorage.setItem("admin_logged_in", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Username atau password salah!");
    }
  };

  return (
    <main style={{minHeight:"100vh",background:"#0a0a0f",backgroundImage:"linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>
      <div style={{width:"380px"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{fontSize:"22px",fontWeight:"800",letterSpacing:"4px",fontFamily:"monospace",color:"white"}}>
            TOPUP<span style={{color:"#00e676"}}>GAME</span>
          </div>
          <p style={{color:"#555570",fontSize:"12px",letterSpacing:"3px",marginTop:"8px",textTransform:"uppercase"}}>Admin Panel</p>
        </div>

        <div style={{background:"#111120",border:"1px solid #1a1a2e",clipPath:"polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,0 100%)",padding:"32px"}}>
          <div style={{marginBottom:"16px"}}>
            <label style={{fontSize:"11px",letterSpacing:"2px",color:"#555570",textTransform:"uppercase",display:"block",marginBottom:"8px"}}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              style={{width:"100%",background:"#0a0a0f",border:"1px solid #1a1a2e",color:"white",padding:"12px 16px",fontSize:"14px",outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"}}
            />
          </div>
          <div style={{marginBottom:"24px"}}>
            <label style={{fontSize:"11px",letterSpacing:"2px",color:"#555570",textTransform:"uppercase",display:"block",marginBottom:"8px"}}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Masukkan password"
              style={{width:"100%",background:"#0a0a0f",border:"1px solid #1a1a2e",color:"white",padding:"12px 16px",fontSize:"14px",outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"}}
            />
          </div>

          {error && <p style={{color:"#ff4444",fontSize:"12px",marginBottom:"16px",textAlign:"center"}}>{error}</p>}

          <button
            onClick={handleLogin}
            style={{width:"100%",padding:"14px",background:"#00e676",border:"none",color:"#000",fontWeight:"700",fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",cursor:"pointer",clipPath:"polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)"}}
          >
            Login
          </button>
        </div>

        <p style={{color:"#333355",fontSize:"11px",textAlign:"center",marginTop:"16px",letterSpacing:"1px"}}>
          Akses terbatas — hanya untuk admin
        </p>
      </div>
    </main>
  );
}