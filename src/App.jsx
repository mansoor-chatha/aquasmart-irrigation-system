import { useState, useEffect, useCallback } from "react";

const ZONES = [
  { id: 1, name: "Front Lawn", icon: "🌿", area: "120 m²", type: "Grass" },
  { id: 2, name: "Garden Beds", icon: "🌸", area: "45 m²", type: "Flowers" },
  { id: 3, name: "Backyard", icon: "🌳", area: "200 m²", type: "Mixed" },
  { id: 4, name: "Vegetable Patch", icon: "🥦", area: "30 m²", type: "Vegetables" },
  { id: 5, name: "Side Path", icon: "🌱", area: "25 m²", type: "Shrubs" },
  { id: 6, name: "Greenhouse", icon: "🪴", area: "18 m²", type: "Indoor" },
];

const SCHEDULES = [
  { id: 1, zone: 1, time: "06:00", duration: 20, days: ["Mon", "Wed", "Fri"], active: true },
  { id: 2, zone: 3, time: "07:00", duration: 30, days: ["Tue", "Thu", "Sat"], active: true },
  { id: 3, zone: 4, time: "18:00", duration: 15, days: ["Mon", "Wed", "Fri", "Sun"], active: false },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const weatherData = {
  temp: 24,
  humidity: 62,
  condition: "Partly Cloudy",
  rainChance: 15,
  wind: 12,
  forecast: [
    { day: "Today", icon: "⛅", high: 24, low: 17, rain: 15 },
    { day: "Tue", icon: "☀️", high: 27, low: 18, rain: 5 },
    { day: "Wed", icon: "🌧️", high: 19, low: 14, rain: 80 },
    { day: "Thu", icon: "⛅", high: 22, low: 15, rain: 25 },
    { day: "Fri", icon: "☀️", high: 26, low: 17, rain: 8 },
  ],
};

function Gauge({ value, max, color, label, unit }) {
  const pct = Math.min(value / max, 1);
  const angle = pct * 180 - 90;
  const r = 40, cx = 50, cy = 55;
  const toXY = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [sx, sy] = toXY(-180);
  const [ex, ey] = toXY(0);
  const [nx, ny] = toXY(angle);
  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 100 65" width="100" height="65">
        <path d={`M${sx},${sy} A${r},${r} 0 0,1 ${ex},${ey}`} fill="none" stroke="#1a2a1a" strokeWidth="8" strokeLinecap="round" />
        <path d={`M${sx},${sy} A${r},${r} 0 0,1 ${nx},${ny}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#e8f5e8" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill={color} />
      </svg>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: -8 }}>{value}<span style={{ fontSize: 12, color: "#7aab7a" }}>{unit}</span></div>
      <div style={{ fontSize: 11, color: "#5a8a5a", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function WaterUsageBar({ day, liters, max }) {
  const pct = (liters / max) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ width: 28, fontSize: 11, color: "#5a8a5a", textAlign: "right" }}>{day}</span>
      <div style={{ flex: 1, height: 10, background: "#0d1f0d", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #2d7a2d, #5abf5a)", borderRadius: 5, transition: "width 0.5s" }} />
      </div>
      <span style={{ width: 38, fontSize: 11, color: "#7aab7a", textAlign: "right" }}>{liters}L</span>
    </div>
  );
}

export default function IrrigationApp() {
  const [tab, setTab] = useState("dashboard");
  const [zones, setZones] = useState(ZONES.map(z => ({ ...z, active: false, moisture: Math.floor(Math.random() * 40) + 30, flow: 0 })));
  const [schedules, setSchedules] = useState(SCHEDULES);
  const [autoMode, setAutoMode] = useState(true);
  const [rainSkip, setRainSkip] = useState(true);
  const [totalToday, setTotalToday] = useState(124);
  const [activeTimer, setActiveTimer] = useState({});
  const [newSched, setNewSched] = useState({ zone: 1, time: "06:00", duration: 15, days: [] });
  const [showAddSched, setShowAddSched] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleZone = useCallback((id) => {
    setZones(prev => prev.map(z => {
      if (z.id !== id) return z;
      const next = !z.active;
      if (next) {
        setActiveTimer(t => ({ ...t, [id]: 10 }));
        setTotalToday(v => v + 2);
        notify(`${z.name} started`);
      } else {
        setActiveTimer(t => { const n = { ...t }; delete n[id]; return n; });
        notify(`${z.name} stopped`, "info");
      }
      return { ...z, active: next, flow: next ? Math.floor(Math.random() * 5) + 8 : 0 };
    }));
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveTimer(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] -= 1;
          if (next[id] <= 0) {
            delete next[id];
            setZones(z => z.map(zn => zn.id === +id ? { ...zn, active: false, flow: 0 } : zn));
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setZones(prev => prev.map(z => ({
        ...z,
        moisture: z.active ? Math.min(z.moisture + 1, 100) : Math.max(z.moisture - 0.1, 10)
      })));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const moistureColor = (m) => m < 30 ? "#e05a2b" : m < 60 ? "#c9a227" : "#2d8a2d";

  const S = {
    app: { minHeight: "100vh", background: "#060e06", color: "#d4edd4", fontFamily: "'Inter', system-ui, sans-serif", padding: "0 0 80px" },
    header: { background: "linear-gradient(135deg, #0a1a0a 0%, #0f2a0f 100%)", borderBottom: "1px solid #1a3a1a", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    logo: { display: "flex", alignItems: "center", gap: 10 },
    logoIcon: { width: 36, height: 36, background: "linear-gradient(135deg, #2d7a2d, #5abf5a)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
    logoText: { fontSize: 16, fontWeight: 700, color: "#d4edd4", letterSpacing: -0.3 },
    logoSub: { fontSize: 10, color: "#5a8a5a", letterSpacing: 1.5, textTransform: "uppercase" },
    statusDot: { width: 8, height: 8, borderRadius: "50%", background: "#5abf5a", boxShadow: "0 0 8px #5abf5a", display: "inline-block", marginRight: 6, animation: "pulse 2s infinite" },
    nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a1a0a", borderTop: "1px solid #1a3a1a", display: "flex", padding: "8px 0" },
    navBtn: (active) => ({ flex: 1, background: "none", border: "none", color: active ? "#5abf5a" : "#3a5a3a", fontSize: 9, fontWeight: active ? 700 : 400, cursor: "pointer", padding: "6px 0", letterSpacing: 0.5, textTransform: "uppercase", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }),
    card: { background: "linear-gradient(135deg, #0d1f0d, #0f2a0f)", border: "1px solid #1a3a1a", borderRadius: 16, padding: 16, margin: "12px 16px 0" },
    sectionTitle: { fontSize: 12, fontWeight: 700, color: "#5a8a5a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 },
    zoneCard: (active) => ({ background: active ? "linear-gradient(135deg, #0d2a0d, #123012)" : "linear-gradient(135deg, #0d1f0d, #0f2a0f)", border: `1px solid ${active ? "#2d5a2d" : "#1a3a1a"}`, borderRadius: 14, padding: "14px", marginBottom: 10, position: "relative", overflow: "hidden", transition: "all 0.3s" }),
    toggleBtn: (active) => ({ width: 48, height: 26, borderRadius: 13, background: active ? "#2d7a2d" : "#1a2a1a", border: `2px solid ${active ? "#5abf5a" : "#2a4a2a"}`, position: "relative", cursor: "pointer", transition: "all 0.3s", flexShrink: 0 }),
    toggleKnob: (active) => ({ position: "absolute", top: 2, left: active ? 22 : 2, width: 18, height: 18, borderRadius: "50%", background: active ? "#5abf5a" : "#3a5a3a", transition: "left 0.3s", boxShadow: active ? "0 0 8px #5abf5a" : "none" }),
    moistureBar: (m) => ({ height: 4, borderRadius: 2, background: "#0d1f0d", overflow: "hidden", marginTop: 8 }),
    moistureFill: (m) => ({ width: `${m}%`, height: "100%", background: `linear-gradient(90deg, ${moistureColor(m)}, ${moistureColor(m)}aa)`, borderRadius: 2, transition: "width 1s" }),
    badge: (color) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: `${color}22`, color, border: `1px solid ${color}44`, letterSpacing: 0.5 }),
    btn: (variant = "primary") => ({
      padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
      background: variant === "primary" ? "linear-gradient(135deg, #2d7a2d, #3a9a3a)" : variant === "danger" ? "linear-gradient(135deg, #7a2d2d, #9a3a3a)" : "#1a2a1a",
      color: variant === "ghost" ? "#5a8a5a" : "#d4edd4", transition: "all 0.2s"
    }),
    input: { background: "#0d1f0d", border: "1px solid #2a4a2a", borderRadius: 8, color: "#d4edd4", padding: "8px 12px", fontSize: 13, width: "100%", boxSizing: "border-box" },
    select: { background: "#0d1f0d", border: "1px solid #2a4a2a", borderRadius: 8, color: "#d4edd4", padding: "8px 12px", fontSize: 13, width: "100%", boxSizing: "border-box" },
    notif: (type) => ({ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: type === "success" ? "#0d2a0d" : "#1a2a3a", border: `1px solid ${type === "success" ? "#2d7a2d" : "#2a4a7a"}`, borderRadius: 10, padding: "10px 20px", fontSize: 13, color: "#d4edd4", zIndex: 100, whiteSpace: "nowrap", boxShadow: "0 4px 20px #000a" }),
  };

  const weekUsage = [
    { day: "Mon", liters: 145 }, { day: "Tue", liters: 120 }, { day: "Wed", liters: 0 },
    { day: "Thu", liters: 160 }, { day: "Fri", liters: 135 }, { day: "Sat", liters: 180 }, { day: "Sun", liters: 124 },
  ];

  return (
    <div style={S.app}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes flow { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #060e06; } ::-webkit-scrollbar-thumb { background: #1a3a1a; border-radius: 2px; }
      `}</style>

      {notification && <div style={S.notif(notification.type)}>{notification.type === "success" ? "✅" : "ℹ️"} {notification.msg}</div>}

      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>
          <div style={S.logoIcon}>💧</div>
          <div>
            <div style={S.logoText}>AquaSmart</div>
            <div style={S.logoSub}>Irrigation Control</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#d4edd4" }}><span style={S.statusDot} />Online</div>
          <div style={{ fontSize: 10, color: "#5a8a5a" }}>{zones.filter(z => z.active).length} zones active</div>
        </div>
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div>
          {/* Weather Strip */}
          <div style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "#5a8a5a", marginBottom: 2 }}>⛅ {weatherData.condition}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#d4edd4" }}>{weatherData.temp}°C</div>
            </div>
            {weatherData.forecast.map(f => (
              <div key={f.day} style={{ textAlign: "center", minWidth: 40 }}>
                <div style={{ fontSize: 9, color: "#5a8a5a" }}>{f.day}</div>
                <div style={{ fontSize: 18 }}>{f.icon}</div>
                <div style={{ fontSize: 10, color: "#d4edd4" }}>{f.high}°</div>
                <div style={{ fontSize: 9, color: f.rain > 50 ? "#5abfbf" : "#3a5a3a" }}>{f.rain}%</div>
              </div>
            ))}
          </div>

          {/* System Gauges */}
          <div style={{ ...S.card }}>
            <div style={S.sectionTitle}>System Status</div>
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8 }}>
              <Gauge value={weatherData.humidity} max={100} color="#5abfbf" label="Humidity" unit="%" />
              <Gauge value={totalToday} max={300} color="#2d7a2d" label="Today" unit="L" />
              <Gauge value={weatherData.wind} max={50} color="#c9a227" label="Wind" unit="km/h" />
            </div>
          </div>

          {/* Quick Zone Controls */}
          <div style={{ ...S.card }}>
            <div style={{ ...S.sectionTitle, display: "flex", justifyContent: "space-between" }}>
              <span>Zones</span>
              <span style={{ fontSize: 11, color: "#5abf5a", fontWeight: 600 }}>{zones.filter(z => z.active).length}/{zones.length} on</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {zones.map(z => (
                <div key={z.id} style={{ ...S.zoneCard(z.active), padding: 12 }}>
                  {z.active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #5abf5a, transparent)", animation: "flow 2s linear infinite" }} />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 20, marginBottom: 2 }}>{z.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#d4edd4" }}>{z.name}</div>
                      <div style={{ fontSize: 10, color: "#5a8a5a" }}>{z.area}</div>
                    </div>
                    <div style={S.toggleBtn(z.active)} onClick={() => toggleZone(z.id)}>
                      <div style={S.toggleKnob(z.active)} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10 }}>
                    <span style={{ color: moistureColor(z.moisture) }}>💧 {Math.round(z.moisture)}%</span>
                    {z.active && <span style={{ color: "#5abf5a" }}>⏱ {activeTimer[z.id] || 0}s</span>}
                    {!z.active && <span style={{ color: "#3a5a3a" }}>{z.flow === 0 ? "Idle" : ""}</span>}
                  </div>
                  <div style={S.moistureBar(z.moisture)}>
                    <div style={S.moistureFill(z.moisture)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water Usage */}
          <div style={S.card}>
            <div style={S.sectionTitle}>Weekly Usage</div>
            {weekUsage.map(w => <WaterUsageBar key={w.day} day={w.day} liters={w.liters} max={200} />)}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "10px 0", borderTop: "1px solid #1a3a1a" }}>
              <div><div style={{ fontSize: 10, color: "#5a8a5a" }}>Total This Week</div><div style={{ fontSize: 18, fontWeight: 700, color: "#5abf5a" }}>864 L</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#5a8a5a" }}>vs Last Week</div><div style={{ fontSize: 14, fontWeight: 600, color: "#2d8a2d" }}>↓ 12%</div></div>
            </div>
          </div>
        </div>
      )}

      {/* Zones */}
      {tab === "zones" && (
        <div>
          <div style={S.card}>
            <div style={S.sectionTitle}>All Zones</div>
            {zones.map(z => (
              <div key={z.id} style={S.zoneCard(z.active)}>
                {z.active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #5abf5a, transparent)", animation: "flow 2s linear infinite" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 32 }}>{z.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#d4edd4" }}>{z.name}</span>
                      <span style={S.badge(z.active ? "#5abf5a" : "#3a5a3a")}>{z.active ? "RUNNING" : "IDLE"}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#5a8a5a", marginBottom: 6 }}>{z.type} · {z.area}</div>
                    <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
                      <span style={{ color: moistureColor(z.moisture) }}>💧 Moisture: {Math.round(z.moisture)}%</span>
                      {z.active && <span style={{ color: "#5abf5a" }}>Flow: {z.flow} L/min</span>}
                    </div>
                    <div style={S.moistureBar(z.moisture)}>
                      <div style={S.moistureFill(z.moisture)} />
                    </div>
                  </div>
                  <div style={S.toggleBtn(z.active)} onClick={() => toggleZone(z.id)}>
                    <div style={S.toggleKnob(z.active)} />
                  </div>
                </div>
                {z.active && activeTimer[z.id] && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "#0d2a0d", borderRadius: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#5a8a5a" }}>Auto-stop in</span>
                    <span style={{ color: "#5abf5a", fontWeight: 700 }}>{activeTimer[z.id]}s</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      {tab === "schedule" && (
        <div>
          <div style={S.card}>
            <div style={{ ...S.sectionTitle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Schedules</span>
              <button style={S.btn("primary")} onClick={() => setShowAddSched(!showAddSched)}>+ Add</button>
            </div>

            {showAddSched && (
              <div style={{ background: "#0a1a0a", border: "1px solid #2a4a2a", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#5abf5a", marginBottom: 10 }}>New Schedule</div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, color: "#5a8a5a", display: "block", marginBottom: 4 }}>Zone</label>
                  <select style={S.select} value={newSched.zone} onChange={e => setNewSched(s => ({ ...s, zone: +e.target.value }))}>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.icon} {z.name}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#5a8a5a", display: "block", marginBottom: 4 }}>Start Time</label>
                    <input type="time" style={S.input} value={newSched.time} onChange={e => setNewSched(s => ({ ...s, time: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#5a8a5a", display: "block", marginBottom: 4 }}>Duration (min)</label>
                    <input type="number" style={S.input} value={newSched.duration} min={1} max={120} onChange={e => setNewSched(s => ({ ...s, duration: +e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: "#5a8a5a", display: "block", marginBottom: 6 }}>Days</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {DAYS.map(d => (
                      <div key={d} onClick={() => setNewSched(s => ({ ...s, days: s.days.includes(d) ? s.days.filter(x => x !== d) : [...s.days, d] }))}
                        style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer", background: newSched.days.includes(d) ? "#2d7a2d" : "#1a2a1a", color: newSched.days.includes(d) ? "#d4edd4" : "#5a8a5a", border: `1px solid ${newSched.days.includes(d) ? "#5abf5a" : "#2a4a2a"}`, transition: "all 0.2s" }}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={S.btn("primary")} onClick={() => {
                    if (!newSched.days.length) { notify("Select at least one day", "info"); return; }
                    setSchedules(s => [...s, { ...newSched, id: Date.now(), active: true }]);
                    setShowAddSched(false);
                    setNewSched({ zone: 1, time: "06:00", duration: 15, days: [] });
                    notify("Schedule added!");
                  }}>Save Schedule</button>
                  <button style={S.btn("ghost")} onClick={() => setShowAddSched(false)}>Cancel</button>
                </div>
              </div>
            )}

            {schedules.map(s => {
              const zone = zones.find(z => z.id === s.zone);
              return (
                <div key={s.id} style={{ ...S.zoneCard(s.active), marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{zone?.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#d4edd4" }}>{zone?.name}</div>
                          <div style={{ fontSize: 11, color: "#5a8a5a" }}>⏰ {s.time} · {s.duration} min</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {DAYS.map(d => (
                          <span key={d} style={{ padding: "2px 6px", borderRadius: 4, fontSize: 9, background: s.days.includes(d) ? "#1a3a1a" : "transparent", color: s.days.includes(d) ? "#5abf5a" : "#2a4a2a", border: `1px solid ${s.days.includes(d) ? "#2a5a2a" : "#1a2a1a"}` }}>{d}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={S.toggleBtn(s.active)} onClick={() => {
                        setSchedules(prev => prev.map(sc => sc.id === s.id ? { ...sc, active: !sc.active } : sc));
                        notify(`Schedule ${s.active ? "paused" : "enabled"}`, s.active ? "info" : "success");
                      }}>
                        <div style={S.toggleKnob(s.active)} />
                      </div>
                      <button style={{ background: "none", border: "none", color: "#5a3a3a", cursor: "pointer", fontSize: 16 }} onClick={() => {
                        setSchedules(prev => prev.filter(sc => sc.id !== s.id));
                        notify("Schedule deleted", "info");
                      }}>🗑</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {schedules.length === 0 && <div style={{ textAlign: "center", color: "#3a5a3a", padding: 30, fontSize: 13 }}>No schedules yet. Add one above.</div>}
          </div>
        </div>
      )}

      {/* Settings */}
      {tab === "settings" && (
        <div>
          <div style={S.card}>
            <div style={S.sectionTitle}>Automation</div>
            {[
              { label: "Auto Mode", sub: "AI adjusts watering based on weather & moisture", val: autoMode, set: setAutoMode },
              { label: "Rain Skip", sub: "Skip watering when rain is forecast above 60%", val: rainSkip, set: setRainSkip },
            ].map(({ label, sub, val, set }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a3a1a" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#d4edd4" }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#5a8a5a", maxWidth: 220 }}>{sub}</div>
                </div>
                <div style={S.toggleBtn(val)} onClick={() => { set(!val); notify(`${label} ${!val ? "enabled" : "disabled"}`, !val ? "success" : "info"); }}>
                  <div style={S.toggleKnob(val)} />
                </div>
              </div>
            ))}
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Water Limits</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: "#5a8a5a", display: "block", marginBottom: 4 }}>Daily Limit (Liters)</label>
              <input type="number" style={S.input} defaultValue={300} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#5a8a5a", display: "block", marginBottom: 4 }}>Alert When Usage Exceeds (%)</label>
              <input type="number" style={S.input} defaultValue={80} min={1} max={100} />
            </div>
            <button style={{ ...S.btn("primary"), marginTop: 12, width: "100%" }} onClick={() => notify("Settings saved!")}>Save Limits</button>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>System Info</div>
            {[["Controller", "AquaSmart Pro v2.1"], ["Firmware", "3.4.1 (latest)"], ["Zones", "6 active"], ["Uptime", "14 days"], ["Water Saved", "32% vs avg"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a3a1a", fontSize: 13 }}>
                <span style={{ color: "#5a8a5a" }}>{k}</span>
                <span style={{ color: "#d4edd4", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav style={S.nav}>
        {[
          { id: "dashboard", icon: "📊", label: "Dashboard" },
          { id: "zones", icon: "💧", label: "Zones" },
          { id: "schedule", icon: "🗓", label: "Schedule" },
          { id: "settings", icon: "⚙️", label: "Settings" },
        ].map(({ id, icon, label }) => (
          <button key={id} style={S.navBtn(tab === id)} onClick={() => setTab(id)}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
