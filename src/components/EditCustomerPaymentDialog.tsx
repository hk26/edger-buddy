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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Wallet } from 'lucide-react';
import { CustomerPayment } from '@/types';

interface EditCustomerPaymentDialogProps {
  payment: CustomerPayment;
  onUpdate: (id: string, updates: Partial<Omit<CustomerPayment, 'id' | 'customerId'>>) => void;
}

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other'];

export const EditCustomerPaymentDialog = ({
  payment,
  onUpdate,
}: EditCustomerPaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(payment.date);
  const [amount, setAmount] = useState(payment.amount.toString());
  const [paymentMode, setPaymentMode] = useState(payment.paymentMode || 'Cash');
  const [notes, setNotes] = useState(payment.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount) {
      onUpdate(payment.id, {
        date,
        amount: parseFloat(amount),
        paymentMode,
        notes: notes.trim() || undefined,
      });
      setOpen(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setDate(payment.date);
      setAmount(payment.amount.toString());
      setPaymentMode(payment.paymentMode || 'Cash');
      setNotes(payment.notes || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-500/10">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Wallet className="h-5 w-5 text-emerald-500" />
            Edit Payment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-border/50 bg-secondary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (₹) *</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="border-border/50 bg-secondary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-mode">Payment Mode</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger className="border-border/50 bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (Optional)</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="border-border/50 bg-secondary"
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
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
