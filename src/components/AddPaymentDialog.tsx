import { useState } from 'react';
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
import { Wallet } from 'lucide-react';
import { Payment } from '@/types';

interface AddPaymentDialogProps {
  vepariId: string;
  onAdd: (payment: Omit<Payment, 'id'>) => void;
}

export const AddPaymentDialog = ({ vepariId, onAdd }: AddPaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightGrams, setWeightGrams] = useState('');
  const [ratePerGram, setRatePerGram] = useState('');
  const [stoneChargesPaid, setStoneChargesPaid] = useState('');
  const [notes, setNotes] = useState('');

  const goldAmount = weightGrams && ratePerGram
    ? parseFloat(weightGrams) * parseFloat(ratePerGram)
    : 0;

  const totalAmount = goldAmount + (stoneChargesPaid ? parseFloat(stoneChargesPaid) : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightGrams && ratePerGram) {
      onAdd({
        vepariId,
        date,
        weightGrams: parseFloat(weightGrams),
        ratePerGram: parseFloat(ratePerGram),
        amount: goldAmount,
        stoneChargesPaid: stoneChargesPaid ? parseFloat(stoneChargesPaid) : undefined,
        notes: notes.trim() || undefined,
      });
      resetForm();
      setOpen(false);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setWeightGrams('');
    setRatePerGram('');
    setStoneChargesPaid('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Wallet className="h-4 w-4" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Wallet className="h-5 w-5 text-primary" />
            Record Payment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Payment Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border/50 bg-secondary"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight Paid (grams) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="20.00"
                className="border-border/50 bg-secondary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate per Gram *</Label>
              <Input
                id="rate"
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
            <Label htmlFor="stoneChargesPaid">Stone Charges Paid ₹ (Optional)</Label>
            <Input
              id="stoneChargesPaid"
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
              <p className="text-sm text-muted-foreground">Gold Amount</p>
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
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
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
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
