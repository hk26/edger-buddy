import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useVepariData } from '@/hooks/useVepariData';
import { AddCustomerPurchaseDialog } from '@/components/AddCustomerPurchaseDialog';
import { AddCustomerPaymentDialog } from '@/components/AddCustomerPaymentDialog';
import { EditCustomerDialog } from '@/components/EditCustomerDialog';
import { EditCustomerPurchaseDialog } from '@/components/EditCustomerPurchaseDialog';
import { EditCustomerPaymentDialog } from '@/components/EditCustomerPaymentDialog';
import { RecordDeliveryDialog } from '@/components/RecordDeliveryDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trash2, Calendar, Package, Wallet, ShoppingBag, Truck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
import { CustomerPurchase, CustomerPayment, Metal } from '@/types';
import { MetalBadge, getMetalColorClasses } from '@/components/MetalSelector';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMetals, getMetalById } = useVepariData();
  const {
    getCustomerById,
    getCustomerPurchases,
    getCustomerPayments,
    getCustomerSummaries,
    getDeliveryHistory,
    updateCustomer,
    addCustomerPurchase,
    updateCustomerPurchase,
    deleteCustomerPurchase,
    addCustomerPayment,
    updateCustomerPayment,
    deleteCustomerPayment,
    addDelivery,
    deleteCustomer,
  } = useCustomerData();

  const [selectedMetalId, setSelectedMetalId] = useState<string>('all');

  const customer = getCustomerById(id!);
  const metals = getMetals();
  const allPurchases = getCustomerPurchases(id!);
  const allPayments = getCustomerPayments(id!);

  const customerSummary = getCustomerSummaries(metals).find((s) => s.id === id);
  const availableMetals = customerSummary?.metalSummaries.map((ms) => getMetalById(ms.metalId)).filter(Boolean) as Metal[] || [];

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Customer not found</h1>
          <Button variant="outline" onClick={() => navigate('/customers')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const purchases = selectedMetalId === 'all' ? allPurchases : allPurchases.filter((p) => p.metalId === selectedMetalId);
  const payments = allPayments;

  const metalSummary = selectedMetalId !== 'all' ? customerSummary?.metalSummaries.find((ms) => ms.metalId === selectedMetalId) : null;

  const totalValue = selectedMetalId === 'all' ? customerSummary?.totalPurchaseValue || 0 : metalSummary?.totalSaleValue || 0;
  const totalPaid = selectedMetalId === 'all' ? customerSummary?.totalPaid || 0 : metalSummary?.totalPaid || 0;
  const totalPending = totalValue - totalPaid;
  const totalGrams = selectedMetalId === 'all' ? customerSummary?.totalGramsPurchased || 0 : metalSummary?.totalGrams || 0;
  const deliveredGrams = selectedMetalId === 'all' ? customerSummary?.totalGramsDelivered || 0 : metalSummary?.deliveredGrams || 0;
  const pendingGrams = totalGrams - deliveredGrams;

  const handleDelete = () => {
    deleteCustomer(id!);
    navigate('/customers');
  };

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
              <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-2xl font-bold">{customer.name}</h1>
                {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <EditCustomerDialog customer={customer} onUpdate={updateCustomer} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-border/50 bg-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {customer.name} and all their transactions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive">
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
            <TabsTrigger value="all">All Metals</TabsTrigger>
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
          <div className="py-6 grid gap-4 md:grid-cols-4">
            <Card className="border-border/50 bg-card">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Value</p>
                <p className="number-display text-2xl font-bold">₹{totalValue.toLocaleString('en-IN')}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Paid</p>
                <p className="number-display text-2xl font-bold text-emerald-500">₹{totalPaid.toLocaleString('en-IN')}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30 bg-card">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Receivable</p>
                <p className={`number-display text-2xl font-bold ${totalPending > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  ₹{totalPending.toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30 bg-card">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending Delivery</p>
                <p className="number-display text-2xl font-bold text-blue-500">{pendingGrams.toFixed(4)}g</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <AddCustomerPurchaseDialog
              customerId={id!}
              metals={metals}
              defaultMetalId={selectedMetalId !== 'all' ? selectedMetalId : undefined}
              onAdd={addCustomerPurchase}
            />
            <AddCustomerPaymentDialog customerId={id!} onAdd={addCustomerPayment} />
          </div>

          {/* Transaction History */}
          <div className="py-8">
            <div className="mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" />
              <h2 className="font-display text-xl font-semibold">Transaction History</h2>
            </div>

            {allTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 text-center">
                <p className="text-muted-foreground">No transactions yet. Add a sale or payment to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allTransactions.map((transaction) => {
                  const isPurchase = transaction.type === 'purchase';
                  const purchase = isPurchase ? (transaction as CustomerPurchase) : null;
                  const payment = !isPurchase ? (transaction as CustomerPayment) : null;
                  const metal = purchase ? getMetalById(purchase.metalId) : null;

                  return (
                    <Card key={transaction.id} className="border-border/50 bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isPurchase ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                              {isPurchase ? <ShoppingBag className="h-5 w-5 text-emerald-500" /> : <Wallet className="h-5 w-5 text-blue-500" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{isPurchase ? 'Sale' : 'Payment'}</p>
                                {metal && <MetalBadge metal={metal} size="sm" />}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(transaction.date), 'dd MMM yyyy')}
                                {purchase?.itemDescription && ` • ${purchase.itemDescription}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {isPurchase && purchase && metal && (
                              <>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Weight</p>
                                  <p className="number-display font-medium">{purchase.weightGrams.toFixed(4)}g</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Delivered</p>
                                  <p className="number-display font-medium text-emerald-500">{(purchase.deliveredGrams || 0).toFixed(4)}g</p>
                                </div>
                                <RecordDeliveryDialog purchase={purchase} metal={metal} onDeliver={addDelivery} />
                                <EditCustomerPurchaseDialog purchase={purchase} metals={metals} onUpdate={updateCustomerPurchase} />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border-border/50 bg-card">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Sale</AlertDialogTitle>
                                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteCustomerPurchase(purchase.id)} className="bg-destructive">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            {!isPurchase && payment && (
                              <>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Amount</p>
                                  <p className="number-display font-medium text-emerald-500">₹{payment.amount.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Mode</p>
                                  <p className="text-sm">{payment.paymentMode || 'Cash'}</p>
                                </div>
                                <EditCustomerPaymentDialog payment={payment} onUpdate={updateCustomerPayment} />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border-border/50 bg-card">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteCustomerPayment(payment.id)} className="bg-destructive">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
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

export default CustomerDetail;
