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
    setVeparis((prev) => prev.filter((v) => v.id !== id));
    setPurchases((prev) => prev.filter((p) => p.vepariId !== id));
    setPayments((prev) => prev.filter((p) => p.vepariId !== id));
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

      return {
        ...vepari,
        totalPurchased,
        totalPaid,
        remainingWeight,
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
  };
};
