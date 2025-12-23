import { useParams, useNavigate } from 'react-router-dom';
import { useVepariData } from '@/hooks/useVepariData';
import { AddPurchaseDialog } from '@/components/AddPurchaseDialog';
import { AddPaymentDialog } from '@/components/AddPaymentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Scale,
  ShoppingBag,
  Wallet,
  Trash2,
  Calendar,
  Gem,
} from 'lucide-react';
import { format } from 'date-fns';
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

const VepariDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getVepariById,
    getVepariPurchases,
    getVepariPayments,
    addPurchase,
    addPayment,
    deletePurchase,
    deletePayment,
    deleteVepari,
  } = useVepariData();

  const vepari = getVepariById(id!);
  const purchases = getVepariPurchases(id!);
  const payments = getVepariPayments(id!);

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

  const totalPurchased = purchases.reduce((sum, p) => sum + p.weightGrams, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.weightGrams, 0);
  const remaining = totalPurchased - totalPaid;

  const totalStoneCharges = purchases.reduce((sum, p) => sum + (p.stoneCharges || 0), 0);
  const totalStoneChargesPaid = payments.reduce((sum, p) => sum + (p.stoneChargesPaid || 0), 0);
  const remainingStoneCharges = totalStoneCharges - totalStoneChargesPaid;

  const handleDeleteVepari = () => {
    deleteVepari(id!);
    navigate('/');
  };

  // Combine and sort all transactions by date
  const allTransactions = [
    ...purchases.map((p) => ({ ...p, type: 'purchase' as const })),
    ...payments.map((p) => ({ ...p, type: 'payment' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

      {/* Summary Cards */}
      <div className="container mx-auto px-4 py-6">
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

          <Card className="border-primary/30 bg-card card-glow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Remaining
                  </p>
                  <p className="number-display text-2xl font-bold text-primary">
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
      <div className="container mx-auto px-4">
        <div className="flex gap-3">
          <AddPurchaseDialog vepariId={id!} onAdd={addPurchase} />
          <AddPaymentDialog vepariId={id!} onAdd={addPayment} />
        </div>
      </div>

      {/* Transaction History */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Transaction History
          </h2>
        </div>

        {allTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">
              No transactions yet. Add a purchase or payment to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allTransactions.map((transaction, index) => (
              <Card
                key={transaction.id}
                className="animate-fade-in border-border/50 bg-card"
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
                        <p className="font-medium text-foreground">
                          {transaction.type === 'purchase'
                            ? (transaction as any).itemDescription || 'Purchase'
                            : 'Payment'}
                        </p>
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
                            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this{' '}
                              {transaction.type}? This action cannot be undone.
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
                  {transaction.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {transaction.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VepariDetail;
