import React, { useState, useEffect, useMemo } from "react";
import { getUsers, updateUserStatus, deleteUser } from "../../api/adminService";

const PageBanner = ({ count }) => (
  <div style={{ background: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 50%,#3b82f6 100%)", color: "#fff", padding: "3rem 0 4rem", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: "-20%", right: "-5%", width: 280, height: 280, borderRadius: "50%", background: "rgba(59,130,246,0.15)", filter: "blur(60px)" }} />
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 2 }}>
      <div style={{ fontSize: "2.8rem", marginBottom: "0.5rem" }}>👥</div>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-1px", marginBottom: "0.3rem" }}>Users Management</h1>
      <p style={{ color: "rgba(255,255,255,0.65)", margin: 0 }}>Total registered students: <strong style={{ color: "#93c5fd" }}>{count}</strong></p>
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <svg viewBox="0 0 1440 48" fill="none" style={{ display: "block" }}><path d="M0,32 C360,0 1080,48 1440,12 L1440,48 L0,48 Z" fill="#f8fafc" /></svg>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = { active: { bg: "#d1fae5", c: "#065f46", l: "Active" }, suspended: { bg: "#fef3c7", c: "#92400e", l: "Suspended" }, pending: { bg: "#f1f5f9", c: "#475569", l: "Pending" } };
  const s = map[status?.toLowerCase()] || { bg: "#f1f5f9", c: "#475569", l: status };
  return <span style={{ background: s.bg, color: s.c, padding: "0.2rem 0.65rem", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>{s.l}</span>;
};

const Btn = ({ children, onClick, color, bg, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ background: bg, color, border: "none", borderRadius: 8, padding: "0.35rem 0.8rem", fontWeight: 600, fontSize: "0.78rem", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "filter 0.15s" }}
    onMouseEnter={e => !disabled && (e.currentTarget.style.filter = "brightness(0.9)")}
    onMouseLeave={e => e.currentTarget.style.filter = ""}
  >{children}</button>
);

const Modal = ({ open, onClose, title, children }) => open ? (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
    <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface,#fff)", borderRadius: 16, padding: "1.8rem", maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
        <h4 style={{ fontWeight: 800, color: "var(--text,#1e293b)", margin: 0 }}>{title}</h4>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--text-2,#475569)", lineHeight: 1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
) : null;

export default function UsersManagement({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setUsers(await getUsers()); }
      catch { toast?.error("Failed to load users"); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    return users
      .filter(u => filterStatus === "all" || u.status?.toLowerCase() === filterStatus)
      .filter(u => [u.name, u.email, u.studentId].join(" ").toLowerCase().includes(search.toLowerCase()));
  }, [users, search, filterStatus]);

  const handleToggle = async (u) => {
    const next = u.status === "active" ? "suspended" : "active";
    try {
      setUsers(p => p.map(x => x._id === u._id ? { ...x, status: next } : x));
      await updateUserStatus(u._id, next);
      toast?.success(`User ${next === "active" ? "activated" : "suspended"}`);
    } catch {
      setUsers(p => p.map(x => x._id === u._id ? { ...x, status: u.status } : x));
      toast?.error("Failed to update user");
    }
  };

  const doDelete = async () => {
    try {
      await deleteUser(deleteTarget._id);
      setUsers(p => p.filter(u => u._id !== deleteTarget._id));
      toast?.success("User deleted");
      setDeleteTarget(null);
    } catch { toast?.error("Delete failed"); }
  };

  const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";
  const colors = ["#6366f1","#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4"];
  const avatarColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length];

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><div style={{ width: 44, height: 44, border: "4px solid var(--border,#e2e8f0)", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ background: "var(--bg,#f8fafc)", minHeight: "100vh" }}>
      <PageBanner count={users.length} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        {/* Summary chips */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.8rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total", value: users.length, bg: "#e0e7ff", color: "#3730a3" },
            { label: "Active", value: users.filter(u => u.status === "active").length, bg: "#d1fae5", color: "#065f46" },
            { label: "Suspended", value: users.filter(u => u.status === "suspended").length, bg: "#fef3c7", color: "#92400e" },
          ].map(({ label, value, bg, color }) => (
            <div key={label} style={{ background: "var(--surface,#fff)", borderRadius: 12, padding: "0.9rem 1rem", border: "1.5px solid var(--border,#e2e8f0)", display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color, fontSize: "1.1rem" }}>{value}</div>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-2,#475569)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
              style={{ width: "100%", padding: "0.65rem 1rem 0.65rem 2.5rem", borderRadius: 10, border: "1.5px solid var(--border,#e2e8f0)", background: "var(--surface,#fff)", color: "var(--text,#1e293b)", fontSize: "0.9rem", outline: "none" }} />
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {["all","active","suspended"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "0.4rem 1rem", borderRadius: 20, border: "1.5px solid", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s",
              background: filterStatus === s ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "var(--surface,#fff)",
              color: filterStatus === s ? "#fff" : "var(--text-2,#475569)",
              borderColor: filterStatus === s ? "#3b82f6" : "var(--border,#e2e8f0)",
            }}>{s}</button>
          ))}
          <span style={{ marginLeft: "auto", alignSelf: "center", color: "var(--text-2,#475569)", fontSize: "0.85rem", fontWeight: 600 }}>{filtered.length} users</span>
        </div>

        {/* Table */}
        <div style={{ background: "var(--surface,#fff)", borderRadius: 14, border: "1.5px solid var(--border,#e2e8f0)", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
              <thead>
                <tr style={{ background: "var(--hover-bg,#f8f9fa)", borderBottom: "1.5px solid var(--border,#e2e8f0)" }}>
                  {["User","Email","Student ID","Status","Actions"].map(h => (
                    <th key={h} style={{ padding: "0.8rem 1rem", textAlign: h === "Actions" ? "center" : "left", fontWeight: 700, fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-2,#475569)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--text-2,#475569)" }}>No users found</td></tr>
                ) : filtered.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border,#e2e8f0)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg,#f8f9fa)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${avatarColor(u.name)},${avatarColor(u.name)}bb)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>{initials(u.name)}</div>
                        <span style={{ fontWeight: 600, color: "var(--text,#1e293b)" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "var(--text-2,#475569)", fontSize: "0.84rem" }}>{u.email}</td>
                    <td style={{ padding: "0.85rem 1rem", color: "var(--text-2,#475569)", fontFamily: "monospace", fontSize: "0.82rem" }}>{u.studentId || "—"}</td>
                    <td style={{ padding: "0.85rem 1rem" }}><StatusBadge status={u.status} /></td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                        <Btn onClick={() => handleToggle(u)} color={u.status === "active" ? "#92400e" : "#065f46"} bg={u.status === "active" ? "#fef3c7" : "#d1fae5"}>
                          {u.status === "active" ? "Suspend" : "Activate"}
                        </Btn>
                        <Btn onClick={() => setDeleteTarget(u)} color="#991b1b" bg="#fee2e2">🗑️</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="⚠️ Delete User">
        <p style={{ color: "var(--text-2,#475569)", marginBottom: "1.5rem" }}>
          Permanently delete <strong style={{ color: "var(--text,#1e293b)" }}>{deleteTarget?.name}</strong>? All their data will be removed.
        </p>
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
          <Btn onClick={() => setDeleteTarget(null)} color="var(--text-muted)" bg="var(--hover,#f8fafc)">Cancel</Btn>
          <Btn onClick={doDelete} color="#991b1b" bg="#fee2e2">🗑️ Delete</Btn>
        </div>
      </Modal>
    </div>
  );
}
