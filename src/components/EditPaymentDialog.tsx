import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Scale, Banknote } from 'lucide-react';
import { Payment, Metal, PaymentType } from '@/types';
import { MetalSelector } from './MetalSelector';

interface EditPaymentDialogProps {
  payment: Payment;
  metals: Metal[];
  onUpdate: (id: string, updates: Partial<Omit<Payment, 'id' | 'vepariId'>>) => void;
}

const paymentTypes: { value: PaymentType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'metal', label: 'Metal', icon: <Scale className="h-4 w-4" />, description: 'Pay in gold/silver' },
  { value: 'cash', label: 'Cash', icon: <Banknote className="h-4 w-4" />, description: 'Pay in ₹' },
];

export const EditPaymentDialog = ({ payment, metals, onUpdate }: EditPaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>(payment.paymentType || 'metal');
  const [metalId, setMetalId] = useState(payment.metalId);
  const [date, setDate] = useState(payment.date);
  
  // Metal payment fields
  const [weightGrams, setWeightGrams] = useState(payment.weightGrams?.toString() || '');
  const [ratePerGram, setRatePerGram] = useState(payment.ratePerGram?.toString() || '');
  const [stoneChargesPaid, setStoneChargesPaid] = useState(payment.stoneChargesPaid?.toString() || '');
  
  // Cash payment fields
  const [cashAmount, setCashAmount] = useState(payment.cashAmount?.toString() || '');
  const [paymentMode, setPaymentMode] = useState(payment.paymentMode || '');
  
  const [notes, setNotes] = useState(payment.notes || '');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentType(payment.paymentType || 'metal');
      setMetalId(payment.metalId);
      setDate(payment.date);
      setWeightGrams(payment.weightGrams?.toString() || '');
      setRatePerGram(payment.ratePerGram?.toString() || '');
      setStoneChargesPaid(payment.stoneChargesPaid?.toString() || '');
      setCashAmount(payment.cashAmount?.toString() || '');
      setPaymentMode(payment.paymentMode || '');
      setNotes(payment.notes || '');
    }
  }, [open, payment]);

  const goldAmount = weightGrams && ratePerGram
    ? parseFloat(weightGrams) * parseFloat(ratePerGram)
    : 0;

  const totalMetalAmount = goldAmount + (stoneChargesPaid ? parseFloat(stoneChargesPaid) : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentType === 'metal') {
      if (!weightGrams || !ratePerGram || !metalId) return;
      onUpdate(payment.id, {
        metalId,
        date,
        paymentType: 'metal',
        weightGrams: parseFloat(weightGrams),
        ratePerGram: parseFloat(ratePerGram),
        amount: goldAmount,
        stoneChargesPaid: stoneChargesPaid ? parseFloat(stoneChargesPaid) : undefined,
        notes: notes.trim() || undefined,
        // Clear cash fields
        cashAmount: undefined,
        paymentMode: undefined,
      });
    } else {
      if (!cashAmount) return;
      onUpdate(payment.id, {
        metalId,
        date,
        paymentType: 'cash',
        cashAmount: parseFloat(cashAmount),
        paymentMode: paymentMode.trim() || undefined,
        notes: notes.trim() || undefined,
        // Clear metal fields
        weightGrams: undefined,
        ratePerGram: undefined,
        amount: undefined,
        stoneChargesPaid: undefined,
      });
    }
    
    setOpen(false);
  };

  const selectedMetal = metals.find((m) => m.id === metalId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Payment
            {selectedMetal && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium bg-${selectedMetal.color}-500/10 text-${selectedMetal.color}-500`}>
                {selectedMetal.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Payment Type Selector */}
          <div className="space-y-2">
            <Label>Payment Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {paymentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPaymentType(type.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-all ${
                    paymentType === type.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 bg-secondary hover:border-primary/30'
                  }`}
                >
                  {type.icon}
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-[10px] text-muted-foreground">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metal Selector */}
          <MetalSelector
            metals={metals}
            value={metalId}
            onChange={setMetalId}
            label="Metal *"
          />

          <div className="space-y-2">
            <Label htmlFor="edit-payment-date">Payment Date *</Label>
            <Input
              id="edit-payment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border/50 bg-secondary"
              required
            />
          </div>

          {/* Metal Payment Form */}
          {paymentType === 'metal' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-payment-weight">Weight Paid (grams) *</Label>
                  <Input
                    id="edit-payment-weight"
                    type="number"
                    step="0.0001"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    placeholder="20.00"
                    className="border-border/50 bg-secondary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-payment-rate">Rate per Gram *</Label>
                  <Input
                    id="edit-payment-rate"
                    type="number"
                    step="0.01"
                    value={ratePerGram}
                    onChange={(e) => setRatePerGram(e.target.value)}
                    placeholder="7500.00"
                    className="border-border/50 bg-secondary"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-payment-stoneChargesPaid">Stone Charges Paid ₹ (Optional)</Label>
                <Input
                  id="edit-payment-stoneChargesPaid"
                  type="number"
                  step="0.01"
                  min="0"
                  value={stoneChargesPaid}
                  onChange={(e) => setStoneChargesPaid(e.target.value)}
                  placeholder="Stone charges being paid"
                  className="border-border/50 bg-secondary"
                />
              </div>
              <div className="rounded-lg bg-primary/10 p-4 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">{selectedMetal?.name || 'Metal'} Amount</p>
                  <p className="number-display text-xl font-bold text-primary">
                    ₹{goldAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                {stoneChargesPaid && parseFloat(stoneChargesPaid) > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">+ Stone Charges</p>
                      <p className="number-display text-lg font-semibold text-amber-500">
                        ₹{parseFloat(stoneChargesPaid).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="border-t border-border/50 pt-2">
                      <p className="text-sm text-muted-foreground">Total Payment</p>
                      <p className="number-display text-2xl font-bold text-primary">
                        ₹{totalMetalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Cash Payment Form */}
          {paymentType === 'cash' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-cashAmount">Amount ₹ *</Label>
                <Input
                  id="edit-cashAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="50000"
                  className="border-border/50 bg-secondary text-lg font-semibold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentMode">Payment Mode (Optional)</Label>
                <Input
                  id="edit-paymentMode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  placeholder="e.g., Cash, UPI, Bank Transfer"
                  className="border-border/50 bg-secondary"
                />
              </div>
              {cashAmount && (
                <div className="rounded-lg bg-blue-500/10 p-4">
                  <p className="text-sm text-muted-foreground">Cash Payment</p>
                  <p className="number-display text-2xl font-bold text-blue-500">
                    ₹{parseFloat(cashAmount).toLocaleString('en-IN')}
                  </p>
                  {paymentMode && (
                    <p className="mt-1 text-sm text-muted-foreground">via {paymentMode}</p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-payment-notes">Notes (Optional)</Label>
            <Textarea
              id="edit-payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="border-border/50 bg-secondary"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
