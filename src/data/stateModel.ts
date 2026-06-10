import { type Scenario, type GdpRow, type Milestone, generateGdpData, generateMilestones } from './model';

export type StateId = 
  | 'INDIA'
  | 'AP' | 'AR' | 'AS' | 'BR' | 'CT' | 'GA' | 'GJ' | 'HR' | 'HP' | 'JH' | 'KA' | 'KL' | 'MP' | 'MH' | 'MN' | 'ML' | 'MZ' | 'NL' | 'OR' | 'PB' | 'RJ' | 'SK' | 'TN' | 'TG' | 'TR' | 'UP' | 'UT' | 'WB'
  | 'AN' | 'CH' | 'DN' | 'DL' | 'JK' | 'LA' | 'LD' | 'PY';

export const STATE_INFO: Record<StateId, { name: string; popBase2022: number; popPeakYear: number; popGrowthRate2022: number; gdpShare2022: number; growthModifier: number }> = {
  'INDIA': { name: 'India (National)', popBase2022: 1417, popPeakYear: 2060, popGrowthRate2022: 0.008, gdpShare2022: 1, growthModifier: 0 },
  'AP': { name: 'Andhra Pradesh', popBase2022: 53, popPeakYear: 2035, popGrowthRate2022: 0.006, gdpShare2022: 0.048, growthModifier: 0.002 },
  'AR': { name: 'Arunachal Pradesh', popBase2022: 1.6, popPeakYear: 2045, popGrowthRate2022: 0.01, gdpShare2022: 0.001, growthModifier: 0 },
  'AS': { name: 'Assam', popBase2022: 35.6, popPeakYear: 2050, popGrowthRate2022: 0.012, gdpShare2022: 0.018, growthModifier: 0.001 },
  'BR': { name: 'Bihar', popBase2022: 125, popPeakYear: 2065, popGrowthRate2022: 0.016, gdpShare2022: 0.03, growthModifier: 0.006 },
  'CT': { name: 'Chhattisgarh', popBase2022: 29.5, popPeakYear: 2055, popGrowthRate2022: 0.013, gdpShare2022: 0.018, growthModifier: 0.003 },
  'GA': { name: 'Goa', popBase2022: 1.6, popPeakYear: 2030, popGrowthRate2022: 0.004, gdpShare2022: 0.004, growthModifier: 0.001 },
  'GJ': { name: 'Gujarat', popBase2022: 71, popPeakYear: 2045, popGrowthRate2022: 0.011, gdpShare2022: 0.083, growthModifier: 0.006 },
  'HR': { name: 'Haryana', popBase2022: 30, popPeakYear: 2045, popGrowthRate2022: 0.012, gdpShare2022: 0.038, growthModifier: 0.005 },
  'HP': { name: 'Himachal Pradesh', popBase2022: 7.5, popPeakYear: 2040, popGrowthRate2022: 0.008, gdpShare2022: 0.008, growthModifier: 0.001 },
  'JH': { name: 'Jharkhand', popBase2022: 39, popPeakYear: 2060, popGrowthRate2022: 0.014, gdpShare2022: 0.016, growthModifier: 0.004 },
  'KA': { name: 'Karnataka', popBase2022: 68, popPeakYear: 2040, popGrowthRate2022: 0.009, gdpShare2022: 0.082, growthModifier: 0.005 },
  'KL': { name: 'Kerala', popBase2022: 35.5, popPeakYear: 2030, popGrowthRate2022: 0.003, gdpShare2022: 0.04, growthModifier: -0.001 },
  'MP': { name: 'Madhya Pradesh', popBase2022: 86, popPeakYear: 2060, popGrowthRate2022: 0.014, gdpShare2022: 0.045, growthModifier: 0.005 },
  'MH': { name: 'Maharashtra', popBase2022: 130, popPeakYear: 2045, popGrowthRate2022: 0.01, gdpShare2022: 0.135, growthModifier: 0.003 },
  'MN': { name: 'Manipur', popBase2022: 3.2, popPeakYear: 2050, popGrowthRate2022: 0.01, gdpShare2022: 0.001, growthModifier: 0 },
  'ML': { name: 'Meghalaya', popBase2022: 3.4, popPeakYear: 2055, popGrowthRate2022: 0.012, gdpShare2022: 0.001, growthModifier: 0 },
  'MZ': { name: 'Mizoram', popBase2022: 1.2, popPeakYear: 2050, popGrowthRate2022: 0.01, gdpShare2022: 0.001, growthModifier: 0 },
  'NL': { name: 'Nagaland', popBase2022: 2.3, popPeakYear: 2045, popGrowthRate2022: 0.008, gdpShare2022: 0.001, growthModifier: 0 },
  'OR': { name: 'Odisha', popBase2022: 47, popPeakYear: 2050, popGrowthRate2022: 0.01, gdpShare2022: 0.028, growthModifier: 0.004 },
  'PB': { name: 'Punjab', popBase2022: 30.5, popPeakYear: 2040, popGrowthRate2022: 0.007, gdpShare2022: 0.026, growthModifier: -0.001 },
  'RJ': { name: 'Rajasthan', popBase2022: 81, popPeakYear: 2055, popGrowthRate2022: 0.014, gdpShare2022: 0.05, growthModifier: 0.003 },
  'SK': { name: 'Sikkim', popBase2022: 0.7, popPeakYear: 2040, popGrowthRate2022: 0.008, gdpShare2022: 0.001, growthModifier: 0.001 },
  'TN': { name: 'Tamil Nadu', popBase2022: 78, popPeakYear: 2035, popGrowthRate2022: 0.005, gdpShare2022: 0.09, growthModifier: 0.004 },
  'TG': { name: 'Telangana', popBase2022: 38.5, popPeakYear: 2040, popGrowthRate2022: 0.008, gdpShare2022: 0.049, growthModifier: 0.006 },
  'TR': { name: 'Tripura', popBase2022: 4.1, popPeakYear: 2045, popGrowthRate2022: 0.009, gdpShare2022: 0.002, growthModifier: 0 },
  'UP': { name: 'Uttar Pradesh', popBase2022: 235, popPeakYear: 2065, popGrowthRate2022: 0.015, gdpShare2022: 0.085, growthModifier: 0.008 },
  'UT': { name: 'Uttarakhand', popBase2022: 11.5, popPeakYear: 2050, popGrowthRate2022: 0.01, gdpShare2022: 0.011, growthModifier: 0.002 },
  'WB': { name: 'West Bengal', popBase2022: 100, popPeakYear: 2045, popGrowthRate2022: 0.008, gdpShare2022: 0.058, growthModifier: 0.001 },
  'AN': { name: 'Andaman & Nicobar', popBase2022: 0.4, popPeakYear: 2040, popGrowthRate2022: 0.008, gdpShare2022: 0.0005, growthModifier: 0 },
  'CH': { name: 'Chandigarh', popBase2022: 1.2, popPeakYear: 2045, popGrowthRate2022: 0.01, gdpShare2022: 0.002, growthModifier: 0.001 },
  'DN': { name: 'Dadra & Nagar Haveli', popBase2022: 1, popPeakYear: 2050, popGrowthRate2022: 0.015, gdpShare2022: 0.001, growthModifier: 0.001 },
  'DL': { name: 'Delhi', popBase2022: 21, popPeakYear: 2050, popGrowthRate2022: 0.016, gdpShare2022: 0.04, growthModifier: 0.003 },
  'JK': { name: 'Jammu and Kashmir', popBase2022: 13.5, popPeakYear: 2050, popGrowthRate2022: 0.01, gdpShare2022: 0.008, growthModifier: 0.001 },
  'LA': { name: 'Ladakh', popBase2022: 0.3, popPeakYear: 2050, popGrowthRate2022: 0.008, gdpShare2022: 0.0002, growthModifier: 0 },
  'LD': { name: 'Lakshadweep', popBase2022: 0.07, popPeakYear: 2040, popGrowthRate2022: 0.006, gdpShare2022: 0.0001, growthModifier: 0 },
  'PY': { name: 'Puducherry', popBase2022: 1.4, popPeakYear: 2040, popGrowthRate2022: 0.01, gdpShare2022: 0.001, growthModifier: 0 },
};

export function generateStateData(stateId: StateId, scenario: Scenario): GdpRow[] {
  const nationalData = generateGdpData(scenario);
  if (stateId === 'INDIA') return nationalData;

  const state = STATE_INFO[stateId];
  let pop = state.popBase2022 * 1e6;
  let stateShare = state.gdpShare2022;

  return nationalData.map(d => {
    if (d.year > 2022) {
      // Smoothed demographic transition formula
      if (d.year <= state.popPeakYear) {
        // Linearly taper growth rate to 0 by peak year
        const r = state.popGrowthRate2022 * (1 - (d.year - 2022) / (state.popPeakYear - 2022));
        pop = pop * (1 + Math.max(0, r));
      } else {
        pop = pop * (1 - 0.003); // Post-peak decline
      }

      // Economic share dampening (convergence)
      // Modifier dampens logarithmically over 30 years to approach 0
      const dampening = Math.exp(-(d.year - 2022) / 30);
      const currentModifier = state.growthModifier * dampening;
      stateShare = stateShare * (1 + currentModifier);
    }
    
    const nominalGDP = d.nominalGDP * stateShare;
    const realGDP = d.realGDP * stateShare;
    const pppGDP = d.pppGDP * stateShare;

    const perCapitaNom = (nominalGDP * 1e12) / pop;
    const perCapitaReal = (realGDP * 1e12) / pop;
    const perCapitaPPP = (pppGDP * 1e12) / pop;

    const dampeningDisplay = Math.exp(-(d.year - 2022) / 30);
    const yoyGrowth = d.yoyGrowth + (state.growthModifier * 100 * dampeningDisplay);

    return {
      ...d,
      nominalGDP: Math.round(nominalGDP * 1000) / 1000,
      realGDP: Math.round(realGDP * 1000) / 1000,
      pppGDP: Math.round(pppGDP * 1000) / 1000,
      perCapita: Math.round(perCapitaNom / 10) * 10,
      perCapitaReal: Math.round(perCapitaReal / 10) * 10,
      perCapitaPPP: Math.round(perCapitaPPP / 10) * 10,
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
