export interface Vepari {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  vepariId: string;
  date: string;
  itemDescription?: string;
  weightGrams: number;
  ratePerGram?: number;
  notes?: string;
}

export interface Payment {
  id: string;
  vepariId: string;
  date: string;
  weightGrams: number;
  ratePerGram: number;
  amount: number;
  notes?: string;
}

export interface VepariSummary extends Vepari {
  totalPurchased: number;
  totalPaid: number;
  remainingWeight: number;
}
