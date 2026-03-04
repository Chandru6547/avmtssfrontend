import { useState } from "react";
import { getToken } from "../utils/auth";
import "./CreateAdminPage.css";

export default function CreateAdminPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const createAdmin = async () => {
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("https://tssplatform.onrender.com/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message);
      } else {
        setMsg("✅ Admin created & email sent");
        setEmail("");
      }
    } catch {
      setMsg("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h2>Create Admin</h2>
        <p>Admin will receive email with temporary password</p>

        <input
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={createAdmin} disabled={loading}>
          {loading ? "Creating..." : "Create Admin"}
        </button>

        {msg && <p className="msg">{msg}</p>}
      </div>
    </div>
  );
}
