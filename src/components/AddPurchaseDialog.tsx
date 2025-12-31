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
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingBag, Calendar } from 'lucide-react';
import { Purchase, Vepari } from '@/types';
import { format, addDays, parseISO } from 'date-fns';

interface AddPurchaseDialogProps {
  vepariId: string;
  vepari?: Vepari;
  onAdd: (purchase: Omit<Purchase, 'id'>) => void;
}

export const AddPurchaseDialog = ({ vepariId, vepari, onAdd }: AddPurchaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemDescription, setItemDescription] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [ratePerGram, setRatePerGram] = useState('');
  const [stoneCharges, setStoneCharges] = useState('');
  const [notes, setNotes] = useState('');
  const [trackCredit, setTrackCredit] = useState(false);
  const [creditDays, setCreditDays] = useState('');
  const [penaltyPercent, setPenaltyPercent] = useState('0.1');

  // Pre-fill credit settings from vepari defaults when dialog opens
  useEffect(() => {
    if (open && vepari?.defaultCreditDays) {
      setTrackCredit(true);
      setCreditDays(vepari.defaultCreditDays.toString());
      setPenaltyPercent((vepari.defaultPenaltyPercentPerDay || 0.1).toString());
    }
  }, [open, vepari]);

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
        creditDays: trackCredit && creditDays ? parseInt(creditDays) : undefined,
        penaltyPercentPerDay: trackCredit && creditDays ? parseFloat(penaltyPercent) : undefined,
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
    setTrackCredit(false);
    setCreditDays('');
    setPenaltyPercent('0.1');
  };

  const calculatedDueDate = trackCredit && creditDays && date
    ? format(addDays(parseISO(date), parseInt(creditDays)), 'dd MMM yyyy')
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10">
          <ShoppingBag className="h-4 w-4" />
          Add Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/50 bg-card">
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

          {/* Credit Tracking Section */}
          <div className="border-t border-border/30 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="trackCredit" 
                checked={trackCredit}
                onCheckedChange={(checked) => setTrackCredit(checked === true)}
              />
              <Label htmlFor="trackCredit" className="cursor-pointer text-sm font-medium">
                Track credit for this purchase
              </Label>
            </div>
            
            {trackCredit && (
              <div className="mt-4 space-y-4 rounded-lg bg-secondary/50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditDays">Credit Days *</Label>
                    <Input
                      id="creditDays"
                      type="number"
                      min="1"
                      value={creditDays}
                      onChange={(e) => setCreditDays(e.target.value)}
                      placeholder="e.g., 10"
                      className="border-border/50 bg-background"
                      required={trackCredit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="penaltyPercent">Daily Penalty %</Label>
                    <Input
                      id="penaltyPercent"
                      type="number"
                      step="0.01"
                      min="0"
                      value={penaltyPercent}
                      onChange={(e) => setPenaltyPercent(e.target.value)}
                      placeholder="0.1"
                      className="border-border/50 bg-background"
                    />
                  </div>
                </div>
                {calculatedDueDate && (
                  <div className="flex items-center gap-2 rounded-md bg-primary/10 p-3 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium text-primary">{calculatedDueDate}</span>
                  </div>
                )}
              </div>
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
            <Button type="submit">Add Purchase</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
