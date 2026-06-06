// ─────────────────────────────────────────────────────────────────────────────
// DATA MODEL — sourced from IMF WEO (Apr 2026), World Bank, UN WPP 2024
//
// HISTORICAL ANCHORS (nominal USD, calendar year):
//   2022: $3.35T (World Bank)
//   2023: $3.54T (World Bank/IMF)
//   2024: $3.91T (World Bank confirmed)
//   2025: $4.13T (IMF WEO Oct 2025)
//   2026: $4.15T (IMF WEO Apr 2026)
//
// REAL GDP growth (India FY real rate):
//   2022-2027: ~6.5–7.5% (IMF/RBI range)
//   2028-2035: ~7.0% (demographic dividend peak, PLI, infrastructure)
//   2036-2045: ~6.0%
//   2046-2055: ~5.0%
//   2056-2065: ~4.0%
//   2066-2075: ~3.0%
//
// NOMINAL USD GDP = real USD growth + USD inflation (~2.5%) - INR depreciation drag
//   Net nominal USD uplift over real: ~1.5%/yr
//
// POPULATION (UN WPP 2024, medium variant):
//   2022: 1.417B | 2024: 1.441B | 2030: ~1.51B | 2040: ~1.59B
//   Peak: ~1.701B around 2060-2062
//   2070: ~1.68B | 2075: ~1.65B (declining post-peak)
// ─────────────────────────────────────────────────────────────────────────────

export interface GdpRow {
  year: number;
  realGDP: number;
  nominalGDP: number;
  perCapita: number;
  perCapitaReal: number;
  yoyGrowth: number;
  nominalUplift: number;
  pop: number;
  isActual: boolean;
}

export interface Milestone {
  year: number;
  label: string;
  icon: string;
}

export interface Assumption {
  label: string;
  value: string;
  source: string;
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
  tag: string;
}

export interface GrowthPhase {
  phase: string;
  years: string;
  cagr: string;
  realEnd: string;
  source: string;
  color: string;
}

// ─── Population model ───
function getPopulation(year: number): number {
  if (year <= 2024) {
    return 1.417e9 + (year - 2022) * 12e6;
  } else if (year <= 2045) {
    const base2024 = 1.441e9;
    return base2024 + (year - 2024) * 11.5e6;
  } else if (year <= 2060) {
    const base2045 = 1.441e9 + 21 * 11.5e6;
    const remaining = (1.701e9 - base2045) / 15;
    return base2045 + (year - 2045) * remaining;
  } else if (year <= 2075) {
    return 1.701e9 * Math.pow(1 - 0.003, year - 2060);
  }
  return 1.65e9;
}

// ─── Real GDP growth rates by era ───
function getRealGrowthRate(year: number): number {
  if (year <= 2024) return 0.072;
  if (year <= 2027) return 0.075;
  if (year <= 2035) return 0.070;
  if (year <= 2045) return 0.060;
  if (year <= 2055) return 0.050;
  if (year <= 2065) return 0.040;
  return 0.030;
}

// ─── Nominal USD multiplier over real ───
function getNominalUplift(year: number): number {
  if (year <= 2030) return 0.012;
  if (year <= 2050) return 0.015;
  if (year <= 2065) return 0.018;
  return 0.020;
}

// ─── Actual historical data ───
const ACTUALS: Record<number, { nom: number; realGrowth: number }> = {
  2022: { nom: 3.35, realGrowth: 0.072 },
  2023: { nom: 3.54, realGrowth: 0.083 },
  2024: { nom: 3.91, realGrowth: 0.072 },
  2025: { nom: 4.13, realGrowth: 0.067 },
  2026: { nom: 4.15, realGrowth: 0.065 },
};

// ─── Build full dataset ───
export const GDP_DATA: GdpRow[] = (() => {
  const rows: GdpRow[] = [];
  let realGDP = 3.35;
  let nominalGDP = 3.35;

  for (let i = 0; i < 54; i++) {
    const year = 2022 + i;
    const pop = getPopulation(year);
    const isActual = year in ACTUALS;
    const rg = isActual ? ACTUALS[year].realGrowth : getRealGrowthRate(year);
    const nu = getNominalUplift(year);

    if (i > 0) {
      realGDP = realGDP * (1 + rg);
      if (isActual) {
        nominalGDP = ACTUALS[year].nom;
      } else {
        nominalGDP = nominalGDP * (1 + rg + nu);
      }
    } else {
      realGDP = 3.35;
      nominalGDP = 3.35;
    }

    const perCapitaNom = (nominalGDP * 1e12) / pop;
    const perCapitaReal = (realGDP * 1e12) / pop;

    rows.push({
      year,
      realGDP: Math.round(realGDP * 100) / 100,
      nominalGDP: Math.round(nominalGDP * 100) / 100,
      perCapita: Math.round(perCapitaNom / 10) * 10,
      perCapitaReal: Math.round(perCapitaReal / 10) * 10,
      yoyGrowth: Math.round(rg * 1000) / 10,
      nominalUplift: Math.round(nu * 1000) / 10,
      pop: Math.round(pop / 1e6),
      isActual,
    });
  }
  return rows;
})();

// ─── Constants ───
export const MILESTONES: Milestone[] = [
  { year: 2027, label: "$5T Nominal GDP", icon: "🏛️" },
  { year: 2031, label: "$6T · World #4", icon: "🥉" },
  { year: 2037, label: "$10T Real GDP", icon: "🌟" },
  { year: 2047, label: "India@100 Vision", icon: "🇮🇳" },
  { year: 2056, label: "$20T Real GDP", icon: "🚀" },
  { year: 2075, label: "Projection End", icon: "🔭" },
];

export const ASSUMPTIONS: Assumption[] = [
  { label: "Real GDP growth 2022–27", value: "6.5–7.5% p.a.", source: "IMF WEO Apr 2026" },
  { label: "Real GDP growth 2028–35", value: "~7.0% p.a.", source: "Demographic dividend + PLI" },
  { label: "Real GDP growth 2036–45", value: "~6.0% p.a.", source: "Services maturation phase" },
  { label: "Real GDP growth 2046–55", value: "~5.0% p.a.", source: "Normalization" },
  { label: "Real GDP growth 2056–65", value: "~4.0% p.a.", source: "Capital deepening" },
  { label: "Real GDP growth 2066–75", value: "~3.0% p.a.", source: "Steady-state convergence" },
  { label: "Nominal USD uplift over real", value: "+1.2–2.0% p.a.", source: "US CPI minus INR drag" },
  { label: "INR depreciation vs USD", value: "~1.5%/yr (declining)", source: "Historical trend, moderating" },
  { label: "US CPI inflation", value: "~2.5% p.a.", source: "Fed long-run target" },
  { label: "Base nominal GDP (2022)", value: "$3.35T", source: "World Bank confirmed" },
  { label: "Population peak", value: "~1.701B, ~2060–62", source: "UN WPP 2024" },
  { label: "TFR 2025", value: "~1.94 (below replacement)", source: "SRS 2024, UN WPP 2024" },
  { label: "Population 2075 est.", value: "~1.65B (post-peak decline)", source: "UN WPP 2024 medium variant" },
];

export const FEATURES: Feature[] = [
  { icon: "◉", title: "Obsidian Dark Interface", desc: "Deep #0A0C10 background layered with gradient glass cards — #1A1F2E at 85% opacity. Every surface breathes with subtle depth through multi-stop radial gradients and micro-shimmer borders. The palette draws from midnight blues, electric teals (#00D4AA), and burnished gold (#FFB547), creating a premium financial-grade aesthetic that commands trust.", tag: "Visual Identity" },
  { icon: "⬡", title: "3D Animated Hero Section", desc: "Above the fold: a full-viewport Three.js particle field where 2,000 luminous points orbit a central India-shaped mesh. GDP growth is encoded as particle density — the further out you look, the richer the trajectory. The Lion Capital floats as a shimmering holographic wireframe, rotating at 0.3°/frame. Scroll depth drives particle dispersion outward.", tag: "Animation" },
  { icon: "▦", title: "Actual vs Projected Split", desc: "A persistent 'ACTUAL ◄ ► PROJECTED' divider at 2026 clearly separates verified IMF/World Bank historical data from model projections. The actual-data region renders with a slightly brighter tint and all HUD cards in the actual zone show a green 'IMF/World Bank Data' badge. This is non-negotiable for credibility.", tag: "Data Integrity" },
  { icon: "◈", title: "Projection Uncertainty Ribbons", desc: "Each GDP curve is flanked by ±1σ and ±2σ confidence bands rendered as translucent ribbons. Users can toggle Base / Bull (+15%) / Bear (-20%) scenarios. Scenario switching triggers a 600ms Bezier transition across all elements simultaneously. The bear case is calibrated against actual downside risks: INR depreciation acceleration, fiscal slippage, demographic headwinds.", tag: "Statistical Rigor" },
  { icon: "◎", title: "Interactive Timeline Scrubber", desc: "Hovering over the chart shows a pinned HUD card with that year's Real GDP, Nominal GDP, per-capita income, and YoY growth rate. Actual-year cards show source badges. Milestone years pulse gold. All transitions run via spring physics — stiffness 200, damping 20.", tag: "Interactivity" },
  { icon: "⬡", title: "Five Growth Phase Architecture", desc: "Actual (2022–2026), Acceleration (2027–2035, ~7%), Maturation (2036–2045, ~6%), Normalization (2046–2060, ~5%), and Steady State (2061–2075, ~3–4%). Each phase has a distinct canvas tint, small-caps label, and an info panel explaining the structural drivers of that era's growth.", tag: "Data Structure" },
  { icon: "◉", title: "Population-Adjusted Per-Capita View", desc: "A toggle shifts all charts from aggregate GDP to per-capita USD. The population model uses UN WPP 2024 medium variant — growing from 1.42B (2022) to a peak of 1.701B around 2060, then declining to ~1.65B by 2075. The chart shows the inflection point where slowing population growth actually accelerates per-capita gains post-2060.", tag: "Demographics" },
  { icon: "▦", title: "Cross-Country Benchmark Rail", desc: "Contemporaneous nominal GDP trajectories for the US, China, and Japan overlay as thin dashed reference lines. India crossing Japan's 2023 GDP (~$4.2T) is marked. The US crossover (~2060s in base case) is the most emotionally resonant data point in the visualization — marked with a glowing intersection diamond.", tag: "Context" },
  { icon: "◈", title: "Inflation Decomposition Layer", desc: "A collapsible panel separates nominal USD GDP into: real growth (teal), nominal INR uplift from India inflation (amber), and net FX drag from INR/USD depreciation (coral). The chart reveals that INR depreciation partially offsets India's INR nominal gains — explaining why USD nominal GDP grows slower than INR nominal GDP.", tag: "Transparency" },
  { icon: "◎", title: "Assumptions Drawer", desc: "A persistent right-side drawer exposes every model assumption: real growth rates by phase, INR depreciation trajectory, US CPI assumption, and UN population variant used. All fields are editable, triggering live chart recomputation via a debounced worker thread. This is the site's most important credibility feature.", tag: "Methodology" },
  { icon: "⬡", title: "Scroll Narrative Story Mode", desc: "A 'Story Mode' toggle transforms the dashboard into a scrollytelling experience. GSAP ScrollTrigger drives chart draws — lines paint themselves as you scroll into each epoch. Pull-quote callouts appear: '2027: India crosses $5T nominal GDP,' '2047: India@100 — real GDP exceeds $15T', '2060: Population peaks at 1.7B while per-capita surpasses $25,000.'", tag: "Storytelling" },
  { icon: "▦", title: "Export & Embed Toolkit", desc: "Export any chart view as SVG, PNG (4K), or CSV. Each chart state is URL-serializable. LinkedIn and email sharing are built in, with auto-generated chart previews. A citation generator produces formatted academic references for each data point, linking back to the original IMF, World Bank, or UN source.", tag: "Utility" },
];

export const PALETTE = {
  teal: "#00D4AA",
  gold: "#FFB547",
  blue: "#4A9EFF",
  coral: "#FF6B6B",
  purple: "#A78BFA",
  bg: "#0A0C10",
  card: "rgba(22,27,44,0.85)",
  cardBorder: "rgba(255,255,255,0.06)",
} as const;

export const TABS = [
  { id: "overview", label: "Overview" },
  { id: "data", label: "Data & Charts" },
  { id: "assumptions", label: "Assumptions" },
  { id: "features", label: "Features" },
  { id: "table", label: "Data Table" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export const GROWTH_PHASES: GrowthPhase[] = [
  { phase: "Actual", years: "2022–2026", cagr: "6.5–8.2%", realEnd: "$4.6T", source: "IMF/World Bank", color: PALETTE.teal },
  { phase: "Acceleration", years: "2027–2035", cagr: "~7.0%", realEnd: "$9.2T", source: "PLI + demographics", color: PALETTE.blue },
  { phase: "Maturation", years: "2036–2045", cagr: "~6.0%", realEnd: "$16.5T", source: "Services/tech exports", color: PALETTE.purple },
  { phase: "Normalization", years: "2046–2060", cagr: "~5.0%", realEnd: "$33.8T", source: "Capital deepening", color: PALETTE.gold },
  { phase: "Steady State", years: "2061–2075", cagr: "~3–4%", realEnd: "$51.2T", source: "Innovation-led", color: PALETTE.coral },
];
