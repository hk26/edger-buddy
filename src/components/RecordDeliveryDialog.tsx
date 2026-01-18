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
import { Package, Truck } from 'lucide-react';
import { CustomerPurchase, Metal } from '@/types';
import { MetalBadge } from './MetalSelector';

interface RecordDeliveryDialogProps {
  purchase: CustomerPurchase;
  metal: Metal;
  onDeliver: (customerId: string, purchaseId: string, weightGrams: number, date: string, notes?: string) => void;
}

export const RecordDeliveryDialog = ({
  purchase,
  metal,
  onDeliver,
}: RecordDeliveryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightGrams, setWeightGrams] = useState('');
  const [notes, setNotes] = useState('');

  const remainingGrams = purchase.weightGrams - (purchase.deliveredGrams || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(weightGrams);
    if (weight > 0 && weight <= remainingGrams) {
      onDeliver(purchase.customerId, purchase.id, weight, date, notes.trim() || undefined);
      resetForm();
      setOpen(false);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setWeightGrams('');
    setNotes('');
  };

  const deliverAll = () => {
    setWeightGrams(remainingGrams.toString());
  };

  if (remainingGrams <= 0) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-1 text-muted-foreground">
        <Package className="h-4 w-4" />
        Delivered
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
          <Truck className="h-4 w-4" />
          Deliver
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Truck className="h-5 w-5 text-blue-500" />
            Record Delivery
          </DialogTitle>
        </DialogHeader>

        {/* Purchase Info */}
        <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <MetalBadge metal={metal} size="sm" />
            <span className="text-sm font-medium">{purchase.itemDescription || `${metal.name} Purchase`}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-medium">{purchase.weightGrams.toFixed(4)}g</p>
            </div>
            <div>
              <p className="text-muted-foreground">Delivered</p>
              <p className="font-medium text-emerald-500">{(purchase.deliveredGrams || 0).toFixed(4)}g</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-medium text-blue-500">{remainingGrams.toFixed(4)}g</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-date">Delivery Date *</Label>
              <Input
                id="delivery-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-border/50 bg-secondary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-weight">Weight (grams) *</Label>
              <div className="flex gap-2">
                <Input
                  id="delivery-weight"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  max={remainingGrams}
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(e.target.value)}
                  placeholder="0.0000"
                  className="border-border/50 bg-secondary"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={deliverAll}
                  className="whitespace-nowrap"
                >
                  All
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-notes">Notes (Optional)</Label>
            <Textarea
              id="delivery-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery notes..."
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Record Delivery
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
