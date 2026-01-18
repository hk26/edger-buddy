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
import { Metal, CustomerPurchase } from '@/types';
import { MetalSelector } from './MetalSelector';

interface AddCustomerPurchaseDialogProps {
  customerId: string;
  metals: Metal[];
  defaultMetalId?: string;
  onAdd: (purchase: Omit<CustomerPurchase, 'id' | 'deliveredGrams'>) => void;
}

export const AddCustomerPurchaseDialog = ({
  customerId,
  metals,
  defaultMetalId,
  onAdd,
}: AddCustomerPurchaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [metalId, setMetalId] = useState(defaultMetalId || metals[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemDescription, setItemDescription] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [purchaseRatePerGram, setPurchaseRatePerGram] = useState('');
  const [saleRatePerGram, setSaleRatePerGram] = useState('');
  const [makingCharges, setMakingCharges] = useState('');
  const [stoneCharges, setStoneCharges] = useState('');
  const [notes, setNotes] = useState('');

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
      onAdd({
        customerId,
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
      resetForm();
      setOpen(false);
    }
  };

  const resetForm = () => {
    setMetalId(defaultMetalId || metals[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setItemDescription('');
    setWeightGrams('');
    setPurchaseRatePerGram('');
    setSaleRatePerGram('');
    setMakingCharges('');
    setStoneCharges('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-emerald-500/30 hover:bg-emerald-500/10">
          <Plus className="h-4 w-4" />
          Add Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/50 bg-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5 text-emerald-500" />
            Record New Sale
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
            <Label htmlFor="item">Item Description (Optional)</Label>
            <Input
              id="item"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g., Gold Chain 22K"
              className="border-border/50 bg-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseRate">Your Cost Rate (₹/g) *</Label>
              <Input
                id="purchaseRate"
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
              <Label htmlFor="saleRate">Sale Rate (₹/g) *</Label>
              <Input
                id="saleRate"
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
              <Label htmlFor="making">Making Charges (₹)</Label>
              <Input
                id="making"
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
              <Label htmlFor="stone">Stone Charges (₹)</Label>
              <Input
                id="stone"
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
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
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
              Record Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
