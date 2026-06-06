import { type Scenario, type GdpRow, type Milestone, generateGdpData, generateMilestones } from './model';

export type StateId = 'INDIA' | 'MH' | 'TN' | 'UP' | 'GJ' | 'KA';

export const STATE_INFO: Record<StateId, { name: string; popBase2022: number; popPeakYear: number; gdpShare2022: number; growthModifier: number }> = {
  'INDIA': { name: 'India (National)', popBase2022: 1417, popPeakYear: 2060, gdpShare2022: 1.0, growthModifier: 0 },
  'MH': { name: 'Maharashtra', popBase2022: 130, popPeakYear: 2045, gdpShare2022: 0.13, growthModifier: 0.001 },
  'TN': { name: 'Tamil Nadu', popBase2022: 78, popPeakYear: 2040, gdpShare2022: 0.09, growthModifier: 0.003 },
  'UP': { name: 'Uttar Pradesh', popBase2022: 235, popPeakYear: 2065, gdpShare2022: 0.085, growthModifier: 0.012 },
  'GJ': { name: 'Gujarat', popBase2022: 71, popPeakYear: 2050, gdpShare2022: 0.083, growthModifier: 0.006 },
  'KA': { name: 'Karnataka', popBase2022: 68, popPeakYear: 2045, gdpShare2022: 0.082, growthModifier: 0.007 },
};

export function generateStateData(stateId: StateId, scenario: Scenario): GdpRow[] {
  const nationalData = generateGdpData(scenario);
  if (stateId === 'INDIA') return nationalData;

  const state = STATE_INFO[stateId];

  return nationalData.map(d => {
    const yearsFromBase = d.year - 2022;
    // Dampen the modifier over time as states converge
    const dampenedModifier = Math.pow(1 + state.growthModifier * Math.exp(-yearsFromBase / 20), yearsFromBase);
    const stateShare = state.gdpShare2022 * dampenedModifier;
    
    const nominalGDP = d.nominalGDP * stateShare;
    const realGDP = d.realGDP * stateShare;

    // State population model
    let pop = state.popBase2022 * 1e6;
    if (d.year <= state.popPeakYear) {
      const popGrowthRate = stateId === 'UP' ? 0.014 : 0.006;
      // Growth rate tapers to 0 at peak year
      const currentGrowth = popGrowthRate * (1 - (d.year - 2022) / (state.popPeakYear - 2022));
      pop = pop * Math.pow(1 + currentGrowth, yearsFromBase);
    } else {
      // Calculate peak pop (approximate)
      const popGrowthRate = stateId === 'UP' ? 0.014 : 0.006;
      const avgGrowth = popGrowthRate / 2;
      const peakPop = state.popBase2022 * 1e6 * Math.pow(1 + avgGrowth, state.popPeakYear - 2022);
      pop = peakPop * Math.pow(1 - 0.004, d.year - state.popPeakYear); // Declining pop
    }

    const perCapitaNom = (nominalGDP * 1e12) / pop;
    const perCapitaReal = (realGDP * 1e12) / pop;

    const yoyGrowth = d.yoyGrowth + (state.growthModifier * 100 * Math.exp(-yearsFromBase / 20));

    return {
      ...d,
      nominalGDP: Math.round(nominalGDP * 1000) / 1000,
      realGDP: Math.round(realGDP * 1000) / 1000,
      perCapita: Math.round(perCapitaNom / 10) * 10,
      perCapitaReal: Math.round(perCapitaReal / 10) * 10,
      pop: Math.round(pop / 1e6),
      yoyGrowth: Math.round(yoyGrowth * 10) / 10,
    };
  });
}

export function generateStateSpecificMilestones(data: GdpRow[], stateId: StateId): Milestone[] {
  if (stateId === 'INDIA') return generateMilestones(data);

  const getYearForNominal = (target: number) => data.find(d => d.nominalGDP >= target)?.year || 2075;
  const getYearForReal = (target: number) => data.find(d => d.realGDP >= target)?.year || 2075;

  return [
    { year: getYearForNominal(1.0), label: "$1T GDP Target", icon: "🏙️" },
    { year: getYearForNominal(2.0), label: "$2T Nominal GDP", icon: "🚀" },
    { year: getYearForNominal(3.0), label: "$3T Nominal GDP", icon: "🌟" },
    { year: 2047, label: `${STATE_INFO[stateId].name}@100`, icon: "🇮🇳" },
    { year: getYearForReal(5.0), label: "$5T Real GDP", icon: "🏭" },
    { year: 2075, label: "Projection End", icon: "🔭" },
  ];
}
