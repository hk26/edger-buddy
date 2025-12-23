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
import { Plus, ShoppingBag } from 'lucide-react';
import { Purchase } from '@/types';

interface AddPurchaseDialogProps {
  vepariId: string;
  onAdd: (purchase: Omit<Purchase, 'id'>) => void;
}

export const AddPurchaseDialog = ({ vepariId, onAdd }: AddPurchaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemDescription, setItemDescription] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [ratePerGram, setRatePerGram] = useState('');
  const [stoneCharges, setStoneCharges] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightGrams) {
      onAdd({
        vepariId,
        date,
        itemDescription: itemDescription.trim() || undefined,
        weightGrams: parseFloat(weightGrams),
        ratePerGram: ratePerGram ? parseFloat(ratePerGram) : undefined,
        stoneCharges: stoneCharges ? parseFloat(stoneCharges) : undefined,
        notes: notes.trim() || undefined,
      });
      resetForm();
      setOpen(false);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setItemDescription('');
    setWeightGrams('');
    setRatePerGram('');
    setStoneCharges('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10">
          <ShoppingBag className="h-4 w-4" />
          Add Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Add New Purchase
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-border/50 bg-secondary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (grams) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="100.00"
                className="border-border/50 bg-secondary"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="item">Item Description (Optional)</Label>
            <Input
              id="item"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g., Earrings, Necklace, Bangles"
              className="border-border/50 bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Rate per Gram (Optional)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              value={ratePerGram}
              onChange={(e) => setRatePerGram(e.target.value)}
              placeholder="7500.00"
              className="border-border/50 bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stoneCharges">Stone Charges ₹ (Optional)</Label>
            <Input
              id="stoneCharges"
              type="number"
              step="0.01"
              min="0"
              value={stoneCharges}
              onChange={(e) => setStoneCharges(e.target.value)}
              placeholder="Extra charges for stones"
              className="border-border/50 bg-secondary"
            />
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
            <Button type="submit">Add Purchase</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
