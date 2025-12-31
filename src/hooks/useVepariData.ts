import { useState, useEffect } from 'react';
import { Vepari, Purchase, Payment, VepariSummary, OverdueItem, UpcomingDueItem, PurchaseStatus } from '@/types';
import { addDays, differenceInDays, parseISO, startOfDay } from 'date-fns';

const STORAGE_KEYS = {
  veparis: 'gold-tracker-veparis',
  purchases: 'gold-tracker-purchases',
  payments: 'gold-tracker-payments',
};

export const useVepariData = () => {
  const [veparis, setVeparis] = useState<Vepari[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const storedVeparis = localStorage.getItem(STORAGE_KEYS.veparis);
    const storedPurchases = localStorage.getItem(STORAGE_KEYS.purchases);
    const storedPayments = localStorage.getItem(STORAGE_KEYS.payments);

    if (storedVeparis) setVeparis(JSON.parse(storedVeparis));
    if (storedPurchases) setPurchases(JSON.parse(storedPurchases));
    if (storedPayments) setPayments(JSON.parse(storedPayments));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.veparis, JSON.stringify(veparis));
  }, [veparis]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
  }, [payments]);

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

  const deletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  const addPayment = (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
    };
    setPayments((prev) => [...prev, newPayment]);
    return newPayment;
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Calculate remaining grams for each purchase using FIFO
  const getPurchaseRemainingGrams = (vepariId: string): Map<string, number> => {
    const vepariPurchases = purchases
      .filter((p) => p.vepariId === vepariId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const vepariPayments = payments.filter((p) => p.vepariId === vepariId);
    let totalPaid = vepariPayments.reduce((sum, p) => sum + p.weightGrams, 0);
    
    const remainingMap = new Map<string, number>();
    
    for (const purchase of vepariPurchases) {
      if (totalPaid >= purchase.weightGrams) {
        remainingMap.set(purchase.id, 0);
        totalPaid -= purchase.weightGrams;
      } else {
        remainingMap.set(purchase.id, purchase.weightGrams - totalPaid);
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
        
        if (remainingGrams > 0 && purchase.dueDate && purchase.creditDays) {
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
        
        if (remainingGrams > 0 && purchase.dueDate && purchase.creditDays) {
          const dueDate = startOfDay(parseISO(purchase.dueDate));
          const daysUntilDue = differenceInDays(dueDate, today);
          
          if (daysUntilDue >= 0 && daysUntilDue <= days) {
            upcomingItems.push({
              purchase,
              vepari,
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

      const totalPurchased = vepariPurchases.reduce((sum, p) => sum + p.weightGrams, 0);
      const totalPaid = vepariPayments.reduce((sum, p) => sum + p.weightGrams, 0);
      const remainingWeight = totalPurchased - totalPaid;

      const totalStoneCharges = vepariPurchases.reduce((sum, p) => sum + (p.stoneCharges || 0), 0);
      const totalStoneChargesPaid = vepariPayments.reduce((sum, p) => sum + (p.stoneChargesPaid || 0), 0);
      const remainingStoneCharges = totalStoneCharges - totalStoneChargesPaid;

      // Count overdue items for this vepari
      const remainingMap = getPurchaseRemainingGrams(vepari.id);
      const today = startOfDay(new Date());
      let overdueCount = 0;
      
      for (const purchase of vepariPurchases) {
        const remainingGrams = remainingMap.get(purchase.id) || 0;
        if (remainingGrams > 0 && purchase.dueDate) {
          const dueDate = startOfDay(parseISO(purchase.dueDate));
          if (differenceInDays(today, dueDate) > 0) {
            overdueCount++;
          }
        }
      }

      return {
        ...vepari,
        totalPurchased,
        totalPaid,
        remainingWeight,
        totalStoneCharges,
        totalStoneChargesPaid,
        remainingStoneCharges,
        overdueCount,
      };
    });
  };

  const getVepariById = (id: string) => veparis.find((v) => v.id === id);

  const getVepariPurchases = (vepariId: string) =>
    purchases.filter((p) => p.vepariId === vepariId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getVepariPayments = (vepariId: string) =>
    payments.filter((p) => p.vepariId === vepariId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTotalRemaining = () => {
    const summaries = getVepariSummaries();
    return summaries.reduce((sum, s) => sum + s.remainingWeight, 0);
  };

  const getTotalRemainingStoneCharges = () => {
    const summaries = getVepariSummaries();
    return summaries.reduce((sum, s) => sum + s.remainingStoneCharges, 0);
  };

  return {
    veparis,
    purchases,
    payments,
    addVepari,
    deleteVepari,
    addPurchase,
    deletePurchase,
    addPayment,
    deletePayment,
    getVepariSummaries,
    getVepariById,
    getVepariPurchases,
    getVepariPayments,
    getTotalRemaining,
    getTotalRemainingStoneCharges,
    getPurchaseRemainingGrams,
    getPurchaseStatus,
    getOverdueItems,
    getUpcomingDueItems,
    getTotalOverdueGrams,
    getTotalOverduePenalty,
    getOverdueCount,
  };
};
