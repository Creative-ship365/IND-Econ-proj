import { useState, useEffect, useMemo } from 'react';
import {
  MILESTONES,
  ASSUMPTIONS,
  FEATURES,
  PALETTE,
  TABS,
  GROWTH_PHASES,
  generateGdpData,
  type TabId,
  type Scenario,
} from './data/model';
import { useAnimVal } from './hooks/useAnimVal';
import GdpChart from './components/GdpChart';
import MiniSparkline from './components/MiniSparkline';
import FeatureCard from './components/FeatureCard';
import './index.css';

function App() {
  const [showNominal, setShowNominal] = useState(false);
  const [scenario, setScenario] = useState<Scenario>('popular');
  const [scrubYear, setScrubYear] = useState(2035);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [started, setStarted] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [tableYear, setTableYear] = useState(2022);

  const activeData = useMemo(() => generateGdpData(scenario), [scenario]);

  useEffect(() => {
    const a = setTimeout(() => setStarted(true), 300);
    const b = setTimeout(() => setCardsVisible(true), 700);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  const real2075 = activeData[53].realGDP;
  const nom2075 = activeData[53].nominalGDP;
  const animReal = useAnimVal(real2075, 2000, started);
  const animNom = useAnimVal(nom2075, 2000, started);

  const scrubD = activeData.find((d) => d.year === scrubYear) || activeData[0];
  const tableStart = activeData.findIndex((d) => d.year === tableYear);
  const tableData = activeData.slice(
    Math.max(0, tableStart),
    Math.max(0, tableStart) + 12
  );

  const kpis = [
    {
      label: 'Nominal GDP 2026',
      value: '$4.15T',
      sub: 'IMF WEO Apr 2026 · Actual',
      color: 'teal' as const,
      hex: PALETTE.teal,
      badge: 'ACTUAL',
    },
    {
      label: 'Real GDP 2075',
      value: `$${animReal.toFixed(1)}T`,
      sub: 'constant 2022 USD',
      color: 'blue' as const,
      hex: PALETTE.blue,
      badge: null,
    },
    {
      label: 'Nominal GDP 2075',
      value: `$${animNom.toFixed(1)}T`,
      sub: 'current USD',
      color: 'gold' as const,
      hex: PALETTE.gold,
      badge: null,
    },
    {
      label: 'Per-Capita 2075',
      value: `~$${Math.round(activeData[53].perCapita / 1000)}K`,
      sub: 'nominal · ~1.65B people',
      color: 'purple' as const,
      hex: PALETTE.purple,
      badge: null,
    },
  ];

  const scrubCells = [
    {
      label: 'Year',
      value: `${scrubYear}${scrubD.isActual ? ' ✓' : ''}`,
      c: scrubD.isActual ? PALETTE.teal : PALETTE.blue,
    },
    {
      label: 'Real GDP',
      value: `$${scrubD.realGDP.toFixed(2)}T`,
      c: PALETTE.teal,
    },
    {
      label: 'Nominal GDP',
      value: `$${scrubD.nominalGDP.toFixed(2)}T`,
      c: PALETTE.gold,
    },
    {
      label: 'Per-Capita (nom)',
      value: `$${scrubD.perCapita.toLocaleString()}`,
      c: 'rgba(255,255,255,0.7)',
    },
    {
      label: 'Population',
      value: `${scrubD.pop.toLocaleString()}M`,
      c: 'rgba(255,255,255,0.55)',
    },
  ];

  const sparklineConfigs = [
    {
      title: 'Real GDP (constant 2022 $T)',
      key: 'realGDP' as const,
      color: PALETTE.teal,
      fmt: (v: number) => `$${v.toFixed(2)}T`,
      desc: "Inflation-adjusted. Measures true output growth. Base: $3.35T (2022 World Bank). Grows to ~$50T by 2075 in constant 2022 dollars.",
    },
    {
      title: 'Nominal GDP (current $T)',
      key: 'nominalGDP' as const,
      color: PALETTE.gold,
      fmt: (v: number) => `$${v.toFixed(2)}T`,
      desc: "Current USD. Includes real growth + modest nominal uplift (+1.2–2%/yr net of INR depreciation vs USD). Actuals match IMF WEO 2022–2026.",
    },
    {
      title: 'Real GDP Growth Rate (%)',
      key: 'yoyGrowth' as const,
      color: PALETTE.blue,
      fmt: (v: number) => `${v}%`,
      desc: "Actual: 8.2% (FY24), 6.7% (FY25). Projected: ~7–7.5% through 2035, tapering to ~3% by 2075 as India approaches high-income status.",
    },
    {
      title: 'Nominal Per-Capita GDP ($)',
      key: 'perCapita' as const,
      color: PALETTE.coral,
      fmt: (v: number) => `$${Math.round(v / 1000)}K`,
      desc: "2022: ~$2,380. Population peaks 1.701B (~2060) then declines. Per-capita accelerates post-peak. 2075 est.: ~$35–40K as population falls.",
    },
  ];

  const popData = activeData.filter((_, i) => i % 5 === 0).map((d) => d.pop);
  const popCheckpoints: [string, string][] = [
    ['2022', '1,417M'],
    ['2024', '1,441M'],
    ['2030', '~1,510M'],
    ['2040', '~1,591M'],
    ['2060 (peak)', '~1,701M'],
    ['2075', '~1,650M'],
  ];

  const tableHeaders = [
    'Year',
    'Real GDP ($T)',
    'Nominal GDP ($T)',
    'Per-Capita ($)',
    'Real/Capita ($)',
    'Real Growth',
    'Pop (M)',
  ];

  const yearFilters = [
    { y: 2022, label: '2022+' },
    { y: 2027, label: '2027s' },
    { y: 2035, label: '2035s' },
    { y: 2045, label: '2045s' },
    { y: 2055, label: '2055s' },
    { y: 2065, label: '2065s' },
  ];

  return (
    <div id="app-root">
      <div className="ambient-bg" />

      {/* ─── NAVBAR ─── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="navbar-logo">$</div>
            <span className="navbar-title">India GDP 2022–2075</span>
            <span className="navbar-badge">IMF · WORLD BANK · UN WPP 2024</span>
          </div>
          <div className="navbar-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="main-container">
        {/* ─── HERO ─── */}
        <div className={`hero ${started ? 'visible' : ''}`}>
          <div className="hero-tag">
            India Economic Projection · Design Brief v2.1
          </div>
          <h1>
            Track Every <em>Rupee</em>.<br />
            Every <em>Metric</em>.<br />
            Every <em>Milestone</em>.
          </h1>
          <p className="hero-sub">
            Real-time visibility into India's economic trajectory. Real (constant 2022 $) & Nominal (current $) values — anchored to World Bank & IMF actuals.
          </p>
        </div>

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === 'overview' && (
          <div className={`tab-content ${cardsVisible ? 'visible' : ''}`}>
            {/* KPI row */}
            <div className="kpi-grid">
              {kpis.map((k, i) => (
                <div
                  key={i}
                  className={`kpi-card ${started ? 'visible' : ''}`}
                  data-color={k.color}
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <div className="kpi-header">
                    <div className="kpi-label">{k.label}</div>
                    {k.badge && <span className="kpi-badge">{k.badge}</span>}
                  </div>
                  <div className="kpi-value" style={{ color: k.hex }}>
                    {k.value}
                  </div>
                  <div className="kpi-sub">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="card chart-container">
              <div className="chart-header">
                <div>
                  <div className="chart-subtitle">
                    GDP Trajectory · USD Trillions · 2022–2075
                  </div>
                  <div className="chart-title">
                    Hover to explore — actual data left of dashed line
                  </div>
                </div>
                <div className="chart-controls">
                  <div className="scenario-toggle-group">
                    {(['conservative', 'popular', 'govt'] as const).map(s => (
                      <button
                        key={s}
                        className={`scenario-toggle-btn ${scenario === s ? 'active' : ''}`}
                        onClick={() => setScenario(s)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="chart-toggle-group">
                    <button
                      className={`chart-toggle-btn ${!showNominal ? 'active-teal' : ''}`}
                      onClick={() => setShowNominal(false)}
                    >
                      Real USD
                    </button>
                    <button
                      className={`chart-toggle-btn ${showNominal ? 'active-gold' : ''}`}
                      onClick={() => setShowNominal(true)}
                    >
                      + Nominal
                    </button>
                  </div>
                </div>
              </div>
              <GdpChart
                data={activeData}
                showNominal={showNominal}
                scrubYear={scrubYear}
                setScrubYear={setScrubYear}
              />
              <div className="chart-legend">
                <div className="legend-item">
                  <div
                    className="legend-line"
                    style={{ background: PALETTE.teal }}
                  />
                  Real GDP (constant 2022 USD)
                </div>
                {showNominal && (
                  <div className="legend-item">
                    <div
                      className="legend-dash"
                      style={{ borderColor: PALETTE.gold }}
                    />
                    Nominal GDP (current USD)
                  </div>
                )}
                <div className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ color: PALETTE.gold }}
                  >
                    ●
                  </span>
                  Milestone
                </div>
                <div className="legend-item">
                  <div
                    className="legend-dash"
                    style={{ borderColor: PALETTE.teal }}
                  />
                  Actual/Projected boundary
                </div>
              </div>
            </div>

            {/* Scrub readout */}
            <div className="scrub-grid">
              {scrubCells.map((k, i) => (
                <div key={i} className="scrub-cell">
                  <div className="scrub-label">{k.label}</div>
                  <div className="scrub-value" style={{ color: k.c }}>
                    {k.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Milestones */}
            <div className="card">
              <div className="card-label">
                Key Milestones — Based on Model Projections
              </div>
              <div className="milestone-grid">
                {MILESTONES.map((m, i) => {
                  const d = activeData.find((dd) => dd.year === m.year);
                  return (
                    <div key={i} className="milestone-card">
                      <span className="milestone-icon">{m.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div className="milestone-year">{m.year}</div>
                        <div className="milestone-label">{m.label}</div>
                      </div>
                      {d && (
                        <div className="milestone-val">
                          <div className="milestone-val-num">
                            ${d.realGDP.toFixed(1)}T
                          </div>
                          <div className="milestone-val-sub">real</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ DATA & CHARTS TAB ═══════════ */}
        {activeTab === 'data' && (
          <div className={`tab-content ${cardsVisible ? 'visible' : ''}`}>
            <div className="sparkline-grid">
              {sparklineConfigs.map((c, i) => {
                const sampled = activeData.filter((_, j) => j % 5 === 0).map(
                  (d) => d[c.key]
                );
                return (
                  <div key={i} className="card sparkline-card">
                    <div className="sparkline-title">{c.title}</div>
                    <div className="sparkline-desc">{c.desc}</div>
                    <MiniSparkline
                      data={sampled}
                      color={c.color}
                      width={280}
                      height={72}
                    />
                    <div className="sparkline-footer">
                      <span style={{ color: 'rgba(255,255,255,0.25)' }}>
                        2022: {c.fmt(sampled[0])}
                      </span>
                      <span style={{ color: c.color }}>
                        2075: {c.fmt(sampled[sampled.length - 1])}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Growth phase table */}
            <div className="card">
              <div className="card-label">Growth Phase Checkpoints</div>
              <div className="phase-grid">
                {GROWTH_PHASES.map((ph, i) => (
                  <div
                    key={i}
                    className="phase-card"
                    style={{
                      background: `${ph.color}07`,
                      border: `1px solid ${ph.color}22`,
                    }}
                  >
                    <div
                      className="phase-name"
                      style={{ color: ph.color }}
                    >
                      {ph.phase}
                    </div>
                    <div className="phase-years">{ph.years}</div>
                    <div
                      className="phase-cagr"
                      style={{ color: ph.color }}
                    >
                      {ph.cagr}
                    </div>
                    <div className="phase-end">End real: {ph.realEnd}</div>
                    <div className="phase-source">{ph.source}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ ASSUMPTIONS TAB ═══════════ */}
        {activeTab === 'assumptions' && (
          <div className={`tab-content ${cardsVisible ? 'visible' : ''}`}>
            <div className="assumptions-intro">
              All assumptions are fully transparent and editable in the live
              site. Historical data (2022–2026) is sourced directly from IMF
              WEO April 2026, World Bank Open Data, and UN WPP 2024 — no
              adjustments made to actuals. Projections start from 2027
              onwards.
            </div>

            <div className="card" style={{ padding: 0, marginBottom: 22 }}>
              <div
                className="card-label"
                style={{
                  padding: '14px 22px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  marginBottom: 0,
                }}
              >
                Model Assumptions
              </div>
              <table className="assumptions-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Source / Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {ASSUMPTIONS.map((a, i) => (
                    <tr key={i}>
                      <td className="param">{a.label}</td>
                      <td className="val">{a.value}</td>
                      <td className="src">{a.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Population arc */}
            <div className="card">
              <div className="card-label">
                Population Arc — UN WPP 2024 Medium Variant
              </div>
              <MiniSparkline
                data={popData}
                color={PALETTE.purple}
                width={600}
                height={80}
              />
              <div className="pop-arc-stats">
                {popCheckpoints.map(([yr, pop]) => (
                  <div key={yr} className="pop-arc-stat">
                    <div className="pop-arc-year">{yr}</div>
                    <div
                      className="pop-arc-val"
                      style={{
                        color: yr.includes('peak')
                          ? PALETTE.gold
                          : PALETTE.purple,
                        fontWeight: yr.includes('peak') ? 700 : 400,
                      }}
                    >
                      {pop}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pop-arc-desc">
                India's TFR has fallen to 1.94 (below replacement of 2.1) as
                of 2023 per SRS data. UN WPP 2024 projects the peak at
                ~1.701B in the early 2060s, after which death rates rise as
                the population ages. By 2075, India's population is estimated
                at ~1.65B — still the world's largest. This declining
                population trajectory post-2060 meaningfully accelerates
                per-capita GDP growth.
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ FEATURES TAB ═══════════ */}
        {activeTab === 'features' && (
          <div className={`tab-content ${cardsVisible ? 'visible' : ''}`}>
            <div className="features-intro">
              These 12 specification modules define the full scope of the
              India Economic Projections website. All USD values are anchored
              to IMF/World Bank actuals through 2026 and modelled thereafter.
              The site's central credibility feature is the
              Actual/Projected divider — never hide the uncertainty.
            </div>
            <div className="features-grid">
              {FEATURES.map((f, i) => (
                <FeatureCard
                  key={i}
                  f={f}
                  index={i}
                  visible={cardsVisible}
                />
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ DATA TABLE TAB ═══════════ */}
        {activeTab === 'table' && (
          <div className={`tab-content ${cardsVisible ? 'visible' : ''}`}>
            <div className="card" style={{ padding: 0 }}>
              <div className="data-table-header">
                <div>
                  <div className="data-table-title">
                    Projection Data Table — All Values in USD
                  </div>
                  <div className="data-table-subtitle">
                    ✓ = IMF/World Bank actual · All others are model
                    projections
                  </div>
                </div>
                <div className="year-filter-group">
                  {yearFilters.map((yf) => (
                    <button
                      key={yf.y}
                      className={`year-filter-btn ${tableYear === yf.y ? 'active' : ''}`}
                      onClick={() => setTableYear(yf.y)}
                    >
                      {yf.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {tableHeaders.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((d, i) => {
                      const isMilestone = MILESTONES.some(
                        (m) => m.year === d.year
                      );
                      return (
                        <tr
                          key={d.year}
                          className={
                            d.isActual
                              ? 'actual-row'
                              : i % 2 === 0
                                ? ''
                                : 'even-row'
                          }
                        >
                          <td
                            style={{
                              color: d.isActual
                                ? PALETTE.teal
                                : isMilestone
                                  ? PALETTE.gold
                                  : 'rgba(255,255,255,0.6)',
                              fontWeight: 700,
                            }}
                          >
                            {d.year}
                            {d.isActual ? ' ✓' : isMilestone ? ' ◆' : ''}
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.85)' }}>
                            ${d.realGDP.toFixed(2)}
                          </td>
                          <td
                            style={{
                              color: d.isActual
                                ? PALETTE.gold
                                : 'rgba(255,255,255,0.6)',
                            }}
                          >
                            ${d.nominalGDP.toFixed(2)}
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.6)' }}>
                            ${d.perCapita.toLocaleString()}
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.5)' }}>
                            ${d.perCapitaReal.toLocaleString()}
                          </td>
                          <td
                            style={{
                              color:
                                d.yoyGrowth > 7
                                  ? PALETTE.teal
                                  : d.yoyGrowth > 5
                                    ? PALETTE.blue
                                    : 'rgba(255,255,255,0.5)',
                            }}
                          >
                            {d.yoyGrowth}%
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {d.pop.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <footer className="app-footer">
          <div className="footer-text">
            Data sources:{' '}
            <span className="footer-source">
              IMF WEO Apr 2026 · World Bank Open Data · UN WPP 2024
            </span>
            <br />
            Projections beyond 2026 are model-based estimates. Not
            investment advice. All values in USD.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
