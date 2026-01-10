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
import { Pencil } from 'lucide-react';
import { Payment, Metal } from '@/types';
import { MetalSelector } from './MetalSelector';

interface EditPaymentDialogProps {
  payment: Payment;
  metals: Metal[];
  onUpdate: (id: string, updates: Partial<Omit<Payment, 'id' | 'vepariId'>>) => void;
}

export const EditPaymentDialog = ({ payment, metals, onUpdate }: EditPaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [metalId, setMetalId] = useState(payment.metalId);
  const [date, setDate] = useState(payment.date);
  const [weightGrams, setWeightGrams] = useState(payment.weightGrams.toString());
  const [ratePerGram, setRatePerGram] = useState(payment.ratePerGram.toString());
  const [stoneChargesPaid, setStoneChargesPaid] = useState(
    payment.stoneChargesPaid?.toString() || ''
  );
  const [notes, setNotes] = useState(payment.notes || '');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setMetalId(payment.metalId);
      setDate(payment.date);
      setWeightGrams(payment.weightGrams.toString());
      setRatePerGram(payment.ratePerGram.toString());
      setStoneChargesPaid(payment.stoneChargesPaid?.toString() || '');
      setNotes(payment.notes || '');
    }
  }, [open, payment]);

  const goldAmount = weightGrams && ratePerGram
    ? parseFloat(weightGrams) * parseFloat(ratePerGram)
    : 0;

  const totalAmount = goldAmount + (stoneChargesPaid ? parseFloat(stoneChargesPaid) : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightGrams && ratePerGram && metalId) {
      onUpdate(payment.id, {
        metalId,
        date,
        weightGrams: parseFloat(weightGrams),
        ratePerGram: parseFloat(ratePerGram),
        amount: goldAmount,
        stoneChargesPaid: stoneChargesPaid ? parseFloat(stoneChargesPaid) : undefined,
        notes: notes.trim() || undefined,
      });
      setOpen(false);
    }
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
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </>
            )}
          </div>
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
