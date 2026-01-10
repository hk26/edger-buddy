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
import { Pencil, Calendar } from 'lucide-react';
import { Purchase, Metal } from '@/types';
import { format, addDays, parseISO } from 'date-fns';
import { MetalSelector } from './MetalSelector';

interface EditPurchaseDialogProps {
  purchase: Purchase;
  metals: Metal[];
  onUpdate: (id: string, updates: Partial<Omit<Purchase, 'id' | 'vepariId'>>) => void;
}

export const EditPurchaseDialog = ({ purchase, metals, onUpdate }: EditPurchaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [metalId, setMetalId] = useState(purchase.metalId);
  const [date, setDate] = useState(purchase.date);
  const [itemDescription, setItemDescription] = useState(purchase.itemDescription || '');
  const [weightGrams, setWeightGrams] = useState(purchase.weightGrams.toString());
  const [ratePerGram, setRatePerGram] = useState(purchase.ratePerGram?.toString() || '');
  const [stoneCharges, setStoneCharges] = useState(purchase.stoneCharges?.toString() || '');
  const [notes, setNotes] = useState(purchase.notes || '');
  const [trackCredit, setTrackCredit] = useState(!!purchase.creditDays);
  const [creditDays, setCreditDays] = useState(purchase.creditDays?.toString() || '');
  const [penaltyPercent, setPenaltyPercent] = useState(
    purchase.penaltyPercentPerDay?.toString() || '0.1'
  );

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setMetalId(purchase.metalId);
      setDate(purchase.date);
      setItemDescription(purchase.itemDescription || '');
      setWeightGrams(purchase.weightGrams.toString());
      setRatePerGram(purchase.ratePerGram?.toString() || '');
      setStoneCharges(purchase.stoneCharges?.toString() || '');
      setNotes(purchase.notes || '');
      setTrackCredit(!!purchase.creditDays);
      setCreditDays(purchase.creditDays?.toString() || '');
      setPenaltyPercent(purchase.penaltyPercentPerDay?.toString() || '0.1');
    }
  }, [open, purchase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightGrams && metalId) {
      onUpdate(purchase.id, {
        metalId,
        date,
        itemDescription: itemDescription.trim() || undefined,
        weightGrams: parseFloat(weightGrams),
        ratePerGram: ratePerGram ? parseFloat(ratePerGram) : undefined,
        stoneCharges: stoneCharges ? parseFloat(stoneCharges) : undefined,
        notes: notes.trim() || undefined,
        creditDays: trackCredit && creditDays ? parseInt(creditDays) : undefined,
        penaltyPercentPerDay: trackCredit && creditDays ? parseFloat(penaltyPercent) : undefined,
      });
      setOpen(false);
    }
  };

  const calculatedDueDate = trackCredit && creditDays && date
    ? format(addDays(parseISO(date), parseInt(creditDays)), 'dd MMM yyyy')
    : null;

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
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Purchase
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-purchase-date">Date *</Label>
              <Input
                id="edit-purchase-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-border/50 bg-secondary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-purchase-weight">Weight (grams) *</Label>
              <Input
                id="edit-purchase-weight"
                type="number"
                step="0.0001"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="100.00"
                className="border-border/50 bg-secondary"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-purchase-item">Item Description (Optional)</Label>
            <Input
              id="edit-purchase-item"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g., Earrings, Necklace, Bangles"
              className="border-border/50 bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-purchase-rate">Rate per Gram (Optional)</Label>
            <Input
              id="edit-purchase-rate"
              type="number"
              step="0.01"
              value={ratePerGram}
              onChange={(e) => setRatePerGram(e.target.value)}
              placeholder="7500.00"
              className="border-border/50 bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-purchase-stoneCharges">Stone Charges ₹ (Optional)</Label>
            <Input
              id="edit-purchase-stoneCharges"
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
                id="edit-trackCredit" 
                checked={trackCredit}
                onCheckedChange={(checked) => setTrackCredit(checked === true)}
              />
              <Label htmlFor="edit-trackCredit" className="cursor-pointer text-sm font-medium">
                Track credit for this purchase
              </Label>
            </div>
            
            {trackCredit && (
              <div className="mt-4 space-y-4 rounded-lg bg-secondary/50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-creditDays">Credit Days *</Label>
                    <Input
                      id="edit-creditDays"
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
                    <Label htmlFor="edit-penaltyPercent">Daily Penalty %</Label>
                    <Input
                      id="edit-penaltyPercent"
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
            <Label htmlFor="edit-purchase-notes">Notes (Optional)</Label>
            <Textarea
              id="edit-purchase-notes"
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
