import { useState } from "react";

// ─── Utility ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
const fmtL = (n) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${fmt(n)}`;
};

// ─── Shared Slider ─────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step = 1, unit = "", onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = format ? format(value) : `${value}${unit}`;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#f0c040", fontFamily: "'DM Serif Display', serif", letterSpacing: "0.02em" }}>{display}</span>
      </div>
      <div style={{ position: "relative", height: 6, borderRadius: 3, background: "#1e293b" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, borderRadius: 3, background: "linear-gradient(90deg, #b45309, #f0c040)" }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: -7, left: 0, width: "100%", opacity: 0, cursor: "pointer", height: 20 }}
        />
        <div style={{ position: "absolute", top: "50%", left: `${pct}%`, transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: "50%", background: "#f0c040", border: "3px solid #0f172a", boxShadow: "0 0 8px rgba(240,192,64,0.5)", pointerEvents: "none" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#475569" }}>{min}{unit}</span>
        <span style={{ fontSize: 10, color: "#475569" }}>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Result Card ───────────────────────────────────────────────────────────────
function ResultBlock({ label, value, highlight = false, sub }) {
  return (
    <div style={{
      padding: "16px 20px", borderRadius: 12,
      background: highlight ? "linear-gradient(135deg, #92400e22, #f0c04011)" : "#0f172a",
      border: highlight ? "1px solid #f0c04055" : "1px solid #1e293b",
      textAlign: "center"
    }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: highlight ? 26 : 20, fontWeight: 700, color: highlight ? "#f0c040" : "#e2e8f0", fontFamily: "'DM Serif Display', serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ─── Donut Chart ───────────────────────────────────────────────────────────────
function Donut({ parts }) {
  const total = parts.reduce((a, b) => a + b.v, 0);
  if (!total) return null;
  let offset = 0;
  const r = 50, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  const segments = parts.map(p => {
    const pct = p.v / total;
    const seg = { ...p, offset, pct, dash: pct * circ, gap: (1 - pct) * circ };
    offset += pct;
    return seg;
  });
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={14} />
      {segments.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={14}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset * circ}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
      ))}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="DM Sans, sans-serif">Total</text>
    </svg>
  );
}

// ─── 1. SIP Goal Planner ───────────────────────────────────────────────────────
function SIPPlanner() {
  const [goal, setGoal] = useState(5000000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const [inflation, setInflation] = useState(6);
  const realRate = ((1 + rate / 100) / (1 + inflation / 100) - 1) * 100;
  const n = years * 12;
  const r = rate / 100 / 12;
  const adjGoal = goal * Math.pow(1 + inflation / 100, years);
  const sipNeeded = adjGoal * r / (Math.pow(1 + r, n) - 1);
  const totalInvested = sipNeeded * n;
  const gains = adjGoal - totalInvested;
  return (
    <div>
      <div style={{ marginBottom: 24, padding: "12px 16px", borderRadius: 8, background: "#0f172a", border: "1px solid #1e293b", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
        Plan how much SIP you need monthly to reach your financial goal, adjusted for inflation.
      </div>
      <Slider label="Goal Amount" value={goal} min={500000} max={50000000} step={100000} onChange={setGoal} format={fmtL} />
      <Slider label="Time Horizon" value={years} min={1} max={40} unit=" yrs" onChange={setYears} />
      <Slider label="Expected Return (p.a.)" value={rate} min={4} max={24} unit="%" onChange={setRate} />
      <Slider label="Inflation Rate" value={inflation} min={2} max={12} unit="%" onChange={setInflation} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
        <ResultBlock label="Monthly SIP Required" value={fmtL(sipNeeded)} highlight />
        <ResultBlock label="Inflation-Adj. Goal" value={fmtL(adjGoal)} />
        <ResultBlock label="Total Invested" value={fmtL(totalInvested)} />
        <ResultBlock label="Wealth Gained" value={fmtL(gains)} sub={`${((gains / totalInvested) * 100).toFixed(0)}% returns on invested`} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 20, padding: 16, borderRadius: 12, background: "#0f172a", border: "1px solid #1e293b" }}>
        <Donut parts={[{ v: totalInvested, color: "#b45309" }, { v: gains, color: "#f0c040" }]} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#b45309" }} />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Invested: {fmtL(totalInvested)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f0c040" }} />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Returns: {fmtL(gains)}</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#475569" }}>Real return (inflation-adj): {realRate.toFixed(1)}% p.a.</div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. FD vs Mutual Fund ──────────────────────────────────────────────────────
function FDvsMF() {
  const [amount, setAmount] = useState(500000);
  const [years, setYears] = useState(10);
  const [fdRate, setFdRate] = useState(7);
  const [mfRate, setMfRate] = useState(12);
  const [taxSlab, setTaxSlab] = useState(30);
  const fdGross = amount * Math.pow(1 + fdRate / 100, years);
  const fdTax = (fdGross - amount) * (taxSlab / 100);
  const fdNet = fdGross - fdTax;
  const mfGross = amount * Math.pow(1 + mfRate / 100, years);
  const mfGain = mfGross - amount;
  const ltcgTax = mfGain > 125000 ? (mfGain - 125000) * 0.125 : 0;
  const mfNet = mfGross - ltcgTax;
  const diff = mfNet - fdNet;
  const better = diff > 0 ? "Mutual Fund" : "FD";
  return (
    <div>
      <div style={{ marginBottom: 24, padding: "12px 16px", borderRadius: 8, background: "#0f172a", border: "1px solid #1e293b", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
        Compare post-tax returns: FD (taxed at income slab) vs Equity MF (LTCG 12.5% above ₹1.25L exemption).
      </div>
      <Slider label="Investment Amount" value={amount} min={10000} max={5000000} step={10000} onChange={setAmount} format={fmtL} />
      <Slider label="Duration" value={years} min={1} max={30} unit=" yrs" onChange={setYears} />
      <Slider label="FD Interest Rate" value={fdRate} min={4} max={10} unit="%" onChange={setFdRate} step={0.25} />
      <Slider label="MF Expected Return" value={mfRate} min={6} max={20} unit="%" onChange={setMfRate} step={0.5} />
      <Slider label="Your Tax Slab" value={taxSlab} min={0} max={30} unit="%" onChange={setTaxSlab} step={5} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
        <div style={{ padding: "16px", borderRadius: 12, background: "#0f172a", border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>🏦 Fixed Deposit</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>{fmtL(fdNet)}</div>
          <div style={{ fontSize: 11, color: "#475569" }}>Tax paid: {fmtL(fdTax)}</div>
        </div>
        <div style={{ padding: "16px", borderRadius: 12, background: diff > 0 ? "linear-gradient(135deg, #92400e22, #f0c04011)" : "#0f172a", border: diff > 0 ? "1px solid #f0c04055" : "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, color: "#f0c040", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>📈 Mutual Fund</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f0c040", fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>{fmtL(mfNet)}</div>
          <div style={{ fontSize: 11, color: "#475569" }}>LTCG tax: {fmtL(ltcgTax)}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, padding: "14px 20px", borderRadius: 12, background: diff > 0 ? "#052e16" : "#1e1b4b", border: `1px solid ${diff > 0 ? "#16a34a55" : "#6366f155"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Winner after {years} years</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: diff > 0 ? "#4ade80" : "#818cf8", fontFamily: "'DM Serif Display', serif" }}>{better}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Extra corpus</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: diff > 0 ? "#4ade80" : "#f87171", fontFamily: "'DM Serif Display', serif" }}>{fmtL(Math.abs(diff))}</div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Loan Prepayment Calculator ────────────────────────────────────────────
function LoanPrepay() {
  const [loan, setLoan] = useState(3000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [prepay, setPrepay] = useState(200000);
  const [afterYear, setAfterYear] = useState(3);
  const r = rate / 100 / 12;
  const n = tenure * 12;
  const emi = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalWithout = emi * n;
  const interestWithout = totalWithout - loan;
  const paidMonths = afterYear * 12;
  const balanceAfter = loan * Math.pow(1 + r, paidMonths) - emi * (Math.pow(1 + r, paidMonths) - 1) / r;
  const newPrincipal = Math.max(0, balanceAfter - prepay);
  const remMonths = n - paidMonths;
  const newEmi = newPrincipal * r * Math.pow(1 + r, remMonths) / (Math.pow(1 + r, remMonths) - 1);
  const totalWith = emi * paidMonths + newEmi * remMonths + prepay;
  const interestWith = totalWith - loan;
  const saved = interestWithout - interestWith;
  const timeSaved = (interestWithout - interestWith) / emi;
  return (
    <div>
      <div style={{ marginBottom: 24, padding: "12px 16px", borderRadius: 8, background: "#0f172a", border: "1px solid #1e293b", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
        See how a one-time prepayment slashes your total interest burden and effective loan tenure.
      </div>
      <Slider label="Loan Amount" value={loan} min={500000} max={15000000} step={100000} onChange={setLoan} format={fmtL} />
      <Slider label="Interest Rate" value={rate} min={6} max={15} unit="%" onChange={setRate} step={0.1} />
      <Slider label="Tenure" value={tenure} min={5} max={30} unit=" yrs" onChange={setTenure} />
      <Slider label="Prepayment Amount" value={prepay} min={50000} max={2000000} step={50000} onChange={setPrepay} format={fmtL} />
      <Slider label="Prepay After (Year)" value={afterYear} min={1} max={tenure - 1} unit=" yr" onChange={setAfterYear} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 24 }}>
        <ResultBlock label="Monthly EMI" value={`₹${fmt(emi)}`} />
        <ResultBlock label="Interest Saved" value={fmtL(saved)} highlight />
        <ResultBlock label="Months Saved" value={`~${Math.round(timeSaved)} mo`} />
        <ResultBlock label="Total Interest (Without)" value={fmtL(interestWithout)} sub="No prepayment" />
        <ResultBlock label="Total Interest (With)" value={fmtL(interestWith)} sub="After prepayment" />
        <ResultBlock label="New Balance" value={fmtL(newPrincipal)} sub={`After prepay in yr ${afterYear}`} />
      </div>
      <div style={{ marginTop: 12, padding: "14px 20px", borderRadius: 12, background: "#052e16", border: "1px solid #16a34a55" }}>
        <div style={{ fontSize: 12, color: "#86efac", marginBottom: 2 }}>💡 Prepaying {fmtL(prepay)} in year {afterYear} saves you</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#4ade80", fontFamily: "'DM Serif Display', serif" }}>{fmtL(saved)} in total interest</div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>That's a {((saved / prepay) * 100).toFixed(0)}% return on your prepayment amount.</div>
      </div>
    </div>
  );
}

// ─── 4. PPF vs ELSS ────────────────────────────────────────────────────────────
function PPFvsELSS() {
  const [yearly, setYearly] = useState(150000);
  const [years, setYears] = useState(15);
  const [elssRate, setElssRate] = useState(13);
  const PPF_RATE = 7.1;
  const ppfFV = yearly * ((Math.pow(1 + PPF_RATE / 100, years) - 1) / (PPF_RATE / 100)) * (1 + PPF_RATE / 100);
  const ellsFV = yearly * ((Math.pow(1 + elssRate / 100, years) - 1) / (elssRate / 100)) * (1 + elssRate / 100);
  const totalInvested = yearly * years;
  const ppfGain = ppfFV - totalInvested;
  const elssGain = ellsFV - totalInvested;
  const elssLTCG = Math.max(0, elssGain - 125000) * 0.125;
  const elssNet = ellsFV - elssLTCG;
  const diff = elssNet - ppfFV;
  return (
    <div>
      <div style={{ marginBottom: 24, padding: "12px 16px", borderRadius: 8, background: "#0f172a", border: "1px solid #1e293b", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
        PPF: 7.1% tax-free, 15-yr lock-in, EEE status. ELSS: market-linked, 3-yr lock-in, LTCG 12.5% above ₹1.25L.
      </div>
      <Slider label="Yearly Investment" value={yearly} min={500} max={150000} step={500} onChange={setYearly} format={fmtL} />
      <Slider label="Duration" value={years} min={15} max={30} unit=" yrs" onChange={setYears} />
      <Slider label="ELSS Expected Return" value={elssRate} min={8} max={20} unit="%" onChange={setElssRate} step={0.5} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
        <div style={{ padding: "16px", borderRadius: 12, background: "#0f172a", border: "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>🏛 PPF (7.1%)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>{fmtL(ppfFV)}</div>
          <div style={{ fontSize: 11, color: "#475569" }}>Tax: ₹0 (EEE)</div>
        </div>
        <div style={{ padding: "16px", borderRadius: 12, background: diff > 0 ? "linear-gradient(135deg, #92400e22, #f0c04011)" : "#0f172a", border: diff > 0 ? "1px solid #f0c04055" : "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, color: "#f0c040", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>📊 ELSS ({elssRate}%)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f0c040", fontFamily: "'DM Serif Display', serif", marginBottom: 4 }}>{fmtL(elssNet)}</div>
          <div style={{ fontSize: 11, color: "#475569" }}>LTCG tax: {fmtL(elssLTCG)}</div>
        </div>
      </div>
      <ResultBlock label="Extra wealth with ELSS (post-tax)" value={diff > 0 ? `+${fmtL(diff)}` : `-${fmtL(Math.abs(diff))}`} highlight sub={`Over ${years} years · Invested: ${fmtL(totalInvested)}`} />
    </div>
  );
}

// ─── Navigation Pills ──────────────────────────────────────────────────────────
const tools = [
  { id: "sip", label: "SIP Planner", icon: "🎯" },
  { id: "fd", label: "FD vs MF", icon: "⚖️" },
  { id: "loan", label: "Loan Prepay", icon: "🏠" },
  { id: "ppf", label: "PPF vs ELSS", icon: "📊" },
];

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("sip");
  const [hovered, setHovered] = useState(null);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #030712; }
        input[type=range] { -webkit-appearance: none; appearance: none; }
        ::-webkit-scrollbar { width: 4px; background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#030712", fontFamily: "'DM Sans', sans-serif", padding: "0 0 60px" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(180deg, #0c0a06 0%, #030712 100%)", borderBottom: "1px solid #1e293b", padding: "28px 24px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, #f0c04015 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "radial-gradient(circle at 20% 50%, #92400e08 0%, transparent 50%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #b45309, #f0c040)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>₹</div>
              <span style={{ fontSize: 11, color: "#f0c040", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>FinCalc India</span>
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#f8fafc", lineHeight: 1.2, marginBottom: 6 }}>
              Smart Money<br /><span style={{ color: "#f0c040", fontStyle: "italic" }}>Calculators</span>
            </h1>
            <p style={{ fontSize: 13, color: "#475569", maxWidth: 300, lineHeight: 1.6 }}>Indian tax laws · Real inflation · Post-tax returns</p>
          </div>
        </div>

        {/* Nav Pills */}
        <div style={{ display: "flex", gap: 8, padding: "16px 20px", overflowX: "auto", scrollbarWidth: "none" }}>
          {tools.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)}
              onMouseEnter={() => setHovered(t.id)} onMouseLeave={() => setHovered(null)}
              style={{
                flexShrink: 0, padding: "8px 16px", borderRadius: 100, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                background: active === t.id ? "linear-gradient(135deg, #b45309, #d97706)" : hovered === t.id ? "#1e293b" : "#0f172a",
                color: active === t.id ? "#fff" : "#94a3b8",
                transition: "all 0.2s",
                boxShadow: active === t.id ? "0 4px 12px rgba(180,83,9,0.35)" : "none"
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tool Panel */}
        <div style={{ padding: "0 20px" }}>
          {active === "sip" && <SIPPlanner />}
          {active === "fd" && <FDvsMF />}
          {active === "loan" && <LoanPrepay />}
          {active === "ppf" && <PPFvsELSS />}
        </div>

        {/* Footer */}
        <div style={{ margin: "32px 20px 0", padding: "12px 16px", borderRadius: 8, background: "#0f172a", border: "1px solid #1e293b", fontSize: 11, color: "#334155", lineHeight: 1.7 }}>
          ⚠️ For educational purposes only. Consult a SEBI-registered advisor before investing. MF returns shown are illustrative; past performance ≠ future results. Tax rules as per FY2024–25.
        </div>
      </div>
    </>
  );
}
