import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVepariData } from '@/hooks/useVepariData';
import { AddPurchaseDialog } from '@/components/AddPurchaseDialog';
import { AddPaymentDialog } from '@/components/AddPaymentDialog';
import { EditVepariDialog } from '@/components/EditVepariDialog';
import { TransactionCard } from '@/components/TransactionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Scale,
  ShoppingBag,
  Wallet,
  Trash2,
  Calendar,
  Gem,
  Banknote,
  Flame,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Purchase, Payment, Metal, MetalSummary } from '@/types';
import { getMetalColorClasses } from '@/components/MetalSelector';

const VepariDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getVepariById,
    getVepariPurchases,
    getVepariPayments,
    getMetals,
    addPurchase,
    addPayment,
    updateVepari,
    updatePurchase,
    updatePayment,
    deletePurchase,
    deletePayment,
    deleteVepari,
    getPurchaseRemainingGrams,
    getPurchaseStatus,
    getVepariSummaries,
  } = useVepariData();

  const [selectedMetalId, setSelectedMetalId] = useState<string>('all');

  const vepari = getVepariById(id!);
  const metals = getMetals();
  const allPurchases = getVepariPurchases(id!);
  const allPayments = getVepariPayments(id!);
  
  // Create metal lookup map for O(1) access
  const metalMap = useMemo(() => new Map(metals.map(m => [m.id, m])), [metals]);
  
  // Get vepari summary - memoized
  const vepariSummary = useMemo(() => 
    getVepariSummaries().find(s => s.id === id),
    [getVepariSummaries, id]
  );
  
  const availableMetals = useMemo(() => 
    vepariSummary?.metalSummaries
      .map(ms => metalMap.get(ms.metalId))
      .filter((m): m is Metal => Boolean(m)) || [],
    [vepariSummary, metalMap]
  );

  // Memoized delete handler
  const handleDeleteVepari = useCallback(() => {
    deleteVepari(id!);
    navigate('/');
  }, [deleteVepari, id, navigate]);

  // Filter purchases and payments by selected metal
  const purchases = useMemo(() => 
    selectedMetalId === 'all' 
      ? allPurchases 
      : allPurchases.filter(p => p.metalId === selectedMetalId),
    [selectedMetalId, allPurchases]
  );
  
  const payments = useMemo(() => 
    selectedMetalId === 'all'
      ? allPayments
      : allPayments.filter(p => p.metalId === selectedMetalId),
    [selectedMetalId, allPayments]
  );

  // Get current metal summary
  const currentMetalSummary = useMemo((): MetalSummary | undefined => 
    selectedMetalId !== 'all' 
      ? vepariSummary?.metalSummaries.find(ms => ms.metalId === selectedMetalId)
      : undefined,
    [selectedMetalId, vepariSummary]
  );

  // Regular metal tracking
  const { totalPurchased, totalPaid, remaining } = useMemo(() => {
    const purchased = selectedMetalId === 'all' 
      ? vepariSummary?.totalPurchased || 0
      : currentMetalSummary?.totalPurchased || 0;
    const paid = selectedMetalId === 'all'
      ? vepariSummary?.totalPaid || 0
      : currentMetalSummary?.totalPaid || 0;
    return { totalPurchased: purchased, totalPaid: paid, remaining: purchased - paid };
  }, [selectedMetalId, vepariSummary, currentMetalSummary]);

  // Stone charges
  const { totalStoneCharges, totalStoneChargesPaid, remainingStoneCharges } = useMemo(() => {
    const charges = selectedMetalId === 'all'
      ? vepariSummary?.totalStoneCharges || 0
      : currentMetalSummary?.totalStoneCharges || 0;
    const chargesPaid = selectedMetalId === 'all'
      ? vepariSummary?.totalStoneChargesPaid || 0
      : currentMetalSummary?.totalStoneChargesPaid || 0;
    return { totalStoneCharges: charges, totalStoneChargesPaid: chargesPaid, remainingStoneCharges: charges - chargesPaid };
  }, [selectedMetalId, vepariSummary, currentMetalSummary]);

  // Cash tracking - aggregate from metal summaries
  const cashStats = useMemo(() => {
    const summaries = vepariSummary?.metalSummaries || [];
    if (selectedMetalId === 'all') {
      return summaries.reduce((acc, ms) => ({
        purchased: acc.purchased + (ms.totalCashPurchased || 0),
        paid: acc.paid + (ms.totalCashPaid || 0),
        remaining: acc.remaining + (ms.remainingCash || 0),
      }), { purchased: 0, paid: 0, remaining: 0 });
    }
    const ms = summaries.find(s => s.metalId === selectedMetalId);
    return {
      purchased: ms?.totalCashPurchased || 0,
      paid: ms?.totalCashPaid || 0,
      remaining: ms?.remainingCash || 0,
    };
  }, [selectedMetalId, vepariSummary]);

  // Bullion tracking - aggregate from metal summaries
  const bullionStats = useMemo(() => {
    const summaries = vepariSummary?.metalSummaries || [];
    if (selectedMetalId === 'all') {
      return summaries.reduce((acc, ms) => ({
        fineGiven: acc.fineGiven + (ms.totalFineGoldGiven || 0),
        freshReceived: acc.freshReceived + (ms.totalFreshMetalReceived || 0),
        balanceGrams: acc.balanceGrams + (ms.bullionBalanceGrams || 0),
        balanceCash: acc.balanceCash + (ms.bullionBalanceCash || 0),
      }), { fineGiven: 0, freshReceived: 0, balanceGrams: 0, balanceCash: 0 });
    }
    const ms = summaries.find(s => s.metalId === selectedMetalId);
    return {
      fineGiven: ms?.totalFineGoldGiven || 0,
      freshReceived: ms?.totalFreshMetalReceived || 0,
      balanceGrams: ms?.bullionBalanceGrams || 0,
      balanceCash: ms?.bullionBalanceCash || 0,
    };
  }, [selectedMetalId, vepariSummary]);

  // Combine and sort all transactions by date
  const allTransactions = useMemo(() => 
    [
      ...purchases.map((p) => ({ ...p, type: 'purchase' as const })),
      ...payments.map((p) => ({ ...p, type: 'payment' as const })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [purchases, payments]
  );

  const selectedMetal = useMemo(() => 
    selectedMetalId !== 'all' ? metalMap.get(selectedMetalId) : null,
    [selectedMetalId, metalMap]
  );
  const selectedColors = useMemo(() => 
    selectedMetal ? getMetalColorClasses(selectedMetal.color) : null,
    [selectedMetal]
  );
  
  const hasCashTransactions = cashStats.purchased > 0;
  const hasBullionTransactions = bullionStats.fineGiven > 0;

  // Memoize remainingMap  
  const remainingMap = useMemo(() => 
    getPurchaseRemainingGrams(id!, selectedMetalId === 'all' ? undefined : selectedMetalId),
    [getPurchaseRemainingGrams, id, selectedMetalId]
  );

  // Early return AFTER all hooks
  if (!vepari) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Vepari not found</h1>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-primary/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">{vepari.name}</h1>
                {vepari.phone && <p className="text-sm text-muted-foreground">{vepari.phone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EditVepariDialog vepari={vepari} onUpdate={updateVepari} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-border/50 bg-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Vepari</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {vepari.name} and all their transactions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteVepari} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Metal Tabs */}
      <div className="container mx-auto px-4 pt-6">
        <Tabs value={selectedMetalId} onValueChange={setSelectedMetalId}>
          <TabsList className="w-full justify-start bg-card/50">
            <TabsTrigger value="all" className="gap-2">All Metals</TabsTrigger>
            {availableMetals.map((metal) => {
              const colors = getMetalColorClasses(metal.color);
              return (
                <TabsTrigger key={metal.id} value={metal.id} className="gap-2">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                    {metal.symbol}
                  </span>
                  {metal.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Summary Cards */}
          <div className="py-6 space-y-4">
            {/* Regular Metal Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/50 bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Purchased</p>
                      <p className="number-display text-2xl font-bold text-foreground">{totalPurchased.toFixed(4)}<span className="ml-1 text-sm text-muted-foreground">g</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                      <Wallet className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Paid</p>
                      <p className="number-display text-2xl font-bold text-success">{totalPaid.toFixed(4)}<span className="ml-1 text-sm text-muted-foreground">g</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border-primary/30 bg-card card-glow ${selectedColors?.border || ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedColors?.bg || 'bg-primary/10'}`}>
                      {selectedMetal ? (
                        <span className={`text-sm font-bold ${selectedColors?.text}`}>{selectedMetal.symbol}</span>
                      ) : (
                        <Scale className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Remaining</p>
                      <p className={`number-display text-2xl font-bold ${selectedColors?.text || 'text-primary'}`}>{remaining.toFixed(4)}<span className="ml-1 text-sm text-muted-foreground">g</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cash Summary */}
            {hasCashTransactions && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-blue-500/20 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                        <Banknote className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Cash Bill Total</p>
                        <p className="number-display text-lg font-bold text-foreground">₹{cashStats.purchased.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                        <Banknote className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Cash Paid</p>
                        <p className="number-display text-lg font-bold text-success">₹{cashStats.paid.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-blue-500/30 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                        <Banknote className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Cash Remaining</p>
                        <p className="number-display text-lg font-bold text-blue-500">₹{cashStats.remaining.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bullion Summary */}
            {hasBullionTransactions && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-purple-500/20 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                        <Flame className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Fine Gold Given</p>
                        <p className="number-display text-lg font-bold text-foreground">{bullionStats.fineGiven.toFixed(4)}g</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                        <Flame className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Fresh Metal Received</p>
                        <p className="number-display text-lg font-bold text-success">{bullionStats.freshReceived.toFixed(4)}g</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-purple-500/30 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                        <Flame className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Bullion Balance</p>
                        <p className={`number-display text-lg font-bold ${bullionStats.balanceGrams > 0 ? 'text-orange-500' : 'text-success'}`}>
                          {bullionStats.balanceGrams > 0 ? '+' : ''}{bullionStats.balanceGrams.toFixed(4)}g
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stone Charges */}
            {totalStoneCharges > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                        <Gem className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Stone Charges</p>
                        <p className="number-display text-lg font-bold text-foreground">₹{totalStoneCharges.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                        <Gem className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Stone Paid</p>
                        <p className="number-display text-lg font-bold text-success">₹{totalStoneChargesPaid.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                        <Gem className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Stone Remaining</p>
                        <p className="number-display text-lg font-bold text-amber-500">₹{remainingStoneCharges.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <AddPurchaseDialog vepariId={id!} vepari={vepari} metals={metals} defaultMetalId={selectedMetalId !== 'all' ? selectedMetalId : undefined} onAdd={addPurchase} />
            <AddPaymentDialog vepariId={id!} metals={metals} defaultMetalId={selectedMetalId !== 'all' ? selectedMetalId : undefined} onAdd={addPayment} />
          </div>

          {/* Transaction History */}
          <div className="py-8">
            <div className="mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Transaction History
                {selectedMetal && <span className={`ml-2 text-sm font-normal ${selectedColors?.text}`}>({selectedMetal.name})</span>}
              </h2>
            </div>

            {allTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 text-center">
                <p className="text-muted-foreground">No transactions yet. Add a purchase or payment to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allTransactions.map((transaction, index) => {
                  const purchase = transaction.type === 'purchase' ? (transaction as Purchase) : null;
                  const remainingGrams = purchase ? (remainingMap.get(purchase.id) || 0) : 0;
                  const status = purchase ? getPurchaseStatus(purchase, remainingGrams) : 'no-credit';
                  
                  return (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      metal={metalMap.get(transaction.metalId)}
                      metals={metals}
                      remainingGrams={remainingGrams}
                      showMetal={selectedMetalId === 'all'}
                      status={status}
                      onUpdatePurchase={updatePurchase}
                      onUpdatePayment={updatePayment}
                      onDeletePurchase={deletePurchase}
                      onDeletePayment={deletePayment}
                      animationDelay={index * 50}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default VepariDetail;
