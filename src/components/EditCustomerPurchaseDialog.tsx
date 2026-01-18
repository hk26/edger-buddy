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
import { Pencil, ShoppingBag } from 'lucide-react';
import { Metal, CustomerPurchase } from '@/types';
import { MetalSelector } from './MetalSelector';

interface EditCustomerPurchaseDialogProps {
  purchase: CustomerPurchase;
  metals: Metal[];
  onUpdate: (id: string, updates: Partial<Omit<CustomerPurchase, 'id' | 'customerId'>>) => void;
}

export const EditCustomerPurchaseDialog = ({
  purchase,
  metals,
  onUpdate,
}: EditCustomerPurchaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [metalId, setMetalId] = useState(purchase.metalId);
  const [date, setDate] = useState(purchase.date);
  const [itemDescription, setItemDescription] = useState(purchase.itemDescription || '');
  const [weightGrams, setWeightGrams] = useState(purchase.weightGrams.toString());
  const [purchaseRatePerGram, setPurchaseRatePerGram] = useState(purchase.purchaseRatePerGram.toString());
  const [saleRatePerGram, setSaleRatePerGram] = useState(purchase.saleRatePerGram.toString());
  const [makingCharges, setMakingCharges] = useState(purchase.makingCharges?.toString() || '');
  const [stoneCharges, setStoneCharges] = useState(purchase.stoneCharges?.toString() || '');
  const [notes, setNotes] = useState(purchase.notes || '');

  const calculateTotal = () => {
    const weight = parseFloat(weightGrams) || 0;
    const saleRate = parseFloat(saleRatePerGram) || 0;
    const making = parseFloat(makingCharges) || 0;
    const stone = parseFloat(stoneCharges) || 0;
    return weight * saleRate + making + stone;
  };

  const calculateProfit = () => {
    const weight = parseFloat(weightGrams) || 0;
    const saleRate = parseFloat(saleRatePerGram) || 0;
    const purchaseRate = parseFloat(purchaseRatePerGram) || 0;
    const making = parseFloat(makingCharges) || 0;
    return (weight * saleRate + making) - (weight * purchaseRate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightGrams && saleRatePerGram && purchaseRatePerGram) {
      onUpdate(purchase.id, {
        metalId,
        date,
        itemDescription: itemDescription.trim() || undefined,
        weightGrams: parseFloat(weightGrams),
        purchaseRatePerGram: parseFloat(purchaseRatePerGram),
        saleRatePerGram: parseFloat(saleRatePerGram),
        makingCharges: makingCharges ? parseFloat(makingCharges) : undefined,
        stoneCharges: stoneCharges ? parseFloat(stoneCharges) : undefined,
        notes: notes.trim() || undefined,
      });
      setOpen(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setMetalId(purchase.metalId);
      setDate(purchase.date);
      setItemDescription(purchase.itemDescription || '');
      setWeightGrams(purchase.weightGrams.toString());
      setPurchaseRatePerGram(purchase.purchaseRatePerGram.toString());
      setSaleRatePerGram(purchase.saleRatePerGram.toString());
      setMakingCharges(purchase.makingCharges?.toString() || '');
      setStoneCharges(purchase.stoneCharges?.toString() || '');
      setNotes(purchase.notes || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-500/10">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/50 bg-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5 text-emerald-500" />
            Edit Sale
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <MetalSelector
            metals={metals}
            value={metalId}
            onChange={setMetalId}
          />

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
              <Label htmlFor="edit-weight">Weight (grams) *</Label>
              <Input
                id="edit-weight"
                type="number"
                step="0.0001"
                min="0"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="0.0000"
                className="border-border/50 bg-secondary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-item">Item Description (Optional)</Label>
            <Input
              id="edit-item"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g., Gold Chain 22K"
              className="border-border/50 bg-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-purchaseRate">Your Cost Rate (₹/g) *</Label>
              <Input
                id="edit-purchaseRate"
                type="number"
                step="0.01"
                min="0"
                value={purchaseRatePerGram}
                onChange={(e) => setPurchaseRatePerGram(e.target.value)}
                placeholder="e.g., 5800"
                className="border-border/50 bg-secondary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-saleRate">Sale Rate (₹/g) *</Label>
              <Input
                id="edit-saleRate"
                type="number"
                step="0.01"
                min="0"
                value={saleRatePerGram}
                onChange={(e) => setSaleRatePerGram(e.target.value)}
                placeholder="e.g., 6000"
                className="border-border/50 bg-secondary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-making">Making Charges (₹)</Label>
              <Input
                id="edit-making"
                type="number"
                step="0.01"
                min="0"
                value={makingCharges}
                onChange={(e) => setMakingCharges(e.target.value)}
                placeholder="0"
                className="border-border/50 bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stone">Stone Charges (₹)</Label>
              <Input
                id="edit-stone"
                type="number"
                step="0.01"
                min="0"
                value={stoneCharges}
                onChange={(e) => setStoneCharges(e.target.value)}
                placeholder="0"
                className="border-border/50 bg-secondary"
              />
            </div>
          </div>

          {/* Summary */}
          {weightGrams && saleRatePerGram && purchaseRatePerGram && (
            <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Sale Value:</span>
                <span className="font-medium text-foreground">
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Profit:</span>
                <span className={`font-medium ${calculateProfit() >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                  ₹{calculateProfit().toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

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
