import { useState, useEffect } from 'react';
import { Vepari, Purchase, Payment, VepariSummary } from '@/types';

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

  const addVepari = (name: string, phone?: string) => {
    const newVepari: Vepari = {
      id: crypto.randomUUID(),
      name,
      phone,
      createdAt: new Date().toISOString(),
    };
    setVeparis((prev) => [...prev, newVepari]);
    return newVepari;
  };

  const deleteVepari = (id: string) => {
    const newVeparis = veparis.filter((v) => v.id !== id);
    const newPurchases = purchases.filter((p) => p.vepariId !== id);
    const newPayments = payments.filter((p) => p.vepariId !== id);
    
    // Save to localStorage immediately to ensure data persists before navigation
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

      return {
        ...vepari,
        totalPurchased,
        totalPaid,
        remainingWeight,
        totalStoneCharges,
        totalStoneChargesPaid,
        remainingStoneCharges,
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
  };
};
