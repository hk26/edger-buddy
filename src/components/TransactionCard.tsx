import { memo, useMemo } from 'react';
import { Purchase, Payment, Metal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Wallet,
  Trash2,
  Calendar,
  Gem,
  AlertTriangle,
  Clock,
  CheckCircle,
  Banknote,
  Flame,
  ArrowRightLeft,
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
import { MetalBadge } from '@/components/MetalSelector';
import { EditPurchaseDialog } from '@/components/EditPurchaseDialog';
import { EditPaymentDialog } from '@/components/EditPaymentDialog';
import { PurchaseStatus } from '@/types';

interface TransactionCardProps {
  transaction: (Purchase & { type: 'purchase' }) | (Payment & { type: 'payment' });
  metal: Metal | undefined;
  metals: Metal[];
  remainingGrams: number;
  showMetal: boolean;
  status: PurchaseStatus;
  onUpdatePurchase: (id: string, updates: Partial<Omit<Purchase, 'id' | 'vepariId'>>) => void;
  onUpdatePayment: (id: string, updates: Partial<Omit<Payment, 'id' | 'vepariId'>>) => void;
  onDeletePurchase: (id: string) => void;
  onDeletePayment: (id: string) => void;
  animationDelay?: number;
}

// Memoized status badge component
const StatusBadge = memo(({ purchase, remainingGrams, status }: { 
  purchase: Purchase; 
  remainingGrams: number;
  status: PurchaseStatus;
}) => {
  if (status === 'paid') {
    return (
      <Badge variant="outline" className="border-success/50 bg-success/10 text-success">
        <CheckCircle className="mr-1 h-3 w-3" />
        Paid
      </Badge>
    );
  }
  
  if (status === 'overdue' && purchase.dueDate) {
    const today = startOfDay(new Date());
    const dueDate = startOfDay(parseISO(purchase.dueDate));
    const daysOverdue = differenceInDays(today, dueDate);
    return (
      <Badge variant="outline" className="border-orange-500/50 bg-orange-500/20 text-orange-500">
        <AlertTriangle className="mr-1 h-3 w-3" />
        {daysOverdue}d overdue
      </Badge>
    );
  }
  
  if (status === 'upcoming' && purchase.dueDate) {
    const today = startOfDay(new Date());
    const dueDate = startOfDay(parseISO(purchase.dueDate));
    const daysUntil = differenceInDays(dueDate, today);
    return (
      <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
        <Clock className="mr-1 h-3 w-3" />
        {daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `${daysUntil}d left`}
      </Badge>
    );
  }
  
  if (status === 'normal' && purchase.dueDate) {
    return (
      <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
        <Calendar className="mr-1 h-3 w-3" />
        Due: {format(parseISO(purchase.dueDate), 'dd MMM')}
      </Badge>
    );
  }
  
  return null;
});
StatusBadge.displayName = 'StatusBadge';

// Purchase type badge
const PurchaseTypeBadge = memo(({ purchaseType }: { purchaseType?: string }) => {
  if (purchaseType === 'cash') {
    return (
      <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
        <Banknote className="mr-1 h-3 w-3" />
        Cash
      </Badge>
    );
  }
  if (purchaseType === 'bullion') {
    return (
      <Badge variant="outline" className="border-purple-500/50 bg-purple-500/10 text-purple-500">
        <Flame className="mr-1 h-3 w-3" />
        Bullion
      </Badge>
    );
  }
  return null;
});
PurchaseTypeBadge.displayName = 'PurchaseTypeBadge';

// Payment type badge
const PaymentTypeBadge = memo(({ paymentType }: { paymentType?: string }) => {
  if (paymentType === 'cash') {
    return (
      <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
        <Banknote className="mr-1 h-3 w-3" />
        Cash
      </Badge>
    );
  }
  return null;
});
PaymentTypeBadge.displayName = 'PaymentTypeBadge';

// Regular purchase details
const RegularPurchaseDetails = memo(({ purchase }: { purchase: Purchase }) => (
  <div className="text-right">
    <p className="number-display text-lg font-semibold text-foreground">
      +{(purchase.weightGrams || 0).toFixed(4)}g
    </p>
    {purchase.ratePerGram && (
      <p className="text-sm text-muted-foreground">
        @ ₹{purchase.ratePerGram.toLocaleString('en-IN')}/g
      </p>
    )}
    {(purchase.stoneCharges || 0) > 0 && (
      <p className="mt-1 flex items-center justify-end gap-1 text-sm text-amber-500">
        <Gem className="h-3 w-3" />
        Stone: ₹{purchase.stoneCharges!.toLocaleString('en-IN')}
      </p>
    )}
  </div>
));
RegularPurchaseDetails.displayName = 'RegularPurchaseDetails';

// Cash purchase details
const CashPurchaseDetails = memo(({ purchase }: { purchase: Purchase }) => (
  <div className="space-y-2">
    <div className="text-right">
      <p className="number-display text-lg font-semibold text-blue-500">
        ₹{(purchase.totalAmount || 0).toLocaleString('en-IN')}
      </p>
    </div>
    {(purchase.weightGrams || purchase.ratePerGram || purchase.labourCharges) && (
      <div className="rounded-md bg-blue-500/5 px-3 py-2 text-xs text-muted-foreground">
        {purchase.weightGrams && (
          <p>Weight: {purchase.weightGrams.toFixed(4)}g</p>
        )}
        {purchase.ratePerGram && (
          <p>Rate: ₹{purchase.ratePerGram.toLocaleString('en-IN')}/g</p>
        )}
        {purchase.labourCharges && (
          <p>Labour: ₹{purchase.labourCharges.toLocaleString('en-IN')}</p>
        )}
        {purchase.stoneCharges && (
          <p>Stone: ₹{purchase.stoneCharges.toLocaleString('en-IN')}</p>
        )}
      </div>
    )}
  </div>
));
CashPurchaseDetails.displayName = 'CashPurchaseDetails';

// Bullion purchase details
const BullionPurchaseDetails = memo(({ purchase }: { purchase: Purchase }) => (
  <div className="space-y-2">
    <div className="rounded-md bg-purple-500/10 px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Old Gold Given</p>
          <p className="number-display font-medium text-foreground">
            {(purchase.oldGoldWeight || 0).toFixed(2)}g @ {purchase.oldGoldTouch}%
          </p>
          <p className="text-xs text-muted-foreground">
            Fine: {(purchase.fineGoldCalculated || 0).toFixed(4)}g
          </p>
        </div>
        <ArrowRightLeft className="h-4 w-4 text-purple-500" />
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Fresh Metal</p>
          <p className="number-display font-medium text-foreground">
            {(purchase.freshMetalReceived || 0).toFixed(4)}g
          </p>
        </div>
      </div>
      
      {/* Balance */}
      <div className="mt-2 border-t border-purple-500/20 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Balance:</span>
          <span className={`number-display font-semibold ${
            (purchase.balanceGrams || 0) > 0 ? 'text-orange-500' : 'text-success'
          }`}>
            {(purchase.balanceGrams || 0) > 0 ? '+' : ''}{(purchase.balanceGrams || 0).toFixed(4)}g
            {(purchase.balanceGrams || 0) > 0 ? ' (owed)' : ' (credit)'}
          </span>
        </div>
        
        {/* Labour/Packaging charges */}
        {(purchase.bullionLabourCharges || 0) > 0 && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Labour/Pkg:</span>
            <span className="number-display font-medium text-amber-500">
              ₹{purchase.bullionLabourCharges!.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        
        {/* Cash settlement */}
        {purchase.balanceConvertedToMoney && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Settled:</span>
            <span className="number-display font-medium text-blue-500">
              ₹{(purchase.balanceCashAmount || 0).toLocaleString('en-IN')} @ ₹{purchase.balanceRate}/g
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
));
BullionPurchaseDetails.displayName = 'BullionPurchaseDetails';

// Metal payment details
const MetalPaymentDetails = memo(({ payment }: { payment: Payment }) => (
  <div className="text-right">
    <p className="number-display text-lg font-semibold text-success">
      -{(payment.weightGrams || 0).toFixed(4)}g
    </p>
    {payment.ratePerGram && payment.amount && (
      <p className="text-sm text-muted-foreground">
        ₹{payment.amount.toLocaleString('en-IN')} @ ₹{payment.ratePerGram}/g
      </p>
    )}
    {(payment.stoneChargesPaid || 0) > 0 && (
      <p className="mt-1 flex items-center justify-end gap-1 text-sm text-amber-500">
        <Gem className="h-3 w-3" />
        Stone Paid: ₹{payment.stoneChargesPaid!.toLocaleString('en-IN')}
      </p>
    )}
  </div>
));
MetalPaymentDetails.displayName = 'MetalPaymentDetails';

// Cash payment details
const CashPaymentDetails = memo(({ payment }: { payment: Payment }) => (
  <div className="text-right">
    <p className="number-display text-lg font-semibold text-success">
      ₹{(payment.cashAmount || 0).toLocaleString('en-IN')}
    </p>
    {payment.paymentMode && (
      <p className="text-sm text-muted-foreground">
        via {payment.paymentMode}
      </p>
    )}
  </div>
));
CashPaymentDetails.displayName = 'CashPaymentDetails';

// Main TransactionCard component
export const TransactionCard = memo(({
  transaction,
  metal,
  metals,
  remainingGrams,
  showMetal,
  status,
  onUpdatePurchase,
  onUpdatePayment,
  onDeletePurchase,
  onDeletePayment,
  animationDelay = 0,
}: TransactionCardProps) => {
  const isPurchase = transaction.type === 'purchase';
  const purchase = isPurchase ? (transaction as Purchase) : null;
  const payment = !isPurchase ? (transaction as Payment) : null;
  
  // Memoize border class calculation
  const borderClass = useMemo(() => {
    if (isPurchase && purchase?.dueDate && status === 'overdue') {
      return 'border-orange-500/30';
    }
    if (purchase?.purchaseType === 'cash') {
      return 'border-blue-500/20';
    }
    if (purchase?.purchaseType === 'bullion') {
      return 'border-purple-500/20';
    }
    return '';
  }, [isPurchase, purchase?.dueDate, purchase?.purchaseType, status]);

  // Get icon based on transaction type
  const TransactionIcon = useMemo(() => {
    if (isPurchase) {
      if (purchase?.purchaseType === 'cash') return Banknote;
      if (purchase?.purchaseType === 'bullion') return Flame;
      return ShoppingBag;
    }
    if (payment?.paymentType === 'cash') return Banknote;
    return Wallet;
  }, [isPurchase, purchase?.purchaseType, payment?.paymentType]);

  const iconColorClass = useMemo(() => {
    if (isPurchase) {
      if (purchase?.purchaseType === 'cash') return 'bg-blue-500/10 text-blue-500';
      if (purchase?.purchaseType === 'bullion') return 'bg-purple-500/10 text-purple-500';
      return 'bg-muted text-muted-foreground';
    }
    return 'bg-success/10 text-success';
  }, [isPurchase, purchase?.purchaseType]);

  // Determine transaction label
  const transactionLabel = useMemo(() => {
    if (isPurchase) {
      if (purchase?.purchaseType === 'bullion') return 'Bullion Exchange';
      return purchase?.itemDescription || (purchase?.purchaseType === 'cash' ? 'Cash Purchase' : 'Purchase');
    }
    return payment?.paymentType === 'cash' ? 'Cash Payment' : 'Payment';
  }, [isPurchase, purchase, payment]);

  return (
    <Card
      className={`animate-fade-in border-border/50 bg-card ${borderClass}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Icon and basic info */}
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconColorClass}`}>
              <TransactionIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {metal && showMetal && (
                  <MetalBadge metal={metal} size="sm" />
                )}
                <p className="font-medium text-foreground">
                  {transactionLabel}
                </p>
                {isPurchase && purchase && (
                  <>
                    <PurchaseTypeBadge purchaseType={purchase.purchaseType} />
                    {purchase.purchaseType === 'regular' && (
                      <StatusBadge purchase={purchase} remainingGrams={remainingGrams} status={status} />
                    )}
                  </>
                )}
                {!isPurchase && payment && (
                  <PaymentTypeBadge paymentType={payment.paymentType} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(transaction.date), 'dd MMM yyyy')}
              </p>
              
              {/* Description and notes */}
              {isPurchase && purchase?.purchaseType !== 'bullion' && purchase?.itemDescription && purchase.purchaseType === 'cash' && (
                <p className="mt-1 text-sm text-foreground">{purchase.itemDescription}</p>
              )}
              {transaction.notes && (
                <p className="mt-1 text-xs italic text-muted-foreground">{transaction.notes}</p>
              )}
            </div>
          </div>

          {/* Right side - Details and actions */}
          <div className="flex items-start gap-2">
            {/* Transaction details based on type */}
            {isPurchase && purchase && (
              purchase.purchaseType === 'bullion' ? (
                <BullionPurchaseDetails purchase={purchase} />
              ) : purchase.purchaseType === 'cash' ? (
                <CashPurchaseDetails purchase={purchase} />
              ) : (
                <RegularPurchaseDetails purchase={purchase} />
              )
            )}
            
            {!isPurchase && payment && (
              payment.paymentType === 'cash' ? (
                <CashPaymentDetails payment={payment} />
              ) : (
                <MetalPaymentDetails payment={payment} />
              )
            )}

            {/* Edit & Delete buttons */}
            <div className="flex items-center">
              {isPurchase && purchase ? (
                <EditPurchaseDialog
                  purchase={purchase}
                  metals={metals}
                  onUpdate={onUpdatePurchase}
                />
              ) : payment ? (
                <EditPaymentDialog
                  payment={payment}
                  metals={metals}
                  onUpdate={onUpdatePayment}
                />
              ) : null}
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
                      Delete {isPurchase ? 'Purchase' : 'Payment'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this {isPurchase ? 'purchase' : 'payment'}. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        isPurchase
                          ? onDeletePurchase(transaction.id)
                          : onDeletePayment(transaction.id)
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
        </div>
      </CardContent>
    </Card>
  );
});

TransactionCard.displayName = 'TransactionCard';
