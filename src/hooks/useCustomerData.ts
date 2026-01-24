import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Customer, 
  CustomerPurchase, 
  CustomerPayment, 
  DeliveryRecord, 
  CustomerSummary, 
  CustomerMetalSummary,
  Metal 
} from '@/types';

const STORAGE_KEYS = {
  customers: 'gold-tracker-customers',
  customerPurchases: 'gold-tracker-customer-purchases',
  customerPayments: 'gold-tracker-customer-payments',
  deliveryRecords: 'gold-tracker-delivery-records',
};

export const useCustomerData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerPurchases, setCustomerPurchases] = useState<CustomerPurchase[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const storedCustomers = localStorage.getItem(STORAGE_KEYS.customers);
    const storedPurchases = localStorage.getItem(STORAGE_KEYS.customerPurchases);
    const storedPayments = localStorage.getItem(STORAGE_KEYS.customerPayments);
    const storedDeliveries = localStorage.getItem(STORAGE_KEYS.deliveryRecords);

    if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    if (storedPurchases) setCustomerPurchases(JSON.parse(storedPurchases));
    if (storedPayments) setCustomerPayments(JSON.parse(storedPayments));
    if (storedDeliveries) setDeliveryRecords(JSON.parse(storedDeliveries));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (customers.length > 0 || localStorage.getItem(STORAGE_KEYS.customers)) {
      localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    if (customerPurchases.length > 0 || localStorage.getItem(STORAGE_KEYS.customerPurchases)) {
      localStorage.setItem(STORAGE_KEYS.customerPurchases, JSON.stringify(customerPurchases));
    }
  }, [customerPurchases]);

  useEffect(() => {
    if (customerPayments.length > 0 || localStorage.getItem(STORAGE_KEYS.customerPayments)) {
      localStorage.setItem(STORAGE_KEYS.customerPayments, JSON.stringify(customerPayments));
    }
  }, [customerPayments]);

  useEffect(() => {
    if (deliveryRecords.length > 0 || localStorage.getItem(STORAGE_KEYS.deliveryRecords)) {
      localStorage.setItem(STORAGE_KEYS.deliveryRecords, JSON.stringify(deliveryRecords));
    }
  }, [deliveryRecords]);

  // Customer CRUD - stable references
  const addCustomer = useCallback((name: string, phone?: string) => {
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name,
      phone,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    const newCustomers = customers.filter((c) => c.id !== id);
    const newPurchases = customerPurchases.filter((p) => p.customerId !== id);
    const newPayments = customerPayments.filter((p) => p.customerId !== id);
    const newDeliveries = deliveryRecords.filter((d) => d.customerId !== id);

    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(newCustomers));
    localStorage.setItem(STORAGE_KEYS.customerPurchases, JSON.stringify(newPurchases));
    localStorage.setItem(STORAGE_KEYS.customerPayments, JSON.stringify(newPayments));
    localStorage.setItem(STORAGE_KEYS.deliveryRecords, JSON.stringify(newDeliveries));

    setCustomers(newCustomers);
    setCustomerPurchases(newPurchases);
    setCustomerPayments(newPayments);
    setDeliveryRecords(newDeliveries);
  }, [customers, customerPurchases, customerPayments, deliveryRecords]);

  // Customer Purchase CRUD - stable references
  const addCustomerPurchase = useCallback((purchase: Omit<CustomerPurchase, 'id' | 'deliveredGrams'>) => {
    const newPurchase: CustomerPurchase = {
      ...purchase,
      id: crypto.randomUUID(),
      deliveredGrams: 0,
    };
    setCustomerPurchases((prev) => [...prev, newPurchase]);
    return newPurchase;
  }, []);

  const updateCustomerPurchase = useCallback((id: string, updates: Partial<Omit<CustomerPurchase, 'id' | 'customerId'>>) => {
    setCustomerPurchases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteCustomerPurchase = useCallback((id: string) => {
    setCustomerPurchases((prev) => prev.filter((p) => p.id !== id));
    // Also delete associated deliveries
    setDeliveryRecords((prev) => prev.filter((d) => d.purchaseId !== id));
  }, []);

  // Customer Payment CRUD - stable references
  const addCustomerPayment = useCallback((payment: Omit<CustomerPayment, 'id'>) => {
    const newPayment: CustomerPayment = {
      ...payment,
      id: crypto.randomUUID(),
    };
    setCustomerPayments((prev) => [...prev, newPayment]);
    return newPayment;
  }, []);

  const updateCustomerPayment = useCallback((id: string, updates: Partial<Omit<CustomerPayment, 'id' | 'customerId'>>) => {
    setCustomerPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteCustomerPayment = useCallback((id: string) => {
    setCustomerPayments((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Delivery Recording - stable reference
  const addDelivery = useCallback((customerId: string, purchaseId: string, weightGrams: number, date: string, notes?: string) => {
    const purchase = customerPurchases.find((p) => p.id === purchaseId);
    if (!purchase) return null;

    const currentDelivered = purchase.deliveredGrams || 0;
    const remaining = purchase.weightGrams - currentDelivered;
    
    if (weightGrams > remaining) return null; // Cannot deliver more than remaining

    const newDelivery: DeliveryRecord = {
      id: crypto.randomUUID(),
      customerId,
      purchaseId,
      date,
      weightGrams,
      notes,
    };

    setDeliveryRecords((prev) => [...prev, newDelivery]);
    
    // Update the purchase's delivered grams
    setCustomerPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId
          ? { ...p, deliveredGrams: currentDelivered + weightGrams }
          : p
      )
    );

    return newDelivery;
  }, [customerPurchases]);

  const getDeliveryHistory = useCallback((customerId: string, purchaseId?: string) => {
    return deliveryRecords
      .filter((d) => d.customerId === customerId && (!purchaseId || d.purchaseId === purchaseId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [deliveryRecords]);

  // Memoized customer summaries - the most expensive calculation
  const computeCustomerSummaries = useCallback((metals: Metal[]): CustomerSummary[] => {
    const getMetalById = (id: string) => metals.find((m) => m.id === id);

    return customers.map((customer) => {
      const custPurchases = customerPurchases.filter((p) => p.customerId === customer.id);
      const custPayments = customerPayments.filter((p) => p.customerId === customer.id);

      const metalIds = new Set(custPurchases.map((p) => p.metalId));
      const metalSummaries: CustomerMetalSummary[] = [];

      let totalPurchaseValue = 0;
      let totalCostValue = 0;
      let totalPaid = 0;
      let totalGramsPurchased = 0;
      let totalGramsDelivered = 0;
      let totalGrossProfit = 0;

      for (const metalId of metalIds) {
        const metal = getMetalById(metalId);
        if (!metal) continue;

        const metalPurchases = custPurchases.filter((p) => p.metalId === metalId);
        const metalPayments = custPayments.filter((p) => {
          if (p.purchaseId) {
            const purchase = customerPurchases.find((cp) => cp.id === p.purchaseId);
            return purchase?.metalId === metalId;
          }
          return true; // Include unlinked payments
        });

        const grams = metalPurchases.reduce((sum, p) => sum + p.weightGrams, 0);
        const delivered = metalPurchases.reduce((sum, p) => sum + (p.deliveredGrams || 0), 0);
        const saleValue = metalPurchases.reduce(
          (sum, p) => sum + (p.weightGrams * p.saleRatePerGram) + (p.makingCharges || 0) + (p.stoneCharges || 0),
          0
        );
        const costValue = metalPurchases.reduce(
          (sum, p) => sum + (p.weightGrams * p.purchaseRatePerGram),
          0
        );
        const makingCharges = metalPurchases.reduce((sum, p) => sum + (p.makingCharges || 0), 0);
        const stoneCharges = metalPurchases.reduce((sum, p) => sum + (p.stoneCharges || 0), 0);
        const paid = metalPayments.reduce((sum, p) => sum + p.amount, 0);
        const grossProfit = saleValue - costValue;

        metalSummaries.push({
          metalId,
          metalName: metal.name,
          metalSymbol: metal.symbol,
          metalColor: metal.color,
          totalGrams: grams,
          deliveredGrams: delivered,
          pendingGrams: grams - delivered,
          totalSaleValue: saleValue,
          totalCostValue: costValue,
          totalMakingCharges: makingCharges,
          totalStoneCharges: stoneCharges,
          totalPaid: paid,
          pendingAmount: saleValue - paid,
          grossProfit,
        });

        totalPurchaseValue += saleValue;
        totalCostValue += costValue;
        totalPaid += paid;
        totalGramsPurchased += grams;
        totalGramsDelivered += delivered;
        totalGrossProfit += grossProfit;
      }

      // Sort by metal display order
      metalSummaries.sort((a, b) => {
        const metalA = getMetalById(a.metalId);
        const metalB = getMetalById(b.metalId);
        return (metalA?.displayOrder || 0) - (metalB?.displayOrder || 0);
      });

      return {
        ...customer,
        metalSummaries,
        totalPurchaseValue,
        totalCostValue,
        totalPaid,
        totalPending: totalPurchaseValue - totalPaid,
        totalGramsPurchased,
        totalGramsDelivered,
        totalGramsPending: totalGramsPurchased - totalGramsDelivered,
        totalGrossProfit,
      };
    });
  }, [customers, customerPurchases, customerPayments]);

  // Stable getCustomerSummaries that uses the memoized computation
  const getCustomerSummaries = useCallback((metals: Metal[]): CustomerSummary[] => {
    return computeCustomerSummaries(metals);
  }, [computeCustomerSummaries]);

  const getCustomerById = useCallback((id: string) => customers.find((c) => c.id === id), [customers]);

  const getCustomerPurchases = useCallback((customerId: string, metalId?: string) =>
    customerPurchases
      .filter((p) => p.customerId === customerId && (!metalId || p.metalId === metalId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [customerPurchases]);

  const getCustomerPayments = useCallback((customerId: string) =>
    customerPayments
      .filter((p) => p.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [customerPayments]);

  // Aggregate functions with stable references
  const getTotalPendingAmount = useCallback((metals: Metal[]) => {
    const summaries = computeCustomerSummaries(metals);
    return summaries.reduce((sum, s) => sum + s.totalPending, 0);
  }, [computeCustomerSummaries]);

  const getTotalPendingDelivery = useCallback((metals: Metal[]) => {
    const summaries = computeCustomerSummaries(metals);
    return summaries.reduce((sum, s) => sum + s.totalGramsPending, 0);
  }, [computeCustomerSummaries]);

  const getTotalPendingDeliveryByMetal = useCallback((metals: Metal[]): Map<string, number> => {
    const summaries = computeCustomerSummaries(metals);
    const metalTotals = new Map<string, number>();

    for (const summary of summaries) {
      for (const ms of summary.metalSummaries) {
        const current = metalTotals.get(ms.metalId) || 0;
        metalTotals.set(ms.metalId, current + ms.pendingGrams);
      }
    }

    return metalTotals;
  }, [computeCustomerSummaries]);

  return {
    customers,
    customerPurchases,
    customerPayments,
    deliveryRecords,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addCustomerPurchase,
    updateCustomerPurchase,
    deleteCustomerPurchase,
    addCustomerPayment,
    updateCustomerPayment,
    deleteCustomerPayment,
    addDelivery,
    getDeliveryHistory,
    getCustomerSummaries,
    getCustomerById,
    getCustomerPurchases,
    getCustomerPayments,
    getTotalPendingAmount,
    getTotalPendingDelivery,
    getTotalPendingDeliveryByMetal,
  };
};
