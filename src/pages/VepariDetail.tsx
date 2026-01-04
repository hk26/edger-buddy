import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVepariData } from '@/hooks/useVepariData';
import { AddPurchaseDialog } from '@/components/AddPurchaseDialog';
import { AddPaymentDialog } from '@/components/AddPaymentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Scale,
  ShoppingBag,
  Wallet,
  Trash2,
  Calendar,
  Gem,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';
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
import { Purchase, Metal } from '@/types';
import { MetalBadge, getMetalColorClasses } from '@/components/MetalSelector';

const VepariDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getVepariById,
    getVepariPurchases,
    getVepariPayments,
    getMetals,
    getMetalById,
    addPurchase,
    addPayment,
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
  
  // Get vepari summary for metal-specific data
  const vepariSummary = getVepariSummaries().find(s => s.id === id);
  const availableMetals = vepariSummary?.metalSummaries.map(ms => getMetalById(ms.metalId)).filter(Boolean) as Metal[] || [];

  if (!vepari) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Vepari not found
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Filter purchases and payments by selected metal
  const purchases = selectedMetalId === 'all' 
    ? allPurchases 
    : allPurchases.filter(p => p.metalId === selectedMetalId);
  const payments = selectedMetalId === 'all'
    ? allPayments
    : allPayments.filter(p => p.metalId === selectedMetalId);
  
  const remainingMap = getPurchaseRemainingGrams(id!, selectedMetalId === 'all' ? undefined : selectedMetalId);

  // Get current metal summary
  const currentMetalSummary = selectedMetalId === 'all' 
    ? vepariSummary 
    : vepariSummary?.metalSummaries.find(ms => ms.metalId === selectedMetalId);

  const totalPurchased = selectedMetalId === 'all' 
    ? vepariSummary?.totalPurchased || 0
    : currentMetalSummary?.totalPurchased || 0;
  const totalPaid = selectedMetalId === 'all'
    ? vepariSummary?.totalPaid || 0
    : currentMetalSummary?.totalPaid || 0;
  const remaining = totalPurchased - totalPaid;

  const totalStoneCharges = selectedMetalId === 'all'
    ? vepariSummary?.totalStoneCharges || 0
    : currentMetalSummary?.totalStoneCharges || 0;
  const totalStoneChargesPaid = selectedMetalId === 'all'
    ? vepariSummary?.totalStoneChargesPaid || 0
    : currentMetalSummary?.totalStoneChargesPaid || 0;
  const remainingStoneCharges = totalStoneCharges - totalStoneChargesPaid;

  const handleDeleteVepari = () => {
    deleteVepari(id!);
    navigate('/');
  };

  const getPurchaseStatusBadge = (purchase: Purchase) => {
    const remainingGrams = remainingMap.get(purchase.id) || 0;
    const status = getPurchaseStatus(purchase, remainingGrams);
    
    switch (status) {
      case 'paid':
        return (
          <Badge variant="outline" className="border-success/50 bg-success/10 text-success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        );
      case 'overdue':
        const today = startOfDay(new Date());
        const dueDate = startOfDay(parseISO(purchase.dueDate!));
        const daysOverdue = differenceInDays(today, dueDate);
        return (
          <Badge variant="outline" className="border-orange-500/50 bg-orange-500/20 text-orange-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {daysOverdue}d overdue
          </Badge>
        );
      case 'upcoming':
        const todayUp = startOfDay(new Date());
        const dueDateUp = startOfDay(parseISO(purchase.dueDate!));
        const daysUntil = differenceInDays(dueDateUp, todayUp);
        return (
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
            <Clock className="mr-1 h-3 w-3" />
            {daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `${daysUntil}d left`}
          </Badge>
        );
      case 'normal':
        if (purchase.dueDate) {
          return (
            <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              Due: {format(parseISO(purchase.dueDate), 'dd MMM')}
            </Badge>
          );
        }
        return null;
      default:
        return null;
    }
  };

  // Combine and sort all transactions by date
  const allTransactions = [
    ...purchases.map((p) => ({ ...p, type: 'purchase' as const })),
    ...payments.map((p) => ({ ...p, type: 'payment' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedMetal = selectedMetalId !== 'all' ? getMetalById(selectedMetalId) : null;
  const selectedColors = selectedMetal ? getMetalColorClasses(selectedMetal.color) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {vepari.name}
                </h1>
                {vepari.phone && (
                  <p className="text-sm text-muted-foreground">{vepari.phone}</p>
                )}
                {vepari.defaultCreditDays && (
                  <p className="text-xs text-muted-foreground">
                    Default: {vepari.defaultCreditDays} days credit @ {vepari.defaultPenaltyPercentPerDay}%/day
                  </p>
                )}
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border/50 bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Vepari</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {vepari.name} and all their
                    transactions. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteVepari}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Metal Tabs */}
      <div className="container mx-auto px-4 pt-6">
        <Tabs value={selectedMetalId} onValueChange={setSelectedMetalId}>
          <TabsList className="w-full justify-start bg-card/50">
            <TabsTrigger value="all" className="gap-2">
              All Metals
            </TabsTrigger>
            {availableMetals.map((metal) => {
              const colors = getMetalColorClasses(metal.color);
              return (
                <TabsTrigger 
                  key={metal.id} 
                  value={metal.id}
                  className="gap-2"
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                    {metal.symbol}
                  </span>
                  {metal.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Summary Cards */}
          <div className="py-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/50 bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Total Purchased
                      </p>
                      <p className="number-display text-2xl font-bold text-foreground">
                        {totalPurchased.toFixed(2)}
                        <span className="ml-1 text-sm text-muted-foreground">g</span>
                      </p>
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
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Total Paid
                      </p>
                      <p className="number-display text-2xl font-bold text-success">
                        {totalPaid.toFixed(2)}
                        <span className="ml-1 text-sm text-muted-foreground">g</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border-primary/30 bg-card card-glow ${selectedColors ? selectedColors.border : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedColors ? selectedColors.bg : 'bg-primary/10'}`}>
                      {selectedMetal ? (
                        <span className={`text-sm font-bold ${selectedColors?.text}`}>{selectedMetal.symbol}</span>
                      ) : (
                        <Scale className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Remaining
                      </p>
                      <p className={`number-display text-2xl font-bold ${selectedColors ? selectedColors.text : 'text-primary'}`}>
                        {remaining.toFixed(2)}
                        <span className="ml-1 text-sm text-muted-foreground">g</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stone Charges Summary */}
            {totalStoneCharges > 0 && (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                        <Gem className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Total Stone Charges
                        </p>
                        <p className="number-display text-lg font-bold text-foreground">
                          ₹{totalStoneCharges.toLocaleString('en-IN')}
                        </p>
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
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Stone Charges Paid
                        </p>
                        <p className="number-display text-lg font-bold text-success">
                          ₹{totalStoneChargesPaid.toLocaleString('en-IN')}
                        </p>
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
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Stone Charges Remaining
                        </p>
                        <p className="number-display text-lg font-bold text-amber-500">
                          ₹{remainingStoneCharges.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <AddPurchaseDialog 
              vepariId={id!} 
              vepari={vepari} 
              metals={metals}
              defaultMetalId={selectedMetalId !== 'all' ? selectedMetalId : undefined}
              onAdd={addPurchase} 
            />
            <AddPaymentDialog 
              vepariId={id!} 
              metals={metals}
              defaultMetalId={selectedMetalId !== 'all' ? selectedMetalId : undefined}
              onAdd={addPayment} 
            />
          </div>

          {/* Transaction History */}
          <div className="py-8">
            <div className="mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Transaction History
                {selectedMetal && (
                  <span className={`ml-2 text-sm font-normal ${selectedColors?.text}`}>
                    ({selectedMetal.name})
                  </span>
                )}
              </h2>
            </div>

            {allTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 text-center">
                <p className="text-muted-foreground">
                  No transactions yet{selectedMetal ? ` for ${selectedMetal.name}` : ''}. Add a purchase or payment to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allTransactions.map((transaction, index) => {
                  const isPurchase = transaction.type === 'purchase';
                  const purchase = isPurchase ? (transaction as Purchase) : null;
                  const statusBadge = purchase ? getPurchaseStatusBadge(purchase) : null;
                  const metal = getMetalById(transaction.metalId);
                  
                  return (
                    <Card
                      key={transaction.id}
                      className={`animate-fade-in border-border/50 bg-card ${
                        isPurchase && purchase?.dueDate && getPurchaseStatus(purchase, remainingMap.get(purchase.id) || 0) === 'overdue'
                          ? 'border-orange-500/30'
                          : ''
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                transaction.type === 'purchase'
                                  ? 'bg-muted'
                                  : 'bg-success/10'
                              }`}
                            >
                              {transaction.type === 'purchase' ? (
                                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Wallet className="h-5 w-5 text-success" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                {metal && selectedMetalId === 'all' && (
                                  <MetalBadge metal={metal} size="sm" />
                                )}
                                <p className="font-medium text-foreground">
                                  {transaction.type === 'purchase'
                                    ? (transaction as any).itemDescription || 'Purchase'
                                    : 'Payment'}
                                </p>
                                {statusBadge}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(transaction.date), 'dd MMM yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p
                                className={`number-display text-lg font-semibold ${
                                  transaction.type === 'purchase'
                                    ? 'text-foreground'
                                    : 'text-success'
                                }`}
                              >
                                {transaction.type === 'purchase' ? '+' : '-'}
                                {transaction.weightGrams.toFixed(2)}g
                              </p>
                              {transaction.type === 'payment' && (
                                <p className="text-sm text-muted-foreground">
                                  ₹{(transaction as any).amount.toLocaleString('en-IN')} @ ₹
                                  {(transaction as any).ratePerGram}/g
                                </p>
                              )}
                              {transaction.type === 'purchase' && (transaction as any).stoneCharges > 0 && (
                                <p className="mt-1 flex items-center gap-1 text-sm text-amber-500">
                                  <Gem className="h-3 w-3" />
                                  Stone: ₹{(transaction as any).stoneCharges.toLocaleString('en-IN')}
                                </p>
                              )}
                              {transaction.type === 'payment' && (transaction as any).stoneChargesPaid > 0 && (
                                <p className="mt-1 flex items-center gap-1 text-sm text-amber-500">
                                  <Gem className="h-3 w-3" />
                                  Stone Paid: ₹{(transaction as any).stoneChargesPaid.toLocaleString('en-IN')}
                                </p>
                              )}
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border-border/50 bg-card">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete {transaction.type === 'purchase' ? 'Purchase' : 'Payment'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this {transaction.type}. This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      transaction.type === 'purchase'
                                        ? deletePurchase(transaction.id)
                                        : deletePayment(transaction.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
