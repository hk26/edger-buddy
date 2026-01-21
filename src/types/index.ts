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

export type PurchaseType = 'regular' | 'cash' | 'bullion';

export interface Purchase {
  id: string;
  vepariId: string;
  metalId: string;
  date: string;
  purchaseType: PurchaseType;
  
  // Common fields
  itemDescription?: string;
  notes?: string;
  
  // Regular purchase fields (metal-based tracking)
  weightGrams?: number;
  ratePerGram?: number;
  stoneCharges?: number;
  creditDays?: number;
  penaltyPercentPerDay?: number;
  dueDate?: string;
  
  // Cash purchase fields
  totalAmount?: number;              // Fixed total amount for cash purchases
  labourCharges?: number;
  
  // Bullion purchase fields (all-in-one form)
  oldGoldWeight?: number;            // Weight of old gold given (e.g., 147g)
  oldGoldTouch?: number;             // Touch/purity % (e.g., 87)
  fineGoldCalculated?: number;       // Calculated: oldGoldWeight × oldGoldTouch/100
  freshMetalReceived?: number;       // Fresh bars received (e.g., 130g)
  balanceGrams?: number;             // Remaining balance (+ve = owe them, -ve = credit)
  balanceConvertedToMoney?: boolean; // If balance was settled in cash
  balanceRate?: number;              // Rate used for cash conversion
  balanceCashAmount?: number;        // Total cash for balance settlement
}

export type PaymentType = 'metal' | 'cash';

export interface Payment {
  id: string;
  vepariId: string;
  metalId: string;
  date: string;
  paymentType: PaymentType;
  
  // Metal payment fields
  weightGrams?: number;
  ratePerGram?: number;
  amount?: number;
  stoneChargesPaid?: number;
  
  // Cash payment fields
  cashAmount?: number;               // Direct cash payment amount
  paymentMode?: string;              // Cash, UPI, Bank Transfer
  
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
  
  // Cash tracking
  totalCashPurchased: number;
  totalCashPaid: number;
  remainingCash: number;
  
  // Bullion tracking
  totalFineGoldGiven: number;
  totalFreshMetalReceived: number;
  bullionBalanceGrams: number;
  bullionBalanceCash: number;
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

// ============= Customer Ledger Types =============

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface CustomerPurchase {
  id: string;
  customerId: string;
  metalId: string;
  date: string;
  itemDescription?: string;
  weightGrams: number;
  purchaseRatePerGram: number;   // Your buying rate (cost)
  saleRatePerGram: number;       // Your selling rate to customer
  makingCharges?: number;
  stoneCharges?: number;
  notes?: string;
  deliveredGrams: number;        // Track partial delivery
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  purchaseId?: string;
  date: string;
  amount: number;
  paymentMode?: string;
  notes?: string;
}

export interface DeliveryRecord {
  id: string;
  customerId: string;
  purchaseId: string;
  date: string;
  weightGrams: number;
  notes?: string;
}

export interface CustomerMetalSummary {
  metalId: string;
  metalName: string;
  metalSymbol: string;
  metalColor: string;
  totalGrams: number;
  deliveredGrams: number;
  pendingGrams: number;
  totalSaleValue: number;
  totalCostValue: number;
  totalMakingCharges: number;
  totalStoneCharges: number;
  totalPaid: number;
  pendingAmount: number;
  grossProfit: number;
}

export interface CustomerSummary extends Customer {
  metalSummaries: CustomerMetalSummary[];
  totalPurchaseValue: number;
  totalCostValue: number;
  totalPaid: number;
  totalPending: number;
  totalGramsPurchased: number;
  totalGramsDelivered: number;
  totalGramsPending: number;
  totalGrossProfit: number;
}

export interface ProfitReport {
  metalId: string;
  metalName: string;
  metalSymbol: string;
  metalColor: string;
  totalPurchasedGrams: number;
  avgBuyRate: number;
  totalSoldGrams: number;
  avgSellRate: number;
  totalCost: number;
  totalRevenue: number;
  totalMakingCharges: number;
  grossProfit: number;
  profitMarginPercent: number;
}
