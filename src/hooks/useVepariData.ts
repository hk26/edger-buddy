import { useState, useEffect } from 'react';
import { Vepari, Purchase, Payment, Metal, VepariSummary, MetalSummary, OverdueItem, UpcomingDueItem, PurchaseStatus } from '@/types';
import { addDays, differenceInDays, parseISO, startOfDay } from 'date-fns';

const STORAGE_KEYS = {
  veparis: 'gold-tracker-veparis',
  purchases: 'gold-tracker-purchases',
  payments: 'gold-tracker-payments',
  metals: 'gold-tracker-metals',
};

const DEFAULT_METALS: Metal[] = [
  { id: 'gold', name: 'Gold', symbol: 'Au', color: 'amber', displayOrder: 1, createdAt: new Date().toISOString(), isDefault: true },
  { id: 'silver', name: 'Silver', symbol: 'Ag', color: 'slate', displayOrder: 2, createdAt: new Date().toISOString(), isDefault: true },
];

export const useVepariData = () => {
  const [veparis, setVeparis] = useState<Vepari[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [metals, setMetals] = useState<Metal[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const storedVeparis = localStorage.getItem(STORAGE_KEYS.veparis);
    const storedPurchases = localStorage.getItem(STORAGE_KEYS.purchases);
    const storedPayments = localStorage.getItem(STORAGE_KEYS.payments);
    const storedMetals = localStorage.getItem(STORAGE_KEYS.metals);

    if (storedVeparis) setVeparis(JSON.parse(storedVeparis));
    
    // Migrate purchases - assign 'gold' metalId if missing, add purchaseType
    if (storedPurchases) {
      const parsedPurchases = JSON.parse(storedPurchases);
      const migratedPurchases = parsedPurchases.map((p: any) => ({
        ...p,
        metalId: p.metalId || 'gold',
        purchaseType: p.purchaseType || 'regular',
      }));
      setPurchases(migratedPurchases);
      // Save migrated data back
      if (parsedPurchases.some((p: any) => !p.metalId || !p.purchaseType)) {
        localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(migratedPurchases));
      }
    }
    
    // Migrate payments - assign 'gold' metalId if missing, add paymentType
    if (storedPayments) {
      const parsedPayments = JSON.parse(storedPayments);
      const migratedPayments = parsedPayments.map((p: any) => ({
        ...p,
        metalId: p.metalId || 'gold',
        paymentType: p.paymentType || 'metal',
        // Migrate old weightGrams/ratePerGram to new optional fields
        weightGrams: p.weightGrams,
        ratePerGram: p.ratePerGram,
        amount: p.amount,
      }));
      setPayments(migratedPayments);
      // Save migrated data back
      if (parsedPayments.some((p: any) => !p.metalId || !p.paymentType)) {
        localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(migratedPayments));
      }
    }

    // Load metals or use defaults
    if (storedMetals) {
      setMetals(JSON.parse(storedMetals));
    } else {
      setMetals(DEFAULT_METALS);
      localStorage.setItem(STORAGE_KEYS.metals, JSON.stringify(DEFAULT_METALS));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (veparis.length > 0 || localStorage.getItem(STORAGE_KEYS.veparis)) {
      localStorage.setItem(STORAGE_KEYS.veparis, JSON.stringify(veparis));
    }
  }, [veparis]);

  useEffect(() => {
    if (purchases.length > 0 || localStorage.getItem(STORAGE_KEYS.purchases)) {
      localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(purchases));
    }
  }, [purchases]);

  useEffect(() => {
    if (payments.length > 0 || localStorage.getItem(STORAGE_KEYS.payments)) {
      localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
    }
  }, [payments]);

  useEffect(() => {
    if (metals.length > 0) {
      localStorage.setItem(STORAGE_KEYS.metals, JSON.stringify(metals));
    }
  }, [metals]);

  // Metal CRUD operations
  const getMetals = (): Metal[] => {
    return [...metals].sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const getMetalById = (id: string): Metal | undefined => {
    return metals.find((m) => m.id === id);
  };

  const addMetal = (name: string, symbol: string, color: string) => {
    const maxOrder = Math.max(...metals.map((m) => m.displayOrder), 0);
    const newMetal: Metal = {
      id: crypto.randomUUID(),
      name,
      symbol,
      color,
      displayOrder: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };
    setMetals((prev) => [...prev, newMetal]);
    return newMetal;
  };

  const updateMetal = (id: string, updates: Partial<Omit<Metal, 'id' | 'createdAt' | 'isDefault'>>) => {
    setMetals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMetal = (id: string) => {
    const metal = metals.find((m) => m.id === id);
    if (metal?.isDefault) return false; // Cannot delete default metals
    
    // Check if metal is used in any transactions
    const hasTransactions = 
      purchases.some((p) => p.metalId === id) || 
      payments.some((p) => p.metalId === id);
    
    if (hasTransactions) return false; // Cannot delete metal with transactions
    
    setMetals((prev) => prev.filter((m) => m.id !== id));
    return true;
  };

  const canDeleteMetal = (id: string): boolean => {
    const metal = metals.find((m) => m.id === id);
    if (metal?.isDefault) return false;
    
    const hasTransactions = 
      purchases.some((p) => p.metalId === id) || 
      payments.some((p) => p.metalId === id);
    
    return !hasTransactions;
  };

  // Vepari CRUD
  const addVepari = (name: string, phone?: string, defaultCreditDays?: number, defaultPenaltyPercentPerDay?: number) => {
    const newVepari: Vepari = {
      id: crypto.randomUUID(),
      name,
      phone,
      createdAt: new Date().toISOString(),
      defaultCreditDays,
      defaultPenaltyPercentPerDay: defaultCreditDays ? (defaultPenaltyPercentPerDay ?? 0.1) : undefined,
    };
    setVeparis((prev) => [...prev, newVepari]);
    return newVepari;
  };

  const updateVepari = (id: string, updates: Partial<Omit<Vepari, 'id' | 'createdAt'>>) => {
    setVeparis((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const deleteVepari = (id: string) => {
    const newVeparis = veparis.filter((v) => v.id !== id);
    const newPurchases = purchases.filter((p) => p.vepariId !== id);
    const newPayments = payments.filter((p) => p.vepariId !== id);
    
    localStorage.setItem(STORAGE_KEYS.veparis, JSON.stringify(newVeparis));
    localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(newPurchases));
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(newPayments));
    
    setVeparis(newVeparis);
    setPurchases(newPurchases);
    setPayments(newPayments);
  };

  // Purchase CRUD
  const addPurchase = (purchase: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: crypto.randomUUID(),
      dueDate: purchase.creditDays 
        ? addDays(parseISO(purchase.date), purchase.creditDays).toISOString().split('T')[0]
        : undefined,
    };
    setPurchases((prev) => [...prev, newPurchase]);
    return newPurchase;
  };

  const updatePurchase = (id: string, updates: Partial<Omit<Purchase, 'id' | 'vepariId'>>) => {
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        // Recalculate due date if credit days or date changed
        if (updates.creditDays !== undefined || updates.date !== undefined) {
          updated.dueDate = updated.creditDays 
            ? addDays(parseISO(updated.date), updated.creditDays).toISOString().split('T')[0]
            : undefined;
        }
        return updated;
      })
    );
  };

  const deletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  // Payment CRUD
  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
    };
    setPayments((prev) => [...prev, newPayment]);
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Omit<Payment, 'id' | 'vepariId'>>) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        // Recalculate amount if weight or rate changed
        if (updates.weightGrams !== undefined || updates.ratePerGram !== undefined) {
          updated.amount = updated.weightGrams * updated.ratePerGram;
        }
        return updated;
      })
    );
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Calculate remaining grams for each purchase using FIFO (filtered by metal)
  // Only considers regular purchases (not cash or bullion)
  const getPurchaseRemainingGrams = (vepariId: string, metalId?: string): Map<string, number> => {
    const vepariPurchases = purchases
      .filter((p) => p.vepariId === vepariId && (!metalId || p.metalId === metalId))
      .filter((p) => p.purchaseType === 'regular' || !p.purchaseType) // Only regular purchases
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const vepariPayments = payments
      .filter((p) => p.vepariId === vepariId && (!metalId || p.metalId === metalId))
      .filter((p) => p.paymentType === 'metal' || !p.paymentType); // Only metal payments
    let totalPaid = vepariPayments.reduce((sum, p) => sum + (p.weightGrams || 0), 0);
    
    const remainingMap = new Map<string, number>();
    
    for (const purchase of vepariPurchases) {
      const purchaseWeight = purchase.weightGrams || 0;
      if (totalPaid >= purchaseWeight) {
        remainingMap.set(purchase.id, 0);
        totalPaid -= purchaseWeight;
      } else {
        remainingMap.set(purchase.id, purchaseWeight - totalPaid);
        totalPaid = 0;
      }
    }
    
    return remainingMap;
  };

  const getPurchaseStatus = (purchase: Purchase, remainingGrams: number): PurchaseStatus => {
    if (remainingGrams <= 0) return 'paid';
    if (!purchase.creditDays || !purchase.dueDate) return 'no-credit';
    
    const today = startOfDay(new Date());
    const dueDate = startOfDay(parseISO(purchase.dueDate));
    const daysDiff = differenceInDays(dueDate, today);
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff <= 3) return 'upcoming';
    return 'normal';
  };

  const getOverdueItems = (): OverdueItem[] => {
    const today = startOfDay(new Date());
    const overdueItems: OverdueItem[] = [];
    
    for (const vepari of veparis) {
      const remainingMap = getPurchaseRemainingGrams(vepari.id);
      const vepariPurchases = purchases.filter((p) => p.vepariId === vepari.id);
      
      for (const purchase of vepariPurchases) {
        const remainingGrams = remainingMap.get(purchase.id) || 0;
        const metal = getMetalById(purchase.metalId);
        
        if (remainingGrams > 0 && purchase.dueDate && purchase.creditDays && metal) {
          const dueDate = startOfDay(parseISO(purchase.dueDate));
          const daysOverdue = differenceInDays(today, dueDate);
          
          if (daysOverdue > 0) {
            const penaltyPercent = daysOverdue * (purchase.penaltyPercentPerDay || 0.1);
            const estimatedAmount = purchase.ratePerGram 
              ? remainingGrams * purchase.ratePerGram * penaltyPercent / 100
              : 0;
            
            overdueItems.push({
              purchase,
              vepari,
              metal,
              remainingGrams,
              daysOverdue,
              estimatedPenaltyPercent: penaltyPercent,
              estimatedPenaltyAmount: estimatedAmount,
            });
          }
        }
      }
    }
    
    return overdueItems.sort((a, b) => b.daysOverdue - a.daysOverdue);
  };

  const getUpcomingDueItems = (days: number = 3): UpcomingDueItem[] => {
    const today = startOfDay(new Date());
    const upcomingItems: UpcomingDueItem[] = [];
    
    for (const vepari of veparis) {
      const remainingMap = getPurchaseRemainingGrams(vepari.id);
      const vepariPurchases = purchases.filter((p) => p.vepariId === vepari.id);
      
      for (const purchase of vepariPurchases) {
        const remainingGrams = remainingMap.get(purchase.id) || 0;
        const metal = getMetalById(purchase.metalId);
        
        if (remainingGrams > 0 && purchase.dueDate && purchase.creditDays && metal) {
          const dueDate = startOfDay(parseISO(purchase.dueDate));
          const daysUntilDue = differenceInDays(dueDate, today);
          
          if (daysUntilDue >= 0 && daysUntilDue <= days) {
            upcomingItems.push({
              purchase,
              vepari,
              metal,
              remainingGrams,
              daysUntilDue,
            });
          }
        }
      }
    }
    
    return upcomingItems.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  };

  const getTotalOverdueGrams = (): number => {
    return getOverdueItems().reduce((sum, item) => sum + item.remainingGrams, 0);
  };

  const getTotalOverduePenalty = (): number => {
    return getOverdueItems().reduce((sum, item) => sum + item.estimatedPenaltyAmount, 0);
  };

  const getOverdueCount = (): number => {
    return getOverdueItems().length;
  };

  const getVepariSummaries = (): VepariSummary[] => {
    return veparis.map((vepari) => {
      const vepariPurchases = purchases.filter((p) => p.vepariId === vepari.id);
      const vepariPayments = payments.filter((p) => p.vepariId === vepari.id);

      // Get unique metals used by this vepari
      const metalIds = new Set([
        ...vepariPurchases.map((p) => p.metalId),
        ...vepariPayments.map((p) => p.metalId),
      ]);

      // Find the most recent payment date
      const lastPaymentDate = vepariPayments.length > 0
        ? vepariPayments
            .map(p => p.date)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
        : undefined;

      const metalSummaries: MetalSummary[] = [];
      let totalRemainingWeight = 0;
      let totalRemainingStoneCharges = 0;
      let totalOverdueCount = 0;

      // Legacy totals
      let totalPurchased = 0;
      let totalPaid = 0;
      let totalStoneCharges = 0;
      let totalStoneChargesPaid = 0;

      for (const metalId of metalIds) {
        const metal = getMetalById(metalId);
        if (!metal) continue;

        const metalPurchases = vepariPurchases.filter((p) => p.metalId === metalId);
        const metalPayments = vepariPayments.filter((p) => p.metalId === metalId);

        // Regular purchases (metal-based)
        const regularPurchases = metalPurchases.filter(p => p.purchaseType === 'regular' || !p.purchaseType);
        const purchased = regularPurchases.reduce((sum, p) => sum + (p.weightGrams || 0), 0);
        
        // Metal payments
        const metalTypePayments = metalPayments.filter(p => p.paymentType === 'metal' || !p.paymentType);
        const paid = metalTypePayments.reduce((sum, p) => sum + (p.weightGrams || 0), 0);
        const remaining = purchased - paid;

        const stoneCharges = metalPurchases.reduce((sum, p) => sum + (p.stoneCharges || 0), 0);
        const stoneChargesPaid = metalTypePayments.reduce((sum, p) => sum + (p.stoneChargesPaid || 0), 0);
        const remainingStone = stoneCharges - stoneChargesPaid;

        // Cash purchases and payments
        const cashPurchases = metalPurchases.filter(p => p.purchaseType === 'cash');
        const totalCashPurchased = cashPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        
        const cashTypePayments = metalPayments.filter(p => p.paymentType === 'cash');
        const totalCashPaid = cashTypePayments.reduce((sum, p) => sum + (p.cashAmount || 0), 0);
        const remainingCash = totalCashPurchased - totalCashPaid;

        // Bullion purchases
        const bullionPurchases = metalPurchases.filter(p => p.purchaseType === 'bullion');
        const totalFineGoldGiven = bullionPurchases.reduce((sum, p) => sum + (p.fineGoldCalculated || 0), 0);
        const totalFreshMetalReceived = bullionPurchases.reduce((sum, p) => sum + (p.freshMetalReceived || 0), 0);
        
        // Bullion balance: positive = you owe them, negative = they owe you
        const bullionBalanceGrams = bullionPurchases
          .filter(p => !p.balanceConvertedToMoney)
          .reduce((sum, p) => sum + (p.balanceGrams || 0), 0);
        
        const bullionBalanceCash = bullionPurchases
          .filter(p => p.balanceConvertedToMoney)
          .reduce((sum, p) => sum + (p.balanceCashAmount || 0), 0);

        // Count overdue items for this metal
        const remainingMap = getPurchaseRemainingGrams(vepari.id, metalId);
        const today = startOfDay(new Date());
        let overdueCount = 0;
        
        for (const purchase of regularPurchases) {
          const remainingGrams = remainingMap.get(purchase.id) || 0;
          if (remainingGrams > 0 && purchase.dueDate) {
            const dueDate = startOfDay(parseISO(purchase.dueDate));
            if (differenceInDays(today, dueDate) > 0) {
              overdueCount++;
            }
          }
        }

        metalSummaries.push({
          metalId,
          metalName: metal.name,
          metalSymbol: metal.symbol,
          metalColor: metal.color,
          totalPurchased: purchased,
          totalPaid: paid,
          remainingWeight: remaining,
          totalStoneCharges: stoneCharges,
          totalStoneChargesPaid: stoneChargesPaid,
          remainingStoneCharges: remainingStone,
          overdueCount,
          // Cash tracking
          totalCashPurchased,
          totalCashPaid,
          remainingCash,
          // Bullion tracking
          totalFineGoldGiven,
          totalFreshMetalReceived,
          bullionBalanceGrams,
          bullionBalanceCash,
        });

        totalRemainingWeight += remaining;
        totalRemainingStoneCharges += remainingStone;
        totalOverdueCount += overdueCount;

        totalPurchased += purchased;
        totalPaid += paid;
        totalStoneCharges += stoneCharges;
        totalStoneChargesPaid += stoneChargesPaid;
      }

      // Sort metal summaries by display order
      metalSummaries.sort((a, b) => {
        const metalA = getMetalById(a.metalId);
        const metalB = getMetalById(b.metalId);
        return (metalA?.displayOrder || 0) - (metalB?.displayOrder || 0);
      });

      return {
        ...vepari,
        metalSummaries,
        totalRemainingWeight,
        totalRemainingStoneCharges,
        totalOverdueCount,
        lastPaymentDate,
        // Legacy fields
        totalPurchased,
        totalPaid,
        remainingWeight: totalRemainingWeight,
        totalStoneCharges,
        totalStoneChargesPaid,
        remainingStoneCharges: totalRemainingStoneCharges,
        overdueCount: totalOverdueCount,
      };
    });
  };

  const getVepariById = (id: string) => veparis.find((v) => v.id === id);

  const getVepariPurchases = (vepariId: string, metalId?: string) =>
    purchases
      .filter((p) => p.vepariId === vepariId && (!metalId || p.metalId === metalId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getVepariPayments = (vepariId: string, metalId?: string) =>
    payments
      .filter((p) => p.vepariId === vepariId && (!metalId || p.metalId === metalId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTotalRemaining = () => {
    const summaries = getVepariSummaries();
    return summaries.reduce((sum, s) => sum + s.totalRemainingWeight, 0);
  };

  const getTotalRemainingStoneCharges = () => {
    const summaries = getVepariSummaries();
    return summaries.reduce((sum, s) => sum + s.totalRemainingStoneCharges, 0);
  };

  const getTotalRemainingByMetal = (): Map<string, number> => {
    const summaries = getVepariSummaries();
    const metalTotals = new Map<string, number>();
    
    for (const summary of summaries) {
      for (const metalSummary of summary.metalSummaries) {
        const current = metalTotals.get(metalSummary.metalId) || 0;
        metalTotals.set(metalSummary.metalId, current + metalSummary.remainingWeight);
      }
    }
    
    return metalTotals;
  };

  const getMetalTotalSummaries = () => {
    const summaries = getVepariSummaries();
    const metalTotals: Record<string, { remaining: number; stoneCharges: number; vepariCount: number }> = {};
    
    for (const summary of summaries) {
      for (const metalSummary of summary.metalSummaries) {
        if (!metalTotals[metalSummary.metalId]) {
          metalTotals[metalSummary.metalId] = { remaining: 0, stoneCharges: 0, vepariCount: 0 };
        }
        metalTotals[metalSummary.metalId].remaining += metalSummary.remainingWeight;
        metalTotals[metalSummary.metalId].stoneCharges += metalSummary.remainingStoneCharges;
        if (metalSummary.remainingWeight > 0 || metalSummary.remainingStoneCharges > 0) {
          metalTotals[metalSummary.metalId].vepariCount += 1;
        }
      }
    }
    
    return getMetals()
      .filter((metal) => metalTotals[metal.id])
      .map((metal) => ({
        metal,
        ...metalTotals[metal.id],
      }));
  };

  return {
    veparis,
    purchases,
    payments,
    metals,
    // Metal operations
    getMetals,
    getMetalById,
    addMetal,
    updateMetal,
    deleteMetal,
    canDeleteMetal,
    // Vepari operations
    addVepari,
    updateVepari,
    deleteVepari,
    getVepariSummaries,
    getVepariById,
    getVepariPurchases,
    getVepariPayments,
    // Purchase/Payment operations
    addPurchase,
    updatePurchase,
    deletePurchase,
    addPayment,
    updatePayment,
    deletePayment,
    // Calculations
    getTotalRemaining,
    getTotalRemainingStoneCharges,
    getTotalRemainingByMetal,
    getMetalTotalSummaries,
    getPurchaseRemainingGrams,
    getPurchaseStatus,
    getOverdueItems,
    getUpcomingDueItems,
    getTotalOverdueGrams,
    getTotalOverduePenalty,
    getOverdueCount,
  };
};
