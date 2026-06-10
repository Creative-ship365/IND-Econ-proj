import { type StateId } from './stateModel';
import { type GdpRow, PALETTE } from './model';

export interface BudgetSector {
  name: string;
  percentage: number;
  color: string;
}

export interface BudgetData {
  year: number;
  totalBudgetUSD: number;
  budgetRatio: number; // e.g. 0.15 for 15% of GDP
  sectors: {
    sector: BudgetSector;
    amountUSD: number;
  }[];
}

const NATIONAL_SECTORS: BudgetSector[] = [
  { name: 'Interest Payments', percentage: 0.20, color: PALETTE.coral },
  { name: 'Transfers to States', percentage: 0.20, color: '#A3E4D7' },
  { name: 'Capital Exp / Infra', percentage: 0.22, color: PALETTE.blue },
  { name: 'Defense', percentage: 0.08, color: '#F1948A' },
  { name: 'Subsidies', percentage: 0.08, color: PALETTE.gold },
  { name: 'Rural & Agri', percentage: 0.06, color: '#F5B041' },
  { name: 'Education & Health', percentage: 0.05, color: PALETTE.teal },
  { name: 'Others', percentage: 0.11, color: '#85929E' },
];

const STATE_SECTORS: BudgetSector[] = [
  { name: 'Education', percentage: 0.15, color: PALETTE.teal },
  { name: 'Infrastructure', percentage: 0.15, color: PALETTE.blue },
  { name: 'Interest & Pensions', percentage: 0.20, color: PALETTE.coral },
  { name: 'Rural & Agri', percentage: 0.10, color: '#F5B041' },
  { name: 'Police & Admin', percentage: 0.10, color: '#85929E' },
  { name: 'Health', percentage: 0.06, color: '#48C9B0' },
  { name: 'Others', percentage: 0.24, color: '#D5DBDB' },
];

export function generateBudgetData(row: GdpRow, stateId: StateId): BudgetData {
  const isNational = stateId === 'INDIA';
  const budgetRatio = isNational ? 0.15 : 0.17; // Assume 15% for National, 17% for States
  const sectorsDef = isNational ? NATIONAL_SECTORS : STATE_SECTORS;
  
  const totalBudgetUSD = row.nominalGDP * budgetRatio;
  
  const sectors = sectorsDef.map(sector => ({
    sector,
    amountUSD: totalBudgetUSD * sector.percentage
  })).sort((a, b) => b.amountUSD - a.amountUSD); // Sort largest to smallest

  return {
    year: row.year,
    totalBudgetUSD,
    budgetRatio,
    sectors
  };
}
