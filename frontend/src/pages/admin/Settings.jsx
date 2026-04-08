import React, { useState, useEffect } from "react";

const PageBanner = () => (
  <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#3730a3 50%,#6366f1 100%)", color: "#fff", padding: "3rem 0 4rem", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: "-20%", right: "-5%", width: 260, height: 260, borderRadius: "50%", background: "rgba(139,92,246,0.15)", filter: "blur(60px)" }} />
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 2 }}>
      <div style={{ fontSize: "2.8rem", marginBottom: "0.5rem" }}>⚙️</div>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-1px", marginBottom: "0.3rem" }}>Settings</h1>
      <p style={{ color: "rgba(255,255,255,0.65)", margin: 0 }}>Manage platform preferences and system configuration.</p>
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
      <svg viewBox="0 0 1440 48" fill="none" style={{ display: "block" }}><path d="M0,32 C360,0 1080,48 1440,12 L1440,48 L0,48 Z" fill="#f8fafc" /></svg>
    </div>
  </div>
);

const SettingCard = ({ icon, title, desc, children, badge, badgeColor }) => (
  <div style={{ background: "var(--surface,#fff)", borderRadius: 14, border: "1.5px solid var(--border,#e2e8f0)", padding: "1.8rem", marginBottom: "1.2rem", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.2rem" }}>
      <div style={{ fontSize: "1.6rem", flexShrink: 0, lineHeight: 1 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
          <h5 style={{ fontWeight: 700, color: "var(--text,#1e293b)", margin: 0, fontSize: "1rem" }}>{title}</h5>
          {badge && (
            <span style={{
              background: badgeColor === "green" ? "#d1fae5" : "#fef3c7",
              color:      badgeColor === "green" ? "#065f46" : "#92400e",
              padding: "0.15rem 0.55rem", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700
            }}>{badge}</span>
          )}
        </div>
        <p style={{ color: "var(--text-2,#475569)", fontSize: "0.85rem", margin: 0 }}>{desc}</p>
      </div>
    </div>
    {children}
  </div>
);

const Toggle = ({ value, onChange, label, sublabel }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0", gap: "1rem" }}>
    <div>
      <span style={{ fontSize: "0.9rem", color: "var(--text,#1e293b)", fontWeight: 500 }}>{label}</span>
      {sublabel && <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.15rem" }}>{sublabel}</div>}
    </div>
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative",
      background: value ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "var(--border,#e2e8f0)",
      transition: "all 0.25s", flexShrink: 0,
    }}>
      <span style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </button>
  </div>
);

const Warning = ({ children }) => (
  <div style={{ marginTop: "0.9rem", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "0.7rem 1rem", fontSize: "0.82rem", color: "#92400e", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
    <span>⚠️</span><span>{children}</span>
  </div>
);

const Info = ({ children }) => (
  <div style={{ marginTop: "0.9rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "0.7rem 1rem", fontSize: "0.82rem", color: "#1e40af", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
    <span>ℹ️</span><span>{children}</span>
  </div>
);

const UPCOMING = [
  { icon: "📱", title: "SMS Alerts",    desc: "Send SMS notifications to students when their lost item is posted", color: "#3b82f6" },
  { icon: "🏷️", title: "QR Code Labels", desc: "Generate printable QR code labels for found items in storage",    color: "#8b5cf6" },
  { icon: "🤖", title: "AI Matching",   desc: "Automatically suggest matching lost/found pairs using AI similarity", color: "#ef4444" },
];

const api = {
  get: (key)        => fetch(`/api/settings/${key}`).then(r => r.json()),
  put: (key, value) => fetch(`/api/settings/${key}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }) }),
};

export default function Settings({ toast }) {
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  // ── Notifications ──────────────────────────────────────────────
  const [emailNotif,    setEmailNotif]    = useState(true);
  const [requireVerify, setRequireVerify] = useState(true);

  // ── Access Control ─────────────────────────────────────────────
  const [publicBrowse, setPublicBrowse] = useState(false);

  // ── Data Retention ─────────────────────────────────────────────
  const [dataRetention,     setDataRetention]     = useState(false);
  const [dataRetentionDays, setDataRetentionDays] = useState(90);

  // ── Claim Auto-Removal ─────────────────────────────────────────
  const [claimAutoDelete, setClaimAutoDelete] = useState(false);
  const [claimDeleteDays, setClaimDeleteDays] = useState(10);

  // Load all settings from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const [
          emailRes, verifyRes,
          publicRes,
          retentionEnabledRes, retentionDaysRes,
          claimEnabledRes, claimDaysRes,
        ] = await Promise.all([
          api.get("emailNotif"),
          api.get("requireVerify"),
          api.get("publicBrowse"),
          api.get("dataRetentionEnabled"),
          api.get("dataRetentionDays"),
          api.get("claimAutoDeleteEnabled"),
          api.get("claimAutoDeleteDays"),
        ]);

        if (emailRes.value           !== null) setEmailNotif(!!emailRes.value);
        if (verifyRes.value          !== null) setRequireVerify(!!verifyRes.value);
        if (publicRes.value          !== null) setPublicBrowse(!!publicRes.value);
        if (retentionEnabledRes.value !== null) setDataRetention(!!retentionEnabledRes.value);
        if (retentionDaysRes.value   !== null) setDataRetentionDays(Number(retentionDaysRes.value));
        if (claimEnabledRes.value    !== null) setClaimAutoDelete(!!claimEnabledRes.value);
        if (claimDaysRes.value       !== null) setClaimDeleteDays(Number(claimDaysRes.value));
      } catch {
        toast?.error("Could not load settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put("emailNotif",            emailNotif),
        api.put("requireVerify",         requireVerify),
        api.put("publicBrowse",          publicBrowse),
        api.put("dataRetentionEnabled",  dataRetention),
        api.put("dataRetentionDays",     dataRetentionDays),
        api.put("claimAutoDeleteEnabled", claimAutoDelete),
        api.put("claimAutoDeleteDays",   claimDeleteDays),
      ]);
      toast?.success("Settings saved successfully!");
    } catch {
      toast?.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: "var(--bg,#f8fafc)", minHeight: "100vh" }}>
      <PageBanner />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "1.5rem" }}>

        {/* ── Notifications ─────────────────────────────────────── */}
        <SettingCard icon="🔔" title="Notifications" desc="Control how the system communicates with students and staff.">
          <Toggle value={emailNotif}    onChange={setEmailNotif}    label="Send email when a claim is submitted" />
          <Toggle value={requireVerify} onChange={setRequireVerify} label="Require admin approval before notifying owner" />
        </SettingCard>

        {/* ── Access Control ────────────────────────────────────── */}
        <SettingCard
          icon="🔓" title="Access Control"
          desc="Manage what students can see before logging in."
          badge={publicBrowse ? "Public" : "Private"}
          badgeColor={publicBrowse ? "green" : "yellow"}
        >
          <Toggle
            value={publicBrowse}
            onChange={setPublicBrowse}
            label="Allow public browsing of found items (no login required)"
            sublabel="When ON, the found items list is accessible without a student account."
          />
          {publicBrowse
            ? <Info>Found items are currently <strong>publicly visible</strong>. Anyone can browse without logging in. Submitting claims still requires an account.</Info>
            : <Info>Found items are currently <strong>private</strong>. Students must log in to view them.</Info>
          }
        </SettingCard>

        {/* ── Data Retention ────────────────────────────────────── */}
        <SettingCard
          icon="🗑️" title="Data Retention"
          desc="Automatically clean up old, unresolved lost & found items to keep the database lean."
          badge={dataRetention ? "Active" : null}
          badgeColor="green"
        >
          <Toggle
            value={dataRetention}
            onChange={setDataRetention}
            label="Auto-delete unresolved items after a set period"
            sublabel="Removes found items still marked 'Found' and all lost items older than the threshold."
          />
          {dataRetention && (
            <div style={{ marginTop: "1.2rem" }}>
              <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-2,#475569)", display: "block", marginBottom: "0.5rem" }}>
                Delete unresolved items older than:
                <span style={{ marginLeft: "0.5rem", fontWeight: 800, color: "#6366f1", fontSize: "0.95rem" }}>{dataRetentionDays} days</span>
              </label>
              <input
                type="range" min={30} max={365} step={30}
                value={dataRetentionDays}
                onChange={e => setDataRetentionDays(+e.target.value)}
                style={{ width: "100%", accentColor: "#6366f1", marginBottom: "0.4rem" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                <span>30 days</span><span>6 months</span><span>1 year</span>
              </div>
              <Warning>
                Items with no resolution older than <strong>{dataRetentionDays} days</strong> will be permanently deleted every hour. Claimed items are <strong>not</strong> affected — use Claim Auto-Removal for those.
              </Warning>
            </div>
          )}
        </SettingCard>

        {/* ── Claim Auto-Removal ────────────────────────────────── */}
        <SettingCard
          icon="⏳" title="Claim Auto-Removal"
          desc="Automatically delete claimed found items a set number of days after their claim is approved."
          badge={claimAutoDelete ? "Active" : null}
          badgeColor="green"
        >
          <Toggle
            value={claimAutoDelete}
            onChange={setClaimAutoDelete}
            label="Auto-remove claimed items after set days"
            sublabel="Runs every hour. Permanently deletes the found item and its claim record."
          />
          {claimAutoDelete && (
            <div style={{ marginTop: "1.2rem" }}>
              <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-2,#475569)", display: "block", marginBottom: "0.5rem" }}>
                Remove claimed item after:
                <span style={{ marginLeft: "0.5rem", fontWeight: 800, color: "#6366f1", fontSize: "0.95rem" }}>{claimDeleteDays} day{claimDeleteDays !== 1 ? "s" : ""}</span>
              </label>
              <input
                type="range" min={10} max={15} step={1}
                value={claimDeleteDays}
                onChange={e => setClaimDeleteDays(+e.target.value)}
                style={{ width: "100%", accentColor: "#6366f1", marginBottom: "0.4rem" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                <span>10 days</span><span>15 days</span>
              </div>
              <Warning>
                Any found item whose claim was approved more than <strong>{claimDeleteDays} day(s)</strong> ago will be permanently deleted. This action <strong>cannot be undone</strong>.
              </Warning>
            </div>
          )}
        </SettingCard>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving} style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
          border: "none", borderRadius: 12, padding: "0.9rem 2.5rem",
          fontWeight: 700, fontSize: "1rem", cursor: saving ? "wait" : "pointer",
          boxShadow: "0 6px 20px rgba(99,102,241,0.4)", transition: "all 0.2s",
          marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          {saving ? <>⏳ Saving…</> : <>💾 Save Settings</>}
        </button>

        {/* Upcoming features */}
        <h3 style={{ fontWeight: 800, color: "var(--text,#1e293b)", marginBottom: "1rem", fontSize: "1.1rem" }}>🚀 Coming Soon</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
          {UPCOMING.map(({ icon, title, desc, color }) => (
            <div key={title} style={{ background: "var(--surface,#fff)", borderRadius: 12, padding: "1.2rem", border: "1.5px solid var(--border,#e2e8f0)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
              <div style={{ fontWeight: 700, color: "var(--text,#1e293b)", fontSize: "0.9rem", marginBottom: "0.3rem" }}>{title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-2,#475569)", lineHeight: 1.5 }}>{desc}</div>
              <span style={{ display: "inline-block", marginTop: "0.7rem", background: "#fef3c7", color: "#92400e", padding: "0.15rem 0.55rem", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700 }}>In Development</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}