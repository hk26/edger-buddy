export interface Metal {
  id: string;
  name: string;
  symbol: string;
  color: string; // Tailwind color class prefix (e.g., "amber", "slate")
  displayOrder: number;
  createdAt: string;
  isDefault?: boolean;
}

export interface Vepari {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
  defaultCreditDays?: number;
  defaultPenaltyPercentPerDay?: number;
}

export interface Purchase {
  id: string;
  vepariId: string;
  metalId: string;
  date: string;
  itemDescription?: string;
  weightGrams: number;
  ratePerGram?: number;
  stoneCharges?: number;
  notes?: string;
  creditDays?: number;
  penaltyPercentPerDay?: number;
  dueDate?: string;
}

export interface Payment {
  id: string;
  vepariId: string;
  metalId: string;
  date: string;
  weightGrams: number;
  ratePerGram: number;
  amount: number;
  stoneChargesPaid?: number;
  notes?: string;
}

export interface MetalSummary {
  metalId: string;
  metalName: string;
  metalSymbol: string;
  metalColor: string;
  totalPurchased: number;
  totalPaid: number;
  remainingWeight: number;
  totalStoneCharges: number;
  totalStoneChargesPaid: number;
  remainingStoneCharges: number;
  overdueCount: number;
}

export interface VepariSummary extends Vepari {
  metalSummaries: MetalSummary[];
  totalRemainingWeight: number;
  totalRemainingStoneCharges: number;
  totalOverdueCount: number;
  // Legacy fields for backward compatibility
  totalPurchased: number;
  totalPaid: number;
  remainingWeight: number;
  totalStoneCharges: number;
  totalStoneChargesPaid: number;
  remainingStoneCharges: number;
  overdueCount?: number;
}

export interface OverdueItem {
  purchase: Purchase;
  vepari: Vepari;
  metal: Metal;
  remainingGrams: number;
  daysOverdue: number;
  estimatedPenaltyPercent: number;
  estimatedPenaltyAmount: number;
}

export interface UpcomingDueItem {
  purchase: Purchase;
  vepari: Vepari;
  metal: Metal;
  remainingGrams: number;
  daysUntilDue: number;
}

export type PurchaseStatus = 'paid' | 'overdue' | 'upcoming' | 'normal' | 'no-credit';
